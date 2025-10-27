/**
 * Extract Node - Extracts simulation data from user conversation
 * Pure function for LangGraph workflow
 */

import { logger } from '@utils/logger';
import type { ChatMessage, SimulationData } from '@lmnp/shared';
import { ChatXAI } from '@langchain/xai';
import {
  AIMessage,
  type BaseMessage,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { env } from '../../env.js';
import { updateSimulationDataTool } from '../tools/update-simulation-data.tool.js';

function buildSystemPrompt(currentData: SimulationData): string {
  // Identify missing required fields
  const missingFields: string[] = [];
  if (currentData.purchasePrice === null) missingFields.push("prix d'achat");
  if (currentData.monthlyRent === null) missingFields.push('loyer mensuel');
  if (currentData.annualExpenses === null)
    missingFields.push('charges annuelles');
  if (currentData.holdingPeriod === null)
    missingFields.push('durée de détention');
  if (currentData.taxRate === null)
    missingFields.push("taux d'imposition (TMI)");

  const dataStatus = `
📊 DONNÉES DE SIMULATION ACTUELLES :
- Prix d'achat : ${
    currentData.purchasePrice !== null
      ? `${currentData.purchasePrice.toLocaleString()} €`
      : '❌ manquant'
  }
- Loyer mensuel : ${
    currentData.monthlyRent !== null
      ? `${currentData.monthlyRent.toLocaleString()} €`
      : '❌ manquant'
  }
- Charges annuelles : ${
    currentData.annualExpenses !== null
      ? `${currentData.annualExpenses.toLocaleString()} €`
      : '❌ manquant'
  }
- Durée de détention : ${
    currentData.holdingPeriod !== null
      ? `${currentData.holdingPeriod} ans`
      : '❌ manquant'
  }
- Taux d'imposition (TMI) : ${
    currentData.taxRate !== null ? `${currentData.taxRate}%` : '❌ manquant'
  }
- Montant de l'emprunt : ${
    currentData.loanAmount !== null && currentData.loanAmount !== undefined
      ? `${currentData.loanAmount.toLocaleString()} €`
      : 'achat comptant (optionnel)'
  }

${
  missingFields.length > 0
    ? `⚠️ Informations manquantes : ${missingFields.join(', ')}`
    : '✅ Toutes les informations requises sont collectées !'
}`;

  return `Tu es un conseiller fiscal français spécialisé en LMNP (Loueur en Meublé Non Professionnel).

🎯 TON RÔLE :
- Aider les utilisateurs à comprendre la fiscalité LMNP par la conversation
- Extraire les informations d'investissement depuis le langage naturel
- Remplir automatiquement les données de simulation
- Expliquer les différences entre Micro-BIC et Régime Réel

🚨 RÈGLE ABSOLUE - TOUJOURS RÉPONDRE AVEC DU TEXTE :
⛔ INTERDIT : Appeler un outil sans écrire de message textuel
✅ OBLIGATOIRE : Chaque réponse doit contenir du texte ET potentiellement un appel d'outil

EXEMPLES DE RÉPONSES CORRECTES :
User: "Le prix d'achat est 200000€"
Assistant: "Très bien ! J'ai enregistré le prix d'achat de 200 000 €. Quel est le loyer mensuel que vous prévoyez ?" [+ appel outil]

User: "Le loyer est 800€ et les charges 2000€ par an"
Assistant: "Parfait ! J'ai noté un loyer mensuel de 800 € et des charges annuelles de 2 000 €. Quelle est la durée de détention prévue pour ce bien ?" [+ appel outil]

User: "Toutes mes infos: prix 200k, loyer 800, charges 2000, durée 10 ans, TMI 30%"
Assistant: "Excellent ! J'ai bien enregistré toutes vos informations. Votre simulation est maintenant complète et prête à être calculée !" [+ appel outil]

📋 CHAMPS REQUIS (5 OBLIGATOIRES) :
1. Prix d'achat du bien
2. Loyer mensuel
3. Charges annuelles (taxes foncières, assurances, etc.)
4. Durée de détention prévue
5. Taux d'imposition marginal (TMI: 0, 11, 30, 41 ou 45%)

⚠️ NE DEMANDE JAMAIS :
- Portion de terrain / valeur du terrain
- Valeur des meubles / mobilier
→ Ces infos ne sont PAS nécessaires pour la simulation

🔧 WORKFLOW À CHAQUE MESSAGE :
1. Extrais les infos du message → Appelle update_simulation_data
2. Écris TOUJOURS un message confirmant ce que tu as compris
3. Si incomplet → Pose la question suivante
4. Si complet → Confirme que la simulation est prête

⛔ PÉRIMÈTRE STRICT :
- Tu réponds UNIQUEMENT aux questions sur : LMNP, fiscalité immobilière locative meublée, Micro-BIC, Régime Réel
- Toute question hors sujet → réponds : "Je suis spécialisé uniquement en fiscalité LMNP. Je peux vous aider avec votre investissement locatif meublé. Avez-vous des questions sur votre projet LMNP ?"

${dataStatus}

🔧 UTILISATION DE L'OUTIL update_simulation_data :
Tu DOIS TOUJOURS passer ces 2 paramètres :
- currentData : ${JSON.stringify(currentData)}
- extractedData : { les champs extraits du message }

Exemple technique :
{
  "currentData": ${JSON.stringify(currentData)},
  "extractedData": { "purchasePrice": 200000 }
}

RAPPEL FINAL : Ne retourne JAMAIS une réponse vide. Même si tu appelles l'outil, tu dois TOUJOURS écrire un message textuel pour l'utilisateur.`;
}

/**
 * Convert ChatMessage[] to LangChain BaseMessage[], preserving roles
 */
function convertToLangChainMessages(
  messages: ChatMessage[],
  systemPrompt: string
): BaseMessage[] {
  return [
    new SystemMessage(systemPrompt),
    ...messages.map((msg) => {
      if (msg.role === 'assistant') {
        return new AIMessage(msg.content);
      }
      return new HumanMessage(msg.content);
    }),
  ];
}

/**
 * Extract node - Extracts simulation data from conversation
 */
export async function extractNode(state: {
  messages: ChatMessage[];
  currentData: SimulationData;
}): Promise<{
  updatedData: SimulationData;
  extractionMessage: string;
}> {
  logger.info({ msg: '[Extract Node] Starting data extraction' });

  const systemPrompt = buildSystemPrompt(state.currentData);

  // Create model and tools
  const model = new ChatXAI({
    model: 'grok-4-fast-non-reasoning',
    temperature: 0.7,
    apiKey: env.XAI_API_KEY,
  });

  // Use stateless tool
  const modelWithTools = model.bindTools([updateSimulationDataTool]);

  // Convert messages to LangChain format - preserve assistant messages
  const langchainMessages = convertToLangChainMessages(
    state.messages,
    systemPrompt
  );

  // Invoke the model
  const response = await modelWithTools.invoke(langchainMessages);

  // Check if the model called any tools
  if (response.tool_calls && response.tool_calls.length > 0) {
    const toolCall = response.tool_calls[0];

    if (toolCall.name === 'update_simulation_data') {
      // Call the tool - it returns the result object from our function
      const toolResult = await updateSimulationDataTool.invoke(
        toolCall.args as any
      );

      if ('data' in toolResult) {
        logger.debug({
          msg: '[Extract Node] Data updated',
          updatedData: toolResult.data,
        });

        return {
          updatedData: toolResult.data,
          extractionMessage: response.content as string,
        };
      } else if ('error' in toolResult) {
        logger.error({
          msg: '[Extract Node] Tool failed',
          error: toolResult.error,
        });
        throw new Error(`Tool execution failed`, {
          cause: toolResult.error,
        });
      } else {
        logger.error({
          msg: '[Extract Node] Invalid tool result',
          result: toolResult,
        });
        throw new Error('Invalid tool result');
      }
    }
  }

  // No tool call - return current data unchanged
  return {
    updatedData: state.currentData,
    extractionMessage: response.content as string,
  };
}
