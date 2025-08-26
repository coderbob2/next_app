import { useFrappeGetCall, useFrappePostCall } from "frappe-react-sdk";
import type { StockEntry } from "@/types/Stock/StockEntry";

export interface StockBalanceReportRow {
  item_code: string;
  item_name: string;
  warehouse: string;
  in_qty: number;
  out_qty: number;
  balance_qty: number;
  valuation_rate: number;
  balance_value: number;
}

export interface StockBalanceReport {
  columns: any[]; // You might want to define a more specific type for columns
  data: StockBalanceReportRow[];
}

export function useStockBalance() {
  const { call, loading, error } = useFrappePostCall('next_app.next_app.report.custom_stock_balance.custom_stock_balance.execute');
  return { call, loading, error };
}

export function useCreateStockTransfer() {
  return useFrappePostCall("next_app.next_app.stock_api.create_stock_entry");
}