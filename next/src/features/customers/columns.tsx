import type { Customer } from "../../types/Selling/Customer";
import type { KeyedMutator } from "swr";
import { ActionsCell } from "./ActionsCell";

export const getColumns = (mutate: KeyedMutator<any>, mutateCount: KeyedMutator<any>, onCloseDetails: () => void) => [
  {
    accessorKey: "customer_name",
    header: "Customer Name",
  },
  {
    accessorKey: "customer_type",
    header: "Customer Type",
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
    cell: ({ row }: { row: { original: Customer } }) => (
      <ActionsCell
        customer={row.original}
        mutate={mutate}
        mutateCount={mutateCount}
        onCloseDetails={onCloseDetails}
      />
    ),
  },
];
