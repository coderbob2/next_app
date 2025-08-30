import { createContext, useContext } from "react";
import type { ReactNode } from "react";
import { useFrappeGetCall } from "frappe-react-sdk";

interface CompanyContextValue {
    company: string | undefined;
    currency: string | undefined;
    error: any;
    isLoading: boolean;
}

export const CompanyContext = createContext<CompanyContextValue | null>(null);

export function useCompany() {
	const context = useContext(CompanyContext);
	if (!context) {
		throw new Error("useCompany must be used within a CompanyProvider");
	}
	return context;
}

export function CompanyProvider({ children }: { children: ReactNode }) {
	const { data, error, isLoading } = useFrappeGetCall('next_app.next_app.api.get_default_company_info');

	   const company = data?.message?.company_name;
    const currency = data?.message.currency;

	const value: CompanyContextValue = { company, currency, error, isLoading };

	return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}