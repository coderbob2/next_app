import { useFrappeDeleteDoc } from "frappe-react-sdk";
import { MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ActionsCell({
  name,
  mutate,
  mutateCount
}: {
  name: string;
  mutate: () => void;
  mutateCount: () => void;
}) {
  const { deleteDoc } = useFrappeDeleteDoc();

  const handleDelete = () => {
    deleteDoc("Custom Exchange Rate", name).then(() => {
      mutate();
      mutateCount();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MoreVertical />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={handleDelete}>
          <Trash2 className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}