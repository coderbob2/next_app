import frappe
from .utils import get_default_company_info as get_company_info_from_utils

@frappe.whitelist()
def get_default_company_info():
    return get_company_info_from_utils()