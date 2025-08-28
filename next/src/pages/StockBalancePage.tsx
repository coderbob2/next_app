import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import { useFrappeGetDocList } from "frappe-react-sdk";
import { ArrowUp, ArrowDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useDebounce } from "@/lib/useDebounce";
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
import { DropdownFilter } from "@/components/ui/dropdown-filter";
import { useStockBalance } from "@/features/stock/stockAPI";
import type { StockBalanceReportRow } from "@/features/stock/stockAPI";
import { RenderContent } from "@/components/ui/renderContent";

interface Sort {
    field: string;
    order: 'asc' | 'desc';
}

export default function StockBalancePage() {
    const [pageSize, setPageSize] = useState(10);
    const [page, setPage] = useState(1);
    const [sort, setSort] = useState<Sort>({ field: 'item_code', order: 'asc' });
    const [name, setName] = useState("");
    const [warehouse, setWarehouse] = useState("");
    const [data, setData] = useState<StockBalanceReportRow[]>([]);
    const [total, setTotal] = useState(0);

    const debouncedName = useDebounce(name, 500);

    const { call, loading, error } = useStockBalance();

    const { data: warehouses, isLoading: warehousesLoading } = useFrappeGetDocList('Warehouse', {
        fields: ['name'],
        limit: 1000
    });

    useEffect(() => {
        call({
            filters: {
                name,
                warehouse,
                limit_start: (page - 1) * pageSize,
                limit_page_length: pageSize,
                order_by: sort.field,
                order: sort.order,
            }
        }).then((res) => {
            setData(res.message[1]);
            setTotal(res.message[2]);
        })
    }, [debouncedName, warehouse, sort, page, pageSize]);

    const columns = useMemo(() => [
        { accessorKey: 'item_code', header: 'Item Code' },
        { accessorKey: 'item_name', header: 'Item Name' },
        { accessorKey: 'warehouse', header: 'Warehouse' },
        { accessorKey: 'in_qty', header: 'In Quantity' },
        { accessorKey: 'out_qty', header: 'Out Quantity' },
        { accessorKey: 'balance_qty', header: 'Balance Quantity' },
        { accessorKey: 'valuation_rate', header: 'Valuation Rate' },
        { accessorKey: 'balance_value', header: 'Balance Value' },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }: { row: { original: StockBalanceReportRow } }) => (
                <Link
                    to={`/stock-ledger`}
                    state={{ item_code: row.original.item_code }}
                >
                    View Ledger
                </Link>
            ),
        }
    ], []);

    const clearFilters = () => {
        setName("");
        setWarehouse("");
    };
    
    const warehouseOptions = useMemo(() => {
        if (!warehouses) return [];
        return warehouses.map((w) => ({ value: w.name, label: w.name }));
    }, [warehouses]);

    return (
        <div className="p-4 overflow-x-hidden">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Stock Balance</h1>
            </div>
            <div className="flex items-center space-x-2 mb-4">
                <Input
                    placeholder="Filter by item name..."
                    value={name}
                    className="w-48"
                    onChange={(e) => setName(e.target.value)}
                />
                <DropdownFilter
                    value={warehouse}
                    onValueChange={setWarehouse}
                    placeholder="Warehouse"
                    items={warehouseOptions}
                    loading={warehousesLoading}
                />
                {(name || warehouse) && (
                    <Button onClick={clearFilters} variant="ghost" size="icon">
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
            <div className="rounded-md border min-h-[400px] overflow-x-auto">
                <Table className="min-w-full">
                    <TableHeader>
                        <TableRow className="bg-gray-200">
                            {columns.map((column) => (
                                <TableHead
                                    key={column.accessorKey || column.id}
                                    onClick={() => {
                                        if (column.accessorKey) {
                                            if (sort.field === column.accessorKey) {
                                                setSort({ ...sort, order: sort.order === 'asc' ? 'desc' : 'asc' });
                                            } else {
                                                setSort({ field: column.accessorKey, order: 'asc' });
                                            }
                                        }
                                    }}
                                    className={`${column.accessorKey ? "cursor-pointer" : ""} py-2 font-bold`}
                                >
                                    <div className="flex items-center">
                                        {column.header}
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
                            isLoading={loading}
                            error={error}
                            data={data}
                            columns={columns}
                            renderRow={(row, index) => (
                                <TableRow
                                    key={`${row.item_code}-${row.warehouse}`}
                                    className={`h-10 ${index % 2 === 0 ? 'bg-gray-50' : ''}`}
                                >
                                    {columns.map((column) => (
                                        <TableCell key={column.accessorKey || column.id} className="py-1">
                                            {column.cell ? column.cell({ row: { original: row } }) : row[column.accessorKey as keyof StockBalanceReportRow]}
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
                    Showing {Math.min(page * pageSize, total ?? 0)} of {total} items
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
