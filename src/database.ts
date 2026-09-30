import Database from 'better-sqlite3';
import type {
  Account,
  Analytics,
  Category,
  CreateCategoryInput,
  CreateTransactionInput,
  Dashboard,
  FormOptions,
  Transaction,
  UpdateTransactionInput,
} from './shared';

const migrations = [
  `CREATE TABLE accounts (
      id INTEGER PRIMARY KEY, name TEXT NOT NULL UNIQUE,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE categories (
      id INTEGER PRIMARY KEY, name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(name, type)
    );
    CREATE TABLE transactions (
      id INTEGER PRIMARY KEY,
      account_id INTEGER NOT NULL REFERENCES accounts(id),
      category_id INTEGER NOT NULL REFERENCES categories(id),
      type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
      amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
      description TEXT NOT NULL DEFAULT '', transaction_date TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX transactions_date_idx ON transactions(transaction_date DESC);`,
  `INSERT OR IGNORE INTO accounts (name) VALUES ('Main account');
    INSERT OR IGNORE INTO categories (name, type) VALUES
      ('Salary', 'income'), ('Freelance', 'income'), ('Interest', 'income'),
      ('Other income', 'income'), ('Housing', 'expense'), ('Groceries', 'expense'),
      ('Transport', 'expense'), ('Utilities', 'expense'), ('Dining', 'expense'),
      ('Health', 'expense'), ('Entertainment', 'expense'), ('Other expense', 'expense');`,
];

interface TransactionRow {
  id: number;
  account_id: number;
  account_name: string;
  category_id: number;
  category_name: string;
  type: 'income' | 'expense';
  amount_cents: number;
  description: string;
  transaction_date: string;
}

const mapTransaction = (row: TransactionRow): Transaction => ({
  id: row.id,
  accountId: row.account_id,
  accountName: row.account_name,
  categoryId: row.category_id,
  categoryName: row.category_name,
  type: row.type,
  amountCents: row.amount_cents,
  description: row.description,
  transactionDate: row.transaction_date,
});

const transactionSelect = `SELECT t.id, t.account_id, a.name AS account_name,
  t.category_id, c.name AS category_name, t.type, t.amount_cents,
  t.description, t.transaction_date FROM transactions t
  JOIN accounts a ON a.id = t.account_id JOIN categories c ON c.id = t.category_id`;

export class DatabaseService {
  private readonly db: Database.Database;

  constructor(filename: string) {
    this.db = new Database(filename);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    this.migrate();
  }

  private migrate() {
    const currentVersion = this.db.pragma('user_version', {
      simple: true,
    }) as number;
    migrations.slice(currentVersion).forEach((migration, index) => {
      const version = currentVersion + index + 1;
      this.db.transaction(() => {
        this.db.exec(migration);
        this.db.pragma(`user_version = ${version}`);
      })();
    });
  }

  getFormOptions(): FormOptions {
    const accounts = this.db
      .prepare('SELECT id, name FROM accounts ORDER BY name')
      .all() as Account[];
    const categories = this.db
      .prepare('SELECT id, name, type FROM categories ORDER BY type DESC, name')
      .all() as Category[];
    return { accounts, categories };
  }

  createCategory(input: CreateCategoryInput): Category {
    const name = input.name.trim().replace(/\s+/g, ' ').slice(0, 60);
    if (!name) throw new Error('Category name is required.');
    if (input.type !== 'income' && input.type !== 'expense') {
      throw new Error('Category type is invalid.');
    }
    try {
      const result = this.db
        .prepare('INSERT INTO categories (name, type) VALUES (?, ?)')
        .run(name, input.type);
      return this.db
        .prepare('SELECT id, name, type FROM categories WHERE id = ?')
        .get(result.lastInsertRowid) as Category;
    } catch (error) {
      if (error instanceof Error && error.message.includes('UNIQUE')) {
        throw new Error('That category already exists.');
      }
      throw error;
    }
  }

  deleteCategory(id: number): void {
    if (!Number.isSafeInteger(id)) throw new Error('Category is invalid.');
    const usage = this.db
      .prepare(
        'SELECT COUNT(*) AS count FROM transactions WHERE category_id = ?',
      )
      .get(id) as { count: number };
    if (usage.count > 0) {
      throw new Error('Categories used by transactions cannot be deleted.');
    }
    const result = this.db
      .prepare('DELETE FROM categories WHERE id = ?')
      .run(id);
    if (!result.changes) throw new Error('Category not found.');
  }

  addTransaction(input: CreateTransactionInput): Transaction {
    this.validateTransaction(input);
    const result = this.db
      .prepare(`INSERT INTO transactions
      (account_id, category_id, type, amount_cents, description, transaction_date)
      VALUES (?, ?, ?, ?, ?, ?)`)
      .run(
        input.accountId,
        input.categoryId,
        input.type,
        input.amountCents,
        input.description.trim().slice(0, 200),
        input.transactionDate,
      );
    return this.getTransaction(Number(result.lastInsertRowid));
  }

  updateTransaction(input: UpdateTransactionInput): Transaction {
    if (!Number.isSafeInteger(input.id))
      throw new Error('Transaction is invalid.');
    this.validateTransaction(input);
    const result = this.db
      .prepare(`UPDATE transactions SET account_id = ?, category_id = ?, type = ?,
        amount_cents = ?, description = ?, transaction_date = ? WHERE id = ?`)
      .run(
        input.accountId,
        input.categoryId,
        input.type,
        input.amountCents,
        input.description.trim().slice(0, 200),
        input.transactionDate,
        input.id,
      );
    if (!result.changes) throw new Error('Transaction not found.');
    return this.getTransaction(input.id);
  }

  deleteTransaction(id: number): void {
    if (!Number.isSafeInteger(id)) throw new Error('Transaction is invalid.');
    const result = this.db
      .prepare('DELETE FROM transactions WHERE id = ?')
      .run(id);
    if (!result.changes) throw new Error('Transaction not found.');
  }

  private validateTransaction(input: CreateTransactionInput): void {
    if (!Number.isSafeInteger(input.amountCents) || input.amountCents <= 0) {
      throw new Error('Amount must be a positive number of cents.');
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.transactionDate))
      throw new Error('Transaction date is invalid.');
    const category = this.db
      .prepare('SELECT type FROM categories WHERE id = ?')
      .get(input.categoryId) as { type: string } | undefined;
    if (!category || category.type !== input.type)
      throw new Error('The category does not match the transaction type.');
    if (
      !this.db
        .prepare('SELECT id FROM accounts WHERE id = ?')
        .get(input.accountId)
    )
      throw new Error('Account not found.');
  }

  private getTransaction(id: number): Transaction {
    const row = this.db
      .prepare(`${transactionSelect} WHERE t.id = ?`)
      .get(id) as TransactionRow | undefined;
    if (!row) throw new Error('Transaction not found.');
    return mapTransaction(row);
  }

  getDashboard(month?: string): Dashboard {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const selectedMonth =
      month && /^\d{4}-(0[1-9]|1[0-2])$/.test(month) ? month : currentMonth;
    const [year, monthNumber] = selectedMonth.split('-').map(Number);
    const monthStart = `${selectedMonth}-01`;
    const nextMonth = new Date(year, monthNumber, 1);
    const monthEnd = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`;
    const totals = this.db
      .prepare(`SELECT
      COALESCE(SUM(CASE WHEN type = 'income' THEN amount_cents ELSE -amount_cents END), 0) AS balance,
      COALESCE(SUM(CASE WHEN type = 'income' AND transaction_date >= ? AND transaction_date < ? THEN amount_cents ELSE 0 END), 0) AS month_income,
      COALESCE(SUM(CASE WHEN type = 'expense' AND transaction_date >= ? AND transaction_date < ? THEN amount_cents ELSE 0 END), 0) AS month_expense
      FROM transactions`)
      .get(monthStart, monthEnd, monthStart, monthEnd) as {
      balance: number;
      month_income: number;
      month_expense: number;
    };
    const rows = this.db
      .prepare(
        `${transactionSelect} WHERE t.transaction_date >= ? AND t.transaction_date < ?
         ORDER BY t.transaction_date DESC, t.id DESC LIMIT 100`,
      )
      .all(monthStart, monthEnd) as TransactionRow[];
    return {
      month: selectedMonth,
      balanceCents: totals.balance,
      monthIncomeCents: totals.month_income,
      monthExpenseCents: totals.month_expense,
      recentTransactions: rows.map(mapTransaction),
    };
  }

  getAnalytics(scope: 'all' | 'month', month: string): Analytics {
    if (scope !== 'all' && scope !== 'month')
      throw new Error('Analytics scope is invalid.');
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))
      throw new Error('Analytics month is invalid.');
    const [year, monthNumber] = month.split('-').map(Number);
    const monthStart = `${month}-01`;
    const nextMonth = new Date(year, monthNumber, 1);
    const monthEnd = `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}-01`;
    const where =
      scope === 'month'
        ? 'WHERE t.transaction_date >= ? AND t.transaction_date < ?'
        : '';
    const parameters = scope === 'month' ? [monthStart, monthEnd] : [];
    const rows = this.db
      .prepare(`SELECT c.id AS categoryId, c.name AS categoryName, t.type,
        SUM(t.amount_cents) AS amountCents FROM transactions t
        JOIN categories c ON c.id = t.category_id ${where}
        GROUP BY c.id, c.name, t.type ORDER BY amountCents DESC`)
      .all(...parameters) as Analytics['categoryTotals'];
    return {
      incomeCents: rows
        .filter((row) => row.type === 'income')
        .reduce((sum, row) => sum + row.amountCents, 0),
      expenseCents: rows
        .filter((row) => row.type === 'expense')
        .reduce((sum, row) => sum + row.amountCents, 0),
      categoryTotals: rows,
    };
  }

  close() {
    this.db.close();
  }
}
