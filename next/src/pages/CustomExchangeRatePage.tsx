import { useState, useMemo } from "react";
import { useFrappeGetDocList, useFrappeGetDocCount } from "frappe-react-sdk";
import type { Filter } from "frappe-react-sdk";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowUp, ArrowDown, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useDebounce } from "@/lib/useDebounce";
import { getColumns } from "@/features/custom_exchange_rate/columns";
import type { CustomExchangeRate } from "@/types/NextApp/CustomExchangeRate";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RenderContent } from "@/components/ui/renderContent";
import CustomExchangeRateForm from "../features/custom_exchange_rate/CustomExchangeRateForm";

interface Sort {
  field: string;
  order: 'asc' | 'desc';
}

export default function CustomExchangeRatePage() {
  const [showForm, setShowForm] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<Sort>({ field: 'date', order: 'desc' });
  const [fromCurrency, setFromCurrency] = useState("");
  const [toCurrency, setToCurrency] = useState("");

  const debouncedFromCurrency = useDebounce(fromCurrency, 500);
  const debouncedToCurrency = useDebounce(toCurrency, 500);

  const filters: Filter[] = [];
  if (debouncedFromCurrency) {
    filters.push(["from_currency", "like", `%${debouncedFromCurrency}%`]);
  }
  if (debouncedToCurrency) {
    filters.push(["to_currency", "like", `%${debouncedToCurrency}%`]);
  }

  const { data: exchangeRateCount, mutate: mutateCount } = useFrappeGetDocCount("Custom Exchange Rate", filters);

  const { data: exchangeRates, isLoading, error, mutate } = useFrappeGetDocList<CustomExchangeRate>("Custom Exchange Rate", {
    fields: ["name", "date", "from_currency", "to_currency", "ex_rate"],
    limit_start: (page - 1) * pageSize,
    limit: pageSize,
    orderBy: sort,
    filters,
  });

  const columns = useMemo(() => getColumns(mutate, mutateCount), [mutate, mutateCount]);

  const totalPages = exchangeRateCount ? Math.ceil(exchangeRateCount / pageSize) : 1;

  return (
    <div className="p-4 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0">Custom Exchange Rates</h1>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto sm:justify-end">
          <Input
            placeholder="Filter by from currency..."
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            className="w-full sm:w-64"
          />
          <Input
            placeholder="Filter by to currency..."
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            className="w-full sm:w-64"
          />
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Exchange Rate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Exchange Rate</DialogTitle>
              </DialogHeader>
              <CustomExchangeRateForm
                onClose={() => setShowForm(false)}
                mutate={mutate}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="rounded-md border min-h-[400px] overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="bg-gray-200">
              {columns.map((column) => (
                <TableHead
                  key={(column as ColumnDef<CustomExchangeRate>).id || (column as any).accessorKey}
                  onClick={() => {
                    const accessorKey = (column as any).accessorKey;
                    if (accessorKey) {
                      if (sort.field === accessorKey) {
                        setSort({ ...sort, order: sort.order === 'asc' ? 'desc' : 'asc' });
                      } else {
                        setSort({ field: accessorKey, order: 'asc' });
                      }
                    }
                  }}
                  className={`${(column as any).accessorKey ? "cursor-pointer" : ""} py-2 font-bold`}
                >
                  <div className="flex items-center">
                    {(column as ColumnDef<CustomExchangeRate>).header as React.ReactNode}
                    {(column as any).accessorKey && sort.field === (column as any).accessorKey && (
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
              data={exchangeRates}
              columns={columns}
              renderRow={(exchangeRate, index) => (
                <TableRow
                  key={exchangeRate.name}
                  className={`h-10 ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={(column as ColumnDef<CustomExchangeRate>).id || (column as any).accessorKey}
                      className="py-1"
                    >
                      {column.cell && typeof column.cell === 'function' ? column.cell({ row: { original: exchangeRate } } as any) : exchangeRate[(column as any).accessorKey as keyof CustomExchangeRate]}
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
          Showing {Math.min(page * pageSize, exchangeRateCount ?? 0)} of {exchangeRateCount} exchange rates
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