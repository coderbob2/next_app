import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import PaymentEntryForm from "./PaymentEntryForm";
import type { KeyedMutator } from "swr";

interface PaymentEntryDialogProps {
    isOpen: boolean;
    onClose: () => void;
    paymentType: 'Receive' | 'Pay';
    partyTypeSingular: 'Customer' | 'Supplier';
    mutate: KeyedMutator<any>;
}

export default function PaymentEntryDialog({ isOpen, onClose, paymentType, partyTypeSingular, mutate }: PaymentEntryDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                    <DialogTitle>Create New {partyTypeSingular} Receipt</DialogTitle>
                </DialogHeader>
                <PaymentEntryForm paymentType={paymentType} onClose={onClose} mutate={mutate} />
            </DialogContent>
        </Dialog>
    );
}