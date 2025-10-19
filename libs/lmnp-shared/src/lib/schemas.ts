/**
 * Zod schemas for LMNP data validation
 */

import { z } from 'zod';

/**
 * Validation schema for simulation data
 */
export const SimulationDataSchema = z.object({
  purchasePrice: z
    .number()
    .positive({ message: 'Purchase price must be positive' })
    .min(1000, { message: 'Purchase price must be at least €1,000' })
    .max(10_000_000, { message: 'Purchase price cannot exceed €10,000,000' }),

  monthlyRent: z
    .number()
    .positive({ message: 'Monthly rent must be positive' })
    .min(100, { message: 'Monthly rent must be at least €100' })
    .max(50_000, { message: 'Monthly rent cannot exceed €50,000' }),

  annualExpenses: z
    .number()
    .nonnegative({ message: 'Annual expenses cannot be negative' })
    .max(100_000, { message: 'Annual expenses cannot exceed €100,000' }),

  holdingPeriod: z
    .number()
    .int({ message: 'Holding period must be an integer' })
    .positive({ message: 'Holding period must be positive' })
    .min(1, { message: 'Holding period must be at least 1 year' })
    .max(50, { message: 'Holding period cannot exceed 50 years' }),

  taxRate: z
    .number()
    .nonnegative({ message: 'Tax rate cannot be negative' })
    .max(100, { message: 'Tax rate cannot exceed 100%' })
    .refine((val) => [0, 11, 30, 41, 45].includes(val), {
      message: 'Tax rate must be 0, 11, 30, 41, or 45%',
    }),

  loanAmount: z
    .number()
    .nonnegative({ message: 'Loan amount cannot be negative' })
    .max(10_000_000, { message: 'Loan amount cannot exceed €10,000,000' })
    .optional(),

  interestRate: z
    .number()
    .nonnegative({ message: 'Interest rate cannot be negative' })
    .max(20, { message: 'Interest rate cannot exceed 20%' })
    .optional(),

  loanDuration: z
    .number()
    .int({ message: 'Loan duration must be an integer' })
    .positive({ message: 'Loan duration must be positive' })
    .max(30, { message: 'Loan duration cannot exceed 30 years' })
    .optional(),

  landPortion: z
    .number()
    .nonnegative({ message: 'Land portion cannot be negative' })
    .max(100, { message: 'Land portion cannot exceed 100%' })
    .optional()
    .default(20),

  furnitureValue: z
    .number()
    .nonnegative({ message: 'Furniture value cannot be negative' })
    .max(500_000, { message: 'Furniture value cannot exceed €500,000' })
    .optional()
    .default(0),
});

/**
 * Schema for partial updates (used by AI)
 */
export const UpdateSimulationSchema = z.object({
  purchasePrice: z.number().positive().optional(),
  monthlyRent: z.number().positive().optional(),
  annualExpenses: z.number().nonnegative().optional(),
  holdingPeriod: z.number().int().positive().max(50).optional(),
  taxRate: z.number().min(0).max(100).optional(),
  loanAmount: z.number().nonnegative().optional(),
  interestRate: z.number().nonnegative().max(20).optional(),
  loanDuration: z.number().int().positive().max(30).optional(),
  landPortion: z.number().nonnegative().max(100).optional(),
  furnitureValue: z.number().nonnegative().optional(),
});

/**
 * Schema for a chat message
 */
export const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1, { message: 'Message cannot be empty' }),
  timestamp: z.date().optional(),
});

/**
 * Schema for chat request
 */
export const ChatRequestSchema = z.object({
  messages: z
    .array(ChatMessageSchema)
    .min(1, { message: 'At least one message is required' }),
  currentData: SimulationDataSchema,
});

/**
 * Schema for chat response
 */
export const ChatResponseSchema = z.object({
  message: z.string(),
  updatedData: SimulationDataSchema,
});

/**
 * Schema for simulation results
 */
export const SimulationResultSchema = z.object({
  regime: z.enum(['Micro-BIC', 'Real Regime']),
  grossIncome: z.number(),
  deductions: z.number(),
  depreciation: z.number().optional(),
  loanInterest: z.number().optional(),
  taxableIncome: z.number(),
  tax: z.number(),
  netIncome: z.number(),
  cashFlow: z.number(),
  netReturn: z.number(),
});

/**
 * Schema for regime comparison
 */
export const RegimeComparisonSchema = z.object({
  microBic: SimulationResultSchema,
  realRegime: SimulationResultSchema,
  annualSavings: z.number(),
  totalSavings: z.number(),
  recommendedRegime: z.enum(['Micro-BIC', 'Real Regime']),
  recommendation: z.string(),
});

/**
 * Schema for depreciation details
 */
export const DepreciationDetailsSchema = z.object({
  structureValue: z.number().nonnegative(),
  structurePeriod: z.number().int().positive(),
  structureDepreciation: z.number().nonnegative(),
  furnitureValue: z.number().nonnegative(),
  furniturePeriod: z.number().int().positive(),
  furnitureDepreciation: z.number().nonnegative(),
  totalDepreciation: z.number().nonnegative(),
});
