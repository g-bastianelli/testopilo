import { Card, CardContent, cn } from '@testopilo/ui';
import { useSimulation, useSimulationData } from '../../../services/api';
import { Recommendation } from './Recommendation';
import { RegimeCard } from './RegimeCard';
import { SavingsSummary } from './SavingsSummary';

type SimulationSectionProps = {
  className?: string;
};

function SimulationSection({ className }: SimulationSectionProps) {
  const { data: simulationData } = useSimulationData();
  const { data: simulation } = useSimulation();
  if (!simulation) return null;

  return (
    <Card className={cn(className, 'bg-primary/5 border-primary')}>
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-6">Résultats de la simulation</h2>

        <Recommendation
          recommendedRegime={simulation.recommendedRegime}
          recommendation={simulation.recommendation}
        />

        <div className="grid md:grid-cols-2 gap-6">
          <RegimeCard
            title="Micro-BIC"
            description="Régime simplifié : 50% de déduction forfaitaire"
            deductionLabel="− Abattement automatique 50%"
            deductionColor="text-green-600"
            taxRate={simulationData.taxRate}
            {...simulation.microBic}
          />

          <RegimeCard
            title="Régime Réel"
            description="Déduction des charges réelles + amortissement"
            deductionLabel="− Charges réelles"
            deductionColor="text-orange-600"
            taxRate={simulationData.taxRate}
            {...simulation.realRegime}
          />
        </div>

        <SavingsSummary
          annualSavings={simulation.annualSavings}
          totalSavings={simulation.totalSavings}
          holdingPeriod={simulationData.holdingPeriod}
        />
      </CardContent>
    </Card>
  );
}

export { SimulationSection };
