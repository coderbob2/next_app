import { useFrappeGetDocList, useFrappeCreateDoc } from 'frappe-react-sdk';
import type { Item } from './types';

export const useItems = (options: any) => {
  return useFrappeGetDocList<Item>('Item', {
    ...options,
    fields: ['name', 'item_group', 'description', 'stock_uom', 'standard_rate'],
  });
};

export const useItemCount = (filters: any) => {
    return useFrappeGetDocList<Item>('Item', {
        filters,
        limit: 0,
    });
}

export const useSaveItem = () => {
  const { createDoc } = useFrappeCreateDoc();
  return (item: Item) => createDoc('Item', item);
};
