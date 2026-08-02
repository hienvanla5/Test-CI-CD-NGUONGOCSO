package vn.nguongocso.permission.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

/**
 * Response DTO cho một nhóm quyền của vai trò.
 */
@Getter
@Builder
public class RolePermissionGroupResponse {

    /**
     * Ví dụ:
     * production_lot
     * chain_event
     * certification
     */
    private String resource;

    /**
     * Ví dụ:
     * Lô sản xuất
     * Sự kiện chuỗi
     */
    private String resourceLabel;

    private List<PermissionItemResponse> permissions;
}