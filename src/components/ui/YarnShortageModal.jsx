import React from 'react';

export const YarnShortageModal = ({ isOpen, shortages, onClose }) => {
  if (!isOpen || !shortages || shortages.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#151D30] border border-rose-200 dark:border-rose-950/30 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Warning Header */}
        <div className="p-4 border-b border-rose-100 dark:border-rose-955/20 flex justify-between items-center bg-rose-50/50 dark:bg-rose-955/10">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-450 font-bold">
            <span className="text-lg animate-bounce">⚠️</span>
            <span className="text-sm uppercase tracking-wide">Yarn Shortage Warning</span>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-bold w-6 h-6 rounded-full hover:bg-rose-100/30 dark:hover:bg-rose-955/20 flex items-center justify-center transition"
          >
            ✕
          </button>
        </div>

        {/* Content Block */}
        <div className="p-5 space-y-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
            The following yarn items do not have enough warehouse stock to fulfill this plan. Please procure additional stock or adjust the warping/weaving parameters.
          </div>

          {/* Shortage Cards list */}
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {shortages.map((item, idx) => (
              <div 
                key={idx} 
                className="p-3 border border-rose-100 dark:border-rose-950/30 bg-rose-50/20 dark:bg-rose-955/5 rounded-xl space-y-2"
              >
                <div className="font-bold text-slate-800 dark:text-slate-200 text-[11px] flex justify-between gap-2">
                  <span className="truncate">{item.materialDescription}</span>
                  <span className="shrink-0 text-slate-400 dark:text-slate-500 font-normal">Lot: {item.supplierLot || 'N/A'}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                  <div className="p-1.5 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800">
                    <span className="block text-slate-400 dark:text-slate-500 text-[9px] uppercase font-semibold">Required</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{parseFloat(item.needed || 0).toFixed(2)} KG</span>
                  </div>
                  <div className="p-1.5 bg-slate-50 dark:bg-slate-900 rounded border border-slate-100 dark:border-slate-800">
                    <span className="block text-slate-400 dark:text-slate-500 text-[9px] uppercase font-semibold">Available</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{parseFloat(item.available || 0).toFixed(2)} KG</span>
                  </div>
                  <div className="p-1.5 bg-rose-50 dark:bg-rose-955/20 rounded border border-rose-100 dark:border-rose-900/30">
                    <span className="block text-rose-500 dark:text-rose-450 text-[9px] uppercase font-semibold">Shortage</span>
                    <span className="font-bold text-rose-600 dark:text-rose-455">-{parseFloat(item.shortage || 0).toFixed(2)} KG</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Action buttons */}
          <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white shadow-sm transition"
            >
              Acknowledge & Adjust
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
