import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFrappeGetDocList, useFrappeGetDocCount } from "frappe-react-sdk";
import type { Filter } from "frappe-react-sdk";
import { ArrowUp, ArrowDown, Plus, FileDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import * as XLSX from "xlsx";
import { format } from "date-fns";
import { useDebounce } from "@/lib/useDebounce";
import { getColumns } from "@/features/payment_entry/columns";
import type { PaymentEntry } from "@/types/Accounts/PaymentEntry";
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
import PaymentEntryDialog from "@/features/payment_entry/components/PaymentEntryDialog";

interface Sort {
  field: string;
  order: 'asc' | 'desc';
}

interface PaymentEntryProps {
    partyType: 'Customer' | 'Supplier'
}

const columnFields: (keyof PaymentEntry)[] = ["name", "party_type", "party", "posting_date", "paid_amount", "creation", "docstatus", "owner"];

const Exporter = ({ filters, onExported }: { filters: Filter[], onExported: () => void }) => {
  const { data: allPaymentEntries, isLoading } = useFrappeGetDocList<PaymentEntry>("Payment Entry", {
    fields: columnFields,
    filters,
    limit: 0,
  });

  useEffect(() => {
    if (allPaymentEntries && !isLoading) {
      const worksheet = XLSX.utils.json_to_sheet(allPaymentEntries);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Payment Entries");
      XLSX.writeFile(workbook, "PaymentEntries.xlsx");
      onExported();
    }
  }, [allPaymentEntries, isLoading, onExported]);

  return null;
};

export default function PaymentEntryPage({ partyType } : PaymentEntryProps) {
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<Sort>({ field: 'name', order: 'asc' });
  const [party, setParty] = useState("");
  const [paymentEntryName, setPaymentEntryName] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [exporting, setExporting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const debouncedParty = useDebounce(party, 500);
  const debouncedPaymentEntryName = useDebounce(paymentEntryName, 500);

  const filters: Filter[] = [];
  filters.push(["party_type", "=", partyType]);
  if (debouncedParty) {
    filters.push(["party", "like", `%${debouncedParty}%`]);
  }
  if (debouncedPaymentEntryName) {
    filters.push(["name", "like", `%${debouncedPaymentEntryName}%`]);
  }
  if (dateRange?.from && dateRange?.to) {
    filters.push(["posting_date", "between", [format(dateRange.from, "yyyy-MM-dd"), format(dateRange.to, "yyyy-MM-dd")]]);
  }

  const { data: paymentEntryCount, mutate: mutateCount } = useFrappeGetDocCount("Payment Entry", filters);

  const { data: paymentEntries, isLoading, error, mutate } = useFrappeGetDocList<PaymentEntry>("Payment Entry", {
    fields: columnFields,
    limit_start: (page - 1) * pageSize,
    limit: pageSize,
    orderBy: sort,
    filters,
  });

  const columns = useMemo(() => getColumns(), []);

  const totalPages = paymentEntryCount ? Math.ceil(paymentEntryCount / pageSize) : 1;

  const handleExport = () => {
    setExporting(true);
  };

  const onExported = () => {
    setExporting(false);
  };

  const navigate = useNavigate();
  const handleAddClick = () => {
    setIsDialogOpen(true);
  };

  const clearFilters = () => {
    setParty("");
    setPaymentEntryName("");
    setDateRange(undefined);
  };
  const pageTitle = partyType === 'Customer' ? 'Customer Receipts' : 'Supplier Payments';
  const buttonText = partyType === 'Customer' ? 'Add Customer Receipt' : 'Add Supplier Payment';

  return (
    <div className="p-4 overflow-x-hidden">
      {exporting && <Exporter filters={filters} onExported={onExported} />}
      <PaymentEntryDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        paymentType={partyType === 'Customer' ? 'Receive' : 'Pay'}
        partyTypeSingular={partyType}
        mutate={mutate}
       />
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{pageTitle}</h1>
        <Button onClick={handleAddClick}>
          <Plus className="mr-2 h-4 w-4" />
          {buttonText}
        </Button>
      </div>
      <div className="flex items-center space-x-2 mb-4">
        <Input
          placeholder="Filter by party..."
          value={party}
          className="w-48"
          onChange={(e) => setParty(e.target.value)}
        />
        <Input
          placeholder="Filter by Payment Entry ID..."
          value={paymentEntryName}
          onChange={(e) => setPaymentEntryName(e.target.value)}
          className="w-48"
        />
        <DateRangePicker date={dateRange} onSelect={setDateRange} />
        {(party || paymentEntryName || dateRange) && (
          <Button onClick={clearFilters} variant="ghost" size="icon">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleExport} variant="outline" disabled={exporting || !paymentEntries || paymentEntries.length === 0}>
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
            {isLoading && <TableRow><TableCell colSpan={columns.length}>Loading...</TableCell></TableRow>}
            {error && <TableRow><TableCell colSpan={columns.length}>{error.message}</TableCell></TableRow>}
            {paymentEntries?.map((paymentEntry, index) => (
              <TableRow
                key={paymentEntry.name}
                className={`h-10 ${index % 2 === 0 ? 'bg-gray-50' : ''} cursor-pointer`}
                onClick={() => navigate(`/payment-entry/${paymentEntry.name}`)}
              >
                {columns.map((column) => (
                  <TableCell key={column.accessorKey as string} className="py-1">
                    {column.cell ? column.cell({ row: { original: paymentEntry } }) : paymentEntry[column.accessorKey as keyof PaymentEntry]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between py-4">
        <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
          Showing {Math.min(page * pageSize, paymentEntryCount ?? 0)} of {paymentEntryCount} payment entries
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