import { useFrappeUpdateDoc } from "frappe-react-sdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import type { SalesInvoice } from "@/types/Accounts/SalesInvoice";
import { toast } from "sonner";

interface SalesInvoiceUpdateFormProps {
  invoice: SalesInvoice;
  onClose: () => void;
  mutate: () => void;
}

export default function SalesInvoiceUpdateForm({ invoice, onClose, mutate }: SalesInvoiceUpdateFormProps) {
  const [customer, setCustomer] = useState(invoice.customer);
  const [postingDate, setPostingDate] = useState(invoice.posting_date);
  const [grandTotal, setGrandTotal] = useState(String(invoice.grand_total));

  const { updateDoc, loading } = useFrappeUpdateDoc();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDoc("Sales Invoice", invoice.name, {
        customer,
        posting_date: postingDate,
        grand_total: Number(grandTotal),
      });
      toast.success("Sales Invoice updated successfully");
      mutate();
      onClose();
    } catch (error: any) {
      toast.error(
        JSON.parse(JSON.parse(error._server_messages)[0]).message.replace(
          /<[^>]*>?/gm,
          ""
        )
      );
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="customer">Customer</Label>
        <Input
          id="customer"
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="postingDate">Posting Date</Label>
        <Input
          id="postingDate"
          type="date"
          value={postingDate}
          onChange={(e) => setPostingDate(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="grandTotal">Grand Total</Label>
        <Input
          id="grandTotal"
          type="number"
          value={grandTotal}
          onChange={(e) => setGrandTotal(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Updating..." : "Update"}
      </Button>
    </form>
  );
}
