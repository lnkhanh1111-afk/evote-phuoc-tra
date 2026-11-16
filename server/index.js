const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const { Server } = require('socket.io');
const cors = require('cors');
const Database = require('./db');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.use(cors());
app.use(express.json());

// Phục vụ frontend đã build tĩnh từ client/dist
const distPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
}

const PORT = process.env.PORT || 5000;

// Bộ đếm thời gian biểu quyết máy chủ
let votingTimerInterval = null;

// Phát thông tin đồng bộ toàn diện tới tất cả clients
function broadcastFullState() {
  const activeSession = Database.getActiveSession();
  if (!activeSession) return;

  const agendas = Database.getAgendas(activeSession.id) || [];
  const delegates = Database.getDelegates(activeSession.id) || [];

  // Xử lý an toàn khi Danh mục Chỉ tiêu trống hoặc chỉ tiêu đã chọn bị xóa
  let currentAgenda = null;
  if (agendas.length > 0) {
    if (activeSession.active_agenda_id) {
      currentAgenda = Database.getAgendaById(activeSession.active_agenda_id);
    }
    if (!currentAgenda) {
      currentAgenda = agendas[0];
      Database.updateSessionState(activeSession.id, { active_agenda_id: currentAgenda.id });
    }
  } else {
    // Trường hợp không có chỉ tiêu nào trong danh mục
    if (activeSession.active_agenda_id) {
      Database.updateSessionState(activeSession.id, { active_agenda_id: null, voting_status: 'idle' });
    }
  }

  // Luôn tính toán kết quả & số lượng đại biểu có mặt/vắng mặt chính xác
  const results = Database.calculateResults(currentAgenda ? currentAgenda.id : null, activeSession.id);

  // Tổng hợp kết quả xuyên suốt tất cả các chỉ tiêu
  const allResults = agendas.map(agenda => {
    return Database.calculateResults(agenda.id, activeSession.id);
  });

  const statePayload = {
    session: activeSession,
    currentAgenda: currentAgenda,
    results: results,
    allResults: allResults,
    agendas: agendas,
    delegates: delegates,
    voting_status: activeSession.voting_status,
    time_remaining: activeSession.voting_time_remaining
  };

  io.emit('state_update', statePayload);
}

// REST API ROUTES
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// Tình trạng cơ sở dữ liệu (Cloud MongoDB Atlas vs File JSON)
app.get('/api/database-status', (req, res) => {
  res.json(Database.getStorageStatus());
});

// 1. Sessions
app.get('/api/session/active', (req, res) => {
  const session = Database.getActiveSession();
  res.json(session);
});

app.put('/api/session/active', (req, res) => {
  const activeSession = Database.getActiveSession();
  if (activeSession) {
    const { name, total_delegates, location, date } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (total_delegates !== undefined) updates.total_delegates = parseInt(total_delegates, 10);
    if (location !== undefined) updates.location = location;
    if (date !== undefined) updates.date = date;
    const updated = Database.updateSessionState(activeSession.id, updates);
    broadcastFullState();
    return res.json(updated);
  }
  res.status(404).json({ error: 'Không tìm thấy kỳ họp hoạt động' });
});

app.get('/api/sessions', (req, res) => {
  res.json(Database.getSessions());
});

app.post('/api/sessions', (req, res) => {
  const newSession = Database.createSession(req.body);
  res.json(newSession);
});

app.put('/api/sessions/:id/activate', (req, res) => {
  const session = Database.setActiveSession(req.params.id);
  broadcastFullState();
  res.json(session);
});

// 2. Delegates
app.get('/api/delegates', (req, res) => {
  const session = Database.getActiveSession();
  const delegates = Database.getDelegates(session ? session.id : null);
  res.json(delegates);
});

app.post('/api/delegates', (req, res) => {
  const session = Database.getActiveSession();
  const delegate = Database.addDelegate({
    ...req.body,
    session_id: session ? session.id : null
  });
  broadcastFullState();
  res.json(delegate);
});

app.put('/api/delegates/:id', (req, res) => {
  const delegate = Database.updateDelegate(req.params.id, req.body);
  broadcastFullState();
  res.json(delegate);
});

app.post('/api/delegates/:id/toggle-present', (req, res) => {
  const delegate = Database.getDelegateById(req.params.id);
  if (delegate) {
    const updated = Database.updateDelegate(req.params.id, { is_present: !delegate.is_present });
    broadcastFullState();
    return res.json(updated);
  }
  res.status(404).json({ error: 'Không tìm thấy đại biểu' });
});

app.delete('/api/delegates/:id', (req, res) => {
  Database.deleteDelegate(req.params.id);
  broadcastFullState();
  res.json({ success: true });
});

// 3. Agendas
app.get('/api/agendas', (req, res) => {
  const session = Database.getActiveSession();
  const agendas = Database.getAgendas(session ? session.id : null);
  res.json(agendas);
});

app.post('/api/agendas', (req, res) => {
  const session = Database.getActiveSession();
  const agenda = Database.createAgenda({
    ...req.body,
    session_id: session ? session.id : null
  });
  broadcastFullState();
  res.json(agenda);
});

app.put('/api/agendas/:id', (req, res) => {
  const updated = Database.updateAgenda(req.params.id, req.body);
  broadcastFullState();
  res.json(updated);
});

app.delete('/api/agendas/:id', (req, res) => {
  Database.deleteAgenda(req.params.id);
  broadcastFullState();
  res.json({ success: true });
});

// 4. Voting Control & Results
app.get('/api/results/:agendaId', (req, res) => {
  const session = Database.getActiveSession();
  const results = Database.calculateResults(req.params.agendaId, session ? session.id : null);
  res.json(results);
});

app.get('/api/all-results', (req, res) => {
  const session = Database.getActiveSession();
  const agendas = Database.getAgendas(session ? session.id : null);
  const all = agendas.map(a => Database.calculateResults(a.id, session ? session.id : null));
  res.json(all);
});

// Reset toàn bộ dữ liệu mẫu (cho việc demo / test)
app.post('/api/reset-all', (req, res) => {
  if (votingTimerInterval) clearInterval(votingTimerInterval);
  Database.resetToDefault();
  broadcastFullState();
  res.json({ success: true, message: 'Đã khôi phục dữ liệu ban đầu!' });
});

// Tải về bản sao lưu dữ liệu toàn diện (Backup JSON)
app.get('/api/backup', (req, res) => {
  const data = Database.getFullData();
  const filename = `evote-phuoc-tra-backup-${new Date().toISOString().slice(0, 10)}.json`;
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(data, null, 2));
});

// Phục hồi dữ liệu từ file sao lưu (Restore JSON)
app.post('/api/restore', (req, res) => {
  try {
    const backupData = req.body;
    Database.restoreFullData(backupData);
    broadcastFullState();
    res.json({ success: true, message: 'Đã khôi phục dữ liệu thành công!' });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Lỗi khôi phục dữ liệu' });
  }
});

// SIMULATOR: Giả lập toàn bộ đại biểu có mặt bỏ phiếu tự động để test
app.post('/api/simulator/auto-vote', (req, res) => {
  const session = Database.getActiveSession();
  if (!session || !session.active_agenda_id) {
    return res.status(400).json({ error: 'Chưa có chỉ tiêu biểu quyết nào được kích hoạt' });
  }

  const delegates = Database.getDelegates(session.id).filter(d => d.is_present);
  // Mô phỏng: 90% tán thành, 5% không tán thành, 5% không ý kiến
  delegates.forEach((d, idx) => {
    let choice = 'agree';
    if (idx === delegates.length - 1) choice = 'neutral';
    else if (idx === delegates.length - 2) choice = 'disagree';
    Database.castVote(session.active_agenda_id, d.id, choice);
  });

  broadcastFullState();
  res.json({ success: true, simulated_count: delegates.length });
});

// Fallback phục vụ Single Page App (SPA)
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/socket.io')) {
    const indexHtml = path.join(distPath, 'index.html');
    if (fs.existsSync(indexHtml)) {
      return res.sendFile(indexHtml);
    }
  }
  next();
});

// SOCKET.IO REALTIME ENGINE
io.on('connection', (socket) => {
  console.log(`[Socket] Kết nối mới: ${socket.id}`);

  // Gửi state ngay lập tức cho client vừa kết nối
  const activeSession = Database.getActiveSession();
  if (activeSession) {
    const currentAgenda = activeSession.active_agenda_id
      ? Database.getAgendaById(activeSession.active_agenda_id)
      : null;
    const results = currentAgenda
      ? Database.calculateResults(currentAgenda.id, activeSession.id)
      : null;
    const agendas = Database.getAgendas(activeSession.id);
    const delegates = Database.getDelegates(activeSession.id);
    const allResults = agendas.map(a => Database.calculateResults(a.id, activeSession.id));

    socket.emit('state_update', {
      session: activeSession,
      currentAgenda,
      results,
      allResults,
      agendas,
      delegates,
      voting_status: activeSession.voting_status,
      time_remaining: activeSession.voting_time_remaining
    });
  }

  // 1. Đại biểu đăng nhập trên Tablet
  socket.on('delegate_login', ({ delegateId }) => {
    const delegate = Database.getDelegateById(delegateId);
    if (delegate) {
      Database.updateDelegate(delegateId, {
        is_online: true,
        is_present: true, // Khi đại biểu cầm máy tính bảng đăng nhập, tự động ghi nhận CÓ MẶT
        socket_id: socket.id
      });
      socket.delegateId = delegateId;
      console.log(`[Tablet] Đại biểu ${delegate.name} (${delegate.seat_number}) đã online & điểm danh có mặt.`);
      broadcastFullState();
    }
  });

  // 2. Đại biểu thực hiện Biểu quyết
  socket.on('submit_vote', ({ delegateId, agendaId, choice }) => {
    const session = Database.getActiveSession();
    if (!session || session.voting_status !== 'voting' || session.active_agenda_id !== agendaId) {
      return socket.emit('vote_error', { message: 'Biểu quyết chưa mở hoặc đã kết thúc!' });
    }

    // Đảm bảo đại biểu đang bỏ phiếu được xác nhận có mặt
    Database.updateDelegate(delegateId, { is_present: true });

    const vote = Database.castVote(agendaId, delegateId, choice);
    socket.emit('vote_success', { vote });
    console.log(`[Vote] Đại biểu ${delegateId} đã chọn ${choice} cho nội dung ${agendaId}`);
    
    // Cập nhật tiến độ realtime cho màn hình LED và admin
    broadcastFullState();
  });

  // 3. Admin: Bắt đầu biểu quyết (Start Voting)
  socket.on('admin_start_voting', ({ agendaId, duration }) => {
    const session = Database.getActiveSession();
    if (!session) return;

    if (votingTimerInterval) clearInterval(votingTimerInterval);

    const votingDuration = duration || 30;
    Database.updateAgenda(agendaId, { status: 'voting' });
    Database.updateSessionState(session.id, {
      active_agenda_id: agendaId,
      voting_status: 'voting',
      voting_duration: votingDuration,
      voting_time_remaining: votingDuration,
      voting_started_at: new Date().toISOString()
    });

    console.log(`[Admin] Bắt đầu biểu quyết chỉ tiêu ${agendaId} trong ${votingDuration}s`);
    broadcastFullState();

    // Khởi động đếm ngược thời gian
    votingTimerInterval = setInterval(() => {
      const currentSession = Database.getActiveSession();
      if (!currentSession || currentSession.voting_status !== 'voting') {
        clearInterval(votingTimerInterval);
        return;
      }

      const remaining = currentSession.voting_time_remaining - 1;
      if (remaining <= 0) {
        clearInterval(votingTimerInterval);
        // Tự động khóa biểu quyết khi hết giờ
        Database.updateSessionState(currentSession.id, {
          voting_status: 'locked',
          voting_time_remaining: 0
        });
        Database.updateAgenda(agendaId, { status: 'locked' });
        console.log(`[Voting] Hết thời gian biểu quyết! Tự động khóa.`);
        broadcastFullState();
      } else {
        Database.updateSessionState(currentSession.id, {
          voting_time_remaining: remaining
        });
        io.emit('timer_tick', { remaining });
      }
    }, 1000);
  });

  // 4. Admin: Khóa / Dừng biểu quyết thủ công
  socket.on('admin_lock_voting', () => {
    if (votingTimerInterval) clearInterval(votingTimerInterval);
    const session = Database.getActiveSession();
    if (!session) return;

    Database.updateSessionState(session.id, {
      voting_status: 'locked',
      voting_time_remaining: 0
    });
    if (session.active_agenda_id) {
      Database.updateAgenda(session.active_agenda_id, { status: 'locked' });
    }
    console.log(`[Admin] Đã khóa biểu quyết.`);
    broadcastFullState();
  });

  // 5. Admin: Gia hạn thêm thời gian (+15s)
  socket.on('admin_extend_time', ({ seconds = 15 }) => {
    const session = Database.getActiveSession();
    if (!session || session.voting_status !== 'voting') return;

    const newTime = session.voting_time_remaining + seconds;
    Database.updateSessionState(session.id, { voting_time_remaining: newTime });
    io.emit('timer_tick', { remaining: newTime });
    broadcastFullState();
  });

  // 6. Admin: Công bố kết quả lên màn hình lớn
  socket.on('admin_publish_results', () => {
    const session = Database.getActiveSession();
    if (!session) return;

    Database.updateSessionState(session.id, {
      voting_status: 'published'
    });
    if (session.active_agenda_id) {
      Database.updateAgenda(session.active_agenda_id, { status: 'published' });
    }
    console.log(`[Admin] Đã công bố kết quả lên màn hình trình chiếu.`);
    broadcastFullState();
  });

  // 7. Admin: Reset biểu quyết lại chỉ tiêu này
  socket.on('admin_reset_agenda', ({ agendaId }) => {
    if (votingTimerInterval) clearInterval(votingTimerInterval);
    const session = Database.getActiveSession();
    if (!session) return;

    Database.resetVotesForAgenda(agendaId);
    Database.updateSessionState(session.id, {
      voting_status: 'idle',
      voting_time_remaining: 30
    });
    console.log(`[Admin] Đã reset phiếu biểu quyết chỉ tiêu ${agendaId}`);
    broadcastFullState();
  });

  // 8. Admin: Chuyển chỉ tiêu đang chọn
  socket.on('admin_select_agenda', ({ agendaId }) => {
    const session = Database.getActiveSession();
    if (!session) return;

    Database.updateSessionState(session.id, {
      active_agenda_id: agendaId,
      voting_status: 'idle'
    });
    broadcastFullState();
  });

  // 9. Admin: Cập nhật thông tin cuộc họp & tổng số đại biểu triệu tập qua Socket
  socket.on('admin_update_session', (sessionData) => {
    const activeSession = Database.getActiveSession();
    if (!activeSession) return;

    const updates = {};
    if (sessionData.name !== undefined) updates.name = String(sessionData.name).trim();
    if (sessionData.total_delegates !== undefined) updates.total_delegates = parseInt(sessionData.total_delegates, 10);
    if (sessionData.location !== undefined) updates.location = String(sessionData.location).trim();
    if (sessionData.date !== undefined) updates.date = String(sessionData.date).trim();

    Database.updateSessionState(activeSession.id, updates);
    console.log(`[Admin Socket] Cập nhật cuộc họp: ${updates.name || activeSession.name}, Tổng ĐB: ${updates.total_delegates || activeSession.total_delegates}`);
    broadcastFullState();
  });

  // Xử lý ngắt kết nối
  socket.on('disconnect', () => {
    if (socket.delegateId) {
      Database.updateDelegate(socket.delegateId, { is_online: false, socket_id: null });
      console.log(`[Socket] Đại biểu ${socket.delegateId} ngắt kết nối.`);
      broadcastFullState();
    }
  });
});

server.listen(PORT, '0.0.0.0', async () => {
  console.log(`======================================================`);
  console.log(`  HỆ THỐNG BIỂU QUYẾT ĐIỆN TỬ HĐND PHƯỚC TRÀ`);
  console.log(`  Server đang chạy tại: http://localhost:${PORT}`);
  console.log(`  Chấp nhận kết nối mạng LAN từ máy tính bảng`);
  console.log(`======================================================`);

  // Tự động kết nối Cloud Database (TiDB Cloud MySQL, PostgreSQL Neon/Supabase hoặc MongoDB Atlas)
  try {
    let connected = false;
    if (process.env.TIDB_URL || process.env.TIDB_HOST || (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('mysql'))) {
      connected = await Database.initMysql();
    }
    if (!connected && process.env.DATABASE_URL && !process.env.DATABASE_URL.startsWith('mysql')) {
      connected = await Database.initPg();
    }
    if (!connected && process.env.MONGODB_URI) {
      connected = await Database.initMongo();
    }
    broadcastFullState();
  } catch (e) {
    console.error('Lỗi khởi động cơ sở dữ liệu cloud:', e);
  }
});
