import React, { useState, useMemo, useEffect } from 'react';
import { useWarehouses, useItems, useStockBalance, useCreateSalesInvoice, useCustomers, useCurrencies } from '@/features/pos/posAPI';
import { useCurrentDateExchangeRate } from '@/features/custom_exchange_rate/customExchangeRateAPI';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Spinner from '@/components/ui/spinner';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { NumericFormat } from 'react-number-format';
import { Button } from '@/components/ui/button';
import { FaShoppingCart, FaTrash, FaTimes, FaImage, FaWarehouse } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import PosPaymentDialog from '@/components/ui/PosPaymentDialog';
import { toast } from 'sonner';
import { useCompany } from '@/hooks/useCompany';
import type { SalesInvoice } from '@/types/Accounts/SalesInvoice';

interface Item {
  name: string;
  item_name: string;
  image: string;
  standard_rate: number;
}

interface CartItem {
  name: string;
  item_name: string;
  quantity: number;
  price: number;
}

const PointOfSalePage: React.FC = () => {
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(null);
  const [customer, setCustomer] = useState('');
  const [currency, setCurrency] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentDialogKey, setPaymentDialogKey] = useState(0);
  const [stockUpdateKey, setStockUpdateKey] = useState(0);
  const { data: exchangeRate, error: exchangeRateError, mutate: fetchExchangeRate } = useCurrentDateExchangeRate(currency);

  const companyContext = useCompany();
  const defaultCurrency = companyContext?.currency;
  const company = companyContext?.company;

  useEffect(() => {
    if (defaultCurrency) {
      setCurrency(defaultCurrency);
    }
  }, [defaultCurrency]);

  useEffect(() => {
    if (currency && currency !== defaultCurrency) {
        fetchExchangeRate();
    }
  }, [currency, fetchExchangeRate, defaultCurrency]);
  // new: mobile cart drawer open state
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { data: warehouses, isLoading: warehousesLoading } = useWarehouses(company as string);
  const { data: itemsData, isLoading: itemsLoading } = useItems(!selectedWarehouse);
  const { data: customers, isLoading: customersLoading } = useCustomers();
  const { data: currencies, isLoading: currenciesLoading } = useCurrencies();
  const { createDoc, loading: creatingInvoice } = useCreateSalesInvoice();

  const customerOptions = useMemo(() => {
    if (!customers) return [];
    return customers.map((c) => ({ label: c.name, value: c.name }));
  }, [customers]);

  const currencyOptions = useMemo(() => {
    if (!currencies) return [];
    return currencies.map((c) => ({ label: c.name, value: c.name }));
  }, [currencies]);

  const filteredItems = useMemo(() => {
    if (!Array.isArray(itemsData)) return [];
    const items = itemsData.filter(item =>
      item.item_name && item.item_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (currency && currency !== defaultCurrency && exchangeRate?.message?.ex_rate) {
      return items.map(item => ({
        ...item,
        standard_rate: item.standard_rate * exchangeRate.message.ex_rate
      }));
    } else if (currency && currency !== defaultCurrency && !exchangeRate?.message?.ex_rate) {
      return [];
    }
    return items;
  }, [itemsData, searchTerm, exchangeRate, currency]);

  const addToCart = (item: Item) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.name === item.name);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.name === item.name
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { name: item.name, item_name: item.item_name, quantity: 1, price: item.standard_rate }];
    });
  };

  const removeFromCart = (itemName: string) => {
    setCart(prevCart => prevCart.filter(item => item.name !== itemName));
  };

  const updateCartItem = (itemName: string, quantity: number, price: number) => {
    setCart(prevCart =>
      prevCart.map(item =>
        item.name === itemName ? { ...item, quantity, price } : item
      )
    );
  };

  const total = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cart]);

  // new: total quantity badge
  const totalQty = useMemo(() => cart.reduce((acc, it) => acc + (it.quantity || 0), 0), [cart]);

  const handleCheckout = () => {
    if (!selectedWarehouse) {
     showToast("Please select a warehouse.");
      return;
    }
    if (!customer) {
      showToast("Please select a customer.");
      return;
    }
    if (!currency) {
      showToast("Please select a currency.");
      return;
    }
    if (cart.length === 0) {
      showToast("Please add items to the cart.");
      return;
    }
    // close mobile cart if open and show payment dialog
    setIsCartOpen(false);
    setIsPaymentDialogOpen(true);
  };

    const showToast=(message: string)=>{
    toast.error(message, {
      duration: 3000,
      style: {
        background: 'red',
        color: '#fff',
      },
      position: 'top-right',
    });
  }

  const handlePaymentSubmit = (paymentDetails: any) => {
    return new Promise(async (resolve, reject) => {
      try {
        const isPaid = paymentDetails.paymentStatus === 'Paid' || (paymentDetails.paymentStatus === 'Partly Paid' && paymentDetails.paidAmount > 0);

        const payments = isPaid ? [{
          parentfield: 'payments',
          parenttype: 'Sales Invoice',
          idx: 1,
          docstatus: 1,
          default: 1,
          mode_of_payment: paymentDetails.modeOfPayment,
          amount: paymentDetails.paidAmount,
          account: paymentDetails.account,
          type: paymentDetails.modeOfPayment,
          base_amount: paymentDetails.paidAmount,
          doctype: 'Sales Invoice Payment'
        }] : [];

        const doc: Partial<SalesInvoice> = {
          customer: customer,
          posting_date: new Date().toISOString().split('T')[0],
          update_stock: paymentDetails.update_stock ? 1 : 0,
          set_warehouse: selectedWarehouse || undefined,
          currency: currency,
          items: cart.map(item => ({ item_code: item.name, qty: item.quantity, rate: item.price, amount: item.quantity * item.price })),
          grand_total: total,
          status: paymentDetails.paymentStatus === 'Not Paid' ? 'Unpaid' : paymentDetails.paymentStatus,
          paid_amount: (paymentDetails.paymentStatus === 'Paid' || paymentDetails.paymentStatus === 'Partly Paid') ? paymentDetails.paidAmount : undefined,
          is_pos: isPaid ? 1 : 0,
          docstatus: 1,
          cash_bank_account: paymentDetails.account,
          remarks: paymentDetails.remarks,
          payments: payments
        };

        await createDoc("Sales Invoice", doc);
        toast.success("Sales Invoice created and submitted successfully",{
          position: 'top-right',
         style: {
          borderColor: 'green',
          color: 'green',
         }
        });
        setCart([]);
        setIsPaymentDialogOpen(false);
        setPaymentDialogKey(prevKey => prevKey + 1);
        setStockUpdateKey(prevKey => prevKey + 1);
        resolve(true);
      } catch (error: any) {
        toast.error(JSON.parse(JSON.parse(error._server_messages)[0]).title.replace(
            /<[^>]*>?/gm,
            ""
          )
          ,{
            description: JSON.parse(JSON.parse(error._server_messages)[0]).message.replace(
            /<[^>]*>?/gm,
            ""
          ),
            duration: 5000,
            position: 'top-right',
            style: {
              borderColor: 'red',
              color: 'red',
            }
          }
        );
        console.error(error);
        reject(error);
      }
    });
  };

  // Reusable cart inner content
  const cartInner = (
    <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold flex items-center">
                <FaShoppingCart className="mr-2" />
                <span className="hidden md:inline">Cart</span>
                <span className="md:hidden">Cart Items</span>
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setIsCartOpen(false)} className="md:hidden">
                <FaTimes />
            </Button>
        </div>
        <div className="flex-grow overflow-y-auto">
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <FaShoppingCart className="mx-auto text-gray-300 text-6xl mb-4" />
            <p className="text-gray-500 text-lg">Your cart is empty.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b bg-black">
                <th className="text-left py-2 font-semibold text-white pl-2">Item</th>
                <th className="text-center py-2 font-semibold text-white">Qty</th>
                <th className="text-center py-2 font-semibold text-white">Price</th>
                <th className="text-right py-2 font-semibold text-white">Amount</th>
                <th className="py-2"></th>
              </tr>
            </thead>
            <tbody>
              {cart.map(item => (
                <tr key={item.name} className="border-b">
                  <td className="py-1 pl-2 w-full md:w-40 text-sm">{item.item_name}</td>
                  <td className="py-1 text-center">
                    <NumericFormat
                      value={item.quantity}
                      onValueChange={(values) => updateCartItem(item.name, values.floatValue || 0, item.price)}
                      thousandSeparator
                      className="w-16 md:w-20 text-sm h-8 mx-auto border border-gray-300 rounded-md px-2"
                    />
                  </td>
                  <td className="py-2 pl-3 text-center">
                    <NumericFormat
                      value={item.price}
                      onValueChange={(values) => updateCartItem(item.name, item.quantity, values.floatValue || 0)}
                      thousandSeparator
                      decimalScale={2}
                      className="w-20 md:w-24 text-sm h-8 mx-auto border border-gray-300 rounded-md px-2"
                    />
                  </td>
                  <td className="py-2 w-auto max-w-[100px] text-sm text-right">
                    <NumericFormat
                      value={(item.quantity * item.price)}
                      displayType="text"
                      thousandSeparator
                      decimalScale={2}
                      fixedDecimalScale
                    />
                  </td>
                  <td className="py-2 text-right">
                    <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.name)}>
                      <FaTrash className="text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-auto pt-6 border-t">
        <div className="flex justify-between font-bold text-xl mb-4">
          <span>Total</span>
          <NumericFormat
            value={total}
            displayType="text"
            thousandSeparator
            prefix={`${currency} `}
            decimalScale={2}
            fixedDecimalScale
          />
        </div>
        <Button
          className="w-full"
          size="lg"
          onClick={() => {
            setIsCartOpen(false);
            handleCheckout();
          }}
          disabled={creatingInvoice}
        >
          {creatingInvoice ? "Processing..." : "Checkout"}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 select-none">
      <div className="flex h-full">
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Point of Sale</h1>
            <div>
              {currency && currency !== defaultCurrency && exchangeRate?.message && (
                  <div className="text-sm text-gray-500">
                      Exchange Rate: {exchangeRate.message.ex_rate}
                  </div>
              )}
              {currency && currency !== defaultCurrency && !exchangeRate?.message && (
                  <div className="text-sm text-red-500">
                      Exchange rate for {currency} not found.
                  </div>
              )}
              {currency && currency !== defaultCurrency && exchangeRateError && (
                  <div className="text-sm text-red-500">
                      Error: Could not fetch exchange rate.
                  </div>
              )}
            </div>
            <Link to="/">
              <Button variant="ghost" size="icon">
                <FaTimes className="text-2xl" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Select onValueChange={setSelectedWarehouse} defaultValue={selectedWarehouse || ''}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a warehouse" />
              </SelectTrigger>
              <SelectContent>
                {warehousesLoading ? (
                  <div className="flex justify-center items-center h-24">
                    <Spinner />
                  </div>
                ) : (
                  warehouses?.map((warehouse) => (
                    <SelectItem key={warehouse.name} value={warehouse.name}>
                      {warehouse.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>

            <Combobox
                options={customerOptions}
                value={customer}
                onChange={setCustomer}
                placeholder="Select a customer"
                isLoading={customersLoading}
                className="w-full"
            />

            <Combobox
                options={currencyOptions}
                value={currency}
                onChange={setCurrency}
                placeholder="Select a currency"
                isLoading={currenciesLoading}
                className="w-full"
            />

            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:col-span-2 lg:col-span-3"
            />
          </div>

          {itemsLoading && <Spinner />}

          {!selectedWarehouse && !itemsLoading && (
            <div className="text-center py-12">
              <FaWarehouse className="mx-auto text-gray-300 text-6xl mb-4" />
              <p className="text-gray-500 text-lg">Select a warehouse to load items.</p>
            </div>
          )}

          {selectedWarehouse && !itemsLoading && filteredItems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No items found.</p>
            </div>
          )}

          {selectedWarehouse && !itemsLoading && filteredItems.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filteredItems.map((item) => (
                <ItemCard key={`${item.name}-${stockUpdateKey}`} item={item} warehouse={selectedWarehouse} addToCart={addToCart} currency={currency} />
              ))}
            </div>
          )}
        </div>

        {/* Desktop cart: visible from md upwards */}
        <div className="hidden md:flex w-2/5 max-w-lg bg-white p-6 shadow-lg flex-col">
          {cartInner}
        </div>
      </div>

      {/* Mobile floating cart button (visible on small screens) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t z-50">
        <Button
          className="w-full relative shadow-lg flex items-center justify-center"
          onClick={() => setIsCartOpen(true)}
        >
          <FaShoppingCart className="text-xl mr-2" />
          <span>View Cart</span>
          {totalQty > 0 && (
            <span className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
              {totalQty}
            </span>
          )}
        </Button>
      </div>

       {/* Mobile drawer overlay */}
       {isCartOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-40"
            onClick={() => setIsCartOpen(false)}
          />

          {/* drawer panel */}
          <div className="absolute right-0 top-0 h-full w-full bg-white p-4 shadow-lg">
               {cartInner}
          </div>
        </div>
      )}


      {selectedWarehouse && (
        <PosPaymentDialog
          key={paymentDialogKey}
          isOpen={isPaymentDialogOpen}
          onClose={() => setIsPaymentDialogOpen(false)}
          cart={cart}
          total={total}
          onSubmit={handlePaymentSubmit}
          currency={currency}
          warehouse={selectedWarehouse}
        />
      )}
    </div>
  );
};

interface ItemCardProps {
  item: Item;
  warehouse: string;
  addToCart: (item: Item) => void;
  currency: string;
}

const ItemCard: React.FC<ItemCardProps> = ({ item, warehouse, addToCart, currency }) => {
  const { data: stock } = useStockBalance(item.name, warehouse);
  const stockBalance = stock?.[0]?.actual_qty ?? 0;

  return (
    <div className="bg-white border rounded-lg p-2 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col h-48" onClick={() => addToCart(item)}>
      <div className="w-full h-24 mb-2 rounded bg-gray-200 flex items-center justify-center overflow-hidden">
        {item.image ? (
          <img src={item.image} alt={item.item_name} className="max-w-full max-h-full object-contain" />
        ) : (
          <FaImage className="text-gray-400 text-4xl" />
        )}
      </div>
      <div className="flex flex-col justify-between flex-grow">
        <h2 className="text-sm font-semibold truncate">{item.item_name}</h2>
        <div>
            <p className="text-gray-600 font-bold text-sm">
                <NumericFormat
                    value={item.standard_rate}
                    displayType="text"
                    thousandSeparator
                    prefix={`${currency} `}
                    decimalScale={2}
                    fixedDecimalScale
                />
            </p>
          <p className={`text-base font-bold ${stockBalance > 0 ? 'text-green-500' : 'text-red-500'}`}>
            Stock: {stockBalance}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PointOfSalePage;
