import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Checkbox } from "./ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Plus, Trash2, Search, X, Check, ChevronsUpDown } from "lucide-react";
import { customerService } from "../services/customers";
import { invoiceService } from "../services/invoices";
import { itemService } from "../services/items";
import { toast } from "sonner";

type Customer = {
  id: string;
  name: string;
  email?: string | null;
};

type CatalogItem = {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  unit_price: number;
};

type InvoiceItem = {
  item_id: string | null;
  item_name: string;
  sku: string;
  description: string;
  quantity: string;
  rate: string;
  amount: number;
};

type InvoiceCreatePageProps = {
  onCancel: () => void;
  onSuccess: () => void;
};

export function InvoiceCreatePage({ onCancel, onSuccess }: InvoiceCreatePageProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");

  const [formData, setFormData] = useState({
    customer_id: "",
    customer_name: "",
    invoice_number: "",
    invoice_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    payment_terms: "net_30",
    payment_plan: "full",
    enable_partial: false,
    notes: "",
  });

  const [items, setItems] = useState<InvoiceItem[]>([
    { item_id: null, item_name: "", sku: "", description: "", quantity: "1", rate: "0", amount: 0 },
  ]);

  const [itemSearchOpen, setItemSearchOpen] = useState<Record<number, boolean>>({});

  useEffect(() => {
    loadCustomers();
    loadCatalogItems();
    generateInvoiceNumber();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await customerService.getAll();
      setCustomers(data || []);
    } catch (error) {
      console.error("Error loading customers:", error);
      toast.error("Failed to load customers");
    }
  };

  const loadCatalogItems = async () => {
    try {
      const data = await itemService.getAll();
      setCatalogItems(data || []);
    } catch (error) {
      console.error("Error loading catalog items:", error);
    }
  };

  const generateInvoiceNumber = () => {
    const timestamp = Date.now().toString();
    setFormData((prev) => ({ ...prev, invoice_number: `INV-${timestamp}` }));
  };

  const selectCustomer = (customer: Customer) => {
    setFormData({
      ...formData,
      customer_id: customer.id,
      customer_name: customer.name,
    });
    setCustomerSearchOpen(false);
  };

  const selectCatalogItem = (index: number, catalogItem: CatalogItem) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      item_id: catalogItem.id,
      item_name: catalogItem.name,
      sku: catalogItem.sku || "",
      description: catalogItem.description || catalogItem.name,
      rate: catalogItem.unit_price.toString(),
    };
    newItems[index].amount = calculateItemAmount(newItems[index]);
    setItems(newItems);
    setItemSearchOpen({ ...itemSearchOpen, [index]: false });
  };

  const calculateItemAmount = (item: InvoiceItem) => {
    const qty = parseFloat(item.quantity) || 0;
    const rate = parseFloat(item.rate) || 0;
    return qty * rate;
  };

  const updateItem = (index: number, field: keyof InvoiceItem, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = calculateItemAmount(newItems[index]);
    }
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { item_id: null, item_name: "", sku: "", description: "", quantity: "1", rate: "0", amount: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    return subtotal;
  };

  const handleSubmit = async (saveAsDraft: boolean = false) => {
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
      const total = calculateTotals();

      const invoiceData = {
        customer_id: formData.customer_id,
        invoice_number: formData.invoice_number,
        invoice_date: formData.invoice_date,
        due_date: formData.due_date,
        status: saveAsDraft ? 'draft' : 'sent',
        subtotal: total,
        tax_amount: 0,
        total_amount: total,
        notes: formData.notes || null,
      };

      const invoiceItems = items.map(item => ({
        description: item.description || item.item_name,
        quantity: parseFloat(item.quantity),
        unit_price: parseFloat(item.rate),
        tax_rate: 0,
        amount: item.amount,
        item_id: item.item_id,
      }));

      await invoiceService.create(invoiceData, invoiceItems);
      toast.success(saveAsDraft ? "Invoice saved as draft" : "Invoice sent successfully");
      onSuccess();
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const total = calculateTotals();

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.email?.toLowerCase().includes(customerSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6 bg-background min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-1">Create Invoice</h1>
          <p className="text-sm text-muted-foreground">Fill in the details to create a new invoice</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="invoice_number" className="text-foreground">Invoice Number</Label>
              <Input
                id="invoice_number"
                value={formData.invoice_number}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                className="bg-background border-border text-foreground"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-foreground">Customer</Label>
              <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={customerSearchOpen}
                    className="w-full justify-between bg-background border-border text-foreground h-10"
                  >
                    {formData.customer_name || "Select a customer..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0 bg-card border-border" align="start">
                  <Command className="bg-card">
                    <CommandInput
                      placeholder="Search customers..."
                      value={customerSearch}
                      onValueChange={setCustomerSearch}
                      className="text-foreground"
                    />
                    <CommandList>
                      <CommandEmpty className="text-muted-foreground py-6 text-center text-sm">
                        No customers found.
                      </CommandEmpty>
                      <CommandGroup>
                        {filteredCustomers.map((customer) => (
                          <CommandItem
                            key={customer.id}
                            value={customer.id}
                            onSelect={() => selectCustomer(customer)}
                            className="text-foreground cursor-pointer"
                          >
                            <Check
                              className={`mr-2 h-4 w-4 ${
                                formData.customer_id === customer.id ? "opacity-100" : "opacity-0"
                              }`}
                            />
                            <div className="flex flex-col">
                              <span>{customer.name}</span>
                              {customer.email && (
                                <span className="text-xs text-muted-foreground">{customer.email}</span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="invoice_date" className="text-foreground">Issue Date</Label>
              <Input
                id="invoice_date"
                type="date"
                value={formData.invoice_date}
                onChange={(e) => setFormData({ ...formData, invoice_date: e.target.value })}
                className="bg-background border-border text-foreground"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date" className="text-foreground">Due Date</Label>
              <Input
                id="due_date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="bg-background border-border text-foreground"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_terms" className="text-foreground">Payment Terms</Label>
              <Select value={formData.payment_terms} onValueChange={(value) => setFormData({ ...formData, payment_terms: value })}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="net_30" className="text-foreground">Net 30</SelectItem>
                  <SelectItem value="net_60" className="text-foreground">Net 60</SelectItem>
                  <SelectItem value="net_90" className="text-foreground">Net 90</SelectItem>
                  <SelectItem value="due_on_receipt" className="text-foreground">Due on Receipt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-foreground">Invoice Items</h2>
            <Button
              type="button"
              onClick={addItem}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>

          <div className="space-y-3">
            <div className="grid items-center gap-3 text-xs font-medium text-muted-foreground uppercase pb-2" style={{ gridTemplateColumns: "2fr 2fr 100px 120px 120px 40px" }}>
              <div>ITEM / SKU</div>
              <div>DESCRIPTION</div>
              <div className="text-center">QTY</div>
              <div className="text-center">RATE</div>
              <div className="text-right">AMOUNT</div>
              <div></div>
            </div>

            {items.map((item, index) => (
              <div key={index} className="grid items-center gap-3" style={{ gridTemplateColumns: "2fr 2fr 100px 120px 120px 40px" }}>
                <div className="space-y-1">
                  <Popover open={itemSearchOpen[index]} onOpenChange={(open) => setItemSearchOpen({ ...itemSearchOpen, [index]: open })}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className="w-full justify-start bg-background border-border text-foreground h-11 font-normal"
                      >
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <div className="flex flex-col items-start overflow-hidden">
                          <span className="truncate">{item.item_name || "Search items..."}</span>
                          {item.sku && (
                            <span className="text-xs text-muted-foreground truncate">{item.sku}</span>
                          )}
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0 bg-card border-border" align="start">
                      <Command className="bg-card">
                        <CommandInput placeholder="Search catalog items..." className="text-foreground" />
                        <CommandList>
                          <CommandEmpty className="text-muted-foreground py-6 text-center text-sm">
                            No items found.
                          </CommandEmpty>
                          <CommandGroup>
                            {catalogItems.map((catalogItem) => (
                              <CommandItem
                                key={catalogItem.id}
                                value={`${catalogItem.name} ${catalogItem.sku || ""} ${catalogItem.description || ""}`}
                                onSelect={() => selectCatalogItem(index, catalogItem)}
                                className="text-foreground cursor-pointer"
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{catalogItem.name}</span>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    {catalogItem.sku && <span>SKU: {catalogItem.sku}</span>}
                                    <span>${catalogItem.unit_price.toFixed(2)}</span>
                                  </div>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <Input
                  placeholder="Item description"
                  value={item.description}
                  onChange={(e) => updateItem(index, "description", e.target.value)}
                  className="bg-background border-border text-foreground h-11"
                  required
                />
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, "quantity", e.target.value)}
                  className="bg-background border-border text-foreground text-center h-11"
                  step="1"
                  min="1"
                  required
                />
                <Input
                  type="number"
                  value={item.rate}
                  onChange={(e) => updateItem(index, "rate", e.target.value)}
                  className="bg-background border-border text-foreground text-center h-11"
                  step="0.01"
                  min="0"
                  required
                />
                <div className="flex items-center justify-end h-11">
                  <span className="text-foreground font-medium text-base">${item.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-center h-11">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                    className="text-muted-foreground hover:text-red-400 hover:bg-red-950/30 h-9 w-9"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-4">
            <p className="text-xs text-muted-foreground">
              Tip: Search and select catalog items to automatically apply pricing and tax settings.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
            <h2 className="text-lg font-medium text-foreground">Payment Options</h2>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="payment_plan" className="text-foreground">Payment Plan</Label>
              <Select value={formData.payment_plan} onValueChange={(value) => setFormData({ ...formData, payment_plan: value })}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="full" className="text-foreground">Full Payment Required</SelectItem>
                  <SelectItem value="partial" className="text-foreground">Partial Payment Allowed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <Label className="text-foreground">Collection Settings</Label>
              <div className="flex items-start space-x-3 rounded-lg border border-border p-4 bg-background/50">
                <Checkbox
                  id="enable_partial"
                  checked={formData.enable_partial}
                  onCheckedChange={(checked) => setFormData({ ...formData, enable_partial: checked as boolean })}
                  className="mt-1"
                />
                <div className="space-y-1">
                  <label
                    htmlFor="enable_partial"
                    className="text-sm font-medium text-foreground cursor-pointer"
                  >
                    Enable partial payments for this invoice
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Allow customers to pay in multiple installments while keeping the invoice open.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
            <h2 className="text-lg font-medium text-foreground">Notes & Additional Terms</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Share expectations, banking details, or reminders that appear on the customer copy.
          </p>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Add any additional notes, terms, or special instructions..."
            className="bg-background border-border text-foreground min-h-[120px] resize-none"
          />
        </CardContent>
      </Card>

      <div className="sticky bottom-0 bg-card/95 backdrop-blur-sm border-t border-border p-6 mt-8 flex items-center justify-between gap-3 -mx-6 -mb-6">
        <div className="text-sm text-muted-foreground">
          Total: <span className="text-2xl font-bold text-indigo-400 ml-2">${total.toFixed(2)}</span>
        </div>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="border-border text-foreground hover:bg-accent"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSubmit(true)}
            className="border-border text-foreground hover:bg-accent"
            disabled={loading}
          >
            Save as Draft
          </Button>
          <Button
            type="button"
            onClick={() => handleSubmit(false)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6"
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Invoice"}
          </Button>
        </div>
      </div>
    </div>
  );
}
