import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { supabase } from './config/supabase.js';
import customerRoutes from './routes/customers.js';
import orderRoutes from './routes/orders.js';
import logRoutes from './routes/logs.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/logs', logRoutes);

// Dashboard endpoint
app.get('/api/dashboard', async (req, res) => {
  try {
    const [customersRes, ordersRes, recentLogsRes] = await Promise.all([
      supabase.from('customers').select('id, priority_score', { count: 'exact' }),
      supabase.from('orders').select('amount, status', { count: 'exact' }),
      supabase.from('logs').select('*, customers(name)').order('created_at', { ascending: false }).limit(10),
    ]);

    const totalCustomers = customersRes.count || 0;
    const totalOrders = ordersRes.count || 0;
    const orders = ordersRes.data || [];
    const totalRevenue = orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + parseFloat(o.amount), 0);
    const avgPriorityScore = customersRes.data?.length
      ? Math.round(customersRes.data.reduce((sum, c) => sum + (c.priority_score || 0), 0) / customersRes.data.length)
      : 0;

    const statusBreakdown = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});

    res.json({
      totalCustomers,
      totalOrders,
      totalRevenue: totalRevenue.toFixed(2),
      avgPriorityScore,
      statusBreakdown,
      recentActivity: recentLogsRes.data || [],
      wooConnected: !!(process.env.WOO_STORE_URL && process.env.WOO_CONSUMER_KEY && process.env.WOO_CONSUMER_SECRET),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Config endpoint — tells the frontend what features are available
app.get('/api/config', (req, res) => {
  res.json({
    wooConnected: !!(process.env.WOO_STORE_URL && process.env.WOO_CONSUMER_KEY && process.env.WOO_CONSUMER_SECRET),
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Customer Insights Engine ──
import { generateInsights } from './services/insightsEngine.js';

app.get('/api/customers/:id/insights', async (req, res) => {
  try {
    const { id } = req.params;
    const [customerRes, ordersRes, logsRes] = await Promise.all([
      supabase.from('customers').select('*').eq('id', id).single(),
      supabase.from('orders').select('*').eq('customer_id', id).order('created_at', { ascending: false }),
      supabase.from('logs').select('*').eq('customer_id', id).order('created_at', { ascending: false }),
    ]);

    if (customerRes.error) return res.status(404).json({ error: 'Customer not found' });

    const insights = generateInsights(customerRes.data, ordersRes.data || [], logsRes.data || []);
    res.json({ customer: customerRes.data.name, insights });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Analytics Endpoint ──
app.get('/api/analytics', async (req, res) => {
  try {
    const [ordersRes, customersRes] = await Promise.all([
      supabase.from('orders').select('amount, status, created_at, customer_id'),
      supabase.from('customers').select('id, name, priority_score').order('priority_score', { ascending: false }).limit(5),
    ]);

    const orders = ordersRes.data || [];

    const { days } = req.query;
    const completedOrders = orders.filter(o => o.status === 'completed');
    const monthlyRevenue = {};

    if (['7', '10', '30'].includes(days)) {
      const dCount = parseInt(days, 10);
      
      // Pre-fill days to ensure continuous chart
      for (let i = dCount - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        monthlyRevenue[d.toLocaleString('default', { month: 'short', day: 'numeric' })] = 0;
      }
      
      completedOrders.forEach(o => {
        const dayKey = new Date(o.created_at).toLocaleString('default', { month: 'short', day: 'numeric' });
        if (monthlyRevenue[dayKey] !== undefined) {
          monthlyRevenue[dayKey] += parseFloat(o.amount);
        }
      });
    } else {
      // Default: All time grouped by month
      completedOrders.forEach(o => {
        const month = new Date(o.created_at).toLocaleString('default', { month: 'short', year: '2-digit' });
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + parseFloat(o.amount);
      });
    }

    // Revenue per customer (for top customers chart)
    const customerRevenue = {};
    orders.filter(o => o.status === 'completed').forEach(o => {
      customerRevenue[o.customer_id] = (customerRevenue[o.customer_id] || 0) + parseFloat(o.amount);
    });

    const topCustomers = (customersRes.data || []).map(c => ({
      name: c.name,
      score: c.priority_score,
      revenue: customerRevenue[c.id] || 0,
    }));

    res.json({
      monthlyRevenue,
      topCustomers,
      totalOrders: orders.length,
      completedOrders: orders.filter(o => o.status === 'completed').length,
      conversionRate: orders.length ? ((orders.filter(o => o.status === 'completed').length / orders.length) * 100).toFixed(1) : 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── CSV Export ──
app.get('/api/export/:type', async (req, res) => {
  try {
    const { type } = req.params;

    if (type === 'customers') {
      const { data } = await supabase.from('customers').select('*').order('created_at', { ascending: false });
      const csv = [
        'Name,Email,Phone,Company,Priority Score,Created At',
        ...(data || []).map(c => `"${c.name}","${c.email}","${c.phone || ''}","${c.company || ''}",${c.priority_score || 0},"${c.created_at}"`),
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=customers.csv');
      return res.send(csv);
    }

    if (type === 'orders') {
      const { data } = await supabase.from('orders').select('*, customers(name)').order('created_at', { ascending: false });
      const csv = [
        'Order ID,Customer,Product,Amount,Status,WooCommerce ID,Created At',
        ...(data || []).map(o => `"${o.id}","${o.customers?.name || ''}","${o.product}",${o.amount},"${o.status}","${o.woo_order_id || ''}","${o.created_at}"`),
      ].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=orders.csv');
      return res.send(csv);
    }

    res.status(400).json({ error: 'Invalid export type. Use "customers" or "orders".' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`\n🚀 ClutchFlow CRM Backend running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/api/dashboard`);
  console.log(`👥 Customers: http://localhost:${PORT}/api/customers`);
  console.log(`📦 Orders:    http://localhost:${PORT}/api/orders`);
  console.log(`📝 Logs:      http://localhost:${PORT}/api/logs/recent\n`);
});
