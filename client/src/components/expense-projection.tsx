import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { Expense } from "@shared/schema";

export function ExpenseProjection() {
  const { data: expenses } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const projectFutureExpenses = () => {
    if (!expenses) return [];

    const fixedExpenses = expenses.filter((exp) => exp.type === "fixed");
    const monthlyFixedTotal = fixedExpenses.reduce(
      (sum, exp) => sum + parseFloat(exp.value),
      0
    );

    const projectionData = [];
    const today = new Date();

    for (let i = 0; i < 6; i++) {
      const projectionDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const monthName = projectionDate.toLocaleDateString("pt-BR", {
        month: "short",
        year: "2-digit",
      });

      let monthTotal = monthlyFixedTotal;

      expenses.forEach((exp) => {
        if (
          exp.type === "installment" &&
          exp.totalInstallments &&
          exp.paidInstallments !== exp.totalInstallments
        ) {
          const expenseDate = new Date(exp.dueDate);
          const remainingInstallments = exp.totalInstallments - (exp.paidInstallments || 0);
          const installmentValue = parseFloat(exp.value) / remainingInstallments;

          if (
            expenseDate.getMonth() + remainingInstallments > i &&
            expenseDate.getMonth() <= i
          ) {
            monthTotal += installmentValue;
          }
        }
      });

      projectionData.push({
        month: monthName,
        value: monthTotal,
      });
    }

    return projectionData;
  };

  const projectionData = projectFutureExpenses();

  const totalProjected = projectionData.reduce((sum, item) => sum + item.value, 0);
  const averageMonthly = totalProjected / projectionData.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium">
          Projeção de Gastos (6 Meses)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Total Projetado</p>
              <p className="text-lg font-semibold tabular-nums">
                {formatCurrency(totalProjected)}
              </p>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">Média Mensal</p>
              <p className="text-lg font-semibold tabular-nums">
                {formatCurrency(averageMonthly)}
              </p>
            </div>
          </div>

          {projectionData.length > 0 && (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={projectionData}>
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
                  stroke="hsl(var(--chart-4))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--chart-4))", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}

          <p className="text-xs text-muted-foreground">
            ℹ️ Projeção baseada em gastos fixos recorrentes e parcelas pendentes
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
