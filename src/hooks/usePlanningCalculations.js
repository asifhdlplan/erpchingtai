import { useState, useEffect } from 'react';

export const usePlanningCalculations = () => {
  const parseRatioFactor = (ratioStr) => {
    if (ratioStr === undefined || ratioStr === null || ratioStr === '') return 1.0;
    const str = String(ratioStr).trim();
    if (str.includes('/')) {
      const parts = str.split('/');
      const num = parseFloat(parts[0]);
      const den = parseFloat(parts[1]);
      if (!isNaN(num) && !isNaN(den) && den > 0) {
        return num / den;
      }
    }
    const cleaned = str.replace('%', '').trim();
    const num = parseFloat(cleaned);
    if (isNaN(num) || num <= 0) return 1.0;
    if (num <= 1) return num;
    return num / 100;
  };

  const extractYarnCountNe = (yarnName) => {
    if (!yarnName) return 16;
    const match = String(yarnName).match(/^\d+/);
    if (match) {
      return parseFloat(match[0]) || 16;
    }
    const anyMatch = String(yarnName).match(/\d+/);
    if (anyMatch) {
      return parseFloat(anyMatch[0]) || 16;
    }
    return 16;
  };

  const calculateWarpingQty = (setLength, totalEnds, ratio = 100, yarnName = '') => {
    if (!setLength || !totalEnds) return 0;
    const ratioFactor = parseRatioFactor(ratio);
    const countNe = extractYarnCountNe(yarnName);
    // Formula: (Set Length * Total Ends * Ratio * 1.025) / (840 * 0.9144 * Warp Count (Ne) * 2.2046)
    return (setLength * totalEnds * ratioFactor * 1.025) / (840 * 0.9144 * countNe * 2.2046);
  };

  const calculateWeavingQty = (setLength, pickLength, ppi, ratio = 100, yarnName = '') => {
    if (!setLength || !pickLength || !ppi) return 0;
    const ratioFactor = parseRatioFactor(ratio);
    const countNe = extractYarnCountNe(yarnName);
    // Formula: (Set Length * 0.9 * Ratio * Pick Length * PPI * 1.05) / (840 * 0.9144 * Weft Count (Ne) * 2.2046)
    return (setLength * 0.9 * ratioFactor * pickLength * ppi * 1.05) / (840 * 0.9144 * countNe * 2.2046);
  };

  return { calculateWarpingQty, calculateWeavingQty };
};
