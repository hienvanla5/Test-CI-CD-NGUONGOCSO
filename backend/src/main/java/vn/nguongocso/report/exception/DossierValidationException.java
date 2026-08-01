package vn.nguongocso.report.exception;

import lombok.Getter;
import java.util.List;

/**
 * Ngoại lệ kiểm tra hồ sơ không hợp lệ.
 *
 * @author Triệu Văn Đại
 */
@Getter
public class DossierValidationException extends RuntimeException {

    // Danh sách lỗi chi tiết
    private final List<String> errors;

    public DossierValidationException(String message, List<String> errors) {
        super(message);
        this.errors = errors;
    }
}