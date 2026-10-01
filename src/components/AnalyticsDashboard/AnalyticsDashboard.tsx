import { type MouseEvent, useEffect, useMemo, useState } from 'react';
import type { Analytics, TransactionType } from '../../shared';
import { formatMoney, formatMonth } from '../../utils/format';
import styles from './AnalyticsDashboard.module.scss';
import { Button } from '../Button/Button';

interface Props {
  month: string;
  dataVersion: number;
}

export function AnalyticsDashboard({ month, dataVersion }: Props) {
  const [open, setOpen] = useState(true);
  const [scope, setScope] = useState<'all' | 'month'>('month');
  const [analytics, setAnalytics] = useState<Analytics>();
  const [error, setError] = useState('');
  const [excluded, setExcluded] = useState<Set<number>>(() => new Set());
  const [showBreakdown, setShowBreakdown] = useState(false);

  useEffect(() => {
    let active = true;
    setError('');
    void window.pecuniae
      .getAnalytics(scope, month)
      .then((result) => {
        if (active) setAnalytics(result);
      })
      .catch(() => {
        if (active) setError('Could not load insights.');
      });
    return () => {
      active = false;
    };
  }, [scope, month, dataVersion]);

  const allRows = analytics?.categoryTotals ?? [];
  const groups = useMemo(
    () => ({
      expense: allRows.filter(
        (item) => item.type === 'expense' && !excluded.has(item.categoryId),
      ),
      income: allRows.filter(
        (item) => item.type === 'income' && !excluded.has(item.categoryId),
      ),
    }),
    [allRows, excluded],
  );
  const hiddenRows = allRows.filter((item) => excluded.has(item.categoryId));
  const exclude = (categoryId: number) =>
    setExcluded((current) => new Set(current).add(categoryId));
  const restore = (categoryId: number) =>
    setExcluded((current) => {
      const next = new Set(current);
      next.delete(categoryId);
      return next;
    });

  return (
    <section className={styles.dashboard}>
      <div className={styles.heading}>
        <div>
          <span>Overview</span>
          <strong>{scope === 'all' ? 'All time' : formatMonth(month)}</strong>
        </div>
        <div className={styles.controls}>
          {open && (
            <div className={styles.scope}>
              <Button
                className={scope === 'month' ? styles.active : ''}
                onClick={() => setScope('month')}
              >
                Month
              </Button>
              <Button
                className={scope === 'all' ? styles.active : ''}
                onClick={() => setScope('all')}
              >
                All time
              </Button>
            </div>
          )}
          <Button
            className={styles.collapse}
            type="button"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? 'Hide' : 'Show insights'}
          </Button>
        </div>
      </div>
      {open && (
        <div className={styles.content}>
          {error ? (
            <p className={styles.error}>{error}</p>
          ) : allRows.length === 0 ? (
            <p className={styles.empty}>No transactions in this period yet.</p>
          ) : (
            <>
              {hiddenRows.length > 0 && (
                <div className={styles.hiddenCategories}>
                  <span>Excluded:</span>
                  {hiddenRows.map((row) => (
                    <Button
                      key={row.categoryId}
                      type="button"
                      onClick={() => restore(row.categoryId)}
                    >
                      {row.categoryName} ×
                    </Button>
                  ))}
                  <Button type="button" onClick={() => setExcluded(new Set())}>
                    Restore all
                  </Button>
                </div>
              )}
              <p className={styles.hint}>
                Double-click a slice or legend item to exclude that category.
              </p>
              <div className={styles.pies}>
                <PieChart
                  title="Expense distribution"
                  rows={groups.expense}
                  onExclude={exclude}
                />
                <PieChart
                  title="Income distribution"
                  rows={groups.income}
                  onExclude={exclude}
                />
              </div>
              <Button
                className={styles.breakdownToggle}
                variant="surface"
                aria-expanded={showBreakdown}
                onClick={() => setShowBreakdown((visible) => !visible)}
              >
                {showBreakdown
                  ? 'Hide detailed breakdown'
                  : 'Show detailed breakdown'}
                <span aria-hidden="true">{showBreakdown ? '⌃' : '⌄'}</span>
              </Button>
              {showBreakdown && (
                <div className={styles.charts}>
                  <Chart
                    title="Expenses"
                    type="expense"
                    rows={groups.expense}
                  />
                  <Chart title="Income" type="income" rows={groups.income} />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}

const pieColors = [
  '#d66a5c',
  '#e59a55',
  '#d6b84c',
  '#69a781',
  '#5c91b8',
  '#8b78bd',
  '#bd70a0',
  '#8e9b72',
];

function PieChart({
  title,
  rows,
  onExclude,
}: {
  title: string;
  rows: Analytics['categoryTotals'];
  onExclude: (categoryId: number) => void;
}) {
  const total = rows.reduce((sum, row) => sum + row.amountCents, 0);
  let position = 0;
  const stops = rows.map((row, index) => {
    const start = position;
    position += total ? (row.amountCents / total) * 100 : 0;
    return `${pieColors[index % pieColors.length]} ${start}% ${position}%`;
  });
  const description = rows
    .map(
      (row) =>
        `${row.categoryName} ${Math.round((row.amountCents / total) * 100)}%`,
    )
    .join(', ');
  const excludeSlice = (event: MouseEvent<HTMLDivElement>) => {
    if (!rows.length || !total) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - (bounds.left + bounds.width / 2);
    const y = event.clientY - (bounds.top + bounds.height / 2);
    const angle = ((Math.atan2(x, -y) * 180) / Math.PI + 360) % 360;
    let cumulative = 0;
    const row = rows.find((item) => {
      cumulative += (item.amountCents / total) * 360;
      return angle <= cumulative;
    });
    if (row) onExclude(row.categoryId);
  };

  return (
    <div className={styles.pieCard}>
      <div
        className={styles.pie}
        role="img"
        aria-label={`${title}: ${description}`}
        title="Double-click a slice to exclude it"
        onDoubleClick={excludeSlice}
        style={{
          background: rows.length
            ? `conic-gradient(${stops.join(', ')})`
            : 'var(--surface-muted)',
        }}
      >
        {!rows.length && <span>No data</span>}
      </div>
      <div className={styles.pieDetails}>
        <strong>{title}</strong>
        {!rows.length ? (
          <span className={styles.noData}>No data</span>
        ) : (
          <ul>
            {rows.map((row, index) => (
              <li
                key={row.categoryId}
                onDoubleClick={() => onExclude(row.categoryId)}
                title="Double-click to exclude"
              >
                <i
                  style={{ background: pieColors[index % pieColors.length] }}
                />
                <span>{row.categoryName}</span>
                <b>{Math.round((row.amountCents / total) * 100)}%</b>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

interface ChartProps {
  title: string;
  type: TransactionType;
  rows: Analytics['categoryTotals'];
}
function Chart({ title, type, rows }: ChartProps) {
  const maximum = Math.max(...rows.map((row) => row.amountCents), 1);
  const total = rows.reduce((sum, row) => sum + row.amountCents, 0);
  return (
    <div className={styles.chart}>
      <div className={styles.chartTitle}>
        <span>{title}</span>
        <strong
          className={type === 'income' ? styles.positive : styles.negative}
        >
          {formatMoney(total)}
        </strong>
      </div>
      <div className={styles.bars}>
        {rows.map((row) => (
          <div className={styles.barRow} key={row.categoryId}>
            <div className={styles.label}>
              <span>{row.categoryName}</span>
              <span>{formatMoney(row.amountCents)}</span>
            </div>
            <div className={styles.track}>
              <span
                className={
                  type === 'income' ? styles.incomeBar : styles.expenseBar
                }
                style={{ width: `${(row.amountCents / maximum) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
