/**
 * Nguồn Gốc Số - Client Connection Logic
 */

const API_BASE_URL = 'http://localhost:8080/api/v1';

// DOM Elements
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const orgCodeInput = document.getElementById('org-code');
const errorMessageDiv = document.getElementById('error-message');

/**
 * Handle form submission
 */
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError();

    const payload = {
        username: usernameInput.value.trim(),
        password: passwordInput.value,
        organizationCode: orgCodeInput.value.trim() || null
    };

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok) {
            // Save authentication details in localStorage
            localStorage.setItem('accessToken', result.accessToken);
            localStorage.setItem('user', JSON.stringify(result.user));
            
            // Show successful connection alert with details
            alert(`Đăng nhập thành công!\nChào mừng ${result.user.fullName} (${getFriendlyRoleName(result.user.roleCode)}) thuộc tổ chức ${result.user.organizationName}.`);
            
            // Optional: Redirect to dashboard or do other action
            console.log('Login successful, token:', result.accessToken);
        } else {
            // Show errors from backend
            showError(result.message || 'Sai thông tin đăng nhập hoặc lỗi hệ thống');
        }
    } catch (err) {
        console.error('API Connection Error:', err);
        showError('Không thể kết nối đến backend (hãy kiểm tra xem Spring Boot đã chạy chưa)');
    }
});

function showError(message) {
    errorMessageDiv.textContent = message;
    errorMessageDiv.style.display = 'block';
}

function hideError() {
    errorMessageDiv.style.display = 'none';
    errorMessageDiv.textContent = '';
}

/**
 * Map role codes (VT-xx) to user-friendly titles in Vietnamese
 */
function getFriendlyRoleName(roleCode) {
    const roles = {
        'VT-01': 'Quản trị viên nền tảng',
        'VT-02': 'Quản lý hợp tác xã',
        'VT-03': 'Người ghi sự kiện',
        'VT-04': 'Nhân viên thu mua (Doanh nghiệp)',
        'VT-05': 'Cán bộ quản lý ngành'
    };
    return roles[roleCode] || roleCode || 'Thành viên';
}
