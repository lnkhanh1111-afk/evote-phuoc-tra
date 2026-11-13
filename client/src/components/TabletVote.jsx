import React, { useState, useEffect } from 'react';
import { socket } from '../socket';
import { CheckCircle2, XCircle, HelpCircle, LogOut, Clock, ShieldCheck, AlertCircle, Wifi } from 'lucide-react';
import NationalEmblem from './NationalEmblem';
import NationalFlag from './NationalFlag';
import { sounds } from '../utils/sound';

export default function TabletVote({ state }) {
  const [selectedDelegateId, setSelectedDelegateId] = useState(() => {
    return localStorage.getItem('evote_delegate_id') || '';
  });
  const [myVote, setMyVote] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [candidateDelegate, setCandidateDelegate] = useState(null);
  const [hasNotifiedVoting, setHasNotifiedVoting] = useState(false);

  const delegates = state.delegates || [];
  const currentDelegate = delegates.find(d => d.id === selectedDelegateId);
  const currentAgenda = state.currentAgenda;
  const votingStatus = state.voting_status; // 'idle' | 'voting' | 'locked' | 'published'
  const timeRemaining = state.time_remaining;

  // Lấy phiếu đã bầu của đại biểu trong chỉ tiêu hiện tại nếu có
  useEffect(() => {
    if (state.results && state.results.delegate_status_list && selectedDelegateId) {
      const myStatus = state.results.delegate_status_list.find(d => d.id === selectedDelegateId);
      if (myStatus && myStatus.has_voted) {
        setMyVote(myStatus.choice);
      } else {
        setMyVote(null);
      }
    }
  }, [state.results, selectedDelegateId, currentAgenda?.id]);

  // Đăng nhập socket khi đã có delegate ID
  useEffect(() => {
    if (selectedDelegateId) {
      socket.emit('delegate_login', { delegateId: selectedDelegateId });
    }
  }, [selectedDelegateId]);

  // Rung máy tính bảng và phát chuông báo khi có phiên biểu quyết mới mở ra
  useEffect(() => {
    if (votingStatus === 'voting' && !hasNotifiedVoting) {
      if ('vibrate' in navigator) {
        try { navigator.vibrate([200, 100, 200]); } catch (e) {}
      }
      sounds.playStartVoting();
      setHasNotifiedVoting(true);
    } else if (votingStatus !== 'voting') {
      setHasNotifiedVoting(false);
    }
  }, [votingStatus, hasNotifiedVoting]);

  // Xử lý chọn đại biểu
  const handleSelectDelegate = (del) => {
    setCandidateDelegate(del);
    // Nếu có mã pin thì mở hộp thoại nhập PIN
    if (del.pin) {
      setPinInput('');
      setPinError('');
      setShowPinModal(true);
    } else {
      loginAs(del.id);
    }
  };

  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (!candidateDelegate) return;
    if (candidateDelegate.pin === pinInput.trim()) {
      loginAs(candidateDelegate.id);
      setShowPinModal(false);
    } else {
      setPinError('Mã PIN không đúng, vui lòng thử lại (hoặc liên hệ Thư ký)');
    }
  };

  const loginAs = (delId) => {
    setSelectedDelegateId(delId);
    localStorage.setItem('evote_delegate_id', delId);
    socket.emit('delegate_login', { delegateId: delId });
  };

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đổi đại biểu đăng nhập trên máy tính bảng này?')) {
      localStorage.removeItem('evote_delegate_id');
      setSelectedDelegateId('');
      setMyVote(null);
    }
  };

  // Đại biểu bấm nút biểu quyết
  const handleVote = (choice) => {
    if (votingStatus !== 'voting') return;
    if (!currentAgenda || !selectedDelegateId) return;

    if ('vibrate' in navigator) {
      try { navigator.vibrate(100); } catch (e) {}
    }
    sounds.playVoteSuccess();

    setMyVote(choice);
    socket.emit('submit_vote', {
      delegateId: selectedDelegateId,
      agendaId: currentAgenda.id,
      choice: choice
    });
  };

  // MÀN HÌNH 1: CHƯA ĐĂNG NHẬP (CHỌN ĐẠI BIỂU)
  if (!currentDelegate) {
    // Nhóm đại biểu theo tổ
    const groupedDelegates = delegates.reduce((acc, del) => {
      const grp = del.group_name || 'Khác';
      if (!acc[grp]) acc[grp] = [];
      acc[grp].push(del);
      return acc;
    }, {});

    return (
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-10">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
          {/* Header Quốc huy & Tên HĐND */}
          <div className="bg-gradient-to-r from-red-800 via-red-700 to-red-800 text-white p-6 md:p-8 text-center shadow-lg relative">
            <div className="flex flex-col items-center justify-center">
              <NationalEmblem size={84} className="mb-3 hover:scale-105 transition-transform" />
              <div className="flex items-center gap-2 mb-1">
                <NationalFlag className="w-5 h-3.5 shadow" />
                <p className="text-xs uppercase tracking-widest text-yellow-300 font-extrabold">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </p>
              </div>
              <h1 className="text-xl md:text-3xl font-black uppercase tracking-wide">
                HỘI ĐỒNG NHÂN DÂN XÃ PHƯỚC TRÀ
              </h1>
              <p className="text-yellow-200 text-xs md:text-sm mt-1 font-semibold">
                Kỳ họp HĐND Khóa XII • Hệ thống Biểu quyết Điện tử Đại biểu
              </p>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-slate-900">
                  Chọn Đại biểu sử dụng thiết bị này:
                </h2>
                <p className="text-xs md:text-sm text-slate-500">
                  Chạm vào họ và tên của Quý đại biểu để vào phiên biểu quyết
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-full border border-emerald-200 w-fit">
                <Wifi className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span className="font-semibold">Hệ thống mạng sẵn sàng</span>
              </div>
            </div>

            <div className="space-y-6">
              {Object.entries(groupedDelegates).map(([groupName, groupDels]) => (
                <div key={groupName} className="space-y-3">
                  <h3 className="text-xs md:text-sm font-bold uppercase text-red-800 tracking-wider bg-red-50 px-3 py-2 rounded-xl border-l-4 border-red-700">
                    {groupName} ({groupDels.length} đại biểu)
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {groupDels.map((del) => (
                      <button
                        key={del.id}
                        type="button"
                        onClick={() => handleSelectDelegate(del)}
                        className="flex items-center p-3.5 bg-slate-50 hover:bg-red-50/80 rounded-2xl border border-slate-200 hover:border-red-400 transition-all text-left shadow-sm active:scale-95"
                      >
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-red-600 to-red-700 text-white font-extrabold flex items-center justify-center shrink-0 mr-3 shadow-sm text-sm">
                          {del.seat_number}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-sm truncate">{del.name}</p>
                          <p className="text-xs text-slate-500 truncate font-medium">{del.title}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Nhập PIN */}
        {showPinModal && candidateDelegate && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95">
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-red-100 text-red-700 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-inner">
                  <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Xác thực Đại biểu</h3>
                <p className="text-base text-red-700 font-extrabold mt-1">{candidateDelegate.name}</p>
                <p className="text-xs text-slate-500">{candidateDelegate.seat_number} • {candidateDelegate.title}</p>
              </div>

              <form onSubmit={handleVerifyPin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 text-center">
                    Nhập mã PIN cá nhân (Mặc định: {candidateDelegate.pin}):
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="••••"
                    autoFocus
                    className="w-full text-center text-3xl tracking-widest font-mono py-2.5 px-4 border-2 border-slate-300 rounded-2xl focus:ring-4 focus:ring-red-100 focus:border-red-600 outline-none transition"
                  />
                  {pinError && <p className="text-xs text-rose-600 mt-2 text-center font-medium">{pinError}</p>}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPinModal(false)}
                    className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-4 bg-red-700 hover:bg-red-800 text-white font-bold rounded-xl text-sm transition shadow-md active:scale-95"
                  >
                    Xác nhận
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // MÀN HÌNH 2: ĐÃ ĐĂNG NHẬP TRÊN TABLET (CHỈ DÀNH CHO BIỂU QUYẾT)
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between pb-6">
      {/* Thanh Header Thông Tin Đại Biểu */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NationalEmblem size={42} className="shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-base md:text-lg">{currentDelegate.name}</span>
                <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg">
                  {currentDelegate.seat_number}
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                  currentDelegate.is_present
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border-rose-300'
                }`}>
                  {currentDelegate.is_present ? '✓ Có mặt' : '✗ Vắng mặt'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {currentDelegate.title} • {currentDelegate.group_name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLogout}
              title="Đổi đại biểu sử dụng máy này"
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-700 bg-slate-100 hover:bg-red-50 px-3 py-2 rounded-xl transition border border-slate-200 font-medium"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Đổi ĐB</span>
            </button>
          </div>
        </div>
      </header>

      {/* Nội dung trung tâm */}
      <main className="max-w-3xl mx-auto px-4 py-6 w-full flex-1 flex flex-col justify-center">
        {/* NỘI DUNG CHỈ TIÊU BIỂU QUYẾT */}
        {currentAgenda ? (
          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 overflow-hidden mb-6 transition-all">
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white px-5 py-3.5 flex items-center justify-between">
              <span className="font-bold text-xs uppercase tracking-wider text-yellow-400 bg-slate-950/60 px-3 py-1 rounded-full border border-yellow-400/30">
                Chỉ tiêu số 0{currentAgenda.order_num}
              </span>
              <span className="font-semibold text-xs text-slate-300">
                {currentAgenda.code}
              </span>
            </div>

            <div className="p-5 md:p-7">
              <h2 className="text-lg md:text-xl font-bold text-slate-900 leading-snug mb-2.5">
                {currentAgenda.title}
              </h2>
              {currentAgenda.description && (
                <p className="text-sm text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 leading-relaxed">
                  {currentAgenda.description}
                </p>
              )}

              {/* KHỐI TRẠNG THÁI BIỂU QUYẾT */}
              <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                {votingStatus === 'voting' && (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-red-100 text-red-700 px-3 py-1.5 rounded-xl font-bold text-sm border border-red-200">
                      <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping"></span>
                      <span>ĐANG MỞ BIỂU QUYẾT</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl font-mono font-bold text-base border border-slate-200">
                      <Clock className="w-4 h-4 text-red-600" />
                      <span>{timeRemaining} giây</span>
                    </div>
                  </div>
                )}

                {votingStatus === 'idle' && (
                  <div className="flex items-center gap-2 text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-medium">
                    <Clock className="w-4 h-4" />
                    <span>Chờ Chủ tọa phát lệnh biểu quyết...</span>
                  </div>
                )}

                {votingStatus === 'locked' && (
                  <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3.5 py-1.5 rounded-xl text-xs font-bold border border-amber-200">
                    <AlertCircle className="w-4 h-4" />
                    <span>ĐÃ KHÓA BIỂU QUYẾT (Đang tổng hợp kết quả)</span>
                  </div>
                )}

                {votingStatus === 'published' && (
                  <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-xl text-xs font-bold border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>KẾT QUẢ ĐÃ ĐƯỢC CÔNG BỐ TRÊN MÀN HÌNH</span>
                  </div>
                )}

                {/* Hiển thị phiếu đã chọn hiện tại */}
                {myVote && (
                  <div className="text-xs font-bold text-slate-600">
                    Phiếu của bạn: {' '}
                    <span className={
                      myVote === 'agree' ? 'text-emerald-600 font-black uppercase' :
                      myVote === 'disagree' ? 'text-rose-600 font-black uppercase' :
                      'text-amber-600 font-black uppercase'
                    }>
                      {myVote === 'agree' ? 'Tán thành' : myVote === 'disagree' ? 'Không tán thành' : 'Không có ý kiến'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 text-center shadow-md border border-slate-200 mb-6">
            <NationalEmblem size={64} className="mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">
              {(!state.agendas || state.agendas.length === 0)
                ? "Chưa có chỉ tiêu biểu quyết nào"
                : "Chờ phiên biểu quyết tiếp theo"}
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              {(!state.agendas || state.agendas.length === 0)
                ? "Kỳ họp hiện chưa có danh mục biểu quyết. Quý đại biểu vui lòng chờ Thư ký cập nhật nội dung."
                : "Chủ tọa chưa mở biểu quyết. Khi có hiệu lệnh, các nút bấm sẽ tự động xuất hiện trên màn hình."}
            </p>
          </div>
        )}

        {/* 3 NÚT BIỂU QUYẾT KHỔNG LỒ DÀNH RIÊNG CHO MÁY TÍNH BẢNG */}
        {votingStatus === 'voting' ? (
          <div className="space-y-4">
            <p className="text-center text-xs font-bold uppercase tracking-wider text-slate-500">
              Chạm vào 1 trong 3 phương án dưới đây để biểu quyết:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Nút TÁN THÀNH */}
              <button
                type="button"
                onClick={() => handleVote('agree')}
                className={`flex flex-col items-center justify-center p-6 rounded-3xl transition-all shadow-lg active:scale-95 border-4 min-h-[140px] ${
                  myVote === 'agree'
                    ? 'bg-emerald-600 text-white border-emerald-400 ring-4 ring-emerald-300 shadow-emerald-200 scale-102'
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white border-transparent'
                }`}
              >
                <CheckCircle2 className="w-12 h-12 mb-2 stroke-[2.5]" />
                <span className="text-xl md:text-2xl font-black uppercase tracking-wide">
                  TÁN THÀNH
                </span>
                <span className="text-xs text-emerald-100 font-medium mt-1">
                  (Đồng ý thông qua)
                </span>
                {myVote === 'agree' && (
                  <span className="mt-2 text-xs bg-white text-emerald-800 font-bold px-3 py-1 rounded-full shadow">
                    ✓ Đã chọn phương án này
                  </span>
                )}
              </button>

              {/* Nút KHÔNG TÁN THÀNH */}
              <button
                type="button"
                onClick={() => handleVote('disagree')}
                className={`flex flex-col items-center justify-center p-6 rounded-3xl transition-all shadow-lg active:scale-95 border-4 min-h-[140px] ${
                  myVote === 'disagree'
                    ? 'bg-rose-600 text-white border-rose-400 ring-4 ring-rose-300 shadow-rose-200 scale-102'
                    : 'bg-rose-500 hover:bg-rose-600 text-white border-transparent'
                }`}
              >
                <XCircle className="w-12 h-12 mb-2 stroke-[2.5]" />
                <span className="text-xl md:text-2xl font-black uppercase tracking-wide">
                  KHÔNG TÁN THÀNH
                </span>
                <span className="text-xs text-rose-100 font-medium mt-1">
                  (Không đồng ý)
                </span>
                {myVote === 'disagree' && (
                  <span className="mt-2 text-xs bg-white text-rose-800 font-bold px-3 py-1 rounded-full shadow">
                    ✓ Đã chọn phương án này
                  </span>
                )}
              </button>

              {/* Nút KHÔNG CÓ Ý KIẾN */}
              <button
                type="button"
                onClick={() => handleVote('neutral')}
                className={`flex flex-col items-center justify-center p-6 rounded-3xl transition-all shadow-lg active:scale-95 border-4 min-h-[140px] ${
                  myVote === 'neutral'
                    ? 'bg-amber-500 text-white border-amber-300 ring-4 ring-amber-200 shadow-amber-200 scale-102'
                    : 'bg-amber-400 hover:bg-amber-500 text-slate-900 border-transparent'
                }`}
              >
                <HelpCircle className="w-12 h-12 mb-2 stroke-[2.5]" />
                <span className="text-xl md:text-2xl font-black uppercase tracking-wide">
                  KHÔNG Ý KIẾN
                </span>
                <span className="text-xs font-medium mt-1">
                  (Chưa có ý kiến)
                </span>
                {myVote === 'neutral' && (
                  <span className="mt-2 text-xs bg-slate-900 text-white font-bold px-3 py-1 rounded-full shadow">
                    ✓ Đã chọn phương án này
                  </span>
                )}
              </button>
            </div>

            {myVote && (
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3 text-center text-xs text-emerald-800 font-semibold animate-in fade-in">
                Đã ghi nhận phiếu biểu quyết thành công! Quý đại biểu có thể bấm chọn phương án khác trước khi hết thời gian đếm ngược.
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 text-center shadow-sm">
            {votingStatus === 'idle' && (
              <div className="py-4">
                <Clock className="w-10 h-10 text-amber-500 mx-auto mb-2" />
                <h4 className="font-bold text-slate-800 text-base">Hệ thống đang sẵn sàng</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Khi Chủ tọa mở biểu quyết, các nút chọn sẽ tự động xuất hiện trên màn hình máy tính bảng của Quý đại biểu.
                </p>
              </div>
            )}

            {votingStatus === 'locked' && (
              <div className="py-4">
                <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-bold text-slate-800 text-base">Thời gian biểu quyết đã kết thúc</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Hệ thống đã khóa tiếp nhận phiếu và đang tổng hợp kết quả để công bố.
                </p>
                {myVote && (
                  <p className="mt-3 text-sm font-bold text-slate-700 bg-slate-50 inline-block px-4 py-2 rounded-xl border border-slate-200">
                    Phiếu biểu quyết của bạn:{' '}
                    <span className="text-red-700 uppercase">
                      {myVote === 'agree' ? 'Tán thành' : myVote === 'disagree' ? 'Không tán thành' : 'Không có ý kiến'}
                    </span>
                  </p>
                )}
              </div>
            )}

            {votingStatus === 'published' && state.results && (
              <div className="py-4">
                <h4 className="font-bold text-slate-800 text-base mb-2">Kết quả biểu quyết vừa qua:</h4>
                <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto text-center my-3">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5">
                    <p className="text-xs font-bold text-emerald-800">Tán thành</p>
                    <p className="text-lg font-black text-emerald-700">{state.results.agree_count}</p>
                    <p className="text-[11px] text-emerald-600">({state.results.agree_percent_present}%)</p>
                  </div>
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5">
                    <p className="text-xs font-bold text-rose-800">K.Tán thành</p>
                    <p className="text-lg font-black text-rose-700">{state.results.disagree_count}</p>
                    <p className="text-[11px] text-rose-600">({state.results.disagree_percent_present}%)</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5">
                    <p className="text-xs font-bold text-amber-800">Không ý kiến</p>
                    <p className="text-lg font-black text-amber-700">{state.results.neutral_count}</p>
                    <p className="text-[11px] text-amber-600">({state.results.neutral_percent_present}%)</p>
                  </div>
                </div>

                <div className="mt-2">
                  <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                    state.results.is_passed ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'
                  }`}>
                    {state.results.is_passed ? '★ NGHỊ QUYẾT ĐÃ ĐƯỢC THÔNG QUA ★' : 'CHƯA ĐỦ TỶ LỆ THÔNG QUA'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer nhỏ gọn */}
      <footer className="text-center text-xs text-slate-400">
        HĐND Xã Phước Trà • Thiết bị biểu quyết điện tử đại biểu
      </footer>
    </div>
  );
}
