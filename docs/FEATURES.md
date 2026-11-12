# Danh mục chức năng

## Bộ đếm thời gian giải Rubik
- **Mục đích:** Đo thời gian một lượt giải bằng thao tác chờ sẵn rồi bắt đầu khi thả.
- **Trạng thái:** Đã triển khai; luồng input cốt lõi kế thừa từ bản trước.
- **Cách dùng trên máy tính:** Nhấn giữ Space ít nhất 0,5 giây; thả Space để bắt đầu. Nhấn phím bất kỳ để dừng.
- **Cách dùng trên điện thoại:** Chạm và giữ vùng timer ít nhất 0,5 giây; nhấc tay để bắt đầu. Chạm vùng timer lần nữa để dừng.
- **Cách dùng với chuột/bút:** Tương tự thao tác pointer; chỉ pointer chính và nút chính được sử dụng.
- **File phụ trách:** index.html, styles.css, app.js.
- **Giới hạn:** Chỉ giữ kết quả hiện tại trên màn hình; chưa có lịch sử lượt giải, thống kê, inspection penalty, scramble hoặc lưu trữ.

## Hiển thị thời gian
- **Mục đích:** Hiển thị kết quả với độ phân giải 0,01 giây.
- **Trạng thái:** Đã triển khai.
- **Cách hoạt động:** Render bằng requestAnimationFrame, nhưng tính thời gian từ performance.now(); DOM chỉ cập nhật khi centisecond thay đổi.
- **Định dạng:** 0.00; khi vượt một phút chuyển sang m:ss.xx.
- **File phụ trách:** app.js (formatTime(), renderTime(), updateRunningTime()), styles.css.

## Cài đặt giao diện
- **Mục đích:** Cho phép tùy chỉnh màu nền, màu số và kiểu hiển thị timer.
- **Trạng thái:** Đã triển khai trong code.
- **Cách hoạt động:** Nút bánh răng mở settings panel. Hai input type=color cho màu nền/màu timer; select cho kiểu chữ. Thay đổi áp dụng ngay và lưu trong localStorage.
- **File phụ trách:** index.html, styles.css, app.js.
- **Các kiểu hiển thị:** Hiện đại (system sans-serif), Cổ điển (Palatino/Georgia serif), Thanh lịch (Didot/Bodoni/Times serif), Máy đánh chữ (monospace), LED 7 đoạn (segment CSS dựng trực tiếp).
- **Giới hạn:** Font cổ điển/thanh lịch phụ thuộc font cài sẵn trên hệ điều hành; nếu không có sẽ fallback. LED 7 đoạn không phụ thuộc font ngoài.
- **Lưu trữ:** Chỉ lưu cài đặt giao diện tại localStorage trên trình duyệt hiện tại; không đồng bộ giữa thiết bị/trình duyệt.

## Giao diện tối giản và responsive
- **Mục đích:** Để timer là nội dung duy nhất trên màn hình chính, tránh chữ hướng dẫn thừa.
- **Trạng thái:** Đã triển khai trong code.
- **Cách hoạt động:** Timer canh giữa; nút cài đặt nằm cố định ở góc trên bên phải. Bảng cài đặt chỉ xuất hiện khi mở.
- **File phụ trách:** index.html, styles.css.
- **Giới hạn:** Cần kiểm tra trực quan trên thiết bị thực tế để xác nhận các font fallback và bố cục trên nhiều kích thước màn hình.
