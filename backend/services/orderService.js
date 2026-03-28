import { supabase } from '../config/supabase.js';
import { fetchWooCommerceOrders } from '../mock/woocommerce.js';
import { customerService } from './customerService.js';

export const orderService = {
  async getAll() {
    const { data, error } = await supabase
      .from('orders')
      .select(`*, customers(name, email)`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getByCustomerId(customerId) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(order) {
    const { data, error } = await supabase
      .from('orders')
      .insert(order)
      .select()
      .single();
    if (error) throw error;

    // Update priority score after new order
    await customerService.updatePriorityScore(order.customer_id);

    return data;
  },

  async updateStatus(id, status) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    // Recalculate priority score since status changed
    if (data.customer_id) {
      await customerService.updatePriorityScore(data.customer_id);
    }

    return data;
  },

  async syncFromWooCommerce(customerIds) {
    const wooOrders = await fetchWooCommerceOrders(10);

    // Distribute orders among existing customers
    const ordersToInsert = wooOrders.map((order, index) => ({
      customer_id: customerIds[index % customerIds.length],
      product: order.product,
      amount: order.amount,
      status: order.status,
      woo_order_id: order.woo_order_id,
    }));

    const { data, error } = await supabase
      .from('orders')
      .insert(ordersToInsert)
      .select();
    if (error) throw error;

    // Update priority scores for affected customers
    const uniqueCustomerIds = [...new Set(ordersToInsert.map(o => o.customer_id))];
    await Promise.all(uniqueCustomerIds.map(id => customerService.updatePriorityScore(id)));

    return { synced: data.length, orders: data };
  },
};
