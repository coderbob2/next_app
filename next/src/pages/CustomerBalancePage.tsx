import { useState, useMemo, useEffect } from "react";
import { useFrappePostCall, useFrappeGetDocList } from "frappe-react-sdk";
import { RenderContent } from "@/components/ui/renderContent";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Combobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowUp, ArrowDown, FileDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import * as XLSX from "xlsx";
import { ActionsCell } from "@/features/customers/ActionsCell";

interface CustomerBalanceReportRow {
  customer: string;
  customer_name: string;
  total_amount: number;
  paid_amount: number;
  outstanding_amount: number;
}

interface Sort {
  field: string;
  order: 'asc' | 'desc';
}

interface Column {
  fieldname: string;
  label: string;
}

const Exporter = ({ data, onExported }: { data: CustomerBalanceReportRow[], onExported: () => void }) => {
  useEffect(() => {
    if (data) {
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Customer Balance");
      XLSX.writeFile(workbook, "CustomerBalance.xlsx");
      onExported();
    }
  }, [data, onExported]);

  return null;
};

interface Summary {
 label: string;
 value: number;
 indicator: string;
 currency?: string;
}

export default function CustomerBalancePage() {
  const [customer, setCustomer] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [sort, setSort] = useState<Sort>({ field: 'customer', order: 'asc' });
  const [exporting, setExporting] = useState(false);
  const [hideZeroBalances, setHideZeroBalances] = useState(false);

  const { data: customers } = useFrappeGetDocList("Customer", {
    fields: ["name", "customer_name"],
    limit: 100,
  });

  const { call, loading, error } = useFrappePostCall("frappe.desk.query_report.run");
  const [reportData, setReportData] = useState<CustomerBalanceReportRow[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [summary, setSummary] = useState<Summary[]>([]);

  useEffect(() => {
    call({
      report_name: "Customer Balance",
      filters: {
        customer: customer === "All Customers" ? "" : customer,
        hide_zero_balances: hideZeroBalances,
      },
      page_length: pageSize,
      start: (page - 1) * pageSize,
      order_by: sort.field,
      order: sort.order,
      ignore_prepared_report: true,
    }).then((res) => {
      setColumns(res.message.columns);
      setReportData(res.message.result);
      setTotal(res.message.result.length);
      setSummary(res.message.report_summary);
    });
  }, [customer, call, page, pageSize, sort, hideZeroBalances]);

  const handleExport = () => {
    setExporting(true);
  };

  const onExported = () => {
    setExporting(false);
  };

   const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(value);
  };
  
  return (
    <div className="p-4">
      {exporting && <Exporter data={reportData} onExported={onExported} />}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Customer Balance</h1>
      </div>
      <div className="flex items-center space-x-24 mb-4 p-4 bg-gray-50 rounded-lg">
       {Array.isArray(summary) && summary.map((s, index) => (
         <div key={index} className="flex flex-col">
           <span className="text-sm font-medium text-gray-500">{s.label}</span>
           <span className={`text-2xl font-bold ${s.indicator === 'Red' ? 'text-red-500' : ''}`}>
             {formatCurrency(s.value, s.currency || "ETB")}
           </span>
         </div>
       ))}
     </div>
      <div className="flex items-center space-x-2 mb-4">
        <Combobox
          options={[
            { label: "All Customers", value: "All Customers" },
            ...(customers?.map((s) => ({ label: s.customer_name, value: s.name })) ?? []),
          ]}
          value={customer}
          onChange={setCustomer}
          placeholder="Select a customer..."
          emptyText="No customers found."
        />
        <div className="flex items-center space-x-2 ml-4">
           <Checkbox id="hide-zero-balances" checked={hideZeroBalances} onCheckedChange={(checked) => setHideZeroBalances(checked as boolean)} />
           <label htmlFor="hide-zero-balances">Hide Zero Balances</label>
       </div>
       <Button onClick={handleExport} variant="outline" disabled={exporting || !reportData || reportData.length === 0} className="ml-auto">
           {exporting ? "Exporting..." : <><FileDown className="mr-2 h-4 w-4" /> Export to Excel</>}
       </Button>
      </div>
      <div className="rounded-md border min-h-[400px] overflow-x-auto mt-4">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.fieldname}
                  onClick={() => {
                    if (column.fieldname) {
                      if (sort.field === column.fieldname) {
                        setSort({ ...sort, order: sort.order === 'asc' ? 'desc' : 'asc' });
                      } else {
                        setSort({ field: column.fieldname, order: 'asc' });
                      }
                    }
                  }}
                  className={`${column.fieldname ? "cursor-pointer" : ""} py-2 font-bold`}
                >
                  <div className="flex items-center">
                    {column.label}
                    {column.fieldname && sort.field === column.fieldname && (
                      sort.order === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            <RenderContent
              isLoading={loading}
              error={error}
              data={reportData}
              columns={columns}
              renderRow={(row) => (
                <TableRow key={row.customer} className="h-10">
                  {columns.map((column) => (
                    <TableCell
                      key={column.fieldname}
                      className={`py-1`}
                    >
                      {row[column.fieldname as keyof CustomerBalanceReportRow]}
                    </TableCell>
                  ))}
                  <TableCell>
                    <ActionsCell customer={row.customer} />
                  </TableCell>
                </TableRow>
              )}
            />
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between py-4">
        <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
          Showing {Math.min(page * pageSize, total ?? 0)} of {total} records
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