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
    const idx = items.findIndex(i => String(i.id) === String(item.id));
    if (idx >= 0) {
      items[idx] = { ...items[idx], ...item };
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
    const filtered = items.filter(i => String(i.id) !== String(id));
    localStorage.setItem(PLANNING_STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error('Failed to delete from localStorage:', e);
  }
};

const prepareDbPayload = (sheetData) => {
  const payload = { ...sheetData };
  payload.sizing = {
    ...(payload.sizing || {}),
    piRecDate: sheetData.piRecDate,
    approvalInfo: {
      approvalStatus: sheetData.approvalStatus || 'Pending',
      approvedBy: sheetData.approvedBy || null,
      approvedAt: sheetData.approvedAt || null,
      rejectionReason: sheetData.rejectionReason || null,
      submittedBy: sheetData.submittedBy || sheetData.sizing?.createdBy || 'ASIF',
      submittedAt: sheetData.submittedAt || sheetData.timestamp || new Date().toISOString()
    }
  };
  return payload;
};

const sanitizeForLegacySchema = (payload) => {
  const clean = { ...payload };
  delete clean.piRecDate;
  delete clean.approvalStatus;
  delete clean.approvedBy;
  delete clean.approvedAt;
  delete clean.rejectionReason;
  delete clean.submittedBy;
  delete clean.submittedAt;
  return clean;
};

const upsertToCloud = async (sheetData) => {
  const fullPayload = prepareDbPayload(sheetData);

  try {
    // 1. First attempt: try full upsert with new schema columns
    let { error } = await supabase
      .from('erp_planning_sheets')
      .upsert(fullPayload);

    if (error) {
      // 2. Fallback attempt: if columns don't exist in PostgreSQL, sanitize and save inside sizing JSONB
      const legacyPayload = sanitizeForLegacySchema(fullPayload);
      const retry = await supabase
        .from('erp_planning_sheets')
        .upsert(legacyPayload);

      if (retry.error) {
        console.warn('Supabase upsert failed after legacy fallback:', retry.error.message);
        return { ok: false, error: retry.error };
      }
    }
    return { ok: true };
  } catch (e) {
    console.error('Cloud upsert error:', e);
    return { ok: false, error: e };
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
        const res = await upsertToCloud(item);
        if (res.ok) {
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
      approvalStatus: sheet.approvalStatus || 'Pending',
      submittedBy: sheet.submittedBy || sheet.sizing?.createdBy || 'ASIF',
      submittedAt: sheet.submittedAt || new Date().toISOString(),
      approvedBy: sheet.approvedBy || null,
      approvedAt: sheet.approvedAt || null,
      rejectionReason: sheet.rejectionReason || null,
      timestamp: sheet.timestamp || new Date().toISOString() 
    };

    // 1. Always save to local storage immediately for zero data loss
    saveToLocalStorage(sheetData);

    // 2. Upload to Supabase database (with resilient fallback for unmigrated columns)
    const res = await upsertToCloud(sheetData);
    if (res.ok) {
      // If successfully uploaded to cloud, remove from local storage so it's not duplicated
      deleteFromLocalStorage(sheetId);
    }

    return sheetData;
  },

  getAllSheets: async () => {
    try {
      const localItems = getFromLocalStorage();
      const tableCheck = await planningStorage.checkCloudTable();
      
      let cloudSheets = [];
      let cloudSuccess = false;

      if (tableCheck.exists) {
        // Sync any unsynced local sheets to cloud
        if (localItems.length > 0) {
          await planningStorage.syncLocalToCloud();
        }

        const { data, error } = await supabase
          .from('erp_planning_sheets')
          .select('*')
          .order('timestamp', { ascending: false });

        if (!error && data) {
          cloudSuccess = true;
          cloudSheets = data.map(sheet => {
            const approvalInfo = sheet.sizing?.approvalInfo || {};
            return {
              ...sheet,
              approvalStatus: sheet.approvalStatus || approvalInfo.approvalStatus || 'Approved',
              approvedBy: sheet.approvedBy || approvalInfo.approvedBy || null,
              approvedAt: sheet.approvedAt || approvalInfo.approvedAt || null,
              rejectionReason: sheet.rejectionReason || approvalInfo.rejectionReason || null,
              submittedBy: sheet.submittedBy || approvalInfo.submittedBy || sheet.sizing?.createdBy || 'ASIF',
              submittedAt: sheet.submittedAt || approvalInfo.submittedAt || sheet.timestamp,
              piRecDate: sheet.piRecDate || sheet.sizing?.piRecDate || '-'
            };
          });
        }
      }

      // If cloud succeeded, ALWAYS merge with any remaining local items so nothing is ever missing!
      if (cloudSuccess) {
        const remainingLocals = getFromLocalStorage().map(sheet => {
          const approvalInfo = sheet.sizing?.approvalInfo || {};
          return {
            ...sheet,
            approvalStatus: sheet.approvalStatus || approvalInfo.approvalStatus || 'Pending',
            submittedBy: sheet.submittedBy || approvalInfo.submittedBy || sheet.sizing?.createdBy || 'ASIF',
            submittedAt: sheet.submittedAt || approvalInfo.submittedAt || sheet.timestamp,
            piRecDate: sheet.piRecDate || sheet.sizing?.piRecDate || '-'
          };
        });

        const cloudIds = new Set(cloudSheets.map(s => String(s.id)));
        const unsyncedLocals = remainingLocals.filter(l => !cloudIds.has(String(l.id)));
        
        return [...unsyncedLocals, ...cloudSheets].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      }

      // Fallback if cloud was offline/failed
      return localItems
        .map(sheet => {
          const approvalInfo = sheet.sizing?.approvalInfo || {};
          return {
            ...sheet,
            approvalStatus: sheet.approvalStatus || approvalInfo.approvalStatus || 'Pending',
            submittedBy: sheet.submittedBy || approvalInfo.submittedBy || sheet.sizing?.createdBy || 'ASIF',
            submittedAt: sheet.submittedAt || approvalInfo.submittedAt || sheet.timestamp,
            piRecDate: sheet.piRecDate || sheet.sizing?.piRecDate || '-'
          };
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (e) {
      console.error('Failed to get all sheets, returning local cache:', e);
      return getFromLocalStorage()
        .map(sheet => {
          const approvalInfo = sheet.sizing?.approvalInfo || {};
          return {
            ...sheet,
            approvalStatus: sheet.approvalStatus || approvalInfo.approvalStatus || 'Pending',
            submittedBy: sheet.submittedBy || approvalInfo.submittedBy || sheet.sizing?.createdBy || 'ASIF',
            submittedAt: sheet.submittedAt || approvalInfo.submittedAt || sheet.timestamp,
            piRecDate: sheet.piRecDate || sheet.sizing?.piRecDate || '-'
          };
        })
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }
  },

  getPendingSheets: async () => {
    const sheets = await planningStorage.getAllSheets();
    return sheets.filter(s => s.approvalStatus === 'Pending');
  },

  approveSheet: async (id, approverUsername) => {
    const sheets = await planningStorage.getAllSheets();
    const target = sheets.find(s => String(s.id) === String(id));
    if (!target) throw new Error('Planning sheet not found.');
    
    const updated = {
      ...target,
      approvalStatus: 'Approved',
      approvedBy: approverUsername || 'ADMIN',
      approvedAt: new Date().toISOString()
    };
    return await planningStorage.savePlanningSheet(updated);
  },

  bulkApproveSheets: async (ids, approverUsername) => {
    const sheets = await planningStorage.getAllSheets();
    const idSet = new Set(ids.map(String));
    const now = new Date().toISOString();
    
    let approvedCount = 0;
    for (const sheet of sheets) {
      if (idSet.has(String(sheet.id))) {
        const updated = {
          ...sheet,
          approvalStatus: 'Approved',
          approvedBy: approverUsername || 'ADMIN',
          approvedAt: now
        };
        await planningStorage.savePlanningSheet(updated);
        approvedCount++;
      }
    }
    return approvedCount;
  },

  rejectSheet: async (id, approverUsername, reason) => {
    const sheets = await planningStorage.getAllSheets();
    const target = sheets.find(s => String(s.id) === String(id));
    if (!target) throw new Error('Planning sheet not found.');
    
    const updated = {
      ...target,
      approvalStatus: 'Rejected',
      approvedBy: approverUsername || 'ADMIN',
      approvedAt: new Date().toISOString(),
      rejectionReason: reason || 'Specifications require revision'
    };
    return await planningStorage.savePlanningSheet(updated);
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

export default planningStorage;
