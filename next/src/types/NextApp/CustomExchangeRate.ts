
export interface CustomExchangeRate{
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
	/**	Date : Date	*/
	date: string
	/**	From Currency : Link - Currency	*/
	from_currency: string
	/**	To Currency : Link - Currency	*/
	to_currency: string
	/**	Exchange Rate : Float	*/
	ex_rate: number
}