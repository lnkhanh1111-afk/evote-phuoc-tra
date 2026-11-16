import React, { useState, useEffect } from 'react';
import { socket, API_URL } from './socket';
import TabletVote from './components/TabletVote';
import ScreenDisplay from './components/ScreenDisplay';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  // Nhận diện màn hình độc lập từ Hash hoặc Path URL
  const determineView = () => {
    const hash = window.location.hash.toLowerCase().replace('#', '').replace('/', '');
    const pathname = window.location.pathname.toLowerCase().replace('/', '');
    
    // 1. Kiểm tra màn hình LED / Hội trường
    if (hash === 'screen' || hash === 'led' || pathname === 'screen' || pathname === 'led') {
      return 'screen';
    }
    
    // 2. Kiểm tra bàn điều hành Admin / Thư ký
    if (hash === 'admin' || pathname === 'admin') {
      return 'admin';
    }

    // 3. Mặc định tất cả các máy tính bảng truy cập vào là MÀN HÌNH BIỂU QUYẾT ĐẠI BIỂU
    return 'tablet';
  };

  const [currentView, setCurrentView] = useState(determineView);
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
    // Lắng nghe sự kiện thay đổi hash/URL để đổi trang mượt mà
    const handleUrlChange = () => {
      setCurrentView(determineView());
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);

    // Tải trước dữ liệu ngay lập tức qua REST API (không cần chờ Socket bắt tay)
    const fetchFullState = () => {
      fetch(`${API_URL}/api/full-state`)
        .then(res => res.json())
        .then(data => {
          if (data && data.session) {
            setAppState(prev => ({
              ...prev,
              ...data
            }));
          }
        })
        .catch(() => {});
    };

    fetchFullState();
    // Tự động đồng bộ dự phòng mỗi 10 giây
    const pollInterval = setInterval(fetchFullState, 10000);

    // Lắng nghe cập nhật toàn bộ trạng thái thời gian thực từ Socket.io
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

    socket.on('state_update', onStateUpdate);
    socket.on('timer_tick', onTimerTick);

    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
      clearInterval(pollInterval);
      socket.off('state_update', onStateUpdate);
      socket.off('timer_tick', onTimerTick);
    };
  }, []);

  // PHÂN TÁCH 3 MÀN HÌNH HOÀN TOÀN ĐỘC LẬP
  return (
    <div className="min-h-screen bg-slate-100">
      {/* 1. MÀN HÌNH ĐẠI BIỂU: Tuyệt đối chỉ có biểu quyết, không có nút chuyển sang admin hay màn hình LED */}
      {currentView === 'tablet' && (
        <TabletVote state={appState} />
      )}

      {/* 2. MÀN HÌNH TRÌNH CHIẾU HỘI TRƯỜNG (LED): Chuyên biệt cho máy chiếu, trang nghiêm, không lộ thanh admin */}
      {currentView === 'screen' && (
        <ScreenDisplay state={appState} />
      )}

      {/* 3. TRANG QUẢN TRỊ & ĐIỀU HÀNH: Dành riêng cho Thư ký / Chủ tọa */}
      {currentView === 'admin' && (
        <AdminDashboard state={appState} />
      )}
    </div>
  );
}
