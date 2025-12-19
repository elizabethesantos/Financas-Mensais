import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Expense } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function DueDates() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const { data: expenses, isLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getExpensesForDate = (date: Date) => {
    if (!expenses) return [];
    return expenses.filter((expense) =>
      isSameDay(new Date(expense.dueDate), date)
    );
  };

  const hasExpenseOnDate = (date: Date) => {
    return getExpensesForDate(date).length > 0;
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getDateStatus = (date: Date) => {
    const expensesOnDate = getExpensesForDate(date);
    if (expensesOnDate.length === 0) return null;
    
    const hasOverdue = expensesOnDate.some(e => e.status === "overdue");
    const hasPending = expensesOnDate.some(e => e.status === "pending");
    const hasPaid = expensesOnDate.some(e => e.status === "paid");
    
    if (hasOverdue) return "overdue";
    if (hasPending && isBefore(date, startOfDay(new Date()))) return "overdue";
    if (hasPending) return "pending";
    if (hasPaid) return "paid";
    return null;
  };

  const selectedDateExpenses = selectedDate ? getExpensesForDate(selectedDate) : [];

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Vencimentos</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Visualize os vencimentos em calendário
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <Skeleton className="h-[400px] w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold text-foreground">Vencimentos</h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">
          Visualize os vencimentos em calendário
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <CardTitle className="text-sm md:text-base font-medium">
                {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 md:h-9 md:w-9"
                  onClick={goToPreviousMonth}
                  data-testid="button-prev-month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 md:h-9 md:w-9"
                  onClick={goToNextMonth}
                  data-testid="button-next-month"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Calendar days header */}
              <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs md:text-sm font-semibold text-muted-foreground p-1"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-1 md:gap-2">
                {Array.from({ length: monthStart.getDay() }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square"></div>
                ))}

                {daysInMonth.map((date) => {
                  const status = getDateStatus(date);
                  const isSelected = selectedDate && isSameDay(date, selectedDate);
                  const isTodayDate = isToday(date);

                  const statusColors = {
                    paid: "bg-chart-2/20 border-chart-2",
                    pending: "bg-chart-4/20 border-chart-4",
                    overdue: "bg-chart-3/20 border-chart-3",
                    null: "bg-muted",
                  };

                  const bgColor = statusColors[status || "null"];

                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className={`aspect-square p-1 rounded border text-xs md:text-sm font-medium transition-all ${bgColor} ${
                        isSelected
                          ? "ring-2 ring-primary border-primary"
                          : "border-border hover-elevate"
                      } ${isTodayDate ? "font-bold text-primary" : ""}`}
                      data-testid={`calendar-day-${date.getDate()}`}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Expenses */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm md:text-base font-medium">
              {selectedDate
                ? format(selectedDate, "d 'de' MMMM", { locale: ptBR })
                : "Selecione uma data"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDateExpenses.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {selectedDateExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="p-2 md:p-3 rounded-lg bg-muted/50 space-y-1"
                    data-testid={`expense-detail-${expense.id}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs md:text-sm font-medium break-words flex-1">
                        {expense.name}
                      </p>
                      <Badge
                        variant={
                          expense.status === "paid"
                            ? "default"
                            : expense.status === "overdue"
                            ? "destructive"
                            : "secondary"
                        }
                        className="text-xs flex-shrink-0"
                      >
                        {expense.status === "paid"
                          ? "Pago"
                          : expense.status === "pending"
                          ? "Pendente"
                          : "Vencido"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {expense.category}
                    </p>
                    <p className="text-sm font-semibold tabular-nums">
                      {formatCurrency(parseFloat(expense.value))}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs md:text-sm text-muted-foreground text-center py-8">
                {selectedDate
                  ? "Nenhum gasto nesta data"
                  : "Clique em um dia para ver os gastos"}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
