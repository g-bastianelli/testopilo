/**
 * Shared types for the LMNP simulator
 */

/**
 * Data required for LMNP simulation
 * Required fields can be null when not yet provided by user
 */
export interface SimulationData {
  /** Purchase price of the property (€) */
  purchasePrice: number | null;

  /** Monthly rent (€/month) */
  monthlyRent: number | null;

  /** Annual deductible expenses (€/year) - property tax, insurance, etc. */
  annualExpenses: number | null;

  /** Expected holding period (years) */
  holdingPeriod: number | null;

  /** Marginal tax rate (%) - 0, 11, 30, 41, 45 */
  taxRate: number | null;

  /** Loan amount (€) - 0 if cash purchase */
  loanAmount?: number | null;

  /** Loan interest rate (%) */
  interestRate?: number | null;

  /** Loan duration (years) */
  loanDuration?: number | null;

  /** Land portion of purchase price (%) - non-depreciable */
  landPortion?: number;

  /** Furniture value (€) */
  furnitureValue?: number;
}

/**
 * Simulation result for a tax regime
 */
export interface SimulationResult {
  /** Regime name (Micro-BIC or Real Regime) */
  regime: 'Micro-BIC' | 'Real Regime';

  /** Annual gross rental income (€/year) */
  grossIncome: number;

  /** Standard deduction or deductible expenses (€/year) */
  deductions: number;

  /** Annual depreciation (€/year) - real regime only */
  depreciation?: number;

  /** Annual loan interest (€/year) */
  loanInterest?: number;

  /** Taxable income after deductions (€/year) */
  taxableIncome: number;

  /** Income tax (€/year) */
  tax: number;

  /** Net income after taxes (€/year) */
  netIncome: number;

  /** Net annual cash flow (income - expenses - tax - loan payments) */
  cashFlow: number;

  /** Net return on investment (%) */
  netReturn: number;
}

/**
 * Complete comparison result of both regimes
 */
export interface RegimeComparison {
  /** Simulation for Micro-BIC regime */
  microBic: SimulationResult;

  /** Simulation for Real regime */
  realRegime: SimulationResult;

  /** Annual tax savings in real regime vs Micro-BIC (€/year) */
  annualSavings: number;

  /** Total tax savings over holding period (€) */
  totalSavings: number;

  /** Recommended regime */
  recommendedRegime: 'Micro-BIC' | 'Real Regime';

  /** Reason for recommendation */
  recommendation: string;
}

/**
 * Chat message between user and AI
 */
export interface ChatMessage {
  /** Sender role */
  role: 'user' | 'assistant' | 'system';

  /** Message content */
  content: string;

  /** Message timestamp */
  timestamp?: Date;
}

/**
 * Chat API response
 */
export interface ChatResponse {
  /** AI response message */
  message: string;

  /** Updated simulation data (if extracted) */
  updatedData: SimulationData;
}

/**
 * Depreciation details by component
 */
export interface DepreciationDetails {
  /** Building structure value (€) */
  structureValue: number;

  /** Structure depreciation period (years) */
  structurePeriod: number;

  /** Annual structure depreciation (€/year) */
  structureDepreciation: number;

  /** Furniture value (€) */
  furnitureValue: number;

  /** Furniture depreciation period (years) */
  furniturePeriod: number;

  /** Annual furniture depreciation (€/year) */
  furnitureDepreciation: number;

  /** Total annual depreciation (€/year) */
  totalDepreciation: number;
}
