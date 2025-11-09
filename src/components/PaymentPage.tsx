import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { supabase } from '../lib/supabase';
import { CreditCard, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Invoice {
  id: string;
  invoice_number: string;
  customer_id: string;
  total_amount: number;
  paid_amount: number;
  status: string;
  due_date: string;
  invoice_date: string;
  notes: string | null;
  items?: any;
}

interface Customer {
  id: string;
  name: string;
  email: string;
}

export function PaymentPage() {
  const { invoiceId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    loadInvoiceData();
  }, [invoiceId]);

  const loadInvoiceData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!invoiceId) {
        setError('Invalid payment link');
        return;
      }

      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

      if (invoiceError || !invoiceData) {
        setError('Invoice not found');
        return;
      }

      setInvoice(invoiceData);

      const remainingAmount = invoiceData.total_amount - (invoiceData.paid_amount || 0);
      setPaymentAmount(remainingAmount.toFixed(2));

      const { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .eq('id', invoiceData.customer_id)
        .single();

      if (customerData) {
        setCustomer(customerData);
      }
    } catch (err) {
      console.error('Error loading invoice:', err);
      setError('Failed to load invoice details');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!invoice) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const remainingAmount = invoice.total_amount - (invoice.paid_amount || 0);
    if (amount > remainingAmount) {
      toast.error(`Amount cannot exceed remaining balance of $${remainingAmount.toFixed(2)}`);
      return;
    }

    setProcessing(true);

    try {
      const newPaidAmount = (invoice.paid_amount || 0) + amount;
      const newStatus = newPaidAmount >= invoice.total_amount ? 'paid' : 'partial';

      const { error: paymentError } = await supabase
        .from('payments')
        .insert({
          invoice_id: invoice.id,
          customer_id: invoice.customer_id,
          amount: amount,
          payment_method: paymentMethod,
          payment_date: new Date().toISOString(),
          status: 'completed',
          reference_number: `PAY-${Date.now()}`,
        });

      if (paymentError) throw paymentError;

      const { error: updateError } = await supabase
        .from('invoices')
        .update({
          paid_amount: newPaidAmount,
          status: newStatus,
        })
        .eq('id', invoice.id);

      if (updateError) throw updateError;

      setPaymentSuccess(true);
      toast.success('Payment processed successfully!');

      await loadInvoiceData();
    } catch (err) {
      console.error('Payment error:', err);
      toast.error('Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mb-4" />
            <p className="text-muted-foreground">Loading invoice details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardContent className="pt-6 flex flex-col items-center">
            <XCircle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Payment Link Invalid</h2>
            <p className="text-muted-foreground text-center">{error || 'Unable to load invoice'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-green-200">
          <CardContent className="pt-6 flex flex-col items-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-muted-foreground text-center mb-6">
              Your payment of ${parseFloat(paymentAmount).toFixed(2)} has been processed.
            </p>
            {invoice.paid_amount >= invoice.total_amount ? (
              <Badge className="bg-green-500 text-white">Invoice Paid in Full</Badge>
            ) : (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Remaining Balance:</p>
                <p className="text-xl font-bold text-orange-600">
                  ${(invoice.total_amount - invoice.paid_amount).toFixed(2)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const remainingAmount = invoice.total_amount - (invoice.paid_amount || 0);
  const items = invoice.items ? (typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items) : [];

  return (
    <div className="min-h-screen bg-background p-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Invoice Payment</h1>
          <p className="text-muted-foreground">Pay your invoice securely online</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Invoice {invoice.invoice_number}</CardTitle>
              <Badge
                className={
                  invoice.status === 'paid' ? 'bg-green-500' :
                  invoice.status === 'partial' ? 'bg-orange-500' :
                  invoice.status === 'overdue' ? 'bg-red-500' :
                  'bg-blue-500'
                }
              >
                {invoice.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Bill To</p>
                <p className="font-medium">{customer?.name || 'Unknown Customer'}</p>
                {customer?.email && (
                  <p className="text-sm text-muted-foreground">{customer.email}</p>
                )}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Invoice Date</p>
                <p className="font-medium">{new Date(invoice.invoice_date).toLocaleDateString()}</p>
                <p className="text-sm text-muted-foreground mt-2">Due Date</p>
                <p className="font-medium">{new Date(invoice.due_date).toLocaleDateString()}</p>
              </div>
            </div>

            <Separator />

            {items.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Invoice Items</h3>
                <div className="space-y-2">
                  {items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between text-sm">
                      <div>
                        <p className="font-medium">{item.description}</p>
                        <p className="text-muted-foreground">
                          Qty: {item.quantity} × ${item.unit_price?.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-medium">${item.amount?.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-lg">
                <span className="font-medium">Total Amount</span>
                <span className="font-bold">${invoice.total_amount.toFixed(2)}</span>
              </div>
              {invoice.paid_amount > 0 && (
                <>
                  <div className="flex justify-between text-green-600">
                    <span>Paid Amount</span>
                    <span className="font-semibold">${invoice.paid_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg text-orange-600">
                    <span className="font-semibold">Amount Due</span>
                    <span className="font-bold">${remainingAmount.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>

            {invoice.notes && (
              <>
                <Separator />
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm">{invoice.notes}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {remainingAmount > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Make a Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Payment Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={remainingAmount}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="text-lg font-semibold"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum: ${remainingAmount.toFixed(2)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="method">Payment Method</Label>
                <select
                  id="method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full h-10 px-3 rounded-md border border-border bg-background"
                >
                  <option value="card">Credit/Debit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <Button
                onClick={handlePayment}
                disabled={processing || !paymentAmount || parseFloat(paymentAmount) <= 0}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                size="lg"
              >
                {processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    Pay ${parseFloat(paymentAmount || '0').toFixed(2)}
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Your payment is secure and encrypted
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
