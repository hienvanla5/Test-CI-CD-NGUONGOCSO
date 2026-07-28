import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
 
// Đây là Component React - giống 1 file HTML nhưng viết trong JS
export default function LoginPage() {
  // useState: thay thế document.getElementById('username').value
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  
  // useNavigate: thay thế window.location.href
  const navigate = useNavigate();
 
  const handleSubmit = async (e) => {
    e.preventDefault();  // Ngăn form reload trang
    setLoading(true);
    setError('');
    
    try {
      const response = await authService.login(username, password);
      // Lưu token (giống dự án cũ)
      localStorage.setItem('accessToken', response.data.accessToken);
      // Chuyển trang (dựa vào role)
      navigate('/cooperative/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };
 
  // JSX: HTML viết bên trong JS (không cần file .html riêng)
  return (
    <div className="login-page">
      <div className="login-card">
        <h2>🌿 Nguồn Gốc Số</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Tên đăng nhập"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="form-control"
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control"
          />
          {/* Hiển thị lỗi nếu có - React tự ẩn/hiện */}
          {error && <p className="error-message">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
      </div>
    </div>
  );
}
