import pkg from '@woocommerce/woocommerce-rest-api';
import dotenv from 'dotenv';
dotenv.config();

const WooCommerceRestApi = pkg.default || pkg;

// Only initialize if credentials exist so it doesn't crash without them
let api = null;
if (process.env.WOO_STORE_URL && process.env.WOO_CONSUMER_KEY && process.env.WOO_CONSUMER_SECRET) {
  api = new WooCommerceRestApi({
    url: process.env.WOO_STORE_URL,
    consumerKey: process.env.WOO_CONSUMER_KEY,
    consumerSecret: process.env.WOO_CONSUMER_SECRET,
    version: 'wc/v3',
  });
}

const mockProducts = [
  'Wireless Bluetooth Headphones',
  'Smart LED Desk Lamp',
  'Ergonomic Keyboard Pro',
  'USB-C Hub 7-in-1',
];
const mockStatuses = ['completed', 'processing', 'pending', 'on-hold', 'cancelled'];
function generateWooOrder(index) {
  return {
    woo_order_id: `WC-MOCK-${1000 + index}`,
    product: mockProducts[index % mockProducts.length],
    amount: parseFloat((Math.random() * 200 + 20).toFixed(2)),
    status: mockStatuses[Math.floor(Math.random() * 3)],
    created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
}

export async function fetchWooCommerceOrders(count = 10) {
  // If API credentials are not set up, return mock data
  if (!api) {
    console.log('⚠️ WooCommerce credentials not found in .env, falling back to mock data.');
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(Array.from({ length: count }, (_, i) => generateWooOrder(i)));
      }, 300);
    });
  }

  // Fetch real data from WooCommerce API
  try {
    console.log(`fetching real woocommerce orders from ${process.env.WOO_STORE_URL}`);
    const { data } = await api.get('orders', { per_page: count });
    
    return data.map(order => ({
      woo_order_id: `WC-${order.id}`,
      product: order.line_items && order.line_items.length > 0 
               ? order.line_items[0].name 
               : 'Unknown Product',
      amount: parseFloat(order.total),
      status: order.status,
      created_at: order.date_created,
    }));
  } catch (err) {
    console.error('Error fetching real WooCommerce data:', err.response?.data || err.message);
    throw new Error('Failed to connect to WooCommerce. Please check your credentials.');
  }
}
