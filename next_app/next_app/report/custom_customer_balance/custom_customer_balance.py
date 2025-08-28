import frappe

@frappe.whitelist()
def execute(filters=None):
    if not filters:
        filters = {}

    columns = get_columns()
    data, total, summary = get_data(filters)
    
    return columns, data, None, None, summary, total

def get_data(filters):
    conditions, values = get_conditions(filters)

    limit_start = filters.get("start", 0)
    limit_page_length = filters.get("page_length", 10)
    order_by = filters.get("order_by", "customer")
    order = filters.get("order", "asc")

    # --- GL Entries (customers) ---
    gle_conditions = ["gle.docstatus = 1", "gle.party_type = 'Customer'"]
    if filters.get("customer") and filters.get("customer") != "All Customers":
        gle_conditions.append("gle.party = %(customer)s")
    if filters.get("company"):
        gle_conditions.append("gle.company = %(company)s")
    gle_where = " AND ".join(gle_conditions)

    gl_query = f"""
        SELECT
            gle.party AS customer,
            SUM(gle.debit - gle.credit) AS outstanding_amount
        FROM `tabGL Entry` gle
        WHERE {gle_where}
        GROUP BY gle.party
    """
    outstanding_map = {r.customer: r.outstanding_amount for r in frappe.db.sql(gl_query, filters, as_dict=True)}

    # --- Sales Invoices (net of returns) ---
    si_conditions, si_values = get_conditions(filters)

    total_query = f"""
        SELECT COUNT(DISTINCT si.customer)
        FROM `tabSales Invoice` si
        JOIN `tabCustomer` c ON c.name = si.customer
        WHERE {si_conditions}
    """
    total = frappe.db.sql(total_query, values=si_values)[0][0]

    si_query = f"""
        SELECT
            si.customer,
            c.customer_name,
            SUM(
                CASE WHEN si.is_return = 1
                     THEN -si.base_grand_total
                     ELSE si.base_grand_total END
            ) AS total_invoiced
        FROM `tabSales Invoice` si
        JOIN `tabCustomer` c ON c.name = si.customer
        WHERE {si_conditions}
        GROUP BY si.customer, c.customer_name
        ORDER BY {order_by} {order}
        LIMIT {limit_start}, {limit_page_length}
    """
    invoice_rows = frappe.db.sql(si_query, values=si_values, as_dict=True)

    # Combine + filter
    data = []
    for row in invoice_rows:
        outstanding = outstanding_map.get(row.customer, 0)
        total_invoiced = row.total_invoiced or 0
        paid = total_invoiced - outstanding

        data.append({
            "customer": row.customer,
            "customer_name": row.customer_name,
            "total_amount": total_invoiced,
            "paid_amount": paid,
            "outstanding_amount": outstanding
        })
    
    if filters.get("hide_zero_balances"):
        data = [row for row in data if row.get("outstanding_amount") != 0]

    total_outstanding = sum(row.get("outstanding_amount", 0) for row in data)
    company_currency = frappe.get_cached_value('Company', filters.get('company'), 'default_currency') if filters.get('company') else frappe.get_cached_value('Company', frappe.defaults.get_user_default("company"), 'default_currency')
    summary = [{"label": "Total Outstanding", "value": total_outstanding, "indicator": "Red", "currency": company_currency}]
    
    return data, total, summary

def get_conditions(filters):
    conditions = "si.docstatus = 1"
    values = {}

    if filters.get("customer") and filters.get("customer") != "All Customers":
        conditions += " AND si.customer = %(customer)s"
        values["customer"] = filters["customer"]
    if filters.get("company"):
        conditions += " AND si.company = %(company)s"
        values["company"] = filters["company"]

    return conditions, values

def get_columns():
    return [
        {"label": "Customer", "fieldname": "customer", "fieldtype": "Link", "options": "Customer", "width": 200},
        {"label": "Customer Name", "fieldname": "customer_name", "fieldtype": "Data", "width": 200},
        {"label": "Total Invoiced", "fieldname": "total_amount", "fieldtype": "Currency", "width": 150},
        {"label": "Paid Amount", "fieldname": "paid_amount", "fieldtype": "Currency", "width": 150},
        {"label": "Outstanding Amount", "fieldname": "outstanding_amount", "fieldtype": "Currency", "width": 150},
    ]