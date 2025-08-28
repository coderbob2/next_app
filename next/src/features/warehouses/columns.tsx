import type { Warehouse } from "../../types/Stock/Warehouse";
import type { KeyedMutator } from "swr";
import { ActionsCell } from "./ActionsCell";

export const getColumns = (mutate: KeyedMutator<any>, mutateCount: KeyedMutator<any>) => [
  {
    accessorKey: "warehouse_name",
    header: "Warehouse Name",
  },
  {
    accessorKey: "is_group",
    header: "Is Group",
  },
  {
    accessorKey: "company",
    header: "Company",
  },
  {
    id: "actions",
    cell: ({ row }: { row: { original: Warehouse } }) => (
      <ActionsCell
        warehouse={row.original}
        mutate={mutate}
        mutateCount={mutateCount}
      />
    ),
  },
];