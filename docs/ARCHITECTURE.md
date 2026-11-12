# Kiến trúc

## Tổng quan
Ứng dụng là một trang tĩnh, không có server runtime, router, framework hoặc thư viện bên thứ ba. index.html nạp giao diện; styles.css định dạng; app.js điều khiển toàn bộ tương tác timer.

## Thành phần
- **index.html**: định nghĩa #timer-surface, #timer và #hint; nạp stylesheet và script với defer.
- **styles.css**: bố cục giữa màn hình, kích thước chữ thích ứng viewport và style cho các data-state.
- **app.js**: IIFE khởi tạo khi DOM đã parse; chứa state, format thời gian và các event listener.

## State management
app.js dùng một state object nội bộ, không có thư viện state:

| State | Ý nghĩa |
|---|---|
| idle | Chưa có lượt giải. |
| holding | Đang giữ input nhưng chưa đủ 500 ms. |
| ready | Đã giữ đủ 500 ms; chờ nhả input. |
| running | Đang đo thời gian. |
| stopped | Lượt giải đã dừng, giữ kết quả trên màn hình. |

phaseBeforeHold lưu trạng thái cần quay lại nếu thao tác giữ bị hủy hoặc thả quá sớm. holdSource và activePointerId bảo đảm chỉ input bắt đầu thao tác mới có thể kết thúc thao tác đó.

## Luồng input

### Pointer (chuột, cảm ứng, bút)
1. pointerdown trên #timer-surface bắt đầu giữ khi state là idle hoặc stopped.
2. setPointerCapture được dùng để tiếp tục nhận pointer event nếu ngón tay/chuột di chuyển ra ngoài vùng ban đầu.
3. Sau 500 ms, state chuyển holding → ready và hướng dẫn đổi thành “Thả ra để bắt đầu”.
4. pointerup đúng pointer ID bắt đầu timer nếu thời gian giữ đạt ngưỡng; nếu chưa đạt, quay về state trước khi giữ.
5. pointercancel hoặc mất focus hủy thao tác đang giữ.
6. Khi state là running, pointerdown dừng timer ngay.

### Keyboard
1. keydown của Space bắt đầu thao tác giữ khi state là idle hoặc stopped; key repeat và tổ hợp Ctrl/Alt/Meta không khởi tạo thao tác.
2. keyup của Space bắt đầu timer nếu đã giữ đủ 500 ms.
3. Khi state là running, keydown của bất kỳ phím nào dừng timer.

## Đo và render thời gian
- Mốc bắt đầu/dừng và thời lượng giữ dùng performance.now() (đồng hồ đơn điệu), không dùng số tick của interval làm nguồn đo.
- Timer bắt đầu tại thời điểm nhả input, không phải lúc bắt đầu giữ.
- requestAnimationFrame chỉ dùng để cập nhật hiển thị trong lúc chạy. Thời lượng thật luôn được tính lại từ startedAt.
- renderTime() chỉ ghi DOM khi giá trị phần trăm giây thay đổi; hiển thị đến 0,01 giây.
- Khi dừng, frame đang chờ được hủy và kết quả cuối được giữ nguyên.

## Vùng nhạy cảm khi thay đổi
- beginHold(), releaseHold(), cancelHold() và startTimer() liên kết chặt chẽ với state machine; thay đổi một hàm có thể làm sai ngưỡng 500 ms hoặc thời điểm bắt đầu.
- Listener pointer và keyboard có logic khác nhau ở đầu vào nhưng phải hội tụ tại startTimer() và stopTimer().
- stopTimer() phải lấy timestamp thực tế, không lấy giá trị hiển thị gần nhất, để tránh sai số do frame bị throttle.
- clearHoldData() phải được gọi khi thao tác giữ kết thúc/hủy để tránh timeout hoặc pointer ID cũ còn tồn tại.
