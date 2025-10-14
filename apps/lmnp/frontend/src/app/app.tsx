import { useState } from 'react';
import { Button, Card, CardContent, Input } from '@testopilo/ui';
import { RotateCcw, Send } from 'lucide-react';

export function App() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content:
        "Bonjour ! Je vais vous aider à simuler votre investissement en Location Meublée Non Professionnelle (LMNP). Pour commencer, parlez-moi de votre projet : quel bien envisagez-vous d'acheter ?",
    },
  ]);

  const handleSend = () => {
    if (!message.trim()) return;

    setMessages([...messages, { role: 'user', content: message }]);
    setMessage('');
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
                className="text-primary-foreground hover:bg-primary/90"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
            </div>

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
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
              >
                <Send className="h-5 w-5" />
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
                <span className="text-lg font-medium text-muted-foreground">
                  —
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-lg">Loyer mensuel</span>
                <span className="text-lg font-medium text-muted-foreground">
                  —
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-lg">Charges mensuelles</span>
                <span className="text-lg font-medium text-muted-foreground">
                  —
                </span>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <span className="text-lg">Durée</span>
                <span className="text-lg font-medium text-muted-foreground">
                  —
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;
