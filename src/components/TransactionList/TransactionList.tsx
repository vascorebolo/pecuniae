import { useState } from 'react';
import type { Category, Transaction, TransactionType } from '../../shared';
import { formatMoney, formatMonth } from '../../utils/format';
import styles from './TransactionList.module.scss';
import { Button } from '../Button/Button';

interface Props {
  transactions: Transaction[];
  categories: Category[];
  month: string;
  onTransactionsChanged: () => Promise<void>;
}
interface EditState {
  id: number;
  type: TransactionType;
  amount: string;
  categoryId: string;
  description: string;
  transactionDate: string;
  accountId: number;
}

export function TransactionList({
  transactions,
  categories,
  month,
  onTransactionsChanged,
}: Props) {
  const [edit, setEdit] = useState<EditState>();
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const startEditing = (item: Transaction) => {
    setError('');
    setEdit({
      id: item.id,
      type: item.type,
      amount: (item.amountCents / 100).toFixed(2),
      categoryId: String(item.categoryId),
      description: item.description,
      transactionDate: item.transactionDate,
      accountId: item.accountId,
    });
  };

  const save = async () => {
    if (!edit) return;
    const amountCents = Math.round(Number(edit.amount.replace(',', '.')) * 100);
    if (!Number.isSafeInteger(amountCents) || amountCents <= 0)
      return setError('Enter a valid amount greater than zero.');
    setSaving(true);
    setError('');
    try {
      await window.pecuniae.updateTransaction({
        id: edit.id,
        accountId: edit.accountId,
        categoryId: Number(edit.categoryId),
        type: edit.type,
        amountCents,
        description: edit.description,
        transactionDate: edit.transactionDate,
      });
      setEdit(undefined);
      await onTransactionsChanged();
    } catch (problem) {
      setError(
        problem instanceof Error
          ? problem.message
          : 'Could not update transaction.',
      );
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item: Transaction) => {
    if (!window.confirm(`Delete “${item.description || item.categoryName}”?`))
      return;
    setError('');
    try {
      await window.pecuniae.deleteTransaction(item.id);
      await onTransactionsChanged();
    } catch (problem) {
      setError(
        problem instanceof Error
          ? problem.message
          : 'Could not delete transaction.',
      );
    }
  };

  return (
    <section className={styles.panel}>
      <h2>Transactions · {formatMonth(month)}</h2>
      {error && <p className={styles.error}>{error}</p>}
      {!transactions.length ? (
        <div className={styles.empty}>
          <span>◎</span>
          <p>No transactions yet.</p>
          <small>Add your first one to get started.</small>
        </div>
      ) : (
        <ul>
          {transactions.map((item) =>
            edit?.id === item.id ? (
              <li className={styles.editRow} key={item.id}>
                <div className={styles.editGrid}>
                  <select
                    value={edit.type}
                    onChange={(event) =>
                      setEdit({
                        ...edit,
                        type: event.target.value as TransactionType,
                        categoryId: '',
                      })
                    }
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                  <input
                    className={styles.amount}
                    value={edit.amount}
                    onChange={(event) =>
                      setEdit({ ...edit, amount: event.target.value })
                    }
                    inputMode="decimal"
                    aria-label="Amount"
                  />
                  <select
                    value={edit.categoryId}
                    onChange={(event) =>
                      setEdit({ ...edit, categoryId: event.target.value })
                    }
                    aria-label="Category"
                  >
                    <option value="">Category</option>
                    {categories
                      .filter((category) => category.type === edit.type)
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                  <input
                    value={edit.description}
                    onChange={(event) =>
                      setEdit({ ...edit, description: event.target.value })
                    }
                    placeholder="Description"
                    maxLength={200}
                  />
                  <input
                    type="date"
                    value={edit.transactionDate}
                    onChange={(event) =>
                      setEdit({ ...edit, transactionDate: event.target.value })
                    }
                  />
                </div>
                <div className={styles.editActions}>
                  <Button type="button" onClick={() => setEdit(undefined)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    className={styles.save}
                    type="button"
                    onClick={() => void save()}
                    disabled={saving || !edit.categoryId}
                  >
                    {saving ? 'Saving…' : 'Save'}
                  </Button>
                </div>
              </li>
            ) : (
              <li className={styles.transactionRow} key={item.id}>
                <div className={styles.details}>
                  <strong>{item.description || item.categoryName}</strong>
                  <span>
                    {item.categoryName} · {item.transactionDate}
                  </span>
                </div>
                <div className={styles.rowEnd}>
                  <strong
                    className={
                      item.type === 'income' ? styles.positive : styles.negative
                    }
                  >
                    {item.type === 'income' ? '+' : '−'}
                    {formatMoney(item.amountCents)}
                  </strong>
                  <div className={styles.rowActions}>
                    <Button type="button" onClick={() => startEditing(item)}>
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      className={styles.delete}
                      type="button"
                      onClick={() => void remove(item)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
    </section>
  );
}
