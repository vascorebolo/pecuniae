export type TransactionType = 'income' | 'expense';

export interface Account {
  id: number;
  name: string;
}
export interface Category {
  id: number;
  name: string;
  type: TransactionType;
}
export interface Transaction {
  id: number;
  accountId: number;
  accountName: string;
  categoryId: number;
  categoryName: string;
  type: TransactionType;
  amountCents: number;
  description: string;
  transactionDate: string;
}
export interface CreateTransactionInput {
  accountId: number;
  categoryId: number;
  type: TransactionType;
  amountCents: number;
  description: string;
  transactionDate: string;
}
export interface Dashboard {
  balanceCents: number;
  monthIncomeCents: number;
  monthExpenseCents: number;
  recentTransactions: Transaction[];
}
export interface FormOptions {
  accounts: Account[];
  categories: Category[];
}
export interface PecuniaeApi {
  getDashboard(): Promise<Dashboard>;
  getFormOptions(): Promise<FormOptions>;
  addTransaction(input: CreateTransactionInput): Promise<Transaction>;
}
