/**
 * Date / datetime picker tự build.
 *
 * Thay thế popup lịch mặc định của trình duyệt (không thể
 * style bằng CSS) bằng một popup tự vẽ, có viền/shadow rõ
 * ràng, dùng chung bộ màu --color-* của dự án.
 *
 * Input gốc vẫn giữ nguyên type="date" / type="datetime-local"
 * và format value chuẩn (YYYY-MM-DD hoặc YYYY-MM-DDTHH:mm) để
 * không phá vỡ code validate/submit hiện có. Input chỉ được
 * chuyển sang readonly để chặn popup gốc của trình duyệt hiện lên.
 */

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_LABELS = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12"
];

function pad2(value) {
    return String(value).padStart(2, "0");
}

function toDateOnlyValue(date) {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function toDateTimeValue(date) {
    return `${toDateOnlyValue(date)}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

function parseDateOnly(value) {
    if (!value) return null;
    const parts = value.split("-").map(Number);
    if (parts.length !== 3 || parts.some(Number.isNaN)) return null;
    const [year, month, day] = parts;
    return new Date(year, month - 1, day);
}

function parseDateTime(value) {
    if (!value) return null;
    const [datePart, timePart = "00:00"] = value.split("T");
    const date = parseDateOnly(datePart);
    if (!date) return null;
    const [hours, minutes] = timePart.split(":").map(Number);
    date.setHours(Number.isNaN(hours) ? 0 : hours, Number.isNaN(minutes) ? 0 : minutes, 0, 0);
    return date;
}

function isSameDay(a, b) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function buildCalendarDays(viewYear, viewMonth) {
    const firstOfMonth = new Date(viewYear, viewMonth, 1);
    const startOffset = firstOfMonth.getDay();
    const gridStart = new Date(viewYear, viewMonth, 1 - startOffset);

    const days = [];
    for (let i = 0; i < 42; i += 1) {
        const cellDate = new Date(gridStart);
        cellDate.setDate(gridStart.getDate() + i);
        days.push(cellDate);
    }
    return days;
}

/**
 * Gắn picker tự build vào một input.
 *
 * @param {HTMLInputElement} inputElement - input type="date" hoặc "datetime-local"
 * @param {{ withTime?: boolean, onChange?: (value: string) => void }} options
 */
export function attachCustomDatePicker(inputElement, options = {}) {
    if (!inputElement) return null;

    const withTime = options.withTime ?? inputElement.type === "datetime-local";
    const onChange = typeof options.onChange === "function" ? options.onChange : null;

    inputElement.readOnly = true;
    inputElement.classList.add("dp-input");
    inputElement.autocomplete = "off";

    const wrapper = document.createElement("div");
    wrapper.className = "dp-wrapper";
    inputElement.parentNode.insertBefore(wrapper, inputElement);
    wrapper.appendChild(inputElement);

    const popup = document.createElement("div");
    popup.className = "dp-popup is-hidden";
    popup.setAttribute("role", "dialog");
    popup.setAttribute("aria-label", withTime ? "Chọn ngày và giờ" : "Chọn ngày");
    wrapper.appendChild(popup);

    let viewDate = new Date();
    let selectedDate = null;

    function currentValueToDate() {
        return withTime ? parseDateTime(inputElement.value) : parseDateOnly(inputElement.value);
    }

    function commitValue(date) {
        selectedDate = date;
        inputElement.value = withTime ? toDateTimeValue(date) : toDateOnlyValue(date);
        inputElement.dispatchEvent(new Event("input", { bubbles: true }));
        inputElement.dispatchEvent(new Event("change", { bubbles: true }));
        if (onChange) onChange(inputElement.value);
    }

    function renderHeader(container) {
        const header = document.createElement("div");
        header.className = "dp-header";

        const monthLabel = document.createElement("button");
        monthLabel.type = "button";
        monthLabel.className = "dp-month-label";
        monthLabel.textContent = `${MONTH_LABELS[viewDate.getMonth()]} ${viewDate.getFullYear()}`;

        const navGroup = document.createElement("div");
        navGroup.className = "dp-nav-group";

        const prevButton = document.createElement("button");
        prevButton.type = "button";
        prevButton.className = "dp-nav-button";
        prevButton.setAttribute("aria-label", "Tháng trước");
        prevButton.textContent = "‹";
        prevButton.addEventListener("click", () => {
            viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
            render();
        });

        const nextButton = document.createElement("button");
        nextButton.type = "button";
        nextButton.className = "dp-nav-button";
        nextButton.setAttribute("aria-label", "Tháng sau");
        nextButton.textContent = "›";
        nextButton.addEventListener("click", () => {
            viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
            render();
        });

        navGroup.appendChild(prevButton);
        navGroup.appendChild(nextButton);
        header.appendChild(monthLabel);
        header.appendChild(navGroup);
        container.appendChild(header);
    }

    function renderWeekdays(container) {
        const row = document.createElement("div");
        row.className = "dp-weekday-row";
        WEEKDAY_LABELS.forEach((label) => {
            const cell = document.createElement("span");
            cell.className = "dp-weekday-cell";
            cell.textContent = label;
            row.appendChild(cell);
        });
        container.appendChild(row);
    }

    function renderDays(container) {
        const grid = document.createElement("div");
        grid.className = "dp-day-grid";

        const today = new Date();
        const days = buildCalendarDays(viewDate.getFullYear(), viewDate.getMonth());

        days.forEach((cellDate) => {
            const cellButton = document.createElement("button");
            cellButton.type = "button";
            cellButton.className = "dp-day-cell";
            cellButton.textContent = String(cellDate.getDate());

            if (cellDate.getMonth() !== viewDate.getMonth()) {
                cellButton.classList.add("is-outside");
            }
            if (isSameDay(cellDate, today)) {
                cellButton.classList.add("is-today");
            }
            if (selectedDate && isSameDay(cellDate, selectedDate)) {
                cellButton.classList.add("is-selected");
            }

            cellButton.addEventListener("click", () => {
                const merged = new Date(cellDate);
                if (withTime && selectedDate) {
                    merged.setHours(selectedDate.getHours(), selectedDate.getMinutes(), 0, 0);
                }
                commitValue(merged);
                render();
                if (!withTime) closePopup();
            });

            grid.appendChild(cellButton);
        });

        container.appendChild(grid);
    }

    function renderTime(container) {
        if (!withTime) return;

        const timeRow = document.createElement("div");
        timeRow.className = "dp-time-row";

        const current = selectedDate || new Date();

        const hourSelect = document.createElement("select");
        hourSelect.className = "dp-time-select";
        hourSelect.setAttribute("aria-label", "Giờ");
        for (let h = 0; h < 24; h += 1) {
            const opt = document.createElement("option");
            opt.value = String(h);
            opt.textContent = pad2(h);
            if (h === current.getHours()) opt.selected = true;
            hourSelect.appendChild(opt);
        }

        const separator = document.createElement("span");
        separator.className = "dp-time-separator";
        separator.textContent = ":";

        const minuteSelect = document.createElement("select");
        minuteSelect.className = "dp-time-select";
        minuteSelect.setAttribute("aria-label", "Phút");
        for (let m = 0; m < 60; m += 5) {
            const opt = document.createElement("option");
            opt.value = String(m);
            opt.textContent = pad2(m);
            if (m === current.getMinutes() - (current.getMinutes() % 5)) opt.selected = true;
            minuteSelect.appendChild(opt);
        }

        function applyTimeChange() {
            const base = selectedDate ? new Date(selectedDate) : new Date(viewDate);
            base.setHours(Number(hourSelect.value), Number(minuteSelect.value), 0, 0);
            commitValue(base);
        }

        hourSelect.addEventListener("change", applyTimeChange);
        minuteSelect.addEventListener("change", applyTimeChange);

        timeRow.appendChild(hourSelect);
        timeRow.appendChild(separator);
        timeRow.appendChild(minuteSelect);
        container.appendChild(timeRow);
    }

    function renderFooter(container) {
        const footer = document.createElement("div");
        footer.className = "dp-footer";

        const clearButton = document.createElement("button");
        clearButton.type = "button";
        clearButton.className = "dp-text-button";
        clearButton.textContent = "Xóa";
        clearButton.addEventListener("click", () => {
            selectedDate = null;
            inputElement.value = "";
            inputElement.dispatchEvent(new Event("input", { bubbles: true }));
            inputElement.dispatchEvent(new Event("change", { bubbles: true }));
            if (onChange) onChange("");
            closePopup();
        });

        const todayButton = document.createElement("button");
        todayButton.type = "button";
        todayButton.className = "dp-text-button dp-text-button--primary";
        todayButton.textContent = "Hôm nay";
        todayButton.addEventListener("click", () => {
            const now = new Date();
            viewDate = new Date(now.getFullYear(), now.getMonth(), 1);
            commitValue(now);
            render();
            if (!withTime) closePopup();
        });

        footer.appendChild(clearButton);
        footer.appendChild(todayButton);
        container.appendChild(footer);
    }

    function render() {
        popup.replaceChildren();
        renderHeader(popup);
        renderWeekdays(popup);
        renderDays(popup);
        renderTime(popup);
        renderFooter(popup);

        if (!popup.classList.contains("is-hidden")) {
            positionPopup();
        }
    }

    function positionPopup() {
        const inputRect = inputElement.getBoundingClientRect();
        const popupRect = popup.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const margin = 8;

        // Chiều dọc: mở xuống dưới nếu đủ chỗ, ngược lại mở lên trên input.
        const spaceBelow = viewportHeight - inputRect.bottom;
        const spaceAbove = inputRect.top;
        const openUpward = spaceBelow < popupRect.height + margin && spaceAbove > spaceBelow;

        let top = openUpward
            ? inputRect.top - popupRect.height - margin
            : inputRect.bottom + margin;

        // Không để popup vượt quá đỉnh/đáy viewport dù đã chọn hướng.
        top = Math.max(margin, Math.min(top, viewportHeight - popupRect.height - margin));

        // Chiều ngang: căn theo trái input, nhưng kéo vào nếu tràn phải/trái.
        let left = inputRect.left;
        if (left + popupRect.width + margin > viewportWidth) {
            left = viewportWidth - popupRect.width - margin;
        }
        left = Math.max(margin, left);

        popup.style.top = `${top}px`;
        popup.style.left = `${left}px`;
    }

    function handleReposition() {
        if (!popup.classList.contains("is-hidden")) {
            positionPopup();
        }
    }

    function openPopup() {
        const existing = currentValueToDate();
        selectedDate = existing;
        viewDate = existing ? new Date(existing.getFullYear(), existing.getMonth(), 1) : new Date();
        render();
        popup.classList.remove("is-hidden");
        positionPopup();
        inputElement.setAttribute("aria-expanded", "true");
        document.addEventListener("mousedown", handleOutsideClick, true);
        document.addEventListener("keydown", handleKeyDown, true);
        window.addEventListener("resize", handleReposition);
        window.addEventListener("scroll", handleReposition, true);
    }

    function closePopup() {
        popup.classList.add("is-hidden");
        inputElement.setAttribute("aria-expanded", "false");
        document.removeEventListener("mousedown", handleOutsideClick, true);
        document.removeEventListener("keydown", handleKeyDown, true);
        window.removeEventListener("resize", handleReposition);
        window.removeEventListener("scroll", handleReposition, true);
    }

    function handleOutsideClick(event) {
        if (!wrapper.contains(event.target)) {
            closePopup();
        }
    }

    function handleKeyDown(event) {
        if (event.key === "Escape") {
            closePopup();
        }
    }

    inputElement.addEventListener("click", () => {
        if (popup.classList.contains("is-hidden")) {
            openPopup();
        } else {
            closePopup();
        }
    });

    inputElement.setAttribute("aria-haspopup", "dialog");
    inputElement.setAttribute("aria-expanded", "false");

    return {
        close: closePopup,
        destroy() {
            closePopup();
            wrapper.replaceWith(inputElement);
        }
    };
}