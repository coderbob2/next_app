import { useFrappeGetDocList, useFrappeCreateDoc } from 'frappe-react-sdk';
import type { Supplier } from './types';

export const useSuppliers = (options: any) => {
  return useFrappeGetDocList<Supplier>('Supplier', {
    ...options,
    fields: ['name', 'supplier_name', 'supplier_group'],
  });
};

export const useSaveSupplier = () => {
  const { createDoc } = useFrappeCreateDoc();
  return (supplier: Supplier) => createDoc('Supplier', supplier);
};
