import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, ArrowUpDown, CheckCircle2 } from "lucide-react";
import { ExpenseDialog } from "@/components/expense-dialog";
import { ExpenseFilters, type FilterState } from "@/components/expense-filters";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Expense } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Expenses() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({});
  const { toast } = useToast();

  const { data: expenses, isLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  // Apply filters
  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    
    return expenses.filter((expense) => {
      if (filters.category && expense.category !== filters.category) return false;
      if (filters.status && expense.status !== filters.status) return false;
      if (filters.type && expense.type !== filters.type) return false;
      
      if (filters.startDate) {
        const expenseDate = new Date(expense.dueDate);
        const startDate = new Date(filters.startDate);
        if (expenseDate < startDate) return false;
      }
      
      if (filters.endDate) {
        const expenseDate = new Date(expense.dueDate);
        const endDate = new Date(filters.endDate);
        if (expenseDate > endDate) return false;
      }
      
      return true;
    });
  }, [expenses, filters]);

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/expenses", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/by-category"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/monthly/5"] });
      toast({
        title: "Gasto criado",
        description: "O gasto foi adicionado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar o gasto.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await apiRequest("PUT", `/api/expenses/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/by-category"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/monthly/5"] });
      toast({
        title: "Gasto atualizado",
        description: "O gasto foi atualizado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o gasto.",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/expenses/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/by-category"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/monthly/5"] });
      toast({
        title: "Gasto excluído",
        description: "O gasto foi removido com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o gasto.",
        variant: "destructive",
      });
    },
  });

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(typeof value === "string" ? parseFloat(value) : value);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      paid: { variant: "default", label: "Pago" },
      pending: { variant: "secondary", label: "Pendente" },
      overdue: { variant: "destructive", label: "Vencido" },
    };

    const config = variants[status] || variants.pending;
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (
    type: string,
    totalInstallments: number | null,
    paidInstallments: number
  ) => {
    if (type === "fixed") {
      return (
        <Badge variant="outline" className="text-xs">
          Fixo
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-xs">
        {paidInstallments}/{totalInstallments} parcelas
      </Badge>
    );
  };

  const handleAddExpense = () => {
    setSelectedExpense(null);
    setDialogOpen(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setDialogOpen(true);
  };

  const handleTogglePayment = (expense: Expense) => {
    const newStatus = expense.status === "paid" ? "pending" : "paid";
    updateMutation.mutate({
      id: expense.id,
      data: { status: newStatus },
    });
  };

  const handleDeleteExpense = (id: string) => {
    setExpenseToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (expenseToDelete) {
      deleteMutation.mutate(expenseToDelete);
    }
    setDeleteDialogOpen(false);
    setExpenseToDelete(null);
  };

  const handleSaveExpense = (data: any) => {
    if (data.id) {
      const { id, ...updateData } = data;
      updateMutation.mutate({ id, data: updateData });
    } else {
      createMutation.mutate(data);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Gastos</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Gerencie todos os seus gastos e parcelas
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
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
          <h1 className="text-3xl font-semibold text-foreground">Gastos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie todos os seus gastos e parcelas
          </p>
        </div>
        <Button onClick={handleAddExpense} data-testid="button-add-expense">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Gasto
        </Button>
      </div>

      <ExpenseFilters 
        onFilterChange={setFilters}
        onClearFilters={() => setFilters({})}
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">
            Todos os Gastos {filteredExpenses.length !== expenses?.length && `(${filteredExpenses.length} de ${expenses?.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      Nome
                      <ArrowUpDown className="ml-2 h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!filteredExpenses || filteredExpenses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center py-8">
                        <p className="text-sm text-muted-foreground">
                          {expenses?.length === 0 ? "Nenhum gasto cadastrado" : "Nenhum gasto encontrado com os filtros aplicados"}
                        </p>
                        <Button
                          variant="link"
                          onClick={handleAddExpense}
                          className="mt-2"
                        >
                          {expenses?.length === 0 ? "Adicionar seu primeiro gasto" : "Ajustar filtros"}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExpenses.map((expense) => (
                    <TableRow
                      key={expense.id}
                      className="hover-elevate"
                      data-testid={`row-expense-${expense.id}`}
                    >
                      <TableCell className="font-medium">
                        {expense.name}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {expense.category}
                        </span>
                      </TableCell>
                      <TableCell className="text-right tabular-nums font-semibold">
                        {formatCurrency(expense.value)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {new Date(expense.dueDate).toLocaleDateString("pt-BR")}
                        </span>
                      </TableCell>
                      <TableCell>
                        {getTypeBadge(
                          expense.type,
                          expense.totalInstallments,
                          expense.paidInstallments || 0
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(expense.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {expense.status !== "paid" && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleTogglePayment(expense)}
                              title="Marcar como pago"
                              data-testid={`button-toggle-payment-${expense.id}`}
                            >
                              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                              <span className="sr-only">Marcar como pago</span>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditExpense(expense)}
                            data-testid={`button-edit-${expense.id}`}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteExpense(expense.id)}
                            data-testid={`button-delete-${expense.id}`}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Excluir</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ExpenseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSaveExpense}
        expense={selectedExpense}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este gasto? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
