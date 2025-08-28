import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFrappeCreateDoc, useFrappeGetDocList } from "frappe-react-sdk";
import { useState } from "react";
import type { KeyedMutator } from "swr";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function WarehouseForm({
  onClose,
  mutate,
}: {
  onClose: () => void;
  mutate: KeyedMutator<any>;
}) {
  const [warehouseName, setWarehouseName] = useState("");
  const [isGroup, setIsGroup] = useState(0);
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);

  const { createDoc } = useFrappeCreateDoc();
    const { data: companies } = useFrappeGetDocList("Company", {
        fields: ["name"],
        limit: 100
    })

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await createDoc("Warehouse", {
        warehouse_name: warehouseName,
        is_group: isGroup,
        company: company,
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