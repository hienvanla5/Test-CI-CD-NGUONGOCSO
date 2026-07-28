import { NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
 
const menuItems = [
  { path: '/cooperative/dashboard',   icon: '🏠', label: 'Tổng quan' },
  { path: '/cooperative/farm-areas',  icon: '🌾', label: 'Vùng trồng' },
  { path: '/cooperative/farm-logs',   icon: '📋', label: 'Nhật ký canh tác' },
  { path: '/cooperative/production-lots', icon: '📦', label: 'Lô sản xuất' },
  { path: '/cooperative/shipments',   icon: '🚚', label: 'Lô hàng' },
  { path: '/cooperative/trace-codes', icon: '🔖', label: 'Mã truy xuất' },
  { path: '/cooperative/profile',     icon: '⚙️', label: 'Hồ sơ HTX' },
];
 
export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
 
  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-logo">
        <span>🌿</span>
        {!collapsed && <span>Nguồn Gốc Số</span>}
      </div>
      <nav>
        {menuItems.map((item) => (
          // NavLink tự thêm class 'active' khi đúng trang
          <NavLink key={item.path} to={item.path}
            className={({ isActive }) =>
              'nav-item' + (isActive ? ' active' : '')}>
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
