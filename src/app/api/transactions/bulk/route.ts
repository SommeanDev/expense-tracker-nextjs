import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { transactions, accounts } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await req.json(); // expect array of { date, description, category, amount, type, accountId? }

    // Fetch user's existing accounts for validation
    const userAccounts = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId));
    const userAccountIds = new Set(userAccounts.map((a: any) => a.id));

    // If user has no accounts, create a default and add to set
    let defaultAccountId: string | undefined = undefined;
    if (userAccounts.length === 0) {
      const [newAcc] = await db
        .insert(accounts)
        .values({ userId, name: "Default" })
        .returning();
      defaultAccountId = newAcc.id;
      userAccountIds.add(defaultAccountId);
    } else {
      defaultAccountId = userAccounts[0].id;
    }

    const toInsert = rows.map((r: any) => {
      const resolvedAccountId =
        r.accountId && userAccountIds.has(r.accountId)
          ? r.accountId
          : defaultAccountId;
      return {
        userId,
        accountId: resolvedAccountId,
        date: new Date(r.date).toISOString(),
        description: r.description || "",
        category: r.category || "General",
        amount: Number(r.amount) || 0,
        type: r.type === "income" ? "income" : "expense",
      };
    });

    const inserted = await db.insert(transactions).values(toInsert).returning();

    return Response.json({ data: inserted });
  } catch (err) {
    console.error(err);
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
