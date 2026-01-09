export const MOCK_USER = {
  id: '1',
  companyName: 'Tech Corp',
  industry: 'Technology',
  email: 'john@company.com',
  creditLimit: 1000000,
  availableCredit: 750000,
  spendingCapacity: 850000,
};

// Mật khẩu demo cho user mock. Chỉ dùng cho môi trường frontend giả lập (localStorage).
export const MOCK_USER_PASSWORD = 'password123';

export const MOCK_ORDERS = [
  {
    id: '1',
    buyer: 'Global Electronics Inc',
    amount: 50000,
    interestRate: 3.5,
    paymentTerms: 60,
    status: 'approved' as const,
    invoiceNumber: 'INV-2024-001',
    createdAt: '2024-01-15',
  },
];
