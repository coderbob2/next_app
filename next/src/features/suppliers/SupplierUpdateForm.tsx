import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFrappeUpdateDoc } from "frappe-react-sdk";
import { useState, useEffect } from "react";
import type { Supplier } from "../../types/Buying/Supplier";
import type { KeyedMutator } from "swr";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SupplierUpdateForm({
  onClose,
  mutate,
  supplier,
}: {
  onClose: () => void;
  mutate: KeyedMutator<any>;
  supplier: Supplier;
}) {
  const [supplierName, setSupplierName] = useState("");
  const [customPhone, setCustomPhone] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [supplierType, setSupplierType] = useState("");
  const [loading, setLoading] = useState(false);

  const supplierTypes = ["Individual", "Company"];

  useEffect(() => {
    if (supplier) {
      setSupplierName(supplier.supplier_name);
      setCustomPhone(supplier.custom_phone ?? "");
      setCustomEmail(supplier.custom_email ?? "");
      setSupplierType(supplier.supplier_type);
    }
  }, [supplier]);

  const { updateDoc } = useFrappeUpdateDoc();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await updateDoc("Supplier", supplier.name, {
        supplier_name: supplierName,
        custom_phone: customPhone,
        custom_email: customEmail,
        supplier_type: supplierType,
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
