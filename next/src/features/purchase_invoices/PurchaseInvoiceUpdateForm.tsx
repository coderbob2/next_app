import { useFrappeUpdateDoc } from "frappe-react-sdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import type { PurchaseInvoice } from "@/types/Accounts/PurchaseInvoice";
import { toast } from "sonner";

interface PurchaseInvoiceUpdateFormProps {
  invoice: PurchaseInvoice;
  onClose: () => void;
  mutate: () => void;
}

export default function PurchaseInvoiceUpdateForm({ invoice, onClose, mutate }: PurchaseInvoiceUpdateFormProps) {
  const [supplier, setSupplier] = useState(invoice.supplier);
  const [postingDate, setPostingDate] = useState(invoice.posting_date);
  const [grandTotal, setGrandTotal] = useState(String(invoice.grand_total));

  const { updateDoc, loading } = useFrappeUpdateDoc();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDoc("Purchase Invoice", invoice.name, {
        supplier,
        posting_date: postingDate,
        grand_total: Number(grandTotal),
      });
      toast.success("Purchase Invoice updated successfully");
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
        <Label htmlFor="supplier">Supplier</Label>
        <Input
          id="supplier"
          value={supplier}
          onChange={(e) => setSupplier(e.target.value)}
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
