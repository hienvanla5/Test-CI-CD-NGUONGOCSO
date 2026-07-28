import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import Header  from './components/layout/Header';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/cooperative/DashboardPage';
import FarmAreasPage from './pages/cooperative/FarmAreasPage';
 
// Layout cho các trang sau khi đăng nhập
function DashboardLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main>{children}</main>
      </div>
    </div>
  );
}
 
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/cooperative/dashboard" />} />
        <Route path="/cooperative/*" element={
          <DashboardLayout>
            <Routes>
              <Route path="dashboard"    element={<DashboardPage />} />
              <Route path="farm-areas"   element={<FarmAreasPage />} />
              {/* Thêm các route khác ở đây */}
            </Routes>
          </DashboardLayout>
        } />
      </Routes>
    </BrowserRouter>
  );
}
