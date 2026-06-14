import { supabase } from './supabaseClient';

export const productionStorage = {
  checkCloudTable: async () => {
    try {
      const { data, error } = await supabase
        .from('erp_production_entries')
        .select('id')
        .limit(1);
      if (error && error.code === 'PGRST116') {
        return { exists: true };
      }
      if (error) {
        return { exists: false, error: error.message };
      }
      return { exists: true };
    } catch (e) {
      return { exists: false, error: e.message };
    }
  },

  saveProductionEntry: async (entry) => {
    try {
      const entryId = entry.id || Date.now().toString();
      const entryData = {
        ...entry,
        id: entryId,
        setNo: parseInt(entry.setNo),
        productionQty: parseFloat(entry.productionQty)
      };

      const { error } = await supabase
        .from('erp_production_entries')
        .upsert(entryData);

      if (error) throw error;
      return entryData;
    } catch (e) {
      console.error('Failed to save production entry:', e);
      throw e;
    }
  },

  getAllProductionEntries: async () => {
    try {
      const { data, error } = await supabase
        .from('erp_production_entries')
        .select('*')
        .order('date', { ascending: false })
        .order('createdAt', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Failed to get production entries:', e);
      return [];
    }
  },

  deleteProductionEntry: async (id) => {
    try {
      const { error } = await supabase
        .from('erp_production_entries')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (e) {
      console.error('Failed to delete production entry:', e);
      throw e;
    }
  }
};
