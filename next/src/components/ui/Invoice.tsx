import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#E4E4E4'
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1
  }
});

interface InvoiceItem {
    name: string;
    quantity: number;
    price: number;
    total: number;
  }
  
  interface InvoiceData {
    reference: string;
    supplier: string;
    postingDate: string;
    postingTime: string;
    currency: string;
    items: InvoiceItem[];
    totalAmount: number;
    paidAmount: number;
    outstandingAmount: number;
  }

// Create Document Component
const Invoice: React.FC<{ data: InvoiceData }> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text>Purchase Invoice: {data.reference}</Text>
        <Text>Supplier: {data.supplier}</Text>
        <Text>Posting Date: {data.postingDate}</Text>
        <Text>Posting Time: {data.postingTime}</Text>
        <Text>Currency: {data.currency}</Text>
        <Text>Total: {data.totalAmount}</Text>
        <Text>Paid Amount: {data.paidAmount}</Text>
        <Text>Outstanding Amount: {data.outstandingAmount}</Text>
      </View>
    </Page>
  </Document>
);

export default Invoice;
