import { formatMoney } from '../../utils/format';
import styles from './SummaryCards.module.scss';
import { Icon } from '../Icon/Icon';

interface SummaryCardsProps {
  incomeCents: number;
  expenseCents: number;
  sharedExpenseCents: number;
}

export function SummaryCards({
  incomeCents,
  expenseCents,
  sharedExpenseCents,
}: SummaryCardsProps) {
  const balanceCents = incomeCents - expenseCents;
  return (
    <section className={styles.summary} aria-label="Monthly summary">
      <article>
        <span>
          <Icon name="income" />
          Income
        </span>
        <strong className={styles.positive}>+{formatMoney(incomeCents)}</strong>
      </article>
      <article>
        <span>
          <Icon name="expense" />
          Expenses
        </span>
        <strong className={styles.negative}>
          −{formatMoney(expenseCents)}
        </strong>
      </article>
      <article>
        <span>
          <Icon name="balance" />
          Shared expenses
        </span>
        <strong className={styles.negative}>
          −{formatMoney(sharedExpenseCents)}
        </strong>
      </article>
      <article>
        <span>
          <Icon name="balance" />
          Monthly balance
        </span>
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
