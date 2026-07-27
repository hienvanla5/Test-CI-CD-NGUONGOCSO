package vn.nguongocso.event.enums;

/**
 * Danh sách các loại sự kiện trong vòng đời chuỗi cung ứng.
 * <p>
 * Định nghĩa các giai đoạn và hành động khác nhau có thể xảy ra trong
 * chuỗi cung ứng nông nghiệp, từ sản xuất đến phân phối. Mỗi loại sự kiện
 * đại diện cho một hoạt động kinh doanh cụ thể với ngữ cảnh và ý nghĩa riêng.
 * </p>
 *
 * <p>Luồng sự kiện trong chuỗi cung ứng:</p>
 * <pre>
 * THU HOẠCH → ĐÓNG GÓI → VẬN CHUYỂN → THU MUA
 *      └───────────────── SỬA LỖI (bất kỳ giai đoạn nào)
 * </pre>
 *
 * @author Triệu Văn Đại
 */

public enum ChainEventType {
    /**
     * Sự kiện thu hoạch - Sản phẩm nông nghiệp được thu hoạch từ đồng ruộng.
     * Đây là giai đoạn đầu tiên trong chuỗi cung ứng.
     */
    HARVEST,
    /**
     * Sự kiện đóng gói - Sản phẩm được đóng gói và dán nhãn.
     * Bao gồm phân loại, đánh giá chất lượng và chuẩn bị sản phẩm để vận chuyển.
     */
    PACKAGING,
    /**
     * Sự kiện vận chuyển - Sản phẩm được di chuyển giữa các địa điểm.
     * Bao gồm điều phối logistics và các hoạt động vận tải.
     */
    TRANSPORT,
    /**
     * Sự kiện thu mua - Sản phẩm được mua hoặc tiếp nhận.
     * Thường xảy ra ở giai đoạn phân phối hoặc bán lẻ.
     */
    PROCUREMENT,
    /**
     * Sự kiện sửa lỗi - Điều chỉnh hoặc sửa dữ liệu sự kiện trước đó.
     * Dùng để xử lý lỗi và điều chỉnh dữ liệu.
     */
    CORRECTION
}

