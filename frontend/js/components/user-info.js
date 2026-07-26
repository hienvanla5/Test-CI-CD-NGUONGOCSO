import {
    getUser
} from "../core/storage.js";

import {
    getElement,
    setText
} from "../utils/dom.utils.js";

const ROLE_LABELS = Object.freeze({
    "VT-01": "Quản trị viên nền tảng",
    "VT-02": "Quản lý hợp tác xã",
    "VT-03": "Người ghi sự kiện",
    "VT-04": "Doanh nghiệp thu mua",
    "VT-05": "Cơ quan quản lý"
});

export function populateUserInfo(
    user = getUser()
) {
    if (!user) {
        return false;
    }

    const displayName =
        user.fullName ||
        user.username ||
        "—";

    const organizationName =
        user.organizationName ||
        user.organizationCode ||
        "—";

    const roleCode =
        user.roleCode || "—";

    setText(
        getElement("sidebarUserName"),
        displayName
    );

    setText(
        getElement("sidebarUserOrg"),
        organizationName
    );

    setText(
        getElement("headerUserName"),
        displayName
    );

    setText(
        getElement("headerUserOrg"),
        organizationName
    );

    const roleElement =
        getElement("headerUserRole");

    setText(
        roleElement,
        roleCode
    );

    if (roleElement) {
        roleElement.title =
            ROLE_LABELS[roleCode] ||
            roleCode;

        roleElement.dataset.role =
            roleCode;
    }

    const avatarElement =
        getElement(
            "sidebarUserAvatar"
        );

    if (avatarElement) {
        avatarElement.textContent =
            displayName
                .trim()
                .charAt(0)
                .toUpperCase() ||
            "N";
    }

    return true;
}