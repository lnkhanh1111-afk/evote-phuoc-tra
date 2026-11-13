import { io } from 'socket.io-client';

// Tự động kết nối tới backend server dựa theo môi trường chạy (dev hoặc production)
const getSocketUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:5000';
  const hostname = window.location.hostname || 'localhost';
  if (window.location.port === '3000') {
    return `http://${hostname}:5000`;
  }
  return window.location.origin;
};

export const socket = io(getSocketUrl(), {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 20,
  reconnectionDelay: 1000,
  timeout: 10000,
});

export const API_URL = getSocketUrl();
