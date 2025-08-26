import type { PurchaseInvoice } from "@/types/Accounts/PurchaseInvoice";
import { useFrappeCreateDoc, useFrappeGetDocList } from "frappe-react-sdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useMemo, useEffect } from "react";
import { toast } from "sonner";
import { Combobox } from "@/components/ui/combobox";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NumericFormat } from "react-number-format";
import { DatePicker } from "@/components/ui/datepicker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";

interface Item {
    item_code: string;
    qty: number;
    rate: number;
    amount: number;
}

export default function PurchaseInvoiceAddPage() {
    const [supplier, setSupplier] = useState("");
    const [postingDate, setPostingDate] = useState<Date | undefined>(new Date());
    const [updateStock, setUpdateStock] = useState(false);
    const [warehouse, setWarehouse] = useState("");
    const [editPostingDate, setEditPostingDate] = useState(false);
    const [currency, setCurrency] = useState("");
    const [items, setItems] = useState<Item[]>([{ item_code: "", qty: 1, rate: 0, amount: 0 }]);
    const navigate = useNavigate();

    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState("");
    const [modeOfPayment, setModeOfPayment] = useState("");
    const [account, setAccount] = useState("");
    const [paidAmount, setPaidAmount] = useState(0);
    const [remarks, setRemarks] = useState("");

    const totalAmount = useMemo(() => {
        return items.reduce((acc, item) => acc + item.amount, 0);
    }, [items]);

    useEffect(() => {
        if (paymentStatus === 'Paid') {
            setPaidAmount(totalAmount);
        } else if (paymentStatus === 'Not Paid') {
            setPaidAmount(0);
        } else if (paymentStatus === 'Partly Paid') {
            setPaidAmount(0);
        }
    }, [paymentStatus, totalAmount]);

    const handleClosePaymentDialog = () => {
        setIsPaymentDialogOpen(false);
        setPaymentStatus("");
        setModeOfPayment("");
        setAccount("");
        setPaidAmount(0);
        setRemarks("");
    };

    const numberFormatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });

    const { data: suppliers, isLoading: suppliersLoading } = useFrappeGetDocList("Supplier", {
        fields: ["name"],
        limit: 1000
    });

    const supplierOptions = useMemo(() => {
        if (!suppliers) return [];
        return suppliers.map((s) => ({ label: s.name, value: s.name }));
    }, [suppliers]);

    const { data: itemsList, isLoading: itemsLoading } = useFrappeGetDocList("Item", {
        fields: ["name", "item_name"],
        limit: 1000
    });

    const itemOptions = useMemo(() => {
        if (!itemsList) return [];
        return itemsList.map((i) => ({ label: `${i.item_name} (${i.name})`, value: i.name }));
    }, [itemsList]);

    const { data: warehouses, isLoading: warehousesLoading } = useFrappeGetDocList("Warehouse", {
        fields: ["name"],
        limit: 1000
    });

    const warehouseOptions = useMemo(() => {
        if (!warehouses) return [];
        return warehouses.map((w) => ({ label: w.name, value: w.name }));
    }, [warehouses]);

    const { data: currencies, isLoading: currenciesLoading } = useFrappeGetDocList("Currency", {
        fields: ["name"],
        limit: 1000
    });

    const currencyOptions = useMemo(() => {
        if (!currencies) return [];
        return currencies.map((c) => ({ label: c.name, value: c.name }));
    }, [currencies]);

    const { data: modeOfPayments, isLoading: modeOfPaymentsLoading } = useFrappeGetDocList("Mode of Payment", {
        fields: ["name"],
        limit: 1000
    });

    const modeOfPaymentOptions = useMemo(() => {
        if (!modeOfPayments) return [];
        return modeOfPayments.map((m) => ({ label: m.name, value: m.name }));
    }, [modeOfPayments]);

    const { data: accounts, isLoading: accountsLoading } = useFrappeGetDocList("Account", {
        fields: ["name"],
        filters: [["is_group", "=", 0]],
        limit: 1000
    });

    const accountOptions = useMemo(() => {
        if (!accounts) return [];
        return accounts.map((a) => ({ label: a.name, value: a.name }));
    }, [accounts]);

    const { createDoc, loading } = useFrappeCreateDoc();

    const handleItemChange = (index: number, field: keyof Item, value: string | number) => {
        const newItems = [...items];
        const item = newItems[index];

        if (field === 'item_code') {
            const selectedItemCode = value as string;
            if (selectedItemCode && newItems.some((i, idx) => i.item_code === selectedItemCode && idx !== index)) {
                toast.error("This item is already selected. Please choose a different item.");
                return;
            }
            item[field] = selectedItemCode;
        } else {
            const stringValue = value.toString().replace(/^0+(?=\d)/, ''); // Remove leading zeros
            const parsedValue = stringValue === '' ? 0 : parseFloat(stringValue);
            item[field] = isNaN(parsedValue) ? 0 : parsedValue;
        }

        if (field === 'qty' || field === 'rate') {
            newItems[index].amount = newItems[index].qty * newItems[index].rate;
        }
        setItems(newItems);
    };

    const formatNumberDisplay = (value: number): string => {
        return value === 0 ? '' : numberFormatter.format(value);
    };

    const addNewRow = () => {
        setItems([...items, { item_code: "", qty: 1, rate: 0, amount: 0 }]);
    };

    const removeRow = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const validateForm = () => {
        if (!supplier) {
            toast.error("Supplier is required.");
            return false;
        }
        if (!postingDate) {
            toast.error("Posting Date is required.");
            return false;
        }
        if (!currency) {
            toast.error("Currency is required.");
            return false;
        }
        for (const [index, item] of items.entries()) {
            if (!item.item_code) {
                toast.error(`Item code is required for item at row ${index + 1}.`);
                return false;
            }
            if (item.qty <= 0) {
                toast.error(`Quantity must be greater than 0 for item at row ${index + 1}.`);
                return false;
            }
            if (item.rate <= 0) {
                toast.error(`Rate must be greater than 0 for item at row ${index + 1}.`);
                return false;
            }
        }
        return true;
    };

    const handleCreateInvoice = () => {
        if (!validateForm()) {
            return;
        }
        setPaidAmount(totalAmount);
        setIsPaymentDialogOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (paidAmount > totalAmount) {
            toast.error("Paid amount cannot be greater than grand total.");
            return;
        }
        try {
            const isPaid = paymentStatus === 'Paid' || (paymentStatus === 'Partly Paid' && paidAmount >0);

            const doc: Partial<PurchaseInvoice> = {
                supplier: supplier,
                posting_date: postingDate ? postingDate.toISOString().split('T')[0] : "",
                update_stock: updateStock ? 1 : 0,
                set_warehouse: updateStock ? warehouse : undefined,
                currency: currency,
                items: items,
                grand_total: totalAmount,
                status: paymentStatus as any,
                mode_of_payment: (paymentStatus === 'Paid' || paymentStatus === 'Partly Paid') ? modeOfPayment : undefined,
                paid_amount: (paymentStatus === 'Paid' || paymentStatus === 'Partly Paid') ? paidAmount : undefined,
                is_paid: isPaid ? 1 : 0,
                docstatus: 1,
                cash_bank_account: account,
                remarks: remarks
                
            };

            await createDoc("Purchase Invoice", doc);
            toast.success("Purchase Invoice created and submitted successfully");
            navigate("/purchases");
        } catch (error: any) {
            toast.error(
                JSON.parse(JSON.parse(error._server_messages)[0]).message.replace(
                    /<[^>]*>?/gm,
                    ""
                )
            );
            console.error(error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">

            <Dialog open={isPaymentDialogOpen} onOpenChange={(isOpen) => {
                if (!isOpen) {
                    handleClosePaymentDialog();
                } else {
                    setIsPaymentDialogOpen(true);
                }
            }}>
            <DialogContent className="sm:max-w-[425px] bg-white rounded-lg shadow-xl p-6">
                <DialogHeader className="mb-4">
                <DialogTitle className="text-xl font-semibold text-gray-900">Payment Details</DialogTitle>
                <DialogDescription className="text-sm text-gray-500">
                    Select payment status and enter payment details.
                </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="paymentStatus" className="text-sm font-medium text-gray-700">
                    Payment Status
                    </Label>
                    <Select
                    value={paymentStatus}
                    onValueChange={setPaymentStatus}
                    >
                    <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-blue-500 rounded-md">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Not Paid">Not Paid</SelectItem>
                        <SelectItem value="Paid">Paid</SelectItem>
                        <SelectItem value="Partly Paid">Partly Paid</SelectItem>
                    </SelectContent>
                    </Select>
                </div>

                {(paymentStatus === "Paid" || paymentStatus === "Partly Paid") && (
                    <>
                    <div className="grid grid-cols-1 gap-2">
                        <Label htmlFor="modeOfPayment" className="text-sm font-medium text-gray-700">
                        Mode of Payment
                        </Label>
                        <Combobox
                        options={modeOfPaymentOptions}
                        value={modeOfPayment}
                        onChange={setModeOfPayment}
                        placeholder="Select mode of payment"
                        isLoading={modeOfPaymentsLoading}
                        className="w-full"
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        <Label htmlFor="account" className="text-sm font-medium text-gray-700">
                        Account
                        </Label>
                        <Combobox
                        options={accountOptions}
                        value={account}
                        onChange={setAccount}
                        placeholder="Select account"
                        isLoading={accountsLoading}
                        className="w-full"
                        />
                    </div>
                    </>
                )}

                <div className="grid grid-cols-1 gap-2">
                    <Label className="text-sm font-medium text-gray-700">Total Amount</Label>
                    <Input
                    value={`USD ${numberFormatter.format(totalAmount)}`}
                    disabled
                    className="w-full bg-gray-50 border-gray-300 rounded-md"
                    />
                </div>
                <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="paidAmount" className="text-sm font-medium text-gray-700">
                    Paid Amount
                    </Label>
                    <NumericFormat
                    value={paidAmount}
                    onValueChange={(values) => setPaidAmount(values.floatValue || 0)}
                    customInput={Input}
                    thousandSeparator
                    decimalScale={2}
                    allowNegative={false}
                    prefix="USD "
                    className="w-full border-gray-300 focus:ring-2 focus:ring-blue-500 rounded-md"
                    disabled={paymentStatus === 'Paid' || paymentStatus === 'Not Paid'}
                    />
                </div>
                <div className="grid grid-cols-1 gap-2">
                    <Label className="text-sm font-medium text-gray-700">Outstanding Amount</Label>
                    <Input
                    value={`USD ${numberFormatter.format(totalAmount - paidAmount)}`}
                    disabled
                    className="w-full bg-gray-50 border-gray-300 rounded-md"
                    />
                </div>
                <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="remarks" className="text-sm font-medium text-gray-700">
                    Remarks
                    </Label>
                    <Input
                    id="remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    className="w-full border-gray-300 focus:ring-2 focus:ring-blue-500 rounded-md"
                    />
                </div>
                </div>
                <DialogFooter className="mt-6 flex justify-end space-x-2">
                <Button
                    variant="outline"
                    onClick={handleClosePaymentDialog}
                    className="border-gray-300 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="bg-blue-600 text-white hover:bg-blue-700 rounded-md"
                >
                    {loading ? "Submitting..." : "Submit Invoice"}
                </Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
            <div className="mb-4">
                <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
            </div>
            <Card className="shadow-lg border-top">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 flex flex-col sm:flex-row sm:items-center sm:justify-between ">
                    <CardTitle className="text-2xl font-bold text-gray-800">
                        Create New Purchase Invoice
                    </CardTitle>
                    <div className="flex space-x-2">
                        <Button 
                            variant="outline" 
                            onClick={() => navigate("/purchases")}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            disabled={loading}
                            onClick={handleCreateInvoice}
                            className="text-white bg-black"
                            
                        >
                            {loading ? "Creating..." : "Create Invoice"}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {/* Supplier and Currency */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="supplier" className="text-sm font-semibold text-gray-700">Supplier *</Label>
                                    <div className="relative max-w-full">
                                        <Combobox
                                            options={supplierOptions}
                                            value={supplier}
                                            onChange={setSupplier}
                                            placeholder="Select a supplier"
                                            isLoading={suppliersLoading}
                                            className="w-full max-w-full overflow-hidden z-50"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="currency" className="text-sm font-semibold text-gray-700">Currency *</Label>
                                    <Combobox
                                        options={currencyOptions}
                                        value={currency}
                                        onChange={setCurrency}
                                        placeholder="Select a currency"
                                        isLoading={currenciesLoading}
                                        className="w-full max-w-full overflow-hidden z-50"
                                    />
                                </div>
                            </div>

                            {/* Posting Date */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="postingDate" className="text-sm font-semibold text-gray-700">Posting Date *</Label>
                                    <DatePicker 
                                        date={postingDate} 
                                        setDate={setPostingDate} 
                                        disabled={!editPostingDate}
                                        className="w-full max-w-full"
                                    />
                                    <div className="flex items-center space-x-2 pt-3">
                                        <Checkbox 
                                            id="editPostingDate" 
                                            checked={editPostingDate} 
                                            onCheckedChange={(checked) => setEditPostingDate(checked === true)} 
                                        />
                                        <Label htmlFor="editPostingDate" className="text-sm text-gray-600">Allow Date Edit</Label>
                                    </div>
                                </div>
                            </div>

                            {/* Stock and Warehouse */}
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox 
                                            id="updateStock" 
                                            checked={updateStock} 
                                            onCheckedChange={(checked) => setUpdateStock(checked === true)} 
                                        />
                                        <Label htmlFor="updateStock" className="text-sm font-semibold text-gray-700">Update Stock</Label>
                                    </div>
                                </div>
                                {updateStock && (
                                    <div className="space-y-2">
                                        <Label htmlFor="warehouse" className="text-sm font-semibold text-gray-700">Warehouse</Label>
                                        <div className="relative max-w-full">
                                            <Combobox
                                                options={warehouseOptions}
                                                value={warehouse}
                                                onChange={setWarehouse}
                                                placeholder="Select a warehouse"
                                                isLoading={warehousesLoading}
                                                className="w-full max-w-full overflow-hidden z-50"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Separator className="my-8" />

                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-800">Items</h2>
                                <Button 
                                    type="button" 
                                    onClick={addNewRow} 
                                    variant="outline" 
                                    size="sm"
                                    className="bg-blue-50 hover:bg-blue-100 text-blue-700"
                                >
                                    + Add Item
                                </Button>
                            </div>
                                <Table className="border border-gray-200">
                                    <TableHeader>
                                        <TableRow className="bg-gray-50">
                                            <TableHead className="w-[35%] font-semibold text-gray-700">Item *</TableHead>
                                            <TableHead className="w-[15%] font-semibold text-gray-700">Quantity *</TableHead>
                                            <TableHead className="w-[20%] font-semibold text-gray-700">Rate *</TableHead>
                                            <TableHead className="w-[20%] font-semibold text-gray-700">Amount</TableHead>
                                            <TableHead className="w-[10%]"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {items.map((item, index) => (
                                            <TableRow key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                                <TableCell className="border-t border-gray-200">
                                                    <Combobox
                                                        options={itemOptions}
                                                        value={item.item_code}
                                                        onChange={(value) => handleItemChange(index, 'item_code', value as string)}
                                                        placeholder="Select an item"
                                                        isLoading={itemsLoading}
                                                        className="w-full max-w-full overflow-hidden z-50"
                                                    />
                                                </TableCell>
                                                <TableCell className="border-t border-gray-200">
                                                    <NumericFormat
                                                        value={item.qty}
                                                        onValueChange={(values) => handleItemChange(index, 'qty', values.floatValue||0)}
                                                        customInput={Input}
                                                        className="w-full max-w-full"
                                                        thousandSeparator
                                                        allowLeadingZeros={false}
                                                        allowNegative={false}
                                                    />
                                                </TableCell>
                                                <TableCell className="border-t border-gray-200">
                                                    <NumericFormat
                                                        value={item.rate}
                                                        onValueChange={(values) => handleItemChange(index, 'rate', values.floatValue || 0)}
                                                        customInput={Input}
                                                        className="w-full max-w-full"
                                                        thousandSeparator
                                                        decimalScale={2}
                                                        allowLeadingZeros={false}
                                                        allowNegative={false}
                                                    />
                                                </TableCell>
                                                <TableCell className="border-t text-gray-700 border-gray-200">
                                                    {numberFormatter.format(item.amount)}
                                                </TableCell>
                                                <TableCell className="border-t border-gray-200 text-right p-2">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => removeRow(index)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                           
                        </div>

                        <div className="flex justify-end pt-8">
                            <div className="text-right">
                                <p className="text-sm text-gray-600">Grand Total</p>
                                <p className="text-2xl font-bold text-gray-800">{numberFormatter.format(totalAmount)}</p>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
