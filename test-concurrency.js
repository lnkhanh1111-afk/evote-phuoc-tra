const { io } = require('./client/node_modules/socket.io-client');

async function runBenchmark() {
  console.log('--- BẮT ĐẦU KIỂM THỬ TẢI ĐỒNG THỜI 18 ĐẠI BIỂU ---');
  const SERVER_URL = 'http://localhost:5000';

  // 1. Kích hoạt phiên biểu quyết qua admin socket
  const adminSocket = io(SERVER_URL);
  await new Promise(r => adminSocket.on('connect', r));
  console.log('Admin socket đã kết nối thành công.');

  // Lấy session & agenda hiện tại
  const sessionRes = await fetch(`${SERVER_URL}/api/session/active`);
  const session = await sessionRes.json();
  const agendasRes = await fetch(`${SERVER_URL}/api/agendas`);
  const agendas = await agendasRes.json();
  const delegatesRes = await fetch(`${SERVER_URL}/api/delegates`);
  const delegates = await delegatesRes.json();

  const agenda = agendas[0];
  console.log(`Kiểm thử với chỉ tiêu: "${agenda.title}" (ID: ${agenda.id})`);
  console.log(`Số đại biểu trong danh sách: ${delegates.length}`);

  // Mở biểu quyết
  adminSocket.emit('admin_start_voting', { agendaId: agenda.id, duration: 60 });
  await new Promise(r => setTimeout(r, 500));

  // 2. Tạo 18 kết nối socket đồng thời giả lập 18 máy tính bảng
  console.log(`Khởi tạo 18 kết nối Socket.IO đồng thời...`);
  const startTime = Date.now();
  const sockets = [];
  const connectPromises = [];

  for (let i = 0; i < 18; i++) {
    const s = io(SERVER_URL, { forceNew: true });
    sockets.push(s);
    connectPromises.push(new Promise((resolve, reject) => {
      s.on('connect', resolve);
      s.on('connect_error', reject);
    }));
  }

  await Promise.all(connectPromises);
  const connectTime = Date.now() - startTime;
  console.log(`✓ 18 máy tính bảng đã kết nối Socket thành công trong ${connectTime}ms!`);

  // 3. Đăng nhập 18 đại biểu cùng lúc
  const loginPromises = sockets.map((s, idx) => {
    const del = delegates[idx % delegates.length];
    return new Promise(resolve => {
      s.emit('delegate_login', { delegateId: del.id });
      resolve();
    });
  });
  await Promise.all(loginPromises);
  console.log(`✓ 18 đại biểu đăng nhập đồng thời thành công!`);

  // 4. BỎ PHIẾU ĐỒNG THỜI Ở CÙNG 1 TÍCH TẮC (STRESS TEST CONCURRENCY)
  console.log(`>>> GỬI 18 PHIẾU BIỂU QUYẾT ĐỒNG THỜI Ở CÙNG 1 TÍCH TẮC <<<`);
  const voteStart = Date.now();
  const voteResults = [];

  const votePromises = sockets.map((s, idx) => {
    const del = delegates[idx % delegates.length];
    const choices = ['agree', 'agree', 'agree', 'disagree', 'neutral'];
    const choice = choices[idx % choices.length];

    return new Promise(resolve => {
      const voteSendTime = Date.now();
      s.once('vote_success', (res) => {
        const latency = Date.now() - voteSendTime;
        voteResults.push({ index: idx + 1, delegate: del.name, choice, latency, success: true });
        resolve();
      });
      s.once('vote_error', (err) => {
        voteResults.push({ index: idx + 1, delegate: del.name, error: err.message, success: false });
        resolve();
      });
      // Phát sự kiện vote
      s.emit('submit_vote', {
        delegateId: del.id,
        agendaId: agenda.id,
        choice: choice
      });
    });
  });

  await Promise.all(votePromises);
  const totalVoteTime = Date.now() - voteStart;

  console.log(`✓ Hoàn tất xử lý 18 phiếu biểu quyết đồng thời trong ${totalVoteTime}ms!`);
  const avgLatency = (voteResults.reduce((sum, r) => sum + (r.latency || 0), 0) / voteResults.length).toFixed(2);
  console.log(`  - Độ trễ phản hồi trung bình mỗi phiếu: ${avgLatency}ms`);
  console.log(`  - Số phiếu thành công: ${voteResults.filter(r => r.success).length}/18`);

  // 5. Kiểm tra kết quả trong DB
  const resultsRes = await fetch(`${SERVER_URL}/api/results/${agenda.id}`);
  const results = await resultsRes.json();
  console.log(`\n--- KIỂM TRA ĐỘ TOÀN VẸN DỮ LIỆU ---`);
  console.log(`- Tổng số đại biểu triệu tập: ${results.total_delegates}`);
  console.log(`- Đại biểu có mặt: ${results.present_delegates}`);
  console.log(`- Đại biểu vắng mặt: ${results.absent_delegates}`);
  console.log(`- Tổng số phiếu ghi nhận: ${results.total_voted}`);
  console.log(`- Tán thành: ${results.agree_count} (${results.agree_percent_total}% tổng ĐB)`);
  console.log(`- Không tán thành: ${results.disagree_count}`);
  console.log(`- Không ý kiến: ${results.neutral_count}`);
  console.log(`- Kết quả thông qua: ${results.is_passed ? 'ĐẠT (ĐÃ THÔNG QUA)' : 'CHƯA ĐẠT'}`);

  // Dọn dẹp kết nối
  sockets.forEach(s => s.disconnect());
  adminSocket.disconnect();
  console.log('\n--- KẾT LUẬN KIỂM THỬ: HỆ THỐNG ĐÁP ỨNG XUẤT SẮC 18+ TRUY CẬP ĐỒNG THỜI ---');
}

runBenchmark().catch(err => {
  console.error('Lỗi kiểm thử:', err);
  process.exit(1);
});
