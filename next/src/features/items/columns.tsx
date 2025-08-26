import type { Item } from "@/types/Stock/Item";
import type { KeyedMutator } from "swr";
import ActionsCell from "@/features/items/ActionsCell";

export const getColumns = (mutate: KeyedMutator<any>, mutateCount: KeyedMutator<any>) => [
  {
    accessorKey: "item_name",
    header: "Item Name",
  },
  {
    accessorKey: "item_group",
    header: "Item Group",
  },
  {
    accessorKey: "stock_uom",
    header: "Stock UOM",
  },
  {
    accessorKey: "standard_rate",
    header: "Selling Price",
  },
  {
    accessorKey: "valuation_rate",
    header: "Valuation Rate",
  },
  {
    id: "actions",
    cell: ({ row }: { row: { original: Item } }) => (
      <ActionsCell
        row={row}
        mutate={mutate}
        mutateCount={mutateCount}
      />
    ),
  },
];
