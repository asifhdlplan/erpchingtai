import { supabase } from './supabaseClient';

const LOCAL_STORAGE_KEY = 'erp_yarn_stock_data';

export const yarnStockStorage = {
  checkCloudTable: async () => {
    try {
      const { data, error } = await supabase
        .from('erp_yarn_stock')
        .select('id')
        .limit(1);
      
      if (error) {
        // Postgres code '42P01' is relation does not exist, status 404 is also typical of PostgREST
        if (error.code === '42P01' || error.message?.includes('relation "erp_yarn_stock" does not exist') || error.status === 404) {
          return { exists: false, error: 'Table erp_yarn_stock does not exist in the database.' };
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
    if (localItems.length === 0) return { synced: 0, total: 0, errors: [] };
    
    let syncedCount = 0;
    const errors = [];
    
    for (const item of localItems) {
      try {
        const { error } = await supabase
          .from('erp_yarn_stock')
          .upsert(item);
          
        if (!error) {
          syncedCount++;
          // Remove from local storage upon successful sync
          deleteFromLocalStorage(item.id);
        } else {
          errors.push({ id: item.id, message: error.message });
        }
      } catch (e) {
        errors.push({ id: item.id, message: e.message || String(e) });
      }
    }
    
    return { synced: syncedCount, total: localItems.length, errors };
  },

  saveYarnStock: async (stockItem) => {
    try {
      const itemId = stockItem.id || Date.now().toString();
      const itemData = {
        id: itemId,
        plant: stockItem.plant || '',
        storageLocation: stockItem.storageLocation || '',
        materialDescription: stockItem.materialDescription || '',
        unit: stockItem.unit || 'KG',
        supplierName: stockItem.supplierName || '',
        supplierLot: stockItem.supplierLot || '',
        unrestrictedStock: parseFloat(stockItem.unrestrictedStock) || 0,
        lastGoodsReceiptDate: stockItem.lastGoodsReceiptDate || '',
        createdAt: stockItem.createdAt || new Date().toISOString()
      };

      const { error } = await supabase
        .from('erp_yarn_stock')
        .upsert(itemData);

      if (error) {
        console.warn('Supabase save error, writing to localStorage fallback:', error.message);
        saveToLocalStorage(itemData);
      } else {
        // Clear from local storage on successful cloud write to keep local storage clean
        deleteFromLocalStorage(itemId);
      }
      return itemData;
    } catch (e) {
      console.error('Failed to save yarn stock in database, falling back to localStorage:', e);
      const itemId = stockItem.id || Date.now().toString();
      const itemData = {
        id: itemId,
        plant: stockItem.plant || '',
        storageLocation: stockItem.storageLocation || '',
        materialDescription: stockItem.materialDescription || '',
        unit: stockItem.unit || 'KG',
        supplierName: stockItem.supplierName || '',
        supplierLot: stockItem.supplierLot || '',
        unrestrictedStock: parseFloat(stockItem.unrestrictedStock) || 0,
        lastGoodsReceiptDate: stockItem.lastGoodsReceiptDate || '',
        createdAt: stockItem.createdAt || new Date().toISOString()
      };
      saveToLocalStorage(itemData);
      return itemData;
    }
  },

  getAllYarnStocks: async () => {
    try {
      // Check if table is available and healthy
      const tableCheck = await yarnStockStorage.checkCloudTable();
      
      if (tableCheck.exists) {
        // Auto-sync local storage items to the cloud first
        const localItems = getFromLocalStorage();
        if (localItems.length > 0) {
          console.log(`Auto-syncing ${localItems.length} local items to cloud...`);
          await yarnStockStorage.syncLocalToCloud();
        }

        const { data, error } = await supabase
          .from('erp_yarn_stock')
          .select('*')
          .order('createdAt', { ascending: false });

        if (!error) {
          return data || [];
        }
        console.warn('Supabase read error after table check passed:', error.message);
      } else {
        console.warn('Cloud table not available, using local storage fallback:', tableCheck.error);
      }
      return getFromLocalStorage();
    } catch (e) {
      console.error('Failed to fetch yarn stocks from database, reading localStorage:', e);
      return getFromLocalStorage();
    }
  },

  deleteYarnStock: async (id) => {
    try {
      const { error } = await supabase
        .from('erp_yarn_stock')
        .delete()
        .eq('id', id);

      if (error) {
        console.warn('Supabase delete error, deleting from localStorage fallback:', error.message);
        deleteFromLocalStorage(id);
      } else {
        deleteFromLocalStorage(id);
      }
      return true;
    } catch (e) {
      console.error('Failed to delete yarn stock from database, falling back to localStorage:', e);
      deleteFromLocalStorage(id);
      return true;
    }
  }
};

function getFromLocalStorage() {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to read from localStorage:', e);
    return [];
  }
}

function saveToLocalStorage(newItem) {
  try {
    const current = getFromLocalStorage();
    const index = current.findIndex(item => item.id === newItem.id);
    if (index >= 0) {
      current[index] = newItem;
    } else {
      current.unshift(newItem);
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to write to localStorage:', e);
  }
}

function deleteFromLocalStorage(id) {
  try {
    const current = getFromLocalStorage();
    const updated = current.filter(item => item.id !== id);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete from localStorage:', e);
  }
}
