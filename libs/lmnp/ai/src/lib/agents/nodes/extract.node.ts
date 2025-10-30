/**
 * Extract Node - Extracts simulation data from user conversation
 * Pure function for workflow
 */

import { logger } from '@utils/logger';
import type { ChatMessage, SimulationData } from '@lmnp/shared';
import { generateText } from 'ai';
import { createXai } from '@ai-sdk/xai';
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
 * Convert ChatMessage[] to AI SDK messages format
 */
function convertToAISDKMessages(messages: ChatMessage[]) {
  return messages.map((msg) => ({
    role: msg.role as 'user' | 'assistant',
    content: msg.content,
  }));
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
  const aiMessages = convertToAISDKMessages(state.messages);

  // Invoke the model with AI SDK
  const xai = createXai({
    apiKey: env.XAI_API_KEY,
  });

  const response = await generateText({
    model: xai('grok-4-fast-non-reasoning'),
    system: systemPrompt,
    messages: aiMessages,
    tools: {
      update_simulation_data: updateSimulationDataTool,
    },
    temperature: 0.7,
  });

  // Check if the model called any tools
  const updatedData = state.currentData;

  const updateSimulationDataResult = response.toolResults.find(
    (
      toolResult
    ): toolResult is Extract<
      (typeof response.toolResults)[number],
      { toolName: 'update_simulation_data' }
    > => toolResult.toolName === 'update_simulation_data'
  );

  if (updateSimulationDataResult) {
    logger.debug({
      msg: '[Extract Node] Tool execution successful',
    });
    if (updateSimulationDataResult.output.success) {
      logger.debug({
        msg: '[Extract Node] Tool execution successful',
        data: updateSimulationDataResult.output.data,
      });
      return {
        updatedData: updateSimulationDataResult.output.data,
        extractionMessage: response.text,
      };
    } else {
      logger.debug({
        msg: '[Extract Node] Tool execution failed',
        error: updateSimulationDataResult.output.error,
      });
      return {
        updatedData,
        extractionMessage: response.text,
      };
    }
  }
  logger.debug({
    msg: '[Extract Node] Tool execution not found',
  });

  return {
    updatedData,
    extractionMessage: response.text,
  };
}
