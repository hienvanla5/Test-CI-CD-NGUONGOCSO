import apiClient from '../api/apiClient';
 
const authService = {
  // Giữ nguyên endpoint từ dự án cũ
  login: (username, password) =>
    apiClient.post('/auth/login', { username, password }),
    
  getMyInfo: () =>
    apiClient.get('/users/my-info'),
    
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};
 
export default authService;
