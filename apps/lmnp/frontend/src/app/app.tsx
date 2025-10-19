import { useState, useEffect } from 'react';
import { Button, Card, CardContent, Input } from '@testopilo/ui';
import { RotateCcw, Send, Loader2 } from 'lucide-react';
import type {
  ChatMessage,
  SimulationData,
  RegimeComparison,
} from '@testopilo/lmnp-shared';
import { getDefaultSimulationData, isSimulationDataComplete } from '@testopilo/lmnp-shared';
import { sendChatMessage, getSimulation } from '../services/api';

export function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        "Bonjour ! Je vais vous aider à simuler votre investissement en Location Meublée Non Professionnelle (LMNP). Pour commencer, parlez-moi de votre projet : quel bien envisagez-vous d'acheter ?",
    },
  ]);
  const [simulationData, setSimulationData] = useState<SimulationData>(
    getDefaultSimulationData()
  );
  const [simulation, setSimulation] = useState<RegimeComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-fetch simulation when data is complete
  useEffect(() => {
    if (isSimulationDataComplete(simulationData)) {
      fetchSimulation();
    } else {
      setSimulation(null);
    }
  }, [simulationData]);

  const fetchSimulation = async () => {
    try {
      const result = await getSimulation(simulationData);
      setSimulation(result);
    } catch (err) {
      console.error('Simulation error:', err);
    }
  };

  const handleSend = async () => {
    if (!message.trim() || loading) return;

    const userMessage: ChatMessage = { role: 'user', content: message };
    setMessages((prev) => [...prev, userMessage]);
    setMessage('');
    setLoading(true);
    setError(null);

    try {
      const response = await sendChatMessage(
        [...messages, userMessage],
        simulationData
      );

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.message },
      ]);
      setSimulationData(response.updatedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: 'assistant',
        content:
          "Bonjour ! Je vais vous aider à simuler votre investissement en Location Meublée Non Professionnelle (LMNP). Pour commencer, parlez-moi de votre projet : quel bien envisagez-vous d'acheter ?",
      },
    ]);
    setSimulationData(getDefaultSimulationData());
    setSimulation(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            Simulateur LMNP AI-First
          </h1>
          <p className="text-muted-foreground">
            Discutez avec l'IA pour simuler votre investissement
          </p>
        </div>

        {/* Chat Section */}
        <Card className="bg-primary">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-primary-foreground">
                Assistant LMNP
              </h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleReset}
                className="text-primary-foreground hover:bg-primary/90"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
            </div>

            {error && (
              <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-lg mb-4">
                {error}
              </div>
            )}

            <div className="bg-background rounded-lg p-4 min-h-[200px] mb-4 max-h-[400px] overflow-y-auto">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-4 ${
                    msg.role === 'user' ? 'text-right' : 'text-left'
                  }`}
                >
                  <div
                    className={`inline-block px-4 py-2 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Tapez votre message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-background"
              />
              <Button
                onClick={handleSend}
                disabled={loading}
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Information Section */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-6">Vos informations</h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-lg">Prix d'achat</span>
                <span
                  className={`text-lg font-medium ${
                    simulationData.purchasePrice !== null
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {simulationData.purchasePrice !== null
                    ? `${simulationData.purchasePrice.toLocaleString()} €`
                    : '—'}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-lg">Loyer mensuel</span>
                <span
                  className={`text-lg font-medium ${
                    simulationData.monthlyRent !== null
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {simulationData.monthlyRent !== null
                    ? `${simulationData.monthlyRent.toLocaleString()} €`
                    : '—'}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-lg">Charges annuelles</span>
                <span
                  className={`text-lg font-medium ${
                    simulationData.annualExpenses !== null
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {simulationData.annualExpenses !== null
                    ? `${simulationData.annualExpenses.toLocaleString()} €`
                    : '—'}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-lg">Durée de détention</span>
                <span
                  className={`text-lg font-medium ${
                    simulationData.holdingPeriod !== null
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {simulationData.holdingPeriod !== null
                    ? `${simulationData.holdingPeriod} ans`
                    : '—'}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-lg">Taux d'imposition (TMI)</span>
                <span
                  className={`text-lg font-medium ${
                    simulationData.taxRate !== null
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  {simulationData.taxRate !== null
                    ? `${simulationData.taxRate}%`
                    : '—'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Simulation Results */}
        {simulation && (
          <Card className="bg-primary/5 border-primary">
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">Résultats de la simulation</h2>

              <div className="mb-6 p-4 bg-primary/10 rounded-lg">
                <p className="text-lg font-semibold text-primary mb-2">
                  Recommandation : {simulation.recommendedRegime}
                </p>
                <p className="text-muted-foreground">{simulation.recommendation}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Micro-BIC */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Micro-BIC</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Revenus locatifs</span>
                      <span className="font-medium">
                        {simulation.microBic.grossIncome.toLocaleString()} €
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Abattement (50%)</span>
                      <span className="font-medium text-green-600">
                        -{simulation.microBic.deductions.toLocaleString()} €
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Revenu imposable</span>
                      <span className="font-medium">
                        {simulation.microBic.taxableIncome.toLocaleString()} €
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-semibold">Impôt</span>
                      <span className="font-semibold text-destructive">
                        {simulation.microBic.tax.toLocaleString()} €
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Revenu net</span>
                      <span className="font-semibold text-green-600">
                        {simulation.microBic.netIncome.toLocaleString()} €
                      </span>
                    </div>
                  </div>
                </div>

                {/* Régime Réel */}
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Régime Réel</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Revenus locatifs</span>
                      <span className="font-medium">
                        {simulation.realRegime.grossIncome.toLocaleString()} €
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Charges</span>
                      <span className="font-medium text-orange-600">
                        -{simulation.realRegime.deductions.toLocaleString()} €
                      </span>
                    </div>
                    {simulation.realRegime.depreciation && (
                      <div className="flex justify-between">
                        <span>Amortissement</span>
                        <span className="font-medium text-orange-600">
                          -{simulation.realRegime.depreciation.toLocaleString()} €
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Revenu imposable</span>
                      <span className="font-medium">
                        {simulation.realRegime.taxableIncome.toLocaleString()} €
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="font-semibold">Impôt</span>
                      <span className="font-semibold text-destructive">
                        {simulation.realRegime.tax.toLocaleString()} €
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Revenu net</span>
                      <span className="font-semibold text-green-600">
                        {simulation.realRegime.netIncome.toLocaleString()} €
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Savings Summary */}
              {simulation.annualSavings !== 0 && (
                <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">
                      Économie annuelle
                    </span>
                    <span className="text-2xl font-bold text-green-600">
                      {Math.abs(simulation.annualSavings).toLocaleString()} €
                    </span>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-muted-foreground">
                      Économie totale sur {simulationData.holdingPeriod} ans
                    </span>
                    <span className="text-xl font-bold text-green-600">
                      {Math.abs(simulation.totalSavings).toLocaleString()} €
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default App;
