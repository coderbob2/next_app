import { useParams, useNavigate } from "react-router-dom";
import { useFrappeGetDoc, useFrappePostCall } from "frappe-react-sdk";
import { format } from "date-fns";
import type { PaymentEntry } from "@/types/Accounts/PaymentEntry";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { X, ArrowLeft } from "lucide-react";

export default function PaymentEntryDetailsPage() {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();
  const { data: paymentEntry, isLoading, error, mutate } = useFrappeGetDoc<PaymentEntry>("Payment Entry", name);
  const { call, loading: isCancelling } = useFrappePostCall('frappe.client.cancel');

  const handleCancel = () => {
    call({
      doctype: "Payment Entry",
      name: name!,
    }).then(() => {
      mutate();
      navigate("/payment-entry");
    });
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

  if (!paymentEntry) {
    return <div>Payment Entry not found.</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" onClick={() => navigate(-1)}><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
        <div className="flex space-x-2">
          {paymentEntry.docstatus !== 2 && (
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
          )}
        </div>
      </div>
      <Card className="relative">
        {paymentEntry.docstatus === 2 && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
            <div className="text-9xl font-bold text-red-500 opacity-20 transform -rotate-45 select-none">
              Cancelled
            </div>
          </div>
        )}
        <CardHeader>
          <CardTitle>Payment Entry : {paymentEntry.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p><strong>Party Type:</strong> {paymentEntry.party_type}</p>
              <p><strong>Party:</strong> {paymentEntry.party}</p>
              <p><strong>Posting Date:</strong> {paymentEntry.posting_date ? format(new Date(paymentEntry.posting_date), "MMM d, yyyy") : ""}</p>
              <p><strong>Creation:</strong> {paymentEntry.creation ? format(new Date(paymentEntry.creation), "MMM d, yyyy HH:mm:ss") : ""}</p>
              <p><strong>Mode of Payment:</strong> {paymentEntry.mode_of_payment}</p>
              <p><strong>Paid Amount:</strong> {paymentEntry.paid_amount}</p>
              <p><strong>Status:</strong> {paymentEntry.docstatus === 0 ? "Draft" : paymentEntry.docstatus === 1 ? "Submitted" : "Cancelled"}</p>
              <p><strong>Registered By:</strong> {paymentEntry.owner}</p>
              <p><strong>Remarks:</strong> {paymentEntry.remarks}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
