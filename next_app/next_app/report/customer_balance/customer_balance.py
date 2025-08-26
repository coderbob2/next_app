import frappe

def execute(filters=None):
    if not filters:
        filters = {}

    columns = get_columns()
    data = get_data(filters)
    
    total_outstanding = sum(row.get("outstanding_amount", 0) for row in data)
    company_currency = frappe.get_cached_value('Company', filters.get('company'), 'default_currency') if filters.get('company') else frappe.get_cached_value('Company', frappe.defaults.get_user_default("company"), 'default_currency')
    summary = [{"label": "Total Outstanding", "value": total_outstanding, "indicator": "Red", "currency": company_currency}]
    
    if filters.get("hide_zero_balances"):
       data = [row for row in data if row.get("outstanding_amount") != 0]
       
    return columns, data, None, None, summary, None


def get_data(filters):
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
    si_conditions = ["si.docstatus = 1"]
    if filters.get("customer") and filters.get("customer") != "All Customers":
        si_conditions.append("si.customer = %(customer)s")
    if filters.get("company"):
        si_conditions.append("si.company = %(company)s")
    si_where = " AND ".join(si_conditions)

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
        WHERE {si_where}
        GROUP BY si.customer, c.customer_name
    """
    invoice_rows = frappe.db.sql(si_query, filters, as_dict=True)

    # Combine + filter only customers with activity
    data = []
    for row in invoice_rows:
        outstanding = outstanding_map.get(row.customer, 0)
        total = row.total_invoiced or 0
        paid = total - outstanding

        # Show only customers with invoiced or paid amounts
        if abs(total) > 0 or abs(paid) > 0:
            data.append({
                "customer": row.customer,
                "customer_name": row.customer_name,
                "total_amount": total,
                "paid_amount": paid,
                "outstanding_amount": outstanding
            })
            
    return data


def get_columns():
    return [
        {"label": "Customer", "fieldname": "customer", "fieldtype": "Link", "options": "Customer", "width": 200},
        {"label": "Customer Name", "fieldname": "customer_name", "fieldtype": "Data", "width": 200},
        {"label": "Total Invoiced", "fieldname": "total_amount", "fieldtype": "Currency", "width": 150},
        {"label": "Paid Amount", "fieldname": "paid_amount", "fieldtype": "Currency", "width": 150},
        {"label": "Outstanding Amount", "fieldname": "outstanding_amount", "fieldtype": "Currency", "width": 150},
    ]
