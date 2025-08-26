import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, AlertTriangle } from "lucide-react";
import { useFrappeDeleteDoc } from "frappe-react-sdk";
import type { PurchaseInvoice } from "@/types/Accounts/PurchaseInvoice";
import type { KeyedMutator } from "swr";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PurchaseInvoiceUpdateForm from "@/features/purchase_invoices/PurchaseInvoiceUpdateForm";
import { useState } from "react";
import { toast } from "sonner";

export default function ActionsCell({
  row,
  mutate,
  mutateCount,
}: {
  row: { original: PurchaseInvoice };
  mutate: KeyedMutator<any>;
  mutateCount: KeyedMutator<any>;
}) {
  const { deleteDoc } = useFrappeDeleteDoc();
  const [showEditForm, setShowEditForm] = useState(false);

  return (
    <div className="space-x-2 text-right">
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <Pencil className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Purchase Invoice</DialogTitle>
          </DialogHeader>
          <PurchaseInvoiceUpdateForm
            invoice={row.original}
            onClose={() => setShowEditForm(false)}
            mutate={mutate}
          />
        </DialogContent>
      </Dialog>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" className="h-8 w-8 p-0">
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="text-red-500" />
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              invoice <b>{row.original.name}</b>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={() => {
                deleteDoc("Purchase Invoice", row.original.name)
                  .then(() => {
                    toast.success("Purchase Invoice deleted successfully");
                    mutate();
                    mutateCount();
                  })
                  .catch((error: any) => {
                    toast.error(
                      JSON.parse(
                        JSON.parse(error._server_messages)[0]
                      ).message.replace(/<[^>]*>?/gm, "")
                    );
                  });
              }}
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
