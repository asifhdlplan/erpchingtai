import React from 'react';

export const YarnDemandPreview = ({ data }) => {
  if (!data) return null;

  // Calculate totals
  const totalQtyKg = (data.items || []).reduce((sum, item) => sum + (parseFloat(item.reqQtyKg) || 0), 0);
  const totalQtyTon = (data.items || []).reduce((sum, item) => sum + (parseFloat(item.demandQtyTon) || 0), 0);

  return (
    <div className="bg-white text-black p-6 w-[297mm] min-h-[210mm] mx-auto border shadow-lg font-sans text-xs" id="printable-sheet">
      {/* Header Section */}
      <table className="w-full border-collapse border border-slate-400 mb-4 text-[11px]">
        <tbody>
          <tr>
            {/* Logo and Address */}
            <td className="w-1/3 p-2 border-r border-b border-slate-400 valign-top align-left">
              <img src="/hameem_group_logo.png" alt="Ha-Meem Group Logo" className="h-10 object-contain mb-1.5" />
              <div className="text-[9px] text-slate-500">Head Office: Times Media Ltd.</div>
              <div className="text-[9px] text-slate-500">387, South Tejgaon I/A, Dhaka-1208</div>
            </td>
            
            {/* Title */}
            <td className="w-1/3 p-2 border-r border-b border-slate-400 text-center align-middle">
              <h1 className="text-sm font-bold tracking-wide text-slate-800">Special Yarn Demand Form</h1>
              <p className="text-[10px] text-slate-500 italic mt-0.5">Special Yarn against special order</p>
            </td>

            {/* PR NO and Date */}
            <td className="w-1/3 p-2 border-b border-slate-400 text-left valign-top">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-[10px] text-slate-600 uppercase">PR NO:</span>
                <span className="font-mono font-black text-sm text-red-650 bg-red-50 px-2 py-0.5 rounded border border-red-100">{data.prNo}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-[10px] text-slate-600 uppercase">Date:</span>
                <span className="font-mono text-slate-800">{data.date ? new Date(data.date).toLocaleDateString() : '-'}</span>
              </div>
            </td>
          </tr>
          <tr>
            <td colSpan="2" className="p-1.5 border-r border-slate-400 font-bold text-[10px] text-slate-750">
              Factory Unit: <span className="font-normal text-slate-650">HA-MEEM CHING TAI POCKETING & ACCESSORIES LTD.</span>
            </td>
            <td className="p-1.5 font-bold text-[10px] text-slate-750">
              Factory Address: <span className="font-normal text-slate-650">Polash, Narshingdi</span>
            </td>
          </tr>
        </tbody>
      </table>

      {/* Grid Table */}
      <table className="w-full border-collapse border border-slate-400 text-[10px] mb-6">
        <thead>
          <tr className="bg-slate-50 text-slate-700 text-center uppercase tracking-wider font-bold">
            <th className="border border-slate-400 py-1.5 px-1 w-10 text-center">SL No</th>
            <th className="border border-slate-400 py-1.5 px-2 text-left">Yarn Count</th>
            <th className="border border-slate-400 py-1.5 px-2 text-center w-24">Preferred Brand</th>
            <th className="border border-slate-400 py-1.5 px-2 text-right w-24">Req Qty (KG)</th>
            <th className="border border-slate-400 py-1.5 px-2 text-right w-24 bg-yellow-50/50">Demand Qty (ton)</th>
            <th className="border border-slate-400 py-1.5 px-2 text-center w-24">MKT. Concern</th>
            <th className="border border-slate-400 py-1.5 px-2 text-left">Reason for Demand (Style // Order Qty // Buyer Name)</th>
            <th className="border border-slate-400 py-1.5 px-2 text-center w-24">Required by (Start)</th>
            <th className="border border-slate-400 py-1.5 px-2 text-right w-20 bg-yellow-50/50">Costing Price $</th>
            <th className="border border-slate-400 py-1.5 px-2 text-center w-28">TC</th>
            <th className="border border-slate-400 py-1.5 px-2 text-left">Remarks</th>
          </tr>
        </thead>
        <tbody>
          {(data.items || []).map((item, idx) => (
            <tr key={idx} className="hover:bg-slate-50/40">
              <td className="border border-slate-400 py-1.5 px-1 text-center font-mono text-slate-500">{idx + 1}</td>
              <td className="border border-slate-400 py-1.5 px-2 font-bold text-slate-800">{item.yarnCount}</td>
              <td className="border border-slate-400 py-1.5 px-2 text-center">{item.preferredBrand}</td>
              <td className="border border-slate-400 py-1.5 px-2 text-right font-mono font-bold">
                {parseFloat(item.reqQtyKg || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </td>
              <td className="border border-slate-400 py-1.5 px-2 text-right font-mono font-bold bg-yellow-50/30">
                {parseFloat(item.demandQtyTon || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="border border-slate-400 py-1.5 px-2 text-center text-slate-650">{item.mktConcern}</td>
              <td className="border border-slate-400 py-1.5 px-2 text-slate-700 font-mono text-[9px] whitespace-pre-wrap">{item.reasonForDemand}</td>
              <td className="border border-slate-400 py-1.5 px-2 text-center font-mono text-slate-650">
                {item.reqByDate ? new Date(item.reqByDate).toLocaleDateString() : '-'}
              </td>
              <td className="border border-slate-400 py-1.5 px-2 text-right font-mono font-bold bg-yellow-50/30">
                $ {parseFloat(item.costingPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="border border-slate-400 py-1.5 px-2 text-center text-[9px] font-mono text-slate-600">{item.tc}</td>
              <td className="border border-slate-400 py-1.5 px-2 text-slate-500 italic">{item.remarks || '-'}</td>
            </tr>
          ))}
          {/* Totals Row */}
          <tr className="bg-slate-50/60 font-bold uppercase tracking-wider text-[10px]">
            <td colSpan="3" className="border border-slate-400 py-2 px-2 text-right">Total:</td>
            <td className="border border-slate-400 py-2 px-2 text-right font-mono text-slate-800">
              {totalQtyKg.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </td>
            <td className="border border-slate-400 py-2 px-2 text-right font-mono text-slate-800 bg-yellow-50/50">
              {totalQtyTon.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
            <td colSpan="6" className="border border-slate-400 py-2 px-2"></td>
          </tr>
        </tbody>
      </table>

      {/* Signature Section */}
      <div className="grid grid-cols-4 gap-8 text-center text-[10px] mt-16 pt-10 select-none">
        <div>
          <div className="border-b border-slate-400 h-10 w-2/3 mx-auto"></div>
          <div className="pt-1.5 font-bold text-slate-500">Prepared By (Concern)</div>
        </div>
        <div>
          <div className="border-b border-slate-400 h-10 w-2/3 mx-auto"></div>
          <div className="pt-1.5 font-bold text-slate-500">Checked By</div>
        </div>
        <div>
          <div className="border-b border-slate-400 h-10 w-2/3 mx-auto"></div>
          <div className="pt-1.5 font-bold text-slate-500">GM PLANT</div>
        </div>
        <div>
          <div className="border-b border-slate-400 h-10 w-2/3 mx-auto"></div>
          <div className="pt-1.5 font-bold text-slate-500">CEO - HTZ</div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          #printable-sheet, #printable-sheet * { visibility: visible; }
          #printable-sheet { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 297mm; 
            height: 210mm; 
            padding: 15mm !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          @page {
            size: A4 landscape;
            margin: 0;
          }
        }
      `}} />
    </div>
  );
};
