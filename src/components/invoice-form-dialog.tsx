import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Plus, Trash2 } from "lucide-react";
import { customerService } from "../services/customers";
import { invoiceService } from "../services/invoices";
import { toast } from "sonner";

type Customer = {
  id: string;
  name: string;
};

type InvoiceItem = {
  description: string;
  quantity: string;
  unit_price: string;
  tax_rate: string;
  amount: number;
};

type InvoiceFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function InvoiceFormDialog({ open, onOpenChange, onSuccess }: InvoiceFormDialogProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: "",
    invoice_number: "",
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: "draft",
    notes: "",
  });
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: "", quantity: "1", unit_price: "0", tax_rate: "0", amount: 0 },
  ]);

  useEffect(() => {
    if (open) {
      loadCustomers();
      generateInvoiceNumber();
    }
  }, [open]);

  const loadCustomers = async () => {
    try {
      const data = await customerService.getAll();
      setCustomers(data || []);
    } catch (error) {
      console.error("Error loading customers:", error);
      toast.error("Failed to load customers");
    }
  };

  const generateInvoiceNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    setFormData((prev) => ({ ...prev, invoice_number: `INV-${timestamp}` }));
  };

  const calculateItemAmount = (item: InvoiceItem) => {
    const qty = parseFloat(item.quantity) || 0;
    const price = parseFloat(item.unit_price) || 0;
    const tax = parseFloat(item.tax_rate) || 0;
    return qty * price * (1 + tax / 100);
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    newItems[index].amount = calculateItemAmount(newItems[index]);
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: "1", unit_price: "0", tax_rate: "0", amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      return sum + qty * price;
    }, 0);

    const tax = items.reduce((sum, item) => {
      const qty = parseFloat(item.quantity) || 0;
      const price = parseFloat(item.unit_price) || 0;
      const taxRate = parseFloat(item.tax_rate) || 0;
      return sum + qty * price * (taxRate / 100);
    }, 0);

    return {
      subtotal,
      tax,
      total: subtotal + tax,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customer_id) {
      toast.error("Please select a customer");
      return;
    }

    if (items.length === 0 || !items[0].description) {
      toast.error("Please add at least one line item");
      return;
    }

    setLoading(true);
    try {
      const totals = calculateTotals();

      const invoiceData = {
        customer_id: formData.customer_id,
        invoice_number: formData.invoice_number,
        invoice_date: formData.invoice_date,
        due_date: formData.due_date,
        status: formData.status,
        subtotal: totals.subtotal,
        tax_amount: totals.tax,
        total_amount: totals.total,
        notes: formData.notes || null,
      };

      const invoiceItems = items.map(item => ({
        description: item.description,
        quantity: parseFloat(item.quantity),
        unit_price: parseFloat(item.unit_price),
        tax_rate: parseFloat(item.tax_rate),
        amount: parseFloat(item.quantity) * parseFloat(item.unit_price),
        item_id: null,
      }));

      await invoiceService.create(invoiceData, invoiceItems);
      toast.success("Invoice created successfully");
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      customer_id: "",
      invoice_number: "",
      invoice_date: new Date().toISOString().split('T')[0],
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "draft",
      notes: "",
    });
    setItems([{ description: "", quantity: "1", unit_price: "0", tax_rate: "0", amount: 0 }]);
  };

  const totals = calculateTotals();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create New Invoice</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Fill in the details to create a new invoice
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="customer" className="text-foreground">Customer *</Label>
                <Select value={formData.customer_id} onValueChange={(value) => setFormData({ ...formData, customer_id: value })}>
                  <SelectTrigger className="bg-muted/50 border-border text-foreground">
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id} className="text-foreground">
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="invoice_number" className="text-foreground">Invoice Number *</Label>
                <Input
                  id="invoice_number"
                  value={formData.invoice_number}
                  onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                  className="bg-muted/50 border-border text-foreground"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="invoice_date" className="text-foreground">Invoice Date *</Label>
                <Input
                  id="invoice_date"
                  type="date"
                  value={formData.invoice_date}
                  onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                  className="bg-muted/50 border-border text-foreground"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="due_date" className="text-foreground">Due Date *</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="bg-muted/50 border-border text-foreground"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status" className="text-foreground">Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger className="bg-muted/50 border-border text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="draft" className="text-foreground">Draft</SelectItem>
                    <SelectItem value="sent" className="text-foreground">Sent</SelectItem>
                    <SelectItem value="paid" className="text-foreground">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border border-border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-foreground text-base">Line Items</Label>
                <Button type="button" onClick={addItem} size="sm" variant="outline" className="border-border text-foreground">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>

              <div className="space-y-2">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      <Input
                        placeholder="Description"
                        value={item.description}
                        onChange={(e) => updateItem(index, "description", e.target.value)}
                        className="bg-muted/50 border-border text-foreground"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, "quantity", e.target.value)}
                        className="bg-muted/50 border-border text-foreground"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Price"
                        value={item.unit_price}
                        onChange={(e) => updateItem(index, "unit_price", e.target.value)}
                        className="bg-muted/50 border-border text-foreground"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Tax %"
                        value={item.tax_rate}
                        onChange={(e) => updateItem(index, "tax_rate", e.target.value)}
                        className="bg-muted/50 border-border text-foreground"
                        step="0.01"
                        min="0"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                        disabled={items.length === 1}
                        className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="text-foreground font-medium">${totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax:</span>
                  <span className="text-foreground font-medium">${totals.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span className="text-foreground">Total:</span>
                  <span className="text-foreground">${totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="notes" className="text-foreground">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes or payment terms"
                className="bg-muted/50 border-border text-foreground min-h-[80px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-border text-foreground">
              Cancel
            </Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white" disabled={loading}>
              {loading ? "Creating..." : "Create Invoice"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
