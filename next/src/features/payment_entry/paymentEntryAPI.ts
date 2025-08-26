import { useFrappeCreateDoc, useFrappeGetDocList, useFrappeDeleteDoc, useFrappeGetDoc, useFrappeUpdateDoc } from "frappe-react-sdk";
import type { PaymentEntry } from "@/types/Accounts/PaymentEntry";

export const usePaymentEntries = () => {
    const { data, isLoading, error } = useFrappeGetDocList<PaymentEntry>("Payment Entry", {
        fields: ["name", "posting_date", "party_type", "party", "paid_amount"],
        limit: 20,
    });
    return { data, isLoading, error };
}

export const usePaymentEntry = (name: string) => {
    const { data, isLoading, error } = useFrappeGetDoc<PaymentEntry>("Payment Entry", name);
    return { data, isLoading, error };
}

export const useCreatePaymentEntry = () => {
    const { createDoc, loading, isCompleted, error } = useFrappeCreateDoc();
    const createPaymentEntry = (paymentEntry: PaymentEntry) => {
        return createDoc("Payment Entry", paymentEntry);
    }
    return { createPaymentEntry, loading, isCompleted, error };
}

export const useUpdatePaymentEntry = () => {
    const { updateDoc, loading, isCompleted, error } = useFrappeUpdateDoc();
    const updatePaymentEntry = (name: string, paymentEntry: PaymentEntry) => {
        return updateDoc("Payment Entry", name, paymentEntry);
    }
    return { updatePaymentEntry, loading, isCompleted, error };
}

export const useDeletePaymentEntry = () => {
    const { deleteDoc, loading, isCompleted, error } = useFrappeDeleteDoc();
    const deletePaymentEntry = (name: string) => {
        return deleteDoc("Payment Entry", name);
    }
    return { deletePaymentEntry, loading, isCompleted, error };
}
