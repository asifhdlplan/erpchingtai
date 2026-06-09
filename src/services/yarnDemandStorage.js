import { supabase } from './supabaseClient';

export const yarnDemandStorage = {
  checkCloudTable: async () => {
    try {
      const { data, error } = await supabase
        .from('erp_yarn_demands')
        .select('id')
        .limit(1);
      
      if (error) {
        if (error.code === '42P01' || error.message?.includes('relation "erp_yarn_demands" does not exist') || error.status === 404) {
          return { exists: false, error: 'Table erp_yarn_demands does not exist.' };
        }
        return { exists: false, error: error.message };
      }
      return { exists: true };
    } catch (e) {
      return { exists: false, error: e.message || String(e) };
    }
  },

  getNextPRNo: async () => {
    try {
      const { data, error } = await supabase
        .from('erp_yarn_demands')
        .select('prNo');

      if (error) throw error;
      if (!data || data.length === 0) return 500001;
      const maxPR = Math.max(...data.map(d => parseInt(d.prNo) || 0));
      return maxPR >= 500001 ? maxPR + 1 : 500001;
    } catch (e) {
      console.error('Failed to calculate next PR number:', e);
      return 500001;
    }
  },

  saveYarnDemand: async (demand) => {
    try {
      const id = demand.id || Date.now().toString();
      const demandData = {
        id,
        prNo: parseInt(demand.prNo) || 500001,
        date: demand.date || new Date().toISOString().slice(0, 10),
        items: demand.items || []
      };

      const { error } = await supabase
        .from('erp_yarn_demands')
        .upsert(demandData);

      if (error) throw error;
      return demandData;
    } catch (e) {
      console.error('Failed to save yarn demand:', e);
      throw e;
    }
  },

  getAllYarnDemands: async () => {
    try {
      const { data, error } = await supabase
        .from('erp_yarn_demands')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Failed to fetch yarn demands:', e);
      throw e;
    }
  },

  deleteYarnDemand: async (id) => {
    try {
      const { error } = await supabase
        .from('erp_yarn_demands')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Failed to delete yarn demand:', e);
      throw e;
    }
  },

  getDemandById: async (id) => {
    try {
      const { data, error } = await supabase
        .from('erp_yarn_demands')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (e) {
      console.error('Failed to fetch yarn demand by ID:', e);
      throw e;
    }
  }
};
