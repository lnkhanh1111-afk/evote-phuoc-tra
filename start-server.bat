@echo off
chcp 65001 > nul
title HỆ THỐNG BIỂU QUYẾT ĐIỆN TỬ HĐND PHƯỚC TRÀ
cls
echo ======================================================================
echo    HỘI ĐỒNG NHÂN DÂN XÃ PHƯỚC TRÀ - HỆ THỐNG BIỂU QUYẾT ĐIỆN TỬ
echo ======================================================================
echo.
echo [*] Đang kiểm tra địa chỉ IP mạng nội bộ của máy chủ này:
for /f "tokens=4" %%a in ('route print ^| findstr 0.0.0.0 ^| findstr /v "0.0.0.0.*0.0.0.0"') do (
    set LOCAL_IP=%%a
)
echo [*] Địa chỉ IP máy chủ: %LOCAL_IP%
echo.
echo [*] ĐƯỜNG DẪN KẾT NỐI CHO CÁC THIẾT BỊ:
echo  - Máy tính bảng Đại biểu:  http://%LOCAL_IP%:5000/#tablet
echo  - Màn hình LED Hội trường: http://%LOCAL_IP%:5000/#screen
echo  - Bàn điều hành Thư ký:    http://%LOCAL_IP%:5000/#admin
echo.
echo [*] Đang khởi động máy chủ...
echo ======================================================================
echo.
node server/index.js
pause
