import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertExpenseSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all expenses
  app.get("/api/expenses", async (req, res) => {
    try {
      const expenses = await storage.getAllExpenses();
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });

  // Get expense by ID
  app.get("/api/expenses/:id", async (req, res) => {
    try {
      const expense = await storage.getExpenseById(req.params.id);
      if (!expense) {
        return res.status(404).json({ error: "Expense not found" });
      }
      res.json(expense);
    } catch (error) {
      console.error("Error fetching expense:", error);
      res.status(500).json({ error: "Failed to fetch expense" });
    }
  });

  // Get expenses by date range
  app.get("/api/expenses/range/:startDate/:endDate", async (req, res) => {
    try {
      const { startDate, endDate } = req.params;
      const expenses = await storage.getExpensesByDateRange(startDate, endDate);
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching expenses by date range:", error);
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });

  // Get expenses by status
  app.get("/api/expenses/status/:status", async (req, res) => {
    try {
      const expenses = await storage.getExpensesByStatus(req.params.status);
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching expenses by status:", error);
      res.status(500).json({ error: "Failed to fetch expenses" });
    }
  });

  // Create expense
  app.post("/api/expenses", async (req, res) => {
    try {
      const validationResult = insertExpenseSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.toString() });
      }

      const expense = await storage.createExpense(validationResult.data);
      res.status(201).json(expense);
    } catch (error) {
      console.error("Error creating expense:", error);
      res.status(500).json({ error: "Failed to create expense" });
    }
  });

  // Update expense
  app.put("/api/expenses/:id", async (req, res) => {
    try {
      const partialSchema = insertExpenseSchema.partial();
      const validationResult = partialSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        const validationError = fromZodError(validationResult.error);
        return res.status(400).json({ error: validationError.toString() });
      }

      const expense = await storage.updateExpense(req.params.id, validationResult.data);
      
      if (!expense) {
        return res.status(404).json({ error: "Expense not found" });
      }

      res.json(expense);
    } catch (error) {
      console.error("Error updating expense:", error);
      res.status(500).json({ error: "Failed to update expense" });
    }
  });

  // Delete expense
  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const success = await storage.deleteExpense(req.params.id);
      
      if (!success) {
        return res.status(404).json({ error: "Expense not found" });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting expense:", error);
      res.status(500).json({ error: "Failed to delete expense" });
    }
  });

  // Get analytics - expenses by category
  app.get("/api/analytics/by-category", async (req, res) => {
    try {
      const data = await storage.getExpensesByCategory();
      res.json(data);
    } catch (error) {
      console.error("Error fetching category analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  // Get analytics - monthly totals
  app.get("/api/analytics/monthly/:months", async (req, res) => {
    try {
      const months = parseInt(req.params.months) || 6;
      const data = await storage.getMonthlyTotals(months);
      res.json(data);
    } catch (error) {
      console.error("Error fetching monthly analytics:", error);
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
