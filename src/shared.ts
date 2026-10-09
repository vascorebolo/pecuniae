export type TransactionType = 'income' | 'expense';

export interface Account {
  id: number;
  name: string;
}
export interface Category {
  id: number;
  name: string;
  type: TransactionType;
  color: string;
}
export interface Transaction {
  id: number;
  accountId: number;
  accountName: string;
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  type: TransactionType;
  amountCents: number;
  description: string;
  transactionDate: string;
  splitInHalf: boolean;
}
export interface CreateTransactionInput {
  accountId: number;
  categoryId: number;
  type: TransactionType;
  amountCents: number;
  description: string;
  transactionDate: string;
  splitInHalf: boolean;
}
export interface UpdateTransactionInput extends CreateTransactionInput {
  id: number;
}
export interface Dashboard {
  month: string;
  balanceCents: number;
  monthIncomeCents: number;
  monthExpenseCents: number;
  monthSharedExpenseCents: number;
  recentTransactions: Transaction[];
}
export interface CategoryTotal {
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  type: TransactionType;
  amountCents: number;
}
export interface Analytics {
  incomeCents: number;
  expenseCents: number;
  categoryTotals: CategoryTotal[];
}
export interface FormOptions {
  accounts: Account[];
  categories: Category[];
}
export interface CreateCategoryInput {
  name: string;
  type: TransactionType;
  color: string;
}
export interface UpdateCategoryInput extends CreateCategoryInput {
  id: number;
}
export interface PecuniaeApi {
  getDashboard(month?: string): Promise<Dashboard>;
  getAnalytics(scope: 'all' | 'month', month: string): Promise<Analytics>;
  getFormOptions(): Promise<FormOptions>;
  addTransaction(input: CreateTransactionInput): Promise<Transaction>;
  updateTransaction(input: UpdateTransactionInput): Promise<Transaction>;
  deleteTransaction(id: number): Promise<void>;
  createCategory(input: CreateCategoryInput): Promise<Category>;
  updateCategory(input: UpdateCategoryInput): Promise<Category>;
  deleteCategory(id: number): Promise<void>;
}
