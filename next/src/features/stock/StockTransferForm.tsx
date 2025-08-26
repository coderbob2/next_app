import { useFrappeCreateDoc, useFrappeGetDocList } from "frappe-react-sdk";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumericFormat } from "react-number-format";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { toast } from "sonner";

type StockTransferFormProps = {
    onClose: () => void;
    mutate: () => void;
}

const StockTransferForm = ({onClose, mutate}: StockTransferFormProps) => {
    const [fromWarehouse, setFromWarehouse] = useState("");
    const [toWarehouse, setToWarehouse] = useState("");
    const [items, setItems] = useState([{item_code: "", qty: 0}]);
    const [warehouseError, setWarehouseError] = useState(false);

    useEffect(() => {
        if (fromWarehouse && toWarehouse && fromWarehouse === toWarehouse) {
            setWarehouseError(true);
        } else {
            setWarehouseError(false);
        }
    }, [fromWarehouse, toWarehouse]);

    const { data: warehouses } = useFrappeGetDocList("Warehouse", {
        fields: ["name"],
        limit: 100
    });

    const { data: item_list } = useFrappeGetDocList("Item", {
        fields: ["name"],
        limit: 100
    });

    const {createDoc, loading} = useFrappeCreateDoc();

    const handleSubmit = async () => {
        if (fromWarehouse === toWarehouse) {
            toast.error("From and To warehouses cannot be the same.",{
                duration: 5000,
                position: "top-right",
                richColors: true
            });
            return;
        }
        try{
            await createDoc("Stock Entry", {
                stock_entry_type: "Material Transfer",
                from_warehouse: fromWarehouse,
                to_warehouse: toWarehouse,
                items: items,
                docstatus: 1
            }).then(() => {
                toast.success("Stock transfer created successfully");
                mutate();
                onClose();
            });
        }catch(err: any){
            const serverMessages = JSON.parse(err._server_messages || '[]');
            const errorMessage = serverMessages.length > 0 ? JSON.parse(serverMessages[0]).message.replace(/<[^>]*>?/gm, '') : "Failed to create stock transfer";
            const toastTitle = err.exc_type === 'NegativeStockError' ? 'Insufficient Stock' : 'Error';
            toast.error(<div style={{ fontWeight: 'bold', fontSize: '1.2em', color: 'red' }}>{toastTitle}</div>, {
                position: "top-right",
                duration: 5000,
                
                style: {
                    borderColor: 'red',
                   color: 'red',
                   
                },
                
                description: errorMessage,
            });
        }
    }

    const handleAddItem = () => {
        setItems([...items, {item_code: "", qty: 0}]);
    }

    const handleRemoveItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label>From Warehouse</label>
                    <Select onValueChange={setFromWarehouse} value={fromWarehouse}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a warehouse" />
                        </SelectTrigger>
                        <SelectContent>
                            {warehouses?.map(w => <SelectItem key={w.name} value={w.name}>{w.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <label>To Warehouse</label>
                    <Select onValueChange={setToWarehouse} value={toWarehouse}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a warehouse" />
                        </SelectTrigger>
                        <SelectContent>
                            {warehouses?.map(w => <SelectItem key={w.name} value={w.name}>{w.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            {warehouseError && <p className="text-red-500">From and To warehouses cannot be the same.</p>}
            <div className="max-h-64 overflow-y-auto">
                <h3 className="text-lg font-medium">Items</h3>
                {items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2 mt-2">
                        <div className="w-64">
                            <Select onValueChange={(value) => {
                                const newItems = [...items];
                                newItems[index].item_code = value;
                                setItems(newItems);
                            }} value={item.item_code}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an item" />
                                </SelectTrigger>
                                <SelectContent>
                                    {item_list?.map(i => <SelectItem key={i.name} value={i.name}>{i.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="w-[35%]">
                            <NumericFormat
                                customInput={Input}
                                placeholder="Quantity"
                                value={item.qty === 0 ? '' : item.qty}
                                onValueChange={(values) => {
                                    const newItems = [...items];
                                    newItems[index].qty = values.floatValue || 0;
                                    setItems(newItems);
                                }}
                                thousandSeparator=','
                            />
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveItem(index)}>
                            <Trash className="h-4 w-4 text-red-500" />
                        </Button>
                    </div>
                ))}
                <Button type="button" onClick={handleAddItem} className="mt-2">Add Item</Button>
            </div>
            <div className="flex justify-end">
                <AlertDialog >
                    <AlertDialogTrigger asChild>
                        <Button disabled={loading}>Submit</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will create a new stock transfer entry.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleSubmit}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    )
}

export default StockTransferForm