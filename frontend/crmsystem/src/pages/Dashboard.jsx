import { useState, useEffect } from 'react';
import { api } from '../api/client';
import StatCard from '../components/StatCard';
import ActivityFeed from '../components/ActivityFeed';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [chartPeriod, setChartPeriod] = useState('all');
  const [loadingChart, setLoadingChart] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const [dashData, analyticsData] = await Promise.all([
        api.getDashboard(),
        api.getAnalytics(chartPeriod),
      ]);
      setStats(dashData);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handlePeriodChange(period) {
    if (period === chartPeriod) return;
    setChartPeriod(period);
    setLoadingChart(true);
    try {
      const analyticsData = await api.getAnalytics(period);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Failed to update chart:', err);
    } finally {
      setLoadingChart(false);
    }
  }

  async function handleSync() {
    setSyncing(true);
    try {
      const result = await api.syncWooCommerce();
      alert(`✅ ${result.message}`);
      loadDashboard();
    } catch (err) {
      alert('❌ Sync failed: ' + err.message);
    } finally {
      setSyncing(false);
    }
  }

  if (loading) {
    return (
      <div className="page-loader">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  const maxRevenue = analytics?.monthlyRevenue
    ? Math.max(...Object.values(analytics.monthlyRevenue))
    : 0;

  return (
    <div className="page dashboard-page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's your CRM overview.</p>
        </div>
        <div className="header-actions">
          <div className="export-dropdown">
            <a href={api.exportCSV('customers')} className="btn btn--ghost btn--sm" download>📥 Export Customers</a>
            <a href={api.exportCSV('orders')} className="btn btn--ghost btn--sm" download>📥 Export Orders</a>
          </div>
          {stats?.wooConnected && (
            <button className="btn btn--primary btn--sync" onClick={handleSync} disabled={syncing}>
              {syncing ? (
                <><span className="spinner-sm"></span> Syncing...</>
              ) : (
                <>🔄 Sync WooCommerce</>
              )}
            </button>
          )}
        </div>
      </div>

      <div className="stats-grid">
        <StatCard icon="👥" label="Total Customers" value={stats?.totalCustomers || 0} color="indigo" />
        <StatCard icon="📦" label="Total Orders" value={stats?.totalOrders || 0} color="emerald" />
        <StatCard icon="💰" label="Revenue" value={`₹${Number(stats?.totalRevenue || 0).toLocaleString()}`} color="amber" />
        <StatCard icon="✅" label="Conversion Rate" value={`${analytics?.conversionRate || 0}%`} color="rose" />
      </div>

      {/* Revenue Chart */}
      {analytics?.monthlyRevenue && Object.keys(analytics.monthlyRevenue).length > 0 && (
        <div className="card chart-card">
          <div className="chart-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3>📊 Revenue Breakdown</h3>
              <p className="chart-subtitle">{chartPeriod === 'all' ? 'Monthly revenue across all channels' : `Revenue performance over the last ${chartPeriod} days`}</p>
            </div>
            <div className="chart-filters" style={{ display: 'flex', gap: '0.4rem', background: 'var(--bg-input)', padding: '0.2rem', borderRadius: '8px' }}>
              {['7', '10', '30', 'all'].map(p => (
                <button 
                  key={p} 
                  onClick={() => handlePeriodChange(p)}
                  style={{
                    background: chartPeriod === p ? 'var(--accent-indigo)' : 'transparent',
                    color: chartPeriod === p ? '#fff' : 'var(--text-muted)',
                    border: 'none',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {p === 'all' ? 'All Time' : `${p}D`}
                </button>
              ))}
            </div>
          </div>
          
          <div className="bar-chart-container" style={{ opacity: loadingChart ? 0.5 : 1, transition: 'opacity 0.3s' }}>
            {/* Background Grid Lines */}
            <div className="chart-grid">
              <div className="chart-grid-line"></div>
              <div className="chart-grid-line"></div>
              <div className="chart-grid-line"></div>
              <div className="chart-grid-line"></div>
            </div>
            
            <div className="bar-chart">
              {Object.entries(analytics.monthlyRevenue).map(([month, revenue], i) => (
                <div key={month} className="bar-chart__item">
                  <div className="bar-chart__bar-wrapper">
                    <div
                      className="bar-chart__bar"
                      style={{ 
                        height: `${maxRevenue ? (revenue / maxRevenue) * 100 : 0}%`,
                        animationDelay: `${i * 0.1}s` 
                      }}
                    >
                      {/* Glassmorphic Hover Tooltip */}
                      <div className="chart-tooltip">
                        <span className="tooltip-month">{month}</span>
                        <span className="tooltip-value">₹{revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                    </div>
                  </div>
                  <span className="bar-chart__label">{month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-grid-2">
        {/* Top Customers */}
        {analytics?.topCustomers?.length > 0 && (
          <div className="card">
            <h3>🏆 Top Customers</h3>
            <div className="top-customers-list">
              {analytics.topCustomers.map((c, i) => (
                <div key={i} className="top-customer-item">
                  <div className="top-customer-rank">#{i + 1}</div>
                  <div className="top-customer-info">
                    <span className="top-customer-name">{c.name}</span>
                    <span className="top-customer-revenue">₹{c.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="top-customer-bar-bg">
                    <div
                      className="top-customer-bar-fill"
                      style={{ width: `${analytics.topCustomers[0].revenue ? (c.revenue / analytics.topCustomers[0].revenue) * 100 : 0}%` }}
                    ></div>
                  </div>
                  <span className="top-customer-score">⭐ {c.score}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Order Status */}
        {stats?.statusBreakdown && Object.keys(stats.statusBreakdown).length > 0 && (
          <div className="card">
            <h3>Order Status Breakdown</h3>
            <div className="status-bars">
              {Object.entries(stats.statusBreakdown).map(([status, count]) => (
                <div key={status} className="status-bar-item">
                  <div className="status-bar-header">
                    <span className={`status-dot status-dot--${status}`}></span>
                    <span className="status-name">{status}</span>
                    <span className="status-count">{count}</span>
                  </div>
                  <div className="status-bar">
                    <div
                      className={`status-bar-fill status-bar-fill--${status}`}
                      style={{ width: `${(count / stats.totalOrders) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="card recent-activity-card">
        <h3>Recent Activity</h3>
        <ActivityFeed activities={stats?.recentActivity || []} />
      </div>
    </div>
  );
}
