import { useFrappeCreateDoc, useFrappeGetDocList } from "frappe-react-sdk";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/datepicker";
import { ScrollableCombobox } from "@/components/ui/scrollable-combobox";

export default function CustomExchangeRateForm({
  onClose,
  mutate,
}: {
  onClose: () => void;
  mutate: () => void;
}) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [fromCurrency, setFromCurrency] = useState("");
  const [toCurrency, setToCurrency] = useState("");
  const [exRate, setExRate] = useState(0);

  const { createDoc } = useFrappeCreateDoc();

  const { data: currencies } = useFrappeGetDocList("Currency", {
    fields: ["name"],
    filters: [["enabled", "=", 1]],
    limit: 1000,
  });

  const handleSubmit = () => {
    if (!date) {
      return;
    }
    createDoc("Custom Exchange Rate", {
      date: date.toISOString().split("T")[0],
      from_currency: fromCurrency,
      to_currency: toCurrency,
      ex_rate: exRate,
    }).then(() => {
      mutate();
      onClose();
    });
  };

  return (
    <div>
      <div className="space-y-4">
        <DatePicker date={date} setDate={setDate} />
        <ScrollableCombobox
          placeholder="From Currency"
          value={fromCurrency}
          onChange={setFromCurrency}
          options={currencies?.map(currency => ({ value: currency.name, label: currency.name })) ?? []}
        />
        <ScrollableCombobox
          placeholder="To Currency"
          value={toCurrency}
          onChange={setToCurrency}
          options={currencies?.map(currency => ({ value: currency.name, label: currency.name })) ?? []}
        />
        <Input
          placeholder="Exchange Rate"
          type="number"
          value={exRate}
          onChange={(e) => setExRate(parseFloat(e.target.value))}
        />
      </div>
      <div className="flex justify-end mt-4">
        <Button onClick={handleSubmit}>Submit</Button>
      </div>
    </div>
  );
}