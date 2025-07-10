import { type FC } from "react";
import { useForm, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSaveCustomer } from "./customerAPI";
import type { Customer } from "./types";
import { toast } from "sonner";

interface CustomerFormProps {
  data?: Customer;
  onClose: () => void;
  refetch: () => void;
}

export const CustomerForm: FC<CustomerFormProps> = ({ data, onClose, refetch }) => {
  const { control, handleSubmit, reset } = useForm<Customer>({ defaultValues: data });
  const saveCustomer = useSaveCustomer();

  const onSubmit = async (data: Customer) => {
    try {
      await saveCustomer(data);
      toast.success("Customer saved successfully");
      onClose();
      refetch();
    } catch (e) {
      toast.error(`Error saving customer: ${String(e)}`);
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
        name="customer_name"
        control={control}
        rules={{ required: "Customer Name is required" }}
        render={({ field, fieldState }) => (
          <>
            <Input {...field} placeholder="Customer Name" />
            {fieldState.error && <span className="text-red-600 text-sm">{fieldState.error.message}</span>}
          </>
        )}
      />
      <Controller
        name="customer_group"
        control={control}
        rules={{ required: "Customer Group is required" }}
        render={({ field, fieldState }) => (
          <>
            <Input {...field} placeholder="Customer Group" />
            {fieldState.error && <span className="text-red-600 text-sm">{fieldState.error.message}</span>}
          </>
        )}
      />
      <Controller
        name="customer_type"
        control={control}
        rules={{ required: "Customer Type is required" }}
        render={({ field, fieldState }) => (
          <>
            <Input {...field} placeholder="Customer Type" />
            {fieldState.error && <span className="text-red-600 text-sm">{fieldState.error.message}</span>}
          </>
        )}
      />
      <Button type="submit">Save Customer</Button>
    </form>
  );
};
