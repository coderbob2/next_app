import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFrappeCreateDoc } from "frappe-react-sdk";
import { useState } from "react";
import type { KeyedMutator } from "swr";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SupplierForm({
  onClose,
  mutate,
}: {
  onClose: () => void;
  mutate: KeyedMutator<any>;
}) {
  const [supplierName, setSupplierName] = useState("");
  const [customPhone, setCustomPhone] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [supplierType, setSupplierType] = useState("");
  const [loading, setLoading] = useState(false);

  const supplierTypes = ["Individual", "Company"];

  const { createDoc } = useFrappeCreateDoc();

  const handleSubmit = () => {
    setLoading(true);
    createDoc("Supplier", {
      supplier_name: supplierName,
      custom_phone: customPhone,
      custom_email: customEmail,
      supplier_type: supplierType,
    }).then(() => {
      mutate();
      onClose();
    }).finally(() => {
      setLoading(false);
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="supplier_name">Supplier Name</Label>
        <Input
          id="supplier_name"
          value={supplierName}
          onChange={(e) => setSupplierName(e.target.value)}
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
        <Label htmlFor="supplier_type">Supplier Type</Label>
        <Select value={supplierType} onValueChange={setSupplierType}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a supplier type" />
          </SelectTrigger>
          <SelectContent>
            {supplierTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
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
