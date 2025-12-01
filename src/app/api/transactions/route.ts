import supabase from "@/lib/supabaseClient";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { transactions } from "@/db/schema";
import { accounts } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { date, description, amount, category, type, accountId } = body;

    // Resolve accountId: if provided, ensure it belongs to the user.
    let finalAccountId = accountId;

    if (finalAccountId) {
      const existing = await db
        .select()
        .from(accounts)
        .where(
          and(eq(accounts.id, finalAccountId), eq(accounts.userId, userId)),
        )
        .limit(1);

      if (existing.length === 0) {
        // provided accountId is invalid for this user, ignore it and create/use default
        finalAccountId = undefined;
      }
    }

    // If no accountId, find any existing account for the user; if none, create default
    if (!finalAccountId) {
      const existing = await db
        .select()
        .from(accounts)
        .where(eq(accounts.userId, userId))
        .limit(1);

      if (existing.length > 0) {
        finalAccountId = existing[0].id;
      } else {
        const [newAcc] = await db
          .insert(accounts)
          .values({ userId, name: "Default" })
          .returning();
        finalAccountId = newAcc.id;
      }
    }

    const result = await db
      .insert(transactions)
      .values({
        userId,
        accountId: finalAccountId,
        date: new Date(date).toISOString(),
        amount,
        category,
        description,
        type,
      })
      .returning();

    return Response.json({ data: result[0] });
  } catch (error) {
    console.error(error);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function GET() {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false });

  return Response.json({ data, error });
}
