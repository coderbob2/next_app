import { useFrappeGetDocList, useFrappeCreateDoc } from 'frappe-react-sdk';
import type { Customer } from './types';

export const useCustomers = (options: any) => {
  return useFrappeGetDocList<Customer>('Customer', {
    ...options,
    fields: ['name', 'customer_name', 'customer_group', 'customer_type'],
  });
};

export const useCustomerCount = (filters: any) => {
    return useFrappeGetDocList<Customer>('Customer', {
        filters,
        limit: 0,
    });
}

export const useSaveCustomer = () => {
  const { createDoc } = useFrappeCreateDoc();
  return (customer: Customer) => createDoc('Customer', customer);
};
