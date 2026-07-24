import {
    requireAuth,
    setupLogout
} from "../../../core/auth-guard.js";

import {
    getUser
} from "../../../core/storage.js";

import {
    createProductionLot,
    getFarmAreas,
    getProductCategories
} from "../../../services/production-lot.service.js";
/* =====================================================
   1. AUTHENTICATION & ROLE CHECK
===================================================== */
if (!requireAuth()) {
    // Auth-guard tự redirect nếu chưa đăng nhập
}

const user = getUser() || {};
const roleCode = user.roleCode || "";

// Chỉ cho phép VT-02 (Quản lý HTX)
if (roleCode !== "VT-02") {
    const loadingState = document.getElementById("loadingState");
    const unauthorizedState = document.getElementById("unauthorizedState");
    const mainContent = document.getElementById("mainContent");

    if (loadingState) loadingState.style.display = "none";
    if (unauthorizedState) unauthorizedState.style.display = "flex";
    if (mainContent) mainContent.style.display = "none";

    console.warn("Access denied: User is not VT-02");
}

/* =====================================================
   2. SAFE USER INFO POPULATE (FIX LỖI GÓC DƯỚI BÊN TRÁI)
===================================================== */
function populateUserInfo() {
    const displayName = user.fullName || user.username || "Lê Văn A";
    const orgName = user.organizationName || "Công ty Tester";
    const avatarChar = displayName.charAt(0).toUpperCase() || "U";

    // Quét tất cả ID có thể có ở góc dưới bên trái (Sidebar)
    const sidebarName = document.getElementById("sidebarUserName") || document.getElementById("userFullName");
    const sidebarOrg = document.getElementById("sidebarUserOrg") || document.getElementById("userOrgName");
    const sidebarAvatar = document.getElementById("sidebarUserAvatar") || document.getElementById("userAvatar");

    // Quét các ID trên Header
    const headerName = document.getElementById("headerUserName");
    const headerOrg = document.getElementById("headerUserOrg");
    const headerRole = document.getElementById("headerUserRole");

    // Render an toàn (Chỉ gán nếu phần tử tồn tại)
    if (sidebarName) sidebarName.textContent = displayName;
    if (sidebarOrg) sidebarOrg.textContent = orgName;
    if (sidebarAvatar) sidebarAvatar.textContent = avatarChar;

    if (headerName) headerName.textContent = displayName;
    if (headerOrg) headerOrg.textContent = orgName;
    if (headerRole) headerRole.textContent = roleCode || "VT-02";
}

/* =====================================================
   3. API SERVICES & STATE
===================================================== */
const httpClient = getHttpClient();
let currentShipment = null;
let currentTraceCodes = [];

// Gọi API POST /api/v1/shipments
async function createShipmentAPI(payload) {
    return await httpClient.post("/api/v1/shipments", payload);
}

// Gọi API Lấy danh sách lô sản xuất đã PACKAGED
async function fetchPackagedLots() {
    try {
        const res = await httpClient.get("/api/v1/production-lots");
        let lots = [];
        if (res && Array.isArray(res.data)) lots = res.data;
        else if (res && res.data && Array.isArray(res.data.items)) lots = res.data.items;

        const packaged = lots.filter(l => String(l.status).toUpperCase() === "PACKAGED");
        populateLotSelectOptions(packaged);
    } catch (err) {
        console.error("Lỗi tải danh sách lô sản xuất:", err);
    }
}

function populateLotSelectOptions(lots) {
    const selectElem = document.getElementById("selectProductionLot") || document.getElementById("productionLotId");
    if (!selectElem) return;

    selectElem.innerHTML = '<option value="">-- Chọn lô sản xuất đã đóng gói --</option>';
    if (lots.length === 0) {
        selectElem.innerHTML += '<option value="" disabled>Không có lô nào ở trạng thái PACKAGED</option>';
        return;
    }

    lots.forEach(lot => {
        const opt = document.createElement("option");
        opt.value = lot.id;
        opt.textContent = `${lot.name} (ID: ${lot.id.substring(0, 8)}...)`;
        selectElem.appendChild(opt);
    });
}

/* =====================================================
   4. MODAL & FORM HANDLERS
===================================================== */
function setupModalEvents() {
    const createBtn = document.getElementById("openCreateShipmentModalBtn") || document.querySelector(".btn-primary");
    const modal = document.getElementById("createShipmentModal");
    const closeBtn = document.getElementById("closeCreateShipmentModalBtn");
    const cancelBtn = document.getElementById("cancelCreateShipmentBtn");
    const form = document.getElementById("createShipmentForm");

    if (createBtn && modal) {
        createBtn.addEventListener("click", () => {
            modal.hidden = false;
            modal.style.display = "flex";
            fetchPackagedLots(); // Tải danh sách lô PACKAGED vào dropdown
        });
    }

    const closeModal = () => {
        if (modal) {
            modal.hidden = true;
            modal.style.display = "none";
        }
    };

    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

    // Xử lý Submit Tạo Lô Hàng & Sinh Mã (POST /api/v1/shipments)
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const lotId = (document.getElementById("selectProductionLot") || document.getElementById("productionLotId"))?.value;
            const name = document.getElementById("shipmentNameInput")?.value?.trim();
            const totalQuantity = Number(document.getElementById("totalQuantityInput")?.value);
            const packagingInfo = document.getElementById("packagingInfoInput")?.value?.trim();
            const msgElem = document.getElementById("formMessage");

            if (!lotId || !name || !totalQuantity) {
                if (msgElem) {
                    msgElem.textContent = "Vui lòng nhập đầy đủ thông tin bắt buộc (*)";
                    msgElem.style.color = "red";
                }
                return;
            }

            const payload = {
                productionLotId: lotId,
                name: name,
                totalQuantity: totalQuantity,
                packagingInfo: packagingInfo
            };

            try {
                const res = await createShipmentAPI(payload);
                if (res && (res.success || res.status === 201 || res.status === 200)) {
                    alert("Tạo lô hàng & Sinh mã thành công!");
                    closeModal();
                    window.location.reload(); // Reload để cập nhật dữ liệu mới sinh
                } else {
                    if (msgElem) {
                        msgElem.textContent = res.message || "Tạo thất bại.";
                        msgElem.style.color = "red";
                    }
                }
            } catch (err) {
                console.error("Lỗi API createShipment:", err);
                let errorMsg = "Lỗi hệ thống khi sinh mã.";
                if (err.status === 403) errorMsg = "Bạn không thuộc tổ chức hoặc không có quyền VT-02.";
                if (err.status === 404) errorMsg = "Không tìm thấy lô sản xuất.";
                if (err.status === 409) errorMsg = err.message || "Lô chưa đóng gói hoặc vượt hạn mức dải mã.";

                if (msgElem) {
                    msgElem.textContent = errorMsg;
                    msgElem.style.color = "red";
                }
            }
        });
    }
}

/* =====================================================
   5. LOGOUT HANDLER (SAFE FIX)
===================================================== */
function setupSafeLogout() {
    // Quét tất cả các nút Logout có thể có trên màn hình
    const logoutBtns = document.querySelectorAll("#logoutBtn, #btnLogout, .btn-logout, button:contains('Logout')");

    // Nếu dùng setupLogout từ auth-guard.js
    setupLogout();

    // Bổ sung bắt sự kiện thủ công dự phòng trường hợp ID không khớp
    document.addEventListener("click", (e) => {
        const target = e.target.closest("button, a");
        if (target && (target.id === "logoutBtn" || target.id === "btnLogout" || target.textContent.trim().toLowerCase().includes("logout"))) {
            e.preventDefault();
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = "/frontend/pages/auth/login.html";
        }
    });
}

/* =====================================================
   6. KHỞI TẠO TRANG (DOM READY)
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
    populateUserInfo();
    setupModalEvents();
    setupSafeLogout();
});