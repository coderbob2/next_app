import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFrappeGetDocList, useFrappePostCall } from "frappe-react-sdk";
import { ArrowUp, ArrowDown, Plus, FileDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { useDebounce } from "@/lib/useDebounce";
import { getColumns } from "@/features/sales_invoices/columns";
import type { SalesInvoice } from "@/types/Accounts/SalesInvoice";
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

interface Sort {
  field: string;
  order: 'asc' | 'desc';
}

const Exporter = ({ invoices, onExported }: { invoices: SalesInvoice[], onExported: () => void }) => {
  useEffect(() => {
    if (invoices) {
      const worksheet = XLSX.utils.json_to_sheet(invoices);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Invoices");
      XLSX.writeFile(workbook, "SalesInvoices.xlsx");
      onExported();
    }
  }, [invoices, onExported]);

  return null;
};

interface Summary {
  currency: string;
  total_sales: number;
  paid_sales: number;
  credit_sales: number;
}

export default function SalesInvoicesPage() {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<Sort>({ field: 'name', order: 'asc' });
  const [customer, setCustomer] = useState("");
  const [invoiceName, setInvoiceName] = useState("");
  const [status, setStatus] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [warehouse, setWarehouse] = useState("");
  const [exporting, setExporting] = useState(false);
  const [invoices, setInvoices] = useState<SalesInvoice[]>([]);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState<Summary[]>([]);
  
  const debouncedCustomer = useDebounce(customer, 500);
  const debouncedInvoiceName = useDebounce(invoiceName, 500);

  const { call, loading, error } = useFrappePostCall('next_app.next_app.report.sales_invoice.sales_invoice.execute');

  const { data: warehouses, isLoading: warehousesLoading, error: warehousesError } = useFrappeGetDocList('Warehouse', {
    fields: ['name'],
    limit: 1000
  });

  useEffect(() => {
    let date_range;
    if (dateRange?.from) {
      const toDate = dateRange.to || dateRange.from;
      date_range = [format(dateRange.from, "yyyy-MM-dd"), format(toDate, "yyyy-MM-dd")];
    }
    call({
      filters: {
        customer: debouncedCustomer,
        name: debouncedInvoiceName,
        status,
        date_range,
        warehouse,
        limit_start: (page - 1) * pageSize,
        limit_page_length: pageSize,
        order_by: sort.field,
        order: sort.order,
      }
    }).then((res) => {
      setInvoices(res.message[1]);
      setTotal(res.message[2]);
      setSummary(res.message[3]);
    })
  }, [debouncedCustomer, debouncedInvoiceName, status, dateRange, sort, page, pageSize, warehouse]);

  const columns = useMemo(() => getColumns(), []);
  const handleExport = () => {
    setExporting(true);
  };

  const onExported = () => {
    setExporting(false);
  };

  const navigate = useNavigate();

  const handleAddClick = () => {
    navigate("/sales/new");
  };

  const clearFilters = () => {
    setCustomer("");
    setInvoiceName("");
    setStatus("");
    setDateRange(undefined);
    setWarehouse("");
  };

  const statusOptions = [
    { value: "Draft", label: "Draft" },
    { value: "Submitted", label: "Submitted" },
    { value: "Paid", label: "Paid" },
    { value: "Unpaid", label: "Unpaid" },
    { value: "Cancelled", label: "Cancelled" },
  ];

  const warehouseOptions = useMemo(() => {
    if (!warehouses) return [];
    return warehouses.map((w) => ({ value: w.name, label: w.name }));
  }, [warehouses]);

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(value);
  };

  return (
    <div className="p-4 overflow-x-hidden">
      {exporting && <Exporter invoices={invoices} onExported={onExported} />}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Sales Invoices</h1>
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Sales Invoice
        </Button>
      </div>
      <div className="flex items-center space-x-24 mb-4 p-4 bg-gray-50 rounded-lg">
        {summary.map((s) => (
          <div key={s.currency} className="flex flex-col">
            <span className="text-sm font-medium text-gray-500">{s.currency}</span>
            <span className="text-2xl font-bold">{formatCurrency(s.total_sales, s.currency)}</span>
            <div className="text-sm text-gray-800 mt-2">
              <div className="flex items-center">
                <span className="font-semibold">Paid:</span>
                <span className="ml-2">{formatCurrency(s.paid_sales, s.currency)}</span>
              </div>
              <div className="flex items-center mt-1">
                <span className="font-semibold">Credit:</span>
                <span className="ml-2">{formatCurrency(s.credit_sales, s.currency)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center space-x-2 mb-4">
        <Input
          placeholder="Filter by customer..."
          value={customer}
          className="w-48"
          onChange={(e) => setCustomer(e.target.value)}
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
        <DropdownFilter
          value={warehouse}
          onValueChange={setWarehouse}
          placeholder="Warehouse"
          items={warehouseOptions}
          loading={warehousesLoading}
        />
        {(customer || invoiceName || status || dateRange || warehouse) && (
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
            {loading && <TableRow><TableCell colSpan={columns.length}>Loading...</TableCell></TableRow>}
            {error && <TableRow><TableCell colSpan={columns.length}>{error.message}</TableCell></TableRow>}
            {invoices?.map((invoice, index) => (
              <TableRow
                key={invoice.name}
                className={`h-10 ${index % 2 === 0 ? 'bg-gray-50' : ''} cursor-pointer`}
                onClick={() => navigate(`/sales/${invoice.name}`)}
              >
                {columns.map((column) => (
                  <TableCell key={column.accessorKey as string} className="py-1">
                    {column.cell ? column.cell({ row: { original: invoice } }) : invoice[column.accessorKey as keyof SalesInvoice]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between py-4">
        <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
          Showing {Math.min(page * pageSize, total ?? 0)} of {total} invoices
        </div>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <Select value={`${pageSize}`} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Invoices per page" />
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
            <span className="text-sm">Page {page} of {Math.ceil(total / pageSize)}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === Math.ceil(total / pageSize)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
