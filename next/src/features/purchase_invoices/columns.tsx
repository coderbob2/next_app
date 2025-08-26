import { format } from "date-fns";
import type { PurchaseInvoice } from "@/types/Accounts/PurchaseInvoice";
import { Badge } from "@/components/ui/badge";

export const getColumns = () => [
  {
    accessorKey: "name",
    header: "Invoice",
  },
  {
    accessorKey: "supplier",
    header: "Supplier",
  },
  {
    accessorKey: "grand_total",
    header: "Grand Total",
    cell: ({ row }: { row: { original: PurchaseInvoice } }) => {
    const amount = parseFloat(row.original.grand_total?.toString() || "0");
    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return formatted;
  },
  },
  {
    accessorKey: "currency",
    header: "Currency",
  },
  {
    accessorKey: "owner",
    header: "Registered by",
  },
  {
    accessorKey: "posting_date",
    header: "Posted at",
    cell: ({ row }: { row: { original: PurchaseInvoice } }) => {
      const date = new Date(row.original.posting_date);
      if (row.original.posting_time) {
        const [hours, minutes] = row.original.posting_time.split(":");
        date.setHours(Number(hours));
        date.setMinutes(Number(minutes));
        return format(date, "MMM d, yyyy h:mm a");
      }
      return format(date, "MMM d, yyyy");
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: { row: { original: PurchaseInvoice } }) => {
      const status = row.original.status;
      let color = "";
      if (status === "Paid") {
        color = "border-green-500 text-green-500";
      } else if (status === "Partly Paid") {
        color = "border-yellow-500 text-yellow-500";
      } else if (status === "Unpaid") {
        color = "border-red-500 text-red-500";
      } else if (status === "Overdue") {
        color = "border-orange-500 text-orange-500";
      } else if (status === "Cancelled") {
        color = "border-gray-500 text-gray-500";
      } else if (status === "Submitted") {
        color = "border-blue-500 text-blue-500";
      } else if (status === "Draft") {
        color = "border-gray-500 text-gray-500";
      }
      return <Badge variant="outline" className={`w-24 text-center justify-center ${color}`}>{status}</Badge>;
    },
  },
];
