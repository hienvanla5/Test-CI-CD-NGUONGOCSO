package vn.nguongocso.exception;

import org.springframework.http.HttpStatus;

/** Lớp ngoại lệ dùng để biểu thị các lỗi nghiệp vụ trong ứng dụng. */
public class BusinessException extends RuntimeException {

    private final HttpStatus status;

    /**
     * Khởi tạo ngoại lệ với thông điệp lỗi và trạng thái HTTP mặc định là
     * BAD_REQUEST.
     */
    public BusinessException(String message) {
        this(HttpStatus.BAD_REQUEST, message);
    }

    /** Khởi tạo ngoại lệ với thông điệp lỗi và trạng thái HTTP cụ thể. */
    public BusinessException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    /** Lấy trạng thái HTTP liên quan đến ngoại lệ. */
    public HttpStatus getStatus() {
        return status;
    }
}