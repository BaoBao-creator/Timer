# WORKSTATION.md — Project Workstation

## Dự án
- **Tên:** Timer (Rubik Timer).
- **Mục đích:** Trang web tĩnh để đo thời gian giải Rubik bằng thao tác nhấn giữ rồi thả.
- **Nền tảng mục tiêu:** Trình duyệt hiện đại trên máy tính và điện thoại.
- **Công nghệ:** HTML, CSS và JavaScript thuần; không framework, dependency hay backend.
- **Triển khai:** Chưa xác minh nền tảng hosting; repo snapshot ban đầu chưa có mã nguồn.

## Bản đồ repository

| Đường dẫn | Trách nhiệm |
|---|---|
| index.html | HTML entry point, khai báo vùng tương tác và phần hiển thị thời gian. |
| styles.css | Bố cục responsive, typography và trạng thái giao diện. |
| app.js | State machine, xử lý pointer/keyboard, đo và hiển thị thời gian. |
| AGENTS.md | Quy tắc dành cho AI khi đọc/sửa dự án. |
| docs/ARCHITECTURE.md | Kiến trúc và luồng sự kiện. |
| docs/FEATURES.md | Danh mục chức năng và trạng thái triển khai. |
| docs/DECISIONS.md | Quyết định kỹ thuật cần bảo toàn. |

docs/KNOWN_ISSUES.md chưa được tạo vì chưa có lỗi đã biết được xác nhận.

## Entry point và luồng chính
- Mở index.html; file này nạp styles.css và app.js bằng defer.
- app.js là điểm bắt đầu logic. State machine hiện có: idle, holding, ready, running, stopped.
- Giữ pointer hoặc phím Space ít nhất 500 ms; timer chỉ bắt đầu khi nhả.
- Khi đang chạy, pointerdown hoặc keydown bất kỳ sẽ dừng timer.

## Chạy và kiểm tra

Không cần build hoặc cài dependency.

- Cách nhanh: mở index.html bằng trình duyệt hiện đại.
- Cách chạy qua HTTP local (nếu đã cài Python):

  ```bash
  python -m http.server 8000
  ```

  Sau đó mở http://localhost:8000.
- Kiểm tra cú pháp JavaScript (nếu đã cài Node.js):

  ```bash
  node --check app.js
  ```
- Chưa có test runner hoặc automated test suite.

## Hướng dẫn bắt đầu nhiệm vụ
1. Đọc AGENTS.md và tài liệu liên quan trong docs/.
2. Kiểm tra lại source hiện tại; đừng mặc định bản đồ này luôn đúng sau các thay đổi.
3. Với lỗi timer, lần theo state và listener trong app.js trước khi sửa CSS hoặc HTML.
4. Giữ thay đổi nhỏ, kiểm tra cú pháp và các tình huống input trên desktop/mobile.
5. Cập nhật đúng tài liệu bị ảnh hưởng; chỉ ghi lỗi đã xác nhận.
