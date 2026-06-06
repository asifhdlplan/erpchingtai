import { supabase } from './supabaseClient';

export const STORAGE_KEY = 'erp_orders_data';

export const storageService = {
  saveOrder: async (order) => {
    try {
      const orderId = order.id || Date.now().toString();
      const orderData = {
        ...order,
        id: orderId,
        createdAt: order.createdAt || new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('erp_orders')
        .upsert(orderData);

      if (error) throw error;
      return orderData;
    } catch (e) {
      console.error('Failed to save order:', e);
      throw e;
    }
  },

  getAllOrders: async () => {
    try {
      const { data, error } = await supabase
        .from('erp_orders')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Failed to get all orders:', e);
      return [];
    }
  },

  deleteOrder: async (id) => {
    try {
      const { error } = await supabase
        .from('erp_orders')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (e) {
      console.error('Failed to delete order:', e);
      throw e;
    }
  },

  getOrderById: async (id) => {
    try {
      const { data, error } = await supabase
        .from('erp_orders')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Failed to get order by ID:', e);
      return null;
    }
  }
};
