import { describe, it, expect } from 'vitest';
import { ZodError } from 'zod';
import {
  SimulationDataSchema,
  UpdateSimulationSchema,
  ChatMessageSchema,
  ChatRequestSchema,
  ChatResponseSchema,
  SimulationResultSchema,
  RegimeComparisonSchema,
  DepreciationDetailsSchema,
} from './schemas';

describe('LMNP Schemas', () => {
  describe('SimulationDataSchema', () => {
    it('should validate correct simulation data', () => {
      const validData = {
        purchasePrice: 200_000,
        monthlyRent: 800,
        annualExpenses: 1_500,
        holdingPeriod: 10,
        taxRate: 30,
      };

      const result = SimulationDataSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should apply default values for optional fields', () => {
      const data = {
        purchasePrice: 200_000,
        monthlyRent: 800,
        annualExpenses: 1_500,
        holdingPeriod: 10,
        taxRate: 30,
      };

      const parsed = SimulationDataSchema.parse(data);
      expect(parsed.landPortion).toBe(20);
      expect(parsed.furnitureValue).toBe(0);
    });

    it('should validate with all optional fields', () => {
      const completeData = {
        purchasePrice: 200_000,
        monthlyRent: 800,
        annualExpenses: 1_500,
        holdingPeriod: 10,
        taxRate: 30,
        loanAmount: 180_000,
        interestRate: 3,
        loanDuration: 20,
        landPortion: 25,
        furnitureValue: 5_000,
      };

      const result = SimulationDataSchema.safeParse(completeData);
      expect(result.success).toBe(true);
    });

    it('should reject negative purchase price', () => {
      const invalidData = {
        purchasePrice: -100_000,
        monthlyRent: 800,
        annualExpenses: 1_500,
        holdingPeriod: 10,
        taxRate: 30,
      };

      const result = SimulationDataSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('positive');
      }
    });

    it('should reject purchase price below minimum', () => {
      const invalidData = {
        purchasePrice: 500,
        monthlyRent: 800,
        annualExpenses: 1_500,
        holdingPeriod: 10,
        taxRate: 30,
      };

      const result = SimulationDataSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('1,000');
      }
    });

    it('should reject invalid tax rate', () => {
      const invalidData = {
        purchasePrice: 200_000,
        monthlyRent: 800,
        annualExpenses: 1_500,
        holdingPeriod: 10,
        taxRate: 25, // Invalid - must be 0, 11, 30, 41, or 45
      };

      const result = SimulationDataSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain(
          '0, 11, 30, 41, or 45'
        );
      }
    });

    it('should accept all valid tax rates', () => {
      const validTaxRates = [0, 11, 30, 41, 45];

      validTaxRates.forEach((rate) => {
        const data = {
          purchasePrice: 200_000,
          monthlyRent: 800,
          annualExpenses: 1_500,
          holdingPeriod: 10,
          taxRate: rate,
        };

        const result = SimulationDataSchema.safeParse(data);
        expect(result.success).toBe(true);
      });
    });

    it('should reject holding period above maximum', () => {
      const invalidData = {
        purchasePrice: 200_000,
        monthlyRent: 800,
        annualExpenses: 1_500,
        holdingPeriod: 60, // Max is 50
        taxRate: 30,
      };

      const result = SimulationDataSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject negative annual expenses', () => {
      const invalidData = {
        purchasePrice: 200_000,
        monthlyRent: 800,
        annualExpenses: -500,
        holdingPeriod: 10,
        taxRate: 30,
      };

      const result = SimulationDataSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject land portion above 100%', () => {
      const invalidData = {
        purchasePrice: 200_000,
        monthlyRent: 800,
        annualExpenses: 1_500,
        holdingPeriod: 10,
        taxRate: 30,
        landPortion: 150,
      };

      const result = SimulationDataSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('should reject interest rate above maximum', () => {
      const invalidData = {
        purchasePrice: 200_000,
        monthlyRent: 800,
        annualExpenses: 1_500,
        holdingPeriod: 10,
        taxRate: 30,
        loanAmount: 180_000,
        interestRate: 25, // Max is 20
        loanDuration: 20,
      };

      const result = SimulationDataSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('UpdateSimulationSchema', () => {
    it('should validate partial updates', () => {
      const partialUpdate = {
        monthlyRent: 900,
        taxRate: 41,
      };

      const result = UpdateSimulationSchema.safeParse(partialUpdate);
      expect(result.success).toBe(true);
    });

    it('should allow empty object', () => {
      const result = UpdateSimulationSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject invalid values', () => {
      const invalidUpdate = {
        monthlyRent: -500,
      };

      const result = UpdateSimulationSchema.safeParse(invalidUpdate);
      expect(result.success).toBe(false);
    });
  });

  describe('ChatMessageSchema', () => {
    it('should validate user message', () => {
      const message = {
        role: 'user',
        content: 'Hello, I want to simulate a property purchase',
      };

      const result = ChatMessageSchema.safeParse(message);
      expect(result.success).toBe(true);
    });

    it('should validate assistant message', () => {
      const message = {
        role: 'assistant',
        content: 'Sure! Let me help you with that.',
      };

      const result = ChatMessageSchema.safeParse(message);
      expect(result.success).toBe(true);
    });

    it('should validate system message', () => {
      const message = {
        role: 'system',
        content: 'You are a helpful LMNP tax advisor.',
      };

      const result = ChatMessageSchema.safeParse(message);
      expect(result.success).toBe(true);
    });

    it('should reject empty content', () => {
      const message = {
        role: 'user',
        content: '',
      };

      const result = ChatMessageSchema.safeParse(message);
      expect(result.success).toBe(false);
    });

    it('should reject invalid role', () => {
      const message = {
        role: 'admin',
        content: 'Test',
      };

      const result = ChatMessageSchema.safeParse(message);
      expect(result.success).toBe(false);
    });

    it('should accept optional timestamp', () => {
      const message = {
        role: 'user',
        content: 'Test',
        timestamp: new Date(),
      };

      const result = ChatMessageSchema.safeParse(message);
      expect(result.success).toBe(true);
    });
  });

  describe('ChatRequestSchema', () => {
    it('should validate chat request', () => {
      const request = {
        messages: [
          { role: 'user', content: 'Hello' },
          { role: 'assistant', content: 'Hi there!' },
        ],
        currentData: {
          purchasePrice: 200_000,
          monthlyRent: 800,
          annualExpenses: 1_500,
          holdingPeriod: 10,
          taxRate: 30,
        },
      };

      const result = ChatRequestSchema.safeParse(request);
      expect(result.success).toBe(true);
    });

    it('should reject empty messages array', () => {
      const request = {
        messages: [],
        currentData: {
          purchasePrice: 200_000,
          monthlyRent: 800,
          annualExpenses: 1_500,
          holdingPeriod: 10,
          taxRate: 30,
        },
      };

      const result = ChatRequestSchema.safeParse(request);
      expect(result.success).toBe(false);
    });
  });

  describe('ChatResponseSchema', () => {
    it('should validate chat response', () => {
      const response = {
        message: 'I understand you want to buy a property for €200,000.',
        updatedData: {
          purchasePrice: 200_000,
          monthlyRent: 800,
          annualExpenses: 1_500,
          holdingPeriod: 10,
          taxRate: 30,
        },
      };

      const result = ChatResponseSchema.safeParse(response);
      expect(result.success).toBe(true);
    });
  });

  describe('SimulationResultSchema', () => {
    it('should validate Micro-BIC result', () => {
      const result = {
        regime: 'Micro-BIC',
        grossIncome: 9_600,
        deductions: 4_800,
        taxableIncome: 4_800,
        tax: 1_440,
        netIncome: 8_160,
        cashFlow: 6_660,
        netReturn: 4.08,
      };

      const validation = SimulationResultSchema.safeParse(result);
      expect(validation.success).toBe(true);
    });

    it('should validate Real Regime result with optional fields', () => {
      const result = {
        regime: 'Real Regime',
        grossIncome: 9_600,
        deductions: 12_947.62,
        depreciation: 6_047.62,
        loanInterest: 5_400,
        taxableIncome: 0,
        tax: 0,
        netIncome: 9_600,
        cashFlow: -3_882.84,
        netReturn: 48,
      };

      const validation = SimulationResultSchema.safeParse(result);
      expect(validation.success).toBe(true);
    });

    it('should reject invalid regime name', () => {
      const result = {
        regime: 'Invalid Regime',
        grossIncome: 9_600,
        deductions: 4_800,
        taxableIncome: 4_800,
        tax: 1_440,
        netIncome: 8_160,
        cashFlow: 6_660,
        netReturn: 4.08,
      };

      const validation = SimulationResultSchema.safeParse(result);
      expect(validation.success).toBe(false);
    });
  });

  describe('RegimeComparisonSchema', () => {
    it('should validate complete comparison', () => {
      const comparison = {
        microBic: {
          regime: 'Micro-BIC',
          grossIncome: 9_600,
          deductions: 4_800,
          taxableIncome: 4_800,
          tax: 1_440,
          netIncome: 8_160,
          cashFlow: 6_660,
          netReturn: 4.08,
        },
        realRegime: {
          regime: 'Real Regime',
          grossIncome: 9_600,
          deductions: 12_947.62,
          depreciation: 6_047.62,
          loanInterest: 5_400,
          taxableIncome: 0,
          tax: 0,
          netIncome: 9_600,
          cashFlow: -3_882.84,
          netReturn: 48,
        },
        annualSavings: 1_440,
        totalSavings: 14_400,
        recommendedRegime: 'Real Regime',
        recommendation: 'Real Regime saves €1,440/year',
      };

      const result = RegimeComparisonSchema.safeParse(comparison);
      expect(result.success).toBe(true);
    });
  });

  describe('DepreciationDetailsSchema', () => {
    it('should validate depreciation details', () => {
      const details = {
        structureValue: 160_000,
        structurePeriod: 30,
        structureDepreciation: 5_333.33,
        furnitureValue: 5_000,
        furniturePeriod: 7,
        furnitureDepreciation: 714.29,
        totalDepreciation: 6_047.62,
      };

      const result = DepreciationDetailsSchema.safeParse(details);
      expect(result.success).toBe(true);
    });

    it('should reject negative values', () => {
      const details = {
        structureValue: -160_000,
        structurePeriod: 30,
        structureDepreciation: 5_333.33,
        furnitureValue: 5_000,
        furniturePeriod: 7,
        furnitureDepreciation: 714.29,
        totalDepreciation: 6_047.62,
      };

      const result = DepreciationDetailsSchema.safeParse(details);
      expect(result.success).toBe(false);
    });

    it('should reject non-integer periods', () => {
      const details = {
        structureValue: 160_000,
        structurePeriod: 30.5,
        structureDepreciation: 5_333.33,
        furnitureValue: 5_000,
        furniturePeriod: 7,
        furnitureDepreciation: 714.29,
        totalDepreciation: 6_047.62,
      };

      const result = DepreciationDetailsSchema.safeParse(details);
      expect(result.success).toBe(false);
    });
  });
});
