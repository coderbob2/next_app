import GenericPage from "./GenericPage";
import { columns } from "@/features/purchase_invoices/columns";
import { PurchaseInvoiceForm } from "@/features/purchase_invoices/PurchaseInvoiceForm";

const PurchaseInvoicePage = () => {
  return (
    <GenericPage
      doctype="Purchase Invoice"
      columns={columns}
      filterFields={["name", "supplier", "posting_date", "grand_total", "status"]}
      FormComponent={PurchaseInvoiceForm}
    />
  );
};

export default PurchaseInvoicePage;
