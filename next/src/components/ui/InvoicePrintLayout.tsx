import React from 'react';
import type { PurchaseInvoice } from '@/types/Accounts/PurchaseInvoice';

interface InvoicePrintLayoutProps {
  invoice: PurchaseInvoice;
}

const InvoicePrintLayout = React.forwardRef<HTMLDivElement, InvoicePrintLayoutProps>(({ invoice }, ref) => {
  return (
    <div ref={ref}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr><td><div className="header-space">&nbsp;</div></td></tr>
        </thead>
        <tbody>
          <tr><td><div className="content">
            <p><strong>Supplier:</strong> {invoice.supplier}<br />
            <strong>Invoice Ref:</strong> {invoice.name}<br />
            <strong>Posting Date:</strong> {invoice.posting_date}</p>

            <table className="items">
              <thead>
                <tr><th>Item</th><th>Qty</th><th>Rate</th><th>Total</th></tr>
              </thead>
              <tbody>
                {invoice.items.map((item: any, index: number) => (
                  <tr key={index}>
                    <td>{item.item_name}</td>
                    <td>{item.qty}</td>
                    <td>{invoice.currency} {Number(item.rate).toFixed(2)}</td>
                    <td>{invoice.currency} {Number(item.amount).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ textAlign: 'right', marginTop: '20px' }}>
              <p><strong>Total:</strong> {invoice.currency} {Number(invoice.total).toFixed(2)}<br />
              <strong>Paid:</strong> {invoice.currency} {Number(invoice.paid_amount).toFixed(2)}<br />
              <strong>Outstanding:</strong> {invoice.currency} {Number(invoice.outstanding_amount).toFixed(2)}</p>
            </div>
          </div></td></tr>
        </tbody>
        <tfoot>
          <tr><td><div className="footer-space">&nbsp;</div></td></tr>
        </tfoot>
      </table>

      <div className="header">
        <table style={{ width: '100%' }}><tr>
          <td style={{ width: '20%' }}><img src="https://w7.pngwing.com/pngs/502/945/png-transparent-twitter-logo-computer-icons-logo-twitter-icon-computer-network-leaf-media.png" alt="Logo" style={{ width: '80px' }} /></td>
          <td style={{ width: '60%' }}>
            <h2>{invoice.company}</h2>
            <p>{invoice.address_display}</p>
          </td>
          <td style={{ width: '20%', textAlign: 'right' }}>
            Invoice<br />Page <span className="pagenum"></span>
          </td>
        </tr></table>
      </div>

      <div className="footer">
        <div>📞 {invoice.contact_mobile} | 🌐 {invoice.company}</div>
        <div>Thank you for your business!</div>
      </div>
    </div>
  );
});

export default InvoicePrintLayout;
