import { useState, useEffect } from 'react';
import farmAreaService from '../../services/farmAreaService';
 
export default function FarmAreasPage() {
  const [farmAreas, setFarmAreas] = useState([]);  // Mảng rỗng ban đầu
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
 
  // useEffect: chạy 1 lần khi component xuất hiện (= DOMContentLoaded)
  useEffect(() => {
    loadFarmAreas();
  }, []);  // [] = chỉ chạy 1 lần
 
  const loadFarmAreas = async () => {
    try {
      setLoading(true);
      const response = await farmAreaService.getAll();
      setFarmAreas(response.data.content || response.data);
    } catch (err) {
      setError('Không thể tải dữ liệu vùng trồng');
    } finally {
      setLoading(false);
    }
  };
 
  const handleDelete = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa?')) return;
    try {
      await farmAreaService.delete(id);
      // Cập nhật UI ngay lập tức (không cần reload trang)
      setFarmAreas(prev => prev.filter(area => area.id !== id));
    } catch (err) {
      alert('Xóa thất bại');
    }
  };
 
  // Lọc theo search (React tính toán lại mỗi khi search thay đổi)
  const filtered = farmAreas.filter(area =>
    area.name.toLowerCase().includes(search.toLowerCase())
  );
 
  if (loading) return <div className="loading">Đang tải...</div>;
  if (error)   return <div className="error">{error}</div>;
 
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🌾 Danh sách vùng trồng</h1>
        <a href="/cooperative/farm-areas/create" className="btn-primary">
          + Thêm vùng trồng
        </a>
      </div>
      <input
        className="search-input"
        placeholder="Tìm kiếm..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <table className="data-table">
        <thead>
          <tr>
            <th>Tên vùng trồng</th>
            <th>Diện tích</th>
            <th>Loại cây trồng</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((area) => (
            <tr key={area.id}>
              <td>{area.name}</td>
              <td>{area.area} ha</td>
              <td>{area.cropType}</td>
              <td>
                <button onClick={() => navigate(`/cooperative/farm-areas/${area.id}/edit`)}>
                  Sửa
                </button>
                <button onClick={() => handleDelete(area.id)}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
