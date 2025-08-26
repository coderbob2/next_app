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
import type { Supplier } from "../../types/Buying/Supplier";
import type { KeyedMutator } from "swr";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import SupplierUpdateForm from "./SupplierUpdateForm";
import { useState } from "react";

export function ActionsCell({
  supplier,
  mutate,
  mutateCount,
  onCloseDetails,
}: {
  supplier: Supplier;
  mutate: KeyedMutator<any>;
  mutateCount: KeyedMutator<any>;
  onCloseDetails: () => void;
}) {
  const { deleteDoc } = useFrappeDeleteDoc();
  const [showEditForm, setShowEditForm] = useState(false);

  return (
    <div className="space-x-2 text-right">
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogTrigger asChild onClick={(e) => { e.stopPropagation(); onCloseDetails(); }}>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <Pencil className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Supplier</DialogTitle>
          </DialogHeader>
          <SupplierUpdateForm
            supplier={supplier}
            onClose={() => setShowEditForm(false)}
            mutate={mutate}
          />
        </DialogContent>
      </Dialog>
      <AlertDialog>
        <AlertDialogTrigger asChild onClick={(e) => e.stopPropagation()}>
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
              supplier <b>{supplier.supplier_name}</b>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600"
              onClick={(e) => {
                e.stopPropagation();
                deleteDoc("Supplier", supplier.name).then(() => {
                  mutate();
                  mutateCount();
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
