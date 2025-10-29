import { cn } from '@testopilo/ui';

type SavingsSummaryProps = {
  annualSavings: number;
  totalSavings: number;
  holdingPeriod: number | null;
};

function SavingsSummary({
  annualSavings,
  totalSavings,
  holdingPeriod,
}: SavingsSummaryProps) {
  if (annualSavings === 0) return null;

  const isPositive = annualSavings > 0;
  const regimeName = isPositive ? 'Régime Réel' : 'Micro-BIC';

  return (
    <div
      className={cn(
        'mt-6 p-4 rounded-lg border',
        isPositive
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
          : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      )}
    >
      <div className="flex justify-between items-center">
        <span className="text-lg font-semibold">
          Économie avec le {regimeName}
        </span>
        <span
          className={cn(
            'text-2xl font-bold',
            isPositive ? 'text-green-600' : 'text-blue-600'
          )}
        >
          {Math.abs(annualSavings).toLocaleString()} €/an
        </span>
      </div>
      <div className="flex justify-between items-center mt-2">
        <span className="text-muted-foreground">
          Économie totale sur {holdingPeriod} ans
        </span>
        <span
          className={cn(
            'text-xl font-bold',
            isPositive ? 'text-green-600' : 'text-blue-600'
          )}
        >
          {Math.abs(totalSavings).toLocaleString()} €
        </span>
      </div>
    </div>
  );
}

export { SavingsSummary };
