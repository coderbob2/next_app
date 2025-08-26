import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFrappeCreateDoc } from "frappe-react-sdk";
import { useState } from "react";
import type { KeyedMutator } from "swr";

export default function CustomerForm({
  onClose,
  mutate,
}: {
  onClose: () => void;
  mutate: KeyedMutator<any>;
}) {
  const [customerName, setCustomerName] = useState("");
  const [customPhone, setCustomPhone] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [customerType, setCustomerType] = useState("Individual");
  const [loading, setLoading] = useState(false);

  const { createDoc } = useFrappeCreateDoc();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await createDoc("Customer", {
        customer_name: customerName,
        custom_phone: customPhone,
        custom_email: customEmail,
        customer_type: customerType,
      });
      mutate();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="customer_name">Customer Name</Label>
        <Input
          id="customer_name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="custom_phone">Phone</Label>
        <Input
          id="custom_phone"
          value={customPhone}
          onChange={(e) => setCustomPhone(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="custom_email">Email</Label>
        <Input
          id="custom_email"
          value={customEmail}
          onChange={(e) => setCustomEmail(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="customer_type">Customer Type</Label>
        <Select value={customerType} onValueChange={setCustomerType}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a customer type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Individual">Individual</SelectItem>
            <SelectItem value="Company">Company</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
