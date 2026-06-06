import { supabase } from './supabaseClient';

export const PLANNING_STORAGE_KEY = 'erp_planning_sheets';

export const planningStorage = {
  savePlanningSheet: async (sheet) => {
    try {
      const sheetId = sheet.id || Date.now().toString();
      const sheetData = { 
        ...sheet, 
        id: sheetId,
        timestamp: new Date().toISOString() 
      };
      
      const { error } = await supabase
        .from('erp_planning_sheets')
        .upsert(sheetData);

      if (error) throw error;
      return sheetData;
    } catch (e) {
      console.error('Failed to save planning sheet:', e);
      throw e;
    }
  },

  getAllSheets: async () => {
    try {
      const { data, error } = await supabase
        .from('erp_planning_sheets')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error('Failed to get all sheets:', e);
      return [];
    }
  },

  deletePlanningSheet: async (id) => {
    try {
      const { error } = await supabase
        .from('erp_planning_sheets')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (e) {
      console.error('Failed to delete planning sheet:', e);
      throw e;
    }
  },

  getNextSetNo: async () => {
    try {
      const { data, error } = await supabase
        .from('erp_planning_sheets')
        .select('setNo');

      if (error) throw error;
      if (!data || data.length === 0) return 10001;
      const maxSetNo = Math.max(...data.map(s => parseInt(s.setNo) || 0));
      return maxSetNo >= 10001 ? maxSetNo + 1 : 10001;
    } catch (e) {
      console.error('Failed to calculate next set number:', e);
      return 10001;
    }
  }
};
