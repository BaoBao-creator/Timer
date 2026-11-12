# Quyết định kỹ thuật

## Dùng web tĩnh thuần, không framework
- **Quyết định:** Dùng HTML/CSS/JavaScript thuần, không cài dependency hay yêu cầu build step.
- **Lý do:** Phạm vi hiện tại chỉ là một màn hình timer; nền tảng tối thiểu giúp tải nhanh, dễ triển khai trên static hosting và dễ bảo trì.
- **Ràng buộc:** Không thêm framework hoặc thư viện chỉ để xử lý state/sự kiện đơn giản.

## Bắt đầu đo khi nhả, không phải khi nhấn
- **Quyết định:** Phải giữ tối thiểu 500 ms; đồng hồ chỉ bắt đầu tại thời điểm nhả.
- **Lý do:** Tách thao tác chuẩn bị khỏi thời gian giải.
- **Ràng buộc:** Không đổi ngưỡng 500 ms hoặc mốc bắt đầu nếu chưa có yêu cầu mới.

## Dùng pointer events cho chuột và cảm ứng
- **Quyết định:** Một luồng Pointer Events xử lý chuột, touch và bút; keyboard Space là luồng riêng.
- **Lý do:** Tránh duy trì nhiều nhánh mouse/touch trùng lặp và phù hợp thiết bị lai.
- **Ràng buộc:** Phải xử lý pointer ID, pointer capture và pointercancel để không kết thúc nhầm thao tác giữ.

## Dùng performance.now() làm nguồn thời gian
- **Quyết định:** Đo thời gian bằng chênh lệch timestamp từ performance.now(); requestAnimationFrame chỉ cập nhật UI.
- **Lý do:** Không tích lũy sai số từ setInterval hoặc tần số render.
- **Ràng buộc:** Không thay nguồn đo bằng số lần callback timer/animation chạy.

## Quy tắc dừng
- **Quyết định:** Trong state running, pointerdown trên vùng timer hoặc keydown ngoài control cài đặt dừng lượt hiện tại.
- **Lý do:** Khớp thao tác dừng đơn giản trên cả máy tính và điện thoại, đồng thời cho phép người dùng thao tác trong settings mà không vô tình dừng timer.
- **Ràng buộc:** Pointerup/keyup của thao tác đã bắt đầu timer không được tự dừng lượt vừa bắt đầu.

## Cài đặt giao diện lưu cục bộ
- **Quyết định:** Lưu màu nền, màu timer và lựa chọn font trong localStorage.
- **Lý do:** Tùy chỉnh cần được giữ lại giữa các lần tải trang mà không cần backend/tài khoản.
- **Ràng buộc:** Dữ liệu phải được xác thực khi đọc; nếu storage lỗi hoặc giá trị không hợp lệ thì dùng mặc định. Cài đặt không đồng bộ giữa thiết bị/trình duyệt.
- **Quyết định font LED:** Dùng các đoạn CSS thay vì tải font bên ngoài để giao diện hoạt động offline và không thêm request phụ thuộc.
