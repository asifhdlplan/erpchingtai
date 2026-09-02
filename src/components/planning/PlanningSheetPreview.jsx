export const formatApproverName = (name) => {
  if (!name) return 'ADMIN';
  const clean = String(name).trim();
  if (clean.toLowerCase() === 'kalam') {
    return 'Sr. GM - Plant';
  }
  return clean;
};

export const PlanningSheetPreview = ({ data }) => {
  if (!data) return null;

  const approverDisplay = formatApproverName(data.approvedBy);

  // Calculate totals
  const warpingTotalEnds = (data.warpingRows || []).reduce((sum, row) => sum + (parseFloat(row.totalEnds) || 0), 0);
  const warpingTotalQtyKg = (data.warpingRows || []).reduce((sum, row) => sum + (parseFloat(row.qtyKg) || 0), 0);
  const weavingTotalQtyKg = (data.weavingRows || []).reduce((sum, row) => sum + (parseFloat(row.qtyKg) || 0), 0);

  return (
    <div className="bg-white text-black p-5 w-[210mm] min-h-[297mm] mx-auto border shadow-lg relative overflow-hidden" id="printable-sheet">
      {/* Background Watermark Shade */}
      <div 
        className="watermark-shade pointer-events-none absolute inset-0 flex flex-col items-center justify-around select-none overflow-hidden"
        style={{ zIndex: 0, opacity: 0.045 }}
      >
        <div 
          className="watermark-text font-black uppercase whitespace-nowrap"
          style={{
            fontSize: '50px',
            letterSpacing: '0.22em',
            transform: 'rotate(-35deg)',
            userSelect: 'none'
          }}
        >
          HA-MEEM CHING TAI
        </div>
        <div 
          className="watermark-text font-black uppercase whitespace-nowrap"
          style={{
            fontSize: '50px',
            letterSpacing: '0.22em',
            transform: 'rotate(-35deg)',
            userSelect: 'none'
          }}
        >
          HA-MEEM CHING TAI
        </div>
        <div 
          className="watermark-text font-black uppercase whitespace-nowrap"
          style={{
            fontSize: '50px',
            letterSpacing: '0.22em',
            transform: 'rotate(-35deg)',
            userSelect: 'none'
          }}
        >
          HA-MEEM CHING TAI
        </div>
      </div>

      <div className="text-center border-b-2 border-black pb-3 mb-4 relative z-10">
        <h1 className="text-2xl font-black uppercase">Ha-Meem Ching Tai Pocketing & Accessories Ltd.</h1>
        <p className="text-xs font-semibold uppercase mt-1">Polash, Narshingdi</p>
        <h2 className="text-xl font-bold uppercase mt-1.5">Planning Sheet</h2>
      </div>

      {data.approvalStatus === 'Pending' && (
        <div 
          className="status-restricted-banner mb-3 p-2 bg-red-50 border-2 border-red-600 text-red-600 text-center font-black text-xs uppercase tracking-wider relative z-10"
          style={{ color: '#dc2626', borderColor: '#dc2626', fontWeight: '900' }}
        >
          STATUS - PENDING AUTHORIZATION - USING THIS PLANNING SHEET IS RESTRICTED
        </div>
      )}

      <div className="grid grid-cols-4 gap-y-2 gap-x-4 text-sm border border-black p-3.5 mb-4">
        <div className="font-bold whitespace-nowrap">Set No: <span className="font-bold text-base underline ml-1">{data.setNo}</span></div>
        <div className="font-bold">User: <span className="font-normal">{data.sizing?.createdBy || data.submittedBy || 'ASIF'}</span></div>
        <div className="font-bold">Buyer: <span className="font-normal">{data.buyer}</span></div>
        <div className="font-bold text-right">Date: <span className="font-normal">{data.date}</span></div>
        
        <div className="font-bold whitespace-nowrap col-span-2">Style/Code: <span className="font-bold text-base underline ml-1">{data.styleCode}</span></div>
        <div className="font-bold">Approval: <span className={`ml-1 font-mono text-xs ${data.approvalStatus === 'Approved' ? 'text-emerald-800 font-bold' : 'text-amber-700 font-bold'}`}>{data.approvalStatus === 'Approved' ? `Approved (${approverDisplay})` : 'Pending'}</span></div>
        <div className="font-bold">MKT Person: <span className="font-normal">{data.mktPerson}</span></div>
        
        <div className="font-bold whitespace-nowrap">Set Length: <span className="font-bold text-base underline ml-1">{data.setLength}</span></div>
        <div className="font-bold">Order Ref: <span className="font-normal">{data.orderRef}</span></div>
        <div className="font-bold">PI Rcv Date: <span className="font-normal">{data.piRecDate || '-'}</span></div>
        <div className="font-bold">PI Width: <span className="font-normal">{data.piWidth}</span></div>
        
        <div className="font-bold">PI Shrink: <span className="font-normal">{data.piShrink}</span></div>
        <div className="font-bold">Weave: <span className="font-normal">{data.weave}</span></div>
        <div className="font-bold">Colour: <span className="font-normal">{data.colour}</span></div>
        <div className="font-bold">Order Qnty: <span className="font-normal">{data.orderQnty}</span></div>
        
        <div className="font-bold">Req Prod(m): <span className="font-normal">{data.reqProd}</span></div>
        <div className="font-bold">P. Dyeing: <span className="font-normal">{data.pDyeing}</span></div>
        <div className="font-bold">Remain: <span className="font-normal">{data.remain1}</span></div>
        <div className="font-bold">Today Taken: <span className="font-normal">{data.todayTaken}</span></div>
        
        <div className="font-bold col-span-4">Remain: <span className="font-normal">{data.remain2}</span></div>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-bold uppercase border-b border-black mb-1.5">01. Warping Information</h3>
        <table className="w-full text-xs border-collapse border border-black">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-1">Yarn Name</th>
              <th className="border border-black p-1">Supp.</th>
              <th className="border border-black p-1">Yarn Lot</th>
              <th className="border border-black p-1">Ratio</th>
              <th className="border border-black p-1">Beam</th>
              <th className="border border-black p-1">Ends/Beam</th>
              <th className="border border-black p-1">Total Ends</th>
              <th className="border border-black p-1">Qty-Kg</th>
            </tr>
          </thead>
          <tbody>
            {data.warpingRows.map((row, i) => (
              <tr key={i}>
                <td className="border border-black p-1 text-center">{row.yarnName}</td>
                <td className="border border-black p-1 text-center">{row.supp}</td>
                <td className="border border-black p-1 text-center">{row.yarnLot}</td>
                <td className="border border-black p-1 text-center">{row.ratio}</td>
                <td className="border border-black p-1 text-center">{row.beam}</td>
                <td className="border border-black p-1 text-center">{row.endsBeam}</td>
                <td className="border border-black p-1 text-center">{row.totalEnds}</td>
                <td className="border border-black p-1 text-center">{row.qtyKg}</td>
              </tr>
            ))}
            {/* Warping Totals Row */}
            <tr className="font-bold bg-gray-50/60">
              <td colSpan="6" className="border border-black p-1.5 text-right uppercase">Total:</td>
              <td className="border border-black p-1.5 text-center font-mono">{warpingTotalEnds.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</td>
              <td className="border border-black p-1.5 text-center font-mono">{warpingTotalQtyKg.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-bold uppercase border-b border-black mb-1.5">02. Sizing Information</h3>
        <table className="w-full text-sm border-collapse border border-black">
          <tbody>
            <tr>
              <td className="border border-black p-1.5 font-bold w-1/4">Beam Space (inch)</td>
              <td className="border border-black p-1.5">{data.sizing.beamSpace}</td>
              <td className="border border-black p-1.5 font-bold w-1/4">Beam Type</td>
              <td className="border border-black p-1.5">{data.sizing.beamType}</td>
              <td className="border border-black p-1.5 font-bold w-1/4">No of Beam</td>
              <td className="border border-black p-1.5">{data.sizing.noOfBeam}</td>
            </tr>
            <tr>
              <td className="border border-black p-1.5 font-bold" colSpan="3">Beam Length (m)</td>
              <td className="border border-black p-1.5" colSpan="3">{data.sizing.beamLength}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-bold uppercase border-b border-black mb-1.5">03. Weaving Information</h3>
        <table className="w-full text-xs border-collapse border border-black">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-1">Grey Construction</th>
              <th className="border border-black p-1">Weave</th>
              <th className="border border-black p-1">Weft Ratio</th>
              <th className="border border-black p-1">Reed Space</th>
              <th className="border border-black p-1">Reed</th>
              <th className="border border-black p-1">Ends/Dent</th>
              <th className="border border-black p-1">G.Width</th>
              <th className="border border-black p-1">Weight</th>
              <th className="border border-black p-1">Selvedge</th>
            </tr>
          </thead>
          <tbody>
            {data.weavingRows?.[0] ? (
              <tr>
                <td className="border border-black p-1 text-center font-bold">{data.weavingRows[0].greyConstruction}</td>
                <td className="border border-black p-1 text-center">{data.weavingRows[0].weave}</td>
                <td className="border border-black p-1 text-center">{data.weavingRows[0].weftRatio}</td>
                <td className="border border-black p-1 text-center">{data.weavingRows[0].reedSpace}</td>
                <td className="border border-black p-1 text-center">{data.weavingRows[0].reed}</td>
                <td className="border border-black p-1 text-center">{data.weavingRows[0].endsDent}</td>
                <td className="border border-black p-1 text-center">{data.weavingRows[0].gWidth}</td>
                <td className="border border-black p-1 text-center">{data.weavingRows[0].weight}</td>
                <td className="border border-black p-1 text-center">{data.weavingRows[0].selvedge}</td>
              </tr>
            ) : (
              <tr>
                <td colSpan="9" className="border border-black p-1 text-center text-gray-400 italic">No parameters entered</td>
              </tr>
            )}
          </tbody>
        </table>
        <table className="w-full text-xs border-collapse border border-black mt-1.5">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-1">Yarn Name</th>
              <th className="border border-black p-1">Supplier</th>
              <th className="border border-black p-1">Supp-Lot</th>
              <th className="border border-black p-1">Ratio</th>
              <th className="border border-black p-1">Qty-Kg</th>
              <th className="border border-black p-1">Pick Length</th>
              <th className="border border-black p-1">PPI</th>
            </tr>
          </thead>
          <tbody>
            {data.weavingRows.map((row, i) => (
              <tr key={`weaving-yarn-${i}`}>
                <td className="border border-black p-1 text-center">{row.yarnName}</td>
                <td className="border border-black p-1 text-center">{row.supplier}</td>
                <td className="border border-black p-1 text-center">{row.suppLot}</td>
                <td className="border border-black p-1 text-center">{row.ratio}</td>
                <td className="border border-black p-1 text-center">{row.qtyKg}</td>
                <td className="border border-black p-1 text-center">{row.pickLength}</td>
                <td className="border border-black p-1 text-center">{row.ppi}</td>
              </tr>
            ))}
            {/* Weaving Totals Row */}
            <tr className="font-bold bg-gray-50/60">
              <td colSpan="4" className="border border-black p-1.5 text-right uppercase">Total:</td>
              <td className="border border-black p-1.5 text-center font-mono">{weavingTotalQtyKg.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</td>
              <td colSpan="2" className="border border-black p-1.5"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mb-4">
        <h3 className="text-sm font-bold uppercase border-b border-black mb-1.5">04. Finishing Information</h3>
        <table className="w-full text-sm border-collapse border border-black">
          <tbody>
            <tr>
              <td className="border border-black p-1.5 font-bold w-1/4">Finish Construction</td>
              <td className="border border-black p-1.5 font-bold">{data.weavingRows?.[0]?.finishConstruction || ''}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mb-4">
        <div className="font-bold text-sm uppercase border-b border-black mb-1">Remarks:</div>
        <div className="text-sm p-1.5 border border-black min-h-[35px]">{data.remarks}</div>
      </div>

      <div className="grid grid-cols-5 gap-2 text-center text-xs mt-20 pt-4">
        <div className="border-t border-black pt-1.5 font-bold">
          <div>Prepared By</div>
          <div className="text-[9px] font-mono text-slate-500 font-normal mt-0.5">{data.sizing?.createdBy || data.submittedBy || 'ASIF'}</div>
        </div>
        <div className="border-t border-black pt-1.5 font-bold">PPC</div>
        <div className="border-t border-black pt-1.5 font-bold">AGM Weaving</div>
        <div className="border-t border-black pt-1.5 font-bold">AGM Dyeing</div>
        <div className="border-t border-black pt-1.5 font-bold">
          <div>Sr. GM Plant</div>
          {data.approvalStatus === 'Approved' ? (
            <div className="status-approved-seal text-[9px] font-mono text-emerald-800 font-bold uppercase mt-0.5">
              ✓ Appv: {approverDisplay}
            </div>
          ) : (
            <div 
              className="status-pending-signature text-[9px] font-mono font-bold uppercase mt-0.5 text-red-600"
              style={{ color: '#dc2626', fontWeight: 'bold' }}
            >
              Approval Pending
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .status-restricted-banner {
          color: #dc2626 !important;
          border-color: #dc2626 !important;
          background-color: #fef2f2 !important;
          font-weight: 900 !important;
        }
        .status-pending-signature {
          color: #dc2626 !important;
          font-weight: bold !important;
        }
        .watermark-shade {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          opacity: 0.045 !important;
        }
        .watermark-text {
          color: #000000 !important;
          opacity: 0.045 !important;
          font-weight: 900 !important;
        }
        @media print {
          body * { visibility: hidden; }
          #printable-sheet, #printable-sheet * { visibility: visible; }
          #printable-sheet { position: absolute; left: 0; top: 0; width: 210mm; height: 297mm; }
          .watermark-shade, .watermark-text {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            opacity: 0.045 !important;
          }
          .status-restricted-banner { 
            color: #dc2626 !important; 
            border-color: #dc2626 !important; 
            background-color: #fef2f2 !important; 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
          }
          .status-pending-signature {
            color: #dc2626 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}} />
    </div>
  );
};

export default PlanningSheetPreview;
