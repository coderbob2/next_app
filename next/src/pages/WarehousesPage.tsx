import { useState, useMemo, useEffect } from "react";
import { useFrappeGetDocList, useFrappeGetDocCount } from "frappe-react-sdk";
import type { Filter } from "frappe-react-sdk";
import { ArrowUp, ArrowDown, Plus, FileDown, ChevronLeft, ChevronRight } from "lucide-react";
import * as XLSX from "xlsx";
import { useDebounce } from "@/lib/useDebounce";
import { getColumns } from "@/features/warehouses/columns";
import WarehouseForm from "@/features/warehouses/WarehouseForm";
import { useCompany } from "@/hooks/useCompany";
import type { Warehouse } from "@/types/Stock/Warehouse";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { RenderContent } from "@/components/ui/renderContent";

interface Sort {
  field: string;
  order: 'asc' | 'desc';
}

const Exporter = ({ filters, onExported }: { filters: Filter[], onExported: () => void }) => {
  const { data: allWarehouses, isLoading } = useFrappeGetDocList<Warehouse>("Warehouse", {
    fields: ["name", "warehouse_name", "is_group", "company", "custom_shop_no", "custom_phone_1", "custom_phone_2", "custom_cash_account"],
    filters,
    limit: 0,
  });

  useEffect(() => {
    if (allWarehouses && !isLoading) {
      const worksheet = XLSX.utils.json_to_sheet(
        allWarehouses.map((c) => ({
          "Warehouse Name": c.warehouse_name,
          "Is Group": c.is_group,
          "Company": c.company,
        }))
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Warehouses");
      XLSX.writeFile(workbook, "Warehouses.xlsx");
      onExported();
    }
  }, [allWarehouses, isLoading, onExported]);

  return null;
};

export default function WarehousesPage() {
  const [showForm, setShowForm] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<Sort>({ field: 'name', order: 'asc' });
  const [warehouseName, setWarehouseName] = useState("");
  const [exporting, setExporting] = useState(false);
  const company = useCompany();

  const debouncedWarehouseName = useDebounce(warehouseName, 500);

  const filters: Filter[] = [];
  if (debouncedWarehouseName) {
    filters.push(["warehouse_name", "like", `%${debouncedWarehouseName}%`]);
  }
  if (company && company.company) {
    filters.push(["company", "=", company.company]);
  }

  const { data: warehouseCount, mutate: mutateCount } = useFrappeGetDocCount("Warehouse", filters);

  const { data: warehouses, isLoading, error, mutate } = useFrappeGetDocList<Warehouse>("Warehouse", {
    fields: ["name", "warehouse_name", "is_group", "company", "custom_shop_no", "custom_phone_1", "custom_phone_2", "custom_cash_account"],
    limit_start: (page - 1) * pageSize,
    limit: pageSize,
    orderBy: sort,
    filters,
  });

  const columns = useMemo(() => getColumns(mutate, mutateCount), [mutate, mutateCount]);

  const totalPages = warehouseCount ? Math.ceil(warehouseCount / pageSize) : 1;

  const handleExport = () => {
    setExporting(true);
  };

  const onExported = () => {
    setExporting(false);
  };

  return (
    <div className="p-4 overflow-x-hidden">
      {exporting && <Exporter filters={filters} onExported={onExported} />}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0">Warehouses</h1>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto sm:justify-end">
          <Input
            placeholder="Filter by name..."
            value={warehouseName}
            onChange={(e) => setWarehouseName(e.target.value)}
            className="w-full sm:w-64"
          />
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Warehouse
              </Button>
            </DialogTrigger>
            <WarehouseForm
              onClose={() => setShowForm(false)}
              mutate={mutate}
            />
          </Dialog>
        </div>
      </div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleExport} variant="outline" disabled={exporting || !warehouses || warehouses.length === 0}>
          {exporting ? "Exporting..." : <><FileDown className="mr-2 h-4 w-4" /> Export to Excel</>}
        </Button>
      </div>
      <div className="rounded-md border min-h-[400px] overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="bg-gray-200">
              {columns.map((column) => (
                <TableHead
                  key={column.id || column.accessorKey as string}
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
              data={warehouses}
              columns={columns}
              renderRow={(warehouse) => (
                <TableRow
                  key={warehouse.name}
                  className={`h-10 cursor-pointer`}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.id || column.accessorKey as string}
                      className="py-1"
                    >
                      {column.cell ? column.cell({ row: { original: warehouse } }) : warehouse[column.accessorKey as keyof Warehouse]}
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
          Showing {Math.min(page * pageSize, warehouseCount ?? 0)} of {warehouseCount} warehouses
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
