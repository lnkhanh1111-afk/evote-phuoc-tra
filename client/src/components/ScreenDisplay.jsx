import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Maximize2, Minimize2, CheckCircle2, XCircle, HelpCircle, Users, Award, Shield, Check, Clock } from 'lucide-react';
import NationalEmblem from './NationalEmblem';
import NationalFlag from './NationalFlag';

export default function ScreenDisplay({ state }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const session = state.session;
  const currentAgenda = state.currentAgenda;
  const results = state.results;
  const allResults = state.allResults || [];
  const votingStatus = state.voting_status; // 'idle' | 'voting' | 'locked' | 'published'
  const timeRemaining = state.time_remaining;

  // Hiệu ứng pháo hoa khi công bố kết quả và Nghị quyết được thông qua
  useEffect(() => {
    if (votingStatus === 'published' && results && results.is_passed) {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 }
      });
    }
  }, [votingStatus, results?.is_passed, results?.agenda?.id]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const delegates = state.delegates || [];
  const presentCount = delegates.filter(d => d.is_present).length;
  const totalDelegates = session?.total_delegates || (delegates.length > 0 ? delegates.length : 17);
  const presentDelegates = delegates.length > 0 ? presentCount : (results?.present_delegates ?? totalDelegates);
  const absentDelegates = Math.max(0, totalDelegates - presentDelegates);
  const totalVoted = results?.total_voted || 0;
  const voteProgressPercent = presentDelegates > 0 ? Math.round((totalVoted / presentDelegates) * 100) : 0;
  const delegateStatusList = results?.delegate_status_list || delegates.map(d => ({
    id: d.id,
    seat_number: d.seat_number,
    name: d.name,
    is_present: d.is_present,
    is_online: d.is_online,
    has_voted: false
  }));

  return (
    <div className="min-h-screen bg-[#0a0f1d] text-white flex flex-col justify-between p-4 md:p-6 select-none overflow-x-hidden font-sans">
      {/* 1. KHỐI TIÊU ĐỀ TRANG TRỌNG CHUẨN CƠ QUAN NHÀ NƯỚC */}
      <header className="border-b-2 border-red-700/60 pb-4 relative">
        <div className="flex items-center justify-between">
          {/* Biểu trưng Quốc huy & Tiêu ngữ Quốc gia */}
          <div className="flex items-center gap-4">
            <NationalEmblem size={74} className="hover:scale-105 transition-transform" />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <NationalFlag className="w-5 h-3.5 shadow" />
                <p className="text-xs uppercase tracking-widest text-yellow-400 font-black">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM • ĐỘC LẬP - TỰ DO - HẠNH PHÚC
                </p>
              </div>
              <h1 className="text-xl md:text-3xl font-black uppercase tracking-wide text-white drop-shadow-md">
                {session ? session.name : "HỘI ĐỒNG NHÂN DÂN XÃ PHƯỚC TRÀ"}
              </h1>
              <p className="text-xs md:text-sm text-slate-300 font-medium">
                Địa điểm: {session ? session.location : "Hội trường UBND xã Phước Trà"} • Ngày {session?.date || new Date().toLocaleDateString('vi-VN')}
              </p>
            </div>
          </div>

          {/* Nút Toàn màn hình & Tình trạng phiên */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleFullscreen}
              className="p-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition border border-slate-700 shadow"
              title="Chế độ toàn màn hình F11"
            >
              {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Thanh Thông Số Đại Biểu Hội Trường */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-bold">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Tổng số ĐB triệu tập:</span>
            </div>
            <span className="text-xl font-black text-white font-mono">{totalDelegates} <span className="text-xs text-slate-400">ĐB</span></span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-bold">
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Đại biểu có mặt:</span>
            </div>
            <span className="text-xl font-black text-emerald-400 font-mono">
              {presentDelegates} <span className="text-xs text-slate-400">({totalDelegates > 0 ? Math.round((presentDelegates/totalDelegates)*100) : 0}%)</span>
            </span>
          </div>

          <div className="bg-slate-800/80 border border-slate-700 rounded-xl px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-400 text-xs uppercase font-bold">
              <Shield className="w-4 h-4 text-rose-400" />
              <span>Đại biểu vắng mặt:</span>
            </div>
            <span className="text-xl font-black text-rose-400 font-mono">{absentDelegates} <span className="text-xs text-slate-400">ĐB</span></span>
          </div>
        </div>
      </header>

      {/* 2. KHỐI TRUNG TÂM: NỘI DUNG BIỂU QUYẾT & TIẾN ĐỘ THỜI GIAN THỰC */}
      <main className="my-4 flex-1 flex flex-col justify-center">
        {currentAgenda ? (
          <div className="max-w-5xl mx-auto w-full space-y-5">
            {/* THẺ TÊN NGHỊ QUYẾT / CHỈ TIÊU */}
            <div className="bg-gradient-to-b from-slate-800 to-slate-800/90 border-2 border-yellow-500/40 rounded-3xl p-6 md:p-8 text-center shadow-2xl relative overflow-hidden">
              <div className="inline-block bg-yellow-400 text-slate-900 font-black text-xs md:text-sm uppercase px-4 py-1.5 rounded-full mb-3 shadow">
                CHỈ TIÊU BIỂU QUYẾT SỐ 0{currentAgenda.order_num} • {currentAgenda.code}
              </div>

              <h2 className="text-2xl md:text-4xl font-black text-white leading-tight uppercase tracking-wide max-w-4xl mx-auto">
                {currentAgenda.title}
              </h2>

              {currentAgenda.description && (
                <p className="mt-3 text-slate-300 text-sm md:text-base font-normal max-w-3xl mx-auto leading-relaxed">
                  {currentAgenda.description}
                </p>
              )}

              {/* TRẠNG THÁI 1: ĐANG BIỂU QUYẾT (ĐỒNG HỒ ĐẾM NGƯỢC VÀ TIẾN ĐỘ BỎ PHIẾU) */}
              {votingStatus === 'voting' && (
                <div className="mt-6 pt-6 border-t border-slate-700/80">
                  <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
                    {/* Đồng hồ đếm ngược vi tính cực lớn */}
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-bold uppercase tracking-widest text-red-400 mb-1">
                        THỜI GIAN CÒN LẠI
                      </span>
                      <div className="w-28 h-28 md:w-36 md:h-36 rounded-2xl bg-gradient-to-b from-red-600 to-red-800 border-4 border-yellow-400 shadow-xl shadow-red-900/60 flex items-center justify-center text-white font-mono font-black text-5xl md:text-6xl animate-pulse">
                        {timeRemaining}s
                      </div>
                    </div>

                    {/* Tiến độ số lượng đại biểu đã bỏ phiếu */}
                    <div className="flex-1 w-full max-w-md text-left">
                      <div className="flex items-center justify-between text-sm md:text-base font-bold text-slate-200 mb-2">
                        <span>TIẾN ĐỘ BIỂU QUYẾT HỘI TRƯỜNG:</span>
                        <span className="font-mono text-yellow-400 text-lg">
                          {totalVoted} / {presentDelegates} ĐB ({voteProgressPercent}%)
                        </span>
                      </div>
                      
                      {/* Thanh Progress bar */}
                      <div className="w-full bg-slate-950 h-7 rounded-full p-1 border border-slate-700 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-300 shadow"
                          style={{ width: `${voteProgressPercent}%` }}
                        ></div>
                      </div>

                      <p className="text-xs text-slate-400 mt-2 italic text-center md:text-left">
                        * Quý đại biểu chạm chọn biểu quyết trên máy tính bảng cá nhân
                      </p>
                    </div>
                  </div>

                  {/* SƠ ĐỒ 17 GHẾ ĐẠI BIỂU HỘI TRƯỜNG THEO THỜI GIAN THỰC */}
                  <div className="mt-6 pt-4 border-t border-slate-700/60">
                    <p className="text-xs font-bold uppercase text-slate-400 mb-2.5 tracking-wider">
                      Sơ đồ trạng thái điểm danh & biểu quyết hội trường (17 đại biểu):
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {delegateStatusList.map((del) => {
                        const voted = del.has_voted;
                        return (
                          <div
                            key={del.id}
                            title={`${del.seat_number} - ${del.name}: ${voted ? 'Đã bỏ phiếu' : 'Chưa bỏ phiếu'}`}
                            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
                              voted
                                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/40'
                                : del.is_present
                                ? 'bg-slate-900 border-slate-700 text-slate-400'
                                : 'bg-rose-950/40 border-rose-800 text-rose-400/60'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full shrink-0" style={{
                              backgroundColor: voted ? '#10B981' : (del.is_present ? '#F59E0B' : '#EF4444')
                            }}></span>
                            <span className="font-mono font-bold">{del.seat_number}</span>
                            <span className="hidden sm:inline text-[11px] truncate max-w-[90px]">{del.name.split(' ').slice(-1)[0]}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TRẠNG THÁI 2: ĐÃ KHÓA BIỂU QUYẾT */}
              {votingStatus === 'locked' && (
                <div className="mt-8 pt-6 border-t border-slate-700 text-center">
                  <div className="inline-flex items-center gap-3 bg-amber-500/20 text-amber-400 border border-amber-500/40 px-6 py-3 rounded-2xl text-lg font-bold">
                    <span className="w-3 h-3 bg-amber-400 rounded-full animate-ping"></span>
                    <span>ĐÃ KHÓA BIỂU QUYẾT • ĐANG TỔNG HỢP KẾT QUẢ ĐỂ CÔNG BỐ</span>
                  </div>
                </div>
              )}

              {/* TRẠNG THÁI 3: CÔNG BỐ KẾT QUẢ (HIỂN THỊ CÁC CỘT SỐ LIỆU VÀ KẾT LUẬN THÔNG QUA) */}
              {votingStatus === 'published' && results && (
                <div className="mt-6 pt-6 border-t border-slate-700/80 animate-in fade-in zoom-in-95">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
                    {/* Cột 1: TÁN THÀNH */}
                    <div className="bg-gradient-to-b from-emerald-950/80 to-emerald-900/60 border-2 border-emerald-500 rounded-2xl p-5 text-center shadow-lg">
                      <div className="flex items-center justify-center gap-2 text-emerald-400 font-extrabold text-lg uppercase mb-1">
                        <CheckCircle2 className="w-6 h-6" />
                        <span>TÁN THÀNH</span>
                      </div>
                      <div className="text-5xl md:text-6xl font-black font-mono text-emerald-300 my-2">
                        {results.agree_count}
                      </div>
                      <div className="text-sm font-bold text-slate-200">
                        {results.agree_percent_present}% <span className="text-xs text-slate-400 font-normal">(ĐB có mặt)</span>
                      </div>
                      <div className="text-xs text-emerald-400/90 font-medium mt-1">
                        {results.agree_percent_total}% <span className="text-slate-400">(Tổng số triệu tập)</span>
                      </div>
                    </div>

                    {/* Cột 2: KHÔNG TÁN THÀNH */}
                    <div className="bg-gradient-to-b from-rose-950/80 to-rose-900/60 border-2 border-rose-500 rounded-2xl p-5 text-center shadow-lg">
                      <div className="flex items-center justify-center gap-2 text-rose-400 font-extrabold text-lg uppercase mb-1">
                        <XCircle className="w-6 h-6" />
                        <span>KHÔNG TÁN THÀNH</span>
                      </div>
                      <div className="text-5xl md:text-6xl font-black font-mono text-rose-300 my-2">
                        {results.disagree_count}
                      </div>
                      <div className="text-sm font-bold text-slate-200">
                        {results.disagree_percent_present}% <span className="text-xs text-slate-400 font-normal">(ĐB có mặt)</span>
                      </div>
                      <div className="text-xs text-rose-400/90 font-medium mt-1">
                        {results.disagree_count > 0 ? ((results.disagree_count / totalDelegates) * 100).toFixed(1) : "0.0"}% <span className="text-slate-400">(Tổng số triệu tập)</span>
                      </div>
                    </div>

                    {/* Cột 3: KHÔNG CÓ Ý KIẾN */}
                    <div className="bg-gradient-to-b from-amber-950/80 to-amber-900/60 border-2 border-amber-500 rounded-2xl p-5 text-center shadow-lg">
                      <div className="flex items-center justify-center gap-2 text-amber-400 font-extrabold text-lg uppercase mb-1">
                        <HelpCircle className="w-6 h-6" />
                        <span>KHÔNG Ý KIẾN</span>
                      </div>
                      <div className="text-5xl md:text-6xl font-black font-mono text-amber-300 my-2">
                        {results.neutral_count}
                      </div>
                      <div className="text-sm font-bold text-slate-200">
                        {results.neutral_percent_present}% <span className="text-xs text-slate-400 font-normal">(ĐB có mặt)</span>
                      </div>
                      <div className="text-xs text-amber-400/90 font-medium mt-1">
                        {results.neutral_count > 0 ? ((results.neutral_count / totalDelegates) * 100).toFixed(1) : "0.0"}% <span className="text-slate-400">(Tổng số triệu tập)</span>
                      </div>
                    </div>
                  </div>

                  {/* KHỐI KẾT LUẬN TO RÕ RÀNG */}
                  <div className={`p-4 md:p-6 rounded-2xl border-4 shadow-2xl flex items-center justify-center gap-4 ${
                    results.is_passed
                      ? 'bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 border-yellow-400 text-white'
                      : 'bg-gradient-to-r from-rose-700 to-red-800 border-rose-400 text-white'
                  }`}>
                    <Award className="w-10 h-10 md:w-14 md:h-14 text-yellow-300 shrink-0" />
                    <div className="text-left">
                      <h3 className="text-xl md:text-3xl font-black uppercase tracking-wide">
                        {results.is_passed ? "NGHỊ QUYẾT ĐÃ ĐƯỢC HỘI ĐỒNG NHÂN DÂN THÔNG QUA" : "CHƯA ĐỦ ĐIỀU KIỆN THÔNG QUA NGHỊ QUYẾT"}
                      </h3>
                      <p className="text-xs md:text-sm text-yellow-100 font-medium">
                        Căn cứ quy chế: Tỷ lệ tán thành đạt {results.agree_percent_total}% trên tổng số đại biểu triệu tập (Yêu cầu &gt; 50%)
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto text-center py-12 px-6 bg-slate-800/60 border border-slate-700/80 rounded-3xl shadow-xl">
            <NationalEmblem size={88} className="mx-auto mb-4" />
            <h2 className="text-xl md:text-2xl font-black text-white uppercase tracking-wide">
              {allResults.length === 0 ? "CHƯA CÓ CHỈ TIÊU BIỂU QUYẾT NÀO" : "CHỜ CHỦ TỌA PHÁT LỆNH BIỂU QUYẾT"}
            </h2>
            <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
              {allResults.length === 0 
                ? "Kỳ họp hiện chưa có danh mục chỉ tiêu biểu quyết. Thư ký kỳ họp vui lòng thêm các nội dung dự thảo Nghị quyết trong trang Quản trị."
                : "Hội đồng nhân dân đang thảo luận. Khi Chủ tọa phát lệnh biểu quyết, nội dung và đồng hồ đếm ngược sẽ tự động xuất hiện trên màn hình này."}
            </p>
          </div>
        )}
      </main>

      {/* 3. BẢNG TỔNG HỢP XUYÊN SUỐT CÁC CHỈ TIÊU ĐÃ BIỂU QUYẾT TRONG KỲ HỌP */}
      {allResults.length > 0 && (
        <footer className="border-t border-slate-800 pt-3 mt-auto">
          <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2 flex items-center gap-2">
            <span>DANH SÁCH XUYÊN SUỐT CÁC CHỈ TIÊU BIỂU QUYẾT TRONG KỲ HỌP:</span>
          </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          {allResults.map((item, index) => {
            const ag = item.agenda;
            if (!ag) return null;
            const isDone = ag.status === 'published';
            const isCurrent = currentAgenda && currentAgenda.id === ag.id;

            return (
              <div
                key={ag.id}
                className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between transition-all ${
                  isCurrent
                    ? 'bg-slate-800 border-yellow-500 ring-2 ring-yellow-400/30'
                    : isDone
                    ? 'bg-slate-900/90 border-slate-700'
                    : 'bg-slate-950/60 border-slate-800 text-slate-500'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-yellow-400">NQ 0{index + 1}</span>
                    {isDone ? (
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        item.is_passed ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {item.is_passed ? 'Đã thông qua' : 'Không thông qua'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">
                        {ag.status === 'voting' ? 'Đang biểu quyết...' : 'Chưa biểu quyết'}
                      </span>
                    )}
                  </div>
                  <p className="font-semibold text-slate-200 line-clamp-2 text-[11px] leading-tight">
                    {ag.title}
                  </p>
                </div>

                {isDone && (
                  <div className="mt-2 pt-1 border-t border-slate-800 text-[10px] text-slate-400 flex justify-between">
                    <span>Tán thành: <b className="text-emerald-400">{item.agree_count}/{item.total_delegates}</b></span>
                    <span>Tỷ lệ: <b className="text-yellow-400">{item.agree_percent_total}%</b></span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </footer>
      )}
    </div>
  );
}
