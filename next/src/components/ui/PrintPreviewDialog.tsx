import React, { useRef } from 'react';
import Modal from 'react-modal';
import html2pdf from 'html2pdf.js';
import './styles.css'; // Import CSS for print media queries

// Define TypeScript interfaces (same as previous context)
interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface InvoiceData {
  reference: string;
  supplier?: string;
  customer?: string;
  postingDate: string;
  postingTime: string;
  currency: string;
  items: InvoiceItem[];
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
}

// InvoicePreview component for HTML rendering
const InvoicePreview: React.FC<{ data: InvoiceData, innerRef: React.Ref<HTMLDivElement> }> = ({ data, innerRef }) => (
  <div ref={innerRef} className="p-6 font-sans bg-white shadow-lg rounded-lg a4-size">
    <header className="flex items-center mb-6">
      <img src="https://via.placeholder.com/50" alt="Logo" className="w-12 h-12" />
      <div className="ml-4">
        <h1 className="text-xl font-bold">Company Name</h1>
        <p>123 Company Street</p>
        <p>City, State, ZIP</p>
      </div>
    </header>
    <main>
      <div className="flex justify-between mb-6">
        <div>
          <p><strong>Invoice Reference:</strong> {data.reference}</p>
          {data.customer ? (
            <p><strong>Customer:</strong> {data.customer}</p>
          ) : (
            <p><strong>Supplier:</strong> {data.supplier}</p>
          )}
        </div>
        <div>
          <p><strong>Posting Date:</strong> {data.postingDate}</p>
          <p><strong>Posting Time:</strong> {data.postingTime}</p>
          <p><strong>Currency:</strong> {data.currency}</p>
        </div>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border border-gray-300 text-center">Item Name</th>
            <th className="p-2 border border-gray-300 text-center">Quantity</th>
            <th className="p-2 border border-gray-300 text-center">Price</th>
            <th className="p-2 border border-gray-300 text-center">Total</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
              <td className="p-2 border border-gray-300">{item.name}</td>
              <td className="p-2 border border-gray-300 text-center">{item.quantity}</td>
              <td className="p-2 border border-gray-300 text-right">{item.price.toFixed(2)}</td>
              <td className="p-2 border border-gray-300 text-right">{item.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-6 text-right">
        <p><strong>Total Amount:</strong> {data.currency} {data.totalAmount.toFixed(2)}</p>
        <p><strong>Paid Amount:</strong> {data.currency} {data.paidAmount.toFixed(2)}</p>
        <p><strong>Outstanding Amount:</strong> {data.currency} {data.outstandingAmount.toFixed(2)}</p>
      </div>
    </main>
    <footer className="mt-6 text-center">
      <p>Phone: 123-456-7890 | Email: company@example.com</p>
    </footer>
  </div>
);

// PrintPreviewDialog component
interface PrintPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceData: InvoiceData;
}

const PrintPreviewDialog: React.FC<PrintPreviewDialogProps> = ({ isOpen, onClose, invoiceData }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const element = printRef.current;
    if (element) {
      html2pdf().from(element).set({
        margin: [10, 10, 10, 10],
        filename: 'invoice.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).toPdf().get('pdf').then(function (pdf: any) {
        window.open(pdf.output('bloburl'), '_blank');
      });
    }
  };

  const handleDownload = () => {
    const element = printRef.current;
    if (element) {
      html2pdf().from(element).set({
        margin: [10, 10, 10, 10],
        filename: 'invoice.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      }).save();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{
        content: {
          top: '50%',
          left: '50%',
          right: 'auto',
          bottom: 'auto',
          marginRight: '-50%',
          transform: 'translate(-50%, -50%)',
          width: '80%',
          maxWidth: '800px',
          maxHeight: '90vh',
          overflow: 'auto',
          padding: '20px',
          borderRadius: '8px',
        },
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        },
      }}
    >
      <div className="print-preview">
        <InvoicePreview data={invoiceData} innerRef={printRef} />
        <div className="no-print flex justify-between mt-6">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Print
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Download PDF
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default PrintPreviewDialog;
