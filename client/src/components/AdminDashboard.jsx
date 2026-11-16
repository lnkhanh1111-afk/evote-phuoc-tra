import React, { useState, useEffect, useRef } from 'react';
import { socket, API_URL } from '../socket';
import {
  Play, Square, Plus, RotateCcw, Eye, Sparkles, Users, CheckCircle,
  XCircle, Clock, FileText, Check, Settings, Shield, PlusCircle, Trash2, Edit3, Printer, Tv, Tablet,
  Download, Upload
} from 'lucide-react';
import NationalEmblem from './NationalEmblem';
import NationalFlag from './NationalFlag';

export default function AdminDashboard({ state, refreshState }) {
  const [activeTab, setActiveTab] = useState('controller'); // 'controller' | 'agendas' | 'delegates' | 'report'
  const [durationInput, setDurationInput] = useState(30);
  const [isSimulating, setIsSimulating] = useState(false);

  // Form thêm chỉ tiêu
  const [showAddAgendaModal, setShowAddAgendaModal] = useState(false);
  const [newAgenda, setNewAgenda] = useState({
    title: '',
    code: '',
    description: '',
    default_duration: 30,
    required_ratio: 0.5
  });

  // Form thêm đại biểu
  const [showAddDelegateModal, setShowAddDelegateModal] = useState(false);
  const [newDelegate, setNewDelegate] = useState({
    name: '',
    seat_number: '',
    title: 'Đại biểu HĐND',
    group_name: 'Tổ đại biểu số 1',
    pin: ''
  });

  // Form sửa thông tin kỳ họp / cuộc họp
  const [showEditSessionModal, setShowEditSessionModal] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [dbStatus, setDbStatus] = useState({ isCloudConnected: false, storageType: 'Cục bộ' });
  const fileInputRef = useRef(null);
  const [sessionForm, setSessionForm] = useState({
    name: '',
    total_delegates: 25,
    location: '',
    date: ''
  });

  // Kiểm tra tình trạng kết nối Database (tự động polling mỗi 15s)
  useEffect(() => {
    const fetchStatus = () => {
      fetch(`${API_URL}/api/database-status`)
        .then(res => res.json())
        .then(data => setDbStatus(data))
        .catch(() => {});
    };
    fetchStatus();
    const timer = setInterval(fetchStatus, 15000);
    return () => clearInterval(timer);
  }, []);

  const session = state.session;

  // Tự động đồng bộ form với thông tin kỳ họp mới nhất từ server
  useEffect(() => {
    if (state.session) {
      setSessionForm({
        name: state.session.name || '',
        total_delegates: state.session.total_delegates || 25,
        location: state.session.location || '',
        date: state.session.date || ''
      });
    }
  }, [state.session?.name, state.session?.total_delegates, state.session?.location, state.session?.date]);

  const handleOpenEditSession = () => {
    if (session) {
      setSessionForm({
        name: session.name || '',
        total_delegates: session.total_delegates || 25,
        location: session.location || '',
        date: session.date || ''
      });
    }
    setShowEditSessionModal(true);
  };

  const handleSaveSession = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const payload = {
      name: String(sessionForm.name || '').trim(),
      total_delegates: parseInt(sessionForm.total_delegates, 10) || 25,
      location: String(sessionForm.location || '').trim(),
      date: String(sessionForm.date || '').trim()
    };

    // 1. Phát qua WebSocket ngay lập tức (phản hồi < 50ms tới toàn bộ máy tính bảng & màn hình LED)
    socket.emit('admin_update_session', payload);

    // 2. Gửi qua REST API dự phòng
    try {
      await fetch(`${API_URL}/api/session/active`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('REST save fallback:', err);
    }

    if (refreshState) refreshState();
    setShowEditSessionModal(false);
    setSaveSuccessMsg('✓ Đã cập nhật thành công Tên cuộc họp và Số lượng đại biểu!');
    setTimeout(() => setSaveSuccessMsg(''), 5000);
  };
  const currentAgenda = state.currentAgenda;
  const results = state.results;
  const agendas = state.agendas || [];
  const delegates = state.delegates || [];
  const votingStatus = state.voting_status; // 'idle' | 'voting' | 'locked' | 'published'
  const timeRemaining = state.time_remaining;

  // 1. Actions điều khiển đa kênh (Vừa bắn WebSocket tức thì <20ms, vừa gọi REST API dự phòng)
  const handleSelectAgenda = async (agendaId) => {
    socket.emit('admin_select_agenda', { agendaId });
    try {
      await fetch(`${API_URL}/api/voting/select-agenda`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agendaId })
      });
    } catch (e) {}
    if (refreshState) refreshState();
  };

  const handleStartVoting = async () => {
    if (!currentAgenda) return alert('Vui lòng chọn chỉ tiêu biểu quyết trước');
    socket.emit('admin_start_voting', {
      agendaId: currentAgenda.id,
      duration: durationInput
    });
    try {
      await fetch(`${API_URL}/api/voting/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agendaId: currentAgenda.id, duration: durationInput })
      });
    } catch (e) {}
    if (refreshState) refreshState();
  };

  const handleLockVoting = async () => {
    socket.emit('admin_lock_voting');
    try {
      await fetch(`${API_URL}/api/voting/lock`, { method: 'POST' });
    } catch (e) {}
    if (refreshState) refreshState();
  };

  const handleExtendVoting = async () => {
    socket.emit('admin_extend_time', { seconds: 15 });
    try {
      await fetch(`${API_URL}/api/voting/extend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seconds: 15 })
      });
    } catch (e) {}
    if (refreshState) refreshState();
  };

  const handlePublishResults = async () => {
    socket.emit('admin_publish_results');
    try {
      await fetch(`${API_URL}/api/voting/publish`, { method: 'POST' });
    } catch (e) {}
    if (refreshState) refreshState();
  };

  const handleResetAgenda = async () => {
    if (!currentAgenda) return;
    if (window.confirm(`Xác nhận xóa phiếu và cho biểu quyết lại chỉ tiêu "${currentAgenda.title}"?`)) {
      socket.emit('admin_reset_agenda', { agendaId: currentAgenda.id });
      try {
        await fetch(`${API_URL}/api/voting/reset`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agendaId: currentAgenda.id })
        });
      } catch (e) {}
      if (refreshState) refreshState();
    }
  };

  // Giả lập biểu quyết tự động để test hệ thống
  const handleSimulateVotes = async () => {
    try {
      setIsSimulating(true);
      const res = await fetch(`${API_URL}/api/simulator/auto-vote`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) alert(data.error || 'Có lỗi khi chạy simulator');
      if (refreshState) refreshState();
    } catch (e) {
      alert('Không kết nối được server simulator: ' + e.message);
    } finally {
      setIsSimulating(false);
    }
  };

  // Reset toàn bộ dữ liệu mẫu
  const handleResetAllData = async () => {
    if (window.confirm('CẢNH BÁO: Khôi phục toàn bộ dữ liệu kỳ họp về mặc định ban đầu?')) {
      await fetch(`${API_URL}/api/reset-all`, { method: 'POST' });
      if (refreshState) refreshState();
    }
  };

  // Sao lưu toàn bộ dữ liệu ra file JSON tải về máy
  const handleBackup = () => {
    window.open(`${API_URL}/api/backup`, '_blank');
  };

  // Nạp dữ liệu từ file sao lưu JSON
  const handleRestoreFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const jsonData = JSON.parse(event.target.result);
        if (window.confirm(`Xác nhận nạp file "${file.name}" để khôi phục toàn bộ dữ liệu kỳ họp?`)) {
          const res = await fetch(`${API_URL}/api/restore`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonData)
          });
          const result = await res.json();
          if (res.ok) {
            setSaveSuccessMsg('Khôi phục dữ liệu kỳ họp từ file sao lưu thành công!');
            if (refreshState) refreshState();
          } else {
            alert(result.error || 'Lỗi khôi phục');
          }
        }
      } catch (err) {
        alert('File không hợp lệ: ' + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Toggle điểm danh đại biểu
  const handleTogglePresent = async (delId) => {
    socket.emit('admin_toggle_present', { delegateId: delId });
    try {
      await fetch(`${API_URL}/api/delegates/${delId}/toggle-present`, { method: 'POST' });
    } catch (e) {}
    if (refreshState) refreshState();
  };

  // Thêm chỉ tiêu mới
  const handleCreateAgenda = async (e) => {
    e.preventDefault();
    if (!newAgenda.title) return alert('Vui lòng nhập tên chỉ tiêu');
    socket.emit('admin_create_agenda', newAgenda);
    try {
      await fetch(`${API_URL}/api/agendas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAgenda)
      });
    } catch (e) {}
    setShowAddAgendaModal(false);
    setNewAgenda({ title: '', code: '', description: '', default_duration: 30, required_ratio: 0.5 });
    if (refreshState) refreshState();
  };

  // Xóa chỉ tiêu
  const handleDeleteAgenda = async (id) => {
    if (window.confirm('Xác nhận xóa chỉ tiêu này khỏi danh mục?')) {
      socket.emit('admin_delete_agenda', { agendaId: id });
      try {
        await fetch(`${API_URL}/api/agendas/${id}`, { method: 'DELETE' });
      } catch (e) {}
      if (refreshState) refreshState();
    }
  };

  // Thêm đại biểu mới
  const handleCreateDelegate = async (e) => {
    e.preventDefault();
    if (!newDelegate.name) return alert('Vui lòng nhập tên đại biểu');
    socket.emit('admin_create_delegate', newDelegate);
    try {
      await fetch(`${API_URL}/api/delegates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDelegate)
      });
    } catch (e) {}
    setShowAddDelegateModal(false);
    setNewDelegate({ name: '', seat_number: '', title: 'Đại biểu HĐND', group_name: 'Tổ đại biểu số 1', pin: '' });
    if (refreshState) refreshState();
  };

  // Xóa đại biểu
  const handleDeleteDelegate = async (id) => {
    if (window.confirm('Xác nhận xóa đại biểu này khỏi danh sách?')) {
      socket.emit('admin_delete_delegate', { delegateId: id });
      try {
        await fetch(`${API_URL}/api/delegates/${id}`, { method: 'DELETE' });
      } catch (e) {}
      if (refreshState) refreshState();
    }
  };

  const totalDelegatesCount = session?.total_delegates || (delegates.length > 0 ? delegates.length : 25);
  const presentCount = delegates.filter(d => d.is_present).length;
  const absentCount = Math.max(0, totalDelegatesCount - presentCount);
  const onlineCount = delegates.filter(d => d.is_online).length;

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* THANH HEADER ĐIỀU HÀNH */}
        <header className="bg-white rounded-3xl shadow-sm border border-slate-200 p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <NationalEmblem size={60} className="hidden sm:block shrink-0" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <NationalFlag className="w-4 h-3 shadow-sm" />
                <span className="bg-red-700 text-white text-[11px] font-black uppercase px-2.5 py-0.5 rounded">
                  BÀN ĐIỀU HÀNH THƯ KÝ / CHỦ TỌA
                </span>
                <span className="text-xs text-slate-500 font-semibold">HĐND XÃ PHƯỚC TRÀ</span>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all ${
                    dbStatus.isCloudConnected
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-amber-50 text-amber-700 border-amber-300'
                  }`}
                  title={
                    dbStatus.isCloudConnected
                      ? `Đang lưu trữ trực tiếp trên ${dbStatus.storageType || 'Cloud'}, dữ liệu vĩnh viễn không bao giờ mất`
                      : 'Đang lưu trữ cục bộ file database.json trên máy chủ Render (có thể bị reset nếu server khởi động lại)'
                  }
                >
                  {dbStatus.isCloudConnected ? `☁️ ${dbStatus.storageType || 'Cloud: Đã kết nối'}` : '💾 Lưu trữ: Cục bộ'}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 mt-1.5">
                <h1 className="text-xl md:text-2xl font-black text-slate-900">
                  {session?.name || "Kỳ họp Hội đồng nhân dân xã Phước Trà"}
                </h1>
                <button
                  onClick={handleOpenEditSession}
                  className="flex items-center gap-1.5 text-xs bg-red-50 hover:bg-red-100 text-red-700 font-bold px-3 py-1.5 rounded-xl border border-red-200 transition shadow-sm active:scale-95"
                  title="Sửa tên cuộc họp và tổng số đại biểu triệu tập"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Sửa Tên & Số ĐB Triệu Tập</span>
                </button>
              </div>

              <p className="text-xs text-slate-500 mt-1">
                Tổng số ĐB triệu tập: <b className="text-slate-800 text-sm font-mono">{totalDelegatesCount} ĐB</b> | Có mặt: <b className="text-emerald-700 text-sm font-mono">{presentCount} ĐB</b> | Vắng mặt: <b className="text-rose-700 text-sm font-mono">{absentCount} ĐB</b> | Tablet Online: <b className="text-blue-700 text-sm font-mono">{onlineCount}</b>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Nút mở các màn hình riêng biệt sang Tab mới */}
            <a
              href="#screen"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-white bg-slate-100 hover:bg-slate-900 px-3 py-2.5 rounded-xl transition border border-slate-200 font-bold shadow-sm"
              title="Mở màn hình trình chiếu LED trong tab mới"
            >
              <Tv className="w-3.5 h-3.5 text-red-600" />
              <span>Màn Hình LED</span>
            </a>

            <a
              href="#tablet"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-slate-700 hover:text-white bg-slate-100 hover:bg-slate-900 px-3 py-2.5 rounded-xl transition border border-slate-200 font-bold shadow-sm"
              title="Mở giao diện biểu quyết đại biểu trong tab mới"
            >
              <Tablet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Giao Diện ĐB</span>
            </a>

            <button
              onClick={handleSimulateVotes}
              disabled={isSimulating || !currentAgenda}
              title="Mô phỏng toàn bộ đại biểu bấm biểu quyết ngay lập tức để kiểm tra hệ thống"
              className="flex items-center gap-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs px-3.5 py-2.5 rounded-xl transition shadow-sm active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span>{isSimulating ? 'Đang giả lập...' : 'Giả Lập Biểu Quyết (Test)'}</span>
            </button>

            {/* Input file ẩn phục vụ khôi phục JSON */}
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleRestoreFile}
              className="hidden"
            />

            <button
              onClick={handleBackup}
              title="Tải về file sao lưu (.json) toàn bộ dữ liệu cuộc họp, chỉ tiêu và phiếu bầu"
              className="flex items-center gap-1.5 text-xs text-blue-700 hover:text-white bg-blue-50 hover:bg-blue-600 px-3 py-2.5 rounded-xl transition border border-blue-200 font-bold shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sao Lưu JSON</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              title="Nạp file (.json) đã sao lưu để khôi phục lại dữ liệu kỳ họp khi cần"
              className="flex items-center gap-1.5 text-xs text-emerald-700 hover:text-white bg-emerald-50 hover:bg-emerald-600 px-3 py-2.5 rounded-xl transition border border-emerald-200 font-bold shadow-sm"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Khôi Phục JSON</span>
            </button>

            <button
              onClick={handleResetAllData}
              title="Khôi phục dữ liệu ban đầu"
              className="flex items-center gap-1 text-xs text-slate-600 hover:text-red-700 bg-slate-100 hover:bg-slate-200 px-3 py-2.5 rounded-xl transition border border-slate-200 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Mẫu</span>
            </button>
          </div>
        </header>

        {/* THÔNG BÁO LƯU THÀNH CÔNG */}
        {saveSuccessMsg && (
          <div className="bg-emerald-600 text-white font-bold px-5 py-3.5 rounded-2xl shadow-lg flex items-center justify-between animate-in fade-in zoom-in-95 border-2 border-emerald-400">
            <div className="flex items-center gap-2.5">
              <CheckCircle className="w-5 h-5 text-yellow-300" />
              <span className="text-sm">{saveSuccessMsg}</span>
            </div>
            <button
              onClick={() => setSaveSuccessMsg('')}
              className="text-white hover:text-emerald-200 font-bold text-sm px-2 py-1 rounded-lg"
            >
              ✕
            </button>
          </div>
        )}

        {/* TABS ĐIỀU HƯỚNG */}
        <div className="flex border-b border-slate-200 bg-white rounded-t-2xl px-4 pt-2 gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('controller')}
            className={`py-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'controller'
                ? 'border-red-600 text-red-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>1. Bàn Biểu Quyết Trực Tiếp</span>
          </button>

          <button
            onClick={() => setActiveTab('session_info')}
            className={`py-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'session_info'
                ? 'border-red-600 text-red-700 bg-red-50/50'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-4 h-4 text-red-600" />
            <span>2. Sửa Tên Cuộc Họp & Số ĐB Triệu Tập</span>
          </button>

          <button
            onClick={() => setActiveTab('agendas')}
            className={`py-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'agendas'
                ? 'border-red-600 text-red-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>3. Danh Mục Chỉ Tiêu ({agendas.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('delegates')}
            className={`py-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'delegates'
                ? 'border-red-600 text-red-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>4. Đại Biểu & Điểm Danh ({delegates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className={`py-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'report'
                ? 'border-red-600 text-red-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Printer className="w-4 h-4" />
            <span>5. Biên Bản Kiểm Phiếu & In Ấn</span>
          </button>
        </div>

        {/* TAB 1: ĐIỀU KHIỂN BIỂU QUYẾT TRỰC TIẾP */}
        {activeTab === 'controller' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cột Trái (2/3): Bàn điều khiển chỉ tiêu hiện tại */}
            <div className="lg:col-span-2 space-y-6">
              {/* KHỐI TÓM TẮT THÔNG TIN CUỘC HỌP & NÚT SỬA NHANH */}
              <div className="bg-gradient-to-r from-red-800 to-red-900 text-white p-4 md:p-5 rounded-2xl shadow-sm border border-red-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-widest text-yellow-300 font-black bg-red-950/60 px-2 py-0.5 rounded">
                      THÔNG TIN CUỘC HỌP
                    </span>
                    <span className="text-xs text-yellow-200">
                      Địa điểm: <b>{session?.location || 'UBND xã Phước Trà'}</b>
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white leading-snug mt-1">
                    {session?.name || "Kỳ họp Hội đồng nhân dân"}
                  </h3>
                  <p className="text-xs text-yellow-200 mt-0.5">
                    Tổng số đại biểu triệu tập: <b className="text-white font-mono text-sm underline decoration-yellow-400 underline-offset-2">{session?.total_delegates || 25} đại biểu</b> • Tỷ lệ quá bán pháp lý: &gt; 50% ({Math.floor((session?.total_delegates || 25) / 2) + 1} phiếu tán thành)
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('session_info')}
                  className="flex items-center justify-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-black text-xs px-4 py-2.5 rounded-xl shadow transition shrink-0 active:scale-95"
                  title="Nhấn để sửa tên cuộc họp và số đại biểu"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Sửa Tên & Số ĐB</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                  <h2 className="text-base font-bold text-slate-800 uppercase tracking-wide flex items-center gap-2">
                    <span>Chỉ tiêu đang chọn:</span>
                  </h2>

                  {agendas.length > 0 ? (
                    <select
                      value={currentAgenda?.id || ''}
                      onChange={(e) => handleSelectAgenda(e.target.value)}
                      className="text-sm font-bold text-slate-800 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-red-600 max-w-xs truncate"
                    >
                      {agendas.map((ag) => (
                        <option key={ag.id} value={ag.id}>
                          {ag.code} - {ag.title}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-xs text-rose-600 font-bold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                      Chưa có chỉ tiêu nào
                    </span>
                  )}
                </div>

                {currentAgenda ? (
                  <div>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
                      <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
                        <span className="text-red-700 uppercase">{currentAgenda.code}</span>
                        <span>Thời lượng đề xuất: {currentAgenda.default_duration} giây</span>
                      </div>
                      <h3 className="text-lg font-extrabold text-slate-900 leading-snug">
                        {currentAgenda.title}
                      </h3>
                      {currentAgenda.description && (
                        <p className="text-xs text-slate-600 mt-2">{currentAgenda.description}</p>
                      )}
                    </div>

                    {/* TRẠNG THÁI & CÁC NÚT ĐIỀU KHIỂN */}
                    <div className="space-y-4">
                      {/* Trạng thái hiện tại */}
                      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-900 text-white rounded-xl">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-slate-400 uppercase font-bold">Trạng thái:</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                            votingStatus === 'voting' ? 'bg-red-600 text-white animate-pulse' :
                            votingStatus === 'locked' ? 'bg-amber-500 text-slate-950' :
                            votingStatus === 'published' ? 'bg-emerald-500 text-white' :
                            'bg-slate-700 text-slate-300'
                          }`}>
                            {votingStatus === 'voting' ? 'Đang mở biểu quyết' :
                             votingStatus === 'locked' ? 'Đã khóa biểu quyết' :
                             votingStatus === 'published' ? 'Đã công bố kết quả' : 'Chờ bắt đầu'}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 font-mono">
                          <Clock className="w-4 h-4 text-yellow-400" />
                          <span className="text-xl font-black text-yellow-400">{timeRemaining}s</span>
                        </div>
                      </div>

                      {/* Hàng nút tác vụ chính */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {/* 1. Nút BẮT ĐẦU */}
                        <button
                          type="button"
                          onClick={handleStartVoting}
                          disabled={votingStatus === 'voting'}
                          className="flex flex-col items-center justify-center p-3.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-extrabold rounded-xl shadow transition active:scale-95"
                        >
                          <Play className="w-5 h-5 mb-1 fill-white" />
                          <span className="text-xs uppercase">Bắt Đầu Biểu Quyết</span>
                        </button>

                        {/* 2. Nút KHÓA */}
                        <button
                          type="button"
                          onClick={handleLockVoting}
                          disabled={votingStatus !== 'voting'}
                          className="flex flex-col items-center justify-center p-3.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-extrabold rounded-xl shadow transition active:scale-95"
                        >
                          <Square className="w-5 h-5 mb-1 fill-white" />
                          <span className="text-xs uppercase">Khóa Biểu Quyết</span>
                        </button>

                        {/* 3. Nút +15s GIA HẠN */}
                        <button
                          type="button"
                          onClick={handleExtendVoting}
                          disabled={votingStatus !== 'voting'}
                          className="flex flex-col items-center justify-center p-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold rounded-xl shadow transition active:scale-95"
                        >
                          <Plus className="w-5 h-5 mb-1" />
                          <span className="text-xs uppercase">Gia Hạn +15s</span>
                        </button>

                        {/* 4. Nút CÔNG BỐ KẾT QUẢ */}
                        <button
                          type="button"
                          onClick={handlePublishResults}
                          className="flex flex-col items-center justify-center p-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow transition active:scale-95"
                        >
                          <Eye className="w-5 h-5 mb-1" />
                          <span className="text-xs uppercase">Công Bố Kết Quả</span>
                        </button>
                      </div>

                      {/* Tùy chỉnh đếm ngược & Reset */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        <div className="flex items-center gap-2">
                          <label className="text-xs font-bold text-slate-600">Thời gian (giây):</label>
                          <div className="flex gap-1.5">
                            {[15, 30, 45, 60].map((sec) => (
                              <button
                                key={sec}
                                onClick={() => setDurationInput(sec)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                  durationInput === sec ? 'bg-red-700 text-white' : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {sec}s
                              </button>
                            ))}
                          </div>
                        </div>

                        <button
                          onClick={handleResetAgenda}
                          className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Biểu quyết lại chỉ tiêu này</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="py-10 text-center space-y-3 bg-slate-50/60 rounded-2xl border border-dashed border-slate-300 p-6 my-2">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                    <h3 className="text-base font-bold text-slate-800">
                      {agendas.length === 0 ? "Chưa có Chỉ Tiêu / Dự Thảo Nghị Quyết nào" : "Chưa chọn chỉ tiêu biểu quyết"}
                    </h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      {agendas.length === 0
                        ? "Hiện tại kỳ họp chưa có nội dung biểu quyết nào. Nhấn nút bên dưới để thêm dự thảo Nghị quyết đầu tiên."
                        : "Vui lòng chọn 1 chỉ tiêu từ danh sách phía trên để mở phiên biểu quyết cho đại biểu."}
                    </p>
                    {agendas.length === 0 && (
                      <button
                        type="button"
                        onClick={() => setShowAddAgendaModal(true)}
                        className="inline-flex items-center gap-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow transition"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>Thêm Chỉ Tiêu Biểu Quyết Đầu Tiên</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* BẢNG THEO DÕI THỜI GIAN THỰC TỪNG ĐẠI BIỂU (GIÁM SÁT TIẾN ĐỘ) */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm uppercase">
                      Giám sát đại biểu biểu quyết ({results?.total_voted || 0}/{results?.present_delegates || 0} ĐB đã bấm)
                    </h3>
                    <p className="text-xs text-slate-500">Màu xanh: Đã bấm | Màu xám: Chưa bấm | Chấm xanh: Đang online</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                  {results?.delegate_status_list?.map((d) => (
                    <div
                      key={d.id}
                      className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between transition-all ${
                        !d.is_present
                          ? 'bg-slate-100 border-slate-200 text-slate-400 opacity-60'
                          : d.has_voted
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-sm'
                          : votingStatus === 'voting'
                          ? 'bg-rose-50 border-rose-200 text-rose-900 animate-pulse'
                          : 'bg-slate-50 border-slate-200 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-black text-[11px]">{d.seat_number}</span>
                        <div className="flex items-center gap-1">
                          {d.is_online && (
                            <span className="w-2 h-2 bg-emerald-500 rounded-full" title="Tablet đang kết nối"></span>
                          )}
                          {d.has_voted ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                          ) : (
                            <span className="text-[10px] text-slate-400">Chưa</span>
                          )}
                        </div>
                      </div>
                      <p className="font-bold text-[11px] truncate">{d.name}</p>
                      <div className="mt-1 text-[10px] font-semibold">
                        {!d.is_present ? (
                          <span className="text-slate-400">Vắng</span>
                        ) : d.has_voted ? (
                          <span className="text-emerald-700">Đã biểu quyết</span>
                        ) : (
                          <span className="text-rose-600">Chưa biểu quyết</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Cột Phải (1/3): Thống kê kết quả nhanh */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-800 text-sm uppercase mb-4 pb-2 border-b border-slate-100">
                  Kết Quả Biểu Quyết
                </h3>

                {results ? (
                  <div className="space-y-4">
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <div className="flex justify-between items-center text-xs font-bold text-emerald-800">
                        <span>TÁN THÀNH:</span>
                        <span className="text-base font-black text-emerald-700 font-mono">
                          {results.agree_count} ({results.agree_percent_present}%)
                        </span>
                      </div>
                      <p className="text-[10px] text-emerald-600 mt-0.5">
                        Tỷ lệ trên tổng triệu tập: <b>{results.agree_percent_total}%</b>
                      </p>
                    </div>

                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl">
                      <div className="flex justify-between items-center text-xs font-bold text-rose-800">
                        <span>KHÔNG TÁN THÀNH:</span>
                        <span className="text-base font-black text-rose-700 font-mono">
                          {results.disagree_count} ({results.disagree_percent_present}%)
                        </span>
                      </div>
                    </div>

                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                      <div className="flex justify-between items-center text-xs font-bold text-amber-800">
                        <span>KHÔNG Ý KIẾN:</span>
                        <span className="text-base font-black text-amber-700 font-mono">
                          {results.neutral_count} ({results.neutral_percent_present}%)
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Chưa biểu quyết:</span>
                        <b className="font-mono">{results.not_voted_count} ĐB</b>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tổng số đại biểu có mặt:</span>
                        <b className="font-mono">{results.present_delegates} ĐB</b>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Tổng số đại biểu triệu tập:</span>
                        <b className="font-mono">{results.total_delegates} ĐB</b>
                      </div>
                    </div>

                    {/* Đánh giá pháp lý HĐND */}
                    <div className={`p-4 rounded-xl text-center font-bold text-xs ${
                      results.is_passed ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                    }`}>
                      {results.is_passed ? '✓ ĐỦ ĐIỀU KIỆN THÔNG QUA (QUÁ BÁN)' : '✗ CHƯA ĐẠT QUÁ NỬA TỔNG SỐ ĐB'}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 text-center py-4">Chưa có kết quả</p>
                )}
              </div>

              {/* Hướng dẫn nhanh cho thư ký */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 text-xs text-slate-600 space-y-2">
                <p className="font-bold text-slate-800 uppercase">Quy trình điều hành chuẩn:</p>
                <ol className="list-decimal pl-4 space-y-1.5 leading-relaxed">
                  <li>Thư ký chọn nội dung chỉ tiêu cần biểu quyết.</li>
                  <li>Chủ tọa tuyên bố mở biểu quyết, thư ký bấm <b>"Bắt đầu biểu quyết"</b>.</li>
                  <li>Theo dõi trên màn hình giám sát, khi đại biểu biểu quyết đủ hoặc hết giờ, hệ thống tự khóa.</li>
                  <li>Bấm <b>"Công bố kết quả"</b> để đẩy dữ liệu lên màn hình hội trường.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: THIẾT LẬP TÊN CUỘC HỌP & TỔNG SỐ ĐẠI BIỂU TRIỆU TẬP */}
        {activeTab === 'session_info' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 space-y-6 max-w-4xl mx-auto animate-in fade-in">
            <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <Settings className="w-6 h-6 text-red-700" />
                  <span>Cài Đặt Thông Tin Kỳ Họp & Số Lượng Đại Biểu</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Chỉnh sửa tên cuộc họp và tổng số đại biểu triệu tập theo luật. Dữ liệu sẽ tự động đồng bộ ngay lập tức lên Màn hình LED và Tablet đại biểu.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveSession} className="space-y-6">
              {/* 1. TÊN KỲ HỌP / CUỘC HỌP */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                <label className="block text-sm font-black text-slate-900 uppercase tracking-wide">
                  1. Tên Kỳ Họp / Cuộc Họp (*):
                </label>
                <textarea
                  rows={3}
                  required
                  value={sessionForm.name}
                  onChange={(e) => setSessionForm({ ...sessionForm, name: e.target.value })}
                  placeholder="VD: Kỳ họp thứ 8 (Kỳ họp thường lệ) - HĐND xã Phước Trà Khóa XII, Nhiệm kỳ 2021 - 2026"
                  className="w-full text-base font-bold text-slate-900 p-3.5 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-red-600 shadow-sm leading-snug"
                />
                <p className="text-xs text-slate-500 italic">
                  * Tên này sẽ xuất hiện trang trọng ở phần đầu Màn hình LED hội trường và trên đầu máy tính bảng của tất cả đại biểu.
                </p>
              </div>

              {/* 2. TỔNG SỐ ĐẠI BIỂU TRIỆU TẬP */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="block text-sm font-black text-slate-900 uppercase tracking-wide">
                    2. Tổng Số Đại Biểu Triệu Tập Theo Luật (*):
                  </label>
                  <span className="text-xs bg-red-100 text-red-800 font-bold px-3 py-1 rounded-full border border-red-200">
                    Cơ sở pháp lý tính tỷ lệ quá bán (&gt; 50%)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    required
                    value={sessionForm.total_delegates}
                    onChange={(e) => setSessionForm({ ...sessionForm, total_delegates: e.target.value })}
                    className="w-36 text-center text-3xl font-black font-mono text-red-700 p-3 bg-white border-2 border-red-500 rounded-2xl outline-none focus:ring-4 focus:ring-red-200 shadow-sm"
                  />
                  <span className="text-base font-bold text-slate-700">Đại biểu HĐND</span>

                  <div className="flex items-center gap-1.5 ml-4">
                    <button
                      type="button"
                      onClick={() => setSessionForm({ ...sessionForm, total_delegates: Math.max(1, (parseInt(sessionForm.total_delegates, 10) || 25) - 1) })}
                      className="w-10 h-10 bg-slate-200 hover:bg-slate-300 font-black rounded-xl text-lg transition active:scale-95 shadow-sm"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => setSessionForm({ ...sessionForm, total_delegates: (parseInt(sessionForm.total_delegates, 10) || 25) + 1 })}
                      className="w-10 h-10 bg-slate-200 hover:bg-slate-300 font-black rounded-xl text-lg transition active:scale-95 shadow-sm"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Các nút chọn nhanh quy mô HĐND cấp xã / huyện */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                  <span className="text-xs text-slate-500 font-semibold">Chọn nhanh theo cơ cấu:</span>
                  {[21, 23, 25, 27, 30, 35].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setSessionForm({ ...sessionForm, total_delegates: count })}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
                        parseInt(sessionForm.total_delegates, 10) === count
                          ? 'bg-red-700 text-white shadow-red-200 scale-105'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
                      }`}
                    >
                      {count} Đại biểu
                    </button>
                  ))}
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-900 leading-relaxed font-medium">
                  💡 <b>Quy chế biểu quyết:</b> Với <b>{sessionForm.total_delegates || 25} đại biểu triệu tập</b>, Nghị quyết sẽ <b>ĐƯỢC THÔNG QUA</b> khi có ít nhất <b>{Math.floor((parseInt(sessionForm.total_delegates, 10) || 25) / 2) + 1} đại biểu tán thành</b> (đạt quá 50%).
                </div>
              </div>

              {/* 3. ĐỊA ĐIỂM VÀ NGÀY HỌP */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    3. Địa Điểm Tổ Chức:
                  </label>
                  <input
                    type="text"
                    value={sessionForm.location}
                    onChange={(e) => setSessionForm({ ...sessionForm, location: e.target.value })}
                    placeholder="VD: Hội trường tầng 2 - UBND xã Phước Trà"
                    className="w-full text-sm font-semibold p-3 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-red-600 shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    4. Ngày Tổ Chức Kỳ Họp:
                  </label>
                  <input
                    type="text"
                    value={sessionForm.date}
                    onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                    placeholder="VD: 13/11/2026"
                    className="w-full text-sm font-semibold p-3 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-red-600 shadow-sm"
                  />
                </div>
              </div>

              {/* NÚT LƯU THAY ĐỔI */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setActiveTab('controller')}
                  className="px-5 py-3 text-slate-600 hover:text-slate-800 text-sm font-bold rounded-xl transition"
                >
                  ← Quay lại bàn biểu quyết
                </button>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-4 bg-red-700 hover:bg-red-800 text-white text-base font-black uppercase tracking-wide rounded-2xl shadow-xl shadow-red-700/30 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>LƯU & CẬP NHẬT LÊN TOÀN BỘ MÀN HÌNH</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 3: QUẢN LÝ CHỈ TIÊU / NGHỊ QUYẾT */}
        {activeTab === 'agendas' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Danh Mục Các Chỉ Tiêu / Nghị Quyết Cần Biểu Quyết</h2>
                <p className="text-xs text-slate-500">Thêm, chỉnh sửa hoặc sắp xếp thứ tự biểu quyết trong kỳ họp</p>
              </div>
              <button
                onClick={() => setShowAddAgendaModal(true)}
                className="flex items-center gap-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Thêm Chỉ Tiêu Mới</span>
              </button>
            </div>

            {agendas.length === 0 ? (
              <div className="py-12 text-center space-y-3 bg-slate-50/70 rounded-2xl border border-dashed border-slate-300 p-8 my-3">
                <FileText className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">Danh mục chỉ tiêu đang trống</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Chưa có dự thảo Nghị quyết nào được tạo. Hãy nhấn nút bên dưới để thêm nội dung biểu quyết cho kỳ họp.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAddAgendaModal(true)}
                  className="inline-flex items-center gap-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Thêm Chỉ Tiêu Đầu Tiên</span>
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {agendas.map((ag, index) => (
                  <div key={ag.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="w-8 h-8 rounded-lg bg-red-100 text-red-700 font-black text-sm flex items-center justify-center shrink-0">
                        0{index + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">
                            {ag.code}
                          </span>
                          <span className="text-xs text-slate-400 font-medium">
                            Thời gian: {ag.default_duration}s • Yêu cầu: &gt; {ag.required_ratio * 100}%
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mt-1">{ag.title}</h4>
                        {ag.description && <p className="text-xs text-slate-500 mt-0.5">{ag.description}</p>}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleSelectAgenda(ag.id)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
                      >
                        Chọn
                      </button>
                      <button
                        onClick={() => handleDeleteAgenda(ag.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                        title="Xóa chỉ tiêu"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Modal Thêm Chỉ Tiêu */}
            {showAddAgendaModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in">
                  <h3 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b">
                    Thêm Chỉ Tiêu Biểu Quyết Mới
                  </h3>
                  <form onSubmit={handleCreateAgenda} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Mã dự thảo / Nghị quyết:</label>
                      <input
                        type="text"
                        value={newAgenda.code}
                        onChange={(e) => setNewAgenda({ ...newAgenda, code: e.target.value })}
                        placeholder="VD: NQ-05/NQ-HĐND"
                        className="w-full text-sm p-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tên nội dung biểu quyết (*):</label>
                      <textarea
                        rows={3}
                        required
                        value={newAgenda.title}
                        onChange={(e) => setNewAgenda({ ...newAgenda, title: e.target.value })}
                        placeholder="VD: Thông qua Nghị quyết về phê chuẩn quyết toán ngân sách xã năm..."
                        className="w-full text-sm p-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tờ trình / Tóm tắt nội dung:</label>
                      <textarea
                        rows={2}
                        value={newAgenda.description}
                        onChange={(e) => setNewAgenda({ ...newAgenda, description: e.target.value })}
                        placeholder="Tóm tắt nội dung để đại biểu nắm rõ..."
                        className="w-full text-sm p-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-red-600"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Thời gian biểu quyết (giây):</label>
                        <input
                          type="number"
                          value={newAgenda.default_duration}
                          onChange={(e) => setNewAgenda({ ...newAgenda, default_duration: e.target.value })}
                          className="w-full text-sm p-2.5 border border-slate-300 rounded-xl outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Tỷ lệ thông qua:</label>
                        <select
                          value={newAgenda.required_ratio}
                          onChange={(e) => setNewAgenda({ ...newAgenda, required_ratio: parseFloat(e.target.value) })}
                          className="w-full text-sm p-2.5 border border-slate-300 rounded-xl outline-none"
                        >
                          <option value={0.5}>Quá bán (&gt; 50%)</option>
                          <option value={0.6667}>Ít nhất 2/3 tổng số ĐB</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <button
                        type="button"
                        onClick={() => setShowAddAgendaModal(false)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl transition"
                      >
                        Lưu chỉ tiêu
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: QUẢN LÝ ĐẠI BIỂU & ĐIỂM DANH */}
        {activeTab === 'delegates' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Danh Sách Đại Biểu HĐND & Điểm Danh Kỳ Họp</h2>
                <p className="text-xs text-slate-500">Chạm vào nút điểm danh để chuyển đổi trạng thái Có mặt / Vắng mặt</p>
              </div>
              <button
                onClick={() => setShowAddDelegateModal(true)}
                className="flex items-center gap-1.5 bg-red-700 hover:bg-red-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Thêm Đại Biểu</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                    <th className="py-3 px-3">Mã ghế</th>
                    <th className="py-3 px-3">Họ và tên</th>
                    <th className="py-3 px-3">Chức vụ</th>
                    <th className="py-3 px-3">Tổ đại biểu</th>
                    <th className="py-3 px-3">Mã PIN</th>
                    <th className="py-3 px-3 text-center">Trạng thái điểm danh</th>
                    <th className="py-3 px-3 text-center">Kết nối Tablet</th>
                    <th className="py-3 px-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {delegates.map((del) => (
                    <tr key={del.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-3 font-mono font-bold text-red-700">{del.seat_number}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">{del.name}</td>
                      <td className="py-3 px-3 text-slate-600">{del.title}</td>
                      <td className="py-3 px-3 text-slate-500">{del.group_name}</td>
                      <td className="py-3 px-3 font-mono text-slate-400">{del.pin}</td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => handleTogglePresent(del.id)}
                          className={`px-3 py-1 rounded-full font-bold text-[11px] transition ${
                            del.is_present
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {del.is_present ? '✓ Có mặt' : '✗ Vắng mặt'}
                        </button>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`inline-flex items-center gap-1 font-bold text-[11px] ${
                          del.is_online ? 'text-emerald-600' : 'text-slate-400'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${del.is_online ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                          {del.is_online ? 'Online' : 'Offline'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleDeleteDelegate(del.id)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition"
                          title="Xóa đại biểu"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Modal Thêm Đại Biểu */}
            {showAddDelegateModal && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in">
                  <h3 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b">
                    Thêm Đại Biểu HĐND Mới
                  </h3>
                  <form onSubmit={handleCreateDelegate} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Mã ghế / Số hiệu ĐB:</label>
                      <input
                        type="text"
                        value={newDelegate.seat_number}
                        onChange={(e) => setNewDelegate({ ...newDelegate, seat_number: e.target.value })}
                        placeholder="VD: ĐB-26"
                        className="w-full text-sm p-2.5 border border-slate-300 rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Họ và tên (*):</label>
                      <input
                        type="text"
                        required
                        value={newDelegate.name}
                        onChange={(e) => setNewDelegate({ ...newDelegate, name: e.target.value })}
                        placeholder="VD: Nguyễn Văn A"
                        className="w-full text-sm p-2.5 border border-slate-300 rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Chức vụ / Đơn vị:</label>
                      <input
                        type="text"
                        value={newDelegate.title}
                        onChange={(e) => setNewDelegate({ ...newDelegate, title: e.target.value })}
                        placeholder="VD: Đại biểu HĐND xã"
                        className="w-full text-sm p-2.5 border border-slate-300 rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Tổ đại biểu:</label>
                      <input
                        type="text"
                        value={newDelegate.group_name}
                        onChange={(e) => setNewDelegate({ ...newDelegate, group_name: e.target.value })}
                        placeholder="VD: Tổ đại biểu số 1"
                        className="w-full text-sm p-2.5 border border-slate-300 rounded-xl outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Mã PIN tablet (4 số):</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={newDelegate.pin}
                        onChange={(e) => setNewDelegate({ ...newDelegate, pin: e.target.value })}
                        placeholder="VD: 1234 (để trống tự tạo ngẫu nhiên)"
                        className="w-full text-sm p-2.5 border border-slate-300 rounded-xl outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <button
                        type="button"
                        onClick={() => setShowAddDelegateModal(false)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl transition"
                      >
                        Lưu Đại Biểu
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: BIÊN BẢN KIỂM PHIẾU & IN ẤN */}
        {activeTab === 'report' && (
          <div className="space-y-4">
            <div className="flex justify-end no-print">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-red-700 hover:bg-red-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition"
              >
                <Printer className="w-4 h-4" />
                <span>In Biên Bản Kiểm Phiếu / Xuất PDF</span>
              </button>
            </div>

            {/* MẪU BIÊN BẢN CHUẨN THỂ THỨC VĂN BẢN NHÀ NƯỚC */}
            <div className="bg-white p-8 md:p-12 rounded-2xl shadow border border-slate-200 max-w-4xl mx-auto text-black font-serif leading-relaxed">
              <div className="flex justify-between items-start text-center mb-6">
                <div>
                  <p className="font-bold text-xs uppercase">HỘI ĐỒNG NHÂN DÂN</p>
                  <p className="font-bold text-xs uppercase underline">XÃ PHƯỚC TRÀ</p>
                  <p className="text-[11px] mt-1">Số: ... /BB-HĐND</p>
                </div>
                <div>
                  <p className="font-bold text-xs uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                  <p className="font-bold text-xs underline">Độc lập - Tự do - Hạnh phúc</p>
                  <p className="text-[11px] italic mt-1">Phước Trà, ngày {session?.date || new Date().toLocaleDateString('vi-VN')}</p>
                </div>
              </div>

              <div className="text-center my-6">
                <h2 className="font-bold text-base uppercase">BIÊN BẢN KIỂM PHIẾU BIỂU QUYẾT ĐIỆN TỬ</h2>
                <p className="font-bold text-sm italic">{session?.name}</p>
              </div>

              <div className="text-xs space-y-2 mb-6">
                <p>Hôm nay, ngày {session?.date || new Date().toLocaleDateString('vi-VN')}, tại {session?.location || 'Hội trường UBND xã Phước Trà'}.</p>
                <p>Hội đồng nhân dân xã Phước Trà tiến hành biểu quyết các nội dung, chỉ tiêu của Kỳ họp bằng Hệ thống biểu quyết điện tử.</p>
                <p>- Tổng số đại biểu Hội đồng nhân dân triệu tập: <b>{session?.total_delegates || 25}</b> đại biểu.</p>
                <p>- Số đại biểu có mặt tham gia biểu quyết: <b>{presentCount}</b> đại biểu (đạt {Math.round((presentCount / (session?.total_delegates || 25)) * 100)}%).</p>
                <p>- Số đại biểu vắng mặt: <b>{(session?.total_delegates || 25) - presentCount}</b> đại biểu.</p>
              </div>

              <h4 className="font-bold text-xs uppercase mb-2">KẾT QUẢ BIỂU QUYẾT CHI TIẾT CÁC NỘI DUNG:</h4>

              <table className="w-full text-xs border-collapse border border-black mb-8">
                <thead>
                  <tr className="bg-slate-100 text-center font-bold">
                    <th className="border border-black p-2 w-10">TT</th>
                    <th className="border border-black p-2">Nội dung / Dự thảo Nghị quyết</th>
                    <th className="border border-black p-2 w-20">Tán thành</th>
                    <th className="border border-black p-2 w-20">Không tán thành</th>
                    <th className="border border-black p-2 w-20">Không ý kiến</th>
                    <th className="border border-black p-2 w-24">Tỷ lệ (% triệu tập)</th>
                    <th className="border border-black p-2 w-24">Kết luận</th>
                  </tr>
                </thead>
                <tbody>
                  {state.allResults?.map((item, idx) => (
                    <tr key={item.agenda?.id || idx}>
                      <td className="border border-black p-2 text-center">{idx + 1}</td>
                      <td className="border border-black p-2">
                        <b>{item.agenda?.code}</b>: {item.agenda?.title}
                      </td>
                      <td className="border border-black p-2 text-center font-bold">{item.agree_count}</td>
                      <td className="border border-black p-2 text-center font-bold">{item.disagree_count}</td>
                      <td className="border border-black p-2 text-center font-bold">{item.neutral_count}</td>
                      <td className="border border-black p-2 text-center font-bold">{item.agree_percent_total}%</td>
                      <td className="border border-black p-2 text-center font-bold">
                        {item.is_passed ? 'THÔNG QUA' : 'CHƯA THÔNG QUA'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-between text-center text-xs mt-12 pt-4">
                <div>
                  <p className="font-bold uppercase">THƯ KÝ KỲ HỌP</p>
                  <p className="italic text-[11px]">(Ký và ghi rõ họ tên)</p>
                  <div className="h-20"></div>
                  <p className="font-bold">Bùi Thị Tuyết</p>
                </div>
                <div>
                  <p className="font-bold uppercase">CHỦ TỌA KỲ HỌP</p>
                  <p className="italic text-[11px]">(Ký và ghi rõ họ tên)</p>
                  <div className="h-20"></div>
                  <p className="font-bold">Hồ Văn Long</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODAL SỬA TÊN CUỘC HỌP & TỔNG SỐ ĐẠI BIỂU TRIỆU TẬP */}
        {showEditSessionModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-red-700" />
                  <span>Sửa Thông Tin Kỳ Họp & Số Lượng ĐB</span>
                </h3>
                <button
                  onClick={() => setShowEditSessionModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveSession} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên kỳ họp / Cuộc họp (*):
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={sessionForm.name}
                    onChange={(e) => setSessionForm({ ...sessionForm, name: e.target.value })}
                    placeholder="VD: Kỳ họp thứ 8 (Kỳ họp thường lệ) - HĐND xã Phước Trà..."
                    className="w-full text-sm p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-red-600 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tổng số đại biểu triệu tập theo luật (*):
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={sessionForm.total_delegates}
                    onChange={(e) => setSessionForm({ ...sessionForm, total_delegates: e.target.value })}
                    className="w-full text-sm p-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-red-600 font-bold font-mono"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    * Số này là cơ sở pháp lý tính tỷ lệ quá bán (&gt; 50%) để thông qua các Nghị quyết.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Địa điểm tổ chức:</label>
                    <input
                      type="text"
                      value={sessionForm.location}
                      onChange={(e) => setSessionForm({ ...sessionForm, location: e.target.value })}
                      className="w-full text-sm p-2.5 border border-slate-300 rounded-xl outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ngày tổ chức:</label>
                    <input
                      type="text"
                      value={sessionForm.date}
                      onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                      className="w-full text-sm p-2.5 border border-slate-300 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={() => setShowEditSessionModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-red-700 hover:bg-red-800 text-white text-xs font-bold rounded-xl transition shadow"
                  >
                    Lưu Thay Đổi
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
