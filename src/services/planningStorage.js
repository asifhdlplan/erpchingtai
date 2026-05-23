export const PLANNING_STORAGE_KEY = 'erp_planning_sheets';

export const planningStorage = {
  savePlanningSheet: (sheet) => {
    const sheets = planningStorage.getAllSheets();
    const newSheet = { 
      ...sheet, 
      id: sheet.id || Date.now().toString(),
      timestamp: new Date().toISOString() 
    };
    sheets.push(newSheet);
    localStorage.setItem(PLANNING_STORAGE_KEY, JSON.stringify(sheets));
    return newSheet;
  },

  getAllSheets: () => {
    const data = localStorage.getItem(PLANNING_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  getNextSetNo: () => {
    const sheets = planningStorage.getAllSheets();
    if (sheets.length === 0) return 10001;
    const maxSetNo = Math.max(...sheets.map(s => parseInt(s.setNo) || 0));
    return maxSetNo + 1;
  }
};
