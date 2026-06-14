import { supabase } from './supabaseClient';

export const PLANNING_STORAGE_KEY = 'erp_planning_sheets';

const getFromLocalStorage = () => {
  try {
    const val = localStorage.getItem(PLANNING_STORAGE_KEY);
    return val ? JSON.parse(val) : [];
  } catch {
    return [];
  }
};

const saveToLocalStorage = (item) => {
  try {
    const items = getFromLocalStorage();
    const idx = items.findIndex(i => i.id === item.id);
    if (idx >= 0) {
      items[idx] = item;
    } else {
      items.push(item);
    }
    localStorage.setItem(PLANNING_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
  }
};

const deleteFromLocalStorage = (id) => {
  try {
    const items = getFromLocalStorage();
    const filtered = items.filter(i => i.id !== id);
    localStorage.setItem(PLANNING_STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to delete from localStorage:', e);
  }
};

export const planningStorage = {
  checkCloudTable: async () => {
    try {
      const { data, error } = await supabase
        .from('erp_planning_sheets')
        .select('id')
        .limit(1);
      
      if (error) {
        if (error.code === '42P01' || error.message?.includes('relation "erp_planning_sheets" does not exist') || error.status === 404) {
          return { exists: false, error: 'Table erp_planning_sheets does not exist in the database.' };
        }
        return { exists: false, error: error.message };
      }
      return { exists: true };
    } catch (e) {
      return { exists: false, error: e.message || String(e) };
    }
  },

  syncLocalToCloud: async () => {
    const localItems = getFromLocalStorage();
    if (localItems.length === 0) return { synced: 0, total: 0 };
    
    let syncedCount = 0;
    for (const item of localItems) {
      try {
        const dbData = { ...item };
        if (dbData.piRecDate !== undefined) {
          dbData.sizing = {
            ...(dbData.sizing || {}),
            piRecDate: dbData.piRecDate
          };
          delete dbData.piRecDate;
        }

        const { error } = await supabase
          .from('erp_planning_sheets')
          .upsert(dbData);
          
        if (!error) {
          syncedCount++;
          deleteFromLocalStorage(item.id);
        }
      } catch (e) {
        console.error('Sync failed for item:', item.id, e);
      }
    }
    return { synced: syncedCount, total: localItems.length };
  },

  savePlanningSheet: async (sheet) => {
    const sheetId = sheet.id || Date.now().toString();
    const sheetData = { 
      ...sheet, 
      id: sheetId,
      timestamp: sheet.timestamp || new Date().toISOString() 
    };

    const dbData = { ...sheetData };
    if (dbData.piRecDate !== undefined) {
      dbData.sizing = {
        ...(dbData.sizing || {}),
        piRecDate: dbData.piRecDate
      };
      delete dbData.piRecDate;
    }

    try {
      const { error } = await supabase
        .from('erp_planning_sheets')
        .upsert(dbData);

      if (error) {
        console.warn('Supabase save error, writing to localStorage fallback:', error.message);
        saveToLocalStorage(sheetData);
      } else {
        deleteFromLocalStorage(sheetId);
      }
      return sheetData;
    } catch (e) {
      console.error('Failed to save planning sheet in database, falling back to localStorage:', e);
      saveToLocalStorage(sheetData);
      return sheetData;
    }
  },

  getAllSheets: async () => {
    try {
      const tableCheck = await planningStorage.checkCloudTable();
      if (tableCheck.exists) {
        // Sync local storage sheets first
        const localItems = getFromLocalStorage();
        if (localItems.length > 0) {
          await planningStorage.syncLocalToCloud();
        }

        const { data, error } = await supabase
          .from('erp_planning_sheets')
          .select('*')
          .order('timestamp', { ascending: false });

        if (!error) {
          const formattedData = (data || []).map(sheet => {
            if (sheet.sizing?.piRecDate) {
              return {
                ...sheet,
                piRecDate: sheet.sizing.piRecDate
              };
            }
            return sheet;
          });
          return formattedData;
        }
      }
      // Fallback to local storage if cloud table check fails or returns error
      return getFromLocalStorage().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (e) {
      console.error('Failed to get all sheets from database, falling back to localStorage:', e);
      return getFromLocalStorage().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
  },

  deletePlanningSheet: async (id) => {
    try {
      deleteFromLocalStorage(id);
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
      const sheetsList = await planningStorage.getAllSheets();
      if (!sheetsList || sheetsList.length === 0) return 100001;
      const maxSetNo = Math.max(...sheetsList.map(s => parseInt(s.setNo) || 0));
      return maxSetNo >= 100001 ? maxSetNo + 1 : 100001;
    } catch (e) {
      console.error('Failed to calculate next set number:', e);
      return 100001;
    }
  }
};
