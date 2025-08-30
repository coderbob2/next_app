import type { PaymentEntry } from "@/types/Accounts/PaymentEntry";
import { useFrappeCreateDoc, useFrappeGetDocList } from "frappe-react-sdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useMemo, useEffect } from "react";
import type { KeyedMutator } from "swr";
import { toast } from "sonner";
import { Combobox } from "@/components/ui/combobox";
import { NumericFormat } from "react-number-format";
import { useCompany } from "@/hooks/useCompany";
import { useWarehouses } from "@/features/pos/posAPI";



interface PaymentEntryFormProps {
  paymentType: "Receive" | "Pay";
  onClose: () => void;
  mutate: KeyedMutator<any>;
}

export default function PaymentEntryForm({
  paymentType,
  onClose,
  mutate,
}: PaymentEntryFormProps) {
    const party = paymentType === 'Receive' ? 'Customer' : 'Supplier';


    const partyType = party;
    const [partyName, setPartyName] = useState("");
    const [postingDate, setPostingDate] = useState<Date | undefined>(new Date());
    const [modeOfPayment, setModeOfPayment] = useState("");
    const [warehouse, setWarehouse] = useState('');
    const [paidAmount, setPaidAmount] = useState(0);
    const [remarks, setRemarks] = useState("");
    const [currency, setCurrency] = useState("");
    const [paidToAccount, setPaidToAccount] = useState("");
    const [paidFromAccount, setPaidFromAccount] = useState("");
    const [sourceExchangeRate, setSourceExchangeRate] = useState<number | undefined>();
    const [isAccountDisabled, setIsAccountDisabled] = useState(true);

    const companyContext = useCompany();
    const company = companyContext?.company;
    const companyCurrency = companyContext?.currency;

    const { data: warehouses, isLoading: warehousesLoading } = useWarehouses(company as string);
  
    const warehouseOptions = useMemo(() => {
        if (!warehouses) return [];
        return warehouses.map((w) => ({ label: w.name, value: w.name }));
    }, [warehouses]);

    const { data: customers, isLoading: customersLoading } = useFrappeGetDocList("Customer", {
        fields: ["name"],
        limit: 1000
    });
    const customerOptions = useMemo(() => {
        if (!customers) return [];
        return customers.map((c) => ({ label: c.name, value: c.name }));
    }, [customers]);

    const { data: suppliers, isLoading: suppliersLoading } = useFrappeGetDocList("Supplier", {
        fields: ["name", "default_currency"],
        limit: 1000
    });
    const supplierOptions = useMemo(() => {
        if (!suppliers) return [];
        return suppliers.map((s) => ({ label: s.name, value: s.name, default_currency: s.default_currency }));
    }, [suppliers]);

    const partyOptions = partyType === 'Customer' ? customerOptions : supplierOptions;

    const { data: modeOfPayments, isLoading: modeOfPaymentsLoading } = useFrappeGetDocList("Mode of Payment", {
        fields: ["name", "type"],
        limit: 1000
    });
    const modeOfPaymentOptions = useMemo(() => {
        if (!modeOfPayments) return [];
        return modeOfPayments.map((m) => ({ label: m.name, value: m.name, type: m.type }));
    }, [modeOfPayments]);

    const { data: currencies, isLoading: currenciesLoading } = useFrappeGetDocList("Currency", {
        fields: ["name"],
        limit: 1000
    });

    const currencyOptions = useMemo(() => {
        if (!currencies) return [];
        return currencies.map((c) => ({ label: c.name, value: c.name }));
    }, [currencies]);

    const { data: accounts, isLoading: accountsLoading } = useFrappeGetDocList("Account", {
        fields: ["name"],
        filters: [
            ["is_group", "=", 0],
            ["account_type", "=", modeOfPayment],
            ["account_currency", "=", currency],
           
        ],
        limit: 1000
    });

    const accountOptions = useMemo(() => {
        if (!accounts) return [];
        return accounts.map((a) => ({ label: a.name, value: a.name }));
    }, [accounts]);

    useEffect(() => {
        if (warehouse && currency && modeOfPayment) {
            setIsAccountDisabled(false);
        } else {
            setIsAccountDisabled(true);
            if (paymentType === 'Pay') {
                setPaidFromAccount("");
            } else {
                setPaidToAccount("");
            }
        }
    }, [warehouse, currency, modeOfPayment, paymentType])

    const { createDoc, loading } = useFrappeCreateDoc();

    const validateForm = () => {
        if (!partyType) {
            toast.error("Party Type is required.");
            return false;
        }
        if (!partyName) {
            toast.error("Party is required.");
            return false;
        }
        if (!warehouse) {
            toast.error("Warehouse is required.");
            return false;
        }
        if (!modeOfPayment) {
            toast.error("Mode of Payment is required.");
            return false;
        }
        if (paidAmount <= 0) {
            toast.error("Paid Amount must be greater than 0.");
            return false;
        }
        if (!currency) {
            toast.error("Currency is required.");
            return false;
        }
        if (paymentType === 'Pay' && !paidFromAccount) {
            toast.error("Paid From Account is required.");
            return false;
        }
        if (paymentType === 'Receive' && !paidToAccount) {
            toast.error("Paid To Account is required.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }
        try {
            const doc: Partial<PaymentEntry> = {
                party_type: partyType,
                party: partyName,
                posting_date: postingDate ? postingDate.toISOString().split('T')[0] : "",
                mode_of_payment: modeOfPayment,
                paid_amount: paidAmount,
                received_amount: paidAmount,
                // paid_to_account_currency: currency,
                paid_from_account_currency: currency,
                paid_to: paymentType === 'Receive' ? paidToAccount : '',
                paid_from: paymentType === 'Pay' ? paidFromAccount : '',
                remarks: remarks,
                docstatus: 1,
                payment_type: paymentType,
                source_exchange_rate: sourceExchangeRate
            };

            await createDoc("Payment Entry", doc);
            toast.success("Payment Entry created and submitted successfully");
            mutate();
            onClose();
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

    const { data: warehouseDoc } = useFrappeGetDocList("Warehouse", {
        fields: ["name", "cash_account"],
        filters: [["name", "=", warehouse]],
        limit: 1
    });

    const { data: modeOfPaymentType } = useFrappeGetDocList("Mode of Payment", {
        fields: ["type"],
        filters: [["name", "=", modeOfPayment]],
        limit: 1
    });

    useEffect(() => {
        if (modeOfPayment === 'Cash' && warehouseDoc?.[0]?.cash_account) {
            if (paymentType === 'Pay') {
                setPaidFromAccount(warehouseDoc[0].cash_account);
            } else {
                setPaidToAccount(warehouseDoc[0].cash_account);
            }
        }
    }, [modeOfPaymentType, warehouseDoc, paymentType]);

    useEffect(() => {
        if (postingDate && currency && currency !== companyCurrency) {
            fetch('/api/method/next_app.next_app.doctype.custom_exchange_rate.custom_exchange_rate.get_exchange_rate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    date: new Date(postingDate.getTime() - (postingDate.getTimezoneOffset() * 60000)).toISOString().split('T')[0]
                })
            }).then(res => res.json()).then(data => {
                if (data.message) {
                    const { from_currency, to_currency, ex_rate } = data.message;
                    if (from_currency === currency && to_currency === companyCurrency) {
                        setSourceExchangeRate(ex_rate);
                    } else if (from_currency === companyCurrency && to_currency === currency) {
                        setSourceExchangeRate(1 / ex_rate);
                    } else {
                        toast.error("Exchange rate for the selected currency is not configured correctly.");
                    }
                } else {
                    toast.error("Exchange rate not found or is 0 for the selected date.");
                }
            })
        }
    }, [postingDate, currency, companyCurrency])

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <Label htmlFor="party" className="text-sm font-semibold text-gray-700">Party *</Label>
                    <Combobox
                        options={partyOptions}
                        value={partyName}
                        onChange={(value) => {
                            setPartyName(value);
                            if (paymentType === 'Pay') {
                                const supplier = supplierOptions.find(s => s.value === value);
                                if (supplier) {
                                    setCurrency(supplier.default_currency);
                                }
                            }
                        }}
                        placeholder={`Select a ${partyType.toLowerCase()}`}
                        isLoading={partyType === 'Customer' ? customersLoading : suppliersLoading}
                        className="w-full"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="warehouse" className="text-sm font-semibold text-gray-700">Warehouse *</Label>
                    <Combobox
                        options={warehouseOptions}
                        value={warehouse}
                        onChange={setWarehouse}
                        placeholder="Select a warehouse"
                        isLoading={warehousesLoading}
                        className="w-full"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="modeOfPayment" className="text-sm font-semibold text-gray-700">Mode of Payment *</Label>
                    <Combobox
                        options={modeOfPaymentOptions}
                        value={modeOfPaymentOptions.find(m => m.type === modeOfPayment)?.value}
                        onChange={(value) => {
                            const selectedOption = modeOfPaymentOptions.find(m => m.value === value);
                            if (selectedOption) {
                                setModeOfPayment(selectedOption.type);
                            }
                        }}
                        placeholder="Select mode of payment"
                        isLoading={modeOfPaymentsLoading}
                        className="w-full"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="currency" className="text-sm font-semibold text-gray-700">Currency *</Label>
                    <Combobox
                        options={currencyOptions}
                        value={currency}
                        onChange={setCurrency}
                        placeholder="Select a currency"
                        isLoading={currenciesLoading}
                        className="w-full"
                    />
                </div>
                {currency !== companyCurrency && sourceExchangeRate &&
                    <div className="space-y-2">
                        <Label htmlFor="exchangeRate" className="text-sm font-semibold text-gray-700">Exchange Rate</Label>
                        <NumericFormat
                            value={sourceExchangeRate}
                            onValueChange={(values) => setSourceExchangeRate(values.floatValue)}
                            customInput={Input}
                            thousandSeparator
                            decimalScale={6}
                            allowNegative={false}
                            className="w-full"
                        />
                    </div>
                }
                {modeOfPayment && modeOfPayment !== 'Cash' &&
                    <div className="space-y-2">
                        <Label htmlFor="paidFromAccount" className="text-sm font-semibold text-gray-700">{paymentType === 'Pay' ? 'Paid From Account *' : 'Paid To Account *'}</Label>
                        <Combobox
                            options={accountOptions}
                            value={paymentType === 'Pay' ? paidFromAccount : paidToAccount}
                            onChange={paymentType === 'Pay' ? setPaidFromAccount : setPaidToAccount}
                            placeholder={`Select ${paymentType === 'Pay' ? 'an account to pay from' : 'an account to pay to'}`}
                            isLoading={accountsLoading}
                            className="w-full"
                            disabled={isAccountDisabled}
                        />
                    </div>
                }
               <div className="space-y-2">
                    <Label htmlFor="paidAmount" className="text-sm font-semibold text-gray-700">Paid Amount *</Label>
                    <NumericFormat
                        value={paidAmount}
                        onValueChange={(values) => setPaidAmount(values.floatValue || 0)}
                        customInput={Input}
                        thousandSeparator
                        decimalScale={2}
                        allowNegative={false}
                        className="w-full"
                    />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="remarks" className="text-sm font-semibold text-gray-700">Remarks</Label>
                    <Input
                        id="remarks"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className="w-full"
                    />
                </div>
            </div>

            <div className="flex justify-end space-x-2 pt-6">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => onClose()}
                    className="text-gray-600 hover:text-gray-800"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    disabled={loading}
                    className="text-white bg-black"
                >
                    {loading ? "Creating..." : "Create Payment Entry"}
                </Button>
            </div>
        </form>
    );
}