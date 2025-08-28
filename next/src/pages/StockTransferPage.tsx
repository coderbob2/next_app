import { useState, useMemo } from "react";
import { useFrappeGetDocList, useFrappeGetDocCount } from "frappe-react-sdk";
import type { Filter } from "frappe-react-sdk";
import { ArrowUp, ArrowDown, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useDebounce } from "@/lib/useDebounce";
import { getColumns } from "@/features/stock/columns";
import StockTransferForm from "@/features/stock/StockTransferForm";
import type { StockEntry } from "@/types/Stock/StockEntry";
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

interface Sort {
  field: string;
  order: 'asc' | 'desc';
}

export default function StockTransferPage() {
  const [showForm, setShowForm] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<Sort>({ field: 'name', order: 'asc' });
  const [docname, setDocname] = useState("");

  const debouncedDocname = useDebounce(docname, 500);

  const filters: Filter[] = [
    ["stock_entry_type", "=", "Material Transfer"]
  ];
  if (debouncedDocname) {
    filters.push(["name", "like", `%${debouncedDocname}%`]);
  }

  const { data: stockEntryCount, mutate: mutateCount } = useFrappeGetDocCount("Stock Entry", filters);

  const { data: stockEntries, isLoading, error, mutate } = useFrappeGetDocList<StockEntry>("Stock Entry", {
    fields: ["name", "from_warehouse", "to_warehouse", "posting_date", "posting_time", "total_amount"],
    limit_start: (page - 1) * pageSize,
    limit: pageSize,
    orderBy: sort,
    filters,
  });

  const columns = useMemo(() => getColumns(mutate, mutateCount), [mutate, mutateCount]);

  const totalPages = stockEntryCount ? Math.ceil(stockEntryCount / pageSize) : 1;

  return (
    <div className="p-4 overflow-x-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0">Stock Transfer</h1>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto sm:justify-end">
          <Input
            placeholder="Filter by name..."
            value={docname}
            onChange={(e) => setDocname(e.target.value)}
            className="w-full sm:w-64"
          />
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Transfer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New Stock Transfer</DialogTitle>
              </DialogHeader>
              <StockTransferForm
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
              {columns.map((column: { accessorKey: string; header: string }) => (
                <TableHead
                  key={column.accessorKey}
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
              data={stockEntries}
              columns={columns}
              renderRow={(entry, index) => (
                <TableRow
                  key={entry.name}
                  className={`h-10 ${index % 2 === 0 ? 'bg-gray-50' : ''} cursor-pointer`}
                >
                  {columns.map((column: { accessorKey: string; header: string }) => (
                    <TableCell key={column.accessorKey} className="py-1">
                      {entry[column.accessorKey as keyof StockEntry]}
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
          Showing {Math.min(page * pageSize, stockEntryCount ?? 0)} of {stockEntryCount} entries
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