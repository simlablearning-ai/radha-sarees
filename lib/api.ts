import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-226dc7f7`;

class APIClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken() {
    if (!this.token) {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : `Bearer ${publicAnonKey}`, // Use user token if available
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // ==================== AUTHENTICATION ====================

  async signup(data: {
    email: string;
    password: string;
    name: string;
    phone: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  }) {
    const result = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (result.user) {
      // For signup, we need to login to get the session token
      const loginResult = await this.login(data.email, data.password);
      return loginResult;
    }
    return result;
  }

  async login(email: string, password: string) {
    const result = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (result.session?.access_token) {
      this.setToken(result.session.access_token);
    }
    return result;
  }

  async getSession() {
    return this.request('/auth/session');
  }

  async adminLogin(username: string, password: string) {
    return this.request('/auth/admin-login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async changeAdminPassword(currentPassword: string, newPassword: string) {
    return this.request('/auth/admin-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  logout() {
    this.setToken(null);
  }

  // ==================== PRODUCTS ====================

  async getProducts() {
    return this.request('/products');
  }

  async getProduct(id: number) {
    return this.request(`/products/${id}`);
  }

  async addProduct(product: any) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: number, product: any) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  }

  async deleteProduct(id: number) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  async bulkAddProducts(products: any[]) {
    return this.request('/products/bulk', {
      method: 'POST',
      body: JSON.stringify({ products }),
    });
  }

  // ==================== ORDERS ====================

  async getOrders() {
    return this.request('/orders');
  }

  async getCustomerOrders(email: string) {
    return this.request(`/orders/customer/${encodeURIComponent(email)}`);
  }

  async createOrder(order: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  async updateOrder(id: string, order: any) {
    return this.request(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(order),
    });
  }

  // ==================== CUSTOMER PROFILE ====================

  async getProfile() {
    return this.request('/customer/profile');
  }

  async updateProfile(profile: any) {
    return this.request('/customer/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  }

  // ==================== PAYMENT METHODS ====================

  async getPaymentMethods() {
    return this.request('/customer/payment-methods');
  }

  async addPaymentMethod(method: any) {
    return this.request('/customer/payment-methods', {
      method: 'POST',
      body: JSON.stringify(method),
    });
  }

  async updatePaymentMethod(id: string, method: any) {
    return this.request(`/customer/payment-methods/${id}`, {
      method: 'PUT',
      body: JSON.stringify(method),
    });
  }

  async deletePaymentMethod(id: string) {
    return this.request(`/customer/payment-methods/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== BILLING ADDRESSES ====================

  async getBillingAddresses() {
    return this.request('/customer/billing-addresses');
  }

  async addBillingAddress(address: any) {
    return this.request('/customer/billing-addresses', {
      method: 'POST',
      body: JSON.stringify(address),
    });
  }

  async updateBillingAddress(id: string, address: any) {
    return this.request(`/customer/billing-addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(address),
    });
  }

  async deleteBillingAddress(id: string) {
    return this.request(`/customer/billing-addresses/${id}`, {
      method: 'DELETE',
    });
  }

  // ==================== SETTINGS & REPORTS ====================

  async getPaymentGateways() {
    return this.request('/settings/payment-gateways');
  }

  async updatePaymentGateway(id: string, gateway: any) {
    return this.request(`/settings/payment-gateways/${id}`, {
      method: 'PUT',
      body: JSON.stringify(gateway),
    });
  }

  async getSiteSettings() {
    return this.request('/settings/site');
  }

  async updateSiteSettings(settings: any) {
    return this.request('/settings/site', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async getStoreSettings() {
    return this.request('/settings/store');
  }

  async updateStoreSettings(settings: any) {
    return this.request('/settings/store', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async getShippingSettings() {
    return this.request('/settings/shipping');
  }

  async updateShippingSettings(settings: any) {
    return this.request('/settings/shipping', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async getNotificationSettings() {
    return this.request('/settings/notifications');
  }

  async updateNotificationSettings(settings: any) {
    return this.request('/settings/notifications', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async testNotification(phone: string, settings: any) {
    return this.request('/notifications/test', {
      method: 'POST',
      body: JSON.stringify({ phone, settings }),
    });
  }

  async sendOrderNotification(orderId: string, phone: string, type: string) {
    return this.request('/notifications/order', {
      method: 'POST',
      body: JSON.stringify({ orderId, phone, type }),
    });
  }

  async generateReport(report: any) {
    return this.request('/reports', {
      method: 'POST',
      body: JSON.stringify(report),
    });
  }

  async getReports() {
    return this.request('/reports');
  }

  async deleteReport(id: string) {
    return this.request(`/reports/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new APIClient();