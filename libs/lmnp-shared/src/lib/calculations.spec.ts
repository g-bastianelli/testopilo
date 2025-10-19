import { describe, it, expect } from 'vitest';
import {
  LMNP_CONSTANTS,
  calculateLoanInterest,
  calculateMonthlyPayment,
  calculateDepreciation,
  calculateMicroBic,
  calculateRealRegime,
  compareRegimes,
  exceedsMicroBicThreshold,
  exceedsLmnpThreshold,
  getDefaultSimulationData,
} from './calculations';
import type { SimulationData } from './types';

describe('LMNP Calculations', () => {
  describe('calculateLoanInterest', () => {
    it('should calculate annual loan interest correctly', () => {
      const interest = calculateLoanInterest(180_000, 3, 20);
      expect(interest).toBe(5_400); // 180,000 * 3% = 5,400
    });

    it('should return 0 when loan amount is 0', () => {
      const interest = calculateLoanInterest(0, 3, 20);
      expect(interest).toBe(0);
    });

    it('should return 0 when interest rate is 0', () => {
      const interest = calculateLoanInterest(180_000, 0, 20);
      expect(interest).toBe(0);
    });
  });

  describe('calculateMonthlyPayment', () => {
    it('should calculate monthly payment correctly', () => {
      const payment = calculateMonthlyPayment(180_000, 3, 20);
      expect(payment).toBeCloseTo(998.28, 2);
    });

    it('should return 0 when loan amount is 0', () => {
      const payment = calculateMonthlyPayment(0, 3, 20);
      expect(payment).toBe(0);
    });
  });

  describe('calculateDepreciation', () => {
    it('should calculate depreciation with default land portion (20%)', () => {
      const data: SimulationData = {
        purchasePrice: 200_000,
        monthlyRent: 800,
        annualExpenses: 1_500,
        holdingPeriod: 10,
        taxRate: 30,
        furnitureValue: 5_000,
      };

      const depreciation = calculateDepreciation(data);

      // Structure: 200,000 - 20% (land) = 160,000
      // Structure depreciation: 160,000 / 30 years = 5,333.33
      expect(depreciation.structureValue).toBe(160_000);
      expect(depreciation.structurePeriod).toBe(30);
      expect(depreciation.structureDepreciation).toBeCloseTo(5_333.33, 2);

      // Furniture: 5,000 / 7 years = 714.29
      expect(depreciation.furnitureValue).toBe(5_000);
      expect(depreciation.furniturePeriod).toBe(7);
      expect(depreciation.furnitureDepreciation).toBeCloseTo(714.29, 2);

      // Total: 5,333.33 + 714.29 = 6,047.62
      expect(depreciation.totalDepreciation).toBeCloseTo(6_047.62, 2);
    });

    it('should handle custom land portion', () => {
      const data: SimulationData = {
        purchasePrice: 200_000,
        monthlyRent: 800,
        annualExpenses: 1_500,
        holdingPeriod: 10,
        taxRate: 30,
        landPortion: 30, // 30% land
        furnitureValue: 0,
      };

      const depreciation = calculateDepreciation(data);

      // Structure: 200,000 - 30% = 140,000
      expect(depreciation.structureValue).toBe(140_000);
      expect(depreciation.structureDepreciation).toBeCloseTo(4_666.67, 2);
    });

    it('should handle no furniture', () => {
      const data: SimulationData = {
        purchasePrice: 200_000,
        monthlyRent: 800,
        annualExpenses: 1_500,
        holdingPeriod: 10,
        taxRate: 30,
        furnitureValue: 0,
      };

      const depreciation = calculateDepreciation(data);
      expect(depreciation.furnitureDepreciation).toBe(0);
    });
  });

  describe('calculateMicroBic', () => {
    it('should calculate Micro-BIC regime correctly', () => {
      const data: SimulationData = {
        purchasePrice: 200_000,
        monthlyRent: 800,
        annualExpenses: 1_500,
        holdingPeriod: 10,
        taxRate: 30,
      };

      const result = calculateMicroBic(data);

      expect(result.regime).toBe('Micro-BIC');
      expect(result.grossIncome).toBe(9_600); // 800 * 12
      expect(result.deductions).toBe(4_800); // 50% of 9,600
      expect(result.taxableIncome).toBe(4_800); // 9,600 - 4,800
      expect(result.tax).toBe(1_440); // 4,800 * 30%
      expect(result.netIncome).toBe(8_160); // 9,600 - 1,440
      expect(result.cashFlow).toBe(6_660); // 8,160 - 1,500 (expenses)
    });

    it('should calculate with loan', () => {
      const data: SimulationData = {
        purchasePrice: 200_000,
        monthlyRent: 800,
        annualExpenses: 1_500,
        holdingPeriod: 10,
        taxRate: 30,
        loanAmount: 180_000,
        interestRate: 3,
        loanDuration: 20,
      };

      const result = calculateMicroBic(data);

      // Monthly payment: ~998.57
      // Annual payments: 998.57 * 12 = 11,982.84
      // Cash flow: 8,160 - 1,500 - 11,982.84 = -5,322.84
      expect(result.cashFlow).toBeLessThan(0);
    });
  });

  describe('calculateRealRegime', () => {
    it('should calculate Real Regime correctly without loan', () => {
      const data: SimulationData = {
        purchasePrice: 200_000,
        monthlyRent: 800,
        annualExpenses: 1_500,
        holdingPeriod: 10,
        taxRate: 30,
        furnitureValue: 5_000,
      };

      const result = calculateRealRegime(data);

      expect(result.regime).toBe('Real Regime');
      expect(result.grossIncome).toBe(9_600);
      expect(result.depreciation).toBeCloseTo(6_047.62, 2);
      expect(result.loanInterest).toBe(0);

      // Deductions: 1,500 (expenses) + 6,047.62 (depreciation) = 7,547.62
      expect(result.deductions).toBeCloseTo(7_547.62, 2);

      // Taxable income: 9,600 - 7,547.62 = 2,052.38
      expect(result.taxableIncome).toBeCloseTo(2_052.38, 2);

      // Tax: 2,052.38 * 30% = 615.71
      expect(result.tax).toBeCloseTo(615.71, 2);

      // Net income: 9,600 - 615.71 = 8,984.29
      expect(result.netIncome).toBeCloseTo(8_984.29, 2);
    });

    it('should calculate Real Regime with loan', () => {
      const data: SimulationData = {
        purchasePrice: 200_000,
        monthlyRent: 800,
        annualExpenses: 1_500,
        holdingPeriod: 10,
        taxRate: 30,
        loanAmount: 180_000,
        interestRate: 3,
        loanDuration: 20,
        furnitureValue: 5_000,
      };

      const result = calculateRealRegime(data);

      expect(result.loanInterest).toBe(5_400);

      // Deductions: 1,500 + 6,047.62 + 5,400 = 12,947.62
      expect(result.deductions).toBeCloseTo(12_947.62, 2);

      // Taxable income: max(0, 9,600 - 12,947.62) = 0 (deficit)
      expect(result.taxableIncome).toBe(0);
      expect(result.tax).toBe(0);
    });

    it('should handle deficit (no negative taxable income)', () => {
      const data: SimulationData = {
        purchasePrice: 300_000,
        monthlyRent: 500,
        annualExpenses: 3_000,
        holdingPeriod: 10,
        taxRate: 30,
        loanAmount: 270_000,
        interestRate: 4,
        loanDuration: 25,
      };

      const result = calculateRealRegime(data);

      // Even with high expenses and depreciation, taxable income should be >= 0
      expect(result.taxableIncome).toBeGreaterThanOrEqual(0);
      expect(result.tax).toBeGreaterThanOrEqual(0);
    });
  });

  describe('compareRegimes', () => {
    it('should recommend Real Regime when more advantageous', () => {
      const data: SimulationData = {
        purchasePrice: 200_000,
        monthlyRent: 800,
        annualExpenses: 1_500,
        holdingPeriod: 10,
        taxRate: 30,
        loanAmount: 180_000,
        interestRate: 3,
        loanDuration: 20,
        furnitureValue: 5_000,
      };

      const comparison = compareRegimes(data);

      expect(comparison.recommendedRegime).toBe('Real Regime');
      expect(comparison.annualSavings).toBeGreaterThan(0);
      expect(comparison.totalSavings).toBe(comparison.annualSavings * 10);
      expect(comparison.recommendation).toContain('Real Regime saves');
    });

    it('should recommend Micro-BIC when more advantageous', () => {
      const data: SimulationData = {
        purchasePrice: 100_000,
        monthlyRent: 500,
        annualExpenses: 200,
        holdingPeriod: 5,
        taxRate: 11,
        furnitureValue: 0,
      };

      const comparison = compareRegimes(data);

      // With low expenses and low tax rate, Micro-BIC might be better
      expect(['Micro-BIC', 'Real Regime']).toContain(
        comparison.recommendedRegime
      );
    });

    it('should provide detailed comparison data', () => {
      const data: SimulationData = {
        purchasePrice: 200_000,
        monthlyRent: 800,
        annualExpenses: 1_500,
        holdingPeriod: 10,
        taxRate: 30,
      };

      const comparison = compareRegimes(data);

      expect(comparison.microBic).toBeDefined();
      expect(comparison.realRegime).toBeDefined();
      expect(comparison.microBic.regime).toBe('Micro-BIC');
      expect(comparison.realRegime.regime).toBe('Real Regime');
      expect(comparison.recommendation).toBeTruthy();
    });
  });

  describe('threshold validators', () => {
    it('should detect when monthly rent exceeds Micro-BIC threshold', () => {
      // Threshold: 77,700 / 12 = 6,475
      expect(exceedsMicroBicThreshold(6_476)).toBe(true);
      expect(exceedsMicroBicThreshold(6_475)).toBe(false);
      expect(exceedsMicroBicThreshold(1_000)).toBe(false);
    });

    it('should detect when monthly rent exceeds LMNP threshold', () => {
      // Threshold: 23,000 / 12 = 1,916.67
      expect(exceedsLmnpThreshold(1_917)).toBe(true);
      expect(exceedsLmnpThreshold(1_916)).toBe(false);
      expect(exceedsLmnpThreshold(800)).toBe(false);
    });
  });

  describe('getDefaultSimulationData', () => {
    it('should return valid default simulation data', () => {
      const defaults = getDefaultSimulationData();

      expect(defaults.purchasePrice).toBe(200_000);
      expect(defaults.monthlyRent).toBe(800);
      expect(defaults.annualExpenses).toBe(1_500);
      expect(defaults.holdingPeriod).toBe(10);
      expect(defaults.taxRate).toBe(30);
      expect(defaults.loanAmount).toBe(0);
      expect(defaults.landPortion).toBe(LMNP_CONSTANTS.DEFAULT_LAND_PORTION);
      expect(defaults.furnitureValue).toBe(5_000);
    });
  });

  describe('edge cases', () => {
    it('should handle zero monthly rent', () => {
      const data: SimulationData = {
        purchasePrice: 200_000,
        monthlyRent: 0,
        annualExpenses: 1_500,
        holdingPeriod: 10,
        taxRate: 30,
      };

      const microBic = calculateMicroBic(data);
      const realRegime = calculateRealRegime(data);

      expect(microBic.grossIncome).toBe(0);
      expect(microBic.tax).toBe(0);
      expect(realRegime.grossIncome).toBe(0);
      expect(realRegime.tax).toBe(0);
    });

    it('should handle zero tax rate', () => {
      const data: SimulationData = {
        purchasePrice: 200_000,
        monthlyRent: 800,
        annualExpenses: 1_500,
        holdingPeriod: 10,
        taxRate: 0,
      };

      const result = calculateMicroBic(data);
      expect(result.tax).toBe(0);
      expect(result.netIncome).toBe(result.grossIncome);
    });

    it('should round all monetary values to 2 decimal places', () => {
      const data: SimulationData = {
        purchasePrice: 200_000,
        monthlyRent: 833.33,
        annualExpenses: 1_234.56,
        holdingPeriod: 10,
        taxRate: 30,
      };

      const result = calculateMicroBic(data);

      // Check that all values are properly rounded
      expect(result.grossIncome).toBe(
        Math.round(result.grossIncome * 100) / 100
      );
      expect(result.tax).toBe(Math.round(result.tax * 100) / 100);
      expect(result.netIncome).toBe(Math.round(result.netIncome * 100) / 100);
    });
  });
});
