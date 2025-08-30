import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useFrappeDeleteDoc } from "frappe-react-sdk";
import { useState } from "react";
import type { KeyedMutator } from "swr";
import type { Warehouse } from "@/types/Stock/Warehouse";
import WarehouseUpdateForm from "./WarehouseUpdateForm";

interface ActionsCellProps {
  warehouse: Warehouse;
  mutate: KeyedMutator<any>;
  mutateCount: KeyedMutator<any>;
}

export function ActionsCell({
  warehouse,
  mutate,
  mutateCount,
}: ActionsCellProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { deleteDoc, loading: isDeleting } = useFrappeDeleteDoc();

  const handleDelete = () => {
    deleteDoc("Warehouse", warehouse.name)
      .then(() => {
        mutate();
        mutateCount();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(warehouse.name)}>
            Copy Warehouse ID
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DialogTrigger asChild>
            <DropdownMenuItem>Edit</DropdownMenuItem>
          </DialogTrigger>
          <DropdownMenuItem onClick={handleDelete} disabled={isDeleting} className="text-red-500">
            {isDeleting ? "Deleting..." : "Delete"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Warehouse</DialogTitle>
        </DialogHeader>
        <WarehouseUpdateForm
          name={warehouse.name}
          onClose={() => setIsDialogOpen(false)}
          mutate={mutate}
        />
      </DialogContent>
    </Dialog>
  );
}