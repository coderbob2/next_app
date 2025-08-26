import { format } from "date-fns";
import type { SalesInvoice } from "@/types/Accounts/SalesInvoice";
import { Badge } from "@/components/ui/badge";
import type { SalesInvoiceItem } from "@/types/Accounts/SalesInvoiceItem";

export const getColumns = () => [
  {
    accessorKey: "name",
    header: "Invoice",
  },
  {
    accessorKey: "customer",
    header: "Customer",
  },
  {
    accessorKey: "grand_total",
    header: "Grand Total",
    cell: ({ row }: { row: { original: SalesInvoice } }) => {
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
    cell: ({ row }: { row: { original: SalesInvoice } }) => {
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
    cell: ({ row }: { row: { original: SalesInvoice } }) => {
      const grandTotal = row.original.grand_total ?? 0;
      const outstandingAmount = row.original.outstanding_amount ?? 0;
      let status = "Not Paid";
      let color = "border-red-500 text-red-500";

      if (outstandingAmount === 0 && grandTotal > 0) {
        status = "Paid";
        color = "border-green-500 text-green-500";
      } else if (outstandingAmount > 0 && outstandingAmount < grandTotal) {
        status = "Partially Paid";
        color = "border-yellow-500 text-yellow-500";
      }
      
      if (row.original.status === "Cancelled") {
        status = "Cancelled";
        color = "bg-red-500 text-white";
      } else if (row.original.status === "Draft") {
        status = "Draft";
        color = "border-gray-500 text-gray-500";
      }


      return <Badge variant="outline" className={`w-24 text-center justify-center ${color}`}>{status}</Badge>;
    },
  },
  {
    accessorKey: "update_stock",
    header: "Stock Status",
    cell: ({ row }: { row: { original: SalesInvoice } }) => {
      console.log("Orignal ----------- ", row.original);
      const updateStock = row.original.update_stock;
      
      const items: SalesInvoiceItem[] = row.original.items || [];
      // Calculate the total quantity of items in the invoice
      const totalQty = items.reduce((total, item) => total + item.qty!, 0);
      // Calculate the total quantity of items that have been delivered
      const deliveredQty = items.reduce((total, item) => total + item.delivered_qty!, 0);

      let status = "Not Taken";
      let color = "border-red-500 text-red-500";

      if (updateStock) {
        status = "Taken";
        color = "border-green-500 text-green-500";
      } else if (deliveredQty === totalQty && deliveredQty > 0) {
        status = "Taken";
        color = "border-green-500 text-green-500";
      } else if (deliveredQty > 0) {
        status = "Partially Taken";
        color = "border-yellow-500 text-yellow-500";
      }

      return <Badge variant="outline" className={`w-24 text-center justify-center ${color}`}>{status}</Badge>;
    },
  },
];
