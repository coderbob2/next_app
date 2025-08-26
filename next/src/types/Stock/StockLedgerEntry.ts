
export interface StockLedgerEntry{
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
	/**	Item Code : Link - Item	*/
	item_code?: string
	/**	Warehouse : Link - Warehouse	*/
	warehouse?: string
	/**	Posting Date : Date	*/
	posting_date?: string
	/**	Posting Time : Time	*/
	posting_time?: string
	/**	Posting Datetime : Datetime	*/
	posting_datetime?: string
	/**	Is Adjustment Entry : Check	*/
	is_adjustment_entry?: 0 | 1
	/**	Auto Created Serial and Batch Bundle : Check	*/
	auto_created_serial_and_batch_bundle?: 0 | 1
	/**	Voucher Type : Link - DocType	*/
	voucher_type?: string
	/**	Voucher No : Dynamic Link	*/
	voucher_no?: string
	/**	Voucher Detail No : Data	*/
	voucher_detail_no?: string
	/**	Serial and Batch Bundle : Link - Serial and Batch Bundle	*/
	serial_and_batch_bundle?: string
	/**	Dependant SLE Voucher Detail No : Data	*/
	dependant_sle_voucher_detail_no?: string
	/**	Recalculate Incoming/Outgoing Rate : Check	*/
	recalculate_rate?: 0 | 1
	/**	Qty Change : Float	*/
	actual_qty?: number
	/**	Qty After Transaction : Float	*/
	qty_after_transaction?: number
	/**	Incoming Rate : Currency	*/
	incoming_rate?: number
	/**	Outgoing Rate : Currency	*/
	outgoing_rate?: number
	/**	Valuation Rate : Currency	*/
	valuation_rate?: number
	/**	Balance Stock Value : Currency	*/
	stock_value?: number
	/**	Change in Stock Value : Currency	*/
	stock_value_difference?: number
	/**	FIFO Stock Queue (qty, rate) : Long Text	*/
	stock_queue?: string
	/**	Company : Link - Company	*/
	company?: string
	/**	Stock UOM : Link - UOM	*/
	stock_uom?: string
	/**	Project : Link - Project	*/
	project?: string
	/**	Fiscal Year : Data	*/
	fiscal_year?: string
	/**	Has Batch No : Check	*/
	has_batch_no?: 0 | 1
	/**	Has Serial No : Check	*/
	has_serial_no?: 0 | 1
	/**	Is Cancelled : Check	*/
	is_cancelled?: 0 | 1
	/**	To Rename : Check	*/
	to_rename?: 0 | 1
	/**	Serial No : Long Text	*/
	serial_no?: string
	/**	Batch No : Data	*/
	batch_no?: string
}