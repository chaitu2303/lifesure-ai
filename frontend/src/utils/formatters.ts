/**
 * LifeSure AI Currency & Numeric Formatting Utilities
 * Formatted specifically for Indian Financial Standards (INR, Lakhs, Crores)
 */

export function formatINR(val: number | null | undefined, compact: boolean = false): string {
  if (val === null || val === undefined || isNaN(val)) return '₹ 0';

  const absVal = Math.abs(val);

  if (compact) {
    if (absVal >= 10000000) {
      const cr = val / 10000000;
      return `₹ ${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(1)} Cr`;
    }
    if (absVal >= 100000) {
      const lk = val / 100000;
      return `₹ ${lk % 1 === 0 ? lk.toFixed(0) : lk.toFixed(1)} L`;
    }
    if (absVal >= 1000) {
      const k = val / 1000;
      return `₹ ${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
    }
  }

  return `₹ ${Math.round(val).toLocaleString('en-IN')}`;
}

export function formatCrores(val: number): string {
  const cr = val / 10000000;
  return `${cr % 1 === 0 ? cr.toFixed(0) : cr.toFixed(1)} Cr`;
}

export function formatLakhs(val: number): string {
  const lk = val / 100000;
  return `${lk % 1 === 0 ? lk.toFixed(0) : lk.toFixed(1)} Lakhs`;
}

export function formatPercent(val: number, decimals: number = 0): string {
  return `${val.toFixed(decimals)}%`;
}
