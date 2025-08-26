import { useFrappeGetDoc, useFrappeGetCall } from "frappe-react-sdk";
import type { Customer } from "@/types/Selling/Customer.ts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Spinner from "@/components/ui/spinner";

interface CustomerDetailsDialogProps {
  name: string;
  onClose: () => void;
}

export default function CustomerDetailsDialog({ name, onClose }: CustomerDetailsDialogProps) {
  const { data: customer, isLoading, error } = useFrappeGetDoc<Customer>("Customer", name, {
    fields: ["name", "customer_name", "custom_phone", "custom_email", "customer_type"]
  });

  const { data: balance, isLoading: balanceLoading } = useFrappeGetCall<{ message: number }>(
    "erpnext.accounts.utils.get_balance_on",
    { party: name, party_type: "Customer" }
  );

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-11/12 sm:w-3/4 md:w-1/2 lg:w-1/3 rounded-lg">
        <DialogHeader>
          <DialogTitle>{customer?.customer_name}</DialogTitle>
        </DialogHeader>
        {isLoading || balanceLoading ? (
          <Spinner />
        ) : error ? (
          <div>{error.message}</div>
        ) : customer ? (
          <div className="space-y-4">
            <p><strong>Name:</strong> {customer.name}</p>
            <p><strong>Customer Type:</strong> {customer.customer_type}</p>
            <p><strong>Phone:</strong> {customer.custom_phone}</p>
            <p><strong>Email:</strong> {customer.custom_email}</p>
            <p><strong>Receivable Balance:</strong> {balance?.message}</p>
          </div>
        ) : (
          <div>Customer not found</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
