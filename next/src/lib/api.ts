import { z } from "zod";
import { useFrappeGetDoc } from "frappe-react-sdk";

// Schema for DocField
const docFieldSchema = z.object({
  fieldname: z.string(),
  label: z.string().optional(),
  fieldtype: z.string(),
  options: z.string().optional(),
  reqd: z.number().optional(),
  hidden: z.number().optional(),
  in_list_view: z.number().optional(),
});

// Schema for the entire Doctype response
const doctypeResponseSchema = z.object({
  docs: z.array(
    z.object({
      fields: z.array(docFieldSchema),
    })
  ),
});

export type DocField = z.infer<typeof docFieldSchema>;

export const useDoctype = (doctype: string, filters?: Record<string, any>) => {
  const { data, error, isLoading } = useFrappeGetDoc("DocType", doctype, {
    revalidateOnFocus: false,
    filters,
  });

  if (error) {
    console.error("Error fetching doctype:", error);
    return { fields: null, isLoading: false };
  }

  if (isLoading || !data) {
    return { fields: null, isLoading: true };
  }

  try {
    const parsedResponse = doctypeResponseSchema.parse({ docs: [data] });
    return { fields: parsedResponse.docs[0].fields, isLoading: false };
  } catch (e) {
    console.error("Error parsing doctype response:", e);
    return { fields: null, isLoading: false };
  }
};
