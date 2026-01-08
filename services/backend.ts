import { User, Order, RiskMetrics } from '../types';

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
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.success && response.user && response.token) {
      setAuthToken(response.token, response.user);
      return response.user;
    }

    throw new Error('Đăng nhập thất bại');
  },

  async register(data: {
    companyName: string;
    industry: string;
    email: string;
    password: string;
  }): Promise<User> {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.success && response.user && response.token) {
      setAuthToken(response.token, response.user);
      return response.user;
    }

    throw new Error('Đăng ký thất bại');
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

  async createOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
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

  async getRiskMetrics(): Promise<RiskMetrics> {
    return apiRequest('/risk-metrics', {
      method: 'GET',
    });
  },
};
