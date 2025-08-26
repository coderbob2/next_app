import type { StockEntry } from "@/types/Stock/StockEntry";
import type { KeyedMutator } from "swr";
export const getColumns = (mutate: KeyedMutator<any>, mutateCount: KeyedMutator<any>) => {
  return [
    {
      accessorKey: "name",
      header: "Name",
      id: "name"
    },
    {
      accessorKey: "from_warehouse",
      header: "From Warehouse",
      id: "from_warehouse"
    },
    {
      accessorKey: "to_warehouse",
      header: "To Warehouse",
      id: "to_warehouse"
    },
    {
      accessorKey: "posting_date",
      header: "Posting Date",
      id: "posting_date"
    },
    {
      accessorKey: "posting_time",
      header: "Posting Time",
      id: "posting_time"
    },
    {
      accessorKey: "total_amount",
      header: "Total Amount",
      id: "total_amount"
    },
  ]
};