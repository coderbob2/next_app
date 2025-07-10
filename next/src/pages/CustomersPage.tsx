import GenericPage from "./GenericPage";
import { columns } from "@/features/customers/columns";
import { CustomerForm } from "@/features/customers/CustomerForm";

const CustomersPage = () => {
  return (
    <GenericPage
      doctype="Customer"
      columns={columns}
      filterFields={["name", "customer_name", "customer_group", "customer_type"]}
      FormComponent={CustomerForm}
    />
  );
};

export default CustomersPage;
