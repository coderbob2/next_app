import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import { NumericFormat } from 'react-number-format';
import { useFrappeGetDocList } from 'frappe-react-sdk';

interface CartItem {
    name: string;
    item_name: string;
    quantity: number;
    price: number;
}

interface PosPaymentDialogProps {
    isOpen: boolean;
    onClose: () => void;
    cart: CartItem[];
    total: number;
    onSubmit: (paymentDetails: any) => void;
    currency: string;
}

const PosPaymentDialog: React.FC<PosPaymentDialogProps> = ({ isOpen, onClose, cart, total, onSubmit, currency }) => {
    const [paymentStatus, setPaymentStatus] = useState("");
    const [stockStatus, setStockStatus] = useState("");
    const [modeOfPayment, setModeOfPayment] = useState("");
    const [account, setAccount] = useState("");
    const [paidAmount, setPaidAmount] = useState(0);
    const [remarks, setRemarks] = useState("");

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

    useEffect(() => {
        if (paymentStatus === 'Paid') {
            setPaidAmount(total);
        } else if (paymentStatus === 'Not Paid') {
            setPaidAmount(0);
        } else if (paymentStatus === 'Partly Paid') {
            setPaidAmount(0);
        }
    }, [paymentStatus, total]);

    const handleSubmit = () => {
        onSubmit({
            paymentStatus,
            modeOfPayment,
            account,
            paidAmount,
            remarks,
            update_stock: stockStatus === "Taken"
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={(isOpen) => {
            if (!isOpen) {
                onClose();
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
                    <div className="grid grid-cols-1 gap-2">
                        <Label htmlFor="stockStatus" className="text-sm font-medium text-gray-700">
                            Stock Status
                        </Label>
                        <Select
                            value={stockStatus}
                            onValueChange={setStockStatus}
                        >
                            <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-blue-500 rounded-md">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Taken">Taken</SelectItem>
                                <SelectItem value="Not Taken">Not Taken</SelectItem>
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
                        <NumericFormat
                            value={total}
                            displayType="text"
                            thousandSeparator
                            prefix={`${currency} `}
                            decimalScale={2}
                            fixedDecimalScale
                            className="w-full bg-gray-50 border-gray-300 rounded-md p-2"
                            disabled
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
                            prefix={`${currency} `}
                            className="w-full border-gray-300 focus:ring-2 focus:ring-blue-500 rounded-md"
                            disabled={paymentStatus === 'Paid' || paymentStatus === 'Not Paid'}
                        />
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                        <Label className="text-sm font-medium text-gray-700">Outstanding Amount</Label>
                        <NumericFormat
                            value={total - paidAmount}
                            displayType="text"
                            thousandSeparator
                            prefix={`${currency} `}
                            decimalScale={2}
                            fixedDecimalScale
                            className="w-full bg-gray-50 border-gray-300 rounded-md p-2"
                            disabled
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
                        onClick={onClose}
                        className="border-gray-300 text-gray-700 hover:bg-gray-100 rounded-md"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        className="bg-blue-600 text-white hover:bg-blue-700 rounded-md"
                    >
                        Submit Payment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PosPaymentDialog;
