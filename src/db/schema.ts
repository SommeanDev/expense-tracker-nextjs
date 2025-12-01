import {
  pgTable,
  text,
  varchar,
  timestamp,
  decimal,
  pgEnum,
  uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const transactionTypeEnum = pgEnum("transaction_type", [
  "income",
  "expense",
]);

// ----------------------
// USERS ACCOUNTS pgTable
// ----------------------
//
export const accounts = pgTable("accounts", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("userId", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const accountsRelations = relations(accounts, ({ many }) => ({
  transactions: many(transactions),
}));

// -----------------------
// TRANSACTIONS TABLE
// -----------------------
export const transactions = pgTable("transactions", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: varchar("user_id", { length: 255 }).notNull(), // Clerk userId
  accountId: uuid("account_id")
    .references(() => accounts.id)
    .notNull(),

  date: timestamp("date", { mode: "string" }).notNull(),
  description: text("description").notNull(),
  category: varchar("category", { length: 100 }).notNull(),

  amount: decimal("amount").notNull(),
  type: transactionTypeEnum("type").notNull(), // income | expense

  createdAt: timestamp("created_at").defaultNow(),
});

export const transactionsRelations = relations(transactions, ({ one }) => ({
  account: one(accounts, {
    fields: [transactions.accountId],
    references: [accounts.id],
  }),
}));
