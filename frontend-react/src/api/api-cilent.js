import axios from 'axios';
 
const apiClient = axios.create({
  baseURL: '/api',  // Vite proxy sẽ chuyển sang localhost:8080/api
  headers: { 'Content-Type': 'application/json' }
});
 
// Tự động gắn JWT token vào mọi request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});
 
// Tự động redirect về login nếu token hết hạn
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
 
export default apiClient;
