package vn.nguongocso.common;

import java.time.Instant;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResult <T>{
	private boolean success;
	private int status;
	private String message;
	private T data;
	private Object errors;
	private String path;

	@Builder.Default
	private Instant timestamp = Instant.now();


	public static <T> ApiResult<T> success(T data){
		return ApiResult.<T>builder()
				.success(true)
				.status(200)
				.data(data)
				.build();
	}

	public static <T> ApiResult<T> success(int status, T data){
		return ApiResult.<T>builder()
				.success(true)
				.status(status)
				.data(data)
				.build();
	}

	public static <T> ApiResult<T> error(int status, String message){
		return ApiResult.<T>builder()
				.success(false)
				.status(status)
				.message(message)
				.build();
	}

    public static <T> ApiResult<T> error(int status, String message, Object errors, String path) {
        return ApiResult.<T>builder()
                .success(false)
                .status(status)
                .message(message)
                .errors(errors)
                .path(path)
                .build();
    }

	public static <T> ApiResult<T> error(int status, String message, String path) {
		return ApiResult.<T>builder()
				.success(false)
				.status(status)
				.message(message)
				.path(path)
				.build();
	}

	public static <T> ApiResult<T> error(int status,
	                                     String message,
	                                     Object errors) {
		return ApiResult.<T>builder()
				.success(false)
				.status(status)
				.message(message)
				.errors(errors)
				.build();
	}
}
