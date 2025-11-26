import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import { useState } from "react";

interface ExpenseFiltersProps {
  onFilterChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}

export interface FilterState {
  category?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  type?: string;
}

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

export function ExpenseFilters({ onFilterChange, onClearFilters }: ExpenseFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({});

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFilterChange(updated);
  };

  const handleClear = () => {
    setFilters({});
    onClearFilters();
  };

  const hasActiveFilters = Object.values(filters).some((v) => v !== undefined && v !== "");

  return (
    <div className="space-y-4 p-4 bg-card rounded-lg border">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">Filtros Avançados</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-8"
            data-testid="button-clear-filters"
          >
            <X className="h-3 w-3 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Categoria
          </label>
          <Select
            value={filters.category || "all"}
            onValueChange={(value) =>
              handleFilterChange({ category: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger data-testid="filter-category" className="h-8 text-sm">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Status
          </label>
          <Select
            value={filters.status || "all"}
            onValueChange={(value) =>
              handleFilterChange({ status: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger data-testid="filter-status" className="h-8 text-sm">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="paid">Pago</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="overdue">Vencido</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Tipo
          </label>
          <Select
            value={filters.type || "all"}
            onValueChange={(value) =>
              handleFilterChange({ type: value === "all" ? undefined : value })
            }
          >
            <SelectTrigger data-testid="filter-type" className="h-8 text-sm">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="fixed">Fixo</SelectItem>
              <SelectItem value="installment">Parcelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            De
          </label>
          <Input
            type="date"
            value={filters.startDate || ""}
            onChange={(e) =>
              handleFilterChange({ startDate: e.target.value || undefined })
            }
            data-testid="filter-start-date"
            className="h-8 text-sm"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">
            Até
          </label>
          <Input
            type="date"
            value={filters.endDate || ""}
            onChange={(e) =>
              handleFilterChange({ endDate: e.target.value || undefined })
            }
            data-testid="filter-end-date"
            className="h-8 text-sm"
          />
        </div>
      </div>
    </div>
  );
}
