/**
 * Pure calculation functions for LMNP simulation
 * CRITICAL: These functions perform all tax calculations - NO AI HALLUCINATIONS
 */

import type {
  CompleteSimulationData,
  RegimeComparison,
  SimulationResult,
} from '@lmnp/shared';

/**
 * Constants for LMNP calculations
 */
export const LMNP_CONSTANTS = {
  /** Micro-BIC flat deduction rate (50%) */
  MICRO_BIC_DEDUCTION_RATE: 0.5,

  /** Micro-BIC revenue threshold (€77,700/year) */
  MICRO_BIC_THRESHOLD: 77_700,

  /** LMNP status threshold (€23,000/year) */
  LMNP_THRESHOLD: 23_000,

  /** Simplified depreciation rate (3% of purchase price per year) */
  DEPRECIATION_RATE: 0.03,
} as const;

/**
 * Calculate annual loan interest for the first year
 * Using simple interest calculation (can be refined with amortization table)
 */
export function calculateLoanInterest(
  loanAmount: number,
  interestRate: number,
  loanDuration: number
): number {
  if (loanAmount === 0 || !interestRate || !loanDuration) {
    return 0;
  }

  // First year interest (simplified - real calculation would use amortization schedule)
  const annualInterest = (loanAmount * interestRate) / 100;

  return Math.round(annualInterest * 100) / 100;
}

/**
 * Calculate monthly loan payment (principal + interest)
 */
export function calculateMonthlyPayment(
  loanAmount: number,
  interestRate: number,
  loanDuration: number
): number {
  if (loanAmount === 0 || !interestRate || !loanDuration) {
    return 0;
  }

  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = loanDuration * 12;

  const monthlyPayment =
    (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

  return Math.round(monthlyPayment * 100) / 100;
}

/**
 * Calculate Micro-BIC regime simulation
 * Returns null if required data is incomplete
 */
export function calculateMicroBic(
  data: CompleteSimulationData
): SimulationResult | null {
  // TypeScript now knows data is CompleteSimulationData (no more null values)
  const annualRent = data.monthlyRent * 12;

  // Micro-BIC: 50% flat deduction
  const deductions = annualRent * LMNP_CONSTANTS.MICRO_BIC_DEDUCTION_RATE;
  const taxableIncome = annualRent - deductions;

  // Calculate tax
  const tax = (taxableIncome * data.taxRate) / 100;

  // Net income after tax and actual expenses
  const netIncome = annualRent - tax - data.annualExpenses;

  // Cash flow (after loan payments if any)
  let cashFlow = netIncome;
  if (data.loanAmount && data.interestRate && data.loanDuration) {
    const monthlyPayment = calculateMonthlyPayment(
      data.loanAmount,
      data.interestRate,
      data.loanDuration
    );
    cashFlow -= monthlyPayment * 12;
  }

  // Net return on investment
  const investment = data.purchasePrice - (data.loanAmount ?? 0);
  const netReturn = investment > 0 ? (netIncome / investment) * 100 : 0;

  return {
    regime: 'Micro-BIC',
    grossIncome: Math.round(annualRent * 100) / 100,
    deductions: Math.round(deductions * 100) / 100,
    taxableIncome: Math.round(taxableIncome * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    netIncome: Math.round(netIncome * 100) / 100,
    cashFlow: Math.round(cashFlow * 100) / 100,
    netReturn: Math.round(netReturn * 100) / 100,
  };
}

/**
 * Calculate Real Regime (Régime Réel) simulation
 * Returns null if required data is incomplete
 */
export function calculateRealRegime(
  data: CompleteSimulationData
): SimulationResult | null {
  // TypeScript now knows data is CompleteSimulationData (no more null values)
  const annualRent = data.monthlyRent * 12;

  // Calculate depreciation (simplified: 3% of purchase price per year)
  const depreciation = data.purchasePrice * LMNP_CONSTANTS.DEPRECIATION_RATE;

  // Calculate loan interest
  const loanInterest = data.loanAmount
    ? calculateLoanInterest(
        data.loanAmount,
        data.interestRate ?? 0,
        data.loanDuration ?? 0
      )
    : 0;

  // Real regime: deduct actual expenses only (depreciation shown separately)
  const deductions = data.annualExpenses;

  // Total fiscal deductions including depreciation and loan interest
  const totalDeductions = deductions + depreciation + loanInterest;

  // Taxable income (can be negative = deficit)
  const taxableIncome = Math.max(0, annualRent - totalDeductions);

  // Calculate tax
  const tax = (taxableIncome * data.taxRate) / 100;

  // Net income after tax and actual expenses
  const netIncome = annualRent - tax - data.annualExpenses;

  // Cash flow (after loan payments if any)
  let cashFlow = netIncome;
  if (data.loanAmount && data.interestRate && data.loanDuration) {
    const monthlyPayment = calculateMonthlyPayment(
      data.loanAmount,
      data.interestRate,
      data.loanDuration
    );
    cashFlow -= monthlyPayment * 12;
  }

  // Net return on investment
  const investment = data.purchasePrice - (data.loanAmount ?? 0);
  const netReturn = investment > 0 ? (netIncome / investment) * 100 : 0;

  return {
    regime: 'Real Regime',
    grossIncome: Math.round(annualRent * 100) / 100,
    deductions: Math.round(deductions * 100) / 100,
    depreciation: Math.round(depreciation * 100) / 100,
    loanInterest: Math.round(loanInterest * 100) / 100,
    taxableIncome: Math.round(taxableIncome * 100) / 100,
    tax: Math.round(tax * 100) / 100,
    netIncome: Math.round(netIncome * 100) / 100,
    cashFlow: Math.round(cashFlow * 100) / 100,
    netReturn: Math.round(netReturn * 100) / 100,
  };
}

/**
 * Compare both regimes and return comprehensive results
 * Returns null if required data is incomplete
 */
export function compareRegimes(
  data: CompleteSimulationData
): RegimeComparison | null {
  const microBic = calculateMicroBic(data);
  const realRegime = calculateRealRegime(data);

  if (!microBic || !realRegime) return null;

  // Calculate savings
  const annualSavings = microBic.tax - realRegime.tax;
  const totalSavings = annualSavings * data.holdingPeriod;

  // Determine recommended regime
  let recommendedRegime: 'Micro-BIC' | 'Real Regime';
  let recommendation: string;

  if (realRegime.netIncome > microBic.netIncome) {
    recommendedRegime = 'Real Regime';
    const savingsPercent = ((annualSavings / microBic.tax) * 100).toFixed(1);
    recommendation = `Real Regime saves €${Math.round(
      annualSavings
    )}/year (${savingsPercent}% tax reduction). Total savings over ${
      data.holdingPeriod
    } years: €${Math.round(totalSavings)}.`;
  } else if (microBic.netIncome > realRegime.netIncome) {
    recommendedRegime = 'Micro-BIC';
    recommendation = `Micro-BIC is more advantageous due to low expenses and simplicity. No accounting required.`;
  } else {
    recommendedRegime = 'Micro-BIC';
    recommendation = `Both regimes yield similar results. Micro-BIC recommended for simplicity (no accounting required).`;
  }

  return {
    microBic,
    realRegime,
    annualSavings: Math.round(annualSavings * 100) / 100,
    totalSavings: Math.round(totalSavings * 100) / 100,
    recommendedRegime,
    recommendation,
  };
}

/**
 * Validate if annual rent exceeds Micro-BIC threshold
 */
export function exceedsMicroBicThreshold(monthlyRent: number): boolean {
  const annualRent = monthlyRent * 12;
  return annualRent > LMNP_CONSTANTS.MICRO_BIC_THRESHOLD;
}

/**
 * Validate if annual rent exceeds LMNP threshold (switches to LMP)
 */
export function exceedsLmnpThreshold(monthlyRent: number): boolean {
  const annualRent = monthlyRent * 12;
  return annualRent > LMNP_CONSTANTS.LMNP_THRESHOLD;
}
