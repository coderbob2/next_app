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
                    "insert_after": field["insert_after"]
                })
                custom_field.insert()
                frappe.msgprint(f"Custom Field {field['fieldname']} created in {doctype}")
            # else:
            #     frappe.msgprint(f"Custom Field {field['fieldname']} already exists in {doctype}")
    frappe.db.set_global("next_app_custom_fields_setup_complete", True)
    frappe.msgprint("Next App custom fields setup complete.")