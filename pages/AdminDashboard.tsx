import { useState, useEffect } from 'react';
import { backend } from '../services/backend';
import { DashboardStats, Order, Product } from '../types';

// Product Form Component
function ProductFormModal({ product, onClose, onSave }: { product: Product | null; onClose: () => void; onSave: () => void }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    brand: product?.brand || '',
    imageUrl: product?.imageUrl || '',
    price: product?.price?.toString() || '',
    description: product?.description || '',
    stockQuantity: product?.stockQuantity?.toString() || '0',
    status: product?.status || 'active',
    ram: product?.ram?.toString() || '',
    storage: product?.storage?.toString() || '',
    screenSize: product?.screenSize?.toString() || '',
    screenResolution: product?.screenResolution || '',
    battery: product?.battery?.toString() || '',
    cameraMain: product?.cameraMain?.toString() || '',
    processor: product?.processor || '',
    color: product?.color || '',
    operatingSystem: product?.operatingSystem || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (product) {
        await backend.updateProduct(product.id, {
          name: formData.name,
          brand: formData.brand,
          imageUrl: formData.imageUrl,
          price: parseFloat(formData.price),
          description: formData.description,
          stockQuantity: parseInt(formData.stockQuantity),
          status: formData.status as 'active' | 'inactive',
          ram: formData.ram ? parseInt(formData.ram) : undefined,
          storage: formData.storage ? parseInt(formData.storage) : undefined,
          screenSize: formData.screenSize ? parseFloat(formData.screenSize) : undefined,
          screenResolution: formData.screenResolution || undefined,
          battery: formData.battery ? parseInt(formData.battery) : undefined,
          cameraMain: formData.cameraMain ? parseInt(formData.cameraMain) : undefined,
          processor: formData.processor || undefined,
          color: formData.color || undefined,
          operatingSystem: formData.operatingSystem || undefined,
        });
      } else {
        await backend.createProduct({
          name: formData.name,
          brand: formData.brand,
          imageUrl: formData.imageUrl,
          price: parseFloat(formData.price),
          description: formData.description,
          stockQuantity: parseInt(formData.stockQuantity),
          status: formData.status as 'active' | 'inactive',
          ram: formData.ram ? parseInt(formData.ram) : undefined,
          storage: formData.storage ? parseInt(formData.storage) : undefined,
          screenSize: formData.screenSize ? parseFloat(formData.screenSize) : undefined,
          screenResolution: formData.screenResolution || undefined,
          battery: formData.battery ? parseInt(formData.battery) : undefined,
          cameraMain: formData.cameraMain ? parseInt(formData.cameraMain) : undefined,
          processor: formData.processor || undefined,
          color: formData.color || undefined,
          operatingSystem: formData.operatingSystem || undefined,
        });
      }
      onSave();
    } catch (error) {
      alert('Có lỗi xảy ra khi lưu sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '0.5rem',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>{product ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Tên sản phẩm *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Hãng *</label>
            <select
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
            >
              <option value="">Chọn hãng</option>
              <option value="Apple">Apple</option>
              <option value="Samsung">Samsung</option>
              <option value="Xiaomi">Xiaomi</option>
              <option value="Google">Google</option>
              <option value="OnePlus">OnePlus</option>
            </select>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>URL hình ảnh</label>
            <input
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Giá (VND) *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Mô tả</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Số lượng tồn kho *</label>
            <input
              type="number"
              min="0"
              value={formData.stockQuantity}
              onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
              required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
            />
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Trạng thái</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
              type="submit"
              disabled={loading}
              style={{ flex: 1, padding: '0.75rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '500' }}
            >
              {loading ? 'Đang lưu...' : 'Lưu'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: '0.75rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type Tab = 'overview' | 'orders' | 'products' | 'customers';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    orderStatus: '',
    orderDateFrom: '',
    orderDateTo: '',
    customerId: '',
    productBrand: '',
    productStatus: '',
    customerSearch: '',
  });

  useEffect(() => {
    // Load customers first để có thể filter orders theo customer
    if (activeTab === 'orders' && customers.length === 0) {
      backend.getCustomers().then(setCustomers).catch(console.error);
    }
    loadData();
  }, [activeTab, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const data = await backend.getDashboardStats();
        setStats(data);
      } else if (activeTab === 'orders') {
        const data = await backend.getAdminOrders({
          status: filters.orderStatus || undefined,
          startDate: filters.orderDateFrom || undefined,
          endDate: filters.orderDateTo || undefined,
          customerId: filters.customerId || undefined,
        });
        setOrders(data.orders);
        setTotalRevenue(data.totalRevenue);
      } else if (activeTab === 'products') {
        const data = await backend.getProducts({
          brand: filters.productBrand || undefined,
          status: filters.productStatus || undefined,
        });
        setProducts(data);
      } else if (activeTab === 'customers') {
        const data = await backend.getCustomers({
          search: filters.customerSearch || undefined,
        });
        setCustomers(data);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLockCustomer = async (customerId: string, isLocked: boolean) => {
    if (!confirm(`Bạn có chắc muốn ${isLocked ? 'khóa' : 'mở khóa'} khách hàng này?`)) return;
    try {
      await backend.lockCustomer(customerId, isLocked);
      await loadData();
    } catch (error) {
      alert('Có lỗi xảy ra');
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>
        Admin Dashboard
      </h1>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '2px solid #e5e7eb' }}>
        {(['overview', 'orders', 'products', 'customers'] as Tab[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.75rem 1.5rem',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
              backgroundColor: 'transparent',
              color: activeTab === tab ? '#3b82f6' : '#6b7280',
              fontWeight: activeTab === tab ? '600' : '400',
              cursor: 'pointer',
              fontSize: '1rem',
              marginBottom: '-2px',
            }}
          >
            {tab === 'overview' ? 'Tổng Quan' : 
             tab === 'orders' ? 'Quản Lý Order' :
             tab === 'products' ? 'Quản Lý Sản Phẩm' : 'Quản Lý Khách Hàng'}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div>Đang tải...</div>
      ) : (
        <>
          {activeTab === 'overview' && stats && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Tổng Khách Hàng</h3>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalCustomers}</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Tổng Order</h3>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalOrders}</p>
                </div>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Tổng Doanh Thu</h3>
                  <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>{stats.totalRevenue.toLocaleString('vi-VN')} VND</p>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Khách Hàng VIP</h2>
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {stats.vipCustomers.map((customer, idx) => (
                    <div key={customer.userId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
                      <div>
                        <p style={{ fontWeight: '600' }}>{idx + 1}. {customer.companyName}</p>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {customer.orderCount} orders • {customer.totalSpent.toLocaleString('vi-VN')} VND • 
                          Lần mua gần nhất: {customer.lastOrderDate || 'Chưa có'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '0.5rem' }}>
                <p style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1e40af' }}>
                  Tổng doanh thu: {totalRevenue.toLocaleString('vi-VN')} VND
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <select
                  value={filters.orderStatus}
                  onChange={(e) => setFilters({ ...filters, orderStatus: e.target.value })}
                  style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="paid">Paid</option>
                  <option value="shipping">Shipping</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rejected">Rejected</option>
                </select>
                <select
                  value={filters.customerId}
                  onChange={(e) => setFilters({ ...filters, customerId: e.target.value })}
                  style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', minWidth: '200px' }}
                >
                  <option value="">Tất cả khách hàng</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.companyName}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={filters.orderDateFrom}
                  onChange={(e) => setFilters({ ...filters, orderDateFrom: e.target.value })}
                  placeholder="Từ ngày"
                  style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                />
                <input
                  type="date"
                  value={filters.orderDateTo}
                  onChange={(e) => setFilters({ ...filters, orderDateTo: e.target.value })}
                  placeholder="Đến ngày"
                  style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                />
              </div>

              <div style={{ display: 'grid', gap: '1rem' }}>
                {orders.map(order => (
                  <div key={order.id} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ fontWeight: '600' }}>{order.invoiceNumber}</h3>
                        <p style={{ color: '#6b7280' }}>Khách hàng: {(order as any).customerName || order.buyer}</p>
                        <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>{(order as any).customerEmail || ''}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'start' }}>
                        <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', backgroundColor: '#dbeafe', color: '#1e40af', fontSize: '0.875rem' }}>
                          {order.status.toUpperCase()}
                        </span>
                        <button
                          onClick={() => setSelectedOrder(order)}
                          style={{ padding: '0.25rem 0.75rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }}
                        >
                          Chi tiết
                        </button>
                      </div>
                    </div>
                    <p style={{ fontWeight: '600', fontSize: '1.25rem' }}>{order.amount.toLocaleString('vi-VN')} VND</p>
                    {order.items && order.items.length > 0 && (
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Sản phẩm:</p>
                        {order.items.map(item => (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                            <span>{item.product?.name || `Product ${item.productId}`} x {item.quantity}</span>
                            <span>{item.subtotal.toLocaleString('vi-VN')} VND</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {order.installmentPeriod && (
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb', fontSize: '0.875rem', color: '#6b7280' }}>
                        <p>Trả góp: {order.installmentPeriod} tháng • {order.monthlyPayment?.toLocaleString('vi-VN')} VND/tháng</p>
                        {order.riskLevel && <p>Risk: {order.riskLevel.toUpperCase()} ({order.riskScore}/100)</p>}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Order Detail Modal */}
              {selectedOrder && (
                <div style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 1000,
                }} onClick={() => setSelectedOrder(null)}>
                  <div style={{
                    backgroundColor: 'white',
                    padding: '2rem',
                    borderRadius: '0.5rem',
                    maxWidth: '600px',
                    maxHeight: '80vh',
                    overflow: 'auto',
                    width: '90%',
                  }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <h2 style={{ fontSize: '1.5rem', fontWeight: '600' }}>Chi tiết Order</h2>
                      <button onClick={() => setSelectedOrder(null)} style={{ border: 'none', background: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                    </div>
                    <div style={{ display: 'grid', gap: '1rem' }}>
                      <div>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Invoice Number</p>
                        <p style={{ fontWeight: '600' }}>{selectedOrder.invoiceNumber}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Khách hàng</p>
                        <p style={{ fontWeight: '600' }}>{(selectedOrder as any).customerName || selectedOrder.buyer}</p>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{(selectedOrder as any).customerEmail || ''}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Số tiền</p>
                        <p style={{ fontWeight: '600', fontSize: '1.25rem' }}>{selectedOrder.amount.toLocaleString('vi-VN')} VND</p>
                      </div>
                      <div>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Trạng thái</p>
                        <select
                          value={selectedOrder.status}
                          onChange={async (e) => {
                            try {
                              await backend.updateAdminOrder(selectedOrder.id, { status: e.target.value as any });
                              await loadData();
                              setSelectedOrder({ ...selectedOrder, status: e.target.value as any });
                            } catch (error) {
                              alert('Có lỗi xảy ra');
                            }
                          }}
                          style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', width: '100%' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="paid">Paid</option>
                          <option value="shipping">Shipping</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                      {selectedOrder.items && selectedOrder.items.length > 0 && (
                        <div>
                          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Sản phẩm</p>
                          {selectedOrder.items.map(item => (
                            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem', marginBottom: '0.5rem' }}>
                              <div>
                                <p style={{ fontWeight: '600' }}>{item.product?.name || `Product ${item.productId}`}</p>
                                <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{item.product?.brand} • Số lượng: {item.quantity}</p>
                              </div>
                              <p style={{ fontWeight: '600' }}>{item.subtotal.toLocaleString('vi-VN')} VND</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {selectedOrder.installmentPeriod && (
                        <div style={{ padding: '1rem', backgroundColor: '#eff6ff', borderRadius: '0.375rem' }}>
                          <p style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Thông tin trả góp</p>
                          <p style={{ fontSize: '0.875rem' }}>Kỳ hạn: {selectedOrder.installmentPeriod} tháng</p>
                          <p style={{ fontSize: '0.875rem' }}>Số tiền trả mỗi tháng: {selectedOrder.monthlyPayment?.toLocaleString('vi-VN')} VND</p>
                          <p style={{ fontSize: '0.875rem' }}>Tổng tiền phải trả: {selectedOrder.totalAmountWithInterest?.toLocaleString('vi-VN')} VND</p>
                          {selectedOrder.riskLevel && (
                            <p style={{ fontSize: '0.875rem' }}>Risk Level: {selectedOrder.riskLevel.toUpperCase()} ({selectedOrder.riskScore}/100)</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <select
                    value={filters.productBrand}
                    onChange={(e) => setFilters({ ...filters, productBrand: e.target.value })}
                    style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                  >
                    <option value="">Tất cả hãng</option>
                    <option value="Apple">Apple</option>
                    <option value="Samsung">Samsung</option>
                    <option value="Xiaomi">Xiaomi</option>
                    <option value="Google">Google</option>
                    <option value="OnePlus">OnePlus</option>
                  </select>
                  <select
                    value={filters.productStatus}
                    onChange={(e) => setFilters({ ...filters, productStatus: e.target.value })}
                    style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setShowProductForm(true);
                  }}
                  style={{ padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: '500' }}
                >
                  + Thêm sản phẩm
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {products.map(product => (
                  <div key={product.id} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <img src={product.imageUrl || 'https://via.placeholder.com/200'} alt={product.name} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '0.375rem', marginBottom: '1rem' }} />
                    <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{product.name}</h3>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>{product.brand}</p>
                    <p style={{ fontWeight: '600', fontSize: '1.25rem', marginBottom: '0.5rem' }}>{product.price.toLocaleString('vi-VN')} VND</p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>Tồn kho: {product.stockQuantity}</p>
                    <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '9999px', backgroundColor: product.status === 'active' ? '#d1fae5' : '#fee2e2', color: product.status === 'active' ? '#065f46' : '#991b1b', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                      {product.status}
                    </span>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setShowProductForm(true);
                        }}
                        style={{ flex: 1, padding: '0.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }}
                      >
                        Sửa
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
                          try {
                            await backend.deleteProduct(product.id);
                            await loadData();
                          } catch (error) {
                            alert('Có lỗi xảy ra');
                          }
                        }}
                        style={{ flex: 1, padding: '0.5rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }}
                      >
                        Xóa
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await backend.updateProduct(product.id, { status: product.status === 'active' ? 'inactive' : 'active' });
                            await loadData();
                          } catch (error) {
                            alert('Có lỗi xảy ra');
                          }
                        }}
                        style={{ padding: '0.5rem', backgroundColor: product.status === 'active' ? '#f59e0b' : '#10b981', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.875rem' }}
                        title={product.status === 'active' ? 'Tắt bán' : 'Bật bán'}
                      >
                        {product.status === 'active' ? '⏸' : '▶'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Product Form Modal */}
              {showProductForm && (
                <ProductFormModal
                  product={editingProduct}
                  onClose={() => {
                    setShowProductForm(false);
                    setEditingProduct(null);
                  }}
                  onSave={async () => {
                    await loadData();
                    setShowProductForm(false);
                    setEditingProduct(null);
                  }}
                />
              )}
            </div>
          )}

          {activeTab === 'customers' && (
            <div>
              <input
                type="text"
                value={filters.customerSearch}
                onChange={(e) => setFilters({ ...filters, customerSearch: e.target.value })}
                placeholder="Tìm kiếm khách hàng..."
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', marginBottom: '1.5rem' }}
              />

              <div style={{ display: 'grid', gap: '1rem' }}>
                {customers.map(customer => (
                  <div key={customer.id} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div>
                        <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{customer.companyName}</h3>
                        <p style={{ color: '#6b7280', marginBottom: '0.25rem' }}>{customer.email}</p>
                        <p style={{ color: '#6b7280', marginBottom: '0.25rem' }}>{customer.industry}</p>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                          {customer.orderCount} orders • {customer.totalSpent.toLocaleString('vi-VN')} VND đã chi
                        </p>
                      </div>
                      <div>
                        {customer.isLocked ? (
                          <button
                            onClick={() => handleLockCustomer(customer.id, false)}
                            style={{ padding: '0.5rem 1rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
                          >
                            Mở khóa
                          </button>
                        ) : (
                          <button
                            onClick={() => handleLockCustomer(customer.id, true)}
                            style={{ padding: '0.5rem 1rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
                          >
                            Khóa
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
