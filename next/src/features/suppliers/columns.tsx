import type { Supplier } from "./types";

export const columns = [
  {
    key: "name" as keyof Supplier,
    title: "Name",
    visible: true,
  },
  {
    key: "supplier_name" as keyof Supplier,
    title: "Supplier Name",
    visible: true,
  },
  {
    key: "supplier_group" as keyof Supplier,
    title: "Supplier Group",
    visible: true,
  },
];
