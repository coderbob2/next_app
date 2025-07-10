import type { PurchaseInvoice } from "./types";

export const columns = [
  {
    key: "name" as keyof PurchaseInvoice,
    title: "Name",
    visible: true,
  },
  {
    key: "supplier" as keyof PurchaseInvoice,
    title: "Supplier",
    visible: true,
  },
  {
    key: "posting_date" as keyof PurchaseInvoice,
    title: "Posting Date",
    visible: true,
  },
  {
    key: "grand_total" as keyof PurchaseInvoice,
    title: "Grand Total",
    visible: true,
  },
  {
    key: "status" as keyof PurchaseInvoice,
    title: "Status",
    visible: true,
  },
];
