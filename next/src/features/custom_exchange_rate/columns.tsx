import type { CustomExchangeRate } from "@/types/NextApp/CustomExchangeRate";
import type { ColumnDef } from "@tanstack/react-table";
import { ActionsCell } from "./ActionsCell";

const columns: ColumnDef<CustomExchangeRate>[] = [
  {
    accessorKey: "date",
    header: "Date",
  },
  {
    accessorKey: "from_currency",
    header: "From Currency",
  },
  {
    accessorKey: "to_currency",
    header: "To Currency",
  },
  {
    accessorKey: "ex_rate",
    header: "Exchange Rate",
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ActionsCell
        name={row.original.name}
        mutate={() => {}}
        mutateCount={() => {}}
      />
    ),
  },
];

export const getColumns = (
    mutate: () => void,
    mutateCount: () => void
): ColumnDef<CustomExchangeRate>[] => columns.map(col => {
    if (col.id === 'actions') {
        return {
            ...col,
            cell: ({ row }) => (
                <ActionsCell
                    name={row.original.name}
                    mutate={mutate}
                    mutateCount={mutateCount}
                />
            )
        }
    }
    return col;
});