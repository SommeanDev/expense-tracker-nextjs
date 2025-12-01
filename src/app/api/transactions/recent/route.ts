import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date))
      .limit(10);

    // Normalize to JSON-friendly shapes
    const mapped = rows.map((r: any) => ({
      id: r.id,
      date: String(r.date),
      description: r.description,
      category: r.category,
      amount: Number(r.amount),
      type: r.type,
      accountId: r.accountId,
    }));

    return Response.json({ data: mapped });
  } catch (err) {
    console.error(err);
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
