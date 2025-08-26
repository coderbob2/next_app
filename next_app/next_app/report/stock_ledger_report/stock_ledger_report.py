# Copyright (c) 2024, jHetzer and contributors
# For license information, please see license.txt

import frappe

def execute(filters=None):
    if not filters:
        filters = {}

    columns = get_columns()
    data = get_data(filters)
    total = get_total(filters)

    # return in ERPNext report format
    return columns, data, None, None, {"total": total}


def get_conditions(filters):
    conditions = "1=1"
    if filters.get("warehouse"):
        conditions += f" AND sle.warehouse = '{filters['warehouse']}'"
    if filters.get("item_code"):
        conditions += f" AND sle.item_code = '{filters['item_code']}'"
    if filters.get("from_date"):
        conditions += f" AND sle.posting_date >= '{filters['from_date']}'"
    if filters.get("to_date"):
        conditions += f" AND sle.posting_date <= '{filters['to_date']}'"
    return conditions


def get_data(filters):
    conditions = get_conditions(filters)

    page_length = int(filters.get("page_length", 20))
    start = int(filters.get("start", 0))

    # --- Opening balances per item+warehouse before from_date ---
    opening_balances = {}
    if filters.get("from_date"):
        opening_entries = frappe.db.sql(f"""
            SELECT item_code, warehouse, SUM(actual_qty) as qty
            FROM `tabStock Ledger Entry`
            WHERE posting_date < '{filters['from_date']}'
            { "AND warehouse = '{}'".format(filters['warehouse']) if filters.get('warehouse') else "" }
            { "AND item_code = '{}'".format(filters['item_code']) if filters.get('item_code') else "" }
            GROUP BY item_code, warehouse
        """, as_dict=True)
        for e in opening_entries:
            opening_balances[(e.item_code, e.warehouse)] = e.qty or 0

    # --- Fetch all entries in date range ---
    entries = frappe.db.sql(f"""
        SELECT
            sle.name, sle.posting_date, sle.posting_time,
            sle.item_code,
            (SELECT item_name FROM `tabItem` WHERE name = sle.item_code) as item_name,
            sle.warehouse,
            CASE WHEN sle.actual_qty > 0 THEN sle.actual_qty ELSE 0 END as in_qty,
            CASE WHEN sle.actual_qty < 0 THEN ABS(sle.actual_qty) ELSE 0 END as out_qty,
            sle.actual_qty,
            sle.valuation_rate,
            sle.stock_value,
            sle.voucher_type,
            sle.voucher_no
        FROM `tabStock Ledger Entry` sle
        WHERE {conditions}
        ORDER BY sle.item_code, sle.warehouse, sle.posting_date ASC, sle.posting_time ASC, sle.creation ASC
    """, as_dict=True)

    ledger = []

    # --- Compute running balance ---
    balance_map = opening_balances.copy()

    # insert opening balance at start of ledger if start==0
    opening_rows = []
    if start == 0:
        for key, qty in opening_balances.items():
            item_code, warehouse = key
            item_name = frappe.db.get_value("Item", item_code, "item_name")
            opening_rows.append({
                "name": "Opening",
                "posting_date": filters.get("from_date") or "",
                "posting_time": "00:00:00",
                "item_code": item_code,
                "item_name": item_name,
                "warehouse": warehouse,
                "in_qty": 0,
                "out_qty": 0,
                "balance_qty": qty,
                "valuation_rate": 0,
                "stock_value": 0,
                "voucher_type": "",
                "voucher_no": ""
            })

    all_rows = []

    for e in entries:
        key = (e.item_code, e.warehouse)
        prev_balance = balance_map.get(key, 0)
        new_balance = prev_balance + e.actual_qty
        balance_map[key] = new_balance

        all_rows.append({
            "name": e.name,
            "posting_date": e.posting_date,
            "posting_time": e.posting_time,
            "item_code": e.item_code,
            "item_name": e.item_name,
            "warehouse": e.warehouse,
            "in_qty": e.in_qty,
            "out_qty": e.out_qty,
            "balance_qty": new_balance,
            "valuation_rate": e.valuation_rate,
            "stock_value": e.stock_value,
            "voucher_type": e.voucher_type,
            "voucher_no": e.voucher_no
        })

    # combine opening + all rows
    final_ledger = opening_rows + all_rows

    # --- Pagination ---
    paged_ledger = final_ledger[start:start + page_length]

    return paged_ledger


def get_total(filters):
    conditions = get_conditions(filters)
    total = frappe.db.sql(f"""
        SELECT COUNT(*)
        FROM `tabStock Ledger Entry` sle
        WHERE {conditions}
    """)[0][0]
    return total


def get_columns():
    return [
        {"label": "ID", "fieldname": "name", "fieldtype": "Data", "width": 120},
        {"label": "Date", "fieldname": "posting_date", "fieldtype": "Date", "width": 100},
        {"label": "Time", "fieldname": "posting_time", "fieldtype": "Time", "width": 100},
        {"label": "Item", "fieldname": "item_code", "fieldtype": "Link", "options": "Item", "width": 150},
        {"label": "Item Name", "fieldname": "item_name", "fieldtype": "Data", "width": 200},
        {"label": "Warehouse", "fieldname": "warehouse", "fieldtype": "Link", "options": "Warehouse", "width": 120},
        {"label": "In Qty", "fieldname": "in_qty", "fieldtype": "Float", "width": 80},
        {"label": "Out Qty", "fieldname": "out_qty", "fieldtype": "Float", "width": 80},
        {"label": "Balance Qty", "fieldname": "balance_qty", "fieldtype": "Float", "width": 100},
        {"label": "Valuation Rate", "fieldname": "valuation_rate", "fieldtype": "Currency", "width": 120},
        {"label": "Stock Value", "fieldname": "stock_value", "fieldtype": "Currency", "width": 120},
        {"label": "Voucher Type", "fieldname": "voucher_type", "fieldtype": "Data", "width": 120},
        {"label": "Voucher No", "fieldname": "voucher_no", "fieldtype": "Dynamic Link", "options": "voucher_type", "width": 120},
    ]
