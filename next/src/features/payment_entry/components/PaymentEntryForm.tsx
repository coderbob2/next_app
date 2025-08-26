import type { PaymentEntry } from "@/types/Accounts/PaymentEntry";
import { useFrappeCreateDoc, useFrappeGetDocList } from "frappe-react-sdk";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useMemo } from "react";
import type { KeyedMutator } from "swr";
import { toast } from "sonner";
import { Combobox } from "@/components/ui/combobox";
import { NumericFormat } from "react-number-format";
import { DatePicker } from "@/components/ui/datepicker";



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
    const [paidAmount, setPaidAmount] = useState(0);
    const [remarks, setRemarks] = useState("");
    const [currency, setCurrency] = useState("");
    const [paidToAccount, setPaidToAccount] = useState("");

    const { data: customers, isLoading: customersLoading } = useFrappeGetDocList("Customer", {
        fields: ["name"],
        limit: 1000
    });
    const customerOptions = useMemo(() => {
        if (!customers) return [];
        return customers.map((c) => ({ label: c.name, value: c.name }));
    }, [customers]);

    const { data: suppliers, isLoading: suppliersLoading } = useFrappeGetDocList("Supplier", {
        fields: ["name"],
        limit: 1000
    });
    const supplierOptions = useMemo(() => {
        if (!suppliers) return [];
        return suppliers.map((s) => ({ label: s.name, value: s.name }));
    }, [suppliers]);

    const partyOptions = partyType === 'Customer' ? customerOptions : supplierOptions;

    const { data: modeOfPayments, isLoading: modeOfPaymentsLoading } = useFrappeGetDocList("Mode of Payment", {
        fields: ["name"],
        limit: 1000
    });
    const modeOfPaymentOptions = useMemo(() => {
        if (!modeOfPayments) return [];
        return modeOfPayments.map((m) => ({ label: m.name, value: m.name }));
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
        filters: [["is_group", "=", 0]],
        limit: 1000
    });

    const accountOptions = useMemo(() => {
        if (!accounts) return [];
        return accounts.map((a) => ({ label: a.name, value: a.name }));
    }, [accounts]);

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
        if (!postingDate) {
            toast.error("Posting Date is required.");
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
        if (!paidToAccount) {
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
                paid_to_account_currency: currency,
                paid_from_account_currency: currency,
                paid_to: paidToAccount,
                remarks: remarks,
                docstatus: 1,
                payment_type: paymentType
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

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <Label htmlFor="party" className="text-sm font-semibold text-gray-700">Party *</Label>
                    <Combobox
                        options={partyOptions}
                        value={partyName}
                        onChange={setPartyName}
                        placeholder={`Select a ${partyType.toLowerCase()}`}
                        isLoading={partyType === 'Customer' ? customersLoading : suppliersLoading}
                        className="w-full"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="postingDate" className="text-sm font-semibold text-gray-700">Posting Date *</Label>
                    <DatePicker
                        date={postingDate}
                        setDate={setPostingDate}
                        className="w-full"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="modeOfPayment" className="text-sm font-semibold text-gray-700">Mode of Payment *</Label>
                    <Combobox
                        options={modeOfPaymentOptions}
                        value={modeOfPayment}
                        onChange={setModeOfPayment}
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
                <div className="space-y-2">
                    <Label htmlFor="paidToAccount" className="text-sm font-semibold text-gray-700">Paid To Account *</Label>
                    <Combobox
                        options={accountOptions}
                        value={paidToAccount}
                        onChange={setPaidToAccount}
                        placeholder="Select an account"
                        isLoading={accountsLoading}
                        className="w-full"
                    />
                </div>
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