import { format } from "date-fns";
import type { PaymentEntry } from "@/types/Accounts/PaymentEntry";
import { Badge } from "@/components/ui/badge";

export const getColumns = () => [
  {
    accessorKey: "name",
    header: "Payment Entry",
  },
  {
    accessorKey: "party_type",
    header: "Party Type",
  },
  {
    accessorKey: "party",
    header: "Party",
  },
  {
    accessorKey: "paid_amount",
    header: "Paid Amount",
    cell: ({ row }: { row: { original: PaymentEntry } }) => {
      const amount = parseFloat(row.original.paid_amount?.toString() || "0");
      const formatted = new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
      return formatted;
    },
  },
  {
    accessorKey: "posting_date",
    header: "Posting Date",
    cell: ({ row }: { row: { original: PaymentEntry } }) => {
      const date = row.original.posting_date;
      if (!date) return "";
      return format(new Date(date), "MMM d, yyyy");
    },
  },
  {
    accessorKey: "creation",
    header: "Creation",
    cell: ({ row }: { row: { original: PaymentEntry } }) => {
      const date = row.original.creation;
      if (!date) return "";
      return format(new Date(date), "MMM d, yyyy HH:mm:ss");
    },
  },
  {
    accessorKey: "docstatus",
    header: "Status",
    cell: ({ row }: { row: { original: PaymentEntry } }) => {
      const status = row.original.docstatus;
      let statusText = "";
      if (status === 0) {
        statusText = "Draft";
      } else if (status === 1) {
        statusText = "Submitted";
      } else if (status === 2) {
        statusText = "Cancelled";
      }
      return <Badge variant="outline" className="w-20 text-center">{statusText}</Badge>;
    },
  },
  {
    accessorKey: "owner",
    header: "Registered By",
  },
];
