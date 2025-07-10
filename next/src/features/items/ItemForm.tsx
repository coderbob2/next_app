import { type FC } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSaveItem } from "./itemAPI";
import type { Item } from "./types";

interface ItemFormProps {
  data?: Item;
  onClose: () => void;
  refetch: () => void;
}

export const ItemForm: FC<ItemFormProps> = ({ data, onClose, refetch }) => {
  const { control, handleSubmit, reset } = useForm<Item>({ defaultValues: data });
  const saveItem = useSaveItem();

  const onSubmit = async (data: Item) => {
    try {
      await saveItem(data);
      alert("Item saved successfully");
      reset();
      onClose();
      refetch();
    } catch (e) {
      alert(`Error saving item: ${String(e)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-sm">
      <Controller
        name="name"
        control={control}
        rules={{ required: "Name is required" }}
        render={({ field, fieldState }) => (
          <>
            <Input {...field} placeholder="Name" />
            {fieldState.error && <span className="text-red-600 text-sm">{fieldState.error.message}</span>}
          </>
        )}
      />
      <Controller
        name="item_group"
        control={control}
        render={({ field }) => <Input {...field} placeholder="Item Group" />}
      />
      <Controller
        name="description"
        control={control}
        render={({ field }) => <Input {...field} placeholder="Description" />}
      />
      <Controller
        name="stock_uom"
        control={control}
        render={({ field }) => <Input {...field} placeholder="Stock UOM" />}
      />
      <Controller
        name="standard_rate"
        control={control}
        render={({ field }) => <Input {...field} placeholder="Standard Rate" />}
      />
      <Button type="submit">Save Item</Button>
    </form>
  );
};
