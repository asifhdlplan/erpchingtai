import { supabase } from './supabaseClient';

const LOCAL_STORAGE_KEY = 'erp_yarn_receipt_data';

export const yarnReceiptStorage = {
  checkCloudTable: async () => {
    try {
      const { data, error } = await supabase
        .from('erp_yarn_receipts')
        .select('id')
        .limit(1);
      
      if (error) {
        if (error.code === '42P01' || error.message?.includes('relation "erp_yarn_receipts" does not exist') || error.status === 404) {
          return { exists: false, error: 'Table erp_yarn_receipts does not exist in the database.' };
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
          .from('erp_yarn_receipts')
          .upsert(item);
          
        if (!error) {
          syncedCount++;
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

  saveYarnReceipt: async (receiptItem) => {
    try {
      const itemId = receiptItem.id || Date.now().toString() + '_' + Math.random().toString(36).substr(2, 5);
      const itemData = {
        id: itemId,
        plant: receiptItem.plant || '',
        storageLocation: receiptItem.storageLocation || '',
        materialDescription: receiptItem.materialDescription || '',
        unit: receiptItem.unit || 'KG',
        supplierName: receiptItem.supplierName || '',
        supplierLot: receiptItem.supplierLot || '',
        receiveQty: parseFloat(receiptItem.unrestrictedStock !== undefined ? receiptItem.unrestrictedStock : receiptItem.receiveQty) || 0,
        rcvDate: receiptItem.lastGoodsReceiptDate || receiptItem.rcvDate || '',
        createdAt: receiptItem.createdAt || new Date().toISOString()
      };

      const { error } = await supabase
        .from('erp_yarn_receipts')
        .upsert(itemData);

      if (error) {
        console.warn('Supabase save error, writing to localStorage fallback:', error.message);
        saveToLocalStorage(itemData);
      } else {
        deleteFromLocalStorage(itemId);
      }
      return itemData;
    } catch (e) {
      console.error('Failed to save yarn receipt in database, falling back to localStorage:', e);
      const itemId = receiptItem.id || Date.now().toString() + '_' + Math.random().toString(36).substr(2, 5);
      const itemData = {
        id: itemId,
        plant: receiptItem.plant || '',
        storageLocation: receiptItem.storageLocation || '',
        materialDescription: receiptItem.materialDescription || '',
        unit: receiptItem.unit || 'KG',
        supplierName: receiptItem.supplierName || '',
        supplierLot: receiptItem.supplierLot || '',
        receiveQty: parseFloat(receiptItem.unrestrictedStock !== undefined ? receiptItem.unrestrictedStock : receiptItem.receiveQty) || 0,
        rcvDate: receiptItem.lastGoodsReceiptDate || receiptItem.rcvDate || '',
        createdAt: receiptItem.createdAt || new Date().toISOString()
      };
      saveToLocalStorage(itemData);
      return itemData;
    }
  },

  getAllYarnReceipts: async () => {
    try {
      const tableCheck = await yarnReceiptStorage.checkCloudTable();
      
      if (tableCheck.exists) {
        const localItems = getFromLocalStorage();
        if (localItems.length > 0) {
          console.log(`Auto-syncing ${localItems.length} local receipts to cloud...`);
          await yarnReceiptStorage.syncLocalToCloud();
        }

        const { data, error } = await supabase
          .from('erp_yarn_receipts')
          .select('*')
          .order('rcvDate', { ascending: false });

        if (!error) {
          return data || [];
        }
        console.warn('Supabase read error after table check passed:', error.message);
      } else {
        console.warn('Cloud table not available, using local storage fallback:', tableCheck.error);
      }
      return getFromLocalStorage();
    } catch (e) {
      console.error('Failed to fetch yarn receipts from database, reading localStorage:', e);
      return getFromLocalStorage();
    }
  },

  backfillReceiptsFromStock: async (stockItems) => {
    try {
      const receipts = await yarnReceiptStorage.getAllYarnReceipts();
      const receiptKeys = new Set(receipts.map(r => `${r.materialDescription}_${r.supplierLot}_${r.supplierName}`));
      
      for (const stock of stockItems) {
        const key = `${stock.materialDescription}_${stock.supplierLot}_${stock.supplierName}`;
        if (!receiptKeys.has(key)) {
          await yarnReceiptStorage.saveYarnReceipt({
            plant: stock.plant,
            storageLocation: stock.storageLocation,
            materialDescription: stock.materialDescription,
            unit: stock.unit,
            supplierName: stock.supplierName,
            supplierLot: stock.supplierLot,
            unrestrictedStock: stock.unrestrictedStock,
            lastGoodsReceiptDate: stock.lastGoodsReceiptDate,
            createdAt: stock.createdAt
          });
          receiptKeys.add(key);
        }
      }
    } catch (e) {
      console.error('Failed to backfill receipts:', e);
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
