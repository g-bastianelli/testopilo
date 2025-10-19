/**
 * AI Service using LangChain for LMNP conversation and data extraction
 */

import { logger } from '@testopilo/logger';
import {
  type ChatMessage,
  type SimulationData,
  SimulationDataSchema,
  UpdateSimulationSchema,
} from '@testopilo/lmnp-shared';
import { ChatXAI } from '@langchain/xai';

export class AiService {
  private model: ChatXAI;

  constructor() {
    this.model = new ChatXAI({
      model: 'grok-4-latest',
      temperature: 0.7,
      apiKey:
        'xai-UAcft8ryqlIXnO8ibilvhBV5K4ox2zltcJTmmPcOCk9jSH7IXvhIrSwHqdppXYpYSJRyKqKFpH55CPo4',
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
- Pose des questions de suivi pour extraire les données manquantes
- Si l'utilisateur donne plusieurs informations d'un coup, extrais-les toutes

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
   * Chat with AI and extract simulation data updates
   */
  async chat(
    messages: ChatMessage[],
    currentData: SimulationData
  ): Promise<{ message: string; updatedData: SimulationData }> {
    const systemPrompt = this.buildSystemPrompt(currentData);

    try {
      // Bind tool to the model
      const modelWithTool = this.model.bindTools([
        {
          name: 'update_simulation_data',
          description:
            'Update LMNP simulation data based on information extracted from the conversation',
          schema: UpdateSimulationSchema,
        },
      ]);

      // Create messages for LangChain
      const chatMessages = [
        ['system', systemPrompt] as [string, string],
        ...messages.map((m) => [m.role, m.content] as [string, string]),
      ];

      // Invoke the model
      const response = await modelWithTool.invoke(chatMessages);

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
        }
      }

      return {
        message: (response.content as string) || "Sorry, I didn't understand.",
        updatedData,
      };
    } catch (err) {
      logger.error({ msg: 'LangChain error', err });
      throw new Error('Error communicating with AI', { cause: err });
    }
  }
}
