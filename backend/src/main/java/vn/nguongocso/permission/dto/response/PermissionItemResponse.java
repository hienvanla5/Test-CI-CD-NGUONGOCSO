package vn.nguongocso.permission.dto.response;

import lombok.Builder;
import lombok.Getter;

/**
 * Response DTO cho một quyền.
 */
@Getter
@Builder
public class PermissionItemResponse {

    private Integer permissionId;

    private String action;

    private String description;

    /**
     * Giá trị quyền sau khi áp dụng
     * (từ cấu hình tổ chức hoặc mặc định hệ thống).
     */
    private Boolean isEnabled;

    /**
     * true = đang dùng quyền mặc định của hệ thống
     * false = tổ chức đã cấu hình riêng.
     */
    private Boolean isDefault;
}