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
import { useSavePurchaseInvoice } from "./purchaseInvoiceAPI";
import type { PurchaseInvoice } from "./types";

const formSchema = z.object({
  supplier: z.string().min(2, {
    message: "Supplier name must be at least 2 characters.",
  }),
  posting_date: z.string(),
  grand_total: z.number(),
  status: z.string(),
});

export function PurchaseInvoiceForm({
  data,
  onClose,
  refetch,
}: {
  data?: PurchaseInvoice;
  onClose: () => void;
  refetch: () => void;
}) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: data ?? {
      supplier: "",
      posting_date: "",
      grand_total: 0,
      status: "",
    },
  });

  const savePurchaseInvoice = useSavePurchaseInvoice();

  function onSubmit(values: z.infer<typeof formSchema>) {
    savePurchaseInvoice(values as PurchaseInvoice).then(() => {
      refetch();
      onClose();
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="supplier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supplier</FormLabel>
              <FormControl>
                <Input placeholder="Supplier" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="posting_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Posting Date</FormLabel>
              <FormControl>
                <Input placeholder="Posting Date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="grand_total"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Grand Total</FormLabel>
              <FormControl>
                <Input placeholder="Grand Total" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <Input placeholder="Status" {...field} />
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
