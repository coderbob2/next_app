import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCustomerBalance, useSupplierBalance, useStockBalance } from "../features/dashboard/dashboardAPI";
import { DataTable } from "@/components/ui/data-table";
import Spinner from "@/components/ui/spinner";

const Dashboard = () => {
    const { data: customerBalance, isLoading: customerBalanceLoading } = useCustomerBalance();
    const { data: supplierBalance, isLoading: supplierBalanceLoading } = useSupplierBalance();
    const { data: stockBalance, isLoading: stockBalanceLoading } = useStockBalance();

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Customer Balance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {customerBalanceLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <Spinner />
                        </div>
                    ) : (
                        <DataTable
                            columns={[
                                {
                                    accessorKey: "customer_name",
                                    header: "Customer",
                                },
                                {
                                    accessorKey: "balance",
                                    header: "Balance",
                                },
                            ]}
                            data={customerBalance ?? []}
                        />
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Supplier Balance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {supplierBalanceLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <Spinner />
                        </div>
                    ) : (
                        <DataTable
                            columns={[
                                {
                                    accessorKey: "supplier_name",
                                    header: "Supplier",
                                },
                                {
                                    accessorKey: "balance",
                                    header: "Balance",
                                },
                            ]}
                            data={supplierBalance ?? []}
                        />
                    )}
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Stock Balance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {stockBalanceLoading ? (
                        <div className="flex justify-center items-center h-48">
                            <Spinner />
                        </div>
                    ) : (
                        <DataTable
                            columns={[
                                {
                                    accessorKey: "item_name",
                                    header: "Item",
                                },
                                {
                                    accessorKey: "balance_qty",
                                    header: "Balance Qty",
                                },
                            ]}
                            data={stockBalance ?? []}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
export default Dashboard;