import {
    getUser
} from "../../../js/core/storage.js";

const DEFAULT_TARGET_SELECTOR =
    ".sidebar-menu";

/**
 * Chuyển danh sách role trong data-roles
 * thành một mảng role.
 *
 * Ví dụ:
 * "VT-02,VT-03" -> ["VT-02", "VT-03"]
 */
function parseAllowedRoles(value) {
    return String(value || "")
        .split(",")
        .map(function (role) {
            return role.trim();
        })
        .filter(Boolean);
}

/**
 * Xóa các menu không thuộc quyền của người dùng.
 */
function filterMenuByRole(
    navElement,
    roleCode
) {
    const menuItems =
        navElement.querySelectorAll(
            "[data-roles]"
        );

    menuItems.forEach(function (menuItem) {
        const allowedRoles =
            parseAllowedRoles(
                menuItem.dataset.roles
            );

        if (
            !allowedRoles.includes(roleCode)
        ) {
            menuItem.remove();
        }
    });
}

/**
 * Chuẩn hóa pathname để so sánh đường dẫn.
 */
function normalizePathname(pathname) {
    const normalizedPath =
        String(pathname || "")
            .replace(/\/+$/, "");

    return normalizedPath || "/";
}

/**
 * Kiểm tra pathname hiện tại có thuộc nhóm trang
 * được khai báo trong data-active-prefixes hay không.
 */
function matchesActivePrefix(
    menuLink,
    currentPath
) {
    const prefixes =
        String(
            menuLink.dataset
                .activePrefixes || ""
        )
            .split(",")
            .map(function (prefix) {
                return prefix.trim();
            })
            .filter(Boolean)
            .map(normalizePathname);

    return prefixes.some(
        function (prefix) {
            return (
                currentPath === prefix ||
                currentPath.startsWith(
                    `${prefix}/`
                )
            );
        }
    );
}

/**
 * Đánh dấu menu ứng với trang đang mở.
 */
function markActiveMenu(navElement) {
    const currentPath =
        normalizePathname(
            window.location.pathname
        );

    const menuLinks =
        navElement.querySelectorAll(
            "a[href]"
        );

    menuLinks.forEach(function (menuLink) {
        const linkUrl =
            new URL(
                menuLink.getAttribute("href"),
                window.location.origin
            );

        const linkPath =
            normalizePathname(
                linkUrl.pathname
            );

        const isActive =
            currentPath === linkPath ||
            matchesActivePrefix(
                menuLink,
                currentPath
            );

        menuLink.classList.toggle(
            "active",
            isActive
        );

        if (isActive) {
            menuLink.setAttribute(
                "aria-current",
                "page"
            );
        } else {
            menuLink.removeAttribute(
                "aria-current"
            );
        }
    });
}

/**
 * Chuyển chuỗi HTML thành phần tử navigation.
 */
function createNavElement(htmlContent) {
    const template =
        document.createElement("template");

    template.innerHTML =
        htmlContent.trim();

    return template.content.querySelector(
        ".sidebar-menu"
    );
}

/**
 * Nạp navigation dùng chung cho VT-02 và VT-03.
 */
export async function renderNav(
    targetSelector =
        DEFAULT_TARGET_SELECTOR
) {
    const targetElement =
        document.querySelector(
            targetSelector
        );

    if (!targetElement) {
        console.warn(
            `[Nav Component] Không tìm thấy container: "${targetSelector}"`
        );

        return;
    }

    const user = getUser();
    const roleCode = user?.roleCode;

    /*
     * Không có role thì không hiển thị menu.
     * auth-guard.js sẽ chịu trách nhiệm chuyển
     * người dùng về trang đăng nhập.
     */
    if (!roleCode) {
        targetElement.replaceChildren();

        console.warn(
            "[Nav Component] Không tìm thấy role của người dùng."
        );

        return;
    }

    try {
        /*
         * nav.html nằm cùng thư mục với nav.js,
         * nên sau khi đổi tên thư mục, đường dẫn
         * này vẫn hoạt động bình thường.
         */
        const navHtmlUrl =
            new URL(
                "./nav.html",
                import.meta.url
            );

        const response =
            await fetch(navHtmlUrl);

        if (!response.ok) {
            throw new Error(
                `Không thể tải navigation: HTTP ${response.status}`
            );
        }

        const htmlContent =
            await response.text();

        const navElement =
            createNavElement(htmlContent);

        if (!navElement) {
            throw new Error(
                "Không tìm thấy .sidebar-menu trong nav.html."
            );
        }

        /*
         * Lọc trước khi đưa vào trang để tránh
         * hiển thị thoáng qua menu không có quyền.
         */
        filterMenuByRole(
            navElement,
            roleCode
        );

        markActiveMenu(navElement);

        targetElement.replaceWith(
            navElement
        );

        document.dispatchEvent(
            new CustomEvent(
                "cooperative-nav:rendered",
                {
                    detail: {
                        roleCode
                    }
                }
            )
        );
    } catch (error) {
        targetElement.replaceChildren();

        console.error(
            "[Nav Component] Lỗi khi tải navigation:",
            error
        );
    }
}

/**
 * Tự động nạp navigation khi DOM sẵn sàng.
 */
function initializeNav() {
    renderNav();
}

if (
    document.readyState === "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        initializeNav,
        {
            once: true
        }
    );
} else {
    initializeNav();
}
