import frappe
from frappe.model.document import Document
from frappe.utils import nowdate

class CustomExchangeRate(Document):
    pass

@frappe.whitelist()
def get_exchange_rate(date):
    exchange_rate = frappe.db.get_value(
        "Custom Exchange Rate",
        {"date": date},
        ["from_currency", "to_currency", "ex_rate"],
        as_dict=True,
        order_by="date DESC",
    )
    return exchange_rate

@frappe.whitelist()
def get_current_date_exchange_rate(to_currency):
    current_date = nowdate()
    exchange_rate = frappe.db.get_value(
        "Custom Exchange Rate",
        {"date": current_date, "to_currency": to_currency},
        ["from_currency", "to_currency", "ex_rate"],
        as_dict=True,
        order_by="creation DESC",
    )
    return exchange_rate