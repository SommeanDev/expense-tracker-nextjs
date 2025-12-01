import DashboardCharts from "@/components/DashboardCharts";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { transactions, accounts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

function getISOWeekKey(d: Date) {
  // Returns year-week like "2025-W09"
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return `${date.getUTCFullYear()}-W${String(weekNo).padStart(2, "0")}`;
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) {
    // Redirect to sign-in (client-side helper)
    // Keep this simple — you can adjust how you want to handle redirects
    return <div>Please sign in to view the dashboard.</div>;
  }

  // Fetch transactions and accounts for the user
  const txRows = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.date));

  const accountRows = await db
    .select()
    .from(accounts)
    .where(eq(accounts.userId, userId))
    .orderBy(desc(accounts.createdAt));

  // Normalize rows into plain JS objects
  const txs = txRows.map((r: any) => ({
    id: r.id,
    date: String(r.date),
    description: r.description,
    category: r.category,
    amount: Number(r.amount),
    type: r.type as "income" | "expense",
    accountId: r.accountId,
  }));

  const accs = accountRows.map((a: any) => ({
    id: a.id,
    name: a.name,
  }));

  // Aggregations:
  // totals (income, expense, net)
  let totalIncome = 0;
  let totalExpense = 0;

  // byCategory: { category: total }
  const byCategoryMap: Record<string, number> = {};

  // weekly, monthly, yearly maps
  const weeklyMap: Record<string, number> = {};
  const monthlyMap: Record<string, number> = {};
  const yearlyMap: Record<string, number> = {};

  // byAccount
  const byAccountMap: Record<string, number> = {};

  for (const t of txs) {
    const amt = Number(t.amount) || 0;
    if (t.type === "income") totalIncome += amt;
    else totalExpense += amt;

    if (t.type === "expense") {
      const cat = t.category || "General";
      byCategoryMap[cat] = (byCategoryMap[cat] || 0) + amt;
    }

    const d = new Date(t.date);

    // weekly key
    const weekKey = getISOWeekKey(d);
    weeklyMap[weekKey] = (weeklyMap[weekKey] || 0) + amt;

    // monthly key YYYY-MM
    const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap[monthKey] = (monthlyMap[monthKey] || 0) + amt;

    // yearly key YYYY
    const yearKey = `${d.getFullYear()}`;
    yearlyMap[yearKey] = (yearlyMap[yearKey] || 0) + amt;

    const aid = t.accountId || "unknown";
    byAccountMap[aid] = (byAccountMap[aid] || 0) + amt;
  }

  // Convert maps to arrays for the charts (sorted)
  const byCategory = Object.entries(byCategoryMap).map(([category, total]) => ({
    category,
    total,
  }));
  byCategory.sort((a, b) => b.total - a.total);

  const weekly = Object.entries(weeklyMap)
    .map(([week, total]) => ({ week, total }))
    .sort((a, b) => (a.week < b.week ? -1 : 1));

  const monthly = Object.entries(monthlyMap)
    .map(([month, total]) => ({ month, total }))
    .sort((a, b) => (a.month < b.month ? -1 : 1));

  const yearly = Object.entries(yearlyMap)
    .map(([year, total]) => ({ year, total }))
    .sort((a, b) => (a.year < b.year ? -1 : 1));

  const byAccount = Object.entries(byAccountMap).map(([accountId, total]) => {
    const acc = accs.find((a) => a.id === accountId);
    return { accountId, accountName: acc ? acc.name : "Unknown", total };
  });
  byAccount.sort((a, b) => b.total - a.total);

  const totals = {
    income: totalIncome,
    expense: totalExpense,
    net: totalIncome - totalExpense,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <DashboardCharts
        totals={totals}
        byCategory={byCategory}
        weekly={weekly}
        monthly={monthly}
        yearly={yearly}
        byAccount={byAccount}
      />
    </div>
  );
}
