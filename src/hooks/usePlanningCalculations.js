import { useState, useEffect } from 'react';

export const usePlanningCalculations = () => {
  const calculateWarpingQty = (setLength, totalEnds) => {
    if (!setLength || !totalEnds) return 0;
    // Formula: (Set Length * Total Ends) / 768 / 2.20461 / 45 / 0.95
    return (setLength * totalEnds) / 768 / 2.20461 / 45 / 0.95;
  };

  const calculateWeavingQty = (setLength, pickLength, ppi) => {
    if (!setLength || !pickLength || !ppi) return 0;
    // Formula: (Set Length * 1.09361 * Pick Length * PPI * 0.9) / 840 / 2.20461 / 45
    return (setLength * 1.09361 * pickLength * ppi * 0.9) / 840 / 2.20461 / 45;
  };

  return { calculateWarpingQty, calculateWeavingQty };
};
