import { sql } from "drizzle-orm";
import { pgTable, text, varchar, numeric, integer, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const expenses = pgTable("expenses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  value: numeric("value", { precision: 10, scale: 2 }).notNull(),
  category: text("category").notNull(),
  dueDate: date("due_date").notNull(),
  type: text("type").notNull(), // 'fixed' or 'installment'
  totalInstallments: integer("total_installments"), // null for fixed, number for installments
  paidInstallments: integer("paid_installments").default(0), // how many installments have been paid
  status: text("status").notNull().default('pending'), // 'paid', 'pending', 'overdue'
  parentExpenseId: varchar("parent_expense_id"), // references the first installment if this is a child
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertExpenseSchema = createInsertSchema(expenses, {
  value: z.string().min(1, "Valor é obrigatório"),
  name: z.string().min(1, "Nome é obrigatório"),
  category: z.string().min(1, "Categoria é obrigatória"),
  dueDate: z.string().min(1, "Data de vencimento é obrigatória"),
  type: z.enum(['fixed', 'installment'], {
    errorMap: () => ({ message: "Tipo deve ser 'fixo' ou 'parcelado'" })
  }),
  totalInstallments: z.number().int().positive().optional().nullable(),
  paidInstallments: z.number().int().min(0).optional(),
  status: z.enum(['paid', 'pending', 'overdue']).optional(),
  parentExpenseId: z.string().optional().nullable(),
}).omit({
  id: true,
  createdAt: true,
});

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;

// User table (keeping the existing one)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
