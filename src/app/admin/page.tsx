// src/app/admin/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* Cards thống kê */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded shadow">
          <p className="text-sm text-gray-500">Đơn hàng hôm nay</p>
          <p className="text-xl font-semibold">25</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <p className="text-sm text-gray-500">Doanh thu</p>
          <p className="text-xl font-semibold">12.5M</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <p className="text-sm text-gray-500">Sản phẩm hết hàng</p>
          <p className="text-xl font-semibold">3</p>
        </div>
        <div className="p-4 bg-white rounded shadow">
          <p className="text-sm text-gray-500">Người dùng mới</p>
          <p className="text-xl font-semibold">7</p>
        </div>
      </div>

      {/* Biểu đồ / hoạt động gần đây */}
      <div className="p-6 bg-white rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Hoạt động gần đây</h2>
        <ul className="space-y-2 text-gray-700">
          <li>🧾 Đơn hàng #1024 vừa được tạo</li>
          <li>👤 Người dùng mới: Nguyễn Văn A</li>
          <li>📦 Sản phẩm “Áo thun basic” vừa được thêm</li>
        </ul>
      </div>
    </div>
  );
}
