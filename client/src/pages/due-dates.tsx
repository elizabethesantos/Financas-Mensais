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
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Vencimentos</h1>
          <p className="text-sm text-muted-foreground mt-1">
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
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Vencimentos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Visualize os vencimentos em calendário
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
                {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToPreviousMonth}
                  data-testid="button-prev-month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={goToNextMonth}
                  data-testid="button-next-month"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-muted-foreground p-2"
                >
                  {day}
                </div>
              ))}
              
              {Array.from({ length: monthStart.getDay() }).map((_, index) => (
                <div key={`empty-${index}`} className="p-2" />
              ))}
              
              {daysInMonth.map((day) => {
                const hasExpense = hasExpenseOnDate(day);
                const status = getDateStatus(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isTodayDate = isToday(day);
                
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      relative p-2 h-16 rounded-md border transition-colors
                      ${isSelected ? "bg-primary text-primary-foreground border-primary" : "bg-card border-card-border hover-elevate"}
                      ${isTodayDate && !isSelected ? "border-primary" : ""}
                    `}
                    data-testid={`day-${format(day, "yyyy-MM-dd")}`}
                  >
                    <div className="text-sm font-medium">
                      {format(day, "d")}
                    </div>
                    {hasExpense && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-0.5">
                        <div
                          className={`h-1.5 w-1.5 rounded-full ${
                            status === "overdue"
                              ? "bg-chart-3"
                              : status === "pending"
                              ? "bg-chart-4"
                              : "bg-chart-2"
                          }`}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-chart-2" />
                <span className="text-xs text-muted-foreground">Pago</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-chart-4" />
                <span className="text-xs text-muted-foreground">Pendente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-chart-3" />
                <span className="text-xs text-muted-foreground">Vencido</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              {selectedDate
                ? format(selectedDate, "d 'de' MMMM", { locale: ptBR })
                : "Selecione uma data"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              selectedDateExpenses.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateExpenses.map((expense) => (
                    <div
                      key={expense.id}
                      className="pb-4 border-b last:border-0 last:pb-0"
                      data-testid={`expense-detail-${expense.id}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 flex-1">
                          <p className="text-sm font-medium">{expense.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(expense.dueDate), "dd/MM/yyyy")}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="text-sm font-semibold tabular-nums">
                            {formatCurrency(parseFloat(expense.value))}
                          </p>
                          <Badge
                            variant={
                              expense.status === "paid"
                                ? "default"
                                : expense.status === "overdue"
                                ? "destructive"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {expense.status === "paid"
                              ? "Pago"
                              : expense.status === "overdue"
                              ? "Vencido"
                              : "Pendente"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Total do dia</span>
                      <span className="text-base font-semibold tabular-nums">
                        {formatCurrency(
                          selectedDateExpenses.reduce(
                            (sum, expense) => sum + parseFloat(expense.value),
                            0
                          )
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">
                    Nenhum vencimento nesta data
                  </p>
                </div>
              )
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Clique em uma data no calendário para ver os vencimentos
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
