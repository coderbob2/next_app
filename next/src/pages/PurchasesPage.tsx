import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFrappeGetDocList, useFrappeGetDocCount } from "frappe-react-sdk";
import type { Filter } from "frappe-react-sdk";
import { ArrowUp, ArrowDown, Plus, FileDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { useDebounce } from "@/lib/useDebounce";
import { getColumns } from "@/features/purchase_invoices/columns";
import type { PurchaseInvoice } from "@/types/Accounts/PurchaseInvoice";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/ui/daterangepicker";
import type { DateRange } from "react-day-picker";
import { DropdownFilter } from "@/components/ui/dropdown-filter";
import { RenderContent } from "@/components/ui/renderContent";

interface Sort {
  field: string;
  order: 'asc' | 'desc';
}

const columnFields: (keyof PurchaseInvoice)[] = ["name", "supplier", "posting_date", "posting_time", "grand_total", "status", "owner", "creation", "currency"];

const Exporter = ({ filters, onExported }: { filters: Filter[], onExported: () => void }) => {
  const { data: allInvoices, isLoading } = useFrappeGetDocList<PurchaseInvoice>("Purchase Invoice", {
    fields:columnFields,
    filters,
    limit: 0,
  });

  useEffect(() => {
    if (allInvoices && !isLoading) {
      const worksheet = XLSX.utils.json_to_sheet(allInvoices);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Purchase Invoices");
      XLSX.writeFile(workbook, "PurchaseInvoices.xlsx");
      onExported();
    }
  }, [allInvoices, isLoading, onExported]);

  return null;
};

export default function PurchasesPage() {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<Sort>({ field: 'name', order: 'asc' });
  const [supplier, setSupplier] = useState("");
  const [invoiceName, setInvoiceName] = useState("");
  const [status, setStatus] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [exporting, setExporting] = useState(false);

  const debouncedSupplier = useDebounce(supplier, 500);
  const debouncedInvoiceName = useDebounce(invoiceName, 500);

  const filters: Filter[] = [];
  if (debouncedSupplier) {
    filters.push(["supplier", "like", `%${debouncedSupplier}%`]);
  }
  if (debouncedInvoiceName) {
    filters.push(["name", "like", `%${debouncedInvoiceName}%`]);
  }
  if (status) {
    filters.push(["status", "=", status]);
  }
  if (dateRange?.from && dateRange?.to) {
    filters.push(["posting_date", "between", [format(dateRange.from, "yyyy-MM-dd"), format(dateRange.to, "yyyy-MM-dd")]]);
  }

  const { data: invoiceCount, mutate: mutateCount } = useFrappeGetDocCount("Purchase Invoice", filters);

  const { data: invoices, isLoading, error, mutate } = useFrappeGetDocList<PurchaseInvoice>("Purchase Invoice", {
    fields: columnFields,
    limit_start: (page - 1) * pageSize,
    limit: pageSize,
    orderBy: sort,
    filters,
  });

  const columns = useMemo(() => getColumns(), []);

  const totalPages = invoiceCount ? Math.ceil(invoiceCount / pageSize) : 1;

  const handleExport = () => {
    setExporting(true);
  };

  const onExported = () => {
    setExporting(false);
  };

  const navigate = useNavigate();

  const handleAddClick = () => {
    navigate("/purchases/new");
  };

  const clearFilters = () => {
    setSupplier("");
    setInvoiceName("");
    setStatus("");
    setDateRange(undefined);
  };

  const statusOptions = [
    { value: "Draft", label: "Draft" },
    { value: "Submitted", label: "Submitted" },
    { value: "Paid", label: "Paid" },
    { value: "Unpaid", label: "Unpaid" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  return (
    <div className="p-4 overflow-x-hidden">
      {exporting && <Exporter filters={filters} onExported={onExported} />}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Purchase Invoices</h1>
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Purchase Invoice
        </Button>
      </div>
      <div className="flex items-center space-x-2 mb-4">
        <Input
          placeholder="Filter by supplier..."
          value={supplier}
          className="w-48"
          onChange={(e) => setSupplier(e.target.value)}
        />
        <Input
          placeholder="Filter by Invoice ID..."
          value={invoiceName}
          onChange={(e) => setInvoiceName(e.target.value)}
          className="w-48"
        />
        <DropdownFilter
          value={status}
          onValueChange={setStatus}
          placeholder="Status"
          items={statusOptions}
        />
        <DateRangePicker date={dateRange} onSelect={setDateRange} />
        {(supplier || invoiceName || status || dateRange) && (
          <Button onClick={clearFilters} variant="ghost" size="icon">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleExport} variant="outline" disabled={exporting || !invoices || invoices.length === 0}>
          {exporting ? "Exporting..." : <><FileDown className="mr-2 h-4 w-4" /> Export to Excel</>}
        </Button>
      </div>
      <div className="rounded-md border min-h-[400px] overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="bg-gray-200">
              {columns.map((column) => (
                <TableHead 
                  key={column.accessorKey as string} 
                  onClick={() => {
                    if (column.accessorKey) {
                      if (sort.field === column.accessorKey) {
                        setSort({ ...sort, order: sort.order === 'asc' ? 'desc' : 'asc' });
                      } else {
                        setSort({ field: column.accessorKey as string, order: 'asc' });
                      }
                    }
                  }}
                  className={`${column.accessorKey ? "cursor-pointer" : ""} py-2 font-bold`}
                >
                  <div className="flex items-center">
                    {column.header as React.ReactNode}
                    {column.accessorKey && sort.field === column.accessorKey && (
                      sort.order === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <RenderContent
              isLoading={isLoading}
              error={error}
              data={invoices}
              columns={columns}
              renderRow={(invoice, index) => (
                <TableRow
                  key={invoice.name}
                  className={`h-10 ${index % 2 === 0 ? 'bg-gray-50' : ''} cursor-pointer`}
                  onClick={() => navigate(`/purchases/${invoice.name}`)}
                >
                  {columns.map((column) => (
                    <TableCell key={column.accessorKey as string} className="py-1">
                      {column.cell ? column.cell({ row: { original: invoice } }) : invoice[column.accessorKey as keyof PurchaseInvoice]}
                    </TableCell>
                  ))}
                </TableRow>
              )}
            />
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between py-4">
        <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
          Showing {Math.min(page * pageSize, invoiceCount ?? 0)} of {invoiceCount} invoices
        </div>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <Select value={`${pageSize}`} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Items per page" />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50].map(size => (
                <SelectItem key={size} value={`${size}`}>{size} per page</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">Page {page} of {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
