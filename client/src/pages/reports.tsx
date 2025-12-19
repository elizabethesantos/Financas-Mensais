import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp, TrendingDown } from "lucide-react";
import { ExportReports } from "@/components/export-reports";
import { ExpenseProjection } from "@/components/expense-projection";
import type { Expense } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export default function Reports() {
  const { data: expenses, isLoading: expensesLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const { data: categoryData, isLoading: categoryLoading } = useQuery<
    { category: string; total: number }[]
  >({
    queryKey: ["/api/analytics/by-category"],
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const calculateMonthlyComparison = () => {
    if (!expenses) return { currentMonth: 0, lastMonth: 0, change: 0 };

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const currentMonthExpenses = expenses.filter((exp) => {
      const date = new Date(exp.dueDate);
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
    });

    const lastMonthExpenses = expenses.filter((exp) => {
      const date = new Date(exp.dueDate);
      return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
    });

    const currentTotal = currentMonthExpenses.reduce(
      (sum, exp) => sum + parseFloat(exp.value),
      0
    );
    const lastTotal = lastMonthExpenses.reduce(
      (sum, exp) => sum + parseFloat(exp.value),
      0
    );

    const change = lastTotal > 0 ? ((currentTotal - lastTotal) / lastTotal) * 100 : 0;

    return {
      currentMonth: currentTotal,
      lastMonth: lastTotal,
      change,
    };
  };

  const getTopExpenses = () => {
    if (!expenses) return [];

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const currentMonthExpenses = expenses
      .filter((exp) => {
        const date = new Date(exp.dueDate);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .map((exp) => ({
        ...exp,
        numericValue: parseFloat(exp.value),
      }))
      .sort((a, b) => b.numericValue - a.numericValue)
      .slice(0, 5);

    const total = currentMonthExpenses.reduce((sum, exp) => sum + exp.numericValue, 0);

    return currentMonthExpenses.map((exp) => ({
      name: exp.name,
      category: exp.category,
      value: exp.numericValue,
      percentage: total > 0 ? (exp.numericValue / total) * 100 : 0,
    }));
  };

  const getTotalByCategory = () => {
    if (!categoryData) return 0;
    return categoryData.reduce((sum, item) => sum + item.total, 0);
  };

  const comparison = calculateMonthlyComparison();
  const topExpenses = getTopExpenses();

  const categoryChartData = categoryData
    ? categoryData.map((item, index) => ({
        name: item.category,
        value: item.total,
        color: COLORS[index % COLORS.length],
      }))
    : [];

  if (expensesLoading || categoryLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Relatórios</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Análise detalhada dos seus gastos
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Relatórios</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Análise detalhada dos seus gastos
          </p>
        </div>
        <Select defaultValue="current-month">
          <SelectTrigger className="w-full sm:w-[180px] text-xs md:text-sm" data-testid="select-period">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current-month">Mês Atual</SelectItem>
            <SelectItem value="last-month">Mês Anterior</SelectItem>
            <SelectItem value="last-3-months">Últimos 3 Meses</SelectItem>
            <SelectItem value="last-6-months">Últimos 6 Meses</SelectItem>
            <SelectItem value="current-year">Ano Atual</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Comparison Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm md:text-base font-medium">
            Comparação Mensal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            <div className="space-y-2">
              <p className="text-xs md:text-sm text-muted-foreground">Mês Atual</p>
              <p className="text-lg md:text-2xl font-semibold tabular-nums break-words">
                {formatCurrency(comparison.currentMonth)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs md:text-sm text-muted-foreground">Mês Anterior</p>
              <p className="text-lg md:text-2xl font-semibold tabular-nums break-words">
                {formatCurrency(comparison.lastMonth)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-xs md:text-sm text-muted-foreground">Variação</p>
              <div className="flex items-center gap-2">
                <p className="text-lg md:text-2xl font-semibold tabular-nums break-words">
                  {comparison.change > 0 ? "+" : ""}
                  {comparison.change.toFixed(1)}%
                </p>
                {comparison.change > 0 ? (
                  <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-chart-3 flex-shrink-0" />
                ) : comparison.change < 0 ? (
                  <TrendingDown className="h-4 w-4 md:h-5 md:w-5 text-chart-2 flex-shrink-0" />
                ) : null}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm md:text-base font-medium">
              Distribuição por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryChartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.5rem",
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-3 md:mt-4 space-y-2">
                  {categoryChartData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between text-xs md:text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-2.5 w-2.5 md:h-3 md:w-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="truncate">{item.name}</span>
                      </div>
                      <span className="font-semibold tabular-nums flex-shrink-0">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[220px] flex items-center justify-center text-xs md:text-sm text-muted-foreground">
                Nenhum dado
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm md:text-base font-medium">
              Top 5 Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topExpenses.length > 0 ? (
              <div className="space-y-2 max-h-[280px] overflow-y-auto">
                {topExpenses.map((expense, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs md:text-sm font-medium truncate">
                          {expense.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {expense.category}
                        </p>
                      </div>
                      <p className="text-xs md:text-sm font-semibold tabular-nums flex-shrink-0">
                        {formatCurrency(expense.value)}
                      </p>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${expense.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs md:text-sm text-muted-foreground text-center py-6">
                Nenhum gasto este mês
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Projection and Export */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <ExpenseProjection />
        <ExportReports />
      </div>
    </div>
  );
}
