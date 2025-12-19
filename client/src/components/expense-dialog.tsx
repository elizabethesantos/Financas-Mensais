import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { Expense } from "@shared/schema";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  value: z.string().min(1, "Valor é obrigatório"),
  category: z.string().min(1, "Categoria é obrigatória"),
  dueDate: z.string().min(1, "Data de vencimento é obrigatória"),
  type: z.enum(["fixed", "installment"]),
  totalInstallments: z.string().optional(),
  status: z.enum(["paid", "pending", "overdue"]).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const categories = [
  "Moradia",
  "Alimentação",
  "Transporte",
  "Saúde",
  "Educação",
  "Lazer",
  "Serviços",
  "Outros",
];

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: FormValues & { id?: string }) => void;
  expense?: Expense | null;
}

export function ExpenseDialog({
  open,
  onOpenChange,
  onSave,
  expense,
}: ExpenseDialogProps) {
  const [type, setType] = useState<"fixed" | "installment">("fixed");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      value: "",
      category: "",
      dueDate: "",
      type: "fixed",
      status: "pending",
    },
  });

  useEffect(() => {
    if (expense) {
      form.reset({
        name: expense.name,
        value: expense.value,
        category: expense.category,
        dueDate: expense.dueDate,
        type: expense.type as "fixed" | "installment",
        totalInstallments: expense.totalInstallments ? String(expense.totalInstallments) : undefined,
        status: expense.status as "paid" | "pending" | "overdue",
      });
      setType(expense.type as "fixed" | "installment");
    } else {
      form.reset({
        name: "",
        value: "",
        category: "",
        dueDate: "",
        type: "fixed",
        status: "pending",
      });
      setType("fixed");
    }
  }, [expense, form]);

  const onSubmit = (data: FormValues) => {
    // Convert string values to proper types for API
    const apiData = {
      ...data,
      value: data.value,
      totalInstallments: data.totalInstallments ? Number(data.totalInstallments) : undefined,
      // Only set paidInstallments to 0 for new expenses; preserve existing value when editing
      paidInstallments: expense?.paidInstallments ?? 0,
    };

    if (expense) {
      onSave({ ...apiData, id: expense.id });
    } else {
      onSave(apiData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {expense ? "Editar Gasto" : "Adicionar Gasto"}
          </DialogTitle>
          <DialogDescription>
            Preencha os campos abaixo para {expense ? "atualizar" : "cadastrar"} um gasto
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ex: Conta de luz"
                          {...field}
                          data-testid="input-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {type === "installment" ? "Valor Total (R$)" : "Valor (R$)"}
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          {...field}
                          data-testid="input-value"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Vencimento</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          data-testid="input-dueDate"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Pagamento</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value) => {
                            field.onChange(value);
                            setType(value as "fixed" | "installment");
                          }}
                          value={field.value}
                          className="space-y-3"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="fixed" id="fixed" data-testid="radio-fixed" />
                            <Label htmlFor="fixed" className="font-normal cursor-pointer">
                              Fixo (mensal recorrente)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem
                              value="installment"
                              id="installment"
                              data-testid="radio-installment"
                            />
                            <Label htmlFor="installment" className="font-normal cursor-pointer">
                              Parcelado
                            </Label>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {type === "installment" && (
                  <FormField
                    control={form.control}
                    name="totalInstallments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Parcelas</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Ex: 12"
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value)}
                            data-testid="input-installments"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-status">
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pending">Pendente</SelectItem>
                          <SelectItem value="paid">Pago</SelectItem>
                          <SelectItem value="overdue">Vencido</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {type === "installment" && form.watch("totalInstallments") && (
                  <div className="p-4 bg-muted rounded-md space-y-2">
                    <p className="text-sm font-medium">Resumo do Parcelamento</p>
                    <p className="text-xs text-muted-foreground">
                      Total de parcelas: {form.watch("totalInstallments")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Valor total: R${" "}
                      {form.watch("value")
                        ? parseFloat(form.watch("value")).toFixed(2)
                        : "0,00"}
                    </p>
                    <p className="text-xs font-medium text-foreground">
                      Valor por parcela: R${" "}
                      {form.watch("value")
                        ? (
                            parseFloat(form.watch("value")) /
                            (form.watch("totalInstallments") || 1)
                          ).toFixed(2)
                        : "0,00"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2 border-t pt-2">
                      ℹ️ As próximas parcelas serão criadas automaticamente no mesmo dia dos meses seguintes
                    </p>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel"
              >
                Cancelar
              </Button>
              <Button type="submit" data-testid="button-save">
                {expense ? "Atualizar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
