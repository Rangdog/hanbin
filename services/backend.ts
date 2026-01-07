import { User, Order, RiskMetrics } from '../types';
import { MOCK_USER, MOCK_ORDERS } from '../constants';

const STORAGE_KEYS = {
  USER: 'scf_user',
  ORDERS: 'scf_orders',
  RISK_METRICS: 'scf_risk_metrics',
};

function getStoredOrders(): Order[] {
  const stored = localStorage.getItem(STORAGE_KEYS.ORDERS);
  return stored ? JSON.parse(stored) : [...MOCK_ORDERS];
}

function saveOrders(orders: Order[]): void {
  localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
}

function getStoredUser(): User {
  const stored = localStorage.getItem(STORAGE_KEYS.USER);
  return stored ? JSON.parse(stored) : { ...MOCK_USER };
}

function saveUser(user: User): void {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
}

function getStoredRiskMetrics(): RiskMetrics {
  const stored = localStorage.getItem(STORAGE_KEYS.RISK_METRICS);
  return stored ? JSON.parse(stored) : {
    creditScore: 85,
    paymentHistory: 92,
    industryRisk: 65,
    marketConditions: 78,
  };
}

export const backend = {
  async getUser(): Promise<User> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(getStoredUser()), 100);
    });
  },

  async updateUser(updates: Partial<User>): Promise<User> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUser = getStoredUser();
        const updatedUser = { ...currentUser, ...updates };
        saveUser(updatedUser);
        resolve(updatedUser);
      }, 100);
    });
  },

  async getOrders(): Promise<Order[]> {
    return new Promise((resolve) => {
      setTimeout(() => resolve(getStoredOrders()), 100);
    });
  },

  async createOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const orders = getStoredOrders();
        const newOrder: Order = {
          ...order,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString().split('T')[0],
        };
        orders.push(newOrder);
        saveOrders(orders);
        resolve(newOrder);
      }, 100);
    });
  },

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const orders = getStoredOrders();
        const index = orders.findIndex(o => o.id === id);
        if (index === -1) {
          reject(new Error('Order not found'));
          return;
        }
        orders[index] = { ...orders[index], ...updates };
        saveOrders(orders);
        resolve(orders[index]);
      }, 100);
    });
  },

  async deleteOrder(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const orders = getStoredOrders();
        const index = orders.findIndex(o => o.id === id);
        if (index === -1) {
          reject(new Error('Order not found'));
          return;
        }
        orders.splice(index, 1);
        saveOrders(orders);
        resolve();
      }, 100);
    });
  },

  async getRiskMetrics(): Promise<RiskMetrics> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(getStoredRiskMetrics());
      }, 100);
    });
  },
};
