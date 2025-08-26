import { FaTachometerAlt, FaCashRegister, FaTruckLoading, FaHandHoldingUsd, FaBox, FaFileInvoice, FaUsers, FaUserTag, FaCog, FaChartBar, FaExchangeAlt, FaDoorClosed, FaMoneyBillWave, FaBook } from 'react-icons/fa';

export const menuItems = [
    { to: '/', text: 'Dashboard', icon: <FaTachometerAlt /> },
    { to: '/pos', text: 'Point Of Sales', icon: <FaCashRegister /> },
    {
        to: '/buying',
        text: 'Buying',
        icon: <FaTruckLoading />,
        subMenus: [
            { to: '/purchases', text: 'Purchases' },
            { to: '/suppliers', text: 'Suppliers' },
            { to: '/vendor-balance', text: 'Supplier Balance' },
        ]
    },
    {
        to: '/selling',
        text: 'Selling',
        icon: <FaHandHoldingUsd />,
        subMenus: [
            { to: '/sales', text: 'Sales Invoices' },
            { to: '/customers', text: 'Customers' },
            { to: '/customer-balances', text: 'Customer Balances' },
        ]
    },
    {
        to: '/stock',
        text: 'Stock',
        icon: <FaBox />,
        subMenus: [
            { to: '/items', text: 'Items' },
            { to: '/stock-balance', text: 'Stock Balance' },
            { to: '/stock-ledger', text: 'Stock Ledger' },
            { to: '/stock-transfer', text: 'Stock Transfer' },
            { to: '/stock-adjustment', text: 'Stock Adjustment' },
        ]
    },
    {
        to: '/payments',
        text: 'Payments',
        icon: <FaFileInvoice />,
        subMenus: [
            { to: '/customer-receipts', text: 'Customer Receipts' },
            { to: '/supplier-payments', text: 'Supplier Payments' },
            { to: '/expenses', text: 'Expenses' },
        ]
    },
    { to: '/daily-report', text: 'Daily Report', icon: <FaChartBar /> },
    { to: '/daily-exchange', text: 'Daily Exchange', icon: <FaExchangeAlt /> },
    { to: '/daily-closings', text: 'Daily Closings', icon: <FaDoorClosed /> },
    { to: '/cash-transfers', text: 'Cash Transfers', icon: <FaMoneyBillWave /> },
    { to: '/journal', text: 'Journal', icon: <FaBook /> },
    { to: '/users', text: 'Users', icon: <FaUsers /> },
    { to: '/user-roles', text: 'User Roles', icon: <FaUserTag /> },
    { to: '/settings', text: 'Settings', icon: <FaCog /> },
];
