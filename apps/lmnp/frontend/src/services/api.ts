import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  ChatMessage,
  ChatResponse,
  SimulationData,
  RegimeComparison,
} from '@lmnp/shared';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Query keys
export const QUERY_KEYS = {
  messages: ['chat', 'messages'] as const,
  simulationData: ['chat', 'simulationData'] as const,
  simulation: ['chat', 'simulation'] as const,
};

// Initial states
const INITIAL_MESSAGE: ChatMessage = {
  role: 'assistant',
  content:
    "Bonjour ! Je vais vous aider à simuler votre investissement en Location Meublée Non Professionnelle (LMNP). Pour commencer, parlez-moi de votre projet : quel bien envisagez-vous d'acheter ?",
};

function getDefaultSimulationData(): SimulationData {
  return {
    purchasePrice: null,
    monthlyRent: null,
    annualExpenses: null,
    holdingPeriod: null,
    taxRate: null,
    loanAmount: null,
    interestRate: null,
    loanDuration: null,
  };
}

/**
 * Send a chat message to the AI and get updated simulation data
 */
export async function sendChatMessage(
  messages: ChatMessage[],
  currentData: SimulationData
): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      currentData,
    }),
  });

  if (!response.ok) {
    throw new Error(`Chat API error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Fake query hooks to share state via TanStack Query cache
 */
export function useChatMessages() {
  return useQuery({
    queryKey: QUERY_KEYS.messages,
    queryFn: () => [INITIAL_MESSAGE],
    staleTime: Infinity,
    gcTime: Infinity,
    initialData: [INITIAL_MESSAGE],
  });
}

export function useSimulationData() {
  return useQuery({
    queryKey: QUERY_KEYS.simulationData,
    queryFn: () => getDefaultSimulationData(),
    staleTime: Infinity,
    gcTime: Infinity,
    initialData: getDefaultSimulationData(),
  });
}

/**
 * Hook to reset all chat state
 */
export function useResetChat() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.setQueryData(QUERY_KEYS.messages, [INITIAL_MESSAGE]);
    queryClient.setQueryData(
      QUERY_KEYS.simulationData,
      getDefaultSimulationData()
    );
    queryClient.setQueryData(QUERY_KEYS.simulation, null);
  };
}

export function useSimulation() {
  return useQuery<RegimeComparison | null>({
    queryKey: QUERY_KEYS.simulation,
    queryFn: () => null,
    staleTime: Infinity,
    gcTime: Infinity,
    initialData: null,
  });
}

/**
 * Custom hook for sending chat messages using TanStack Query
 */
export function useSendChatMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      messages,
      currentData,
    }: {
      messages: ChatMessage[];
      currentData: SimulationData;
    }) => sendChatMessage(messages, currentData),
    onSuccess: (response, variables) => {
      // Update messages cache
      queryClient.setQueryData(QUERY_KEYS.messages, [
        ...variables.messages,
        { role: 'assistant' as const, content: response.message },
      ]);

      // Update simulation data cache
      queryClient.setQueryData(QUERY_KEYS.simulationData, response.updatedData);

      // Update simulation results cache if present
      if (response.simulationResult) {
        queryClient.setQueryData(
          QUERY_KEYS.simulation,
          response.simulationResult
        );
      }
    },
  });
}
