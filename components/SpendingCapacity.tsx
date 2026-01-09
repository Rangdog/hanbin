import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SpendingCapacityProps {
  creditLimit: number;
  availableCredit: number;
}

export default function SpendingCapacity({ creditLimit, availableCredit }: SpendingCapacityProps) {
  const usedCredit = creditLimit - availableCredit;
  const utilizationRate = ((usedCredit / creditLimit) * 100).toFixed(1);

  const data = [
    { name: 'Used', value: usedCredit },
    { name: 'Available', value: availableCredit },
  ];

  return (
    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Spending Capacity</h3>
      <div style={{ marginBottom: '1rem' }}>
        <p style={{ fontSize: '0.875rem', color: '#666' }}>Credit Utilization: {utilizationRate}%</p>
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
