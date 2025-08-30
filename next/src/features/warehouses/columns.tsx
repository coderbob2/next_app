import type { Warehouse } from "../../types/Stock/Warehouse";
import type { KeyedMutator } from "swr";
import { ActionsCell } from "@/features/warehouses/ActionsCell";

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
    accessorKey: "warehouse_type",
    header: "Warehouse Type",
  },
  {
    accessorKey: "custom_shop_no",
    header: "Shop No",
  },
  {
    accessorKey: "custom_phone_1",
    header: "Phone 1",
  },
  {
    accessorKey: "custom_phone_2",
    header: "Phone 2",
  },
  {
    accessorKey: "custom_cash_account",
    header: "Account",
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