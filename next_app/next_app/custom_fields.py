import frappe

def setup_custom_fields_on_load():
    if frappe.db.get_global("next_app_custom_fields_setup_complete"):
        return
    doctype_fields = {
        "Customer": [
            {"fieldname": "custom_phone", "label": "Phone", "fieldtype": "Data", "insert_after": "phone_no"},
            {"fieldname": "custom_email", "label": "Email", "fieldtype": "Data", "insert_after": "email_id"}
        ],
        "Supplier": [
            {"fieldname": "custom_phone", "label": "Phone", "fieldtype": "Data", "insert_after": "phone_no"},
            {"fieldname": "custom_email", "label": "Email", "fieldtype": "Data", "insert_after": "email_id"}
        ],
        "Warehouse": [
            {"fieldname": "custom_shop_no", "label": "Shop No", "fieldtype": "Data", "insert_after": "disabled"},
            {"fieldname": "custom_phone_1", "label": "Phone 1", "fieldtype": "Data", "insert_after": "custom_shop_no"},
            {"fieldname": "custom_phone_2", "label": "Phone 2", "fieldtype": "Data", "insert_after": "custom_phone_1"},
            {"fieldname": "custom_email", "label": "Email", "fieldtype": "Data", "insert_after": "custom_phone_2"},
            {"fieldname": "custom_cash_account", "label": "Cash Account", "fieldtype": "Link", "options": "Account", "insert_after": "custom_phone_2"}
        ]
    }

    for doctype, fields in doctype_fields.items():
        for field in fields:
            if not frappe.db.exists("Custom Field", {"dt": doctype, "fieldname": field["fieldname"]}):
                custom_field = frappe.get_doc({
                    "doctype": "Custom Field",
                    "dt": doctype,
                    "fieldname": field["fieldname"],
                    "label": field["label"],
                    "fieldtype": field["fieldtype"],
                    "insert_after": field["insert_after"],
                    "options": field.get("options")
                })
                custom_field.insert()
                print(f"Custom Field {field['fieldname']} created in {doctype}")
                frappe.msgprint(f"Custom Field {field['fieldname']} created in {doctype}")
            # else:
            #     frappe.msgprint(f"Custom Field {field['fieldname']} already exists in {doctype}")
    all_fields_exist = True
    for doctype, fields in doctype_fields.items():
        for field in fields:
            if not frappe.db.exists("Custom Field", {"dt": doctype, "fieldname": field["fieldname"]}):
                all_fields_exist = False
                break
        if not all_fields_exist:
            break

    if all_fields_exist:
        frappe.db.set_global("next_app_custom_fields_setup_complete", True)
        frappe.msgprint("Next App custom fields setup complete.")