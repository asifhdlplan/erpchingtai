import { supabase } from './supabaseClient';

const LOCAL_STORAGE_KEY = 'erp_yarn_stock_data';

export const yarnStockStorage = {
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
        saveToLocalStorage(itemData);
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
      const { data, error } = await supabase
        .from('erp_yarn_stock')
        .select('*')
        .order('createdAt', { ascending: false });

      if (error) {
        console.warn('Supabase read error, fetching from localStorage fallback:', error.message);
        return getFromLocalStorage();
      }
      return data || [];
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
