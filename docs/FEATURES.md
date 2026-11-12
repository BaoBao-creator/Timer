# Danh mục chức năng

## Bộ đếm thời gian giải Rubik
- **Mục đích:** Đo thời gian một lượt giải bằng thao tác chờ sẵn rồi bắt đầu khi thả.
- **Trạng thái:** Đã triển khai trong snapshot project này; chưa xác minh bằng kiểm thử trình duyệt thực tế.
- **Cách dùng trên máy tính:** Nhấn giữ Space ít nhất 0,5 giây; thả Space để bắt đầu. Nhấn phím bất kỳ để dừng.
- **Cách dùng trên điện thoại:** Chạm và giữ màn hình ít nhất 0,5 giây; nhấc tay để bắt đầu. Chạm màn hình lần nữa để dừng.
- **Cách dùng với chuột/bút:** Tương tự thao tác pointer; chỉ pointer chính và nút chính được sử dụng.
- **File phụ trách:** index.html, styles.css, app.js.
- **Liên quan:** State machine và luồng input được mô tả tại ARCHITECTURE.md.
- **Giới hạn:** Chỉ giữ kết quả hiện tại trên màn hình; chưa có lịch sử lượt giải, thống kê, inspection penalty, scramble hoặc lưu trữ.

## Hiển thị thời gian
- **Mục đích:** Hiển thị kết quả với độ phân giải 0,01 giây.
- **Trạng thái:** Đã triển khai trong snapshot project này; chưa xác minh bằng kiểm thử trình duyệt thực tế.
- **Cách hoạt động:** Render bằng requestAnimationFrame, nhưng tính thời gian từ performance.now(); DOM chỉ cập nhật khi centisecond thay đổi.
- **File phụ trách:** app.js (formatTime(), renderTime(), updateRunningTime()), styles.css.
- **Giới hạn:** Sau một phút, định dạng chuyển sang m:ss.xx; không có giới hạn thời gian giải được đặt trong code.

## Giao diện responsive
- **Mục đích:** Giữ timer ở trung tâm và dễ đọc trên màn hình nhỏ/lớn.
- **Trạng thái:** Đã triển khai trong snapshot project này; cần kiểm tra trực quan trên thiết bị thật.
- **File phụ trách:** styles.css.
- **Cách hoạt động:** Dùng viewport units, clamp(), safe-area padding và các đơn vị svh/dvh; không có animation trang trí.
