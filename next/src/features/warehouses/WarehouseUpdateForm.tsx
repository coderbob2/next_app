import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFrappeGetDoc, useFrappeUpdateDoc, useFrappeGetDocList } from "frappe-react-sdk";
import { useEffect, useState } from "react";
import type { KeyedMutator } from "swr";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function WarehouseUpdateForm({
  name,
  onClose,
  mutate,
}: {
  name: string;
  onClose: () => void;
  mutate: KeyedMutator<any>;
}) {
  const { data: doc, isLoading, error } = useFrappeGetDoc("Warehouse", name);
  const [warehouseName, setWarehouseName] = useState("");
  const [isGroup, setIsGroup] = useState(0);
  const [company, setCompany] = useState("");
  const [shopNo, setShopNo] = useState("");
  const [phone1, setPhone1] = useState("");
  const [phone2, setPhone2] = useState("");
  const [warehouseType, setWarehouseType] = useState("");
  const [loading, setLoading] = useState(false);

  const { updateDoc } = useFrappeUpdateDoc();
  const { data: companies } = useFrappeGetDocList("Company", {
    fields: ["name"],
    limit: 100
  });
  const { data: warehouseTypes } = useFrappeGetDocList("Warehouse Type", {
      fields: ["name"],
      limit: 100
  });

  useEffect(() => {
    if (doc) {
      setWarehouseName(doc.warehouse_name);
      setIsGroup(doc.is_group);
      setCompany(doc.company);
      setShopNo(doc.custom_shop_no);
      setPhone1(doc.custom_phone_1);
      setPhone2(doc.custom_phone_2);
      setWarehouseType(doc.warehouse_type);
    }
  }, [doc]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await updateDoc("Warehouse", name, {
        warehouse_name: warehouseName,
        is_group: isGroup,
        company: company,
        custom_shop_no: shopNo,
        custom_phone_1: phone1,
        custom_phone_2: phone2,
        warehouse_type: warehouseType
      });
      mutate();
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="warehouse_name">Warehouse Name</Label>
        <Input
          id="warehouse_name"
          value={warehouseName}
          onChange={(e) => setWarehouseName(e.target.value)}
        />
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="is_group"
          checked={!!isGroup}
          onCheckedChange={(checked) => setIsGroup(checked ? 1 : 0)}
        />
        <Label htmlFor="is_group">Is Group</Label>
      </div>
      <div>
        <Label htmlFor="company">Company</Label>
        <Select value={company} onValueChange={setCompany}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a company" />
          </SelectTrigger>
          <SelectContent>
            {companies?.map((company) => (
              <SelectItem key={company.name} value={company.name}>{company.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="warehouse_type">Warehouse Type</Label>
        <Select value={warehouseType} onValueChange={setWarehouseType}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a type" />
          </SelectTrigger>
          <SelectContent>
            {warehouseTypes?.map((type) => (
              <SelectItem key={type.name} value={type.name}>{type.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="shop_no">Shop No</Label>
        <Input
          id="shop_no"
          value={shopNo}
          onChange={(e) => setShopNo(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="phone1">Phone 1</Label>
        <Input
          id="phone1"
          value={phone1}
          onChange={(e) => setPhone1(e.target.value)}
        />
      </div>
      <div>
        <Label htmlFor="phone2">Phone 2</Label>
        <Input
          id="phone2"
          value={phone2}
          onChange={(e) => setPhone2(e.target.value)}
        />
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