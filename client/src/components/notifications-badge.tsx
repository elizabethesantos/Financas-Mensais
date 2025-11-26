import { useQuery } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { Expense } from "@shared/schema";

export function NotificationsBadge() {
  const { data: expenses } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const getUpcomingExpenses = () => {
    if (!expenses) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcoming = expenses.filter((exp) => {
      if (exp.status === "paid") return false;

      const dueDate = new Date(exp.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      const daysUntilDue = Math.floor(
        (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      return daysUntilDue >= 0 && daysUntilDue <= 7;
    });

    return upcoming.sort((a, b) => {
      const dateA = new Date(a.dueDate);
      const dateB = new Date(b.dueDate);
      return dateA.getTime() - dateB.getTime();
    });
  };

  const upcomingExpenses = getUpcomingExpenses();

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(typeof value === "string" ? parseFloat(value) : value);
  };

  return (
    <DropdownMenu>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        data-testid="button-notifications"
      >
        <Bell className="h-5 w-5" />
        {upcomingExpenses.length > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
            data-testid="badge-notifications-count"
          >
            {upcomingExpenses.length}
          </Badge>
        )}
        <span className="sr-only">Notificações</span>
      </Button>

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="text-sm font-semibold">
          {upcomingExpenses.length === 0
            ? "Nenhuma notificação"
            : `${upcomingExpenses.length} vencimento(s) nos próximos 7 dias`}
        </DropdownMenuLabel>

        {upcomingExpenses.length > 0 && <DropdownMenuSeparator />}

        <div className="max-h-96 overflow-y-auto">
          {upcomingExpenses.map((expense) => {
            const dueDate = new Date(expense.dueDate);
            const today = new Date();
            const daysUntilDue = Math.floor(
              (dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );

            return (
              <DropdownMenuItem
                key={expense.id}
                className="flex items-start justify-between py-2 px-2 cursor-default hover:bg-muted"
                data-testid={`notification-item-${expense.id}`}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{expense.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {daysUntilDue === 0 ? "Vence hoje" : `Vence em ${daysUntilDue} dia(s)`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {dueDate.toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold tabular-nums">
                    {formatCurrency(expense.value)}
                  </p>
                  {daysUntilDue <= 2 && (
                    <Badge variant="destructive" className="text-xs mt-1">
                      Urgente
                    </Badge>
                  )}
                </div>
              </DropdownMenuItem>
            );
          })}
        </div>

        {upcomingExpenses.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-xs text-muted-foreground text-center justify-center py-2"
              disabled
            >
              Ver mais no calendário de vencimentos
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
