
export interface StockEntry{
	name: string
	creation: string
	modified: string
	owner: string
	modified_by: string
	docstatus: 0 | 1 | 2
	parent?: string
	parentfield?: string
	parenttype?: string
	idx?: number
	/**	Series : Select	*/
	naming_series: "MAT-STE-.YYYY.-"
	/**	Stock Entry Type : Link - Stock Entry Type	*/
	stock_entry_type: string
	/**	Stock Entry (Outward GIT) : Link - Stock Entry	*/
	outgoing_stock_entry?: string
	/**	Purpose : Select	*/
	purpose?: "Material Issue" | "Material Receipt" | "Material Transfer" | "Material Transfer for Manufacture" | "Material Consumption for Manufacture" | "Manufacture" | "Repack" | "Send to Subcontractor" | "Disassemble"
	/**	Add to Transit : Check	*/
	add_to_transit?: 0 | 1
	/**	Work Order : Link - Work Order	*/
	work_order?: string
	/**	Purchase Order : Link - Purchase Order	*/
	purchase_order?: string
	/**	Subcontracting Order : Link - Subcontracting Order	*/
	subcontracting_order?: string
	/**	Delivery Note No : Link - Delivery Note	*/
	delivery_note_no?: string
	/**	Sales Invoice No : Link - Sales Invoice	*/
	sales_invoice_no?: string
	/**	Pick List : Link - Pick List	*/
	pick_list?: string
	/**	Purchase Receipt No : Link - Purchase Receipt	*/
	purchase_receipt_no?: string
	/**	Asset Repair : Link - Asset Repair	*/
	asset_repair?: string
	/**	Company : Link - Company	*/
	company: string
	/**	Posting Date : Date	*/
	posting_date?: string
	/**	Posting Time : Time	*/
	posting_time?: string
	/**	Edit Posting Date and Time : Check	*/
	set_posting_time?: 0 | 1
	/**	Inspection Required : Check	*/
	inspection_required?: 0 | 1
	/**	Apply Putaway Rule : Check	*/
	apply_putaway_rule?: 0 | 1
	/**	From BOM : Check	*/
	from_bom?: 0 | 1
	/**	Use Multi-Level BOM : Check - Including items for sub assemblies	*/
	use_multi_level_bom?: 0 | 1
	/**	BOM No : Link - BOM	*/
	bom_no?: string
	/**	Finished Good Quantity  : Float - As per Stock UOM	*/
	fg_completed_qty?: number
	/**	% Process Loss : Percent	*/
	process_loss_percentage?: number
	/**	Process Loss Qty : Float	*/
	process_loss_qty?: number
	/**	Default Source Warehouse : Link - Warehouse - Sets 'Source Warehouse' in each row of the items table.	*/
	from_warehouse?: string
	/**	Source Warehouse Address Link : Link - Address	*/
	source_warehouse_address?: string
	/**	Source Warehouse Address : Small Text	*/
	source_address_display?: string
	/**	Default Target Warehouse : Link - Warehouse - Sets 'Target Warehouse' in each row of the items table.	*/
	to_warehouse?: string
	/**	Target Warehouse Address Link : Link - Address	*/
	target_warehouse_address?: string
	/**	Target Warehouse Address : Small Text	*/
	target_address_display?: string
	/**	Scan Barcode : Data	*/
	scan_barcode?: string
	/**	Items : Table - Stock Entry Detail	*/
	items: any
	/**	Total Outgoing Value (Consumption) : Currency	*/
	total_outgoing_value?: number
	/**	Total Incoming Value (Receipt) : Currency	*/
	total_incoming_value?: number
	/**	Total Value Difference (Incoming - Outgoing) : Currency	*/
	value_difference?: number
	/**	Additional Costs : Table - Landed Cost Taxes and Charges	*/
	additional_costs?: any
	/**	Total Additional Costs : Currency	*/
	total_additional_costs?: number
	/**	Supplier : Link - Supplier	*/
	supplier?: string
	/**	Supplier Name : Data	*/
	supplier_name?: string
	/**	Supplier Address : Link - Address	*/
	supplier_address?: string
	/**	Address : Small Text	*/
	address_display?: string
	/**	Project : Link - Project	*/
	project?: string
	/**	Print Heading : Link - Print Heading	*/
	select_print_heading?: string
	/**	Letter Head : Link - Letter Head	*/
	letter_head?: string
	/**	Is Opening : Select	*/
	is_opening?: "No" | "Yes"
	/**	Remarks : Text	*/
	remarks?: string
	/**	Per Transferred : Percent	*/
	per_transferred?: number
	/**	Total Amount : Currency	*/
	total_amount?: number
	/**	Job Card : Link - Job Card	*/
	job_card?: string
	/**	Amended From : Link - Stock Entry	*/
	amended_from?: string
	/**	Credit Note : Link - Journal Entry	*/
	credit_note?: string
	/**	Is Return : Check	*/
	is_return?: 0 | 1
}