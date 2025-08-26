# Copyright (c) 2024, jHetzer and contributors
# For license information, please see license.txt

import frappe

@frappe.whitelist()
def execute(filters=None):
	if not filters:
		filters = {}

	columns = get_columns()
	data, total = get_data(filters)
	
	return columns, data, total

def get_data(filters):
	conditions, values = get_conditions(filters)

	limit_start = filters.get("limit_start", 0)
	limit_page_length = filters.get("limit_page_length", 10)
	order_by = filters.get("order_by", "item_code")
	order = filters.get("order", "asc")

	total = frappe.db.sql(f"""
		SELECT COUNT(DISTINCT sle.item_code, sle.warehouse)
		FROM `tabStock Ledger Entry` sle
		JOIN `tabItem` i ON i.name = sle.item_code
		WHERE {conditions}
	""", values=values)[0][0]

	data = frappe.db.sql(f"""
		SELECT
			sle.item_code,
			i.item_name,
			sle.warehouse,
			SUM(IF(sle.actual_qty > 0, sle.actual_qty, 0)) as in_qty,
			SUM(IF(sle.actual_qty < 0, sle.actual_qty, 0)) as out_qty,
			SUM(sle.actual_qty) as balance_qty,
			AVG(sle.valuation_rate) as valuation_rate,
			SUM(sle.stock_value_difference) as balance_value
		FROM `tabStock Ledger Entry` sle
		JOIN `tabItem` i ON i.name = sle.item_code
		WHERE {conditions}
		GROUP BY sle.item_code, sle.warehouse
		ORDER BY {order_by} {order}
		LIMIT {limit_start}, {limit_page_length}
	""", values=values, as_dict=True)
	
	return data, total

def get_conditions(filters):
	conditions = "1=1"
	values = {}

	if filters.get("warehouse") and filters.get("warehouse") != '':
		conditions += " AND warehouse = %(warehouse)s"
		values["warehouse"] = filters["warehouse"]
	if filters.get("name"):
		conditions += " AND i.item_name LIKE %(item_name)s"
		values["item_name"] = f"%{filters['name']}%"

	return conditions, values

def get_columns():
	return [
		{"label": "Item", "fieldname": "item_code", "fieldtype": "Link", "options": "Item", "width": 200},
		{"label": "Item Name", "fieldname": "item_name", "fieldtype": "Data", "width": 200},
		{"label": "Warehouse", "fieldname": "warehouse", "fieldtype": "Link", "options": "Warehouse", "width": 150},
		{"label": "In Qty", "fieldname": "in_qty", "fieldtype": "Float", "width": 100},
		{"label": "Out Qty", "fieldname": "out_qty", "fieldtype": "Float", "width": 100},
		{"label": "Balance Qty", "fieldname": "balance_qty", "fieldtype": "Float", "width": 120},
		{"label": "Valuation Rate", "fieldname": "valuation_rate", "fieldtype": "Currency", "width": 150},
		{"label": "Balance Value", "fieldname": "balance_value", "fieldtype": "Currency", "width": 150},
	]
