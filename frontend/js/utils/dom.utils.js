/**
 * Tìm phần tử theo id.
 */
export function getElement(
    elementId,
    root = document
) {
    if (!elementId) {
        return null;
    }

    return root.getElementById
        ? root.getElementById(elementId)
        : root.querySelector(
            `#${CSS.escape(elementId)}`
        );
}

/**
 * Ẩn một phần tử.
 */
export function hideElement(element) {
    if (!element) {
        return;
    }

    element.hidden = true;
    element.classList.add("is-hidden");
    element.style.display = "none";
}

/**
 * Hiện một phần tử.
 */
export function showElement(
    element,
    displayValue = "block"
) {
    if (!element) {
        return;
    }

    element.hidden = false;
    element.classList.remove(
        "is-hidden"
    );

    element.style.display =
        displayValue;
}

/**
 * Chỉ hiển thị một state trong object.
 *
 * Ví dụ:
 * showOnlyState(states, "loading", {
 *     loading: "flex",
 *     main: "block"
 * });
 */
export function showOnlyState(
    states,
    activeState,
    displayValues = {}
) {
    Object.entries(states)
        .forEach(function ([
            stateName,
            element
        ]) {
            if (stateName === activeState) {
                showElement(
                    element,
                    displayValues[
                        stateName
                    ] || "block"
                );
            } else {
                hideElement(element);
            }
        });
}

/**
 * Gán nội dung text an toàn.
 */
export function setText(
    element,
    value,
    fallback = "—"
) {
    if (!element) {
        return;
    }

    const hasValue =
        value !== null &&
        value !== undefined &&
        value !== "";

    element.textContent =
        hasValue
            ? String(value)
            : fallback;
}

/**
 * Xóa toàn bộ phần tử con.
 */
export function clearElement(element) {
    if (!element) {
        return;
    }

    element.replaceChildren();
}

/**
 * Bật hoặc tắt một control.
 */
export function setDisabled(
    element,
    disabled
) {
    if (!element) {
        return;
    }

    element.disabled =
        Boolean(disabled);
}