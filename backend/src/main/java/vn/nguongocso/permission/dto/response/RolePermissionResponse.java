package vn.nguongocso.permission.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

/**
 * Response cấu hình quyền của một vai trò trong một tổ chức.
 */
@Getter
@Builder
public class RolePermissionResponse {

    /**
     * ID tổ chức.
     */
    private UUID organizationId;

    /**
     * ID vai trò.
     */
    private Integer roleId;

    /**
     * Mã vai trò.
     * Ví dụ: VT-03
     */
    private String roleCode;

    /**
     * Tên vai trò.
     * Ví dụ: Người ghi sự kiện
     */
    private String roleName;

    /**
     * Danh sách quyền được nhóm theo resource.
     */
    private List<RolePermissionGroupResponse> groups;
}