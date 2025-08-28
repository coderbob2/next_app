import { useParams, useNavigate } from "react-router-dom";
import { useFrappeGetDoc, useFrappePostCall } from "frappe-react-sdk";
import { format } from "date-fns";
import type { SalesInvoice } from "@/types/Accounts/SalesInvoice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Printer, CreditCard, X, ArrowLeft } from "lucide-react";
import PrintPreviewDialog from "@/components/ui/PrintPreviewDialog";
import '@/print.css';
import Spinner from "@/components/ui/spinner";

export default function SalesInvoiceDetailsPage() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { data: invoice, isLoading, error, mutate } = useFrappeGetDoc<SalesInvoice>("Sales Invoice", name);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const { call, loading: isCancelling } = useFrappePostCall('frappe.client.cancel');

  const handleCancel = () => {
    call({
      doctype: "Sales Invoice",
      name: name!,
    }).then(() => {
      mutate();
      navigate("/sales");
    });
  };

  const handlePreview = () => {
    setIsPreviewing(true);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">
      <Spinner />
    </div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  if (!invoice) {
    return <div>Sales Invoice not found.</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      {invoice && (
        <PrintPreviewDialog
          isOpen={isPreviewing}
          onClose={() => setIsPreviewing(false)}
          invoiceData={{
            reference: invoice.name,
            customer: invoice.customer ?? '',
            postingDate: format(new Date(invoice.posting_date), "MMM d, yyyy"),
            postingTime: invoice.posting_time ? format(new Date(`1970-01-01 ${invoice.posting_time}`), "h:mm a") : "",
            currency: invoice.currency ?? '',
            items: invoice.items.map((item: any) => ({
              name: item.item_name,
              quantity: item.qty,
              price: item.rate,
              total: item.amount,
            })),
            totalAmount: invoice.total ?? 0,
            paidAmount: invoice.paid_amount ?? 0,
            outstandingAmount: invoice.outstanding_amount ?? 0,
          }}
        />
      )}
      <div className="flex justify-between items-center mb-4">
       
        <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
        <div className="flex space-x-2">
          {invoice.docstatus !== 2 && (
            <>
              <Button variant="outline" onClick={handlePreview}><Printer className="mr-2 h-4 w-4" />Print</Button>
              {!invoice.is_pos && <Button variant="outline"><CreditCard className="mr-2 h-4 w-4" />Create Payment</Button>}
              <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"><X className="mr-2 h-4 w-4" />Cancel</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently cancel the document.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Close</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCancel} disabled={isCancelling}>
                    {isCancelling ? "Cancelling..." : "Confirm"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>
      <Card className="relative">
        {invoice.docstatus === 2 && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="text-9xl font-bold text-red-500 opacity-20 transform -rotate-45 select-none">
              Cancelled
            </div>
          </div>
        )}
        <CardHeader>
          <CardTitle>Sales Invoice : {invoice.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p><strong>Customer:</strong> {invoice.customer}</p>
              <p><strong>Posting Date:</strong> {format(new Date(invoice.posting_date), "MMM d, yyyy")}</p>
              <p><strong>Posting Time:</strong> {invoice.posting_time ? format(new Date(`1970-01-01 ${invoice.posting_time}`), "h:mm a") : ""}</p>
              <p><strong>Currency:</strong> {invoice.currency}</p>
            </div>
            <div className="flex justify-end">
              <div className="space-y-2">
                <p className="flex items-center justify-between"><strong>Status:</strong> <Badge variant="outline" className={`w-24 text-center justify-center ${invoice.status === 'Paid' ? "border-green-500 text-green-500" : "border-red-500 text-red-500"}`}>{invoice.status}</Badge></p>
                <p className="flex items-center justify-between">
                  <strong>Stock Status:</strong> 
                  <Badge variant="outline" className={`w-24 text-center justify-center 
                    ${invoice.update_stock === 1 
                    || invoice.items?.every((item:any) => 
                    item.delivered_qty === item.qty) ?
                     "border-green-500 text-green-500" : 
                     (invoice.items?.some((item: any) => item.delivered_qty > 0) ? 
                     "border-yellow-500 text-yellow-500" : "border-red-500 text-red-500")}`}>
                      {invoice.update_stock === 1 || invoice.items?.every((item:any) => 
                        item.delivered_qty === item.qty) ? 
                        "Taken" : (invoice.items?.some((item:any) => item.delivered_qty > 0) ? 
                        "Partially Taken" : "Not Taken")}</Badge>
                        </p>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-bold mt-6 mb-2">Invoice Items</h3>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-200">
                  <TableHead>Item Code</TableHead>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item: any, index: number) => (
                  <TableRow key={item.name} className={`h-10 ${index % 2 === 0 ? 'bg-gray-50' : ''}`}>
                    <TableCell>{item.item_code}</TableCell>
                    <TableCell>{item.item_name}</TableCell>
                    <TableCell>{item.qty}</TableCell>
                    <TableCell>{Number(item.rate).toFixed(2)}</TableCell>
                    <TableCell>{Number(item.amount).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end mt-4">
            <div className="w-full md:w-1/3">
              <div className="flex justify-between">
                <strong>Total:</strong>
                <span>{invoice.currency} {Number(invoice.total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <strong>Paid Amount:</strong>
                <span>{invoice.currency} {Number(invoice.paid_amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <strong>Outstanding Amount:</strong>
                <span>{invoice.currency} {Number(invoice.outstanding_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
