import { useState } from 'react';
import { backend } from '../services/backend';

export default function CreateOrder() {
  const [formData, setFormData] = useState({
    buyer: '',
    amount: '',
    interestRate: '3.5',
    paymentTerms: '30',
    invoiceNumber: '',
    dueDate: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');

    try {
      await backend.createOrder({
        buyer: formData.buyer,
        amount: parseFloat(formData.amount),
        interestRate: parseFloat(formData.interestRate),
        paymentTerms: parseInt(formData.paymentTerms),
        status: 'pending',
        invoiceNumber: formData.invoiceNumber,
        dueDate: formData.dueDate,
      });

      setStatus('success');
      setMessage('Order created successfully!');
      setFormData({ buyer: '', amount: '', interestRate: '3.5', paymentTerms: '30', invoiceNumber: '', dueDate: '' });
    } catch (error) {
      setStatus('error');
      setMessage('Failed to create order. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Create New Order</h1>

      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: '600px' }}>
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

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="invoiceNumber" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Invoice Number
            </label>
            <input
              type="text"
              id="invoiceNumber"
              name="invoiceNumber"
              value={formData.invoiceNumber}
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

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="amount" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Amount ($)
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="interestRate" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Interest Rate (%)
            </label>
            <input
              type="number"
              id="interestRate"
              name="interestRate"
              value={formData.interestRate}
              onChange={handleChange}
              required
              min="0"
              step="0.1"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="paymentTerms" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Payment Terms (days)
            </label>
            <input
              type="number"
              id="paymentTerms"
              name="paymentTerms"
              value={formData.paymentTerms}
              onChange={handleChange}
              required
              min="1"
              step="1"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.375rem',
                fontSize: '1rem',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="dueDate" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
              Due Date
            </label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
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
            disabled={status === 'loading'}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: status === 'loading' ? '#9ca3af' : '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '0.375rem',
              fontSize: '1rem',
              fontWeight: '500',
              cursor: status === 'loading' ? 'not-allowed' : 'pointer',
            }}
          >
            {status === 'loading' ? 'Creating...' : 'Create Order'}
          </button>
        </form>
      </div>
    </div>
  );
}
