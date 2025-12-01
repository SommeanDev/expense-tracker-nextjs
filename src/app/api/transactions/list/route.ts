import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
    const limit = Math.min(
      Math.max(1, Number(url.searchParams.get("limit") || "25")),
      100,
    );
    const offset = (page - 1) * limit;

    const rows = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.date))
      .limit(limit)
      .offset(offset);

    // We can signal whether there may be more by checking count of returned rows
    // (caller can request page+1 to test if there's more)
    return Response.json({ data: rows });
  } catch (err) {
    console.error("Failed to fetch paginated transactions:", err);
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
