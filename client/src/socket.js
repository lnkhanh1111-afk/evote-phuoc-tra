import { io } from 'socket.io-client';

// Tự động kết nối tới backend server dựa theo môi trường chạy (dev hoặc production)
const getSocketUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:5000';
  const hostname = window.location.hostname || 'localhost';
  const port = window.location.port;
  // Nếu đang mở trên môi trường dev (port 3000, 3001, 5173... khác port 5000 của server và khác 80/443 của domain online)
  if (port && port !== '5000' && port !== '80' && port !== '443') {
    return `http://${hostname}:5000`;
  }
  return window.location.origin;
};

export const socket = io(getSocketUrl(), {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  transports: ['polling', 'websocket']
});

export const API_URL = getSocketUrl();
