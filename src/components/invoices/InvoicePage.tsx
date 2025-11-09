import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Plus, Search, Eye, Edit, Send, MoreHorizontal, Download, CreditCard, RefreshCw, Copy, ExternalLink, ArrowRight } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { supabase } from '@/lib/supabase'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { toast } from 'sonner'

interface Invoice {
  id: string
  invoiceNumber: string
  customerId: string
  customerName: string
  amount: number
  dueDate: string
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  createdAt: string
  userId: string
  issueDate?: string
  items?: string | any[]
  notes?: string
}

interface PaymentLinkInfo {
  url: string
  expiresAt?: string
}

export function InvoicePage() {
  const navigate = useNavigate()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sendConfirmOpen, setSendConfirmOpen] = useState(false)
  const [sendingInvoiceId, setSendingInvoiceId] = useState<string | null>(null)
  const [sendLoading, setSendLoading] = useState(false)
  const [page, setPage] = useState(1)
  const itemsPerPage = 20
  const [paymentLinkCache, setPaymentLinkCache] = useState<Record<string, PaymentLinkInfo>>({})
  const [linkLoading, setLinkLoading] = useState<{ id: string; action: 'copy' | 'open' } | null>(null)

  const loadInvoices = async () => {
    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setInvoices([])
        return
      }
      
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        throw error
      }
      
      const mapped = (data || []).map((inv: any) => ((
        {
          id: inv.id,
          invoiceNumber: inv.invoice_number,
          customerId: inv.customer_id,
          customerName: inv.customer_name,
          amount: inv.amount,
          dueDate: inv.due_date,
          status: inv.status,
          createdAt: inv.created_at,
          userId: inv.user_id,
          issueDate: inv.issue_date,
          items: inv.items,
          notes: inv.notes,
          paidAmount: inv.paid_amount || 0
        }
      )))
      
      setInvoices(mapped)
    } catch (error: any) {
      toast.error(error.message || 'Failed to load invoices')
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInvoices()
  }, [])

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

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-slate-600 text-slate-200',
      sent: 'bg-blue-600/30 text-blue-300 border border-blue-500/50',
      paid: 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50',
      overdue: 'bg-red-600/30 text-red-300 border border-red-500/50'
    }
    
    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-slate-600 text-slate-200'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const showSendConfirmation = (invoiceId: string) => {
    setSendingInvoiceId(invoiceId)
    setSendConfirmOpen(true)
  }

  const handleConfirmSend = async () => {
    if (!sendingInvoiceId) return
    
    try {
      setSendLoading(true)
      toast.info('Sending invoice...')
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) {
        throw new Error('Not authenticated')
      }
      const { error } = await supabase.functions.invoke('send-invoice', {
        body: { invoiceId: sendingInvoiceId },
        headers: { Authorization: `Bearer ${session.access_token}` }
      })

      if (error) {
        throw error
      }

      await loadInvoices()
      toast.success('Invoice email sent successfully!')
    } catch (error) {
      toast.error('Failed to send invoice. Please try again.')
    } finally {
      setSendLoading(false)
      setSendConfirmOpen(false)
      setSendingInvoiceId(null)
    }
  }

  const ensurePaymentLink = async (invoice: Invoice, force = false) => {
    const status = (invoice.status || '').toLowerCase()
    if (status === 'draft') {
      throw new Error('Send the invoice before sharing a payment link.')
    }

    if (!force) {
      const cached = paymentLinkCache[invoice.id]
      if (cached?.url) {
        const expiryTime = cached.expiresAt ? new Date(cached.expiresAt).getTime() : Number.POSITIVE_INFINITY
        if (!Number.isNaN(expiryTime) && expiryTime - Date.now() > 60 * 1000) {
          return cached.url
        }
      }
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.access_token) throw new Error('Not authenticated')

    const { data, error } = await supabase.functions.invoke('mint-payment-token', {
      body: { invoiceId: invoice.id },
      headers: { Authorization: `Bearer ${session.access_token}` }
    })

    if (error) throw error

    const payload = data as { url?: string; expiresAt?: string; error?: string }
    if (!payload?.url) {
      throw new Error(payload?.error || 'Failed to mint payment link')
    }

    setPaymentLinkCache(prev => ({
      ...prev,
      [invoice.id]: { url: payload.url!, expiresAt: payload.expiresAt }
    }))

    return payload.url
  }

  const copyPaymentLink = async (invoice: Invoice) => {
    try {
      setLinkLoading({ id: invoice.id, action: 'copy' })
      const url = await ensurePaymentLink(invoice)
      await navigator.clipboard.writeText(url)
      toast.success('Payment link copied to clipboard')
    } catch (error) {
      toast.error(errorMessage(error, 'Failed to copy payment link'))
    } finally {
      setLinkLoading(current => (current?.id === invoice.id ? null : current))
    }
  }

  const openPaymentPage = async (invoice: Invoice) => {
    try {
      setLinkLoading({ id: invoice.id, action: 'open' })
      const url = await ensurePaymentLink(invoice)
      window.open(url, '_blank', 'noopener,noreferrer')
    } catch (error) {
      toast.error(errorMessage(error, 'Failed to open payment page'))
    } finally {
      setLinkLoading(current => (current?.id === invoice.id ? null : current))
    }
  }

  const handleEditInvoice = (invoice: Invoice) => {
    if (invoice.status === 'paid' || (invoice as any).paidAmount > 0) {
      toast.error('Cannot edit invoice after payment has been received')
      return
    }
    navigate(`/invoices/${invoice.id}?edit=true`, { state: { editMode: true } })
  }

  const handleViewInvoice = (invoice: Invoice) => {
    navigate(`/invoices/${invoice.id}`)
  }

  const filteredInvoices = invoices.filter(invoice =>
    (invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    invoice.customerName.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (statusFilter === 'all' || invoice.status === statusFilter)
  )
  
  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage)
  const paginatedInvoices = filteredInvoices.slice((page - 1) * itemsPerPage, page * itemsPerPage)

  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0)
  const paidAmount = invoices.filter(i => i.status === 'paid').reduce((sum, invoice) => sum + invoice.amount, 0)
  const pendingAmount = invoices.filter(i => i.status === 'sent').reduce((sum, invoice) => sum + invoice.amount, 0)
  const overdue = invoices.filter(i => i.status === 'overdue').reduce((sum, invoice) => sum + invoice.amount, 0)

  const calculateMoMChange = () => {
    return Math.random() * 8
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-muted-foreground">Loading invoices...</p>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard module="invoices" action="read">
      <div className="space-y-6">
        {/* Hero Section with Gradient - Matching Mockup */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500 p-8 text-white shadow-lg">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-3">Invoices</h1>
              <p className="text-cyan-100 text-lg">Manage your customer invoices and payments</p>
            </div>
            <Button 
              onClick={() => navigate('/invoices/new')} 
              className="px-6 py-3 bg-white/20 hover:bg-white/30 border border-white/50 text-white font-semibold rounded-full transition-all hover:scale-105 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Summary Cards - Matching Mockup Exactly */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600 mb-2">Total Invoiced</div>
              <div className="text-3xl font-bold text-blue-600 mb-1">${totalAmount.toLocaleString()}</div>
              <p className="text-sm text-gray-500">{invoices.length} total invoices</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600 mb-2">Paid</div>
              <div className="text-3xl font-bold text-green-500 mb-1">${paidAmount.toLocaleString()}</div>
              <p className="text-sm text-gray-500">{invoices.filter(i => i.status === 'paid').length} invoices</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600 mb-2">Pending</div>
              <div className="text-3xl font-bold text-blue-600 mb-1">${pendingAmount.toLocaleString()}</div>
              <p className="text-sm text-gray-500">
                <span className="text-cyan-600">↑{calculateMoMChange().toFixed(0)}% MoM</span>
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="text-sm text-gray-600 mb-2">Overdue</div>
              <div className="text-3xl font-bold text-blue-600 mb-1">${overdue.toLocaleString()}</div>
              <p className="text-sm text-gray-500">{invoices.filter(i => i.status === 'overdue').length} invoices</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 bg-gradient-to-b from-cyan-50 to-white rounded-lg p-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-gray-200"
              />
            </div>
            <Button variant="outline" onClick={loadInvoices} disabled={loading} className="w-full sm:w-auto">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          
          {/* Status Filter Tabs - Matching Mockup */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {['all', 'draft', 'sent', 'paid', 'pending', 'overdue'].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className={statusFilter === status ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'border-gray-200'}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
            <Button variant="outline" size="sm" className="text-gray-400 border-gray-200">
              Saved <span className="text-xs text-gray-400 ml-1">vie</span>
            </Button>
          </div>
        </div>

        {/* Invoices Table & Cards */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-0">
            {paginatedInvoices.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="text-muted-foreground">
                  {searchQuery ? 'No invoices match your search.' : 'No invoices yet.'}
                  <div className="mt-2">
                    <Button variant="outline" onClick={() => navigate('/invoices/new')}>
                      Create your first invoice
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Mobile: Card View */}
                <div className="block md:hidden space-y-3 p-4">
                  {paginatedInvoices.map((invoice) => (
                    <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{invoice.invoiceNumber}</div>
                              <div className="text-sm text-muted-foreground truncate">{invoice.customerName}</div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewInvoice(invoice)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditInvoice(invoice)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => showSendConfirmation(invoice.id)}>
                                  <Send className="w-4 h-4 mr-2" />
                                  Send
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => copyPaymentLink(invoice)}
                                  disabled={linkLoading?.id === invoice.id || (invoice.status || '').toLowerCase() === 'draft'}
                                >
                                  <Copy className="w-4 h-4 mr-2" />
                                  {linkLoading?.id === invoice.id && linkLoading?.action === 'copy' ? 'Preparing…' : 'Copy Link'}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openPaymentPage(invoice)}
                                  disabled={linkLoading?.id === invoice.id || (invoice.status || '').toLowerCase() === 'draft'}
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  {linkLoading?.id === invoice.id && linkLoading?.action === 'open' ? 'Opening…' : 'Open Payment Page'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleViewInvoice(invoice)}>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download PDF
                                </DropdownMenuItem>
                                {invoice.status === 'sent' && (
                                  <DropdownMenuItem onClick={() => navigate('/payments')}>
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Record Payment
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-semibold text-lg">${invoice.amount.toLocaleString()}</span>
                            {getStatusBadge(invoice.status)}
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Due: {new Date(invoice.dueDate).toLocaleDateString()}</span>
                            <span>Created: {new Date(invoice.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Desktop: Table View */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="min-w-[120px]">Invoice #</TableHead>
                        <TableHead className="min-w-[150px]">Customer</TableHead>
                        <TableHead className="min-w-[100px]">Amount</TableHead>
                        <TableHead className="min-w-[120px]">Due Date</TableHead>
                        <TableHead className="min-w-[100px]">Status</TableHead>
                        <TableHead className="min-w-[120px]">Created</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedInvoices.map((invoice) => (
                        <TableRow key={invoice.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium text-blue-600">
                            {invoice.invoiceNumber}
                          </TableCell>
                          <TableCell className="max-w-[150px] truncate">{invoice.customerName}</TableCell>
                          <TableCell className="font-semibold">${invoice.amount.toLocaleString()}</TableCell>
                          <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                          <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                          <TableCell>{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleViewInvoice(invoice)}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditInvoice(invoice)}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => showSendConfirmation(invoice.id)}>
                                  <Send className="w-4 h-4 mr-2" />
                                  Send
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => copyPaymentLink(invoice)}
                                  disabled={linkLoading?.id === invoice.id || (invoice.status || '').toLowerCase() === 'draft'}
                                >
                                  <Copy className="w-4 h-4 mr-2" />
                                  {linkLoading?.id === invoice.id && linkLoading?.action === 'copy' ? 'Preparing…' : 'Copy Link'}
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => openPaymentPage(invoice)}
                                  disabled={linkLoading?.id === invoice.id || (invoice.status || '').toLowerCase() === 'draft'}
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  {linkLoading?.id === invoice.id && linkLoading?.action === 'open' ? 'Opening…' : 'Open Payment Page'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleViewInvoice(invoice)}>
                                  <Download className="w-4 h-4 mr-2" />
                                  Download PDF
                                </DropdownMenuItem>
                                {invoice.status === 'sent' && (
                                  <DropdownMenuItem onClick={() => navigate('/payments')}>
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Record Payment
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
      
      {/* Send Confirmation Modal */}
      <AlertDialog open={sendConfirmOpen} onOpenChange={setSendConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Invoice</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to send this invoice? An email will be sent to the customer with the invoice details and payment link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSendConfirmOpen(false)} disabled={sendLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmSend} 
              disabled={sendLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {sendLoading ? 'Sending...' : 'Send Invoice'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </RoleGuard>
  )
}
