import { formatMoney } from '../../utils/format';
import styles from './SummaryCards.module.scss';

interface SummaryCardsProps {
  incomeCents: number;
  expenseCents: number;
}

export function SummaryCards({ incomeCents, expenseCents }: SummaryCardsProps) {
  const balanceCents = incomeCents - expenseCents;
  return (
    <section className={styles.summary} aria-label="Monthly summary">
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
      <article>
        <span>Monthly balance</span>
        <strong
          className={balanceCents >= 0 ? styles.positive : styles.negative}
        >
          {balanceCents > 0 ? '+' : ''}
          {formatMoney(balanceCents)}
        </strong>
      </article>
    </section>
  );
}
