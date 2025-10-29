import { createRoute } from '@tanstack/react-router';
import { RootRoute } from '../__root';
import { ChatSection } from './ChatSection';
import { InformationSection } from './InformationSection';
import { SimulationSection } from './SimulationSection';

export const LmnpPageRoute = createRoute({
  getParentRoute: () => RootRoute,
  path: '/',
  component: ChatApp,
});

function ChatApp() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-foreground">
            Simulateur LMNP AI-First
          </h1>
          <p className="text-muted-foreground">
            Discutez avec l'IA pour simuler votre investissement
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ChatSection className="md:col-span-2" />
          <InformationSection className="md:col-span-1" />
          <SimulationSection className="col-span-full" />
        </div>
      </div>
    </div>
  );
}
