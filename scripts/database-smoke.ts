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
  const category = options.categories.find((item) => item.type === 'income');
  assert.ok(category);
  first.addTransaction({
    accountId: options.accounts[0].id,
    categoryId: category.id,
    type: 'income',
    amountCents: 12345,
    description: 'Persistence test',
    transactionDate: new Date().toISOString().slice(0, 10),
  });
  first.close();

  const reopened = new DatabaseService(filename);
  const dashboard = reopened.getDashboard();
  assert.equal(dashboard.balanceCents, 12345);
  assert.equal(dashboard.monthIncomeCents, 12345);
  assert.equal(dashboard.recentTransactions[0].description, 'Persistence test');
  assert.equal(
    reopened.getFormOptions().categories.length,
    options.categories.length,
  );
  reopened.close();
  console.log(
    'Database migrations, seed data, cents, and reopen persistence verified.',
  );
} finally {
  rmSync(directory, { recursive: true, force: true });
}
