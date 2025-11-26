import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import type { Expense } from "@shared/schema";
import jsPDF from "jspdf";
import * as XLSX from "xlsx";

export function ExportReports() {
  const [isExporting, setIsExporting] = useState(false);
  const { data: expenses } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });
  const { toast } = useToast();

  const formatCurrency = (value: string | number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(typeof value === "string" ? parseFloat(value) : value);
  };

  const exportToPDF = () => {
    setIsExporting(true);
    try {
      if (!expenses) return;

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPosition = 20;

      doc.setFontSize(18);
      doc.text("Relatório de Gastos", pageWidth / 2, yPosition, {
        align: "center",
      });

      yPosition += 15;
      doc.setFontSize(10);
      doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, pageWidth / 2, yPosition, {
        align: "center",
      });

      yPosition += 15;

      const headers = ["Nome", "Categoria", "Valor", "Vencimento", "Status", "Tipo"];
      const tableData = expenses.map((exp) => [
        exp.name,
        exp.category,
        formatCurrency(exp.value),
        new Date(exp.dueDate).toLocaleDateString("pt-BR"),
        exp.status === "paid" ? "Pago" : exp.status === "pending" ? "Pendente" : "Vencido",
        exp.type === "fixed" ? "Fixo" : `${exp.paidInstallments || 0}/${exp.totalInstallments}`,
      ]);

      let yPos = yPosition;
      const rowHeight = 8;
      const colWidth = [40, 35, 28, 30, 25, 25];

      doc.setFontSize(9);
      doc.setFont(undefined, "bold");
      headers.forEach((header, i) => {
        let xPos = 10;
        for (let j = 0; j < i; j++) xPos += colWidth[j];
        doc.text(header, xPos, yPos);
      });

      yPos += rowHeight;
      doc.setFont(undefined, "normal");
      doc.setFontSize(8);

      tableData.forEach((row) => {
        if (yPos + rowHeight > pageHeight - 10) {
          doc.addPage();
          yPos = 10;
        }

        let xPos = 10;
        row.forEach((cell, i) => {
          doc.text(String(cell), xPos, yPos);
          xPos += colWidth[i];
        });
        yPos += rowHeight;
      });

      doc.save("relatorio-gastos.pdf");
      toast({
        title: "PDF exportado",
        description: "O relatório foi baixado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível exportar o PDF.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = () => {
    setIsExporting(true);
    try {
      if (!expenses) return;

      const data = expenses.map((exp) => ({
        Nome: exp.name,
        Categoria: exp.category,
        Valor: parseFloat(exp.value),
        Vencimento: new Date(exp.dueDate).toLocaleDateString("pt-BR"),
        Status:
          exp.status === "paid" ? "Pago" : exp.status === "pending" ? "Pendente" : "Vencido",
        Tipo: exp.type === "fixed" ? "Fixo" : `${exp.paidInstallments || 0}/${exp.totalInstallments}`,
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Gastos");

      // Format currency column
      ws["!cols"] = [
        { wch: 30 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 12 },
        { wch: 15 },
      ];

      XLSX.writeFile(wb, "relatorio-gastos.xlsx");
      toast({
        title: "Excel exportado",
        description: "O relatório foi baixado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível exportar o Excel.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <DropdownMenu>
      <Button
        variant="outline"
        size="sm"
        disabled={!expenses || expenses.length === 0 || isExporting}
        data-testid="button-export-reports"
      >
        {isExporting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Exportando...
          </>
        ) : (
          <>
            <FileDown className="h-4 w-4 mr-2" />
            Exportar
          </>
        )}
      </Button>

      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Formato</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={exportToPDF} data-testid="option-export-pdf">
          Exportar como PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel} data-testid="option-export-excel">
          Exportar como Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
