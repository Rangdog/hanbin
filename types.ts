export interface User {
  id: string;
  companyName: string;
  industry: string;
  email: string;
  creditLimit: number;
  availableCredit: number;
  spendingCapacity: number;
  role?: 'admin' | 'user';
  isLocked?: boolean;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  imageUrl: string;
  price: number;
  description: string;
  stockQuantity: number;
  status: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product?: Product;
}

export interface Order {
  id: string;
  buyer: string;
  amount: number;
  interestRate: number;
  paymentTerms: number;
  status: 'pending' | 'paid' | 'shipping' | 'completed' | 'cancelled' | 'approved' | 'rejected';
  invoiceNumber: string;
  dueDate: string;
  createdAt: string;
  items?: OrderItem[];
  userId?: string;
  // BNPL fields
  customerIncome?: number;
  installmentPeriod?: number;
  monthlyPayment?: number;
  totalAmountWithInterest?: number;
  riskScore?: number;
  riskLevel?: 'low' | 'medium' | 'high' | 'very_high';
  approvedByAdmin?: boolean;
}

export interface RiskMetrics {
  creditScore: number;
  paymentHistory: number;
  industryRisk: number;
  marketConditions: number;
}

export interface DashboardStats {
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  revenueByDay: Array<{ date: string; revenue: number }>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  vipCustomers: Array<{
    userId: string;
    companyName: string;
    totalSpent: number;
    orderCount: number;
    lastOrderDate: string;
  }>;
}
