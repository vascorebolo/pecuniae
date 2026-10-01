import { useState } from 'react';
import type { Category, TransactionType } from '../../shared';
import styles from './CategoryManager.module.scss';
import { Button } from '../Button/Button';

interface CategoryManagerProps {
  categories: Category[];
  onCategoriesChanged: () => Promise<void>;
}

export function CategoryManager({
  categories,
  onCategoriesChanged,
}: CategoryManagerProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [error, setError] = useState('');

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await window.pecuniae.createCategory({ name, type });
      setName('');
      await onCategoriesChanged();
    } catch (problem) {
      setError(
        problem instanceof Error
          ? problem.message
          : 'Could not create category.',
      );
    }
  };

  const remove = async (category: Category) => {
    setError('');
    try {
      await window.pecuniae.deleteCategory(category.id);
      await onCategoriesChanged();
    } catch (problem) {
      setError(
        problem instanceof Error
          ? problem.message
          : 'Could not delete category.',
      );
    }
  };

  return (
    <section className={styles.manager}>
      <Button
        className={styles.toggle}
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
      >
        <span>Manage categories</span>
        <span>{open ? '−' : '+'}</span>
      </Button>
      <div
        className={`${styles.transition} ${open ? styles.expanded : ''}`}
        aria-hidden={!open}
        inert={!open}
      >
        <div className={styles.transitionInner}>
          <div className={styles.content}>
            <form onSubmit={create}>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Category name"
                maxLength={60}
                required
              />
              <select
                value={type}
                onChange={(event) =>
                  setType(event.target.value as TransactionType)
                }
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
              <Button type="submit" variant="primary">
                Add category
              </Button>
            </form>
            {error && <p className={styles.error}>{error}</p>}
            <div className={styles.groups}>
              {(['expense', 'income'] as const).map((groupType) => (
                <div key={groupType}>
                  <h3>{groupType === 'expense' ? 'Expense' : 'Income'}</h3>
                  <ul>
                    {categories
                      .filter((category) => category.type === groupType)
                      .map((category) => (
                        <li key={category.id}>
                          <span>{category.name}</span>
                          <Button
                            variant="danger"
                            type="button"
                            onClick={() => void remove(category)}
                            aria-label={`Delete ${category.name}`}
                          >
                            Delete
                          </Button>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
