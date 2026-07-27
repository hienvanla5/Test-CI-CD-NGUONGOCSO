/**
 * Mã vai trò trong hệ thống.
 */
export const ROLES = Object.freeze({
    PLATFORM_ADMIN: "VT-01",
    ORG_MANAGER: "VT-02",
    EVENT_RECORDER: "VT-03",
    ENTERPRISE: "VT-04",
    GOVERNMENT: "VT-05"
});

/**
 * Các quyền thuộc phần nhật ký canh tác.
 */
export const PERMISSIONS =
    Object.freeze({
        CREATE_FARM_LOG:
            "farm-log:create",

        VIEW_FARM_LOG_HISTORY:
            "farm-log:view-history",

        RECORD_CHAIN_EVENT:
            "chain-event:record",

        VIEW_CHAIN_EVENT_TIMELINE:
            "chain-event:view-timeline"
    });

/**
 * Phân quyền theo role.
 *
 * VT-02:
 * - Xem lịch sử nhật ký.
 *
 * VT-03:
 * - Ghi nhật ký.
 */
const ROLE_PERMISSIONS =
    Object.freeze({
        [ROLES.PLATFORM_ADMIN]:
            Object.freeze([]),

        [ROLES.ORG_MANAGER]:
            Object.freeze([
                PERMISSIONS
                    .VIEW_FARM_LOG_HISTORY,

                PERMISSIONS
                    .RECORD_CHAIN_EVENT,

                PERMISSIONS
                    .VIEW_CHAIN_EVENT_TIMELINE
            ]),

        [ROLES.EVENT_RECORDER]:
            Object.freeze([
                PERMISSIONS
                    .CREATE_FARM_LOG,

                PERMISSIONS
                    .RECORD_CHAIN_EVENT,

                PERMISSIONS
                    .VIEW_CHAIN_EVENT_TIMELINE
            ]),

        [ROLES.ENTERPRISE]:
            Object.freeze([]),

        [ROLES.GOVERNMENT]:
            Object.freeze([])
    });

/**
 * Chuẩn hóa mã role.
 */
export function normalizeRoleCode(
    roleCode
) {
    return String(roleCode || "")
        .trim()
        .toUpperCase();
}

/**
 * Lấy danh sách quyền của một role.
 */
export function getPermissionsByRole(
    roleCode
) {
    const normalizedRole =
        normalizeRoleCode(roleCode);

    return (
        ROLE_PERMISSIONS[
            normalizedRole
        ] || []
    );
}

/**
 * Kiểm tra role có một quyền cụ thể không.
 */
export function hasPermission(
    roleCode,
    permission
) {
    if (!permission) {
        return false;
    }

    return getPermissionsByRole(
        roleCode
    ).includes(permission);
}

/**
 * Kiểm tra quyền ghi nhật ký.
 *
 * Hiện tại chỉ VT-03.
 */
export function canCreateFarmLog(
    roleCode
) {
    return hasPermission(
        roleCode,
        PERMISSIONS.CREATE_FARM_LOG
    );
}

/**
 * Kiểm tra quyền xem lịch sử nhật ký.
 *
 * Hiện tại chỉ VT-02.
 */
export function canViewFarmLogHistory(
    roleCode
) {
    return hasPermission(
        roleCode,
        PERMISSIONS
            .VIEW_FARM_LOG_HISTORY
    );
}

/**
 * Kiểm tra quyền ghi sự kiện chuỗi cung ứng
 * (quét mã, nhập sự kiện vận chuyển/đóng gói...).
 *
 * Khớp với @PreAuthorize ở ChainEventController:
 * VT-02, VT-03.
 */
export function canRecordChainEvent(
    roleCode
) {
    return hasPermission(
        roleCode,
        PERMISSIONS.RECORD_CHAIN_EVENT
    );
}

/**
 * Kiểm tra quyền xem dòng sự kiện chuỗi cung ứng.
 */
export function canViewChainEventTimeline(
    roleCode
) {
    return hasPermission(
        roleCode,
        PERMISSIONS
            .VIEW_CHAIN_EVENT_TIMELINE
    );
}

/**
 * Kiểm tra quyền ghi sự kiện vận chuyển (TRANSPORT).
 *
 * Khớp với @PreAuthorize ở ChainEventController
 * cho POST /api/v1/chain-events/transport:
 * chỉ VT-03 (Người ghi sự kiện) được phép,
 * khác với các sự kiện khác vốn cho phép cả VT-02.
 */
export function canRecordTransportEvent(
    roleCode
) {
    return (
        normalizeRoleCode(roleCode) ===
        ROLES.EVENT_RECORDER
    );
}