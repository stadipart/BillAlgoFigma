import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Edit, Send, Download, CreditCard, Copy, ExternalLink, History, DollarSign, ShieldCheck, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { InvoiceForm } from './InvoiceForm'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'

interface Invoice {
  id: string
  invoiceNumber: string
  customerId: string
  customerName: string
  amount: number
  paidAmount: number
  dueDate: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'partial'
  createdAt: string
  issueDate?: string
  items?: string | any[]
  notes?: string
  allowPartial?: boolean
  minimumAmount?: number
  paymentPlan?: string
}

interface AuditLog {
  id: string
  action: string
  fieldName?: string
  oldValue?: string
  newValue?: string
  details?: string
  createdAt: string
  userName?: string
  userEmail?: string
}

interface Payment {
  id: string
  amount: number
  paymentMethod: string
  paymentDate: string
  status: string
  referenceNumber?: string
  authorizeNetTransactionId?: string
}

interface PaymentLinkInfo {
  invoiceId: string
  url: string
  expiresAt?: string
}

export function InvoiceDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [canEdit, setCanEdit] = useState(false)
  const [sendLoading, setSendLoading] = useState(false)
  const [sendConfirmOpen, setSendConfirmOpen] = useState(false)
  const [sendNote, setSendNote] = useState('')
  const [sendCc, setSendCc] = useState('')
  const [markPaidOpen, setMarkPaidOpen] = useState(false)
  const [markPaidAmount, setMarkPaidAmount] = useState('')
  const [markPaidDate, setMarkPaidDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [markPaidMethod, setMarkPaidMethod] = useState('check')
  const [markPaidReference, setMarkPaidReference] = useState('')
  const [markPaidNote, setMarkPaidNote] = useState('')
  const [markPaidLoading, setMarkPaidLoading] = useState(false)
  const [paymentLinkInfo, setPaymentLinkInfo] = useState<PaymentLinkInfo | null>(null)
  const [paymentLinkLoading, setPaymentLinkLoading] = useState(false)
  const [paymentDrawerOpen, setPaymentDrawerOpen] = useState(false)
  const [paymentDrawerLoading, setPaymentDrawerLoading] = useState(false)
  const [paymentFrameUrl, setPaymentFrameUrl] = useState<string | null>(null)
  const [paymentProcessing, setPaymentProcessing] = useState(false)

  const loadInvoiceDetails = useCallback(async () => {
    try {
      setLoading(true)
      
      // Load invoice
      const { data: invoiceData, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error || !invoiceData) {
        toast.error('Invoice not found')
        navigate('/invoices')
        return
      }
      
      // Map snake_case to camelCase
      const inv = {
        id: invoiceData.id,
        invoiceNumber: invoiceData.invoice_number,
        customerId: invoiceData.customer_id,
        customerName: invoiceData.customer_name,
        amount: invoiceData.amount,
        paidAmount: invoiceData.paid_amount || 0,
        dueDate: invoiceData.due_date,
        status: invoiceData.status,
        createdAt: invoiceData.created_at,
        issueDate: invoiceData.issue_date,
        items: invoiceData.items,
        notes: invoiceData.notes,
        allowPartial: invoiceData.allow_partial,
        minimumAmount: invoiceData.minimum_amount,
        paymentPlan: invoiceData.payment_plan
      }
      
      setInvoice(inv)
      setPaymentLinkInfo(prev => (prev?.invoiceId === inv.id ? prev : null))
      
      // Determine if invoice can be edited
      // Rule: Cannot edit if customer has made any payment (even partial)
      const editAllowed = !inv.paidAmount || Number(inv.paidAmount) === 0
      setCanEdit(editAllowed)
      
      // Load audit logs
      await loadAuditLogs(inv.id)
      
      // Load payments
      await loadPayments(inv.id)
    } catch (error) {
      console.error('Failed to load invoice details:', error)
      toast.error('Failed to load invoice details')
    } finally {
      setLoading(false)
    }
  }, [id, navigate])

  useEffect(() => {
    if (id) {
      loadInvoiceDetails()
    }
    // If route was opened with edit intent (from dashboard), open edit mode
    if (location?.state?.editMode || new URLSearchParams(location.search).get('edit') === 'true') {
      setIsEditing(true)
    }
  }, [id, location, loadInvoiceDetails])

  useEffect(() => {
    if (markPaidOpen && invoice) {
      const outstanding = Math.max(0, Number(invoice.amount) - Number(invoice.paidAmount || 0))
      setMarkPaidAmount(outstanding > 0 ? outstanding.toFixed(2) : '')
      setMarkPaidDate(new Date().toISOString().slice(0, 10))
      setMarkPaidMethod('check')
      setMarkPaidReference('')
      setMarkPaidNote('')
    }
  }, [markPaidOpen, invoice])

  const loadAuditLogs = async (invoiceId: string) => {
    try {
      const { data: logs } = await supabase
        .from('invoice_audit_logs')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('created_at', { ascending: false })
      
      // Map to camelCase
      const mapped = (logs || []).map((log: any) => ({
        id: log.id,
        action: log.action,
        fieldName: log.field_name,
        oldValue: log.old_value,
        newValue: log.new_value,
        details: log.details,
        createdAt: log.created_at,
        userName: log.user_name,
        userEmail: log.user_email
      }))
      
      setAuditLogs(mapped)
    } catch (error) {
      console.error('Failed to load audit logs:', error)
    }
  }

  const loadPayments = async (invoiceId: string) => {
    try {
      const { data: paymentData } = await supabase
        .from('payments')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('payment_date', { ascending: false })
      
      // Map to camelCase
      const mapped = (paymentData || []).map((payment: any) => ({
        id: payment.id,
        amount: payment.amount,
        paymentMethod: payment.payment_method,
        paymentDate: payment.payment_date,
        status: payment.status,
        referenceNumber: payment.reference_number,
        authorizeNetTransactionId: payment.authorize_net_transaction_id
      }))
      
      setPayments(mapped)
    } catch (error) {
      console.error('Failed to load payments:', error)
    }
  }

  const errorMessage = (error: unknown, fallback: string) => {
    if (!error) return fallback
    if (typeof error === 'string') return error
    if (error instanceof Error) return error.message || fallback
    if (typeof error === 'object') {
      const candidate = (error as any)?.message || (error as any)?.error || (error as any)?.data?.message || (error as any)?.data?.error
      if (candidate) return String(candidate)
    }
    return fallback
  }

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const data = event?.data
      if (!data || typeof data !== 'object' || !('type' in data)) return
      const type = (data as any).type as string
      if (typeof type !== 'string' || !type.startsWith('anet/')) return

      if (type === 'anet/payment-frame-ready') {
        setPaymentProcessing(false)
        return
      }
      if (type === 'anet/payment-loading') {
        setPaymentProcessing(true)
        return
      }
      if (type === 'anet/payment-fallback-opened') {
        setPaymentProcessing(true)
        return
      }
      if (type === 'anet/payment-complete') {
        setPaymentProcessing(false)
        setPaymentDrawerOpen(false)
        toast.success('Payment submitted successfully')
        setPaymentFrameUrl(null)
        void (async () => {
          await loadInvoiceDetails()
          window.dispatchEvent(new Event('payments:refresh'))
        })()
        return
      }
      if (type === 'anet/payment-error') {
        setPaymentProcessing(false)
        toast.error('We were unable to process the payment. Please try again.')
        return
      }
    }

    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [loadInvoiceDetails])

  const logAuditEntry = async (action: string, details?: string, fieldName?: string, oldValue?: string, newValue?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !invoice?.id) return
      await supabase.from('invoice_audit_logs').insert({
        invoice_id: invoice.id,
        user_id: user.id,
        action,
        field_name: fieldName,
        old_value: oldValue,
        new_value: newValue,
        details,
        user_name: user.user_metadata?.display_name || user.email,
        user_email: user.email
      })
    } catch (error) {
      console.error('Failed to log audit entry:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      partial: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800'
    }
    
    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {status === 'partial' ? 'Partially Paid' : status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const showSendConfirmation = () => {
    setSendConfirmOpen(true)
  }

  const handleConfirmSend = async () => {
    if (!invoice) return
    try {
      setSendLoading(true)
      toast.info('Sending invoice...')
      const ccList = sendCc
        .split(',')
        .map((email) => email.trim())
        .filter((email) => email.length > 0)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('Not authenticated')
      }

      const { error } = await supabase.functions.invoke('send-invoice', {
        body: {
          invoiceId: invoice.id,
          note: sendNote || undefined,
          cc: ccList.length ? ccList : undefined
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })

      if (error) {
        throw error
      }

      toast.success('Invoice email sent successfully!')
      setSendConfirmOpen(false)
      setSendNote('')
      setSendCc('')
      await loadInvoiceDetails()
    } catch (error) {
      console.error('Failed to send invoice:', error)
      toast.error('Failed to send invoice')
    } finally {
      setSendLoading(false)
    }
  }

  const handleCancelSend = () => {
    setSendConfirmOpen(false)
  }

  const ensurePaymentLink = useCallback(async (force = false) => {
    if (!invoice) throw new Error('Invoice not loaded')

    const status = (invoice.status || '').toLowerCase()
    if (status === 'draft') {
      throw new Error('Send the invoice before sharing a payment link.')
    }

    if (!force && paymentLinkInfo?.invoiceId === invoice.id && paymentLinkInfo.url) {
      if (!paymentLinkInfo.expiresAt) {
        return paymentLinkInfo.url
      }
      const expiryMs = new Date(paymentLinkInfo.expiresAt).getTime()
      if (!Number.isNaN(expiryMs) && expiryMs - Date.now() > 60 * 1000) {
        return paymentLinkInfo.url
      }
    }

    setPaymentLinkLoading(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Not authenticated')

      const { data, error } = await supabase.functions.invoke('mint-payment-token', {
        body: { invoiceId: invoice.id },
        headers: { Authorization: `Bearer ${session.access_token}` }
      })

      if (error) throw error

      const payload = data as { url?: string; expiresAt?: string; error?: string }
      if (!payload || !payload.url) {
        throw new Error(payload?.error || 'Failed to mint payment link')
      }

      const info: PaymentLinkInfo = {
        invoiceId: invoice.id,
        url: payload.url,
        expiresAt: payload.expiresAt
      }
      setPaymentLinkInfo(info)
      return info.url
    } catch (error) {
      setPaymentLinkInfo(prev => (prev?.invoiceId === invoice.id ? null : prev))
      throw error
    } finally {
      setPaymentLinkLoading(false)
    }
  }, [invoice, paymentLinkInfo])

  const copyPaymentLink = async () => {
    if (!invoice) return

    try {
      const url = await ensurePaymentLink()
      await navigator.clipboard.writeText(url)
      toast.success('Payment link copied to clipboard')
      await logAuditEntry('link_copied', 'Payment link copied to clipboard')
    } catch (error) {
      console.error('Copy payment link error:', error)
      toast.error(errorMessage(error, 'Failed to copy payment link'))
    }
  }

  const openPaymentPage = async () => {
    if (!invoice) return

    try {
      const url = await ensurePaymentLink()
      window.open(url, '_blank', 'noopener,noreferrer')
      await logAuditEntry('payment_page_opened', 'Payment page opened in new tab')
    } catch (error) {
      toast.error(errorMessage(error, 'Failed to open payment page'))
    }
  }

  const openPaymentDrawer = async () => {
    if (!invoice) return

    try {
      setPaymentDrawerLoading(true)
      const url = await ensurePaymentLink()
      const embedUrl = `${url}${url.includes('?') ? '&' : '?'}embed=1`
      setPaymentFrameUrl(embedUrl)
      setPaymentProcessing(true)
      setPaymentDrawerOpen(true)
      await logAuditEntry('payment_drawer_opened', 'Payment drawer opened in app')
    } catch (error) {
      toast.error(errorMessage(error, 'Failed to start payment'))
      setPaymentFrameUrl(null)
      setPaymentDrawerOpen(false)
    } finally {
      setPaymentDrawerLoading(false)
    }
  }

  const handleManualPayment = async () => {
    if (!invoice) return
    const amountValue = Number(markPaidAmount)
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      toast.error('Enter a valid payment amount')
      return
    }

    try {
      setMarkPaidLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('Not authenticated')
      }

      const { error } = await supabase.functions.invoke('invoice-mark-paid', {
        body: {
          invoiceId: invoice.id,
          amount: amountValue,
          paymentMethod: markPaidMethod,
          paymentDate: markPaidDate,
          reference: markPaidReference || undefined,
          note: markPaidNote || undefined
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      })

      if (error) {
        throw error
      }

      toast.success('Payment recorded and invoice updated')
      setMarkPaidOpen(false)
      window.dispatchEvent(new Event('invoices:refresh'))
      await loadInvoiceDetails()
    } catch (error) {
      console.error('Failed to record manual payment:', error)
      toast.error('Failed to record payment')
    } finally {
      setMarkPaidLoading(false)
    }
  }

  const handleDownloadInvoice = async () => {
    if (!invoice) return
    
    try {
      toast.info('Generating invoice view...')
      
      // Generate HTML invoice content
      let itemsHtml = ''
      if (invoice.items) {
        try {
          const items = typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items
          itemsHtml = `
            <div style="margin-top: 30px;">
              <h3 style="border-bottom: 2px solid #2563EB; padding-bottom: 10px;">Items</h3>
              <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <thead>
                  <tr style="background: #f1f5f9;">
                    <th style="padding: 8px; text-align: left; border: 1px solid #e2e8f0;">Description</th>
                    <th style="padding: 8px; text-align: right; border: 1px solid #e2e8f0;">Qty</th>
                    <th style="padding: 8px; text-align: right; border: 1px solid #e2e8f0;">Rate</th>
                    <th style="padding: 8px; text-align: right; border: 1px solid #e2e8f0;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${Array.isArray(items) ? items.map((item: any) => `
                    <tr>
                      <td style="padding: 8px; border: 1px solid #e2e8f0;">${item.description}</td>
                      <td style="padding: 8px; text-align: right; border: 1px solid #e2e8f0;">${item.quantity}</td>
                      <td style="padding: 8px; text-align: right; border: 1px solid #e2e8f0;">${item.rate}</td>
                      <td style="padding: 8px; text-align: right; border: 1px solid #e2e8f0;">${item.amount}</td>
                    </tr>
                  `).join('') : ''}
                </tbody>
              </table>
            </div>
          `
        } catch (error) {
          console.error('Error parsing items:', error)
        }
      }
      
      const paymentInfo = invoice.paidAmount && Number(invoice.paidAmount) > 0 ? `
        <div style="margin-top: 20px; padding: 15px; background: #f0fdf4; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
            <span>Total Amount:</span>
            <span style="font-weight: bold;">${invoice.amount.toLocaleString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; color: #22c55e;">
            <span>Paid Amount:</span>
            <span style="font-weight: bold;">${Number(invoice.paidAmount).toLocaleString()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 2px solid #22c55e;">
            <span style="font-weight: bold;">Outstanding:</span>
            <span style="font-weight: bold; color: #f59e0b;">${(invoice.amount - Number(invoice.paidAmount)).toLocaleString()}</span>
          </div>
        </div>
      ` : `
        <div class="total" style="font-size: 20px; font-weight: bold; margin-top: 30px; padding: 15px; background: #f1f5f9; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between;">
            <span>Total Amount:</span>
            <span style="color: #2563EB;">${invoice.amount.toLocaleString()}</span>
          </div>
        </div>
      `
      
      const invoiceHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Invoice ${invoice.invoiceNumber}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
            .header { border-bottom: 3px solid #2563EB; padding-bottom: 20px; margin-bottom: 30px; }
            .company-name { font-size: 28px; font-weight: bold; color: #2563EB; }
            .invoice-title { font-size: 24px; font-weight: bold; margin-top: 30px; }
            .details { margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 8px 0; }
            .label { font-weight: bold; color: #666; }
            .value { color: #333; }
            .notes { margin-top: 30px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; }
            @media print { body { margin: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="company-name">Bill Algo Finance</div>
            <div style="color: #666; margin-top: 5px;">Business Finance Platform</div>
          </div>
          
          <div class="invoice-title">Invoice ${invoice.invoiceNumber}</div>
          
          <div class="details">
            <div class="detail-row">
              <span class="label">Customer:</span>
              <span class="value">${invoice.customerName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Issue Date:</span>
              <span class="value">${new Date(invoice.issueDate || invoice.createdAt).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <span class="label">Due Date:</span>
              <span class="value">${new Date(invoice.dueDate).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <span class="label">Status:</span>
              <span class="value" style="text-transform: uppercase; font-weight: bold; color: ${invoice.status === 'paid' ? '#22c55e' : '#2563EB'};">${invoice.status}</span>
            </div>
          </div>
          
          ${itemsHtml}
          
          ${paymentInfo}
          
          ${invoice.notes ? `
            <div class="notes">
              <div style="font-weight: bold; margin-bottom: 8px;">Notes:</div>
              <div>${invoice.notes}</div>
            </div>
          ` : ''}
          
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
        </html>
      `
      
      // Open in new window for printing
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(invoiceHtml)
        printWindow.document.close()
        toast.success('Invoice opened in new window. Use browser print to save as PDF.')
        await logAuditEntry('pdf_downloaded', 'Invoice print view opened')
      } else {
        toast.error('Please allow popups to download invoice')
      }
      
    } catch (error) {
      console.error('Failed to generate invoice:', error)
      toast.error('Failed to generate invoice')
    }
  }

  const formatActionText = (log: AuditLog) => {
    switch (log.action) {
      case 'created':
        return 'Invoice created'
      case 'invoice_updated':
      case 'updated':
        return log.fieldName 
          ? `Updated ${log.fieldName}: ${log.oldValue} → ${log.newValue}`
          : 'Invoice updated'
      case 'field_updated':
        return log.fieldName 
          ? `Updated ${log.fieldName}: ${log.oldValue} → ${log.newValue}`
          : log.details || 'Field updated'
      case 'invoice_created':
      case 'record_created':
        return 'Invoice created'
      case 'invoice_sent':
        return 'Invoice sent to customer'
      case 'invoice_cancelled':
        return 'Invoice cancelled'
      case 'due_date_changed':
        return `Due date changed: ${log.oldValue} → ${log.newValue}`
      case 'email_sent':
        return 'Email sent to customer'
      case 'manual_payment':
        return 'Manual payment recorded'
      case 'payment_received':
        return `Payment received: $${log.newValue}`
      case 'status_changed':
        return `Status changed: ${log.oldValue} → ${log.newValue}`
      case 'link_copied':
        return 'Payment link copied'
      case 'pdf_downloaded':
        return 'PDF downloaded'
      default:
        return log.details || log.action
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p>Invoice not found</p>
        <Button onClick={() => navigate('/invoices')} className="mt-4">
          Back to Invoices
        </Button>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Details
          </Button>
          <h1 className="text-2xl font-bold">Edit Invoice {invoice.invoiceNumber}</h1>
        </div>
        
        <Card className="border border-gray-800 bg-[#0f1421] text-gray-100 shadow-lg shadow-black/10">
          <CardHeader className="border-b border-gray-800 bg-transparent">
            <CardTitle>Edit Invoice</CardTitle>
          </CardHeader>
          <CardContent className="bg-transparent">
            <InvoiceForm 
              invoice={invoice} 
              onClose={() => {
                setIsEditing(false)
                loadInvoiceDetails() // Refresh data after edit
              }} 
            />
          </CardContent>
        </Card>
      </div>
    )
  }

  const remainingAmount = Math.max(0, Number(invoice.amount) - Number(invoice.paidAmount || 0))
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/invoices')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Invoices
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Invoice {invoice.invoiceNumber}</h1>
            <p className="text-muted-foreground">Created on {new Date(invoice.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {canEdit ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Invoice
            </Button>
          ) : (
            <Button variant="outline" disabled title="Cannot edit invoice after payment">
              <Edit className="w-4 h-4 mr-2" />
              Edit Invoice
            </Button>
          )}

          {remainingAmount > 0.01 && (
            <Button
              onClick={openPaymentDrawer}
              className="bg-brand text-white hover:bg-brand-hover"
              disabled={paymentDrawerLoading || paymentProcessing || paymentLinkLoading}
            >
              {paymentDrawerLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ShieldCheck className="w-4 h-4 mr-2" />
              )}
              {paymentDrawerLoading ? 'Launching…' : 'Pay Securely'}
            </Button>
          )}

          {remainingAmount > 0.01 && (
            <Button
              onClick={() => setMarkPaidOpen(true)}
              className="bg-emerald-600 text-white hover:bg-emerald-700"
              variant="default"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
          )}
          
          <Button onClick={showSendConfirmation} className="bg-green-600 text-white hover:bg-green-700" disabled={sendLoading}>
            <Send className="w-4 h-4 mr-2" />
            {sendLoading ? 'Sending...' : (invoice.status === 'draft' ? 'Send Invoice' : 'Resend Email')}
          </Button>
          
          <Button variant="outline" onClick={handleDownloadInvoice}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Edit Restriction Alert */}
      {!canEdit && (
        <Alert>
          <AlertDescription>
            This invoice cannot be edited because the customer has already made payments. 
            Contact your administrator if changes are needed.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Invoice Details</TabsTrigger>
          <TabsTrigger value="payments">Payments ({payments.length})</TabsTrigger>
          <TabsTrigger value="history">Audit History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          {/* Invoice Overview */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <div className="text-sm text-muted-foreground">Customer</div>
                  <div className="font-medium">{invoice.customerName}</div>
                </div>
                <div className="grid gap-2">
                  <div className="text-sm text-muted-foreground">Issue Date</div>
                  <div>{new Date(invoice.issueDate || invoice.createdAt).toLocaleDateString()}</div>
                </div>
                <div className="grid gap-2">
                  <div className="text-sm text-muted-foreground">Due Date</div>
                  <div>{new Date(invoice.dueDate).toLocaleDateString()}</div>
                </div>
                <div className="grid gap-2">
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div>{getStatusBadge(invoice.status)}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <div className="text-sm text-muted-foreground">Total Amount</div>
                  <div className="text-2xl font-bold">${invoice.amount.toLocaleString()}</div>
                </div>
                {invoice.paidAmount && Number(invoice.paidAmount) > 0 && (
                  <>
                    <div className="grid gap-2">
                      <div className="text-sm text-muted-foreground">Paid Amount</div>
                      <div className="text-lg font-semibold text-green-600">
                        ${Number(invoice.paidAmount).toLocaleString()}
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <div className="text-sm text-muted-foreground">Outstanding Amount</div>
                      <div className="text-lg font-semibold text-orange-600">
                        ${remainingAmount.toLocaleString()}
                      </div>
                    </div>
                  </>
                )}
                
                <div className="pt-4 space-y-2">
                  <Button
                    onClick={copyPaymentLink}
                    className="w-full"
                    variant="outline"
                    disabled={paymentLinkLoading || paymentDrawerLoading || !invoice || (invoice.status || '').toLowerCase() === 'draft'}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    {paymentLinkLoading ? 'Preparing link…' : 'Copy Payment Link'}
                  </Button>
                  <Button
                    onClick={openPaymentPage}
                    className="w-full"
                    disabled={paymentLinkLoading || paymentDrawerLoading || !invoice || (invoice.status || '').toLowerCase() === 'draft'}
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {paymentLinkLoading ? 'Opening…' : 'Open Payment Page'}
                  </Button>
                  {(!invoice || (invoice.status || '').toLowerCase() === 'draft') && (
                    <p className="text-xs text-muted-foreground">
                      Send the invoice before sharing a payment link.
                    </p>
                  )}
                  {invoice && paymentLinkInfo?.invoiceId === invoice.id && paymentLinkInfo.url && (
                    <p className="text-xs text-muted-foreground break-all">
                      Latest link: <span className="font-mono">{paymentLinkInfo.url}</span>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Invoice Items */}
          {invoice.items && (
            <Card>
              <CardHeader>
                <CardTitle>Invoice Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Quantity</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(() => {
                      try {
                        const items = typeof invoice.items === 'string' 
                          ? JSON.parse(invoice.items) 
                          : invoice.items
                        return Array.isArray(items) ? items.flatMap((item: any, index: number) => {
                          const taxAmount = Number(item.taxAmount) || 0
                          const baseAmount = Number(item.amount) - taxAmount
                          return [
                            (
                              <TableRow key={`${index}-main`}>
                                <TableCell>{item.description}</TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                <TableCell className="text-right">${Number(item.rate).toFixed(2)}</TableCell>
                                <TableCell className="text-right">${baseAmount.toFixed(2)}</TableCell>
                              </TableRow>
                            ),
                            taxAmount > 0 ? (
                              <TableRow key={`${index}-tax`}>
                                <TableCell colSpan={3} className="pl-6 text-sm text-muted-foreground">+${taxAmount.toFixed(2)} tax</TableCell>
                                <TableCell className="text-right font-medium text-primary">${(baseAmount + taxAmount).toFixed(2)}</TableCell>
                              </TableRow>
                            ) : null
                          ]
                        }) : null
                      } catch {
                        return (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                              Unable to display items
                            </TableCell>
                          </TableRow>
                        )
                      }
                    })()}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{invoice.notes}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Payment History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {payments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No payments received yet
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                        <TableCell>${payment.amount.toLocaleString()}</TableCell>
                        <TableCell className="capitalize">{payment.paymentMethod}</TableCell>
                        <TableCell>
                          <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                            {payment.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {payment.referenceNumber || payment.authorizeNetTransactionId || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Audit History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {auditLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No audit history available
                </div>
              ) : (
                <div className="space-y-4">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-4 pb-4 border-b last:border-b-0">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium">{formatActionText(log)}</div>
                        <div className="text-sm text-muted-foreground">
                          {log.userName || log.userEmail} • {new Date(log.createdAt).toLocaleString()}
                        </div>
                        {log.details && (
                          <div className="text-sm text-muted-foreground mt-1">{log.details}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Sheet open={paymentDrawerOpen} onOpenChange={(open) => {
        setPaymentDrawerOpen(open)
        if (!open) {
          setPaymentProcessing(false)
          setPaymentFrameUrl(null)
        }
      }}>
        <SheetContent side="right" className="w-full sm:max-w-xl bg-slate-950 text-slate-100 border-l border-slate-800 p-0">
          <SheetHeader className="p-6 pb-4">
            <SheetTitle className="text-xl font-semibold flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-brand/80" />
              Secure Payment
            </SheetTitle>
            <SheetDescription className="text-sm text-slate-400">
              Complete payment for invoice {invoice.invoiceNumber}. The form is secured by Authorize.Net.
            </SheetDescription>
          </SheetHeader>
          <Separator className="bg-slate-800" />
          <div className="p-6 space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <div className="flex justify-between items-center text-sm text-slate-400">
                <span>Amount Due</span>
                <span>Due Date</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-2xl font-semibold text-white">${remainingAmount.toLocaleString()}</span>
                <span className="text-sm text-slate-200">{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '—'}</span>
              </div>
              <div className="mt-3 text-sm text-slate-400">
                Billing to <span className="text-slate-200">{invoice.customerName}</span>
                {invoice.notes && (
                  <div className="mt-2 text-xs text-slate-500 border-t border-slate-800 pt-2">
                    {invoice.notes}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden">
              {paymentFrameUrl ? (
                <iframe
                  key={paymentFrameUrl}
                  src={paymentFrameUrl}
                  title="Secure payment"
                  className="w-full h-[520px] border-0"
                  allow="payment"
                />
              ) : (
                <div className="flex items-center justify-center h-[520px] text-slate-400 text-sm">
                  {paymentDrawerLoading ? 'Launching secure form…' : 'Secure payment form unavailable.'}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand/80" />
                Powered by Authorize.Net
              </div>
              {paymentProcessing && (
                <div className="flex items-center gap-2 text-brand/70">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing payment…
                </div>
              )}
            </div>
          </div>
          <SheetFooter className="border-t border-slate-800 p-6">
            <SheetClose asChild>
              <Button variant="outline" className="w-full border-slate-700 text-slate-200 hover:bg-slate-800">
                Cancel
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Send Confirmation Modal */}
      <AlertDialog open={sendConfirmOpen} onOpenChange={setSendConfirmOpen}>
        <AlertDialogContent className="bg-[#0f1421] border border-gray-800 text-gray-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Send Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to send invoice {invoice?.invoiceNumber}? An email will be sent to {invoice?.customerName} with the invoice details and payment link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="send-note" className="text-gray-300">Optional Message</Label>
              <Textarea
                id="send-note"
                value={sendNote}
                onChange={(e) => setSendNote(e.target.value)}
                placeholder="Add a personal message or reminder..."
                className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="send-cc" className="text-gray-300">CC Emails</Label>
              <Input
                id="send-cc"
                value={sendCc}
                onChange={(e) => setSendCc(e.target.value)}
                placeholder="Optional: comma-separated emails"
                className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-500"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelSend} disabled={sendLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmSend} 
              disabled={sendLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {sendLoading ? 'Sending...' : (invoice?.status === 'draft' ? 'Send Invoice' : 'Resend Email')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={markPaidOpen} onOpenChange={setMarkPaidOpen}>
        <DialogContent className="bg-[#0f1421] border border-gray-800 text-gray-100">
          <DialogHeader>
            <DialogTitle>Record Manual Payment</DialogTitle>
            <DialogDescription className="text-gray-400">
              Log an offline payment and update the invoice balance. Outstanding amount: ${remainingAmount.toFixed(2)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="manual-amount" className="text-gray-300">Amount Received</Label>
              <Input
                id="manual-amount"
                type="number"
                min="0"
                step="0.01"
                value={markPaidAmount}
                onChange={(e) => setMarkPaidAmount(e.target.value)}
                className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="grid gap-2">
              <Label className="text-gray-300">Payment Method</Label>
              <Select value={markPaidMethod} onValueChange={setMarkPaidMethod}>
                <SelectTrigger className="bg-gray-900 border-gray-800 text-white">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent className="bg-[#0f1421] border border-gray-800 text-gray-100">
                  <SelectItem value="check">Check</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="wire">Wire</SelectItem>
                  <SelectItem value="ach">ACH</SelectItem>
                  <SelectItem value="credit_card">Card (manual)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="manual-date" className="text-gray-300">Payment Date</Label>
              <Input
                id="manual-date"
                type="date"
                value={markPaidDate}
                onChange={(e) => setMarkPaidDate(e.target.value)}
                className="bg-gray-900 border-gray-800 text-white"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="manual-reference" className="text-gray-300">Reference</Label>
              <Input
                id="manual-reference"
                value={markPaidReference}
                onChange={(e) => setMarkPaidReference(e.target.value)}
                placeholder="Check number or transaction reference"
                className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="manual-note" className="text-gray-300">Internal Note</Label>
              <Textarea
                id="manual-note"
                value={markPaidNote}
                onChange={(e) => setMarkPaidNote(e.target.value)}
                placeholder="Optional note for the audit log"
                className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-500"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setMarkPaidOpen(false)} disabled={markPaidLoading}>
              Cancel
            </Button>
            <Button onClick={handleManualPayment} disabled={markPaidLoading}>
              {markPaidLoading ? 'Saving...' : 'Save Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
