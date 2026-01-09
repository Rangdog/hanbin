import { useState, useEffect } from 'react';
import { backend } from '../services/backend';
import { DashboardStats, Order, Product } from '../types';

type Tab = 'overview' | 'orders' | 'products' | 'customers';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
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
    loadData();
  }, [activeTab, filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const data = await backend.getDashboardStats();
        setStats(data);
      } else if (activeTab === 'orders') {
        const data = await backend.getOrders();
        setOrders(data);
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
                  <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>${stats.totalRevenue.toLocaleString()}</p>
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
                          {customer.orderCount} orders • ${customer.totalSpent.toLocaleString()} • 
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
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
                <select
                  value={filters.orderStatus}
                  onChange={(e) => setFilters({ ...filters, orderStatus: e.target.value })}
                  style={{ padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem' }}
                >
                  <option value="">Tất cả trạng thái</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="shipping">Shipping</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
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
                        <p style={{ color: '#6b7280' }}>Khách hàng: {order.userId ? 'User ' + order.userId : order.buyer}</p>
                      </div>
                      <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', backgroundColor: '#dbeafe', color: '#1e40af', fontSize: '0.875rem' }}>
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                    <p style={{ fontWeight: '600', fontSize: '1.25rem' }}>${order.amount.toLocaleString()}</p>
                    {order.items && order.items.length > 0 && (
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Sản phẩm:</p>
                        {order.items.map(item => (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                            <span>{item.product?.name || `Product ${item.productId}`} x {item.quantity}</span>
                            <span>${item.subtotal.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
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

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem' }}>
                {products.map(product => (
                  <div key={product.id} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <img src={product.imageUrl || 'https://via.placeholder.com/200'} alt={product.name} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '0.375rem', marginBottom: '1rem' }} />
                    <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>{product.name}</h3>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>{product.brand}</p>
                    <p style={{ fontWeight: '600', fontSize: '1.25rem', marginBottom: '0.5rem' }}>${product.price.toLocaleString()}</p>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Tồn kho: {product.stockQuantity}</p>
                    <span style={{ display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '9999px', backgroundColor: product.status === 'active' ? '#d1fae5' : '#fee2e2', color: product.status === 'active' ? '#065f46' : '#991b1b', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                      {product.status}
                    </span>
                  </div>
                ))}
              </div>
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
                          {customer.orderCount} orders • ${customer.totalSpent.toLocaleString()} đã chi
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
