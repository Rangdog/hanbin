import { useState, useEffect } from 'react';
import { Order } from '../types';
import { backend } from '../services/backend';

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | Order['status']>('all');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await backend.getOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    try {
      await backend.updateOrder(orderId, { status: newStatus });
      await loadOrders();
    } catch (error) {
      console.error('Failed to update order:', error);
    }
  };

  const handleDelete = async (orderId: string) => {
    if (!confirm('Are you sure you want to delete this order?')) return;

    try {
      await backend.deleteOrder(orderId);
      await loadOrders();
    } catch (error) {
      console.error('Failed to delete order:', error);
    }
  };

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(order => order.status === filter);

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      pending: '#fbbf24',
      approved: '#34d399',
      rejected: '#f87171',
      completed: '#60a5fa',
    };
    return colors[status] || '#9ca3af';
  };

  if (loading) {
    return <div>Loading orders...</div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Order Management</h1>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ marginRight: '1rem', fontWeight: '500' }}>Filter by status:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          style={{
            padding: '0.5rem',
            border: '1px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '1rem',
          }}
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {filteredOrders.length === 0 ? (
          <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', textAlign: 'center', color: '#6b7280' }}>
            No orders found
          </div>
        ) : (
          filteredOrders.map(order => (
            <div
              key={order.id}
              style={{
                backgroundColor: 'white',
                padding: '1.5rem',
                borderRadius: '0.5rem',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                    {order.invoiceNumber}
                  </h3>
                  <p style={{ color: '#6b7280', marginBottom: '0.25rem' }}>Buyer: {order.buyer}</p>
                </div>
                <div
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '9999px',
                    backgroundColor: getStatusColor(order.status) + '20',
                    color: getStatusColor(order.status),
                    fontWeight: '500',
                    fontSize: '0.875rem',
                  }}
                >
                  {order.status.toUpperCase()}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Amount</p>
                  <p style={{ fontWeight: '600' }}>{order.amount.toLocaleString('vi-VN')} VND</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Interest Rate</p>
                  <p style={{ fontWeight: '600' }}>{order.interestRate}%</p>
                </div>
                {order.installmentPeriod ? (
                  <>
                    <div>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Kỳ hạn trả góp</p>
                      <p style={{ fontWeight: '600', color: '#3b82f6' }}>{order.installmentPeriod} tháng</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Số tiền trả mỗi tháng</p>
                      <p style={{ fontWeight: '600', color: '#10b981' }}>{order.monthlyPayment?.toLocaleString('vi-VN') || 'N/A'} VND</p>
                    </div>
                    {order.totalAmountWithInterest && (
                      <div>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Tổng tiền phải trả</p>
                        <p style={{ fontWeight: '600' }}>{order.totalAmountWithInterest.toLocaleString('vi-VN')} VND</p>
                      </div>
                    )}
                    {order.riskLevel && (
                      <div>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Mức độ rủi ro</p>
                        <p style={{ 
                          fontWeight: '600',
                          color: order.riskLevel === 'low' ? '#10b981' : 
                                 order.riskLevel === 'medium' ? '#f59e0b' : 
                                 order.riskLevel === 'high' ? '#ef4444' : '#dc2626'
                        }}>
                          {order.riskLevel.toUpperCase()} {order.riskScore ? `(${order.riskScore}/100)` : ''}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Payment Terms</p>
                      <p style={{ fontWeight: '600' }}>{order.paymentTerms} days</p>
                    </div>
                    <div>
                    </div>
                  </>
                )}
                <div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Created</p>
                  <p style={{ fontWeight: '600' }}>{order.createdAt}</p>
                </div>
              </div>
              
              {order.items && order.items.length > 0 && (
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Sản phẩm:</p>
                  {order.items.map(item => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      <span>{item.product?.name || `Product ${item.productId}`} x {item.quantity}</span>
                      <span>{item.subtotal.toLocaleString('vi-VN')} VND</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {order.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(order.id, 'approved')}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#10b981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                      }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange(order.id, 'rejected')}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.375rem',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                      }}
                    >
                      Reject
                    </button>
                  </>
                )}
                {order.status === 'approved' && (
                  <button
                    onClick={() => handleStatusChange(order.id, 'completed')}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                    }}
                  >
                    Complete
                  </button>
                )}
                <button
                  onClick={() => handleDelete(order.id)}
                  style={{
                    padding: '0.5rem 1rem',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
