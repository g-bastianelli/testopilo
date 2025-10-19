// Types
export type {
  SimulationData,
  SimulationResult,
  RegimeComparison,
  ChatMessage,
  ChatResponse,
  DepreciationDetails,
} from './lib/types.js';

// Schemas
export {
  SimulationDataSchema,
  UpdateSimulationSchema,
  ChatMessageSchema,
  ChatRequestSchema,
  ChatResponseSchema,
  SimulationResultSchema,
  RegimeComparisonSchema,
  DepreciationDetailsSchema,
} from './lib/schemas.js';

// Calculations
export {
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
} from './lib/calculations.js';
