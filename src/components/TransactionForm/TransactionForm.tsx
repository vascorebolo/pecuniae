import { useEffect, useMemo, useState } from 'react';
import type { FormOptions, TransactionType } from '../../shared';
import { getToday } from '../../utils/format';
import styles from './TransactionForm.module.scss';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';

interface TransactionFormProps {
  options?: FormOptions;
  onSaved: () => Promise<void>;
  onCategoriesChanged: () => Promise<void>;
}

export function TransactionForm({
  options,
  onSaved,
  onCategoriesChanged,
}: TransactionFormProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(getToday());
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#1687F8');
  const categories = useMemo(
    () => options?.categories.filter((item) => item.type === type) ?? [],
    [options, type],
  );

  useEffect(() => setCategoryId(''), [type]);

  const createCategory = async () => {
    setError('');
    try {
      const category = await window.pecuniae.createCategory({
        name: newCategoryName,
        type,
        color: newCategoryColor,
      });
      await onCategoriesChanged();
      setCategoryId(String(category.id));
      setNewCategoryName('');
      setCreatingCategory(false);
    } catch (problem) {
      setError(
        problem instanceof Error
          ? problem.message
          : 'Could not create category.',
      );
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    const amountCents = Math.round(Number(amount.replace(',', '.')) * 100);
    if (!Number.isSafeInteger(amountCents) || amountCents <= 0) {
      setError('Enter a valid amount greater than zero.');
      return;
    }
    if (!categoryId || !options?.accounts[0]) {
      setError('Choose a category.');
      return;
    }
    setSaving(true);
    try {
      await window.pecuniae.addTransaction({
        accountId: options.accounts[0].id,
        categoryId: Number(categoryId),
        type,
        amountCents,
        description,
        transactionDate: date,
      });
      setAmount('');
      setDescription('');
      await onSaved();
    } catch (problem) {
      setError(
        problem instanceof Error
          ? problem.message
          : 'Could not save the transaction.',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className={styles.panel}>
      <h2>
        <Icon name="add" />
        Add transaction
      </h2>
      <div className={styles.segmented}>
        {(['expense', 'income'] as const).map((item) => (
          <Button
            key={item}
            type="button"
            className={type === item ? styles.active : ''}
            onClick={() => setType(item)}
          >
            {item[0].toUpperCase() + item.slice(1)}
          </Button>
        ))}
      </div>
      <form onSubmit={submit}>
        <label>
          Amount
          <div className={styles.amountField}>
            <span>€</span>
            <input
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              autoFocus
            />
          </div>
        </label>
        <label>
          Category
          <div className={styles.categoryField}>
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <Button
              variant="primary"
              type="button"
              onClick={() => setCreatingCategory((current) => !current)}
            >
              {creatingCategory ? 'Cancel' : 'New'}
            </Button>
          </div>
        </label>
        {creatingCategory && (
          <div className={styles.newCategory}>
            <input
              value={newCategoryName}
              onChange={(event) => setNewCategoryName(event.target.value)}
              placeholder={`New ${type} category`}
              maxLength={60}
              autoFocus
            />
            <input
              className={styles.colorPicker}
              type="color"
              value={newCategoryColor}
              onChange={(event) => setNewCategoryColor(event.target.value)}
              aria-label="Category color"
            />
            <Button
              type="button"
              onClick={() => void createCategory()}
              disabled={!newCategoryName.trim()}
            >
              Create
            </Button>
          </div>
        )}
        <label>
          Description <small>optional</small>
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={200}
            placeholder="What was this for?"
          />
        </label>
        <label>
          Date
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            required
          />
        </label>
        {error && <p className={styles.error}>{error}</p>}
        <Button
          variant="primary"
          className={styles.primary}
          type="submit"
          disabled={saving}
        >
          {saving ? 'Saving…' : `Add ${type}`}
        </Button>
      </form>
    </section>
  );
}
