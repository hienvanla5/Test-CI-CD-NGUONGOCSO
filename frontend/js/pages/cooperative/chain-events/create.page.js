import { requireAuth, setupLogout } from "../../../core/auth-guard.js";
import { getUser } from "../../../core/storage.js";
import { canRecordChainEvent } from "../../../core/permissions.js";
import { populateUserInfo } from "../../../components/user-info.js";
import { attachCustomDatePicker } from "../../../components/date-picker.js";
import { recordTransportEvent } from "../../../services/chain-event.service.js";
import { getElement, hideElement, showElement, showOnlyState, setDisabled } from "../../../utils/dom.utils.js";
import { isSupportedRecordEventType, truncateCode } from "../../../utils/chain-event.util.js";

const PRODUCTION_LOT_LIST_URL = "/frontend/pages/cooperative/production-lots/index.html";
const DEFAULT_SUBMIT_TEXT = "Lưu sự kiện";

const elements = {
    loadingState: getElement("loadingState"),
    errorState: getElement("errorState"),
    errorMessage: getElement("errorMessage"),
    unauthorizedState: getElement("unauthorizedState"),
    mainContent: getElement("mainContent"),

    form: getElement("chainEventForm"),
    formMessage: getElement("formMessage"),
    submitButton: getElement("submitButton"),

    eventTypeTabs: getElement("eventTypeTabs"),
    comingSoonNotice: getElement("comingSoonNotice"),

    productionLotFieldGroup: getElement("productionLotFieldGroup"),
    transportCodeHint: getElement("transportCodeHint"),
    harvestFields: getElement("harvestFields"),
    packagingFields: getElement("packagingFields"),
    locationFieldsRow: getElement("locationFieldsRow"),

    transportFields: getElement("transportFields"),
    fromLocation: getElement("fromLocation"),
    toLocation: getElement("toLocation"),
    transportTime: getElement("transportTime"),

    harvestDate: getElement("harvestDate"),
    packagingDate: getElement("packagingDate"),

    manualCode: getElement("manualCode"),
    applyManualCodeButton: getElement("applyManualCodeButton"),
    scannedCodeResult: getElement("scannedCodeResult"),
    scannedCodeValue: getElement("scannedCodeValue"),
    clearScannedCodeButton: getElement("clearScannedCodeButton"),
    scanStatus: getElement("scanStatus"),

    scanVideo: getElement("scanVideo"),
    scanCanvas: getElement("scanCanvas"),
    scanPlaceholder: getElement("scanPlaceholder"),
    scanFrame: getElement("scanFrame"),
    startScanButton: getElement("startScanButton"),
    stopScanButton: getElement("stopScanButton"),
    chooseQrImageButton: getElement("chooseQrImageButton"),
    qrImageInput: getElement("qrImageInput")
};

/* Trạng thái camera quét mã */
let mediaStream = null;
let scanAnimationFrameId = null;

const pageStates = {
    loading: elements.loadingState,
    error: elements.errorState,
    unauthorized: elements.unauthorizedState,
    main: elements.mainContent
};

const pageStateDisplays = {
    loading: "flex",
    error: "flex",
    unauthorized: "flex",
    main: "block"
};

let selectedEventType = "TRANSPORT";
let scannedCode = null;

function changePageState(stateName) {
    showOnlyState(pageStates, stateName, pageStateDisplays);
}

function showFormMessage(message, type = "error") {
    if (!elements.formMessage) return;
    elements.formMessage.textContent = message;
    elements.formMessage.className = `form-message ${type}`;
    showElement(elements.formMessage);
}

function hideFormMessage() {
    if (!elements.formMessage) return;
    elements.formMessage.textContent = "";
    elements.formMessage.className = "form-message";
    hideElement(elements.formMessage);
}

function selectEventType(eventType) {
    selectedEventType = eventType;

    const tabButtons = elements.eventTypeTabs?.querySelectorAll("[data-event-type]") || [];
    tabButtons.forEach((tabButton) => {
        const isActive = tabButton.dataset.eventType === eventType;
        tabButton.classList.toggle("is-active", isActive);
        tabButton.setAttribute("aria-selected", String(isActive));
    });

    hideFormMessage();

    if (selectedEventType === "TRANSPORT") {
        showElement(elements.transportFields);
        showElement(elements.transportCodeHint, "block");
        hideElement(elements.productionLotFieldGroup);
        hideElement(elements.harvestFields);
        hideElement(elements.packagingFields);
        hideElement(elements.locationFieldsRow);
        hideElement(elements.comingSoonNotice);
        setDisabled(elements.submitButton, false);
        elements.submitButton.textContent = DEFAULT_SUBMIT_TEXT;
    } else {
        hideElement(elements.transportFields);
        hideElement(elements.transportCodeHint);
        showElement(elements.comingSoonNotice, "block");
        setDisabled(elements.submitButton, true);
        elements.submitButton.textContent = "Chưa hỗ trợ";
    }
}

function showScannedCode(code) {
    scannedCode = code;
    if (elements.scannedCodeValue) {
        elements.scannedCodeValue.textContent = truncateCode(code, 40);
    }
    showElement(elements.scannedCodeResult, "flex");
}

function applyManualCode() {
    const codeValue = elements.manualCode?.value.trim() || "";
    if (!codeValue) {
        if (elements.scanStatus) elements.scanStatus.textContent = "Vui lòng nhập mã truy xuất.";
        return;
    }
    showScannedCode(codeValue);
    if (elements.scanStatus) elements.scanStatus.textContent = "Đã áp dụng mã nhập thủ công.";
}

/* ========================================
   QUÉT MÃ QR BẰNG CAMERA
======================================== */

function setScanStatus(message) {
    if (elements.scanStatus) elements.scanStatus.textContent = message;
}

function stopScanning() {
    if (scanAnimationFrameId) {
        window.cancelAnimationFrame(scanAnimationFrameId);
        scanAnimationFrameId = null;
    }

    if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
        mediaStream = null;
    }

    if (elements.scanVideo) {
        elements.scanVideo.srcObject = null;
        hideElement(elements.scanVideo);
    }

    hideElement(elements.scanFrame);
    showElement(elements.scanPlaceholder, "flex");
    hideElement(elements.stopScanButton);
    showElement(elements.startScanButton, "inline-flex");
    setScanStatus("Camera đang tắt");
}

function tickScanFrame() {
    if (!mediaStream || !elements.scanVideo || !elements.scanCanvas || typeof window.jsQR !== "function") {
        return;
    }

    const video = elements.scanVideo;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const canvas = elements.scanCanvas;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const context = canvas.getContext("2d");
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const scanResult = window.jsQR(imageData.data, imageData.width, imageData.height);

        if (scanResult && scanResult.data) {
            showScannedCode(scanResult.data);
            setScanStatus("Đã quét được mã từ camera.");
            stopScanning();
            return;
        }
    }

    scanAnimationFrameId = window.requestAnimationFrame(tickScanFrame);
}

async function startScanning() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setScanStatus("Trình duyệt này không hỗ trợ truy cập camera.");
        return;
    }

    if (typeof window.jsQR !== "function") {
        setScanStatus("Không thể tải thư viện quét mã QR.");
        return;
    }

    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "environment" },
            audio: false
        });

        if (!elements.scanVideo) return;

        elements.scanVideo.srcObject = mediaStream;
        await elements.scanVideo.play();

        hideElement(elements.scanPlaceholder);
        showElement(elements.scanVideo, "block");
        showElement(elements.scanFrame, "block");
        hideElement(elements.startScanButton);
        showElement(elements.stopScanButton, "inline-flex");
        setScanStatus("Đang quét, đưa mã QR vào khung hình...");

        scanAnimationFrameId = window.requestAnimationFrame(tickScanFrame);
    } catch (error) {
        console.error("[Chain Event Create] Không thể bật camera:", error);
        setScanStatus("Không thể truy cập camera. Vui lòng cấp quyền hoặc dùng ảnh QR có sẵn / nhập mã thủ công.");
    }
}

/* ========================================
   QUÉT MÃ QR TỪ ẢNH CÓ SẴN TRÊN THIẾT BỊ
======================================== */

function decodeQrFromImageElement(image) {
    if (!elements.scanCanvas || typeof window.jsQR !== "function") {
        return null;
    }

    const canvas = elements.scanCanvas;
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;

    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    return window.jsQR(imageData.data, imageData.width, imageData.height);
}

function handleQrImageSelected(event) {
    const file = event.target?.files?.[0];
    if (!file) return;

    if (typeof window.jsQR !== "function") {
        setScanStatus("Không thể tải thư viện quét mã QR.");
        return;
    }

    setScanStatus("Đang đọc mã QR từ ảnh đã chọn...");

    const reader = new FileReader();

    reader.onerror = function () {
        setScanStatus("Không thể đọc tệp ảnh đã chọn.");
    };

    reader.onload = function () {
        const image = new Image();

        image.onload = function () {
            const scanResult = decodeQrFromImageElement(image);

            if (scanResult && scanResult.data) {
                showScannedCode(scanResult.data);
                setScanStatus("Đã đọc được mã QR từ ảnh.");
            } else {
                setScanStatus("Không tìm thấy mã QR trong ảnh đã chọn. Vui lòng thử ảnh khác hoặc nhập mã thủ công.");
            }

            if (elements.qrImageInput) elements.qrImageInput.value = "";
        };

        image.onerror = function () {
            setScanStatus("Tệp đã chọn không phải là ảnh hợp lệ.");
            if (elements.qrImageInput) elements.qrImageInput.value = "";
        };

        image.src = reader.result;
    };

    reader.readAsDataURL(file);
}

function validateForm() {
    hideFormMessage();

    const activeCode = scannedCode || elements.manualCode?.value.trim();
    if (!activeCode) {
        showFormMessage("Vui lòng nhập hoặc quét mã truy xuất lô hàng.", "error");
        return false;
    }

    if (!elements.fromLocation?.value.trim()) {
        showFormMessage("Vui lòng nhập điểm xuất phát (fromLocation).", "error");
        return false;
    }

    if (!elements.toLocation?.value.trim()) {
        showFormMessage("Vui lòng nhập điểm đến (toLocation).", "error");
        return false;
    }

    if (!elements.transportTime?.value) {
        showFormMessage("Vui lòng chọn thời gian vận chuyển.", "error");
        return false;
    }

    return true;
}

async function handleSubmit(event) {
    event.preventDefault();

    if (!validateForm()) return;

    setDisabled(elements.submitButton, true);
    elements.submitButton.textContent = "Đang kết nối Backend...";

    try {
        let transportTimeVal = elements.transportTime.value;
        if (transportTimeVal && transportTimeVal.length === 16) {
            transportTimeVal += ":00"; // Chuẩn hóa ISO LocalDateTime
        }

        const requestBody = {
            codeValue: scannedCode || elements.manualCode.value.trim(),
            fromLocation: elements.fromLocation.value.trim(),
            toLocation: elements.toLocation.value.trim(),
            transportTime: transportTimeVal
        };

        const response = await recordTransportEvent(requestBody);

        showFormMessage("Ghi nhận sự kiện vận chuyển thành công!", "success");

        // Clear form
        elements.fromLocation.value = "";
        elements.toLocation.value = "";
        elements.transportTime.value = "";

    } catch (error) {
        console.error("[Transport Event Error]:", error);
        showFormMessage(error.message || "Không thể kết nối đến Backend.", "error");
    } finally {
        setDisabled(elements.submitButton, false);
        elements.submitButton.textContent = DEFAULT_SUBMIT_TEXT;
    }
}

function bindEvents() {
    const tabButtons = elements.eventTypeTabs?.querySelectorAll("[data-event-type]") || [];
    tabButtons.forEach((tabButton) => {
        tabButton.addEventListener("click", () => selectEventType(tabButton.dataset.eventType));
    });

    elements.applyManualCodeButton?.addEventListener("click", applyManualCode);
    elements.clearScannedCodeButton?.addEventListener("click", () => {
        scannedCode = null;
        hideElement(elements.scannedCodeResult);
        if (elements.manualCode) elements.manualCode.value = "";
    });

    elements.startScanButton?.addEventListener("click", startScanning);
    elements.stopScanButton?.addEventListener("click", stopScanning);
    elements.chooseQrImageButton?.addEventListener("click", () => {
        elements.qrImageInput?.click();
    });
    elements.qrImageInput?.addEventListener("change", handleQrImageSelected);

    window.addEventListener("beforeunload", stopScanning);

    elements.form?.addEventListener("submit", handleSubmit);

    attachCustomDatePicker(elements.harvestDate, { withTime: false });
    attachCustomDatePicker(elements.packagingDate, { withTime: false });
    attachCustomDatePicker(elements.transportTime, { withTime: true });
}

function initializePage() {
    if (!requireAuth()) return;

    const user = getUser();
    populateUserInfo(user);
    setupLogout();
    bindEvents();

    if (!canRecordChainEvent(user?.roleCode)) {
        changePageState("unauthorized");
        return;
    }

    selectEventType("TRANSPORT");
    
    // Chuyển ngay lập tức sang trạng thái main để ẩn spinner "Đang tải dữ liệu..."
    changePageState("main");
}

initializePage();