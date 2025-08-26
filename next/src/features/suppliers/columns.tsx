import type { Supplier } from "@/types/Buying/Supplier";
import type { KeyedMutator } from "swr";
import { ActionsCell } from "@/features/suppliers/ActionsCell";

export const getColumns = (mutate: KeyedMutator<any>, mutateCount: KeyedMutator<any>, onCloseDetails: () => void) => [
  {
    accessorKey: "supplier_name",
    header: "Supplier Name",
  },
  {
    accessorKey: "supplier_type",
    header: "Supplier Type",
  },
  {
    accessorKey: "custom_phone",
    header: "Phone",
  },
  {
    accessorKey: "custom_email",
    header: "Email",
  },
  {
    id: "actions",
    cell: ({ row }: { row: { original: Supplier } }) => (
      <ActionsCell
        supplier={row.original}
        mutate={mutate}
        mutateCount={mutateCount}
        onCloseDetails={onCloseDetails}
      />
    ),
  },
];
