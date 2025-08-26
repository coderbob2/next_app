import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { StockEntry } from '@/types/Stock/StockEntry';
import { useForm, useFieldArray } from 'react-hook-form';
import { useCreateStockTransfer } from './stockAPI';
import type { KeyedMutator } from 'swr';
import ClearableSelect from '@/components/ui/clearable-select';
import { X } from 'lucide-react';

interface StockAdjustmentFormProps {
  onClose: () => void;
  mutate: KeyedMutator<StockEntry[]>;
}

export function StockAdjustmentForm({ onClose, mutate }: StockAdjustmentFormProps) {
  const { register, handleSubmit, control, setValue } = useForm<StockEntry>({
    defaultValues: {
      items: [{ item_code: '', qty: 0, uom: '', rate: 0, amount: 0 }]
    }
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const { call: createStockAdjustment, loading } = useCreateStockTransfer();

  const onSubmit = (data: StockEntry) => {
    createStockAdjustment({
        ...data,
        doctype: "Stock Entry",
        purpose: "Material Receipt"
    }).then(() => {
      mutate();
      onClose();
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Adjustment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label>Warehouse</label>
              <ClearableSelect
                doctype="Warehouse"
                value={control._getWatch('from_warehouse')}
                onChange={(value) => setValue('from_warehouse', value)}
              />
            </div>
          </div>
          <div className="mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>UOM</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <ClearableSelect
                        doctype="Item"
                        value={control._getWatch(`items.${index}.item_code`)}
                        onChange={(value) => setValue(`items.${index}.item_code`, value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Input {...register(`items.${index}.qty`)} type="number" />
                    </TableCell>
                    <TableCell>
                      <Input {...register(`items.${index}.uom`)} />
                    </TableCell>
                    <TableCell>
                      <Input {...register(`items.${index}.rate`)} type="number" />
                    </TableCell>
                    <TableCell>
                      <Input {...register(`items.${index}.amount`)} type="number" />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => remove(index)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Button type="button" className="mt-2" onClick={() => append({ item_code: '', qty: 0, uom: '', rate: 0, amount: 0 })}>Add Row</Button>
          </div>
          <div className="mt-4 flex justify-end">
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}