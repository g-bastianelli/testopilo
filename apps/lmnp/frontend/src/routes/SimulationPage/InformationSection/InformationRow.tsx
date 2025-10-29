import { cn } from '@testopilo/ui';

type Format = 'currency' | 'percentage' | 'period';

type InformationRowProps = {
  label: string;
  value: number | null;
  format?: Format;
};

function formatValue(value: number | null, format: Format) {
  if (value === null) return '—';
  switch (format) {
    case 'currency':
      return `${value.toLocaleString()} €`;
    case 'percentage':
      return `${value}%`;
    case 'period':
      return `${value} ans`;
  }
}

export function InformationRow({
  label,
  value,
  format = 'currency',
}: InformationRowProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b">
      <span className="text-lg">{label}</span>
      <span
        className={cn(
          'text-lg font-medium',
          value !== null ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        {formatValue(value, format)}
      </span>
    </div>
  );
}
