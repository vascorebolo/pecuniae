import { useState } from 'react';
import type { Category, TransactionType } from '../../shared';
import styles from './CategoryManager.module.scss';
import { Button } from '../Button/Button';
import { Icon } from '../Icon/Icon';

interface CategoryManagerProps {
  categories: Category[];
  onCategoriesChanged: () => Promise<void>;
}
interface CategoryEdit {
  id: number;
  name: string;
  type: TransactionType;
  color: string;
}

export function CategoryManager({
  categories,
  onCategoriesChanged,
}: CategoryManagerProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [color, setColor] = useState('#1687F8');
  const [error, setError] = useState('');
  const [edit, setEdit] = useState<CategoryEdit>();

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    try {
      await window.pecuniae.createCategory({ name, type, color });
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

  const saveEdit = async () => {
    if (!edit) return;
    setError('');
    try {
      await window.pecuniae.updateCategory(edit);
      setEdit(undefined);
      await onCategoriesChanged();
    } catch (problem) {
      setError(
        problem instanceof Error
          ? problem.message
          : 'Could not update category.',
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
        <span className={styles.title}>
          <Icon name="categories" />
          Manage categories
        </span>
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
              <input
                className={styles.colorPicker}
                type="color"
                value={color}
                onChange={(event) => setColor(event.target.value)}
                aria-label="Category color"
              />
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
                      .map((category) =>
                        edit?.id === category.id ? (
                          <li className={styles.editRow} key={category.id}>
                            <input
                              value={edit.name}
                              onChange={(event) =>
                                setEdit({ ...edit, name: event.target.value })
                              }
                              maxLength={60}
                              aria-label="Category name"
                            />
                            <select
                              value={edit.type}
                              onChange={(event) =>
                                setEdit({
                                  ...edit,
                                  type: event.target.value as TransactionType,
                                })
                              }
                              aria-label="Category type"
                            >
                              <option value="expense">Expense</option>
                              <option value="income">Income</option>
                            </select>
                            <input
                              className={styles.colorPicker}
                              type="color"
                              value={edit.color}
                              onChange={(event) =>
                                setEdit({ ...edit, color: event.target.value })
                              }
                              aria-label="Category color"
                            />
                            <div className={styles.editActions}>
                              <Button onClick={() => setEdit(undefined)}>
                                Cancel
                              </Button>
                              <Button
                                variant="primary"
                                onClick={() => void saveEdit()}
                                disabled={!edit.name.trim()}
                              >
                                Save
                              </Button>
                            </div>
                          </li>
                        ) : (
                          <li key={category.id}>
                            <span className={styles.categoryName}>
                              <i style={{ background: category.color }} />
                              {category.name}
                            </span>
                            <div className={styles.rowActions}>
                              <Button
                                type="button"
                                onClick={() => setEdit({ ...category })}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="danger"
                                type="button"
                                onClick={() => void remove(category)}
                                aria-label={`Delete ${category.name}`}
                              >
                                Delete
                              </Button>
                            </div>
                          </li>
                        ),
                      )}
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
