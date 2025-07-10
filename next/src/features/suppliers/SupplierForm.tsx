import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useSaveSupplier } from "./supplierAPI";
import type { Supplier } from "./types";

const formSchema = z.object({
  supplier_name: z.string().min(2, {
    message: "Supplier name must be at least 2 characters.",
  }),
  supplier_group: z.string(),
});

export function SupplierForm({
  data,
  onClose,
  refetch,
}: {
  data?: Supplier;
  onClose: () => void;
  refetch: () => void;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: data ?? {
      supplier_name: "",
      supplier_group: "",
    },
  });

  const saveSupplier = useSaveSupplier();

  function onSubmit(values: z.infer<typeof formSchema>) {
    saveSupplier(values as Supplier).then(() => {
      refetch();
      onClose();
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="supplier_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supplier Name</FormLabel>
              <FormControl>
                <Input placeholder="Supplier Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="supplier_group"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supplier Group</FormLabel>
              <FormControl>
                <Input placeholder="Supplier Group" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
