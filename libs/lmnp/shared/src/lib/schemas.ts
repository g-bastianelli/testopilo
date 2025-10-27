/**
 * Zod schemas for LMNP data validation
 */

import { z } from 'zod';

/**
 * Validation schema for simulation data
 * Required fields accept null when not yet provided by user
 */
export const SimulationDataSchema = z.object({
  purchasePrice: z
    .number()
    .positive({ message: 'Purchase price must be positive' })
    .min(1000, { message: 'Purchase price must be at least €1,000' })
    .max(10_000_000, { message: 'Purchase price cannot exceed €10,000,000' })
    .nullable(),

  monthlyRent: z
    .number()
    .positive({ message: 'Monthly rent must be positive' })
    .min(100, { message: 'Monthly rent must be at least €100' })
    .max(50_000, { message: 'Monthly rent cannot exceed €50,000' })
    .nullable(),

  annualExpenses: z
    .number()
    .nonnegative({ message: 'Annual expenses cannot be negative' })
    .max(100_000, { message: 'Annual expenses cannot exceed €100,000' })
    .nullable(),

  holdingPeriod: z
    .number()
    .int({ message: 'Holding period must be an integer' })
    .positive({ message: 'Holding period must be positive' })
    .min(1, { message: 'Holding period must be at least 1 year' })
    .max(50, { message: 'Holding period cannot exceed 50 years' })
    .nullable(),

  taxRate: z
    .number()
    .nonnegative({ message: 'Tax rate cannot be negative' })
    .max(100, { message: 'Tax rate cannot exceed 100%' })
    .refine((val) => val === null || [0, 11, 30, 41, 45].includes(val), {
      message: 'Tax rate must be 0, 11, 30, 41, or 45%',
    })
    .nullable(),

  loanAmount: z
    .number()
    .nonnegative({ message: 'Loan amount cannot be negative' })
    .max(10_000_000, { message: 'Loan amount cannot exceed €10,000,000' })
    .nullable(),

  interestRate: z
    .number()
    .nonnegative({ message: 'Interest rate cannot be negative' })
    .max(20, { message: 'Interest rate cannot exceed 20%' })
    .nullable(),

  loanDuration: z
    .number()
    .int({ message: 'Loan duration must be an integer' })
    .positive({ message: 'Loan duration must be positive' })
    .max(30, { message: 'Loan duration cannot exceed 30 years' })
    .nullable(),
});

export const CompleteSimulationDataSchema = SimulationDataSchema.extend({
  purchasePrice: SimulationDataSchema.shape.purchasePrice.unwrap(),
  monthlyRent: SimulationDataSchema.shape.monthlyRent.unwrap(),
  annualExpenses: SimulationDataSchema.shape.annualExpenses.unwrap(),
  holdingPeriod: SimulationDataSchema.shape.holdingPeriod.unwrap(),
  taxRate: SimulationDataSchema.shape.taxRate.unwrap(),
});

/**
 * Schema for partial updates (used by AI)
 * Note: Optional fields use .nonnegative() instead of .positive() to allow 0 values
 */
export const UpdateSimulationSchema = SimulationDataSchema.extend({
  purchasePrice: SimulationDataSchema.shape.purchasePrice.optional(),
  monthlyRent: SimulationDataSchema.shape.monthlyRent.optional(),
  annualExpenses: SimulationDataSchema.shape.annualExpenses.optional(),
  holdingPeriod: SimulationDataSchema.shape.holdingPeriod.optional(),
  taxRate: SimulationDataSchema.shape.taxRate.optional(),
  loanAmount: SimulationDataSchema.shape.loanAmount.optional(),
  interestRate: SimulationDataSchema.shape.interestRate.optional(),
  loanDuration: SimulationDataSchema.shape.loanDuration.optional(),
})
  .strip()
  .transform((data) => {
    return Object.fromEntries(
      Object.entries(data).filter(([_, value]) => value !== undefined)
    );
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
  simulationResult: z.lazy(() => RegimeComparisonSchema).optional(),
});

/**
 * Inferred TypeScript types from Zod schemas
 */
export type SimulationData = z.infer<typeof SimulationDataSchema>;
export type CompleteSimulationData = z.infer<
  typeof CompleteSimulationDataSchema
>;
export type UpdateSimulation = z.infer<typeof UpdateSimulationSchema>;
export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatRequest = z.infer<typeof ChatRequestSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;
export type SimulationResult = z.infer<typeof SimulationResultSchema>;
export type RegimeComparison = z.infer<typeof RegimeComparisonSchema>;
