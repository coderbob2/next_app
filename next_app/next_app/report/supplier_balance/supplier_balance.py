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
       
    return columns, data, None, None, summary


def get_data(filters):
    # --- GL Entries (suppliers) ---
    gle_conditions = ["gle.docstatus = 1", "gle.party_type = 'Supplier'"]
    if filters.get("supplier") and filters.get("supplier") != "All Suppliers":
        gle_conditions.append("gle.party = %(supplier)s")
    if filters.get("company"):
        gle_conditions.append("gle.company = %(company)s")
    gle_where = " AND ".join(gle_conditions)

    gl_query = f"""
        SELECT
            gle.party AS supplier,
            SUM(gle.credit - gle.debit) AS outstanding_amount
        FROM `tabGL Entry` gle
        WHERE {gle_where}
        GROUP BY gle.party
    """
    outstanding_map = {r.supplier: r.outstanding_amount for r in frappe.db.sql(gl_query, filters, as_dict=True)}

    # --- Purchase Invoices (net of returns) ---
    pi_conditions = ["pi.docstatus = 1"]
    if filters.get("supplier") and filters.get("supplier") != "All Suppliers":
        pi_conditions.append("pi.supplier = %(supplier)s")
    if filters.get("company"):
        pi_conditions.append("pi.company = %(company)s")
    pi_where = " AND ".join(pi_conditions)

    pi_query = f"""
        SELECT
            pi.supplier,
            s.supplier_name,
            SUM(
                CASE WHEN pi.is_return = 1
                     THEN -pi.base_grand_total
                     ELSE pi.base_grand_total END
            ) AS total_invoiced
        FROM `tabPurchase Invoice` pi
        JOIN `tabSupplier` s ON s.name = pi.supplier
        WHERE {pi_where}
        GROUP BY pi.supplier, s.supplier_name
    """

    invoice_rows = frappe.db.sql(pi_query, filters, as_dict=True)

    # Combine + filter only suppliers with activity
    data = []
    for row in invoice_rows:
        outstanding = outstanding_map.get(row.supplier, 0)
        total = row.total_invoiced or 0
        paid = total - outstanding

        # Show only suppliers that have at least invoiced or paid amounts
        if abs(total) > 0 or abs(paid) > 0:
            data.append({
                "supplier": row.supplier,
                "supplier_name": row.supplier_name,
                "total_amount": total,
                "paid_amount": paid,
                "outstanding_amount": outstanding
            })
            
    return data


def get_columns():
    return [
        {"label": "Supplier", "fieldname": "supplier", "fieldtype": "Link", "options": "Supplier", "width": 200},
        {"label": "Supplier Name", "fieldname": "supplier_name", "fieldtype": "Data", "width": 200},
        {"label": "Total Invoiced", "fieldname": "total_amount", "fieldtype": "Currency", "width": 150},
        {"label": "Paid Amount", "fieldname": "paid_amount", "fieldtype": "Currency", "width": 150},
        {"label": "Outstanding Amount", "fieldname": "outstanding_amount", "fieldtype": "Currency", "width": 150},
    ]
