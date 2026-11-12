# AGENTS.md — Quy tắc làm việc

## Trước khi sửa code
- Đọc WORKSTATION.md trước, sau đó đọc tài liệu trong docs/ liên quan trực tiếp đến nhiệm vụ.
- Kiểm tra trạng thái repository, cấu trúc file và source hiện tại. Tài liệu là bản đồ, không thay thế việc xác minh code.
- Truy tìm luồng sự kiện và state liên quan trước khi chỉnh sửa; không suy đoán chức năng chưa có.

## Phạm vi thay đổi
- Chỉ sửa những file cần thiết để hoàn thành yêu cầu. Không refactor hoặc thêm tính năng ngoài phạm vi.
- Dự án hiện là web tĩnh thuần HTML, CSS và JavaScript. Không thêm framework, thư viện hoặc bước build nếu chưa có lý do rõ ràng.
- Bảo toàn hành vi timer đã ghi trong docs/DECISIONS.md; thay đổi hành vi chỉ khi người dùng yêu cầu.

## Chất lượng và hiệu năng
- Ưu tiên xử lý sự kiện trực tiếp, state rõ ràng và vòng đời tài nguyên có thể dọn dẹp.
- Dùng đồng hồ đơn điệu performance.now() để đo thời gian; không dùng số lần interval làm nguồn thời gian.
- Không cập nhật DOM nhiều hơn mức hiển thị cần thiết; giữ giao diện phản hồi tốt trên điện thoại và máy tính.
- Hỗ trợ pointer input và keyboard input; xử lý hủy thao tác, mất focus và chuyển tab để tránh state bị kẹt.
- Tránh animation trang trí hoặc hiệu ứng làm chậm thao tác bấm giờ.

## Kiểm thử
- Chạy kiểm tra cú pháp JavaScript sau khi sửa nếu Node.js khả dụng.
- Kiểm tra thủ công các luồng nhấn giữ dưới 500 ms, đúng/ngang ngưỡng 500 ms, thả để bắt đầu, chạm/phím để dừng, hủy pointer và thao tác trên màn hình nhỏ.
- Ghi rõ kiểm thử nào đã chạy, kiểm thử nào chưa thể thực hiện. Không tuyên bố đã kiểm thử trình duyệt nếu chưa thực sự chạy.

## Tài liệu
- Cập nhật docs/FEATURES.md khi hành vi hoặc chức năng thay đổi.
- Cập nhật docs/ARCHITECTURE.md khi thay đổi luồng xử lý, module hoặc state.
- Chỉ thêm quyết định dài hạn vào docs/DECISIONS.md.
- Chỉ ghi lỗi đã tái hiện/xác nhận vào docs/KNOWN_ISSUES.md; không tạo file này cho suy đoán hoặc ý tưởng.
- Cập nhật WORKSTATION.md nếu cấu trúc, entry point hoặc cách chạy thay đổi.

## Quyền và an toàn
- Không tự ý commit, push, merge, tạo branch hoặc Pull Request khi chưa được yêu cầu rõ ràng.
- Không tự ý thay đổi dependency, cấu hình triển khai hoặc nguồn dữ liệu ngoài phạm vi nhiệm vụ.
- Không ghi thông tin chưa xác minh vào tài liệu; đánh dấu rõ giới hạn kiểm chứng.
