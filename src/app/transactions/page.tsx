import TransactionTable from "@/components/TransactionTable";
import AddEntryModal from "@/components/AddEntryModal";
import { RedirectToSignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { transactions, accounts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

const PAGE_LIMIT = 25;

export default async function TransactionsPage() {
  // Authenticate server-side
  const { userId } = await auth();

  if (!userId) {
    return <RedirectToSignIn />;
  }

  try {
    // Fetch only the first page server-side
    const txRows = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date))
      .limit(PAGE_LIMIT)
      .offset(0);

    // Fetch user's accounts (small)
    const accountRows = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId))
      .orderBy(desc(accounts.createdAt));

    // Normalize to plain JSON-friendly objects
    const mappedTx = txRows.map((r: any) => ({
      id: r.id,
      date: String(r.date),
      description: r.description,
      category: r.category,
      amount: Number(r.amount),
      type: r.type as "income" | "expense",
      userId: r.userId,
      accountId: r.accountId,
    }));

    const mappedAccounts = accountRows.map((a: any) => ({
      id: a.id,
      name: a.name,
      userId: a.userId,
      createdAt: String(a.createdAt),
    }));

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Transactions</h1>
            <div className="text-sm subtle">
              View and manage your transactions
            </div>
          </div>

          {/* AddEntryModal is a client component */}
          <div>
            <AddEntryModal />
          </div>
        </div>

        <TransactionTable
          initialData={mappedTx}
          accounts={mappedAccounts}
          pageLimit={PAGE_LIMIT}
        />
      </div>
    );
  } catch (err) {
    console.error("DB query failed:", err);
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Transactions</h1>
          <AddEntryModal />
        </div>
        <div className="bg-yellow-900 text-yellow-100 p-4 rounded">
          <p className="font-semibold">Database connection error</p>
          <p>
            The server cannot reach the database right now. Please verify your
            DATABASE_URL and network connectivity. Check the server logs for
            details.
          </p>
        </div>
      </div>
    );
  }
}
