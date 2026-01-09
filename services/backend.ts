import { User, Order, RiskMetrics, Product, DashboardStats } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Lưu token và user vào localStorage
const STORAGE_KEYS = {
  AUTH_TOKEN: 'scf_auth_token',
  USER_ID: 'scf_user_id',
  USER_DATA: 'scf_user_data',
};

function getAuthToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
}

function setAuthToken(token: string, user: User) {
  localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  localStorage.setItem(STORAGE_KEYS.USER_ID, user.id);
  localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER_ID);
  localStorage.removeItem(STORAGE_KEYS.USER_DATA);
}

function getUserId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.USER_ID);
}

function getUserData(): User | null {
  const stored = localStorage.getItem(STORAGE_KEYS.USER_DATA);
  return stored ? JSON.parse(stored) : null;
}

async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const userId = getUserId();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (userId) {
    headers['X-User-Id'] = userId;
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Lỗi server' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const backend = {
  async getCurrentUser(): Promise<User | null> {
    const stored = getUserData();
    if (stored) return stored;

    try {
      const user = await apiRequest('/auth/me', {
        method: 'GET',
      });
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      return user;
    } catch {
      return null;
    }
  },

  async login(email: string, password: string): Promise<User> {
    try {
      const response = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (response.success && response.user && response.token) {
        setAuthToken(response.token, response.user);
        return response.user;
      }

      throw new Error(response.error || 'Đăng nhập thất bại');
    } catch (error: any) {
      // Nếu email chưa được verify, throw error với message rõ ràng
      if (error.message && error.message.includes('chưa được xác nhận')) {
        throw new Error(error.message);
      }
      throw error;
    }
  },

  async register(data: {
    companyName: string;
    industry: string;
    email: string;
    password: string;
  }): Promise<{ requiresVerification: boolean; message?: string; token?: string; verifyUrl?: string }> {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.success) {
      // Nếu cần xác nhận email, trả về thông tin verification
      if (response.requiresVerification) {
        return {
          requiresVerification: true,
          message: response.message,
          token: response.token,
          verifyUrl: response.verifyUrl,
        };
      }
      
      // Nếu không cần xác nhận (fallback - không nên xảy ra)
      if (response.user && response.token) {
        setAuthToken(response.token, response.user);
        return { requiresVerification: false };
      }
    }

    throw new Error(response.error || 'Đăng ký thất bại');
  },

  async verifyEmail(token: string): Promise<User> {
    const response = await apiRequest('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });

    if (response.success && response.user && response.token) {
      setAuthToken(response.token, response.user);
      return response.user;
    }

    throw new Error(response.error || 'Xác nhận email thất bại');
  },

  async logout(): Promise<void> {
    clearAuth();
  },

  async requestPasswordReset(email: string): Promise<{ token: string; expiresAt: number }> {
    const resetUrl = `${window.location.origin}/reset-password`;
    const response = await apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email, resetUrl }),
    });

    if (response.success) {
      // Nếu có token trong response (khi chưa cấu hình email), trả về
      if (response.token) {
        const expiresAt = Date.now() + 30 * 60 * 1000; // 30 phút
        return { token: response.token, expiresAt };
      }
      // Nếu đã gửi email thành công, vẫn cần token để demo
      // Trong production, user sẽ nhận token qua email
      throw new Error('Vui lòng kiểm tra email để lấy token khôi phục');
    }

    throw new Error(response.error || 'Gửi email khôi phục thất bại');
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });

    if (response.success && response.user && response.token) {
      setAuthToken(response.token, response.user);
      return;
    }

    throw new Error(response.error || 'Đặt lại mật khẩu thất bại');
  },

  async getUser(): Promise<User> {
    const user = await apiRequest('/user', {
      method: 'GET',
    });
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    return user;
  },

  async updateUser(updates: Partial<User>): Promise<User> {
    const user = await apiRequest('/user', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    return user;
  },

  async getOrders(): Promise<Order[]> {
    return apiRequest('/orders', {
      method: 'GET',
    });
  },

  async createOrder(order: Omit<Order, 'id' | 'createdAt'> & { customerIncome?: number; installmentPeriod?: number }): Promise<Order> {
    return apiRequest('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  },

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    return apiRequest(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteOrder(id: string): Promise<void> {
    await apiRequest(`/orders/${id}`, {
      method: 'DELETE',
    });
  },

  async getCreditStatus(): Promise<{ creditLimit: number; usedCredit: number; availableCredit: number; utilizationRate: string }> {
    return apiRequest('/credit-status', {
      method: 'GET',
    });
  },

  async getRiskMetrics(): Promise<RiskMetrics> {
    return apiRequest('/risk-metrics', {
      method: 'GET',
    });
  },

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await apiRequest('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  },

  // Products
  async getProducts(filters?: { brand?: string; status?: string; search?: string }): Promise<Product[]> {
    const params = new URLSearchParams();
    if (filters?.brand) params.append('brand', filters.brand);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    const query = params.toString();
    return apiRequest(`/products${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  },

  async getProduct(id: string): Promise<Product> {
    return apiRequest(`/products/${id}`, {
      method: 'GET',
    });
  },

  async createProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    return apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    return apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteProduct(id: string): Promise<void> {
    await apiRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Admin
  async getDashboardStats(): Promise<DashboardStats> {
    return apiRequest('/admin/dashboard/stats', {
      method: 'GET',
    });
  },

  async getAdminOrders(filters?: { status?: string; startDate?: string; endDate?: string; customerId?: string }): Promise<{ orders: Order[]; totalRevenue: number }> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.customerId) params.append('customerId', filters.customerId);
    const query = params.toString();
    return apiRequest(`/admin/orders${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  },

  async getAdminOrderById(id: string): Promise<Order> {
    return apiRequest(`/admin/orders/${id}`, {
      method: 'GET',
    });
  },

  async updateAdminOrder(id: string, updates: Partial<Order>): Promise<Order> {
    return apiRequest(`/admin/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async getCustomers(filters?: { search?: string; isLocked?: boolean }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.isLocked !== undefined) params.append('isLocked', filters.isLocked.toString());
    const query = params.toString();
    return apiRequest(`/admin/customers${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
  },

  async getCustomerOrders(customerId: string): Promise<Order[]> {
    return apiRequest(`/admin/customers/${customerId}/orders`, {
      method: 'GET',
    });
  },

  async lockCustomer(customerId: string, isLocked: boolean): Promise<void> {
    await apiRequest(`/admin/customers/${customerId}/lock`, {
      method: 'PUT',
      body: JSON.stringify({ isLocked }),
    });
  },
};
