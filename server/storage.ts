import { expenses, type Expense, type InsertExpense } from "@shared/schema";
import { randomUUID } from "crypto";

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

class MemoryStorage implements IStorage {
  private expenses: Map<string, Expense> = new Map();

  async getAllExpenses(): Promise<Expense[]> {
    return Array.from(this.expenses.values()).sort((a, b) => {
      return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    });
  }

  async getExpenseById(id: string): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }

  async getExpensesByDateRange(startDate: string, endDate: string): Promise<Expense[]> {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    
    return Array.from(this.expenses.values()).filter((exp) => {
      const dueDate = new Date(exp.dueDate).getTime();
      return dueDate >= start && dueDate <= end;
    });
  }

  async getExpensesByStatus(status: string): Promise<Expense[]> {
    return Array.from(this.expenses.values()).filter((exp) => exp.status === status);
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const id = insertExpense.id || randomUUID();
    const expense: Expense = {
      id,
      name: insertExpense.name,
      category: insertExpense.category,
      value: insertExpense.value,
      dueDate: insertExpense.dueDate,
      status: insertExpense.status || "pending",
      type: insertExpense.type,
      totalInstallments: insertExpense.totalInstallments,
      paidInstallments: insertExpense.paidInstallments || 0,
    };
    
    this.expenses.set(id, expense);
    return expense;
  }

  async updateExpense(id: string, updateData: Partial<InsertExpense>): Promise<Expense | undefined> {
    const expense = this.expenses.get(id);
    if (!expense) return undefined;

    const updated: Expense = {
      ...expense,
      ...updateData,
      id, // Preserve ID
    };
    
    this.expenses.set(id, updated);
    return updated;
  }

  async deleteExpense(id: string): Promise<boolean> {
    return this.expenses.delete(id);
  }

  async getExpensesByCategory(): Promise<{ category: string; total: number }[]> {
    const byCategory = new Map<string, number>();
    
    this.expenses.forEach((expense) => {
      const current = byCategory.get(expense.category) || 0;
      byCategory.set(expense.category, current + parseFloat(expense.value));
    });

    return Array.from(byCategory.entries()).map(([category, total]) => ({
      category,
      total,
    }));
  }

  async getMonthlyTotals(months: number): Promise<{ month: string; total: number }[]> {
    const monthData = new Map<string, number>();

    this.expenses.forEach((expense) => {
      const date = new Date(expense.dueDate);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      const current = monthData.get(monthKey) || 0;
      monthData.set(monthKey, current + parseFloat(expense.value));
    });

    // Sort by month descending and limit to requested months
    const sorted = Array.from(monthData.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .slice(0, months)
      .map(([month, total]) => ({
        month,
        total,
      }));

    return sorted;
  }
}

export const storage = new MemoryStorage();
