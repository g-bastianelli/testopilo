import { Card, CardContent } from '@testopilo/ui';
import { useSimulationData } from '../../../services/api';
import { InformationRow } from './InformationRow';

type InformationSectionProps = {
  className?: string;
};

function InformationSection({ className }: InformationSectionProps) {
  const { data: simulationData } = useSimulationData();
  return (
    <Card className={className}>
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-6">Vos informations</h2>

        <div className="space-y-4">
          <InformationRow
            label="Prix d'achat"
            value={simulationData.purchasePrice}
          />
          <InformationRow
            label="Loyer mensuel"
            value={simulationData.monthlyRent}
          />
          <InformationRow
            label="Charges annuelles"
            value={simulationData.annualExpenses}
          />
          <InformationRow
            label="Durée de détention"
            value={simulationData.holdingPeriod}
            format="period"
          />
          <InformationRow
            label="Taux d'imposition (TMI)"
            value={simulationData.taxRate}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export { InformationSection };
