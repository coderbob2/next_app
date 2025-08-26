import frappe
from frappe.utils import flt

def execute(filters=None):
    if not filters:
        filters = {}

    columns = get_columns()
    data = get_data(filters)
    total = get_total(filters)
    return columns, data, None, None, {"total": total}


def get_columns():
    return [
        {"label": "Posting Date",  "fieldname": "posting_date", "fieldtype": "Date",         "width": 120},
        {"label": "Voucher Type",  "fieldname": "voucher_type", "fieldtype": "Data",         "width": 120},
        {"label": "Voucher No",    "fieldname": "voucher_no",   "fieldtype": "Dynamic Link", "options": "voucher_type", "width": 150},
        {"label": "Against Account(s)", "fieldname": "against", "fieldtype": "Data",         "width": 220},
        {"label": "Debit",         "fieldname": "debit",        "fieldtype": "Currency",     "width": 120},
        {"label": "Credit",        "fieldname": "credit",       "fieldtype": "Currency",     "width": 120},
        {"label": "Balance",       "fieldname": "balance",      "fieldtype": "Currency",     "width": 150},
    ]


def base_party_conditions(filters):
    """
    Conditions that should apply to BOTH opening and in-range queries,
    excluding any date-range constraints.
    """
    cond = "gle.party_type = 'Customer' AND gle.docstatus = 1 AND gle.is_cancelled = 0"
    if filters.get("customer"):
        cond += f" AND gle.party = '{filters['customer']}'"
    # Add company filter here if you want to constrain by company:
    # if filters.get("company"):
    #     cond += f" AND gle.company = '{filters['company']}'"
    return cond


def date_range_conditions(filters):
    """
    Date constraints to be applied ONLY to the in-range (main) query.
    """
    cond = ""
    if filters.get("from_date"):
        cond += f" AND gle.posting_date >= '{filters['from_date']}'"
    if filters.get("to_date"):
        cond += f" AND gle.posting_date <= '{filters['to_date']}'"
    return cond


def get_data(filters):
    # --- Opening Balance (strictly before from_date), WITHOUT reusing date-range conditions ---
    opening_balance = 0
    if filters.get("from_date"):
        open_cond = base_party_conditions(filters)
        opening_balance = frappe.db.sql(f"""
            SELECT COALESCE(SUM(gle.debit), 0) - COALESCE(SUM(gle.credit), 0) AS balance
            FROM `tabGL Entry` gle
            WHERE {open_cond}
              AND gle.posting_date < '{filters['from_date']}'
        """)[0][0] or 0

    # --- Consolidated (by voucher) entries within date range ---
    main_cond = base_party_conditions(filters) + date_range_conditions(filters)

    entries = frappe.db.sql(f"""
        SELECT
            MIN(gle.posting_date) AS posting_date,
            gle.voucher_type,
            gle.voucher_no,
            GROUP_CONCAT(DISTINCT IFNULL(gle.against, '') ORDER BY gle.against SEPARATOR ', ') AS against,
            SUM(gle.debit)  AS debit,
            SUM(gle.credit) AS credit
        FROM `tabGL Entry` gle
        WHERE {main_cond}
        GROUP BY gle.voucher_type, gle.voucher_no
        ORDER BY MIN(gle.posting_date), MIN(gle.creation)
        LIMIT {int(filters.get("page_length", 20))} OFFSET {int(filters.get("start", 0))}
    """, as_dict=True)

    # --- Build rows with running balance ---
    data = []
    balance = flt(opening_balance)

    # Opening row (always show if from_date provided; comment this block if you only want
    # to show opening when it's non-zero)
    if filters.get("from_date") and filters.get("start", 0) == 0:
        data.append({
            "posting_date": filters["from_date"],
            "voucher_type": "Opening Balance",
            "voucher_no": "",
            "against": "",
            "debit": opening_balance if opening_balance > 0 else 0,
            "credit": -opening_balance if opening_balance < 0 else 0,
            "balance": balance
        })

    # Voucher-level rows
    for e in entries:
        balance += flt(e.debit) - flt(e.credit)
        data.append({
            "posting_date": e.posting_date,
            "voucher_type": e.voucher_type,
            "voucher_no": e.voucher_no,
            "against": e.against,
            "debit": flt(e.debit),
            "credit": flt(e.credit),
            "balance": balance
        })

    # If user selects a range with no transactions (e.g., today with no postings),
    # the report will still show the opening row so the balance matches the current
    # balance as of the start of that day / from_date.
    return data

def get_total(filters):
    main_cond = base_party_conditions(filters) + date_range_conditions(filters)
    total_entries = frappe.db.sql(f"""
        SELECT COUNT(DISTINCT voucher_no)
        FROM `tabGL Entry` gle
        WHERE {main_cond}
    """)
    total = total_entries[0][0] if total_entries else 0
    if filters.get("from_date"):
        total += 1
    return total
