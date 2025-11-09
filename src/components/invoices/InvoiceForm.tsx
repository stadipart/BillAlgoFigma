import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { generateUUID } from '@/lib/uuid'
import { requiresApproval, createApprovalWorkflow } from '@/components/approvals/ApprovalWorkflowHelper'
import { toast } from 'sonner'
import { ItemSelector } from '@/components/items/ItemSelector'

interface InvoiceFormProps {
  invoice?: any
  onClose: () => void
}

interface InvoiceItem {
  id: string
  name?: string
  sku?: string
  description: string
  quantity: number
  rate: number
  amount: number
  taxRate?: number
  taxType?: string
  isTaxable?: boolean
  taxAmount?: number
}

interface Customer {
  id: string
  name: string
  email: string
  address: string
}

interface InvoiceFormState {
  invoiceNumber: string
  customerId: string
  customerName: string
  issueDate: string
  dueDate: string
  terms: string
  notes: string
  status: string
  allowPartial: boolean
  minimumAmount: string
  paymentPlan: 'full' | 'partial'
}

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

export function InvoiceForm({ invoice, onClose }: InvoiceFormProps) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const normalizeAllowPartial = () => {
    if (typeof invoice?.allowPartial === 'boolean') return invoice.allowPartial
    if (typeof invoice?.allow_partial === 'boolean') return invoice.allow_partial
    if (typeof invoice?.allowPartial === 'string') return invoice.allowPartial === 'true'
    if (typeof invoice?.allow_partial === 'string') return invoice.allow_partial === 'true'
    return false
  }

  const initialMinimumAmount =
    invoice?.minimumAmount ??
    invoice?.minimum_amount ??
    ''

  const [formData, setFormData] = useState<InvoiceFormState>({
    invoiceNumber: invoice?.invoiceNumber || `INV-${Date.now()}`,
    customerId: invoice?.customerId || '',
    customerName: invoice?.customerName || '',
    issueDate: invoice?.issueDate || new Date().toISOString().split('T')[0],
    dueDate: invoice?.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    terms: invoice?.terms || 'Net 30',
    notes: invoice?.notes || '',
    status: invoice?.status || 'draft',
    allowPartial: normalizeAllowPartial(),
    minimumAmount: initialMinimumAmount ? String(initialMinimumAmount) : '',
    paymentPlan: invoice?.paymentPlan === 'partial' || invoice?.payment_plan === 'partial' ? 'partial' : 'full'
  })
  
  const [items, setItems] = useState<InvoiceItem[]>(() => {
    if (invoice?.items) {
      try {
        const parsedItems = typeof invoice.items === 'string'
          ? JSON.parse(invoice.items)
          : invoice.items
        return Array.isArray(parsedItems)
          ? parsedItems
          : [
              { id: '1', description: '', quantity: 1, rate: 0, amount: 0 }
            ]
      } catch (error) {
        console.error('Failed to parse invoice items:', error)
        return [{ id: '1', description: '', quantity: 1, rate: 0, amount: 0 }]
      }
    }
    return [{ id: '1', description: '', quantity: 1, rate: 0, amount: 0 }]
  })

  useEffect(() => {
    // Sync items when invoice prop changes (handles saved items as string, object or array)
    if (!invoice) {
      setItems([{ id: '1', description: '', quantity: 1, rate: 0, amount: 0 }])
      return
    }

    if (invoice.items) {
      try {
        const parsed = typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items
        if (Array.isArray(parsed)) {
          setItems(parsed)
        } else if (typeof parsed === 'object' && parsed !== null) {
          // Single item object — convert to array
          setItems([
            {
              id: parsed.id ? String(parsed.id) : Date.now().toString(),
              description: parsed.description || '',
              quantity: Number(parsed.quantity) || 1,
              rate: Number(parsed.rate) || 0,
              amount: Number(parsed.amount) || 0
            }
          ])
        } else {
          setItems([{ id: Date.now().toString(), description: '', quantity: 1, rate: 0, amount: 0 }])
        }
      } catch (err) {
        console.error('Failed to parse invoice.items on prop change', err)
        setItems([{ id: Date.now().toString(), description: '', quantity: 1, rate: 0, amount: 0 }])
      }
    } else {
      setItems([{ id: Date.now().toString(), description: '', quantity: 1, rate: 0, amount: 0 }])
    }
  }, [invoice])

  useEffect(() => {
    loadCustomers()
  }, [])

  async function loadCustomers() {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name', { ascending: true })
      
      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error('Failed to load customers:', error)
      setCustomers([])
    }
  }

  const handleInputChange = (field: keyof InvoiceFormState, value: string | boolean) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value } as InvoiceFormState

      if (field === 'customerId' && typeof value === 'string') {
        const customer = customers.find((c) => c.id === value)
        if (customer) {
          next.customerName = customer.name
        }
      }

      if (field === 'allowPartial') {
        if (value === false) {
          next.minimumAmount = ''
          next.paymentPlan = 'full'
        } else if (value === true) {
          next.paymentPlan = 'partial'
        }
      }

      if (field === 'paymentPlan' && typeof value === 'string') {
        if (value === 'partial') {
          next.allowPartial = true
        } else {
          next.allowPartial = false
          next.minimumAmount = ''
        }
      }

      return next
    })
  }

  const handleItemChange = (index: number, field: string, value: string | number) => {
    const updatedItems = [...items]
    updatedItems[index] = { 
      ...updatedItems[index], 
      [field]: value 
    }
    
    if (field === 'quantity' || field === 'rate') {
      const baseAmount = updatedItems[index].quantity * updatedItems[index].rate
      let taxAmount = 0
      
      // Recalculate tax if item is taxable
      if (updatedItems[index].isTaxable && updatedItems[index].taxRate) {
        if (updatedItems[index].taxType === 'percentage') {
          taxAmount = baseAmount * (updatedItems[index].taxRate / 100)
        } else {
          taxAmount = updatedItems[index].taxRate // Fixed tax amount
        }
      }
      
      updatedItems[index].taxAmount = taxAmount
      updatedItems[index].amount = baseAmount + taxAmount
    }
    
    setItems(updatedItems)
  }

  const addItem = () => {
    setItems([...items, { 
      id: Date.now().toString(), 
      name: '',
      sku: '',
      description: '', 
      quantity: 1, 
      rate: 0, 
      amount: 0 
    }])
  }

  const handleCatalogItemSelect = (index: number, catalogItem: any) => {
    const updatedItems = [...items]
    const baseAmount = updatedItems[index].quantity * catalogItem.unitPrice
    let taxAmount = 0
    
    // Calculate tax if item is taxable
    if (catalogItem.isTaxable && catalogItem.taxRate) {
      if (catalogItem.taxType === 'percentage') {
        taxAmount = baseAmount * (catalogItem.taxRate / 100)
      } else {
        taxAmount = catalogItem.taxRate // Fixed tax amount
      }
    }
    
    updatedItems[index] = {
      ...updatedItems[index],
      name: catalogItem.name,
      sku: catalogItem.sku || '',
      description: catalogItem.description || catalogItem.name,
      rate: catalogItem.unitPrice,
      taxRate: catalogItem.taxRate,
      taxType: catalogItem.taxType,
      isTaxable: catalogItem.isTaxable,
      taxAmount: taxAmount,
      amount: baseAmount + taxAmount
    }
    setItems(updatedItems)
  }

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.amount, 0)
  }

  const logAuditEntry = async (invoiceId: string, action: string, details?: string, fieldName?: string, oldValue?: string, newValue?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const auditLog = {
        invoice_id: invoiceId,
        user_id: user.id,
        action,
        field_name: fieldName || null,
        old_value: oldValue || null,
        new_value: newValue || null,
        details: details || null,
        user_name: user.user_metadata?.display_name || user.email || null,
        user_email: user.email || null,
        created_at: new Date().toISOString()
      }
      
      const { error } = await supabase
        .from('invoice_audit_logs')
        .insert(auditLog)
      
      if (error) throw error
    } catch (error) {
      console.error('Failed to log audit entry:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent, action: 'draft' | 'send' = 'draft') => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) throw new Error('Not authenticated')
      // Fetch merchant_id for current user to ensure invoices carry merchant scope
      let merchantId: string | null = null
      try {
        const { data: dbUser } = await supabase
          .from('users')
          .select('merchant_id')
          .eq('id', authUser.id)
          .maybeSingle()
        merchantId = dbUser?.merchant_id || null
      } catch { /* ignore */ }
      
      const total = calculateTotal()
      
      const invoiceData = {
        invoice_number: formData.invoiceNumber,
        customer_id: formData.customerId,
        customer_name: formData.customerName,
        issue_date: formData.issueDate,
        due_date: formData.dueDate,
        terms: formData.terms,
        notes: formData.notes,
        status: action === 'send' ? 'sent' : 'draft',
        user_id: authUser.id,
        merchant_id: merchantId,
        amount: total,
        tax_amount: 0,
        total_amount: total,
        items: JSON.stringify(items),
        allow_partial: formData.allowPartial,
        minimum_amount: formData.allowPartial ? parseFloat(formData.minimumAmount) || 0 : null,
        payment_plan: formData.paymentPlan,
        paid_amount: invoice?.paidAmount || 0,
        updated_at: new Date().toISOString(),
        sent_at: action === 'send' ? new Date().toISOString() : invoice?.sentAt || null
      }

      let invoiceId: string

      if (invoice) {
        // Update existing
        const { error } = await supabase
          .from('invoices')
          .update(invoiceData)
          .eq('id', invoice.id)
        
        if (error) throw error
        invoiceId = invoice.id
        
        console.log('✓ Invoice updated successfully:', {
          invoiceId,
          invoiceNumber: formData.invoiceNumber,
          status: action === 'send' ? 'sent' : 'draft',
          amount: total,
          customerName: formData.customerName,
          dueDate: formData.dueDate,
          timestamp: new Date().toISOString()
        })
        
        // Send email if action is send
        if (action === 'send') {
          await sendInvoiceEmail(invoice.id)
          console.log('✓ Invoice email notification sent')
        }
      } else {
        // Create new
        const newInvoiceData = {
          ...invoiceData,
          id: generateUUID(),
          created_at: new Date().toISOString()
        }
        
        const { data: newInvoice, error } = await supabase
          .from('invoices')
          .insert(newInvoiceData)
          .select()
          .single()
        
        if (error) throw error
        invoiceId = newInvoice.id

        console.log('✓ Invoice created successfully:', {
          invoiceId,
          invoiceNumber: formData.invoiceNumber,
          status: action === 'send' ? 'sent' : 'draft',
          amount: total,
          customerName: formData.customerName,
          dueDate: formData.dueDate,
          itemCount: items.length,
          timestamp: new Date().toISOString()
        })

        // Send email if action is send
        if (action === 'send') {
          await sendInvoiceEmail(invoiceId)
          console.log('✓ Invoice email notification sent')
        }
      }

      console.log('✓ Invoice workflow completed')
      toast.success(invoice ? 'Invoice updated successfully!' : 'Invoice created successfully!')
      // Close the form after successful save
      onClose()
    } catch (error) {
      console.error('Failed to save invoice:', error)
      toast.error('Failed to save invoice. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const sendInvoiceEmail = async (invoiceId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('Not authenticated')
      }
      const { error } = await supabase.functions.invoke('send-invoice', {
        body: {
          invoiceId,
          note: 'Invoice sent immediately after creation'
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })

      if (error) {
        throw error
      }
    } catch (emailError) {
      console.warn('Invoice email send error:', emailError)
      toast.error('Invoice saved but email could not be sent. You can resend from the invoice details page.')
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Header Section */}
        <div className="rounded-2xl border border-gray-800 bg-[#0f1421] p-6 shadow-inner">
          <div className="grid gap-6 md:grid-cols-2 mb-6">
            <div className="space-y-3">
              <Label htmlFor="invoiceNumber" className="text-sm font-semibold text-foreground">
                Invoice Number
              </Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                className="font-mono text-lg bg-gray-900/60 border border-gray-800 focus:border-brand focus:ring-2 focus:ring-brand/20"
                required
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="customer" className="text-sm font-semibold text-foreground">
                Customer
              </Label>
              <Select value={formData.customerId} onValueChange={(value) => handleInputChange('customerId', value)}>
                <SelectTrigger className="bg-gray-900/60 border border-gray-800 focus:border-brand h-12">
                  <SelectValue placeholder="Select a customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-3">
              <Label htmlFor="issueDate" className="text-sm font-semibold text-foreground">
                Issue Date
              </Label>
              <Input
                id="issueDate"
                type="date"
                value={formData.issueDate}
                onChange={(e) => handleInputChange('issueDate', e.target.value)}
                className="bg-gray-900/60 border border-gray-800 focus:border-brand focus:ring-2 focus:ring-brand/20"
                required
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="dueDate" className="text-sm font-semibold text-foreground">
                Due Date
              </Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
                className="bg-gray-900/60 border border-gray-800 focus:border-brand focus:ring-2 focus:ring-brand/20"
                required
              />
            </div>
            
            <div className="space-y-3">
              <Label htmlFor="terms" className="text-sm font-semibold text-foreground">
                Payment Terms
              </Label>
              <Select value={formData.terms} onValueChange={(value) => handleInputChange('terms', value)}>
                <SelectTrigger className="bg-gray-900/60 border border-gray-800 focus:border-brand">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Due on receipt">Due on receipt</SelectItem>
                  <SelectItem value="Net 15">Net 15</SelectItem>
                  <SelectItem value="Net 30">Net 30</SelectItem>
                  <SelectItem value="Net 45">Net 45</SelectItem>
                  <SelectItem value="Net 60">Net 60</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

      {/* Invoice Items */}
      <section className="rounded-2xl border border-gray-800 bg-[#0f1421] p-5 space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <h3 className="text-lg font-semibold">Invoice Items</h3>
          </div>
          <Button
            type="button"
            onClick={addItem}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Item
          </Button>
        </div>

        <div className="rounded-xl border border-gray-800 bg-[#121a2f]/60">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm text-gray-200">
              <thead className="text-xs uppercase tracking-wide text-gray-400 bg-[#10172b]/60">
                <tr className="border-b border-gray-800/70">
                <th className="py-3 pr-4 text-left">Item</th>
                <th className="py-3 pr-4 text-left">Description</th>
                <th className="py-3 pr-4 text-center w-24">Qty</th>
                <th className="py-3 pr-4 text-right w-28">Rate</th>
                <th className="py-3 pr-4 text-right w-28">Amount</th>
                <th className="py-3 pl-2 text-right w-12"> </th>
              </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/60">
                {items.map((item, index) => (
                  <tr key={item.id} className="align-top transition-colors hover:bg-gray-900/40">
                  <td className="py-4 pr-4">
                    <div className="space-y-2">
                      <ItemSelector
                        onSelect={(catalogItem) => handleCatalogItemSelect(index, catalogItem)}
                        value={item.name || ''}
                        placeholder="Search items..."
                        className="w-full"
                      />
                      <Input
                        value={item.sku || ''}
                        onChange={(e) => handleItemChange(index, 'sku', e.target.value)}
                        placeholder="SKU (optional)"
                        className="bg-gray-900/60 border border-gray-800 text-white placeholder:text-gray-500 focus:border-brand focus:ring-2 focus:ring-brand/20"
                      />
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <Input
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      placeholder="Item description"
                      className="bg-gray-900/60 border border-gray-800 text-white placeholder:text-gray-500 focus:border-brand focus:ring-2 focus:ring-brand/20"
                      required
                    />
                  </td>
                  <td className="py-4 pr-4 text-center">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="bg-gray-900/60 border border-gray-800 text-center text-white focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                  </td>
                  <td className="py-4 pr-4 text-right">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.rate}
                      onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                      className="bg-gray-900/60 border border-gray-800 text-right text-white focus:border-brand focus:ring-2 focus:ring-brand/20"
                    />
                  </td>
                  <td className="py-4 pr-4 text-right font-semibold">{currency.format(item.amount)}</td>
                  <td className="py-4 pl-2 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                      className="text-gray-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-gray-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-gray-500">
            Tip: Set SKU or select catalog items to automatically apply pricing and tax settings.
          </p>
          <div className="text-right space-y-1">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">Total Amount</div>
            <div className="text-3xl font-bold text-brand/70">{currency.format(calculateTotal())}</div>
          </div>
        </div>
      </section>

        {/* Payment Options */}
        <section className="rounded-2xl border border-gray-800 bg-[#0f1421] p-6 space-y-6">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-indigo-400" />
            <h3 className="text-lg font-semibold text-white">Payment Options</h3>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Label htmlFor="paymentPlan" className="text-sm font-semibold text-gray-200">
                Payment Plan
              </Label>
              <Select value={formData.paymentPlan} onValueChange={(value) => handleInputChange('paymentPlan', value)}>
                <SelectTrigger className="h-12 bg-gray-900/60 border border-gray-800 text-white focus:border-brand focus:ring-2 focus:ring-brand/20">
                  <SelectValue placeholder="Select a payment plan" />
                </SelectTrigger>
                <SelectContent className="bg-[#121a2f] border border-gray-800 text-gray-200">
                  <SelectItem value="full" className="focus:bg-brand/20 focus:text-white">
                    Full Payment Required
                  </SelectItem>
                  <SelectItem value="partial" className="focus:bg-brand/20 focus:text-white">
                    Allow Partial Payments
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-200">Collection Settings</Label>
              <div className="rounded-xl border border-gray-800 bg-[#121a2f]/60 p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="allowPartial"
                    checked={formData.allowPartial}
                    onCheckedChange={(checked) => handleInputChange('allowPartial', checked === true)}
                    className="mt-1 border-2 border-brand/40 bg-transparent data-[state=checked]:bg-brand/30 data-[state=checked]:border-indigo-400"
                  />
                  <div className="space-y-1">
                    <Label htmlFor="allowPartial" className="text-sm font-medium text-gray-200">
                      Enable partial payments for this invoice
                    </Label>
                    <p className="text-xs text-gray-400">
                      Allow customers to pay in multiple installments while keeping the invoice open.
                    </p>
                  </div>
                </div>

                {formData.allowPartial && (
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,240px)_1fr] sm:items-start">
                    <div className="space-y-2">
                      <Label htmlFor="minimumAmount" className="text-sm font-semibold text-gray-200">
                        Minimum Payment Amount ($)
                      </Label>
                      <Input
                        id="minimumAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.minimumAmount}
                        onChange={(e) => handleInputChange('minimumAmount', e.target.value)}
                        placeholder="Enter minimum payment amount"
                        className="bg-gray-900/60 border border-gray-800 text-white placeholder:text-gray-500 focus:border-brand focus:ring-2 focus:ring-brand/20"
                      />
                    </div>
                    <p className="rounded-lg border border-brand/20 bg-brand/5 px-4 py-3 text-xs text-brand/50/80 shadow-inner">
                      💡 Customers must pay at least this amount when making partial payments.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Notes Section */}
        <section className="rounded-2xl border border-gray-800 bg-[#0f1421] p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-purple-400" />
            <div>
              <Label htmlFor="notes" className="text-sm font-semibold text-gray-200">
                Notes & Additional Terms
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                Share expectations, banking details, or reminders that appear on the customer copy.
              </p>
            </div>
          </div>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Add any additional notes, terms, or special instructions..."
            rows={5}
            className="bg-gray-900/60 border border-gray-800 text-white placeholder:text-gray-500 focus:border-brand focus:ring-2 focus:ring-brand/20 resize-none"
          />
        </section>

        {/* Action Buttons */}
        <div className="flex flex-col justify-end gap-4 border-t border-gray-800 pt-8 sm:flex-row">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="order-3 border-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-900/40 hover:text-white transition-all duration-200 sm:order-1"
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            disabled={loading}
            onClick={(e) => handleSubmit(e as any, 'draft')}
            className="order-2 border-gray-700 text-gray-300 hover:border-indigo-400 hover:bg-brand/10 hover:text-white transition-all duration-200"
          >
            {loading ? 'Saving...' : 'Save as Draft'}
          </Button>
          <Button 
            type="submit" 
            disabled={loading}
            onClick={(e) => handleSubmit(e as any, 'send')}
            className="order-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-8 py-2 text-white shadow-[0_0_25px_rgba(99,102,241,0.35)] transition hover:shadow-[0_0_35px_rgba(168,85,247,0.45)] sm:order-3"
          >
            {loading ? 'Sending...' : (invoice?.status === 'draft' ? 'Send Invoice' : 'Update & Send')}
          </Button>
        </div>
      </form>
    </div>
  )
}
