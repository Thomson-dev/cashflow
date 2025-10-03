export interface Transaction {
  transactionId: string;  // Primary Key (UUID)
  userId: string;         // GSI Partition Key
  amount: number;
  description: string;
  category?: string;
  type: 'income' | 'expense';
  date: string;
  createdAt: string;
  updatedAt: string;
}
