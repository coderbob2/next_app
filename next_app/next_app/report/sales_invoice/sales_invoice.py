import frappe

@frappe.whitelist()
def execute(filters=None):
    columns = get_columns()
    data, total = get_data(filters)
    summary = get_summary(filters)
    return columns, data, total, summary

def get_columns():
    return [
        {"label": "ID", "fieldname": "name", "fieldtype": "Link", "options": "Sales Invoice", "width": 150},
        {"label": "Customer", "fieldname": "customer", "fieldtype": "Link", "options": "Customer", "width": 150},
        {"label": "Posting Date", "fieldname": "posting_date", "fieldtype": "Date", "width": 120},
        {"label": "Posting Time", "fieldname": "posting_time", "fieldtype": "Time", "width": 120},
        {"label": "Grand Total", "fieldname": "grand_total", "fieldtype": "Currency", "width": 120},
        {"label": "Status", "fieldname": "status", "fieldtype": "Data", "width": 100},
        {"label": "Owner", "fieldname": "owner", "fieldtype": "Data", "width": 100},
        {"label": "Creation", "fieldname": "creation", "fieldtype": "Datetime", "width": 150},
        {"label": "Currency", "fieldname": "currency", "fieldtype": "Link", "options": "Currency", "width": 100},
        {"label": "Update Stock", "fieldname": "update_stock", "fieldtype": "Check", "width": 100},
        {"label": "Items", "fieldname": "items", "fieldtype": "Table", "width": 400}
    ]

def get_data(filters):
    conditions = get_conditions(filters)

    limit_start = filters.get("limit_start", 0)
    limit_page_length = filters.get("limit_page_length", 10)
    order_by = filters.get("order_by", "posting_date")
    order = filters.get("order", "desc")

    total = frappe.db.sql(f"""
        SELECT COUNT(name)
        FROM `tabSales Invoice`
        WHERE 1=1 {conditions}
    """)[0][0]

    invoices = frappe.db.sql(f"""
        SELECT
            name, customer, posting_date, posting_time, grand_total, status, owner, creation, currency, update_stock, outstanding_amount
        FROM
            `tabSales Invoice`
        WHERE
            1=1
            {conditions}
        ORDER BY
            {order_by} {order}
        LIMIT
            {limit_start}, {limit_page_length}
    """, as_dict=True)

    for invoice in invoices:
        items = frappe.db.sql(f"""
            SELECT
                item_code, item_name, qty, rate, amount, delivered_qty
            FROM
                `tabSales Invoice Item`
            WHERE
                parent = '{invoice.name}'
        """, as_dict=True)
        invoice["items"] = items

    return invoices, total

def get_summary(filters):
    conditions = get_conditions(filters)
    active_currencies = frappe.get_all("Currency", filters={"enabled": 1}, fields=["name"])
    currency_list = [c["name"] for c in active_currencies]
    
    summary_data = {}
    for currency in currency_list:
        summary_data[currency] = {
            "currency": currency,
            "total_sales": 0,
            "paid_sales": 0,
            "credit_sales": 0,
        }

    sales_data = frappe.db.sql(f"""
        SELECT
            currency,
            IFNULL(SUM(grand_total), 0) as total_sales,
            IFNULL(SUM(CASE WHEN status = 'Paid' THEN grand_total ELSE 0 END), 0) as paid_sales,
            IFNULL(SUM(CASE WHEN status != 'Paid' AND status != 'Cancelled' THEN outstanding_amount ELSE 0 END), 0) as credit_sales
        FROM
            `tabSales Invoice`
        WHERE docstatus = 1 {conditions}
        GROUP BY
            currency
    """, as_dict=True)

    for row in sales_data:
        if row.currency in summary_data:
            summary_data[row.currency] = row

    return list(summary_data.values())

def get_conditions(filters):
    conditions = ""
    if filters:
        if filters.get("customer"):
            conditions += f" AND customer LIKE '%{filters.get('customer')}%'"
        if filters.get("name"):
            conditions += f" AND name LIKE '%{filters.get('name')}%'"
        if filters.get("status"):
            conditions += f" AND status = '{filters.get('status')}'"
        if filters.get("date_range"):
            start_date, end_date = filters.get("date_range")
            conditions += f" AND posting_date BETWEEN '{start_date}' AND '{end_date}'"
        if filters.get("warehouse"):
            conditions += f" AND set_warehouse = '{filters.get('warehouse')}'"
    return conditions
