import { type FC, useState, useEffect, useMemo } from "react";
import {
  Table as TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ChevronDown, Loader2, Search } from "lucide-react";
import { useFrappeGetDocList } from "frappe-react-sdk";

interface ColumnConfig<T> {
  key: keyof T;
  title: string;
  visible: boolean;
}

interface Props<T> {
  doctype: string;
  columns: ColumnConfig<T>[];
  filterFields?: (keyof T)[];
  defaultPageSize?: number;
  title?: string;
  Form: FC<{ data?: T; onClose: () => void; refetch: () => void }>;
}

export const GenericDocTypeTable = <T extends Record<string, any>>({
  doctype,
  columns: initialCols,
  filterFields = [],
  defaultPageSize = 10,
  Form,
}: Props<T>) => {
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const [visibleColumnKeys, setVisibleColumnKeys] = useState(new Set<string>());

  useEffect(() => {
    setFilters(filterFields.reduce((acc, field) => ({ ...acc, [String(field)]: "" }), {} as Record<string, string>));
    setPage(1);
    setVisibleColumnKeys(new Set(initialCols.map(c => c.key as string)));
  }, [doctype, initialCols, filterFields]);

  const columns = useMemo(() => {
    return initialCols.map(col => ({
      ...col,
      visible: visibleColumnKeys.has(col.key as string)
    }));
  }, [initialCols, visibleColumnKeys]);

  const offset = (page - 1) * pageSize;

  const erpnextFilters = useMemo(() => {
    return Object.entries(filters)
      .filter(([, value]) => value && value.trim() !== "")
      .map(([field, value]) => [field, "like", `%${value}%`]);
  }, [filters]);

  const { data: rows, isLoading, error } = useFrappeGetDocList<T>(doctype, {
    filters: erpnextFilters as any,
    limit_start: offset,
    limit: pageSize,
    fields: ["*"],
  });

  const { data: countData } = useFrappeGetDocList<T>(doctype, {
    filters: erpnextFilters as any,
    limit: 0,
  });
  const total = countData?.length ?? 0;

  const totalPages = useMemo(
    () => Math.ceil(total / pageSize),
    [total, pageSize]
  );

  useEffect(() => {
    setPage(1);
  }, [filters, pageSize]);

  const handleColumnToggle = (key: keyof T) => {
    setVisibleColumnKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key as string)) {
        newSet.delete(key as string);
      } else {
        newSet.add(key as string);
      }
      return newSet;
    });
  };

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {filterFields.map(field => {
            const column = columns.find(c => c.key === field);
            return (
              <div key={String(field)} className="relative flex-1 max-w-xs">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10"
                  placeholder={`Search ${column?.title || String(field)}...`}
                  value={filters[String(field)] || ""}
                  onChange={e => handleFilterChange(String(field), e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
            );
          })}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                Columns <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {columns.map(col => (
                <DropdownMenuCheckboxItem
                  key={String(col.key)}
                  checked={col.visible}
                  onCheckedChange={() => handleColumnToggle(col.key)}
                >
                  {col.title}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
      </div>

      <div className="overflow-x-auto">
        <TableRoot>
          <TableHeader>
            <TableRow>
              {columns.filter(c => c.visible).map(c => (
                <TableHead
                  key={String(c.key)}
                  className="text-gray-700 font-semibold"
                >
                  {c.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.filter(c => c.visible).length}
                  className="text-center py-8"
                >
                  <Loader2 className="h-6 w-6 animate-spin text-gray-500 mx-auto" />
                  <span className="ml-2 text-gray-500">Loading {doctype}...</span>
                </TableCell>
              </TableRow>
            ) : rows?.length ? (
              rows.map((row, idx) => (
                <TableRow
                  key={idx}
                  className="hover:bg-gray-50 transition-colors"
                >
                  {columns
                    .filter(c => c.visible)
                    .map(c => (
                      <TableCell key={String(c.key)}>
                        {String(row[c.key] ?? "-")}
                      </TableCell>
                    ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.filter(c => c.visible).length}
                  className="text-center text-gray-500 py-8"
                >
                  No records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </TableRoot>
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>
            Showing {(page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, total)} of{" "}
            {total} entries
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={value => {
              setPageSize(Number(value));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map(size => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span>rows per page</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            disabled={page >= totalPages || totalPages === 0}
            onClick={() => setPage(p => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
};
