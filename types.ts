export interface User {
  id: string;
  companyName: string;
  industry: string;
  email: string;
  creditLimit: number;
  availableCredit: number;
  spendingCapacity: number;
}

export interface Order {
  id: string;
  buyer: string;
  amount: number;
  interestRate: number;
  paymentTerms: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  invoiceNumber: string;
  dueDate: string;
  createdAt: string;
}

export interface RiskMetrics {
  creditScore: number;
  paymentHistory: number;
  industryRisk: number;
  marketConditions: number;
}
