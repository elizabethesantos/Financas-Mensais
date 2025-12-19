import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, Clock, AlertCircle } from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Expense } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: expenses, isLoading: expensesLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const { data: categoryData, isLoading: categoryLoading } = useQuery<
    { category: string; total: number }[]
  >({
    queryKey: ["/api/analytics/by-category"],
  });

  const { data: monthlyData, isLoading: monthlyLoading } = useQuery<
    { month: string; total: number }[]
  >({
    queryKey: ["/api/analytics/monthly/5"],
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Calculate metrics from expenses
  const calculateMetrics = () => {
    if (!expenses || expenses.length === 0) {
      return { totalMonth: 0, paid: 0, pending: 0, overdue: 0 };
    }

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.dueDate);
      return (
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear
      );
    });

    const totalMonth = monthExpenses.reduce(
      (sum, exp) => sum + parseFloat(exp.value),
      0
    );
    const paid = monthExpenses
      .filter((exp) => exp.status === "paid")
      .reduce((sum, exp) => sum + parseFloat(exp.value), 0);
    const pending = monthExpenses
      .filter((exp) => exp.status === "pending")
      .reduce((sum, exp) => sum + parseFloat(exp.value), 0);
    const overdue = monthExpenses
      .filter((exp) => exp.status === "overdue")
      .reduce((sum, exp) => sum + parseFloat(exp.value), 0);

    return { totalMonth, paid, pending, overdue };
  };

  const metrics = calculateMetrics();

  // Get upcoming expenses (next 3)
  const getUpcomingExpenses = () => {
    if (!expenses) return [];
    
    const today = new Date();
    return expenses
      .filter((exp) => {
        const dueDate = new Date(exp.dueDate);
        return dueDate >= today && exp.status === "pending";
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3);
  };

  const upcomingExpenses = getUpcomingExpenses();

  // Format monthly data for chart
  const monthlyChartData = monthlyData
    ? monthlyData
        .reverse()
        .map((item) => ({
          month: new Date(item.month + "-01").toLocaleDateString("pt-BR", {
            month: "short",
          }),
          value: item.total,
        }))
    : [];

  // Format category data for chart
  const categoryChartData = categoryData
    ? categoryData.map((item) => ({
        name: item.category,
        value: item.total,
      }))
    : [];

  if (expensesLoading || categoryLoading || monthlyLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Visão geral dos seus gastos e finanças
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">
          Visão geral dos seus gastos e finanças
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card data-testid="card-total">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Mensal</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-semibold tabular-nums break-words" data-testid="text-total">
              {formatCurrency(metrics.totalMonth)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Gastos do mês atual
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-paid">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Pago</CardTitle>
            <TrendingUp className="h-4 w-4 text-chart-2 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-semibold tabular-nums text-chart-2 break-words" data-testid="text-paid">
              {formatCurrency(metrics.paid)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.totalMonth > 0
                ? `${((metrics.paid / metrics.totalMonth) * 100).toFixed(0)}% do total`
                : "0% do total"}
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-pending">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Pendente</CardTitle>
            <Clock className="h-4 w-4 text-chart-4 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-semibold tabular-nums text-chart-4 break-words" data-testid="text-pending">
              {formatCurrency(metrics.pending)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              A vencer este mês
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-overdue">
          <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
            <CardTitle className="text-xs sm:text-sm font-medium">Vencidos</CardTitle>
            <AlertCircle className="h-4 w-4 text-chart-3 flex-shrink-0" />
          </CardHeader>
          <CardContent>
            <div className="text-lg sm:text-2xl font-semibold tabular-nums text-chart-3 break-words" data-testid="text-overdue">
              {formatCurrency(metrics.overdue)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Requer atenção
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm md:text-base font-medium">
              Gastos por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {categoryChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="name"
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-xs sm:text-sm text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm md:text-base font-medium">
              Últimos 5 Meses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis
                    dataKey="month"
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <YAxis
                    className="text-xs"
                    tick={{ fill: "hsl(var(--muted-foreground))" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "0.5rem",
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--chart-1))", r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-xs sm:text-sm text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Expenses */}
      {upcomingExpenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm md:text-base font-medium">Próximos Vencimentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-muted/50 gap-2"
                  data-testid={`upcoming-expense-${expense.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{expense.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(expense.dueDate).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <p className="text-sm font-semibold tabular-nums">
                    {formatCurrency(expense.value)}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
