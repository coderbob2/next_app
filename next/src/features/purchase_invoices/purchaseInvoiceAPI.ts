import { useFrappeGetDocList, useFrappeCreateDoc } from 'frappe-react-sdk';
import type { PurchaseInvoice } from './types';

export const usePurchaseInvoices = (options: any) => {
  return useFrappeGetDocList<PurchaseInvoice>('Purchase Invoice', {
    ...options,
    fields: ['name', 'supplier', 'posting_date', 'grand_total', 'status'],
  });
};

export const useSavePurchaseInvoice = () => {
  const { createDoc } = useFrappeCreateDoc();
  return (purchaseInvoice: PurchaseInvoice) => createDoc('Purchase Invoice', purchaseInvoice);
};
