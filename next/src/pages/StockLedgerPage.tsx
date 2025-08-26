import { useState, useEffect, useCallback } from "react";
import type { DateRange } from "react-day-picker"
import { useLocation } from "react-router-dom";
import { useFrappePostCall, useFrappeGetDocList } from "frappe-react-sdk";
import { DateRangePicker } from "@/components/ui/daterangepicker";
import { Combobox } from "@/components/ui/combobox";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUp, ArrowDown, FileDown, ChevronLeft, ChevronRight } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import * as XLSX from "xlsx";

export default function StockLedgerPage() {
  const location = useLocation();
  const item_code = location.state?.item_code;

  const [warehouse, setWarehouse] = useState("");
  const [itemCode, setItemCode] = useState(item_code || "");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const to = new Date();
    const from = new Date();
    from.setMonth(from.getMonth() - 1);
    return { from, to };
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [reportData, setReportData] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [sort, setSort] = useState<{ field: string; order: "asc" | "desc" }>({ field: "posting_date", order: "asc" });
  const [exporting, setExporting] = useState(false);

  const { call } = useFrappePostCall("frappe.desk.query_report.run");
  const { data: warehouses } = useFrappeGetDocList("Warehouse", { fields: ["name"], limit: 100 });
  const { data: items } = useFrappeGetDocList("Item", { fields: ["item_code", "item_name"], limit: 100 });

  const fetchReport = useCallback(() => {
    const filters: Record<string, any> = {};
    if (warehouse && warehouse !== "All Warehouses") filters.warehouse = warehouse;
    if (itemCode && itemCode !== "All Items") filters.item_code = itemCode;
    if (dateRange?.from) filters.from_date = dateRange.from.toISOString().split("T")[0];
    if (dateRange?.to) filters.to_date = dateRange.to.toISOString().split("T")[0];
    filters.page_length = pageSize;
    filters.start = (page - 1) * pageSize;

    call({
      report_name: "Stock Ledger Report",
      filters,
      order_by: sort.field,
      order: sort.order,
      ignore_prepared_report: true
    }).then((res) => {
      setColumns(res.message.columns);
      setReportData(res.message.result);
      setTotal(res.message.report_summary?.total ?? 0);
    });
  }, [warehouse, itemCode, dateRange, page, pageSize, sort, call]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const exportReport = useCallback(() => {
    setExporting(true);
    const filters: Record<string, any> = {};
    if (warehouse && warehouse !== "All Warehouses") filters.warehouse = warehouse;
    if (itemCode && itemCode !== "All Items") filters.item_code = itemCode;
    if (dateRange?.from) filters.from_date = dateRange.from.toISOString().split("T")[0];
    if (dateRange?.to) filters.to_date = dateRange.to.toISOString().split("T")[0];

    call({
      report_name: "Stock Ledger Report",
      filters,
      order_by: sort.field,
      order: sort.order,
      ignore_prepared_report: true
    }).then((res) => {
      const exportData = res.message.result;
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "StockLedger");
      XLSX.writeFile(workbook, "StockLedger.xlsx");
    }).finally(() => {
      setExporting(false);
    });
  }, [warehouse, itemCode, dateRange, sort, call]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Stock Ledger Report</h1>
        <Button onClick={exportReport} variant="outline" disabled={exporting || reportData.length === 0}>
          {exporting ? "Exporting..." : <><FileDown className="mr-2 h-4 w-4" /> Export</>}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 mb-4">
        <DateRangePicker date={dateRange} onSelect={setDateRange} />
        <Combobox options={[{label:"All Items",value:"All Items"}, ...(items?.map(i=>({label:i.item_code+"-"+i.item_name,value:i.item_code}))??[])]} value={itemCode} onChange={setItemCode}/>
        <Combobox options={[{label:"All Warehouses",value:"All Warehouses"}, ...(warehouses?.map(w=>({label:w.name,value:w.name}))??[])]} value={warehouse} onChange={setWarehouse}/>
        {item_code && <Button onClick={() => setItemCode("")} variant="outline">Clear Filter</Button>}
        </div>

      {/* Table */}
      <div className="rounded-md border min-h-[400px] overflow-x-auto">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="bg-gray-200">
              {columns.map(c => <TableHead key={c.fieldname} className="py-2 font-bold">{c.label}</TableHead>)}
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportData.map((row, idx) => (
              <TableRow key={`${row.name}-${idx}`} className={`h-10 ${idx % 2 === 0 ? 'bg-gray-50' : ''}`}>
                {columns.map((c) => {
                  const cell = row[c.fieldname] ?? "";
                  return (
                    <TableCell key={c.fieldname} className="py-1">
                      {c.fieldname === "item_name" ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="overflow-hidden text-ellipsis break-words [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] cursor-pointer">{cell}</div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="bg-gray-900 text-white text-sm px-2 py-1 rounded-md max-w-xs">{cell}</TooltipContent>
                        </Tooltip>
                      ) : cell}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between py-4">
        <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
          Showing {Math.min(page * pageSize, total ?? 0)} of {total} records
        </div>
        <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
          <Select value={`${pageSize}`} onValueChange={(value) => setPageSize(Number(value))}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Records per page" />
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
