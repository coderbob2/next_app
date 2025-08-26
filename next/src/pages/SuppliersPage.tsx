import { useState, useMemo, useEffect } from "react";
import { useFrappeGetDocList, useFrappeGetDocCount } from "frappe-react-sdk";
import type { Filter } from "frappe-react-sdk";
import { ArrowUp, ArrowDown, Plus, FileDown, ChevronLeft, ChevronRight } from "lucide-react";
import * as XLSX from "xlsx";
import { useDebounce } from "@/lib/useDebounce";
import { getColumns } from "@/features/suppliers/columns";
import SupplierForm from "@/features/suppliers/SupplierForm";
import SupplierDetailsDialog from "@/features/suppliers/SupplierDetailsDialog";
import type { Supplier } from "@/types/Buying/Supplier";
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

interface Sort {
  field: string;
  order: 'asc' | 'desc';
}

const Exporter = ({ filters, onExported }: { filters: Filter[], onExported: () => void }) => {
  const { data: allSuppliers, isLoading } = useFrappeGetDocList<Supplier>("Supplier", {
    fields: ["name", "supplier_name", "custom_phone", "custom_email", "supplier_type"],
    filters,
    limit: 0,
  });

  useEffect(() => {
    if (allSuppliers && !isLoading) {
      const worksheet = XLSX.utils.json_to_sheet(
        allSuppliers.map((s) => ({
          "Supplier Name": s.supplier_name,
          "Supplier Type": s.supplier_type,
          "Phone": s.custom_phone,
          "Email": s.custom_email,
        }))
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Suppliers");
      XLSX.writeFile(workbook, "Suppliers.xlsx");
      onExported();
    }
  }, [allSuppliers, isLoading, onExported]);

  return null;
};

export default function SuppliersPage() {
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<Sort>({ field: 'name', order: 'asc' });
  const [supplierName, setSupplierName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [exporting, setExporting] = useState(false);

  const debouncedSupplierName = useDebounce(supplierName, 500);
  const debouncedMobileNo = useDebounce(mobileNo, 500);

  const filters: Filter[] = [];
  if (debouncedSupplierName) {
    filters.push(["supplier_name", "like", `%${debouncedSupplierName}%`]);
  }
  if (debouncedMobileNo) {
    filters.push(["custom_phone", "like", `%${debouncedMobileNo}%`]);
  }

  const { data: supplierCount, mutate: mutateCount } = useFrappeGetDocCount("Supplier", filters);

  const { data: suppliers, isLoading, error, mutate } = useFrappeGetDocList<Supplier>("Supplier", {
    fields: ["name", "supplier_name", "custom_phone", "custom_email", "supplier_type"],
    limit_start: (page - 1) * pageSize,
    limit: pageSize,
    orderBy: sort,
    filters,
  });

  const columns = useMemo(() => getColumns(mutate, mutateCount, () => setSelectedSupplier(null)), [mutate, mutateCount]);

  const totalPages = supplierCount ? Math.ceil(supplierCount / pageSize) : 1;

  const handleExport = () => {
    setExporting(true);
  };

  const onExported = () => {
    setExporting(false);
  };

  return (
    <div className="p-4 overflow-x-hidden">
      {selectedSupplier && (
        <SupplierDetailsDialog
          name={selectedSupplier}
          onClose={() => setSelectedSupplier(null)}
        />
      )}
      {exporting && <Exporter filters={filters} onExported={onExported} />}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0">Suppliers</h1>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto sm:justify-end">
          <Input
            placeholder="Filter by name..."
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            className="w-full sm:w-64"
          />
          <Input
            placeholder="Filter by mobile..."
            value={mobileNo}
            onChange={(e) => setMobileNo(e.target.value)}
            className="w-full sm:w-64"
          />
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Supplier</DialogTitle>
              </DialogHeader>
              <SupplierForm
                onClose={() => setShowForm(false)}
                mutate={mutate}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleExport} variant="outline" disabled={exporting || !suppliers || suppliers.length === 0}>
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
            {isLoading && <TableRow><TableCell colSpan={columns.length}>Loading...</TableCell></TableRow>}
            {error && <TableRow><TableCell colSpan={columns.length}>{error.message}</TableCell></TableRow>}
            {suppliers?.map((supplier, index) => (
              <TableRow
                key={supplier.name}
                className={`h-10 ${index % 2 === 0 ? 'bg-gray-50' : ''} cursor-pointer`}
                onClick={() => setSelectedSupplier(supplier.name)}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.id || column.accessorKey as string}
                    className="py-1"
                    onClick={(e) => {
                      if (column.id !== "actions") {
                        setSelectedSupplier(supplier.name);
                      } else {
                        e.stopPropagation();
                      }
                    }}
                  >
                    {column.cell ? column.cell({ row: { original: supplier } }) : supplier[column.accessorKey as keyof Supplier]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between py-4">
        <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
          Showing {Math.min(page * pageSize, supplierCount ?? 0)} of {supplierCount} suppliers
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
