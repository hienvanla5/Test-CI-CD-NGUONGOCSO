package vn.nguongocso.exception;

import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.servlet.http.HttpServletRequest;
import vn.nguongocso.common.ApiResult;

/**
 * Xử lý ngoại lệ toàn cục của hệ thống.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

	private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

	/**
	 * Lỗi nghiệp vụ.
	 */
	@ExceptionHandler(BusinessException.class)
	public ResponseEntity<ApiResult<Void>> handleBusiness(BusinessException e, HttpServletRequest request) {

		return build(HttpStatus.BAD_REQUEST, e.getMessage(), null, request);
	}

	/**
	 * Lỗi validate dữ liệu đầu vào.
	 */
	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ApiResult<Void>> handleValidation(MethodArgumentNotValidException e,
			HttpServletRequest request) {

		Map<String, String> errors = new LinkedHashMap<>();

		for (FieldError error : e.getBindingResult().getFieldErrors()) {
			errors.put(error.getField(), error.getDefaultMessage());
		}

		return build(HttpStatus.BAD_REQUEST, "Dữ liệu không hợp lệ", errors, request);
	}

	/**
	 * JSON sai định dạng hoặc không đọc được request body.
	 */
	@ExceptionHandler(HttpMessageNotReadableException.class)
	public ResponseEntity<ApiResult<Void>> handleUnreadable(HttpMessageNotReadableException e,
			HttpServletRequest request) {

		return build(HttpStatus.BAD_REQUEST, "Dữ liệu gửi lên không hợp lệ", null, request);
	}

	/**
	 * Chưa xác thực.
	 */
	@ExceptionHandler(AuthenticationException.class)
	public ResponseEntity<ApiResult<Void>> handleAuthentication(AuthenticationException e, HttpServletRequest request) {

		return build(HttpStatus.UNAUTHORIZED, "Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn", null, request);
	}

	/**
	 * Không có quyền truy cập.
	 */
	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<ApiResult<Void>> handleAccessDenied(AccessDeniedException e, HttpServletRequest request) {

		return build(HttpStatus.FORBIDDEN, "Bạn không có quyền thực hiện chức năng này", null, request);
	}

	/**
	 * Trùng dữ liệu hoặc vi phạm ràng buộc cơ sở dữ liệu.
	 */
	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<ApiResult<Void>> handleDataIntegrity(DataIntegrityViolationException e,
			HttpServletRequest request) {

		return build(HttpStatus.CONFLICT, "Dữ liệu đã tồn tại hoặc vi phạm ràng buộc", null, request);
	}

	/**
	 * Sai HTTP Method.
	 */
	@ExceptionHandler(HttpRequestMethodNotSupportedException.class)
	public ResponseEntity<ApiResult<Void>> handleMethodNotSupported(HttpRequestMethodNotSupportedException e,
			HttpServletRequest request) {

		return build(HttpStatus.METHOD_NOT_ALLOWED, "Phương thức HTTP không được hỗ trợ", null, request);
	}

	/**
	 * Content-Type không được hỗ trợ.
	 */
	@ExceptionHandler(HttpMediaTypeNotSupportedException.class)
	public ResponseEntity<ApiResult<Void>> handleMediaType(HttpMediaTypeNotSupportedException e,
			HttpServletRequest request) {

		return build(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Content-Type không được hỗ trợ", null, request);
	}

	/**
	 * Lỗi chưa được xử lý.
	 */
	@ExceptionHandler(Exception.class)
	public ResponseEntity<ApiResult<Void>> handleException(Exception e, HttpServletRequest request) {

		log.error("Unexpected error", e);

		return build(HttpStatus.INTERNAL_SERVER_ERROR, "Đã xảy ra lỗi hệ thống", null, request);
	}

	/**
	 * Tạo phản hồi lỗi chuẩn.
	 */
	private ResponseEntity<ApiResult<Void>> build(HttpStatus status, String message, Object errors,
			HttpServletRequest request) {

		ApiResult<Void> body = ApiResult.error(status.value(), message, errors, request.getRequestURI());

		return ResponseEntity.status(status).body(body);
	}

	//Loi khong tim thay tai nguyen (HTTP 404)
	@ExceptionHandler(ResourceNotFoundException.class)
	public ResponseEntity<ApiResult<Void>> handleNotFound(ResourceNotFoundException e, HttpServletRequest request){
		return build(HttpStatus.NOT_FOUND, e.getMessage(), null, request);
	}

	//Loi Xung dot tai nguyen (409)
	@ExceptionHandler(DuplicateResourceException.class)
	public ResponseEntity<ApiResult<Void>>handleDublicate(DuplicateResourceException e, HttpServletRequest request){
		return build(HttpStatus.CONFLICT, e.getMessage(), null, request);

	}

	//Loi khong co quyen truy cap (403)
	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<ApiResult<Void>> handleAccessDined(AccessDeniedException e, HttpServletRequest request){
		String message = (e.getMessage() != null && !e.getMessage().isEmpty())
				? e.getMessage()
				: "Bạn không có quyền truy cập chức năng này !";
		return build(HttpStatus.FORBIDDEN, message, null, request);
	}
}