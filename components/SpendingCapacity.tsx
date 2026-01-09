import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { backend } from '../services/backend';

interface SpendingCapacityProps {
  creditLimit?: number;
  availableCredit?: number;
}

export default function SpendingCapacity({ creditLimit: propCreditLimit, availableCredit: propAvailableCredit }: SpendingCapacityProps) {
  const [creditStatus, setCreditStatus] = useState<{ creditLimit: number; usedCredit: number; availableCredit: number; utilizationRate: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCreditStatus();
  }, []);

  const loadCreditStatus = async () => {
    try {
      const status = await backend.getCreditStatus();
      setCreditStatus(status);
    } catch (error) {
      console.error('Failed to load credit status:', error);
      // Fallback to props if API fails
      if (propCreditLimit && propAvailableCredit !== undefined) {
        setCreditStatus({
          creditLimit: propCreditLimit,
          usedCredit: propCreditLimit - propAvailableCredit,
          availableCredit: propAvailableCredit,
          utilizationRate: propCreditLimit > 0 ? (((propCreditLimit - propAvailableCredit) / propCreditLimit) * 100).toFixed(1) : '0.0'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Use API data if available, otherwise use props
  const creditLimit = creditStatus?.creditLimit || propCreditLimit || 50000000;
  const availableCredit = creditStatus?.availableCredit ?? (propAvailableCredit ?? 50000000);
  const usedCredit = creditStatus?.usedCredit ?? (creditLimit - availableCredit);
  const utilizationRate = creditStatus?.utilizationRate || ((usedCredit / creditLimit) * 100).toFixed(1);

  const data = [
    { name: 'Used', value: usedCredit },
    { name: 'Available', value: availableCredit },
  ];

  if (loading) {
    return (
      <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Spending Capacity</h3>
        <p style={{ fontSize: '0.875rem', color: '#666' }}>Đang tải...</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Spending Capacity</h3>
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ fontSize: '0.875rem', color: '#666' }}>Credit Utilization: {utilizationRate}%</p>
        <p style={{ fontSize: '0.75rem', color: '#999', marginTop: '0.25rem' }}>
          Đã dùng: {usedCredit.toLocaleString('vi-VN')} VND / {creditLimit.toLocaleString('vi-VN')} VND
        </p>
        <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', marginTop: '0.5rem', overflow: 'hidden' }}>
          <div style={{ width: `${utilizationRate}%`, height: '100%', backgroundColor: '#3b82f6', transition: 'width 0.3s' }} />
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value) => `${value.toLocaleString('vi-VN')} VND`} />
          <Bar dataKey="value" fill="#3b82f6" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
