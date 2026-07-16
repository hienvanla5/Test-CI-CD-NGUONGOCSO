package vn.nguongocso.auth.exception;

import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.servlet.http.HttpServletRequest;
import vn.nguongocso.common.ApiResult;
import vn.nguongocso.exception.BusinessException;
import vn.nguongocso.exception.DuplicateResourceException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResult<Void>> handleBusiness(BusinessException e, HttpServletRequest request) {
        return build(HttpStatus.BAD_REQUEST, e.getMessage(), null, request);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResult<Void>> handleValidation(MethodArgumentNotValidException e, HttpServletRequest request) {
        Map<String, String> fieldErrors = new LinkedHashMap<>();
        for (FieldError fe : e.getBindingResult().getFieldErrors()) {
            fieldErrors.put(fe.getField(), fe.getDefaultMessage());
        }
        return build(HttpStatus.BAD_REQUEST, "Dữ liệu không hợp lệ", fieldErrors, request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResult<Void>> handleGeneral(Exception e, HttpServletRequest request) {
        e.printStackTrace();
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "Đã xảy ra lỗi hệ thống", null, request);
    }

    private ResponseEntity<ApiResult<Void>> build(HttpStatus status, String message, Object errors,
            HttpServletRequest request) {
        ApiResult<Void> body = ApiResult.<Void>error(status.value(), message, errors, request.getRequestURI());
        return ResponseEntity.status(status).body(body);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiResult<Void>> handleDuplicate(
            DuplicateResourceException ex,
            HttpServletRequest request) {

        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResult.error(
                        409,
                        ex.getMessage()));
    }
}