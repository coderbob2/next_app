import frappe

@frappe.whitelist()
def get_company_name():
    # Get the first active company
    company = frappe.get_all("Company", filters={"is_group": 0}, limit=1)
    if not company:
        return None
    
    company_doc = frappe.get_doc("Company", company[0].name)
    return company_doc.company_name

@frappe.whitelist()
def set_source_exchange_rate(doc, method):
    if doc.payment_type == "Pay" and doc.party_type == "Supplier":
        if not doc.source_exchange_rate:
            latest_exchange_rate = frappe.get_all(
                "Custom Exchange Rate",
                filters={"from_currency": doc.paid_to_account_currency, "to_currency": doc.paid_from_account_currency},
                fields=["ex_rate"],
                order_by="creation desc",
                limit=1
            )
            if latest_exchange_rate:
                doc.source_exchange_rate = latest_exchange_rate[0].ex_rate
@frappe.whitelist()
def on_warehouse_before_insert(doc, method):
    # Find the parent account by account number
    parent_account = frappe.db.get_value(
        "Account",
        {"account_number": "1100", "is_group": 1},
        "name"
    )

    if parent_account:
        doc.account = doc.warehouse_name + " Cash"
        # Set the parent account for the new account
        doc.parent_account = parent_account

        
@frappe.whitelist()
def get_default_company_info():
    """
    Retrieves the default company and currency for the current user,
    falling back to the global default if no user default is set.
    """
    company_name = frappe.defaults.get_user_default("Company")
    if not company_name:
        company_name = frappe.defaults.get_global_default("company")

    if not company_name:
        return None, None

    currency = frappe.db.get_value("Company", company_name, "default_currency")
    return {
        "company_name": company_name,
        "currency": currency,
    }