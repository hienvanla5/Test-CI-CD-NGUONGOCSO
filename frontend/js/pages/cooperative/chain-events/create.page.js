import {
    requireAuth,
    setupLogout
} from "../../../core/auth-guard.js";

import {
    getUser
} from "../../../core/storage.js";

import {
    canRecordChainEvent
} from "../../../core/permissions.js";

import {
    populateUserInfo
} from "../../../components/user-info.js";

import {
    getProductionLots
} from "../../../services/production-lot.service.js";

import {
    recordHarvestEvent,
    recordPackagingEvent
} from "../../../services/chain-event.service.js";

import {
    getElement,
    hideElement,
    showElement,
    showOnlyState,
    setDisabled
} from "../../../utils/dom.utils.js";

import {
    formatDate,
    formatDateTime,
    formatQuantity,
    optionalText
} from "../../../utils/farm-log.utils.js";

import {
    getChainEventLabel,
    getChainEventIcon,
    isSupportedRecordEventType,
    truncateCode
} from "../../../utils/chain-event.utils.js";

const PRODUCTION_LOT_LIST_URL =
    "/frontend/pages/cooperative/production-lots/index.html";

const DEFAULT_SUBMIT_TEXT =
    "Lưu sự kiện";

const elements = {
    loadingState:
        getElement("loadingState"),
    errorState:
        getElement("errorState"),
    errorMessage:
        getElement("errorMessage"),
    unauthorizedState:
        getElement("unauthorizedState"),
    mainContent:
        getElement("mainContent"),

    form:
        getElement("chainEventForm"),
    formMessage:
        getElement("formMessage"),
    submitButton:
        getElement("submitButton"),
    retryButton:
        getElement("retryButton"),
    backButton:
        getElement("backButton"),
    cancelButton:
        getElement("cancelButton"),

    productionLot:
        getElement("productionLotId"),

    eventTypeTabs:
        getElement("eventTypeTabs"),
    comingSoonNotice:
        getElement("comingSoonNotice"),

    harvestFields:
        getElement("harvestFields"),
    harvestDate:
        getElement("harvestDate"),
    harvestQuantity:
        getElement("harvestQuantity"),

    packagingFields:
        getElement("packagingFields"),
    packagingSpecification:
        getElement("packagingSpecification"),
    packagingDate:
        getElement("packagingDate"),

    latitude:
        getElement("latitude"),
    longitude:
        getElement("longitude"),
    useCurrentLocationButton:
        getElement("useCurrentLocationButton"),

    /* Quét mã */
    scanVideo:
        getElement("scanVideo"),
    scanCanvas:
        getElement("scanCanvas"),
    scanPlaceholder:
        getElement("scanPlaceholder"),
    scanFrame:
        getElement("scanFrame"),
    startScanButton:
        getElement("startScanButton"),
    stopScanButton:
        getElement("stopScanButton"),
    scanStatus:
        getElement("scanStatus"),
    manualCode:
        getElement("manualCode"),
    applyManualCodeButton:
        getElement("applyManualCodeButton"),
    scannedCodeResult:
        getElement("scannedCodeResult"),
    scannedCodeValue:
        getElement("scannedCodeValue"),
    clearScannedCodeButton:
        getElement("clearScannedCodeButton"),

    /* Timeline */
    timelineHint:
        getElement("timelineHint"),
    timelineDemoNotice:
        getElement("timelineDemoNotice"),
    timelineList:
        getElement("timelineList")
};

const pageStates = {
    loading:
        elements.loadingState,
    error:
        elements.errorState,
    unauthorized:
        elements.unauthorizedState,
    main:
        elements.mainContent
};

const pageStateDisplays = {
    loading: "flex",
    error: "flex",
    unauthorized: "flex",
    main: "block"
};

/*
 * Trạng thái chọn loại sự kiện hiện tại.
 * Mặc định HARVEST vì đây là loại có API thật
 * và là bước đầu của chuỗi sự kiện.
 */
let selectedEventType = "HARVEST";

/* Mã truy xuất đã quét hoặc nhập thủ công */
let scannedCode = null;

/* Trạng thái camera quét mã */
let mediaStream = null;
let scanAnimationFrameId = null;

const productionLotIdFromUrl =
    new URLSearchParams(
        window.location.search
    ).get("productionLotId");

function changePageState(stateName) {
    showOnlyState(
        pageStates,
        stateName,
        pageStateDisplays
    );
}

function goBack() {
    window.location.href =
        PRODUCTION_LOT_LIST_URL;
}

function showLoadError(message) {
    if (elements.errorMessage) {
        elements.errorMessage.textContent =
            message ||
            "Không thể tải dữ liệu.";
    }

    changePageState("error");
}

function showFormMessage(
    message,
    type = "error"
) {
    if (!elements.formMessage) {
        return;
    }

    elements.formMessage.textContent =
        message;

    elements.formMessage.className =
        `form-message ${type}`;

    showElement(
        elements.formMessage
    );
}

function hideFormMessage() {
    if (!elements.formMessage) {
        return;
    }

    elements.formMessage.textContent = "";
    elements.formMessage.className =
        "form-message";

    hideElement(
        elements.formMessage
    );
}

/* ========================================
   QUẢN LÝ LOẠI SỰ KIỆN (TABS)
======================================== */

function updateEventFieldsVisibility() {
    const isHarvest =
        selectedEventType === "HARVEST";

    const isPackaging =
        selectedEventType === "PACKAGING";

    if (isHarvest) {
        showElement(
            elements.harvestFields
        );
    } else {
        hideElement(
            elements.harvestFields
        );
    }

    if (isPackaging) {
        showElement(
            elements.packagingFields
        );
    } else {
        hideElement(
            elements.packagingFields
        );
    }

    const isSupported =
        isSupportedRecordEventType(
            selectedEventType
        );

    if (isSupported) {
        hideElement(
            elements.comingSoonNotice
        );
    } else {
        showElement(
            elements.comingSoonNotice,
            "block"
        );
    }

    setDisabled(
        elements.submitButton,
        !isSupported
    );

    elements.submitButton.textContent =
        isSupported
            ? DEFAULT_SUBMIT_TEXT
            : "Chưa hỗ trợ";
}

function selectEventType(eventType) {
    selectedEventType = eventType;

    const tabButtons =
        elements.eventTypeTabs
            ?.querySelectorAll(
                "[data-event-type]"
            ) || [];

    tabButtons.forEach(function (
        tabButton
    ) {
        const isActive =
            tabButton.dataset
                .eventType ===
            eventType;

        tabButton.classList.toggle(
            "is-active",
            isActive
        );

        tabButton.setAttribute(
            "aria-selected",
            String(isActive)
        );
    });

    hideFormMessage();
    updateEventFieldsVisibility();
}

function bindEventTypeTabs() {
    const tabButtons =
        elements.eventTypeTabs
            ?.querySelectorAll(
                "[data-event-type]"
            ) || [];

    tabButtons.forEach(function (
        tabButton
    ) {
        tabButton.addEventListener(
            "click",
            function () {
                selectEventType(
                    tabButton.dataset
                        .eventType
                );
            }
        );
    });
}

/* ========================================
   LÔ SẢN XUẤT
======================================== */

function createProductionLotOption(
    lot
) {
    const option =
        document.createElement(
            "option"
        );

    option.value =
        String(lot.id);

    option.textContent =
        `${lot.name || "Lô chưa đặt tên"} (${lot.status || "—"})`;

    return option;
}

function renderProductionLots(lots) {
    if (!elements.productionLot) {
        return;
    }

    elements.productionLot
        .replaceChildren();

    const placeholder =
        document.createElement(
            "option"
        );

    placeholder.value = "";
    placeholder.textContent =
        "-- Chọn lô sản xuất --";

    elements.productionLot
        .appendChild(placeholder);

    if (lots.length === 0) {
        const emptyOption =
            document.createElement(
                "option"
            );

        emptyOption.value = "";
        emptyOption.disabled = true;
        emptyOption.textContent =
            "Không có lô sản xuất nào";

        elements.productionLot
            .appendChild(
                emptyOption
            );

        setDisabled(
            elements.productionLot,
            true
        );

        setDisabled(
            elements.submitButton,
            true
        );

        showFormMessage(
            "Không có lô sản xuất phù hợp để ghi sự kiện.",
            "error"
        );

        return;
    }

    lots.forEach(function (lot) {
        elements.productionLot
            .appendChild(
                createProductionLotOption(
                    lot
                )
            );
    });

    setDisabled(
        elements.productionLot,
        false
    );

    if (productionLotIdFromUrl) {
        const selectedLot =
            lots.find(function (lot) {
                return (
                    String(lot.id) ===
                    String(
                        productionLotIdFromUrl
                    )
                );
            });

        if (selectedLot) {
            elements.productionLot.value =
                String(selectedLot.id);
        }
    }

    renderTimeline(
        elements.productionLot.value
    );
}

async function loadProductionLots() {
    changePageState("loading");
    hideFormMessage();

    try {
        const response =
            await getProductionLots();

        if (
            !response ||
            response.success !== true
        ) {
            throw new Error(
                response?.message ||
                "Không thể tải danh sách lô sản xuất."
            );
        }

        const lots =
            Array.isArray(response.data)
                ? response.data.filter(
                    function (lot) {
                        return Boolean(
                            lot &&
                            lot.id
                        );
                    }
                )
                : [];

        renderProductionLots(lots);
        updateEventFieldsVisibility();
        changePageState("main");
    } catch (error) {
        console.error(
            "[Chain Event Create] Không thể tải danh sách lô:",
            error
        );

        showLoadError(
            error.message ||
            "Không thể tải danh sách lô sản xuất."
        );
    }
}

/* ========================================
   QUÉT MÃ QR
======================================== */

function setScanStatus(message) {
    if (elements.scanStatus) {
        elements.scanStatus.textContent =
            message;
    }
}

function showScannedCode(code) {
    scannedCode = code;

    if (elements.scannedCodeValue) {
        elements.scannedCodeValue
            .textContent =
            truncateCode(code, 40);

        elements.scannedCodeValue.title =
            code;
    }

    showElement(
        elements.scannedCodeResult,
        "flex"
    );
}

function clearScannedCode() {
    scannedCode = null;

    hideElement(
        elements.scannedCodeResult
    );

    if (elements.manualCode) {
        elements.manualCode.value = "";
    }
}

function stopScanning() {
    if (scanAnimationFrameId) {
        window.cancelAnimationFrame(
            scanAnimationFrameId
        );

        scanAnimationFrameId = null;
    }

    if (mediaStream) {
        mediaStream
            .getTracks()
            .forEach(function (track) {
                track.stop();
            });

        mediaStream = null;
    }

    if (elements.scanVideo) {
        elements.scanVideo.srcObject =
            null;

        hideElement(
            elements.scanVideo
        );
    }

    hideElement(elements.scanFrame);

    showElement(
        elements.scanPlaceholder,
        "flex"
    );

    hideElement(
        elements.stopScanButton
    );

    showElement(
        elements.startScanButton,
        "inline-flex"
    );

    setScanStatus("Camera đang tắt");
}

function tickScanFrame() {
    if (
        !mediaStream ||
        !elements.scanVideo ||
        !elements.scanCanvas ||
        typeof window.jsQR !==
            "function"
    ) {
        return;
    }

    const video = elements.scanVideo;

    if (
        video.readyState ===
        video.HAVE_ENOUGH_DATA
    ) {
        const canvas =
            elements.scanCanvas;

        canvas.width =
            video.videoWidth;

        canvas.height =
            video.videoHeight;

        const context =
            canvas.getContext("2d");

        context.drawImage(
            video,
            0,
            0,
            canvas.width,
            canvas.height
        );

        const imageData =
            context.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
            );

        const scanResult =
            window.jsQR(
                imageData.data,
                imageData.width,
                imageData.height
            );

        if (
            scanResult &&
            scanResult.data
        ) {
            showScannedCode(
                scanResult.data
            );

            setScanStatus(
                "Đã quét được mã."
            );

            stopScanning();
            return;
        }
    }

    scanAnimationFrameId =
        window.requestAnimationFrame(
            tickScanFrame
        );
}

async function startScanning() {
    if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices
            .getUserMedia
    ) {
        setScanStatus(
            "Trình duyệt này không hỗ trợ truy cập camera."
        );

        return;
    }

    if (
        typeof window.jsQR !==
        "function"
    ) {
        setScanStatus(
            "Không thể tải thư viện quét mã QR."
        );

        return;
    }

    try {
        mediaStream =
            await navigator.mediaDevices
                .getUserMedia({
                    video: {
                        facingMode:
                            "environment"
                    },

                    audio: false
                });

        if (!elements.scanVideo) {
            return;
        }

        elements.scanVideo.srcObject =
            mediaStream;

        await elements.scanVideo
            .play();

        hideElement(
            elements.scanPlaceholder
        );

        showElement(
            elements.scanVideo,
            "block"
        );

        showElement(
            elements.scanFrame,
            "block"
        );

        hideElement(
            elements.startScanButton
        );

        showElement(
            elements.stopScanButton,
            "inline-flex"
        );

        setScanStatus(
            "Đang quét, đưa mã QR vào khung hình..."
        );

        scanAnimationFrameId =
            window.requestAnimationFrame(
                tickScanFrame
            );
    } catch (error) {
        console.error(
            "[Chain Event Create] Không thể bật camera:",
            error
        );

        setScanStatus(
            "Không thể truy cập camera. Vui lòng cấp quyền hoặc nhập mã thủ công."
        );
    }
}

function applyManualCode() {
    const codeValue =
        elements.manualCode
            ?.value.trim() || "";

    if (!codeValue) {
        setScanStatus(
            "Vui lòng nhập mã truy xuất."
        );

        return;
    }

    showScannedCode(codeValue);

    setScanStatus(
        "Đã dùng mã nhập thủ công."
    );
}

function bindScanEvents() {
    elements.startScanButton
        ?.addEventListener(
            "click",
            startScanning
        );

    elements.stopScanButton
        ?.addEventListener(
            "click",
            stopScanning
        );

    elements.applyManualCodeButton
        ?.addEventListener(
            "click",
            applyManualCode
        );

    elements.clearScannedCodeButton
        ?.addEventListener(
            "click",
            clearScannedCode
        );
}

/* ========================================
   VỊ TRÍ HIỆN TẠI
======================================== */

function useCurrentLocation() {
    if (!navigator.geolocation) {
        showFormMessage(
            "Trình duyệt không hỗ trợ định vị.",
            "error"
        );

        return;
    }

    setDisabled(
        elements.useCurrentLocationButton,
        true
    );

    navigator.geolocation
        .getCurrentPosition(
            function (position) {
                if (elements.latitude) {
                    elements.latitude
                        .value =
                        position.coords
                            .latitude.toFixed(
                                6
                            );
                }

                if (elements.longitude) {
                    elements.longitude
                        .value =
                        position.coords
                            .longitude.toFixed(
                                6
                            );
                }

                setDisabled(
                    elements.useCurrentLocationButton,
                    false
                );
            },
            function () {
                showFormMessage(
                    "Không thể lấy vị trí hiện tại.",
                    "error"
                );

                setDisabled(
                    elements.useCurrentLocationButton,
                    false
                );
            }
        );
}

/* ========================================
   DÒNG SỰ KIỆN (TIMELINE)
======================================== */

/*
 * Backend hiện chưa có API GET để lấy lịch sử
 * sự kiện theo lô sản xuất, nên đây là dữ liệu
 * minh họa để xem trước giao diện.
 *
 * Khi backend bổ sung endpoint (ví dụ
 * GET /api/v1/chain-events?productionLotId=...),
 * chỉ cần thay renderTimeline() để gọi
 * getChainEventTimeline() từ chain-event.service.js
 * thay vì buildMockTimeline().
 */
function buildMockTimeline(
    productionLotId
) {
    if (!productionLotId) {
        return [];
    }

    const now = new Date();

    function daysAgo(days) {
        const date =
            new Date(now);

        date.setDate(
            date.getDate() - days
        );

        return date.toISOString();
    }

    return [
        {
            eventType: "HARVEST",
            recordedAt: daysAgo(6),
            recordedByName:
                "Người ghi sự kiện",

            summary:
                `Thu hoạch ${formatQuantity(
                    850
                )} kg`
        },
        {
            eventType: "PACKAGING",
            recordedAt: daysAgo(4),
            recordedByName:
                "Người ghi sự kiện",

            summary:
                "Đóng gói: Thùng carton 10kg, 50 thùng/pallet"
        },
        {
            eventType: "TRANSPORT",
            recordedAt: daysAgo(2),
            recordedByName:
                "Đơn vị vận chuyển",

            summary:
                "Vận chuyển từ kho HTX đến kho trung chuyển"
        },
        {
            eventType: "PROCUREMENT",
            recordedAt: daysAgo(1),
            recordedByName:
                "Doanh nghiệp thu mua",

            summary:
                "Thu mua lô hàng tại kho trung chuyển"
        }
    ];
}

function createTimelineItem(event) {
    const listItem =
        document.createElement("li");

    listItem.className =
        "timeline-item";

    const icon =
        document.createElement("span");

    icon.className = "timeline-icon";
    icon.setAttribute(
        "aria-hidden",
        "true"
    );

    icon.textContent =
        getChainEventIcon(
            event.eventType
        );

    const content =
        document.createElement("div");

    content.className =
        "timeline-content";

    const title =
        document.createElement(
            "strong"
        );

    title.textContent =
        getChainEventLabel(
            event.eventType
        );

    const summary =
        document.createElement("p");

    summary.className =
        "timeline-summary";

    summary.textContent =
        event.summary || "—";

    const meta =
        document.createElement("span");

    meta.className = "timeline-meta";

    meta.textContent =
        `${formatDateTime(
            event.recordedAt
        )} • ${event.recordedByName || "—"}`;

    content.appendChild(title);
    content.appendChild(summary);
    content.appendChild(meta);

    listItem.appendChild(icon);
    listItem.appendChild(content);

    return listItem;
}

function renderTimeline(
    productionLotId
) {
    if (!elements.timelineList) {
        return;
    }

    elements.timelineList
        .replaceChildren();

    if (!productionLotId) {
        showElement(
            elements.timelineHint,
            "block"
        );

        hideElement(
            elements.timelineDemoNotice
        );

        return;
    }

    hideElement(
        elements.timelineHint
    );

    showElement(
        elements.timelineDemoNotice,
        "block"
    );

    const events =
        buildMockTimeline(
            productionLotId
        );

    if (events.length === 0) {
        const emptyItem =
            document.createElement(
                "li"
            );

        emptyItem.className =
            "timeline-empty";

        emptyItem.textContent =
            "Chưa có sự kiện nào được ghi nhận cho lô này.";

        elements.timelineList
            .appendChild(emptyItem);

        return;
    }

    events.forEach(function (event) {
        elements.timelineList
            .appendChild(
                createTimelineItem(
                    event
                )
            );
    });
}

/* ========================================
   VALIDATION & SUBMIT
======================================== */

function clearFieldErrors() {
    document
        .querySelectorAll(
            ".field-error"
        )
        .forEach(function (
            errorElement
        ) {
            errorElement.textContent =
                "";
        });

    document
        .querySelectorAll(
            ".input-error"
        )
        .forEach(function (
            inputElement
        ) {
            inputElement.classList
                .remove(
                    "input-error"
                );

            inputElement.setAttribute(
                "aria-invalid",
                "false"
            );
        });
}

function setFieldError(
    fieldElement,
    message
) {
    if (!fieldElement) {
        return;
    }

    fieldElement.classList.add(
        "input-error"
    );

    fieldElement.setAttribute(
        "aria-invalid",
        "true"
    );

    const errorElement =
        getElement(
            `${fieldElement.id}Error`
        );

    if (errorElement) {
        errorElement.textContent =
            message;
    }
}

function validateCoordinate(
    fieldElement,
    label
) {
    const value =
        fieldElement?.value || "";

    if (value === "") {
        return true;
    }

    if (
        Number.isNaN(Number(value))
    ) {
        setFieldError(
            fieldElement,
            `${label} không hợp lệ.`
        );

        return false;
    }

    return true;
}

function validateForm() {
    clearFieldErrors();

    let isValid = true;

    if (
        !elements.productionLot
            ?.value
    ) {
        setFieldError(
            elements.productionLot,
            "Vui lòng chọn lô sản xuất."
        );

        isValid = false;
    }

    if (
        selectedEventType ===
        "HARVEST"
    ) {
        if (
            !elements.harvestDate
                ?.value
        ) {
            setFieldError(
                elements.harvestDate,
                "Vui lòng chọn ngày thu hoạch."
            );

            isValid = false;
        }

        const quantityValue =
            elements.harvestQuantity
                ?.value || "";

        if (
            !quantityValue ||
            Number.isNaN(
                Number(quantityValue)
            ) ||
            Number(quantityValue) <= 0
        ) {
            setFieldError(
                elements.harvestQuantity,
                "Sản lượng thu hoạch phải lớn hơn 0."
            );

            isValid = false;
        }
    }

    if (
        selectedEventType ===
        "PACKAGING"
    ) {
        const specification =
            elements
                .packagingSpecification
                ?.value.trim() || "";

        if (!specification) {
            setFieldError(
                elements
                    .packagingSpecification,
                "Quy cách đóng gói không được để trống."
            );

            isValid = false;
        } else if (
            specification.length >
            255
        ) {
            setFieldError(
                elements
                    .packagingSpecification,
                "Quy cách đóng gói không được vượt quá 255 ký tự."
            );

            isValid = false;
        }

        if (
            !elements.packagingDate
                ?.value
        ) {
            setFieldError(
                elements.packagingDate,
                "Vui lòng chọn ngày đóng gói."
            );

            isValid = false;
        }
    }

    if (
        !validateCoordinate(
            elements.latitude,
            "Vĩ độ"
        )
    ) {
        isValid = false;
    }

    if (
        !validateCoordinate(
            elements.longitude,
            "Kinh độ"
        )
    ) {
        isValid = false;
    }

    return isValid;
}

function buildLocationFields() {
    const latitudeValue =
        elements.latitude?.value;

    const longitudeValue =
        elements.longitude?.value;

    return {
        latitude:
            latitudeValue === "" ||
            latitudeValue === undefined
                ? null
                : Number(latitudeValue),

        longitude:
            longitudeValue === "" ||
            longitudeValue === undefined
                ? null
                : Number(
                    longitudeValue
                )
    };
}

function buildRequestBody() {
    const productionLotId =
        elements.productionLot.value;

    const locationFields =
        buildLocationFields();

    if (
        selectedEventType ===
        "HARVEST"
    ) {
        return {
            productionLotId,

            harvestDate:
                elements.harvestDate
                    .value,

            quantity:
                Number(
                    elements
                        .harvestQuantity
                        .value
                ),

            ...locationFields
        };
    }

    return {
        productionLotId,

        packagingSpecification:
            elements
                .packagingSpecification
                .value.trim(),

        packagingDate:
            elements.packagingDate
                .value,

        ...locationFields
    };
}

function setSubmitting(submitting) {
    setDisabled(
        elements.submitButton,
        submitting
    );

    if (!elements.submitButton) {
        return;
    }

    elements.submitButton
        .setAttribute(
            "aria-busy",
            String(submitting)
        );

    elements.submitButton.textContent =
        submitting
            ? "Đang lưu..."
            : DEFAULT_SUBMIT_TEXT;
}

async function handleSubmit(event) {
    event.preventDefault();
    hideFormMessage();

    if (
        !isSupportedRecordEventType(
            selectedEventType
        )
    ) {
        showFormMessage(
            "Loại sự kiện này chưa có API ghi nhận ở backend.",
            "error"
        );

        return;
    }

    if (!validateForm()) {
        showFormMessage(
            "Vui lòng kiểm tra lại thông tin đã nhập.",
            "error"
        );

        return;
    }

    setSubmitting(true);

    try {
        const requestBody =
            buildRequestBody();

        const response =
            selectedEventType ===
            "HARVEST"
                ? await recordHarvestEvent(
                    requestBody
                )
                : await recordPackagingEvent(
                    requestBody
                );

        if (
            !response ||
            response.success !== true
        ) {
            throw new Error(
                response?.message ||
                "Không thể lưu sự kiện."
            );
        }

        showFormMessage(
            `Ghi sự kiện ${getChainEventLabel(
                selectedEventType
            ).toLowerCase()} thành công.`,
            "success"
        );

        renderTimeline(
            elements.productionLot
                .value
        );

        window.setTimeout(
            function () {
                hideFormMessage();
                setSubmitting(false);
            },
            1500
        );
    } catch (error) {
        console.error(
            "[Chain Event Create] Không thể lưu sự kiện:",
            error
        );

        showFormMessage(
            error.message ||
            "Không thể lưu sự kiện.",
            "error"
        );

        setSubmitting(false);
    }
}

function bindEvents() {
    bindEventTypeTabs();
    bindScanEvents();

    elements.productionLot
        ?.addEventListener(
            "change",
            function () {
                renderTimeline(
                    elements
                        .productionLot
                        .value
                );
            }
        );

    elements.useCurrentLocationButton
        ?.addEventListener(
            "click",
            useCurrentLocation
        );

    elements.form?.addEventListener(
        "submit",
        handleSubmit
    );

    elements.backButton
        ?.addEventListener(
            "click",
            goBack
        );

    elements.cancelButton
        ?.addEventListener(
            "click",
            goBack
        );

    elements.retryButton
        ?.addEventListener(
            "click",
            loadProductionLots
        );

    window.addEventListener(
        "beforeunload",
        stopScanning
    );
}

function initializePage() {
    if (!requireAuth()) {
        return;
    }

    const user = getUser();

    populateUserInfo(user);
    setupLogout();
    bindEvents();
    selectEventType("HARVEST");

    if (
        !canRecordChainEvent(
            user?.roleCode
        )
    ) {
        changePageState(
            "unauthorized"
        );

        return;
    }

    loadProductionLots();
}

initializePage();