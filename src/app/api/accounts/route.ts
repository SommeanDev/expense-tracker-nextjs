import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { accounts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows = await db
      .select()
      .from(accounts)
      .where(eq(accounts.userId, userId))
      .orderBy(desc(accounts.createdAt));

    return Response.json({ data: rows });
  } catch (err) {
    console.error(err);
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const name =
      typeof body.name === "string" && body.name.trim()
        ? body.name.trim()
        : "Default";

    const [inserted] = await db
      .insert(accounts)
      .values({ userId, name })
      .returning();

    return Response.json({ data: inserted }, { status: 201 });
  } catch (err) {
    console.error(err);
    return Response.json({ error: (err as Error).message }, { status: 500 });
  }
}
