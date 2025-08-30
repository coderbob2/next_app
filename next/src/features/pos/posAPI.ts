import { useFrappeGetDocList, useFrappeCreateDoc } from 'frappe-react-sdk';

export const useWarehouses = (company: string) => {
  const { data, isLoading, error } = useFrappeGetDocList('Warehouse', {
    fields: ['name', 'custom_shop_no', 'custom_phone_1', 'custom_phone_2', 'custom_cash_account'],
    filters: company ? [['company', '=', company]] : [],
  });
  return { data, isLoading, error };
};

export const useItems = (enabled: boolean) => {
  const { data, isLoading, error, mutate } = useFrappeGetDocList('Item', {
    fields: ['name', 'item_name', 'image', 'standard_rate'],
  }, { enabled });
  return { data, isLoading, error, mutate };
};

export const useStockBalance = (item_code: string, warehouse: string) => {
  const { data, isLoading, error, mutate } = useFrappeGetDocList('Bin', {
    filters: [['item_code', '=', item_code], ['warehouse', '=', warehouse]],
    fields: ['actual_qty'],
  });
  return { data, isLoading, error, mutate };
}

export const useCreateSalesInvoice = () => {
  const { createDoc, loading, error } = useFrappeCreateDoc();
  return { createDoc, loading, error };
};

export const useCustomers = () => {
    const { data, isLoading, error } = useFrappeGetDocList("Customer", {
        fields: ["name"],
        limit: 1000
    });
    return { data, isLoading, error };
}

export const useCurrencies = () => {
    const { data, isLoading, error } = useFrappeGetDocList("Currency", {
        fields: ["name"],
        limit: 1000
    });
    return { data, isLoading, error };
}
