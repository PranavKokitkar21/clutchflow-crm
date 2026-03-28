import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', company: '' });
  const navigate = useNavigate();

  useEffect(() => {
    loadCustomers();
  }, []);

  async function loadCustomers() {
    try {
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('Failed to load customers:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await api.createCustomer(form);
      setForm({ name: '', email: '', phone: '', company: '' });
      setShowForm(false);
      loadCustomers();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  async function handleDelete(id, name) {
    if (!confirm(`Delete ${name}? This will also delete their orders and logs.`)) return;
    try {
      await api.deleteCustomer(id);
      loadCustomers();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  }

  function getPriorityBadge(score) {
    if (score >= 50) return <span className="priority-badge priority--high">🔥 High ({score})</span>;
    if (score >= 20) return <span className="priority-badge priority--medium">⚡ Medium ({score})</span>;
    return <span className="priority-badge priority--low">📊 Low ({score})</span>;
  }

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.company && c.company.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner"></div>
        <p>Loading customers...</p>
      </div>
    );
  }

  return (
    <div className="page customers-page">
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p className="page-subtitle">{customers.length} total customers</p>
        </div>
        <button className="btn btn--primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? '✕ Cancel' : '+ Add Customer'}
        </button>
      </div>

      {showForm && (
        <div className="card form-card slide-in">
          <h3>New Customer</h3>
          <form onSubmit={handleSubmit} className="customer-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  value={form.company}
                  onChange={e => setForm({ ...form, company: e.target.value })}
                  placeholder="Acme Inc."
                />
              </div>
            </div>
            <button type="submit" className="btn btn--primary">Create Customer</button>
          </form>
        </div>
      )}

      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search customers by name, email, or company..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="customer-grid">
        {filtered.map(customer => (
          <div key={customer.id} className="customer-card card" onClick={() => navigate(`/customers/${customer.id}`)}>
            <div className="customer-card__header">
              <div className="customer-avatar">
                {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="customer-info">
                <h3>{customer.name}</h3>
                <p className="customer-email">{customer.email}</p>
              </div>
              <button
                className="btn-icon btn-delete"
                onClick={(e) => { e.stopPropagation(); handleDelete(customer.id, customer.name); }}
                title="Delete customer"
              >
                🗑️
              </button>
            </div>
            <div className="customer-card__body">
              {customer.company && (
                <div className="customer-meta">
                  <span>🏢</span> {customer.company}
                </div>
              )}
              {customer.phone && (
                <div className="customer-meta">
                  <span>📞</span> {customer.phone}
                </div>
              )}
            </div>
            <div className="customer-card__footer">
              {getPriorityBadge(customer.priority_score || 0)}
              <span className="customer-date">
                Added {new Date(customer.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <span>🔍</span>
          <p>No customers found</p>
        </div>
      )}
    </div>
  );
}
