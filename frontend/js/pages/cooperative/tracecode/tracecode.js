/* ============================================================
 * TraceCode Management
 * NCL-04-CN-002
 * Tạo lô hàng & Sinh mã truy xuất
 * ============================================================
 */

import { requireAuth, setupLogout } from "../../../core/auth-guard.js";
import { getUser } from "../../../core/storage.js";
import { getHttpClient } from "../../../services/http-client.js";

/* ============================================================
 * CONSTANTS
 * ============================================================
 */

const http = getHttpClient();

const API = {
    SHIPMENTS: "/api/v1/shipments",
    PRODUCTION_LOTS: "/api/v1/production-lots"
};
const BASE_URL = "http://localhost:8080";
const STATE = {
    shipment: null,
    traceCodes: [],
    packagedLots: [],
    loading: false
};

/* ============================================================
 * AUTH
 * ============================================================
 */

if (!requireAuth()) {
    throw new Error("Unauthorized");
}

const currentUser = getUser();

if (!currentUser) {
    window.location.href = "/frontend/pages/auth/login.html";
}

if (currentUser.roleCode !== "VT-02") {

    document.body.innerHTML = `
        <div class="unauthorized-container">
            <h2>403</h2>
            <p>Bạn không có quyền truy cập chức năng này.</p>
        </div>
    `;

    throw new Error("Forbidden");
}

/* ============================================================
 * DOM
 * ============================================================
 */

const DOM = {

    headerName:
        document.getElementById("headerUserName"),

    headerOrg:
        document.getElementById("headerUserOrg"),

    headerRole:
        document.getElementById("headerUserRole"),

    sidebarName:
        document.getElementById("sidebarUserName"),

    sidebarOrg:
        document.getElementById("sidebarUserOrg"),

    sidebarAvatar:
        document.getElementById("sidebarUserAvatar"),

    modal:
        document.getElementById("createShipmentModal"),

    form:
        document.getElementById("createShipmentForm"),

    message:
        document.getElementById("shipmentFormMessage"),

    btnOpen:
        document.getElementById("openCreateShipmentModalBtn"),

    btnClose:
        document.getElementById("createShipmentClose"),

    btnCancel:
        document.getElementById("createShipmentCancel"),

    productionLotSelect:
        document.getElementById("productionLotSelect"),

    shipmentName:
        document.getElementById("shipmentName"),

    totalQuantity:
        document.getElementById("totalQuantity"),

    packagingInfo:
        document.getElementById("packagingInfo"),
    
    shipmentTitle:
    document.getElementById("shipmentTitle"),

    shipmentId:
        document.getElementById("shipmentIdDisplay"),

    productionLot:
        document.getElementById("productionLotDisplay"),

    totalQuantityDisplay:
        document.getElementById("totalQuantityDisplay"),

    shipmentStatus:
        document.getElementById("shipmentStatusBadge"),

    traceGrid:
        document.getElementById("traceCodeGrid"),
};

/* ============================================================
 * USER INFO
 * ============================================================
 */

function renderCurrentUser() {

    const fullName =
        currentUser.fullName ||
        currentUser.username ||
        "Unknown";

    const organization =
        currentUser.organizationName ||
        "";

    const avatar =
        fullName.charAt(0).toUpperCase();

    DOM.headerName.textContent = fullName;
    DOM.headerOrg.textContent = organization;
    DOM.headerRole.textContent = currentUser.roleCode;

    DOM.sidebarName.textContent = fullName;
    DOM.sidebarOrg.textContent = organization;
    DOM.sidebarAvatar.textContent = avatar;
}

/* ============================================================
 * MODAL
 * ============================================================
 */

function openModal() {

    DOM.modal.style.display = "flex";

}

function closeModal() {

    DOM.modal.style.display = "none";

    DOM.form.reset();

    DOM.message.textContent = "";

}

/* ============================================================
 * API
 * ============================================================
 */

async function loadPackagedLots() {

    try {

        const response =
            await http.get(API.PRODUCTION_LOTS);

        const lots =
            response.data.data || [];

        STATE.packagedLots =
            lots.filter(
                x => x.status === "PACKAGED"
            );

        renderProductionLots();

    } catch (error) {

        console.error(error);

        showMessage(
            "Không tải được danh sách lô sản xuất.",
            "error"
        );
    }

}

async function createShipment(payload) {

    return await http.post(
        API.SHIPMENTS,
        payload
    );

}

/* ============================================================
 * RENDER PRODUCTION LOTS
 * ============================================================
 */

function renderProductionLots() {

    DOM.productionLotSelect.innerHTML = "";

    const defaultOption =
        document.createElement("option");

    defaultOption.value = "";

    defaultOption.textContent =
        "-- Chọn lô sản xuất --";

    DOM.productionLotSelect.appendChild(
        defaultOption
    );

    STATE.packagedLots.forEach(lot => {

        const option =
            document.createElement("option");

        option.value = lot.id;

        option.textContent =
            `${lot.name} (${lot.id.substring(0,8)})`;

        DOM.productionLotSelect.appendChild(
            option
        );

    });

}

/* ============================================================
 * MESSAGE
 * ============================================================
 */

function showMessage(text, type = "error") {

    DOM.message.textContent = text;

    DOM.message.style.color =
        type === "success"
            ? "#16a34a"
            : "#dc2626";

}

/* ============================================================
 * SUBMIT
 * ============================================================
 */

async function submitShipment(event) {

    event.preventDefault();

    showMessage("");

    const payload = {

        productionLotId:
            DOM.productionLotSelect.value,

        name:
            DOM.shipmentName.value.trim(),

        totalQuantity:
            Number(DOM.totalQuantity.value),

        packagingInfo:
            DOM.packagingInfo.value.trim()

    };

    if (
        !payload.productionLotId ||
        !payload.name ||
        payload.totalQuantity <= 0
    ) {

        showMessage(
            "Vui lòng nhập đầy đủ thông tin lô hàng."
        );

        return;
    }

    try {

        const response =
            await createShipment(payload);

        if (!response.data.success) {

            showMessage(
                response.data.message
            );

            return;
        }

        STATE.shipment =
            response.data.data;

        STATE.traceCodes =
            STATE.shipment.traceCodes;

        showMessage(
            "Tạo lô hàng thành công.",
            "success"
        );
        renderShipment();

        renderTraceCodes();

        closeModal();

        /*
         * Phần 2
         * renderShipment()
         * renderTraceCodes()
         */

    } catch (error) {

        const status =
            error.response?.status;

        const message =
            error.response?.data?.message;

        switch (status) {

            case 400:

                showMessage(
                    message ||
                    "Vui lòng nhập đầy đủ thông tin."
                );

                break;

            case 403:

                showMessage(
                    message ||
                    "Bạn không có quyền thực hiện."
                );

                break;

            case 404:

                showMessage(
                    message ||
                    "Không tìm thấy lô sản xuất."
                );

                break;

            case 409:

                showMessage(
                    message ||
                    "Không thể tạo lô hàng."
                );

                break;

            default:

                showMessage(
                    "Lỗi hệ thống."
                );

        }

    }

}

/* ============================================================
 * EVENTS
 * ============================================================
 */

function registerEvents() {

    DOM.btnOpen.addEventListener(
        "click",
        () => {

            loadPackagedLots();

            openModal();

        }
    );

    DOM.btnClose.addEventListener(
        "click",
        closeModal
    );

    DOM.btnCancel.addEventListener(
        "click",
        closeModal
    );

    DOM.form.addEventListener(
        "submit",
        submitShipment
    );

    setupLogout();

}

/* ============================================================
 * INIT
 * ============================================================
 */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderCurrentUser();

        registerEvents();

    }
);
function badgeClass(status){

    switch(status){

        case "ACTIVE":
            return "badge-green";

        case "INACTIVE":
            return "badge-orange";

        case "CODE_PRINTED":
            return "badge-blue";

        default:
            return "badge-blue";

    }

}
function renderShipment(){

    if(!STATE.shipment)
        return;

    DOM.shipmentTitle.textContent =
        STATE.shipment.name;

    DOM.shipmentId.textContent =
        STATE.shipment.id;

    DOM.productionLot.textContent =
        STATE.shipment.productionLotName;

    DOM.totalQuantityDisplay.textContent =
        `${STATE.shipment.totalQuantity} mã`;

    DOM.shipmentStatus.textContent =
        STATE.shipment.status;

    DOM.shipmentStatus.className =
        `status-badge ${badgeClass(STATE.shipment.status)}`;

}
function renderTraceCodes(){

    DOM.traceGrid.innerHTML="";

    if(!STATE.traceCodes.length){

        DOM.traceGrid.innerHTML=`

            <div class="empty-state">

                Không có mã QR

            </div>

        `;

        return;

    }

    STATE.traceCodes.forEach(trace=>{

        const card=createTraceCard(trace);

        DOM.traceGrid.appendChild(card);

    });

}
function createTraceCard(trace){

    const card=document.createElement("div");

    card.className="qr-card";

    card.innerHTML=`

        <div class="qr-card-header">

            <button class="btn-icon-xs">

                ⋮

            </button>

        </div>

        <div class="qr-image-wrapper">

            <img
                class="qr-img"
                src="${BASE_URL}${trace.qrImage}"
                alt="${trace.codeValue}"
            >

        </div>

        <div class="qr-card-info">

            <span class="qr-code-val">

                ${trace.codeValue}

            </span>

            <span class="status-badge ${badgeClass(trace.status)}">

                ${trace.status}

            </span>

        </div>

        <div class="qr-card-actions">

            <button
                class="btn-action-text download-btn">

                Tải QR

            </button>

            <button
                class="btn-action-text print-btn">

                In Tem

            </button>

            <button
                class="btn-action-solid btn-success-sm activate-btn">

                Kích hoạt

            </button>

        </div>

    `;

    setupCardEvents(card,trace);

    return card;

}
function downloadQR(trace){

    const a=document.createElement("a");

    a.href=
        BASE_URL+trace.qrImage;

    a.download=
        `${trace.codeValue}.png`;

    document.body.appendChild(a);

    a.click();

    a.remove();

}
function printQR(trace){

    const win=window.open("");

    win.document.write(`

        <html>

        <head>

            <title>${trace.codeValue}</title>

        </head>

        <body style="text-align:center">

            <h2>

                ${trace.codeValue}

            </h2>

            <img
                src="${BASE_URL}${trace.qrImage}"
                style="width:320px">

            <script>

                window.onload=function(){

                    window.print();

                }

            </script>

        </body>

        </html>

    `);

    win.document.close();

}
function setupCardEvents(card,trace){

    card
        .querySelector(".download-btn")
        .addEventListener("click",()=>{

            downloadQR(trace);

        });

    card
        .querySelector(".print-btn")
        .addEventListener("click",()=>{

            printQR(trace);

        });

    card
        .querySelector(".activate-btn")
        .addEventListener("click",()=>{

            alert(
                "Story kích hoạt tem chưa được triển khai."
            );

        });

}