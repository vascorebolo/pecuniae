import { formatMoney } from '../../utils/format';
import styles from './SummaryCards.module.scss';

interface SummaryCardsProps {
  incomeCents: number;
  expenseCents: number;
}

export function SummaryCards({ incomeCents, expenseCents }: SummaryCardsProps) {
  return (
    <section className={styles.summary} aria-label="Current month summary">
      <article>
        <span>Income</span>
        <strong className={styles.positive}>+{formatMoney(incomeCents)}</strong>
      </article>
      <article>
        <span>Expenses</span>
        <strong className={styles.negative}>
          −{formatMoney(expenseCents)}
        </strong>
      </article>
    </section>
  );
}
