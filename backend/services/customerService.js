import { supabase } from '../config/supabase.js';

export const customerService = {
  async getAll() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async getDetailById(id) {
    // Get customer + their orders + their logs
    const [customerRes, ordersRes, logsRes] = await Promise.all([
      supabase.from('customers').select('*').eq('id', id).single(),
      supabase.from('orders').select('*').eq('customer_id', id).order('created_at', { ascending: false }),
      supabase.from('logs').select('*').eq('customer_id', id).order('created_at', { ascending: false }),
    ]);

    if (customerRes.error) throw customerRes.error;

    return {
      ...customerRes.data,
      orders: ordersRes.data || [],
      logs: logsRes.data || [],
    };
  },

  async create(customer) {
    const { data, error } = await supabase
      .from('customers')
      .insert(customer)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async delete(id) {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  },

  async updatePriorityScore(customerId) {
    // Priority Score = (order_count * 10) + (total_spend / 100)
    const { data: orders } = await supabase
      .from('orders')
      .select('amount')
      .eq('customer_id', customerId)
      .eq('status', 'completed');

    const orderCount = orders?.length || 0;
    const totalSpend = orders?.reduce((sum, o) => sum + parseFloat(o.amount), 0) || 0;
    const score = Math.round((orderCount * 10) + (totalSpend / 100));

    await supabase
      .from('customers')
      .update({ priority_score: score })
      .eq('id', customerId);

    return score;
  },
};
