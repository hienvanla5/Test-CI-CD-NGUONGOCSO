/**
 * Hàm nạp HTML của Nav vào container chỉ định
 * @param {string} targetSelector - Selector của thẻ nav rỗng (Mặc định: '.sidebar-menu')
 */
export async function renderNav(targetSelector = '.sidebar-menu') {
    const targetElement = document.querySelector(targetSelector);

    if (!targetElement) {
        console.warn(`[Nav Component] Không tìm thấy phần tử chứa với selector: "${targetSelector}"`);
        return;
    }

    try {
        // Tự động định vị đường dẫn file nav.html nằm CÙNG CẤP với nav.js
        const navHtmlUrl = new URL('./nav.html', import.meta.url).href;

        const response = await fetch(navHtmlUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const htmlContent = await response.text();

        // Thay thế thẻ <nav class="sidebar-menu"></nav> rỗng bằng toàn bộ HTML từ nav.html
        targetElement.outerHTML = htmlContent;

    } catch (error) {
        console.error('[Nav Component] Lỗi khi tải nav.html:', error);
    }
}

// Tự động chạy hàm renderNav khi trang web nạp xong DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => renderNav());
} else {
    renderNav();
}