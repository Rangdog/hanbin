import { useState, useEffect } from 'react';
import { backend } from '../services/backend';
import { Product } from '../types';

interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

interface RiskAssessment {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'very_high';
  debtToIncomeRatio: number;
  monthlyPayment: number;
  totalAmountWithInterest: number;
  adjustedInterestRate: number;
  message: string;
}

export default function CreateOrder() {
  const [formData, setFormData] = useState({
    buyer: '',
    amount: '',
    customerIncome: '',
    installmentPeriod: '',
  });
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
  const [riskAssessment, setRiskAssessment] = useState<RiskAssessment | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    // Tính toán risk assessment khi có đủ thông tin (BNPL luôn bắt buộc)
    if (formData.customerIncome && formData.installmentPeriod) {
      calculateRisk();
    } else {
      setRiskAssessment(null);
    }
  }, [formData.customerIncome, formData.installmentPeriod, selectedItems]);

  const loadProducts = async () => {
    try {
      const data = await backend.getProducts({ status: 'active' });
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const calculateRisk = async () => {
    const totalAmount = selectedItems.length > 0 
      ? selectedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
      : parseFloat(formData.amount || '0');
    
    const income = parseFloat(formData.customerIncome || '0');
    const period = parseInt(formData.installmentPeriod || '0');

    if (totalAmount > 0 && income > 0 && period >= 3) {
      try {
        // Gọi API để tính risk
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${API_BASE_URL}/orders/calculate-risk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerIncome: income,
            orderAmount: totalAmount,
            installmentPeriod: period,
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setRiskAssessment(data);
        }
      } catch (error) {
        // Fallback: tính toán đơn giản ở frontend
        calculateRiskFrontend(totalAmount, income, period);
      }
    }
  };

  const calculateRiskFrontend = (amount: number, income: number, period: number) => {
    // Tính toán đơn giản ở frontend
    const baseInterestRate = 0.035;
    const adjustedInterestRate = baseInterestRate + ((period - 3) / 3) * 0.005;
    const totalInterest = amount * adjustedInterestRate;
    const totalAmountWithInterest = amount + totalInterest;
    const monthlyPayment = totalAmountWithInterest / period;
    const debtToIncomeRatio = (monthlyPayment / income) * 100;

    let riskScore = 0;
    let riskLevel: 'low' | 'medium' | 'high' | 'very_high' = 'low';

    if (debtToIncomeRatio <= 10) {
      riskScore = 20;
      riskLevel = 'low';
    } else if (debtToIncomeRatio <= 20) {
      riskScore = 40;
      riskLevel = 'low';
    } else if (debtToIncomeRatio <= 30) {
      riskScore = 60;
      riskLevel = 'medium';
    } else if (debtToIncomeRatio <= 40) {
      riskScore = 75;
      riskLevel = 'high';
    } else {
      riskScore = 90;
      riskLevel = 'very_high';
    }

    setRiskAssessment({
      riskScore,
      riskLevel,
      debtToIncomeRatio: Math.round(debtToIncomeRatio * 100) / 100,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalAmountWithInterest: Math.round(totalAmountWithInterest * 100) / 100,
      adjustedInterestRate: Math.round(adjustedInterestRate * 10000) / 100,
      message: `Tỷ lệ nợ/thu nhập: ${debtToIncomeRatio.toFixed(1)}%`,
    });
  };

  const handleAddItem = (product: Product) => {
    const existing = selectedItems.find(item => item.productId === product.id);
    if (existing) {
      setSelectedItems(selectedItems.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setSelectedItems([...selectedItems, {
        productId: product.id,
        quantity: 1,
        unitPrice: product.price,
      }]);
    }
  };

  const handleRemoveItem = (productId: string) => {
    setSelectedItems(selectedItems.filter(item => item.productId !== productId));
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setSelectedItems(selectedItems.map(item =>
      item.productId === productId
        ? { ...item, quantity }
        : item
    ));
  };

  const calculateTotal = () => {
    return selectedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      const totalAmount = selectedItems.length > 0 ? calculateTotal() : parseFloat(formData.amount || '0');
      
      if (!formData.buyer) {
        throw new Error('Vui lòng điền đầy đủ thông tin');
      }

      if (selectedItems.length > 0 && totalAmount === 0) {
        throw new Error('Vui lòng chọn ít nhất một sản phẩm');
      }

      if (selectedItems.length === 0 && !formData.amount) {
        throw new Error('Vui lòng nhập số tiền hoặc chọn sản phẩm');
      }

      // BNPL validation (bắt buộc)
      if (!formData.customerIncome || parseFloat(formData.customerIncome) <= 0) {
        throw new Error('Vui lòng nhập thu nhập hàng tháng');
      }
      if (!formData.installmentPeriod || parseInt(formData.installmentPeriod) < 3) {
        throw new Error('Kỳ hạn trả góp phải từ 3 tháng trở lên');
      }
      if (riskAssessment && riskAssessment.riskLevel === 'very_high') {
        throw new Error('Rủi ro quá cao. Đơn hàng không thể được chấp nhận.');
      }

      await backend.createOrder({
        buyer: formData.buyer,
        amount: totalAmount,
        status: 'pending',
        items: selectedItems.length > 0 ? selectedItems : undefined,
        customerIncome: parseFloat(formData.customerIncome),
        installmentPeriod: parseInt(formData.installmentPeriod),
      });

      setStatus('success');
      setMessage('Đơn hàng đã được tạo thành công!');
      setFormData({ buyer: '', amount: '', customerIncome: '', installmentPeriod: '' });
      setSelectedItems([]);
      setRiskAssessment(null);
    } catch (error: any) {
      setStatus('error');
      setMessage(error.message || 'Failed to create order. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const getRiskColor = (level?: string) => {
    switch (level) {
      case 'low': return '#10b981';
      case 'medium': return '#f59e0b';
      case 'high': return '#ef4444';
      case 'very_high': return '#dc2626';
      default: return '#6b7280';
    }
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Create New Order</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Form */}
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="buyer" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Buyer Name
              </label>
              <input
                type="text"
                id="buyer"
                name="buyer"
                value={formData.buyer}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '1rem',
                }}
              />
            </div>


            {selectedItems.length === 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="amount" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Số tiền (VND)
                </label>
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                  }}
                />
              </div>
            )}

            {selectedItems.length > 0 && (
              <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem' }}>
                <p style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Tổng tiền từ sản phẩm:</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{calculateTotal().toLocaleString('vi-VN')} VND</p>
              </div>
            )}

            {/* BNPL - Bắt buộc */}
            <div style={{ marginBottom: '1.5rem', padding: '1rem', border: '2px solid #3b82f6', borderRadius: '0.5rem', backgroundColor: '#eff6ff' }}>
              <h3 style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '1rem' }}>Thông Tin Trả Góp (Bắt Buộc)</h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="customerIncome" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Thu nhập hàng tháng (VND) *
                </label>
                <input
                  type="number"
                  id="customerIncome"
                  name="customerIncome"
                  value={formData.customerIncome}
                  onChange={handleChange}
                  required
                  min="0"
                  step="100000"
                  placeholder="Ví dụ: 20000000"
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                  }}
                />
                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>Nhập thu nhập hàng tháng của bạn (VND)</p>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label htmlFor="installmentPeriod" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                  Kỳ hạn trả góp (tháng) *
                </label>
                <select
                  id="installmentPeriod"
                  name="installmentPeriod"
                  value={formData.installmentPeriod}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '0.375rem',
                    fontSize: '1rem',
                  }}
                >
                  <option value="">Chọn kỳ hạn</option>
                  <option value="3">3 tháng</option>
                  <option value="6">6 tháng</option>
                  <option value="9">9 tháng</option>
                  <option value="12">12 tháng</option>
                  <option value="18">18 tháng</option>
                  <option value="24">24 tháng</option>
                </select>
              </div>

              {riskAssessment && (
                <div style={{ marginBottom: '1.5rem', padding: '1rem', borderRadius: '0.5rem', backgroundColor: '#f9fafb', border: `2px solid ${getRiskColor(riskAssessment.riskLevel)}` }}>
                  <h3 style={{ fontWeight: '600', marginBottom: '0.75rem', color: getRiskColor(riskAssessment.riskLevel) }}>
                    Đánh Giá Rủi Ro
                  </h3>
                  <div style={{ display: 'grid', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Mức độ rủi ro:</span>
                      <span style={{ fontWeight: '600', color: getRiskColor(riskAssessment.riskLevel) }}>
                        {riskAssessment.riskLevel.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Điểm rủi ro:</span>
                      <span style={{ fontWeight: '600' }}>{riskAssessment.riskScore}/100</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Tỷ lệ nợ/thu nhập:</span>
                      <span style={{ fontWeight: '600' }}>{riskAssessment.debtToIncomeRatio}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>Lãi suất:</span>
                      <span style={{ fontWeight: '600' }}>{riskAssessment.adjustedInterestRate}%</span>
                    </div>
                    <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid #e5e7eb' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span>Số tiền trả mỗi tháng:</span>
                        <span style={{ fontWeight: '600', fontSize: '1.1rem', color: '#3b82f6' }}>
                          {riskAssessment.monthlyPayment.toLocaleString('vi-VN')} VND
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Tổng tiền phải trả:</span>
                        <span style={{ fontWeight: '600', fontSize: '1.1rem', color: '#10b981' }}>
                          {riskAssessment.totalAmountWithInterest.toLocaleString('vi-VN')} VND
                        </span>
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                        (Gốc: {(selectedItems.length > 0 ? calculateTotal() : parseFloat(formData.amount || '0')).toLocaleString('vi-VN')} VND + Lãi: {(riskAssessment.totalAmountWithInterest - (selectedItems.length > 0 ? calculateTotal() : parseFloat(formData.amount || '0'))).toLocaleString('vi-VN')} VND)
                      </div>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem', fontStyle: 'italic' }}>
                      {riskAssessment.message}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {message && (
              <div style={{
                padding: '0.75rem',
                marginBottom: '1rem',
                borderRadius: '0.375rem',
                backgroundColor: status === 'success' ? '#d1fae5' : '#fee2e2',
                color: status === 'success' ? '#065f46' : '#991b1b',
              }}>
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading' || (riskAssessment && riskAssessment.riskLevel === 'very_high')}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: status === 'loading' || (riskAssessment && riskAssessment.riskLevel === 'very_high') ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: status === 'loading' || (riskAssessment && riskAssessment.riskLevel === 'very_high') ? 'not-allowed' : 'pointer',
              }}
            >
              {status === 'loading' ? 'Creating...' : 'Create Order'}
            </button>
          </form>
        </div>

        {/* Products Selection */}
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>Chọn Sản Phẩm</h2>

          {selectedItems.length > 0 && (
            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem' }}>
              <h3 style={{ fontWeight: '600', marginBottom: '0.5rem' }}>Đã chọn:</h3>
              {selectedItems.map(item => {
                const product = products.find(p => p.id === item.productId);
                return (
                  <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <div>
                      <p style={{ fontWeight: '500' }}>{product?.name || 'Unknown'}</p>
                      <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                        ${item.unitPrice.toLocaleString()} x {item.quantity} = ${(item.quantity * item.unitPrice).toLocaleString()}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                        style={{ padding: '0.25rem 0.5rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
                      >
                        -
                      </button>
                      <span style={{ minWidth: '2rem', textAlign: 'center' }}>{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                        style={{ padding: '0.25rem 0.5rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer' }}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.productId)}
                        style={{ padding: '0.25rem 0.5rem', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '0.25rem', cursor: 'pointer', marginLeft: '0.5rem' }}
                      >
                        X
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {products.map(product => (
                <div
                  key={product.id}
                  style={{
                    padding: '1rem',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.375rem',
                    display: 'flex',
                    gap: '1rem',
                  }}
                >
                  <img
                    src={product.imageUrl || 'https://via.placeholder.com/100'}
                    alt={product.name}
                    style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '0.375rem' }}
                  />
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{product.name}</h3>
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.25rem' }}>{product.brand}</p>
                    <p style={{ fontWeight: '600', color: '#3b82f6', marginBottom: '0.25rem' }}>{product.price.toLocaleString('vi-VN')} VND</p>
                    {product.ram && product.storage && (
                      <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.125rem' }}>
                        {product.ram}GB/{product.storage}GB
                      </p>
                    )}
                    {product.screenSize && product.cameraMain && (
                      <p style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.125rem' }}>
                        {product.screenSize}" • {product.cameraMain}MP
                      </p>
                    )}
                    <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Tồn kho: {product.stockQuantity}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAddItem(product)}
                    disabled={product.stockQuantity === 0}
                    style={{
                      padding: '0.5rem 1rem',
                      backgroundColor: product.stockQuantity === 0 ? '#9ca3af' : '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: product.stockQuantity === 0 ? 'not-allowed' : 'pointer',
                      alignSelf: 'center',
                    }}
                  >
                    {product.stockQuantity === 0 ? 'Hết hàng' : 'Thêm'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
