# HƯỚNG DẪN SỬ DỤNG HỆ THỐNG BIỂU QUYẾT ĐIỆN TỬ HĐND PHƯỚC TRÀ

## 1. KHỞI ĐỘNG HỆ THỐNG (CHỈ CẦN 1 BƯỚC)
- Trên máy tính chạy Windows: Nhấp đúp chuột vào file **`start-server.bat`**
- Hoặc mở terminal trong thư mục dự án và chạy:
  ```bash
  npm start
  ```
- Máy chủ sẽ chạy tại cổng **5000** và tự động hiển thị địa chỉ IP nội bộ của máy tính bạn.

---

## 2. TRUY CẬP CÁC PHÂN HỆ

| Phân hệ | Đường dẫn truy cập (trên máy chủ) | Đường dẫn từ máy tính bảng trong mạng LAN |
| :--- | :--- | :--- |
| **1. Máy tính bảng Đại biểu** | `http://localhost:5000/#tablet` | `http://<IP_MÁY_CHỦ>:5000/#tablet` |
| **2. Màn hình LED Hội trường** | `http://localhost:5000/#screen` | `http://<IP_MÁY_CHỦ>:5000/#screen` |
| **3. Bàn Điều hành Thư ký / Admin** | `http://localhost:5000/#admin` | `http://<IP_MÁY_CHỦ>:5000/#admin` |

---

## 3. CÁC TÍNH NĂNG ĐẶC BIỆT ĐÃ TÍCH HỢP
1. **Nút "Giả lập biểu quyết (Test)"**:
   - Trong trang Admin, có nút màu tím **"Giả lập biểu quyết (Test)"**. 
   - Khi thư ký bấm nút này, hệ thống sẽ tự động mô phỏng 25 đại biểu cùng biểu quyết theo các tỷ lệ thực tế, giúp bạn xem kết quả tính toán và màn hình LED hội trường thay đổi ngay lập tức mà không cần phải mở 25 thiết bị thật!
2. **Cơ chế biểu quyết theo Luật Tổ chức chính quyền địa phương**:
   - Tự động tính toán tỷ lệ trên **Số đại biểu có mặt** và **Tổng số đại biểu triệu tập**.
   - Tự động hiển thị kết luận: **NGHỊ QUYẾT ĐÃ ĐƯỢC THÔNG QUA** nếu tỷ lệ tán thành đạt quá nửa (> 50%) tổng số đại biểu HĐND triệu tập.
   - Bắn pháo hoa chúc mừng trên màn hình LED khi thông qua.
3. **In ấn biên bản**:
   - Tab 4 trong trang Admin là mẫu **Biên bản kiểm phiếu biểu quyết điện tử** chuẩn thể thức văn bản hành chính nhà nước. Có sẵn nút **"In Biên Bản / Xuất PDF"**.

---

## 4. DỮ LIỆU ĐÃ CẤU HÌNH SẴN CHO HĐND PHƯỚC TRÀ
- **25 Đại biểu HĐND** đại diện cho Thường trực HĐND, UBND, Ủy ban MTTQ và các thôn 1, 2, 3, 4, 5.
- **4 Chỉ tiêu / Dự thảo Nghị quyết mẫu** thường kỳ (Báo cáo KTXH, Dự toán thu chi ngân sách & đầu tư công, Đề án Nông thôn mới nâng cao, Miễn nhiệm & bầu bổ sung ủy viên).
- Dữ liệu lưu tại file: `server/data/database.json`. Bạn có thể thêm, sửa, xóa trực tiếp trên trang Admin.
