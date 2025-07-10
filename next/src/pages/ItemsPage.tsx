import GenericPage from "./GenericPage";
import { ItemForm } from "@/features/items/ItemForm";

export default function ItemsPage() {
  return (
    <GenericPage
      doctype="Item"
      columns={[
        { key: "name", title: "Name", visible: true },
        { key: "item_group", title: "Group", visible: true },
        { key: "description", title: "Description", visible: true },
        { key: "stock_uom", title: "UOM", visible: true },
        { key: "standard_rate", title: "Rate", visible: true },
      ]}
      filterFields={["name", "item_group"]}
      FormComponent={ItemForm}
    />
  );
}
