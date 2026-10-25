import { stockLabel } from '../../lib/format';

const styles = {
  out: 'bg-ink/80 text-white',
  low: 'bg-warn/15 text-warn ring-1 ring-warn/30',
  ok: 'bg-ok/10 text-ok ring-1 ring-ok/25',
};

export function StockBadge({ quantity }: { quantity: number }) {
  const { text, level } = stockLabel(quantity);
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${styles[level]}`}>{text}</span>;
}
