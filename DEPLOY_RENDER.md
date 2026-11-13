# HƯỚNG DẪN TRIỂN KHAI HỆ THỐNG LÊN RENDER (MIỄN PHÍ 100%)

Dự án đã được cấu hình sẵn file `render.yaml` và các lệnh build tự động. Bạn chỉ cần thực hiện 3 bước đơn giản dưới đây:

---

### BƯỚC 1: ĐẨY MÃ NGUỒN LÊN GITHUB CỦA BẠN
1. Truy cập [https://github.com/new](https://github.com/new) và đăng nhập tài khoản GitHub của bạn.
2. Đặt tên kho lưu trữ (Repository name): **`evote-phuoc-tra`** (chọn **Public** hoặc **Private** đều được).
3. Bấm **Create repository**.
4. Mở cửa sổ terminal trong thư mục `d:\E-vote Phuoc Tra` và chạy 3 lệnh sau (thay `<TEN_GITHUB_CUA_BAN>` bằng tài khoản GitHub của bạn):
   ```bash
   git branch -M main
   git remote add origin https://github.com/<TEN_GITHUB_CUA_BAN>/evote-phuoc-tra.git
   git push -u origin main
   ```

---

### BƯỚC 2: KẾT NỐI VÀ DEPLOY TRÊN RENDER
1. Truy cập [https://dashboard.render.com](https://dashboard.render.com) và chọn **Sign in with GitHub**.
2. Tại trang chính, bấm nút **New +** (màu xanh ở góc phải trên) -> Chọn **Web Service**.
3. Tại mục **Connect a repository**, tìm và chọn repository **`evote-phuoc-tra`** vừa đẩy lên -> Bấm **Connect**.
4. Điền các thông số cơ bản (hầu hết Render sẽ tự động điền):
   - **Name:** `evote-phuoc-tra` (hoặc tên bạn thích)
   - **Region:** Chọn **Singapore** *(quan trọng: để máy chủ gần Việt Nam, giảm độ trễ WebSocket xuống mức thấp nhất)*
   - **Branch:** `main`
   - **Runtime:** `Node`
   - **Build Command:** `npm run render-build`
   - **Start Command:** `npm start`
   - **Instance Type:** Chọn **Free ($0/month)**
5. Bấm nút **Deploy Web Service** ở cuối trang.

---

### BƯỚC 3: SỬ DỤNG VÀ THỬ NGHIỆM TRÊN MÁY TÍNH BẢNG
- Render sẽ tự động cài đặt thư viện, build giao diện React và khởi chạy máy chủ trong khoảng 2 - 3 phút.
- Khi màn hình hiện chữ **`Your service is live`**, Render sẽ cấp cho bạn một đường link HTTPS chính thức (ví dụ: `https://evote-phuoc-tra.onrender.com`).
- Bạn chỉ cần mở máy tính bảng và màn hình trình chiếu theo các đường link:
  - Máy tính bảng đại biểu: `https://evote-phuoc-tra.onrender.com/#tablet`
  - Màn hình LED hội trường: `https://evote-phuoc-tra.onrender.com/#screen`
  - Bàn điều hành Thư ký: `https://evote-phuoc-tra.onrender.com/#admin`

---

### LƯU Ý KHI DÙNG GÓI FREE CỦA RENDER
- Gói Free của Render sẽ tự động "ngủ" (Sleep) nếu không có ai truy cập trong vòng 15 phút để tiết kiệm tài nguyên.
- Khi có một đại biểu mở trang web, Render sẽ mất khoảng **25 - 40 giây** để khởi động lại máy chủ (sau khi thức dậy thì hoạt động nhanh và mượt mà bình thường).
- *Mẹo để máy chủ không bao giờ ngủ khi test:* Bạn có thể dùng các dịch vụ ping miễn phí như [cron-job.org](https://cron-job.org) hoặc [UptimeRobot](https://uptimerobot.com) để ping link `https://evote-phuoc-tra.onrender.com/api/health` mỗi 10 phút một lần.
