import React from 'react';

export const PlanningSheetPreview = ({ data }) => {
  if (!data) return null;

  return (
    <div className="print-only bg-white text-black p-8 w-[210mm] min-h-[297mm] mx-auto border shadow-lg" id="printable-sheet">
      <div className="text-center border-b-2 border-black pb-4 mb-6">
        <h1 className="text-2xl font-black uppercase">Ha-Meem Ching Tai Pocketing & Accessories Ltd.</h1>
        <p className="text-xs font-semibold uppercase mt-1">Polash, Narshingdi</p>
        <h2 className="text-xl font-bold uppercase mt-2">Planning Sheet</h2>
      </div>

      <div className="grid grid-cols-4 gap-y-2 gap-x-4 text-xs border border-black p-4 mb-6">
        <div className="font-bold">Set No: <span className="font-normal">{data.setNo}</span></div>
        <div className="font-bold text-right">Date: <span className="font-normal">{data.date}</span></div>
        <div className="col-span-2"></div>
        
        <div className="font-bold">Buyer: <span className="font-normal">{data.buyer}</span></div>
        <div className="font-bold">Style/Code: <span className="font-normal">{data.styleCode}</span></div>
        <div className="font-bold">End Buyer: <span className="font-normal">{data.endBuyer}</span></div>
        <div className="font-bold">MKT Person: <span className="font-normal">{data.mktPerson}</span></div>
        
        <div className="font-bold">Order Ref: <span className="font-normal">{data.orderRef}</span></div>
        <div className="font-bold">PI Width: <span className="font-normal">{data.piWidth}</span></div>
        <div className="font-bold">PI Shrink: <span className="font-normal">{data.piShrink}</span></div>
        <div className="font-bold">Weave: <span className="font-normal">{data.weave}</span></div>
        
        <div className="font-bold">Colour: <span className="font-normal">{data.colour}</span></div>
        <div className="font-bold">Order Qnty: <span className="font-normal">{data.orderQnty}</span></div>
        <div className="font-bold">Req Prod(m): <span className="font-normal">{data.reqProd}</span></div>
        <div className="font-bold">Set Length: <span className="font-normal">{data.setLength}</span></div>
        
        <div className="font-bold">P. Dyeing: <span className="font-normal">{data.pDyeing}</span></div>
        <div className="font-bold">Remain: <span className="font-normal">{data.remain1}</span></div>
        <div className="font-bold">Today Taken: <span className="font-normal">{data.todayTaken}</span></div>
        <div className="font-bold">Remain: <span className="font-normal">{data.remain2}</span></div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-bold uppercase border-b border-black mb-2">01. Warping Information</h3>
        <table className="w-full text-[10px] border-collapse border border-black">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black p-1">Set Length</th>
              <th className="border border-black p-1">Per Set</th>
              <th className="border border-black p-1">Ratio</th>
              <th className="border border-black p-1">Yarn Name</th>
              <th className="border border-black p-1">Supp.</th>
              <th className="border border-black p-1">Yarn Lot</th>
              <th className="border border-black p-1">Beam</th>
              <th className="border border-black p-1">Ends/Beam</th>
              <th className="border border-black p-1">Total Ends</th>
              <th className="border border-black p-1">Qty-Kg</th>
            </tr>
          </thead>
          <tbody>
            {data.warpingRows.map((row, i) => (
              <tr key={i}>
                <td className="border border-black p-1 text-center">{row.setLength}</td>
                <td className="border border-black p-1 text-center">{row.perSet}</td>
                <td className="border border-black p-1 text-center">{row.ratio}</td>
                <td className="border border-black p-1 text-center">{row.yarnName}</td>
                <td className="border border-black p-1 text-center">{row.supp}</td>
                <td className="border border-black p-1 text-center">{row.yarnLot}</td>
                <td className="border border-black p-1 text-center">{row.beam}</td>
                <td className="border border-black p-1 text-center">{row.endsBeam}</td>
                <td className="border border-black p-1 text-center">{row.totalEnds}</td>
                <td className="border border-black p-1 text-center">{row.qtyKg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-bold uppercase border-b border-black mb-2">02. Sizing Information</h3>
        <table className="w-full text-xs border-collapse border border-black">
          <tbody>
            <tr>
              <td className="border border-black p-2 font-bold w-1/4">Beam Space (inch)</td>
              <td className="border border-black p-2">{data.sizing.beamSpace}</td>
              <td className="border border-black p-2 font-bold w-1/4">Beam Type</td>
              <td className="border border-black p-2">{data.sizing.beamType}</td>
              <td className="border border-black p-2 font-bold w-1/4">No of Beam</td>
              <td className="border border-black p-2">{data.sizing.noOfBeam}</td>
            </tr>
            <tr>
              <td className="border border-black p-2 font-bold" colSpan="3">Beam Length (m)</td>
              <td className="border border-black p-2" colSpan="3">{data.sizing.beamLength}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-bold uppercase border-b border-black mb-2">03. Weaving Information</h3>
        <table className="w-full text-[10px] border-collapse border border-black">
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
            {data.weavingRows.map((row, i) => (
              <tr key={i}>
                <td className="border border-black p-1 text-center">{row.greyConstruction}</td>
                <td className="border border-black p-1 text-center">{row.weave}</td>
                <td className="border border-black p-1 text-center">{row.weftRatio}</td>
                <td className="border border-black p-1 text-center">{row.reedSpace}</td>
                <td className="border border-black p-1 text-center">{row.reed}</td>
                <td className="border border-black p-1 text-center">{row.endsDent}</td>
                <td className="border border-black p-1 text-center">{row.gWidth}</td>
                <td className="border border-black p-1 text-center">{row.weight}</td>
                <td className="border border-black p-1 text-center">{row.selvedge}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <table className="w-full text-[10px] border-collapse border border-black mt-2">
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
          </tbody>
        </table>
      </div>

      <div className="mb-12">
        <div className="font-bold text-sm uppercase border-b border-black mb-1">Remarks:</div>
        <div className="text-xs p-2 border border-black min-h-[40px]">{data.remarks}</div>
      </div>

      <div className="grid grid-cols-6 gap-4 text-center text-[10px] mt-40 pt-20">
        <div className="border-t border-black pt-2 font-bold">Prepared By</div>
        <div className="border-t border-black pt-2 font-bold">Checked By</div>
        <div className="border-t border-black pt-2 font-bold">AGM Weaving</div>
        <div className="border-t border-black pt-2 font-bold">AGM Dyeing</div>
        <div className="border-t border-black pt-2 font-bold">QA Head</div>
        <div className="border-t border-black pt-2 font-bold">GM Plant</div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * { visibility: hidden; }
          #printable-sheet, #printable-sheet * { visibility: visible; }
          #printable-sheet { position: absolute; left: 0; top: 0; width: 210mm; height: 297mm; }
        }
      `}} />
    </div>
  );
};
