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
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Relatórios</h1>
          <p className="text-sm text-muted-foreground mt-1">
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
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Relatórios</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Análise detalhada dos seus gastos
          </p>
        </div>
        <Select defaultValue="current-month">
          <SelectTrigger className="w-[200px]" data-testid="select-period">
            <SelectValue placeholder="Selecione o período" />
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
          <CardTitle className="text-base font-medium">
            Comparação Mensal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Mês Atual</p>
              <p className="text-2xl font-semibold tabular-nums">
                {formatCurrency(comparison.currentMonth)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Mês Anterior</p>
              <p className="text-2xl font-semibold tabular-nums">
                {formatCurrency(comparison.lastMonth)}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Variação</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-semibold tabular-nums">
                  {comparison.change > 0 ? "+" : ""}
                  {comparison.change.toFixed(1)}%
                </p>
                {comparison.change > 0 ? (
                  <TrendingUp className="h-5 w-5 text-chart-3" />
                ) : comparison.change < 0 ? (
                  <TrendingDown className="h-5 w-5 text-chart-2" />
                ) : null}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Distribuição por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryChartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={80}
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
                <div className="mt-4 space-y-2">
                  {categoryChartData.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-semibold tabular-nums">
                        {formatCurrency(item.value)}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Maiores Gastos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topExpenses.length > 0 ? (
              <>
                <div className="space-y-4">
                  {topExpenses.map((expense, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between pb-4 border-b last:border-0 last:pb-0"
                      data-testid={`top-expense-${index}`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{expense.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {expense.category}
                          </Badge>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden max-w-[200px]">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${expense.percentage}%` }}
                          />
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm font-semibold tabular-nums">
                          {formatCurrency(expense.value)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {expense.percentage.toFixed(1)}% do total
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Analisado</span>
                    <span className="text-base font-semibold tabular-nums">
                      {formatCurrency(getTotalByCategory())}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
