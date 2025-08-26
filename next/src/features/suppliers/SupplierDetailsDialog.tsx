import { useFrappeGetDoc, useFrappeGetCall } from "frappe-react-sdk";
import type { Supplier } from "@/types/Buying/Supplier";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Spinner from "@/components/ui/spinner";

interface SupplierDetailsDialogProps {
  name: string;
  onClose: () => void;
}

export default function SupplierDetailsDialog({ name, onClose }: SupplierDetailsDialogProps) {
  const { data: supplier, isLoading, error } = useFrappeGetDoc<Supplier>("Supplier", name, {
    fields: ["name", "supplier_name", "custom_phone", "custom_email", "supplier_type"]
  });

  const { data: balance, isLoading: balanceLoading } = useFrappeGetCall<{ message: number }>(
    "erpnext.accounts.utils.get_balance_on",
    { party: name, party_type: "Supplier" }
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-11/12 sm:w-3/4 md:w-1/2 lg:w-1/3 rounded-lg">
        <DialogHeader>
          <DialogTitle>{supplier?.supplier_name}</DialogTitle>
        </DialogHeader>
        {isLoading || balanceLoading ? (
          <Spinner />
        ) : error ? (
          <div>{error.message}</div>
        ) : supplier ? (
          <div className="space-y-4">
            <p><strong>Name:</strong> {supplier.name}</p>
            <p><strong>Supplier Type:</strong> {supplier.supplier_type}</p>
            <p><strong>Phone:</strong> {supplier.custom_phone}</p>
            <p><strong>Email:</strong> {supplier.custom_email}</p>
            <p><strong>Payable Balance:</strong> {balance?.message}</p>
          </div>
        ) : (
          <div>Supplier not found</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
