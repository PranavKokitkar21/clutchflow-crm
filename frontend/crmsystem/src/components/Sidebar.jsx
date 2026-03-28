import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/customers', label: 'Customers', icon: '👥' },
  { path: '/orders', label: 'Orders', icon: '📦' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">⚡</div>
        <h1>ClutchFlow</h1>
        <span className="brand-tag">CRM</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="woo-badge">
          <span>🛒</span>
          <span>WooCommerce</span>
          <span className="woo-status">Connected</span>
        </div>
      </div>
    </aside>
  );
}
