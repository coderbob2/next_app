import type { Customer } from "./types";

export const columns = [
  {
    key: "name" as keyof Customer,
    title: "Name",
    visible: true,
  },
  {
    key: "customer_name" as keyof Customer,
    title: "Customer Name",
    visible: true,
  },
  {
    key: "customer_group" as keyof Customer,
    title: "Customer Group",
    visible: true,
  },
  {
    key: "customer_type" as keyof Customer,
    title: "Customer Type",
    visible: true,
  },
];
