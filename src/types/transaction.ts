export interface Transaction {
  id: string;
  userId?: string; // Clerk user ID (optional on frontend)
  accountId?: string; // Account ID
  date: string;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
}
