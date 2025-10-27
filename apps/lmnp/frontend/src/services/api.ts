import type {
  ChatMessage,
  ChatResponse,
  SimulationData,
  RegimeComparison,
} from '@lmnp/shared';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

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
 * Get simulation results (comparison of Micro-BIC vs Real Regime)
 */
export async function getSimulation(
  data: SimulationData
): Promise<RegimeComparison> {
  const response = await fetch(`${API_BASE_URL}/simulate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Simulation API error');
  }

  return response.json();
}
