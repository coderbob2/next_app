import { useFrappeUpdateDoc, useFrappeGetDocList } from "frappe-react-sdk";
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
import { useState } from "react";
import type { Item } from "@/types/Stock/Item";
import { toast } from "sonner";

interface ItemUpdateFormProps {
  item: Item;
  onClose: () => void;
  mutate: () => void;
}

export default function ItemUpdateForm({ item, onClose, mutate }: ItemUpdateFormProps) {
  const [itemName, setItemName] = useState(item.item_name);
  const [itemGroup, setItemGroup] = useState(item.item_group);
  const [stockUom, setStockUom] = useState(item.stock_uom);
  const [sellingPrice, setSellingPrice] = useState(String(item.standard_rate ?? ""));
  const [valuationRate, setValuationRate] = useState(String(item.valuation_rate ?? ""));

  const { data: itemGroups } = useFrappeGetDocList("Item Group", {
    fields: ["name"],
    limit: 100,
  });

  const { data: uoms } = useFrappeGetDocList("UOM", {
    fields: ["name"],
    limit: 100,
  });

  const { updateDoc, loading } = useFrappeUpdateDoc();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDoc("Item", item.name, {
        item_name: itemName,
        item_group: itemGroup,
        stock_uom: stockUom,
        standard_rate: Number(sellingPrice),
        valuation_rate: Number(valuationRate),
      });
      toast.success("Item updated successfully", {
        position: "top-right",
        style: {
          borderColor: "green",
        },
      });
      mutate();
      onClose();
    } catch (error: any) {
      toast.error("Item Update Failed", {
        description: JSON.parse(
          JSON.parse(error._server_messages)[0]
        ).message.replace(/<[^>]*>?/gm, ""),
        position: "top-right",
        style: {
          borderColor: "red",
        },
      });
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="itemName">Item Name</Label>
        <Input
          id="itemName"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="itemGroup">Item Group</Label>
        <Select onValueChange={setItemGroup} value={itemGroup}>
          <SelectTrigger id="itemGroup" className="w-full">
            <SelectValue placeholder="Select an item group" />
          </SelectTrigger>
          <SelectContent>
            {itemGroups?.map((group) => (
              <SelectItem key={group.name} value={group.name}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="stockUom">Stock UOM</Label>
        <Select onValueChange={setStockUom} value={stockUom}>
          <SelectTrigger id="stockUom" className="w-full">
            <SelectValue placeholder="Select a UOM" />
          </SelectTrigger>
          <SelectContent>
            {uoms?.map((uom) => (
              <SelectItem key={uom.name} value={uom.name}>
                {uom.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="sellingPrice">Selling Price</Label>
        <Input
          id="sellingPrice"
          type="number"
          value={sellingPrice}
          onChange={(e) => setSellingPrice(e.target.value)}
          required
        />
      </div>
      <div>
        <Label htmlFor="valuationRate">Valuation Rate</Label>
        <Input
          id="valuationRate"
          type="number"
          value={valuationRate}
          onChange={(e) => setValuationRate(e.target.value)}
          required
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? "Updating..." : "Update"}
      </Button>
    </form>
  );
}
