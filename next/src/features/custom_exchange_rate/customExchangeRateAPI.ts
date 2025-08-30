import { useFrappeGetCall } from "frappe-react-sdk";


export const useCurrentDateExchangeRate = (to_currency: string) => {
    return useFrappeGetCall(
        "next_app.next_app.doctype.custom_exchange_rate.custom_exchange_rate.get_current_date_exchange_rate",
        {
            to_currency: to_currency
        }
    );
}