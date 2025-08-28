import { useState, useMemo, useEffect } from "react";
import { useFrappeGetDocList, useFrappeGetDocCount } from "frappe-react-sdk";
import type { Filter } from "frappe-react-sdk";
import { ArrowUp, ArrowDown, Plus, FileDown, ChevronLeft, ChevronRight } from "lucide-react";
import * as XLSX from "xlsx";
import { useDebounce } from "@/lib/useDebounce";
import { getColumns } from "@/features/customers/columns";
import CustomerForm from "@/features/customers/CustomerForm";
import CustomerDetailsDialog from "@/features/customers/CustomerDetailsDialog";
import type { Customer } from "@/types/Selling/Customer";
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

const Exporter = ({ filters, onExported }: { filters: Filter[], onExported: () => void }) => {
  const { data: allCustomers, isLoading } = useFrappeGetDocList<Customer>("Customer", {
    fields: ["name", "customer_name", "custom_phone", "custom_email", "customer_type"],
    filters,
    limit: 0,
  });

  useEffect(() => {
    if (allCustomers && !isLoading) {
      const worksheet = XLSX.utils.json_to_sheet(
        allCustomers.map((c) => ({
          "Customer Name": c.customer_name,
          "Customer Type": c.customer_type,
          "Phone": c.custom_phone,
          "Email": c.custom_email,
        }))
      );
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");
      XLSX.writeFile(workbook, "Customers.xlsx");
      onExported();
    }
  }, [allCustomers, isLoading, onExported]);

  return null;
};

export default function CustomersPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<Sort>({ field: 'name', order: 'asc' });
  const [customerName, setCustomerName] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [exporting, setExporting] = useState(false);

  const debouncedCustomerName = useDebounce(customerName, 500);
  const debouncedMobileNo = useDebounce(mobileNo, 500);

  const filters: Filter[] = [];
  if (debouncedCustomerName) {
    filters.push(["customer_name", "like", `%${debouncedCustomerName}%`]);
  }
  if (debouncedMobileNo) {
    filters.push(["custom_phone", "like", `%${debouncedMobileNo}%`]);
  }

  const { data: customerCount, mutate: mutateCount } = useFrappeGetDocCount("Customer", filters);

  const { data: customers, isLoading, error, mutate } = useFrappeGetDocList<Customer>("Customer", {
    fields: ["name", "customer_name", "custom_phone", "custom_email", "customer_type"],
    limit_start: (page - 1) * pageSize,
    limit: pageSize,
    orderBy: sort,
    filters,
  });

  const columns = useMemo(() => getColumns(mutate, mutateCount, () => setSelectedCustomer(null)), [mutate, mutateCount]);

  const totalPages = customerCount ? Math.ceil(customerCount / pageSize) : 1;

  const handleExport = () => {
    setExporting(true);
  };

  const onExported = () => {
    setExporting(false);
  };

  return (
    <div className="p-4 overflow-x-hidden">
      {selectedCustomer && (
        <CustomerDetailsDialog
          name={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
        />
      )}
      {exporting && <Exporter filters={filters} onExported={onExported} />}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0">Customers</h1>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto sm:justify-end">
          <Input
            placeholder="Filter by name..."
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
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
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Customer</DialogTitle>
              </DialogHeader>
              <CustomerForm
                onClose={() => setShowForm(false)}
                mutate={mutate}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="flex justify-end mb-4">
        <Button onClick={handleExport} variant="outline" disabled={exporting || !customers || customers.length === 0}>
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
              data={customers}
              columns={columns}
              renderRow={(customer, index) => (
                <TableRow
                  key={customer.name}
                  className={`h-10 ${index % 2 === 0 ? 'bg-gray-50' : ''} cursor-pointer`}
                  onClick={() => setSelectedCustomer(customer.name)}
                >
                  {columns.map((column) => (
                    <TableCell
                      key={column.id || column.accessorKey as string}
                      className="py-1"
                      onClick={(e) => {
                        if (column.id !== "actions") {
                          setSelectedCustomer(customer.name);
                        } else {
                          e.stopPropagation();
                        }
                      }}
                    >
                      {column.cell ? column.cell({ row: { original: customer } }) : customer[column.accessorKey as keyof Customer]}
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
          Showing {Math.min(page * pageSize, customerCount ?? 0)} of {customerCount} customers
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
