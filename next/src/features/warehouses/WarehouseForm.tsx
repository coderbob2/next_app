import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
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
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useCompany } from "@/hooks/useCompany";

export default function WarehouseForm({
  onClose,
  mutate,
}: {
  onClose: () => void;
  mutate: KeyedMutator<any>;
}) {
  const [warehouseName, setWarehouseName] = useState("");
  const [shopNo, setShopNo] = useState("");
  const [phone1, setPhone1] = useState("");
  const [phone2, setPhone2] = useState("");
  const [warehouseType, setWarehouseType] = useState("");
  const [loading, setLoading] = useState(false);
  const  company  = useCompany();


  const { createDoc } = useFrappeCreateDoc();
  const { data: parentAccount } = useFrappeGetDocList("Account", {
    filters: [
      ["account_number", "=", "1100"],
      ["is_group", "=", 1],
    ],
    fields: ["name"],
    limit: 1,
  });
  const { data: warehouseTypes } = useFrappeGetDocList("Warehouse Type", {
    fields: ["name"],
    limit: 100,
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const cashAccount = await createDoc("Account", {
        account_name: `${warehouseName} Cash`,
        parent_account: parentAccount?.[0]?.name,
        company: company,
        is_group: 0,
        account_type: "Cash",
      });

      await createDoc("Warehouse", {
        warehouse_name: warehouseName,
        is_group: 0,
        company: company,
        custom_shop_no: shopNo,
        custom_phone_1: phone1,
        custom_phone_2: phone2,
        warehouse_type: warehouseType,
        custom_cash_account: cashAccount.name,
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
    <DialogContent>
   
      
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800">Create Warehouse</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="warehouse_name">Warehouse Name</Label>
            <Input
              id="warehouse_name"
              placeholder="Enter warehouse name"
              value={warehouseName}
              onChange={(e) => setWarehouseName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="warehouse_type">Warehouse Type</Label>
            <Select value={warehouseType} onValueChange={setWarehouseType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a type" />
              </SelectTrigger>
              <SelectContent>
                {warehouseTypes?.map((type) => (
                  <SelectItem key={type.name} value={type.name}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="shop_no">Shop No</Label>
              <Input
                id="shop_no"
                placeholder="Shop number"
                value={shopNo}
                onChange={(e) => setShopNo(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone1">Phone 1</Label>
              <Input
                id="phone1"
                placeholder="Primary phone"
                value={phone1}
                onChange={(e) => setPhone1(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="phone2">Phone 2</Label>
              <Input
                id="phone2"
                placeholder="Secondary phone"
                value={phone2}
                onChange={(e) => setPhone2(e.target.value)}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col md:flex-row gap-2 md:justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full md:w-auto"
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} className="w-full md:w-auto">
            {loading ? "Saving..." : "Save"}
          </Button>
        </CardFooter>
  
    </DialogContent>

  );
}
