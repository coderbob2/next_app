import { useFrappeGetDocList } from "frappe-react-sdk";
import type { CustomerBalance, SupplierBalance, StockBalance } from "../../types/Dashboard";

export const useCustomerBalance = () => {
    const { data, isLoading, error } = useFrappeGetDocList<CustomerBalance>("Customer", {
        fields: ["customer_name", "balance"],
        limit: 10,
    });
    return { data, isLoading, error };
}

export const useSupplierBalance = () => {
    const { data, isLoading, error } = useFrappeGetDocList<SupplierBalance>("Supplier", {
        fields: ["supplier_name", "balance"],
        limit: 10,
    });
    return { data, isLoading, error };
}

export const useStockBalance = () => {
    const { data, isLoading, error } = useFrappeGetDocList<StockBalance>("Item", {
        fields: ["item_name", "balance_qty"],
        limit: 10,
    });
    return { data, isLoading, error };
}