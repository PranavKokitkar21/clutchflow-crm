import { supabase } from '../config/supabase.js';

export const logService = {
  async getByCustomerId(customerId) {
    const { data, error } = await supabase
      .from('logs')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async create(log) {
    const { data, error } = await supabase
      .from('logs')
      .insert(log)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async getRecent(limit = 20) {
    const { data, error } = await supabase
      .from('logs')
      .select(`*, customers(name)`)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },
};
