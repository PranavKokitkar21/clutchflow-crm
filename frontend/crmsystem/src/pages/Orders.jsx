import { useState, useEffect } from 'react';
import { api } from '../api/client';

const statusColors = {
  completed: '#10b981',
  processing: '#6366f1',
  pending: '#f59e0b',
  'on-hold': '#94a3b8',
  cancelled: '#ef4444',
};

const allStatuses = ['pending', 'processing', 'completed', 'on-hold', 'cancelled'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customer_id: '', product: '', amount: '', status: 'pending' });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [ordersData, customersData] = await Promise.all([
        api.getOrders(),
        api.getCustomers(),
      ]);
      setOrders(ordersData);
      setCustomers(customersData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.createOrder({
        customer_id: form.customer_id,
        product: form.product,
        amount: parseFloat(form.amount),
        status: form.status,
      });
      setForm({ customer_id: '', product: '', amount: '', status: 'pending' });
      setShowForm(false);
      loadData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  async function handleStatusChange(orderId, newStatus) {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      loadData();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const statuses = ['all', ...new Set(orders.map(o => o.status))];

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="page orders-page">
      <div className="page-header">
        <div>
          <h1>Orders</h1>
          <p className="page-subtitle">{orders.length} total orders</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ New Order'}
        </button>
      </div>

      {showForm && (
        <div className="card form-card slide-in">
          <h3>Create New Order</h3>
          <form onSubmit={handleSubmit} className="customer-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Customer *</label>
                <select
                  value={form.customer_id}
                  onChange={e => setForm({ ...form, customer_id: e.target.value })}
                  required
                >
                  <option value="">Select a customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Product *</label>
                <input
                  type="text"
                  value={form.product}
                  onChange={e => setForm({ ...form, product: e.target.value })}
                  placeholder="e.g. Wireless Headphones"
                  required
                />
              </div>
              <div className="form-group">
                <label>Amount (₹) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  placeholder="199.99"
                  required
                />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                >
                  {allStatuses.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <button type="submit" className="btn btn--primary">Create Order</button>
          </form>
        </div>
      )}

      <div className="filter-tabs">
        {statuses.map(status => (
          <button
            key={status}
            className={`filter-tab ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status === 'all' ? 'All' : status}
            <span className="filter-count">
              {status === 'all' ? orders.length : orders.filter(o => o.status === status).length}
            </span>
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Product</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id}>
                  <td><code className="woo-id">{order.woo_order_id || order.id.slice(0, 8)}</code></td>
                  <td className="product-cell">{order.product}</td>
                  <td>{order.customers?.name || '—'}</td>
                  <td className="amount-cell">₹{parseFloat(order.amount).toLocaleString()}</td>
                  <td>
                    <select
                      className="status-select"
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      style={{
                        background: (statusColors[order.status] || '#94a3b8') + '15',
                        color: statusColors[order.status] || '#94a3b8',
                        borderColor: (statusColors[order.status] || '#94a3b8') + '30',
                      }}
                    >
                      {allStatuses.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="date-cell">{new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <span>📦</span>
          <p>{filter === 'all' ? 'No orders yet. Create your first order above!' : `No orders with status "${filter}"`}</p>
        </div>
      )}
    </div>
  );
}
