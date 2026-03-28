import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';

const typeConfig = {
  email: { icon: '📧', label: 'Email' },
  call: { icon: '📞', label: 'Call' },
  note: { icon: '📝', label: 'Note' },
  meeting: { icon: '🤝', label: 'Meeting' },
};

const statusColors = {
  completed: '#10b981',
  processing: '#6366f1',
  pending: '#f59e0b',
  'on-hold': '#94a3b8',
  cancelled: '#ef4444',
};

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logForm, setLogForm] = useState({ message: '', type: 'note' });
  const [adding, setAdding] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderForm, setOrderForm] = useState({ product: '', amount: '', status: 'pending' });
  const [addingOrder, setAddingOrder] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', company: '' });
  const [insights, setInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    loadCustomer();
  }, [id]);

  async function loadCustomer() {
    try {
      const data = await api.getCustomer(id);
      setCustomer(data);
      setEditForm({ name: data.name, email: data.email, phone: data.phone || '', company: data.company || '' });
    } catch (err) {
      console.error('Failed to load customer:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadInsights() {
    setLoadingInsights(true);
    try {
      const data = await api.getInsights(id);
      setInsights(data.insights);
    } catch (err) {
      console.error('Failed to load insights:', err);
    } finally {
      setLoadingInsights(false);
    }
  }

  async function handleAddLog(e) {
    e.preventDefault();
    if (!logForm.message.trim()) return;
    setAdding(true);
    try {
      await api.createLog({ customer_id: id, message: logForm.message, type: logForm.type });
      setLogForm({ message: '', type: 'note' });
      loadCustomer();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setAdding(false);
    }
  }

  async function handleAddOrder(e) {
    e.preventDefault();
    setAddingOrder(true);
    try {
      await api.createOrder({
        customer_id: id,
        product: orderForm.product,
        amount: parseFloat(orderForm.amount),
        status: orderForm.status,
      });
      setOrderForm({ product: '', amount: '', status: 'pending' });
      setShowOrderForm(false);
      loadCustomer();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setAddingOrder(false);
    }
  }

  async function handleEditCustomer(e) {
    e.preventDefault();
    try {
      await api.updateCustomer(id, editForm);
      setEditing(false);
      loadCustomer();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  function getPriorityLevel(score) {
    if (score >= 50) return { label: 'High Priority', class: 'high', icon: '🔥' };
    if (score >= 20) return { label: 'Medium Priority', class: 'medium', icon: '⚡' };
    return { label: 'Low Priority', class: 'low', icon: '📊' };
  }

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner"></div>
        <p>Loading customer...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="page">
        <div className="empty-state">
          <span>❌</span>
          <p>Customer not found</p>
          <button className="btn btn--primary" onClick={() => navigate('/customers')}>
            Back to Customers
          </button>
        </div>
      </div>
    );
  }

  const priority = getPriorityLevel(customer.priority_score || 0);
  const totalSpend = customer.orders
    ?.filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + parseFloat(o.amount), 0) || 0;

  return (
    <div className="page customer-detail-page">
      <button className="btn btn--ghost back-btn" onClick={() => navigate('/customers')}>
        ← Back to Customers
      </button>

      {/* Customer Header */}
      <div className="customer-detail-header card">
        <div className="detail-avatar">
          {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div className="detail-info">
          {editing ? (
            <form onSubmit={handleEditCustomer} className="edit-inline-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Name *</label>
                  <input type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" value={editForm.email} onChange={e => setEditForm({ ...editForm, email: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="text" value={editForm.phone} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Company</label>
                  <input type="text" value={editForm.company} onChange={e => setEditForm({ ...editForm, company: e.target.value })} />
                </div>
              </div>
              <div className="edit-actions">
                <button type="submit" className="btn btn--primary">Save</button>
                <button type="button" className="btn btn--ghost" onClick={() => setEditing(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <>
              <h1>{customer.name}</h1>
              <div className="detail-meta-row">
                <span>📧 {customer.email}</span>
                {customer.phone && <span>📞 {customer.phone}</span>}
                {customer.company && <span>🏢 {customer.company}</span>}
              </div>
              <div className="detail-stats">
                <div className={`priority-badge-lg priority--${priority.class}`}>
                  {priority.icon} {priority.label} — Score: {customer.priority_score || 0}
                </div>
                <button className="btn btn--ghost btn--sm" onClick={() => setEditing(true)}>✏️ Edit</button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="detail-grid">
        {/* Quick Stats */}
        <div className="card quick-stats-card">
          <h3>Quick Stats</h3>
          <div className="quick-stats">
            <div className="quick-stat">
              <span className="quick-stat__value">{customer.orders?.length || 0}</span>
              <span className="quick-stat__label">Orders</span>
            </div>
            <div className="quick-stat">
              <span className="quick-stat__value">₹{totalSpend.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              <span className="quick-stat__label">Total Spend</span>
            </div>
            <div className="quick-stat">
              <span className="quick-stat__value">{customer.logs?.length || 0}</span>
              <span className="quick-stat__label">Interactions</span>
            </div>
          </div>
        </div>

        {/* Orders */}
        <div className="card orders-card">
          <div className="card-header-row">
            <h3>Order History</h3>
            <button className="btn btn--ghost btn--sm" onClick={() => setShowOrderForm(!showOrderForm)}>
              {showOrderForm ? '✕ Cancel' : '+ Add Order'}
            </button>
          </div>

          {showOrderForm && (
            <form onSubmit={handleAddOrder} className="log-form slide-in">
              <div className="log-form-row">
                <input
                  type="text"
                  placeholder="Product name"
                  value={orderForm.product}
                  onChange={e => setOrderForm({ ...orderForm, product: e.target.value })}
                  required
                />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Amount (₹)"
                  value={orderForm.amount}
                  onChange={e => setOrderForm({ ...orderForm, amount: e.target.value })}
                  required
                  style={{ maxWidth: '120px' }}
                />
                <select
                  value={orderForm.status}
                  onChange={e => setOrderForm({ ...orderForm, status: e.target.value })}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <button type="submit" className="btn btn--primary" disabled={addingOrder}>
                  {addingOrder ? '...' : 'Add'}
                </button>
              </div>
            </form>
          )}

          {customer.orders?.length ? (
            <div className="order-list">
              {customer.orders.map(order => (
                <div key={order.id} className="order-item">
                  <div className="order-product">
                    <span className="order-name">{order.product}</span>
                    {order.woo_order_id && (
                      <span className="order-woo-id">{order.woo_order_id}</span>
                    )}
                  </div>
                  <div className="order-details">
                    <span className="order-amount">₹{parseFloat(order.amount).toLocaleString()}</span>
                    <span
                      className="order-status"
                      style={{ background: (statusColors[order.status] || '#94a3b8') + '20', color: statusColors[order.status] || '#94a3b8' }}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-text">No orders yet. Add the first order above!</p>
          )}
        </div>

        {/* AI Insights */}
        <div className="card insights-card">
          <div className="card-header-row">
            <h3>🧠 Smart Insights</h3>
            <button
              className="btn btn--primary btn--sm"
              onClick={loadInsights}
              disabled={loadingInsights}
            >
              {loadingInsights ? 'Analyzing...' : insights ? '🔄 Refresh' : '✨ Generate Insights'}
            </button>
          </div>
          {insights ? (
            <div className="insights-list">
              {insights.map((insight, i) => (
                <div key={i} className={`insight-item insight-item--${insight.type}`}>
                  <div className="insight-header">
                    <span className="insight-icon">{insight.icon}</span>
                    <span className="insight-title">{insight.title}</span>
                  </div>
                  <p className="insight-detail">{insight.detail}</p>
                  <p className="insight-action">💡 <strong>Recommended:</strong> {insight.action}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-text">Click "Generate Insights" to analyze this customer's data</p>
          )}
        </div>

        {/* Communication Logs */}
        <div className="card logs-card">
          <h3>Communication Logs</h3>

          <form onSubmit={handleAddLog} className="log-form">
            <div className="log-form-row">
              <select
                value={logForm.type}
                onChange={e => setLogForm({ ...logForm, type: e.target.value })}
              >
                <option value="note">📝 Note</option>
                <option value="email">📧 Email</option>
                <option value="call">📞 Call</option>
                <option value="meeting">🤝 Meeting</option>
              </select>
              <input
                type="text"
                placeholder="Add a note or log an interaction..."
                value={logForm.message}
                onChange={e => setLogForm({ ...logForm, message: e.target.value })}
              />
              <button type="submit" className="btn btn--primary" disabled={adding}>
                {adding ? '...' : 'Add'}
              </button>
            </div>
          </form>

          {customer.logs?.length ? (
            <div className="log-list">
              {customer.logs.map(log => {
                const config = typeConfig[log.type] || typeConfig.note;
                return (
                  <div key={log.id} className="log-item">
                    <div className="log-icon">{config.icon}</div>
                    <div className="log-content">
                      <p>{log.message}</p>
                      <span className="log-time">
                        {new Date(log.created_at).toLocaleDateString()} at{' '}
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="empty-text">No communication logs yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
