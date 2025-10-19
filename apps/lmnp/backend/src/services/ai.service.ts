/**
 * AI Service using LangChain for LMNP conversation and data extraction
 * Following LangChain best practices
 */

import { logger } from '@testopilo/logger';
import {
  type ChatMessage,
  type SimulationData,
  SimulationDataSchema,
  UpdateSimulationSchema,
} from '@testopilo/lmnp-shared';
import { ChatXAI } from '@langchain/xai';
import {
  HumanMessage,
  AIMessage,
  SystemMessage,
  type BaseMessage,
} from '@langchain/core/messages';
import { env } from '../config/env.js';

export class AiService {
  private model: ChatXAI;

  constructor() {
    this.model = new ChatXAI({
      model: 'grok-4-latest',
      temperature: 0.7,
      apiKey: env.XAI_API_KEY,
    });
  }

  /**
   * Build system prompt with current simulation data context
   */
  private buildSystemPrompt(currentData: SimulationData): string {
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

    return `Tu es un conseiller fiscal français spécialisé en LMNP (Loueur en Meublé Non Professionnel).

Ton rôle :
1. Aider les utilisateurs à comprendre la fiscalité LMNP par la conversation
2. Extraire les informations sur l'investissement immobilier depuis le langage naturel
3. Remplir automatiquement les données de simulation au fil de la conversation
4. Expliquer les différences entre Micro-BIC et Régime Réel

RÈGLES IMPORTANTES :
- Tu NE FAIS JAMAIS de calculs fiscaux toi-même
- Tu EXTRAIS UNIQUEMENT les données de la conversation
- Tous les calculs sont faits par le code système
- Réponds toujours en français de façon naturelle et amicale
- **CRITIQUE** : Appelle TOUJOURS l'outil update_simulation_data dès que l'utilisateur donne une information
- Si l'utilisateur donne plusieurs informations d'un coup, extrais-les TOUTES dans un seul appel d'outil
- Après avoir extrait les données, confirme à l'utilisateur ce que tu as compris
- Si des informations manquent encore, demande-les de façon claire et directe

Données de simulation actuelles :
- Prix d'achat : ${
      currentData.purchasePrice !== null
        ? `${currentData.purchasePrice.toLocaleString()} €`
        : '❌ non renseigné'
    }
- Loyer mensuel : ${
      currentData.monthlyRent !== null
        ? `${currentData.monthlyRent.toLocaleString()} €`
        : '❌ non renseigné'
    }
- Charges annuelles : ${
      currentData.annualExpenses !== null
        ? `${currentData.annualExpenses.toLocaleString()} €`
        : '❌ non renseigné'
    }
- Durée de détention : ${
      currentData.holdingPeriod !== null
        ? `${currentData.holdingPeriod} ans`
        : '❌ non renseigné'
    }
- Taux d'imposition (TMI) : ${
      currentData.taxRate !== null
        ? `${currentData.taxRate}%`
        : '❌ non renseigné'
    }
- Montant de l'emprunt : ${
      currentData.loanAmount !== null && currentData.loanAmount !== undefined
        ? `${currentData.loanAmount.toLocaleString()} €`
        : 'achat comptant (optionnel)'
    }

${
  missingFields.length > 0
    ? `\n⚠️ Informations manquantes : ${missingFields.join(
        ', '
      )}\nPose des questions pour obtenir ces informations.`
    : "✅ Toutes les informations requises sont renseignées ! Tu peux indiquer à l'utilisateur que la simulation est prête."
}

Quand tu identifies des détails sur le bien dans la conversation, utilise l'outil update_simulation_data pour mettre à jour les valeurs.`;
  }

  /**
   * Convert ChatMessage[] to LangChain BaseMessage[]
   * Best practice: Use proper message types
   */
  private convertToLangChainMessages(
    messages: ChatMessage[],
    systemPrompt: string
  ): BaseMessage[] {
    const langchainMessages: BaseMessage[] = [new SystemMessage(systemPrompt)];

    for (const msg of messages) {
      if (msg.role === 'user') {
        langchainMessages.push(new HumanMessage(msg.content));
      } else if (msg.role === 'assistant') {
        langchainMessages.push(new AIMessage(msg.content));
      }
      // 'system' role is already added at the beginning
    }

    return langchainMessages;
  }

  /**
   * Chat with AI and extract simulation data updates
   * Best practice: Proper error handling, type-safe tool schema
   */
  async chat(
    messages: ChatMessage[],
    currentData: SimulationData
  ): Promise<{ message: string; updatedData: SimulationData }> {
    const systemPrompt = this.buildSystemPrompt(currentData);

    try {
      // Best practice: Bind tool to the model with detailed JSON schema
      const modelWithTool = this.model.bindTools([
        {
          name: 'update_simulation_data',
          description:
            'Extract and update LMNP property investment data from the user conversation. Call this tool EVERY TIME the user provides ANY information about their property (price, rent, expenses, duration, tax rate, etc.). Extract ALL mentioned values in a single call.',
          schema: {
            type: 'object',
            properties: {
              purchasePrice: {
                type: 'number',
                description:
                  'Prix d\'achat du bien immobilier en euros. Exemples: "200000 euros", "350 000€", "deux cent mille"',
              },
              monthlyRent: {
                type: 'number',
                description:
                  'Loyer mensuel en euros. Exemples: "800€ par mois", "850 euros/mois"',
              },
              annualExpenses: {
                type: 'number',
                description:
                  'Charges annuelles totales en euros (taxe foncière, assurance, entretien, etc.). Exemples: "1500€ par an", "2000 euros de charges"',
              },
              holdingPeriod: {
                type: 'integer',
                description:
                  'Durée de détention prévue en années. Exemples: "10 ans", "je vais le garder 15 ans", "pendant 20 ans"',
              },
              taxRate: {
                type: 'number',
                description:
                  'Taux marginal d\'imposition (TMI) en pourcentage. DOIT être 0, 11, 30, 41 ou 45. Exemples: "je suis imposé à 30%", "TMI de 41%"',
              },
              loanAmount: {
                type: 'number',
                description:
                  "Montant de l'emprunt en euros (optionnel, 0 si achat comptant)",
              },
              interestRate: {
                type: 'number',
                description:
                  "Taux d'intérêt du prêt en pourcentage (optionnel)",
              },
              loanDuration: {
                type: 'integer',
                description: 'Durée du prêt en années (optionnel)',
              },
            },
          },
        },
      ]);

      // Best practice: Convert to proper LangChain message types
      const langchainMessages = this.convertToLangChainMessages(
        messages,
        systemPrompt
      );

      // Invoke the model
      const response = await modelWithTool.invoke(langchainMessages);

      let updatedData = { ...currentData };

      // Check if the model called the tool
      if (response.tool_calls && response.tool_calls.length > 0) {
        const toolCall = response.tool_calls[0];

        try {
          // Validate with Zod
          const parsedArgs = UpdateSimulationSchema.parse(toolCall.args);

          // Merge with current data and validate complete object
          updatedData = SimulationDataSchema.parse({
            ...currentData,
            ...parsedArgs,
          });

          logger.info({
            msg: 'Simulation data updated via tool call',
            updatedFields: Object.keys(parsedArgs),
          });
        } catch (err) {
          logger.error({ msg: 'Invalid tool call arguments', err });
          throw new Error('Invalid tool call arguments', { cause: err });
        }
      }

      // Generate response message
      let responseMessage = response.content as string;

      // If no content, generate a helpful message based on missing fields
      if (!responseMessage || responseMessage.trim() === '') {
        const stillMissing: string[] = [];
        if (updatedData.purchasePrice === null)
          stillMissing.push("le prix d'achat");
        if (updatedData.monthlyRent === null)
          stillMissing.push('le loyer mensuel');
        if (updatedData.annualExpenses === null)
          stillMissing.push('les charges annuelles');
        if (updatedData.holdingPeriod === null)
          stillMissing.push('la durée de détention');
        if (updatedData.taxRate === null)
          stillMissing.push("votre taux d'imposition");

        if (stillMissing.length > 0) {
          responseMessage = `Parfait ! J'ai bien noté vos informations. Pour compléter la simulation, j'ai encore besoin de : ${stillMissing.join(
            ', '
          )}. Pouvez-vous me donner ces informations ?`;
        } else {
          responseMessage = `Excellent ! J'ai toutes les informations nécessaires. La simulation est maintenant complète !`;
        }
      }

      return {
        message: responseMessage,
        updatedData,
      };
    } catch (err) {
      logger.error({ msg: 'LangChain error', err });
      throw new Error('Error communicating with AI', { cause: err });
    }
  }
}
