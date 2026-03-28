import { supabase } from '../config/supabase.js';

const sampleCustomers = [
  { name: 'Arjun Mehta', email: 'arjun@techcorp.in', phone: '+91 98765 43210', company: 'TechCorp India' },
  { name: 'Priya Sharma', email: 'priya@designstudio.com', phone: '+91 87654 32109', company: 'Design Studio' },
  { name: 'Rahul Verma', email: 'rahul@startupx.io', phone: '+91 76543 21098', company: 'StartupX' },
  { name: 'Sneha Patel', email: 'sneha@cloudify.dev', phone: '+91 65432 10987', company: 'Cloudify Solutions' },
  { name: 'Vikram Singh', email: 'vikram@ecomhub.in', phone: '+91 54321 09876', company: 'EcomHub' },
  { name: 'Ananya Reddy', email: 'ananya@fintech.co', phone: '+91 43210 98765', company: 'FinTech Plus' },
  { name: 'Karan Joshi', email: 'karan@webworks.com', phone: '+91 32109 87654', company: 'WebWorks' },
  { name: 'Divya Nair', email: 'divya@mediahouse.in', phone: '+91 21098 76543', company: 'Media House' },
];

const sampleProducts = [
  'Wireless Bluetooth Headphones',
  'Smart LED Desk Lamp',
  'Ergonomic Keyboard Pro',
  'USB-C Hub 7-in-1',
  'Portable SSD 1TB',
  'Noise Cancelling Earbuds',
  'Webcam HD 1080p',
  'Mechanical Keyboard RGB',
];

const logTypes = ['email', 'call', 'note', 'meeting'];
const sampleMessages = [
  { type: 'email', message: 'Sent product catalog and pricing details' },
  { type: 'call', message: 'Discussed bulk order discount — interested in 50+ units' },
  { type: 'note', message: 'Customer prefers monthly billing cycle' },
  { type: 'meeting', message: 'Onboarding call completed, setup account access' },
  { type: 'email', message: 'Follow-up on pending invoice #1042' },
  { type: 'call', message: 'Resolved shipping delay issue — expedited delivery confirmed' },
  { type: 'note', message: 'VIP customer — priority support required' },
  { type: 'email', message: 'Sent renewal reminder for annual subscription' },
  { type: 'meeting', message: 'Quarterly review — discussed roadmap and feature requests' },
  { type: 'call', message: 'Technical support call — resolved login issue' },
];

async function seed() {
  console.log('🌱 Seeding database...\n');

  // Clear existing data
  console.log('  Clearing existing data...');
  await supabase.from('logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('orders').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('customers').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // Insert customers
  console.log('  Inserting customers...');
  const { data: customers, error: custError } = await supabase
    .from('customers')
    .insert(sampleCustomers)
    .select();

  if (custError) {
    console.error('❌ Error inserting customers:', custError.message);
    return;
  }
  console.log(`  ✅ ${customers.length} customers added`);

  // Insert orders
  console.log('  Inserting orders...');
  const statuses = ['completed', 'completed', 'completed', 'processing', 'pending'];
  const orders = [];
  for (const customer of customers) {
    const orderCount = 2 + Math.floor(Math.random() * 4); // 2-5 orders per customer
    for (let i = 0; i < orderCount; i++) {
      orders.push({
        customer_id: customer.id,
        product: sampleProducts[Math.floor(Math.random() * sampleProducts.length)],
        amount: (Math.random() * 300 + 25).toFixed(2),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        woo_order_id: `WC-${1000 + orders.length}`,
      });
    }
  }

  const { data: insertedOrders, error: orderError } = await supabase
    .from('orders')
    .insert(orders)
    .select();

  if (orderError) {
    console.error('❌ Error inserting orders:', orderError.message);
    return;
  }
  console.log(`  ✅ ${insertedOrders.length} orders added`);

  // Insert logs
  console.log('  Inserting communication logs...');
  const logs = [];
  for (const customer of customers) {
    const logCount = 2 + Math.floor(Math.random() * 3); // 2-4 logs per customer
    for (let i = 0; i < logCount; i++) {
      const sample = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
      logs.push({
        customer_id: customer.id,
        message: sample.message,
        type: sample.type,
      });
    }
  }

  const { data: insertedLogs, error: logError } = await supabase
    .from('logs')
    .insert(logs)
    .select();

  if (logError) {
    console.error('❌ Error inserting logs:', logError.message);
    return;
  }
  console.log(`  ✅ ${insertedLogs.length} communication logs added`);

  // Update priority scores
  console.log('  Calculating priority scores...');
  for (const customer of customers) {
    const customerOrders = insertedOrders.filter(o => o.customer_id === customer.id && o.status === 'completed');
    const orderCount = customerOrders.length;
    const totalSpend = customerOrders.reduce((sum, o) => sum + parseFloat(o.amount), 0);
    const score = Math.round((orderCount * 10) + (totalSpend / 100));

    await supabase
      .from('customers')
      .update({ priority_score: score })
      .eq('id', customer.id);
  }
  console.log('  ✅ Priority scores calculated');

  console.log('\n🎉 Database seeded successfully!\n');
}

seed().catch(console.error);
