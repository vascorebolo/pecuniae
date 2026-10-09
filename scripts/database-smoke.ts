import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseService } from '../src/database';

const directory = mkdtempSync(join(tmpdir(), 'pecuniae-test-'));
const filename = join(directory, 'persistence.sqlite3');

try {
  const first = new DatabaseService(filename);
  const options = first.getFormOptions();
  assert.equal(options.accounts.length, 1);
  assert.ok(options.categories.length >= 10);
  let category = first.createCategory({
    name: 'Side project',
    type: 'income',
    color: '#4C8BF5',
  });
  assert.match(category.color, /^#[0-9A-F]{6}$/i);
  category = first.updateCategory({
    ...category,
    name: 'Side projects',
    color: '#123ABC',
  });
  assert.equal(category.color, '#123ABC');
  const unusedCategory = first.createCategory({
    name: 'Temporary',
    type: 'expense',
    color: '#D66A5C',
  });
  first.deleteCategory(unusedCategory.id);
  const transaction = first.addTransaction({
    accountId: options.accounts[0].id,
    categoryId: category.id,
    type: 'income',
    amountCents: 12345,
    description: 'Persistence test',
    transactionDate: new Date().toISOString().slice(0, 10),
    splitInHalf: false,
  });
  first.close();

  const reopened = new DatabaseService(filename);
  const dashboard = reopened.getDashboard();
  assert.equal(dashboard.balanceCents, 12345);
  assert.equal(dashboard.monthIncomeCents, 12345);
  assert.equal(dashboard.recentTransactions[0].description, 'Persistence test');
  assert.equal(dashboard.recentTransactions[0].categoryColor, category.color);
  assert.ok(
    reopened
      .getFormOptions()
      .categories.some((item) => item.name === 'Side projects'),
  );
  assert.throws(() => reopened.deleteCategory(category.id));
  assert.throws(() =>
    reopened.updateCategory({ ...category, type: 'expense' }),
  );
  reopened.addTransaction({
    accountId: options.accounts[0].id,
    categoryId: category.id,
    type: 'income',
    amountCents: 500,
    description: 'Historical transaction',
    transactionDate: '2000-01-15',
    splitInHalf: true,
  });
  const historical = reopened.getDashboard('2000-01');
  assert.equal(historical.monthIncomeCents, 500);
  assert.equal(historical.monthSharedExpenseCents, 0);
  assert.equal(historical.recentTransactions.length, 1);
  assert.equal(reopened.getDashboard('2000-02').recentTransactions.length, 0);
  const monthlyAnalytics = reopened.getAnalytics('month', '2000-01');
  assert.equal(monthlyAnalytics.incomeCents, 500);
  assert.equal(
    monthlyAnalytics.categoryTotals[0].categoryName,
    'Side projects',
  );
  assert.equal(
    monthlyAnalytics.categoryTotals[0].categoryColor,
    category.color,
  );
  assert.equal(reopened.getAnalytics('all', '2000-01').incomeCents, 12845);
  const expenseCategory = options.categories.find(
    (item) => item.type === 'expense',
  );
  assert.ok(expenseCategory);
  const sharedExpense = reopened.addTransaction({
    accountId: options.accounts[0].id,
    categoryId: expenseCategory.id,
    type: 'expense',
    amountCents: 1001,
    description: 'Shared expense test',
    transactionDate: '2000-01-20',
    splitInHalf: true,
  });
  assert.equal(reopened.getDashboard('2000-01').monthSharedExpenseCents, 501);
  reopened.deleteTransaction(sharedExpense.id);
  const updated = reopened.updateTransaction({
    id: transaction.id,
    accountId: transaction.accountId,
    categoryId: category.id,
    type: 'income',
    amountCents: 15000,
    description: 'Updated persistence test',
    transactionDate: transaction.transactionDate,
    splitInHalf: false,
  });
  assert.equal(updated.amountCents, 15000);
  assert.equal(reopened.getDashboard().balanceCents, 15500);
  reopened.deleteTransaction(transaction.id);
  assert.equal(reopened.getDashboard().recentTransactions.length, 0);
  reopened.close();
  console.log(
    'Database migrations, categories, cents, and reopen persistence verified.',
  );
} finally {
  rmSync(directory, { recursive: true, force: true });
}
