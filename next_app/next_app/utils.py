import frappe

@frappe.whitelist()
def get_company_name():
    # Get the first active company
    company = frappe.get_all("Company", filters={"is_group": 0}, limit=1)
    if not company:
        return None
    
    company_doc = frappe.get_doc("Company", company[0].name)
    return company_doc.company_name