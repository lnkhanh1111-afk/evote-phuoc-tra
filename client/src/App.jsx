import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import TabletVote from './components/TabletVote';
import ScreenDisplay from './components/ScreenDisplay';
import AdminDashboard from './components/AdminDashboard';
import { Tablet, Tv, ShieldAlert, Wifi, WifiOff } from 'lucide-react';

export default function App() {
  // Nhận diện màn hình ban đầu từ hash url hoặc query param
  const getInitialView = () => {
    const hash = window.location.hash.replace('#', '');
    if (['tablet', 'screen', 'admin'].includes(hash)) return hash;
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (['tablet', 'screen', 'admin'].includes(view)) return view;
    return 'tablet'; // Mặc định cho máy tính bảng đại biểu
  };

  const [currentView, setCurrentView] = useState(getInitialView);
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [appState, setAppState] = useState({
    session: null,
    currentAgenda: null,
    results: null,
    allResults: [],
    agendas: [],
    delegates: [],
    voting_status: 'idle',
    time_remaining: 30
  });

  useEffect(() => {
    // Lắng nghe kết nối socket
    function onConnect() {
      setIsConnected(true);
    }
    function onDisconnect() {
      setIsConnected(false);
    }

    // Lắng nghe cập nhật toàn bộ trạng thái
    function onStateUpdate(data) {
      setAppState(prev => ({
        ...prev,
        ...data
      }));
    }

    // Lắng nghe nhịp đồng hồ đếm ngược
    function onTimerTick({ remaining }) {
      setAppState(prev => ({
        ...prev,
        time_remaining: remaining
      }));
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('state_update', onStateUpdate);
    socket.on('timer_tick', onTimerTick);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('state_update', onStateUpdate);
      socket.off('timer_tick', onTimerTick);
    };
  }, []);

  const changeView = (view) => {
    setCurrentView(view);
    window.location.hash = view;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* THANH ĐIỀU HƯỚNG CHỌN VAI TRÒ (ẨN KHI IN ẤN) */}
      <div className="no-print bg-slate-900 border-b border-slate-800 text-white px-3 py-2 flex flex-wrap items-center justify-between text-xs sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse"></div>
          <span className="font-extrabold tracking-wide text-yellow-400 uppercase text-[11px] md:text-xs">
            E-Vote HĐND Phước Trà
          </span>
          <div className="hidden sm:flex items-center gap-1 ml-2 text-[10px] text-slate-400 border-l border-slate-700 pl-2">
            {isConnected ? (
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <Wifi className="w-3 h-3" /> Máy chủ Kết nối Realtime
              </span>
            ) : (
              <span className="text-rose-400 flex items-center gap-1 font-semibold">
                <WifiOff className="w-3 h-3" /> Mất kết nối máy chủ
              </span>
            )}
          </div>
        </div>

        {/* Nút chuyển đổi nhanh các giao diện để test và sử dụng */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => changeView('tablet')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all text-xs ${
              currentView === 'tablet'
                ? 'bg-red-700 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Tablet className="w-3.5 h-3.5" />
            <span>1. Máy tính bảng ĐB</span>
          </button>

          <button
            onClick={() => changeView('screen')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all text-xs ${
              currentView === 'screen'
                ? 'bg-red-700 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>2. Màn hình Hội trường (LED)</span>
          </button>

          <button
            onClick={() => changeView('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all text-xs ${
              currentView === 'admin'
                ? 'bg-red-700 text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-slate-700'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>3. Quản trị & Điều hành</span>
          </button>
        </div>
      </div>

      {/* HIỂN THỊ NỘI DUNG TƯƠNG ỨNG */}
      <div className="flex-1 flex flex-col">
        {currentView === 'tablet' && <TabletVote state={appState} />}
        {currentView === 'screen' && <ScreenDisplay state={appState} />}
        {currentView === 'admin' && <AdminDashboard state={appState} />}
      </div>
    </div>
  );
}
