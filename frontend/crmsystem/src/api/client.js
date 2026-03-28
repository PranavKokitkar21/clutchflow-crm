const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  const response = await fetch(url, config);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }
  return response.json();
}

export const api = {
  // Config
  getConfig: () => request('/config'),

  // Dashboard
  getDashboard: () => request('/dashboard'),

  // Customers
  getCustomers: () => request('/customers'),
  getCustomer: (id) => request(`/customers/${id}`),
  createCustomer: (data) => request('/customers', { method: 'POST', body: JSON.stringify(data) }),
  updateCustomer: (id, data) => request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCustomer: (id) => request(`/customers/${id}`, { method: 'DELETE' }),

  // Orders
  getOrders: () => request('/orders'),
  createOrder: (data) => request('/orders', { method: 'POST', body: JSON.stringify(data) }),
  updateOrderStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  syncWooCommerce: () => request('/orders/woocommerce/sync'),

  // Logs
  getLogsByCustomer: (customerId) => request(`/logs/${customerId}`),
  createLog: (data) => request('/logs', { method: 'POST', body: JSON.stringify(data) }),
  getRecentLogs: () => request('/logs/recent'),

  // Insights
  getInsights: (customerId) => request(`/customers/${customerId}/insights`),

  // Analytics
  getAnalytics: (days) => request(`/analytics?days=${days || 'all'}`),

  // Export (returns download URL)
  exportCSV: (type) => `${API_BASE}/export/${type}`,
};
