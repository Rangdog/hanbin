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
  // Phone specifications
  ram?: number; // GB
  storage?: number; // GB
  screenSize?: number; // inch
  screenResolution?: string; // e.g., "2400x1080"
  battery?: number; // mAh
  cameraMain?: number; // MP
  processor?: string; // e.g., "A17 Pro", "Snapdragon 8 Gen 3"
  color?: string; // e.g., "Titanium", "Black", "Blue"
  operatingSystem?: string; // e.g., "iOS 17", "Android 14"
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
  createdAt: string;
  items?: OrderItem[];
  userId?: string;
  // BNPL fields (bắt buộc)
  customerIncome: number;
  installmentPeriod: number;
  monthlyPayment: number;
  totalAmountWithInterest: number;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'very_high';
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
