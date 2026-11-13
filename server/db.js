const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const uuidv4 = randomUUID;

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Đảm bảo thư mục lưu trữ data tồn tại
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Dữ liệu mẫu chuẩn Hội đồng nhân dân xã Phước Trà
const INITIAL_DATA = {
  sessions: [
    {
      id: "session-phuoc-tra-01",
      name: "Kỳ họp thứ 8 (Kỳ họp thường lệ) - HĐND xã Phước Trà Khóa XII, Nhiệm kỳ 2021 - 2026",
      session_code: "KH-08-KXII",
      location: "Hội trường tầng 2 - UBND xã Phước Trà",
      date: new Date().toLocaleDateString('vi-VN'),
      total_delegates: 17, // Tổng số đại biểu triệu tập theo luật của HĐND xã Phước Trà
      is_active: true,
      active_agenda_id: "agenda-01",
      voting_status: "idle", // 'idle' | 'voting' | 'locked' | 'published'
      voting_time_remaining: 30,
      voting_duration: 30,
      voting_started_at: null,
      created_at: new Date().toISOString()
    }
  ],
  delegates: [
    { id: "db-01", session_id: "session-phuoc-tra-01", seat_number: "ĐB-01", name: "Nguyễn Văn Nam", title: "Bí thư Đảng ủy", group_name: "Tổ 1 - Đảng ủy, HĐND, UBND, UBMT", pin: "1111", is_present: true, is_online: false },
    { id: "db-02", session_id: "session-phuoc-tra-01", seat_number: "ĐB-02", name: "Trần Quốc Trí", title: "PBT TT Đảng ủy", group_name: "Tổ 1 - Đảng ủy, HĐND, UBND, UBMT", pin: "2222", is_present: true, is_online: false },
    { id: "db-03", session_id: "session-phuoc-tra-01", seat_number: "ĐB-03", name: "Hoàng Văn Hùng", title: "PBT Đảng ủy - CT UBND", group_name: "Tổ 1 - Đảng ủy, HĐND, UBND, UBMT", pin: "3333", is_present: true, is_online: false },
    { id: "db-04", session_id: "session-phuoc-tra-01", seat_number: "ĐB-04", name: "Võ Ngọc Phương", title: "PCT HĐND", group_name: "Tổ 1 - Đảng ủy, HĐND, UBND, UBMT", pin: "4444", is_present: true, is_online: false },
    { id: "db-05", session_id: "session-phuoc-tra-01", seat_number: "ĐB-05", name: "Đặng Thị Ngọc Lan", title: "CT UBMT", group_name: "Tổ 1 - Đảng ủy, HĐND, UBND, UBMT", pin: "1005", is_present: true, is_online: false },
    { id: "db-06", session_id: "session-phuoc-tra-01", seat_number: "ĐB-06", name: "Nguyễn Tấn Nghiệp", title: "PCT UBND", group_name: "Tổ 1 - Đảng ủy, HĐND, UBND, UBMT", pin: "1006", is_present: true, is_online: false },
    { id: "db-07", session_id: "session-phuoc-tra-01", seat_number: "ĐB-07", name: "Nguyễn Hồng Sơn", title: "Trưởng Ban VH-XH", group_name: "Tổ 2 - Các Ban HĐND & Đoàn thể", pin: "1007", is_present: true, is_online: false },
    { id: "db-08", session_id: "session-phuoc-tra-01", seat_number: "ĐB-08", name: "Nguyễn Thị Lệ Thắm", title: "Trưởng Ban KT-NS", group_name: "Tổ 2 - Các Ban HĐND & Đoàn thể", pin: "1008", is_present: true, is_online: false },
    { id: "db-09", session_id: "session-phuoc-tra-01", seat_number: "ĐB-09", name: "Hồ Văn Sinh", title: "Phó Ban KTNS", group_name: "Tổ 2 - Các Ban HĐND & Đoàn thể", pin: "1009", is_present: true, is_online: false },
    { id: "db-10", session_id: "session-phuoc-tra-01", seat_number: "ĐB-10", name: "Nguyễn Văn Lợi", title: "Phó Ban VH-XH", group_name: "Tổ 2 - Các Ban HĐND & Đoàn thể", pin: "1010", is_present: true, is_online: false },
    { id: "db-11", session_id: "session-phuoc-tra-01", seat_number: "ĐB-11", name: "Hồ Thị Danh", title: "Bí thư Đoàn TN", group_name: "Tổ 2 - Các Ban HĐND & Đoàn thể", pin: "1011", is_present: true, is_online: false },
    { id: "db-12", session_id: "session-phuoc-tra-01", seat_number: "ĐB-12", name: "Phạm Chí Sang", title: "CT Hội ND", group_name: "Tổ 2 - Các Ban HĐND & Đoàn thể", pin: "1012", is_present: true, is_online: false },
    { id: "db-13", session_id: "session-phuoc-tra-01", seat_number: "ĐB-13", name: "Nguyễn Văn Vinh", title: "Trưởng Công an xã", group_name: "Tổ 2 - Các Ban HĐND & Đoàn thể", pin: "1013", is_present: true, is_online: false },
    { id: "db-14", session_id: "session-phuoc-tra-01", seat_number: "ĐB-14", name: "Nguyễn Văn Cường", title: "Bí Thư thôn Trà Sơn", group_name: "Tổ 3 - Thôn Trà Sơn, Trà Nô, Hạ Sơn", pin: "1014", is_present: true, is_online: false },
    { id: "db-15", session_id: "session-phuoc-tra-01", seat_number: "ĐB-15", name: "Hồ Văn Chi", title: "Bí thư Chi bộ thôn Trà Nô", group_name: "Tổ 3 - Thôn Trà Sơn, Trà Nô, Hạ Sơn", pin: "1015", is_present: true, is_online: false },
    { id: "db-16", session_id: "session-phuoc-tra-01", seat_number: "ĐB-16", name: "Hồ Ngọc Xanh", title: "BT kiêm trưởng thôn Hạ Sơn", group_name: "Tổ 3 - Thôn Trà Sơn, Trà Nô, Hạ Sơn", pin: "1016", is_present: true, is_online: false },
    { id: "db-17", session_id: "session-phuoc-tra-01", seat_number: "ĐB-17", name: "Trần Anh Đức", title: "Đại biểu HĐND", group_name: "Tổ 3 - Thôn Trà Sơn, Trà Nô, Hạ Sơn", pin: "1017", is_present: true, is_online: false }
  ],
  agendas: [
    {
      id: "agenda-01",
      session_id: "session-phuoc-tra-01",
      order_num: 1,
      code: "NQ-01/NQ-HĐND",
      title: "Thông qua Báo cáo tình hình phát triển Kinh tế - Xã hội, Quốc phòng - An ninh năm 2026 và phương hướng nhiệm vụ năm 2027",
      description: "Biểu quyết thông qua toàn văn Báo cáo số 45/BC-UBND của UBND xã Phước Trà về kết quả đạt được và chỉ tiêu phát triển KTXH năm 2027.",
      default_duration: 30,
      status: "pending", // 'pending' | 'voting' | 'locked' | 'published'
      required_ratio: 0.5 // > 50% tổng số đại biểu triệu tập (tối thiểu 9/17 tán thành)
    },
    {
      id: "agenda-02",
      session_id: "session-phuoc-tra-01",
      order_num: 2,
      code: "NQ-02/NQ-HĐND",
      title: "Thông qua Dự toán phân bổ thu, chi ngân sách xã và Kế hoạch đầu tư công năm 2027",
      description: "Biểu quyết phê chuẩn tổng mức thu ngân sách dự kiến 14,2 tỷ đồng và danh mục 6 công trình giao thông nông thôn xã Phước Trà.",
      default_duration: 45,
      status: "pending",
      required_ratio: 0.5
    },
    {
      id: "agenda-03",
      session_id: "session-phuoc-tra-01",
      order_num: 3,
      code: "NQ-03/NQ-HĐND",
      title: "Thông qua Đề án xây dựng xã Nông thôn mới nâng cao giai đoạn 2026 - 2030",
      description: "Biểu quyết các chỉ tiêu trọng tâm: Nâng cấp đường trục thôn xóm, cơ sở vật chất văn hóa, trường học đạt chuẩn quốc gia.",
      default_duration: 30,
      status: "pending",
      required_ratio: 0.5
    },
    {
      id: "agenda-04",
      session_id: "session-phuoc-tra-01",
      order_num: 4,
      code: "NQ-04/NQ-HĐND",
      title: "Biểu quyết miễn nhiệm và bầu bổ sung Ủy viên UBND xã Phước Trà Khóa XII",
      description: "Bầu bổ sung Ủy viên UBND phụ trách lĩnh vực Địa chính - Nông nghiệp - Xây dựng và Môi trường.",
      default_duration: 60,
      status: "pending",
      required_ratio: 0.5
    }
  ],
  votes: []
};

// Đọc dữ liệu từ file
function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      writeDb(INITIAL_DATA);
      return JSON.parse(JSON.stringify(INITIAL_DATA));
    }
    const content = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error("Lỗi đọc cơ sở dữ liệu:", error);
    return INITIAL_DATA;
  }
}

// Ghi dữ liệu an toàn (Atomic Write)
function writeDb(data) {
  try {
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (error) {
    console.error("Lỗi ghi cơ sở dữ liệu:", error);
  }
}

class Database {
  // --- SESSIONS ---
  static getActiveSession() {
    const db = readDb();
    let session = db.sessions.find(s => s.is_active);
    if (!session && db.sessions.length > 0) {
      session = db.sessions[0];
      session.is_active = true;
      writeDb(db);
    }
    return session;
  }

  static getSessions() {
    return readDb().sessions;
  }

  static createSession(sessionData) {
    const db = readDb();
    const newSession = {
      id: uuidv4(),
      name: sessionData.name || "Kỳ họp HĐND mới",
      session_code: sessionData.session_code || `KH-${Date.now().toString().slice(-4)}`,
      location: sessionData.location || "Hội trường UBND xã Phước Trà",
      date: sessionData.date || new Date().toLocaleDateString('vi-VN'),
      total_delegates: parseInt(sessionData.total_delegates, 10) || 25,
      is_active: false,
      active_agenda_id: null,
      voting_status: "idle",
      voting_time_remaining: 30,
      voting_duration: 30,
      created_at: new Date().toISOString()
    };
    db.sessions.push(newSession);
    writeDb(db);
    return newSession;
  }

  static setActiveSession(sessionId) {
    const db = readDb();
    db.sessions.forEach(s => {
      s.is_active = (s.id === sessionId);
    });
    writeDb(db);
    return this.getActiveSession();
  }

  static updateSessionState(sessionId, updateFields) {
    const db = readDb();
    const session = db.sessions.find(s => s.id === sessionId);
    if (session) {
      Object.assign(session, updateFields);
      writeDb(db);
    }
    return session;
  }

  // --- DELEGATES ---
  static getDelegates(sessionId) {
    const db = readDb();
    return db.delegates.filter(d => !sessionId || d.session_id === sessionId);
  }

  static getDelegateById(id) {
    const db = readDb();
    return db.delegates.find(d => d.id === id);
  }

  static updateDelegate(id, updates) {
    const db = readDb();
    const delegate = db.delegates.find(d => d.id === id);
    if (delegate) {
      Object.assign(delegate, updates);
      writeDb(db);
    }
    return delegate;
  }

  static addDelegate(delegateData) {
    const db = readDb();
    const newDelegate = {
      id: uuidv4(),
      session_id: delegateData.session_id,
      seat_number: delegateData.seat_number || `ĐB-${db.delegates.length + 1}`,
      name: delegateData.name,
      title: delegateData.title || "Đại biểu HĐND",
      group_name: delegateData.group_name || "Tổ đại biểu",
      pin: delegateData.pin || Math.floor(1000 + Math.random() * 9000).toString(),
      is_present: delegateData.is_present !== undefined ? delegateData.is_present : true,
      is_online: false
    };
    db.delegates.push(newDelegate);
    writeDb(db);
    return newDelegate;
  }

  static deleteDelegate(id) {
    const db = readDb();
    db.delegates = db.delegates.filter(d => d.id !== id);
    db.votes = db.votes.filter(v => v.delegate_id !== id);
    writeDb(db);
    return true;
  }

  // --- AGENDAS ---
  static getAgendas(sessionId) {
    const db = readDb();
    return db.agendas
      .filter(a => !sessionId || a.session_id === sessionId)
      .sort((a, b) => a.order_num - b.order_num);
  }

  static getAgendaById(id) {
    const db = readDb();
    return db.agendas.find(a => a.id === id);
  }

  static createAgenda(agendaData) {
    const db = readDb();
    const existing = db.agendas.filter(a => a.session_id === agendaData.session_id);
    const newAgenda = {
      id: uuidv4(),
      session_id: agendaData.session_id,
      order_num: agendaData.order_num || (existing.length + 1),
      code: agendaData.code || `NQ-0${existing.length + 1}/NQ-HĐND`,
      title: agendaData.title,
      description: agendaData.description || "",
      default_duration: parseInt(agendaData.default_duration, 10) || 30,
      status: "pending",
      required_ratio: parseFloat(agendaData.required_ratio) || 0.5
    };
    db.agendas.push(newAgenda);
    writeDb(db);
    return newAgenda;
  }

  static updateAgenda(id, updates) {
    const db = readDb();
    const agenda = db.agendas.find(a => a.id === id);
    if (agenda) {
      Object.assign(agenda, updates);
      writeDb(db);
    }
    return agenda;
  }

  static deleteAgenda(id) {
    const db = readDb();
    db.agendas = db.agendas.filter(a => a.id !== id);
    db.votes = db.votes.filter(v => v.agenda_id !== id);
    writeDb(db);
    return true;
  }

  // --- VOTES ---
  static castVote(agendaId, delegateId, choice) {
    const db = readDb();
    // Kiểm tra xem đại biểu đã vote nội dung này chưa, nếu rồi thì cập nhật
    let vote = db.votes.find(v => v.agenda_id === agendaId && v.delegate_id === delegateId);
    if (vote) {
      vote.choice = choice;
      vote.voted_at = new Date().toISOString();
    } else {
      vote = {
        id: uuidv4(),
        agenda_id: agendaId,
        delegate_id: delegateId,
        choice: choice, // 'agree' | 'disagree' | 'neutral'
        voted_at: new Date().toISOString()
      };
      db.votes.push(vote);
    }
    writeDb(db);
    return vote;
  }

  static getVotesForAgenda(agendaId) {
    const db = readDb();
    return db.votes.filter(v => v.agenda_id === agendaId);
  }

  static resetVotesForAgenda(agendaId) {
    const db = readDb();
    db.votes = db.votes.filter(v => v.agenda_id !== agendaId);
    const agenda = db.agendas.find(a => a.id === agendaId);
    if (agenda) {
      agenda.status = "pending";
    }
    writeDb(db);
    return true;
  }

  // Tính toán kết quả biểu quyết chuẩn theo Luật HĐND
  static calculateResults(agendaId, sessionId) {
    const db = readDb();
    const session = db.sessions.find(s => s.id === sessionId) || this.getActiveSession();
    const agenda = agendaId ? db.agendas.find(a => a.id === agendaId) : null;
    const delegates = db.delegates.filter(d => d.session_id === (session ? session.id : null));
    const votes = agendaId ? db.votes.filter(v => v.agenda_id === agendaId) : [];

    const totalDelegates = session ? Math.max(session.total_delegates || 0, delegates.length) : delegates.length;
    const presentDelegates = delegates.filter(d => d.is_present).length;
    const absentDelegates = Math.max(0, totalDelegates - presentDelegates);

    if (!agenda) {
      return {
        agenda: null,
        session_name: session ? session.name : "",
        total_delegates: totalDelegates,
        present_delegates: presentDelegates,
        absent_delegates: absentDelegates,
        total_voted: 0,
        not_voted_count: presentDelegates,
        agree_count: 0,
        agree_percent_present: "0.0",
        agree_percent_total: "0.0",
        disagree_count: 0,
        disagree_percent_present: "0.0",
        neutral_count: 0,
        neutral_percent_present: "0.0",
        is_passed: false,
        required_ratio: 0.5,
        delegate_status_list: delegates.map(d => ({
          id: d.id,
          seat_number: d.seat_number,
          name: d.name,
          group_name: d.group_name,
          is_present: d.is_present,
          is_online: d.is_online,
          has_voted: false,
          choice: null,
          voted_at: null
        }))
      };
    }

    let agreeCount = 0;
    let disagreeCount = 0;
    let neutralCount = 0;

    votes.forEach(v => {
      if (v.choice === 'agree') agreeCount++;
      else if (v.choice === 'disagree') disagreeCount++;
      else if (v.choice === 'neutral') neutralCount++;
    });

    const totalVoted = votes.length;
    const notVotedCount = Math.max(0, presentDelegates - totalVoted);

    // Tỷ lệ phần trăm tính trên số ĐB có mặt
    const agreePercentPresent = presentDelegates > 0 ? ((agreeCount / presentDelegates) * 100).toFixed(1) : "0.0";
    const disagreePercentPresent = presentDelegates > 0 ? ((disagreeCount / presentDelegates) * 100).toFixed(1) : "0.0";
    const neutralPercentPresent = presentDelegates > 0 ? ((neutralCount / presentDelegates) * 100).toFixed(1) : "0.0";

    // Tỷ lệ phần trăm tính trên TỔNG SỐ ĐẠI BIỂU TRIỆU TẬP (Cơ sở pháp lý HĐND)
    const agreePercentTotal = totalDelegates > 0 ? ((agreeCount / totalDelegates) * 100).toFixed(1) : "0.0";
    const requiredRatio = (agenda && agenda.required_ratio) || 0.5;
    const isPassed = (agreeCount / totalDelegates) > requiredRatio; // Quá nửa tổng số ĐB triệu tập

    // Chi tiết từng đại biểu và trạng thái biểu quyết
    const delegateVotingStatus = delegates.map(d => {
      const voteItem = votes.find(v => v.delegate_id === d.id);
      return {
        id: d.id,
        seat_number: d.seat_number,
        name: d.name,
        group_name: d.group_name,
        is_present: d.is_present,
        is_online: d.is_online,
        has_voted: !!voteItem,
        choice: voteItem ? voteItem.choice : null,
        voted_at: voteItem ? voteItem.voted_at : null
      };
    });

    return {
      agenda: agenda || null,
      session_name: session ? session.name : "",
      total_delegates: totalDelegates,
      present_delegates: presentDelegates,
      absent_delegates: Math.max(0, totalDelegates - presentDelegates),
      total_voted: totalVoted,
      not_voted_count: notVotedCount,
      agree_count: agreeCount,
      agree_percent_present: agreePercentPresent,
      agree_percent_total: agreePercentTotal,
      disagree_count: disagreeCount,
      disagree_percent_present: disagreePercentPresent,
      neutral_count: neutralCount,
      neutral_percent_present: neutralPercentPresent,
      is_passed: isPassed,
      required_ratio: requiredRatio,
      delegate_status_list: delegateVotingStatus
    };
  }

  // Khôi phục dữ liệu ban đầu nếu cần
  static resetToDefault() {
    writeDb(INITIAL_DATA);
    return true;
  }
}

// Khởi tạo DB nếu chưa có
readDb();

module.exports = Database;
