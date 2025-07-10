import { GenericDocTypeTable } from "@/layouts/GenericDocTypeTable";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import type { FC } from "react";
import { useState } from "react";
import { useDoctype, type DocField } from "@/lib/api";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormComponentProps {
  onClose: () => void;
  refetch: () => void;
  data?: any;
  fields: DocField[];
}

const GenericFormComponent: FC<FormComponentProps> = ({ onClose, refetch, data, fields }) => {
  const formSchema = z.object(
    fields.reduce((acc, field) => {
      if (field.fieldtype === "Data" || field.fieldtype === "Select") {
        acc[field.fieldname] = z.string().min(1, `${field.label} is required`);
      }
      return acc;
    }, {} as Record<string, z.ZodString>)
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: data || {},
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Here you would typically call an API to save the data
    console.log(values);
    refetch();
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {fields.map((field) => {
          if (field.hidden) return null;
          return (
            <FormField
              key={field.fieldname}
              control={form.control}
              name={field.fieldname}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>{field.label}</FormLabel>
                  <FormControl>
                    {field.fieldtype === "Select" ? (
                      <Select onValueChange={formField.onChange} defaultValue={formField.value}>
                        <SelectTrigger>
                          <SelectValue placeholder={`Select ${field.label}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.split("\n").map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input {...formField} />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        })}
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
};

interface GenericPageProps {
  doctype: string;
  filters?: Record<string, any>;
}

const GenericPage: FC<GenericPageProps> = ({ doctype, filters }) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { fields, isLoading } = useDoctype(doctype, filters);

  const handleAdd = () => {
    setOpen(true);
  };

  const handleRefetch = () => {
    queryClient.refetchQueries({ queryKey: [doctype] });
  };

  if (isLoading || !fields) {
    return <div>Loading...</div>;
  }

  const columns = fields
    .filter((field: DocField) => field.in_list_view && field.label)
    .map((field: DocField) => ({
      key: field.fieldname,
      title: field.label!,
      visible: true,
    }));

  const filterFields = fields
    .filter((field: DocField) => field.in_list_view)
    .map((field: DocField) => field.fieldname);

  const renderForm = (props: Omit<FormComponentProps, 'fields'>) => (
    <GenericFormComponent {...props} fields={fields} />
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">{doctype}s</h1>
        <Button onClick={handleAdd}>+ Add {doctype}</Button>
      </div>
      {columns.length > 0 && (
        <GenericDocTypeTable
          key={doctype}
          doctype={doctype}
          columns={columns}
          filterFields={filterFields}
          Form={renderForm}
        />
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          {renderForm({ onClose: () => setOpen(false), refetch: handleRefetch })}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GenericPage;
