// Updated to use DatabaseStorage based on javascript_database blueprint
import { expenses, type Expense, type InsertExpense } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // Expense operations
  getAllExpenses(): Promise<Expense[]>;
  getExpenseById(id: string): Promise<Expense | undefined>;
  getExpensesByDateRange(startDate: string, endDate: string): Promise<Expense[]>;
  getExpensesByStatus(status: string): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: string, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: string): Promise<boolean>;
  
  // Analytics
  getExpensesByCategory(): Promise<{ category: string; total: number }[]>;
  getMonthlyTotals(months: number): Promise<{ month: string; total: number }[]>;
}

export class DatabaseStorage implements IStorage {
  async getAllExpenses(): Promise<Expense[]> {
    return await db.select().from(expenses).orderBy(desc(expenses.dueDate));
  }

  async getExpenseById(id: string): Promise<Expense | undefined> {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense || undefined;
  }

  async getExpensesByDateRange(startDate: string, endDate: string): Promise<Expense[]> {
    return await db
      .select()
      .from(expenses)
      .where(
        and(
          gte(expenses.dueDate, startDate),
          lte(expenses.dueDate, endDate)
        )
      )
      .orderBy(expenses.dueDate);
  }

  async getExpensesByStatus(status: string): Promise<Expense[]> {
    return await db
      .select()
      .from(expenses)
      .where(eq(expenses.status, status))
      .orderBy(expenses.dueDate);
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const [expense] = await db
      .insert(expenses)
      .values(insertExpense)
      .returning();
    return expense;
  }

  async updateExpense(id: string, updateData: Partial<InsertExpense>): Promise<Expense | undefined> {
    const [expense] = await db
      .update(expenses)
      .set(updateData)
      .where(eq(expenses.id, id))
      .returning();
    return expense || undefined;
  }

  async deleteExpense(id: string): Promise<boolean> {
    const result = await db
      .delete(expenses)
      .where(eq(expenses.id, id))
      .returning();
    return result.length > 0;
  }

  async getExpensesByCategory(): Promise<{ category: string; total: number }[]> {
    const results = await db
      .select({
        category: expenses.category,
        total: sql<number>`CAST(SUM(CAST(${expenses.value} AS DECIMAL)) AS DECIMAL)`,
      })
      .from(expenses)
      .groupBy(expenses.category);
    
    return results.map(r => ({
      category: r.category,
      total: Number(r.total)
    }));
  }

  async getMonthlyTotals(months: number): Promise<{ month: string; total: number }[]> {
    const results = await db
      .select({
        month: sql<string>`TO_CHAR(${expenses.dueDate}, 'YYYY-MM')`,
        total: sql<number>`CAST(SUM(CAST(${expenses.value} AS DECIMAL)) AS DECIMAL)`,
      })
      .from(expenses)
      .groupBy(sql`TO_CHAR(${expenses.dueDate}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${expenses.dueDate}, 'YYYY-MM') DESC`)
      .limit(months);
    
    return results.map(r => ({
      month: r.month,
      total: Number(r.total)
    }));
  }
}

export const storage = new DatabaseStorage();
