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
import { FaCheck } from 'react-icons/fa';

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
    const [isSubmitting, setIsSubmitting] = useState(false);

    const clearFields = () => {
        setPaymentStatus("");
        setStockStatus("");
        setModeOfPayment("");
        setAccount("");
        setPaidAmount(0);
        setRemarks("");
    };

    const handleClose = () => {
        clearFields();
        onClose();
    };

    const { data: modeOfPayments, isLoading: modeOfPaymentsLoading } = useFrappeGetDocList("Mode of Payment", {
        fields: ["name"],
        limit: 1000
    });

    const modeOfPaymentOptions = useMemo(() => {
        if (!modeOfPayments) return [];
        return modeOfPayments.map((m) => ({ label: m.name, value: m.name }));
    }, [modeOfPayments]);

    const { data: modeOfPaymentType } = useFrappeGetDocList("Mode of Payment", {
        fields: ["type"],
        filters: [["name", "=", modeOfPayment]],
        limit: 1
    });

    const { data: accounts, isLoading: accountsLoading } = useFrappeGetDocList("Account", {
        fields: ["name"],
        filters: modeOfPaymentType?.[0]?.type ? [
            ["is_group", "=", 0],
            ["account_type", "=", modeOfPaymentType?.[0]?.type === "Cash" ? "Cash" : "Bank"]
        ] : [["is_group", "=", 0]],
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

    useEffect(() => {
        setAccount("");
    }, [modeOfPayment]);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await onSubmit({
                paymentStatus,
                modeOfPayment,
                account,
                paidAmount,
                remarks,
                update_stock: stockStatus === "Taken"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isConfirmDisabled = () => {
        if (!paymentStatus || !stockStatus) return true;
        if ((paymentStatus === "Paid" || paymentStatus === "Partly Paid") && (!modeOfPayment || !account)) return true;
        return false;
    };

    return (
        <Dialog open={isOpen} onOpenChange={(isOpen) => {
            if (!isOpen) {
                handleClose();
            }
        }}>
            <DialogContent onInteractOutside={(e) => {
                e.preventDefault();
            }} className="max-w-sm bg-white rounded-lg shadow-xl flex flex-col max-h-[90vh]">
                <DialogHeader className="p-4 border-b">
                    <DialogTitle className="text-lg font-semibold text-gray-900">Confirm Sales</DialogTitle>
                </DialogHeader>
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="paymentStatus" className="text-right">Payment Status</Label>
                        <Select
                            value={paymentStatus}
                            onValueChange={setPaymentStatus}
                        >
                            <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-blue-500 rounded-md h-9 col-span-2">
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Not Paid">Not Paid</SelectItem>
                                <SelectItem value="Paid">Paid</SelectItem>
                                <SelectItem value="Partly Paid">Partly Paid</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="stockStatus" className="text-right">Stock Status</Label>
                        <Select
                            value={stockStatus}
                            onValueChange={setStockStatus}
                        >
                            <SelectTrigger className="w-full border-gray-300 focus:ring-2 focus:ring-blue-500 rounded-md h-9 col-span-2">
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
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="modeOfPayment" className="text-right">Mode of Payment</Label>
                                <Combobox
                                    options={modeOfPaymentOptions}
                                    value={modeOfPayment}
                                    onChange={setModeOfPayment}
                                    placeholder="Select mode of payment"
                                    isLoading={modeOfPaymentsLoading}
                                    className="w-full col-span-2"
                                />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="account" className="text-right">Account</Label>
                                <Combobox
                                    options={accountOptions}
                                    value={account}
                                    onChange={setAccount}
                                    placeholder="Select account"
                                    isLoading={accountsLoading}
                                    className="w-full col-span-2"
                                    disabled={!modeOfPayment}
                                />
                            </div>
                        </>
                    )}

                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="text-right">Total Amount</Label>
                        <NumericFormat
                            value={total}
                            displayType="text"
                            thousandSeparator
                            prefix={`${currency} `}
                            decimalScale={2}
                            fixedDecimalScale
                            className="w-full bg-gray-50 border-gray-300 rounded-md p-2 h-9 col-span-2"
                            disabled
                        />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="paidAmount" className="text-right">Paid Amount</Label>
                        <NumericFormat
                            value={paidAmount}
                            onValueChange={(values) => setPaidAmount(values.floatValue || 0)}
                            customInput={Input}
                            thousandSeparator
                            decimalScale={2}
                            allowNegative={false}
                            prefix={`${currency} `}
                            className="w-full border-gray-300 focus:ring-2 focus:ring-blue-500 rounded-md h-9 col-span-2"
                            disabled={paymentStatus === 'Paid' || paymentStatus === 'Not Paid'}
                        />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label className="text-right">Outstanding Amount</Label>
                        <NumericFormat
                            value={total - paidAmount}
                            displayType="text"
                            thousandSeparator
                            prefix={`${currency} `}
                            decimalScale={2}
                            fixedDecimalScale
                            className="w-full bg-gray-50 border-gray-300 rounded-md p-2 h-9 col-span-2"
                            disabled
                        />
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4">
                        <Label htmlFor="remarks" className="text-right">Remarks</Label>
                        <Input
                            id="remarks"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="w-full border-gray-300 focus:ring-2 focus:ring-blue-500 rounded-md h-9 col-span-2"
                        />
                    </div>
                </div>
                <DialogFooter className="pt-6 border-t flex justify-end space-x-2">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="border-red-600 text-red-700 hover:bg-gray-100 rounded-md"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isConfirmDisabled() || isSubmitting}
                        className={`bg-green-600 text-white hover:bg-green-700 rounded-md flex items-center justify-center ${(isConfirmDisabled() || isSubmitting) ? 'cursor-not-allowed bg-gray-400' : ''}`}
                    >
                        {isSubmitting ? 'Submitting...' : <><FaCheck className="mr-2" /> Confirm</>}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PosPaymentDialog;
