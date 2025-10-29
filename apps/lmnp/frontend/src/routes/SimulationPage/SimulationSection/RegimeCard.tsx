type RegimeCardProps = {
  title: string;
  description: string;
  grossIncome: number;
  deductions: number;
  deductionLabel: string;
  depreciation?: number;
  loanInterest?: number;
  taxableIncome: number;
  tax: number;
  taxRate: number | null;
  netIncome: number;
  deductionColor?: string;
};

function RegimeCard({
  title,
  description,
  grossIncome,
  deductions,
  deductionLabel,
  depreciation,
  loanInterest,
  taxableIncome,
  tax,
  taxRate,
  netIncome,
  deductionColor = 'text-green-600',
}: RegimeCardProps) {
  return (
    <div className="space-y-4 p-4 bg-background/50 rounded-lg">
      <div>
        <h3 className="text-xl font-bold">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Loyers perçus (annuel)</span>
          <span className="font-medium">{grossIncome.toLocaleString()} €</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">{deductionLabel}</span>
          <span className={`font-medium ${deductionColor}`}>
            −{deductions.toLocaleString()} €
          </span>
        </div>
        {depreciation !== undefined && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              − Amortissement du bien
            </span>
            <span className={`font-medium ${deductionColor}`}>
              −{depreciation.toLocaleString()} €
            </span>
          </div>
        )}
        {loanInterest !== undefined && loanInterest > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">− Intérêts d'emprunt</span>
            <span className={`font-medium ${deductionColor}`}>
              −{loanInterest.toLocaleString()} €
            </span>
          </div>
        )}
        <div className="flex justify-between text-sm pt-2 border-t">
          <span className="text-muted-foreground">
            = Sur quoi vous êtes imposé
          </span>
          <span className="font-medium">
            {taxableIncome.toLocaleString()} €
          </span>
        </div>
        <div className="flex justify-between pt-2 border-t">
          <span className="font-semibold">Impôt à payer ({taxRate}%)</span>
          <span className="font-semibold text-destructive">
            {tax.toLocaleString()} €/an
          </span>
        </div>
        <div className="flex justify-between bg-primary/5 p-2 rounded mt-2">
          <span className="font-bold">💰 Revenus nets après impôt</span>
          <span className="font-bold text-green-600">
            {netIncome.toLocaleString()} €/an
          </span>
        </div>
      </div>
    </div>
  );
}

export { RegimeCard };
