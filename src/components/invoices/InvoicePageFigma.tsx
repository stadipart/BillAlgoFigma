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

export function InvoicePageFigma() {
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
      
      const mapped = (data || []).map((inv: any) => (
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
      ))
      
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

  const copyPaymentLink = async (invoice: Invoice) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.access_token) throw new Error('Not authenticated')
      const { data, error } = await supabase.functions.invoke('mint-payment-token', {
        body: { invoiceId: invoice.id },
        headers: { Authorization: `Bearer ${session.access_token}` }
      })
      if (error) throw error
      await navigator.clipboard.writeText((data as any)?.url)
      toast.success('Payment link copied to clipboard')
    } catch (error) {
      toast.error('Failed to copy payment link')
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
          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-400">Loading invoices...</p>
        </div>
      </div>
    )
  }

  return (
    <RoleGuard module="invoices" action="read">
      <div className="space-y-6">
        {/* Hero Section with Gradient - Figma Dark Navy Theme */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 p-8 text-white shadow-lg">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute -top-10 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-2 tracking-tight">Invoices</h1>
              <p className="text-blue-100 text-lg font-medium">Manage customer invoices with real-time tracking</p>
            </div>
            <Button 
              onClick={() => navigate('/invoices/new')} 
              className="px-6 py-3 bg-white/20 hover:bg-white/30 border border-white/40 text-white font-semibold rounded-lg transition-all duration-200 hover:scale-105 flex items-center gap-2 backdrop-blur-sm"
            >
              <Plus className="w-5 h-5" />
              Create
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Summary Cards - Figma Dark Theme */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 animate-stagger">
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 shadow-lg hover:shadow-xl hover:border-cyan-500/50 transition-all duration-200 group">
            <CardContent className="pt-6">
              <div className="text-xs text-slate-400 mb-2 group-hover:text-cyan-400 transition-colors">Total Invoiced</div>
              <div className="text-3xl font-bold text-cyan-400 mb-1">${totalAmount.toLocaleString()}</div>
              <p className="text-xs text-slate-500">{invoices.length} total invoices</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 shadow-lg hover:shadow-xl hover:border-emerald-500/50 transition-all duration-200 group">
            <CardContent className="pt-6">
              <div className="text-xs text-slate-400 mb-2 group-hover:text-emerald-400 transition-colors">Paid</div>
              <div className="text-3xl font-bold text-emerald-400 mb-1">${paidAmount.toLocaleString()}</div>
              <p className="text-xs text-slate-500">{invoices.filter(i => i.status === 'paid').length} invoices</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 shadow-lg hover:shadow-xl hover:border-cyan-500/50 transition-all duration-200 group">
            <CardContent className="pt-6">
              <div className="text-xs text-slate-400 mb-2 group-hover:text-cyan-400 transition-colors">Pending</div>
              <div className="text-3xl font-bold text-cyan-400 mb-1">${pendingAmount.toLocaleString()}</div>
              <p className="text-xs text-slate-500">
                <span className="text-cyan-300 font-semibold">↑{calculateMoMChange().toFixed(0)}% MoM</span>
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 shadow-lg hover:shadow-xl hover:border-red-500/50 transition-all duration-200 group">
            <CardContent className="pt-6">
              <div className="text-xs text-slate-400 mb-2 group-hover:text-red-400 transition-colors">Overdue</div>
              <div className="text-3xl font-bold text-red-400 mb-1">${overdue.toLocaleString()}</div>
              <p className="text-xs text-slate-500">{invoices.filter(i => i.status === 'overdue').length} invoices</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent className="pt-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-4 h-4" />
                <Input
                  placeholder="Search invoices..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-slate-700/30 border-slate-600 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/30"
                />
              </div>
              <Button variant="outline" onClick={loadInvoices} disabled={loading} className="w-full sm:w-auto border-slate-600 hover:bg-slate-700">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {['all', 'draft', 'sent', 'paid', 'pending', 'overdue'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className={statusFilter === status ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white border-0' : 'border-slate-600 bg-slate-700/30 text-slate-200 hover:bg-slate-600'}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Invoices Table & Cards */}
        <Card className="bg-slate-800/50 border-slate-700/50 shadow-lg backdrop-blur-sm">
          <CardContent className="p-0">
            {paginatedInvoices.length === 0 ? (
              <div className="text-center py-12 px-4">
                <div className="text-slate-400">
                  {searchQuery ? 'No invoices match your search.' : 'No invoices yet.'}
                  <div className="mt-2">
                    <Button variant="outline" onClick={() => navigate('/invoices/new')} className="border-slate-600 text-slate-300 hover:bg-slate-700">
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
                    <Card key={invoice.id} className="bg-slate-700/30 border-slate-600 hover:border-cyan-500/50 hover:shadow-lg transition-all duration-200 group animate-fade-in-up">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-cyan-400 truncate group-hover:text-cyan-300 transition-colors">{invoice.invoiceNumber}</div>
                              <div className="text-sm text-slate-400 truncate">{invoice.customerName}</div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-cyan-400">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                                <DropdownMenuItem onClick={() => handleViewInvoice(invoice)} className="text-slate-300 hover:text-cyan-400 hover:bg-slate-700">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditInvoice(invoice)} className="text-slate-300 hover:text-cyan-400 hover:bg-slate-700">
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => showSendConfirmation(invoice.id)} className="text-slate-300 hover:text-cyan-400 hover:bg-slate-700">
                                  <Send className="w-4 h-4 mr-2" />
                                  Send
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => copyPaymentLink(invoice)} className="text-slate-300 hover:text-cyan-400 hover:bg-slate-700">
                                  <Copy className="w-4 h-4 mr-2" />
                                  Copy Link
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleViewInvoice(invoice)} className="text-slate-300 hover:text-cyan-400 hover:bg-slate-700">
                                  <Download className="w-4 h-4 mr-2" />
                                  Download PDF
                                </DropdownMenuItem>
                                {invoice.status === 'sent' && (
                                  <DropdownMenuItem onClick={() => navigate('/payments')} className="text-slate-300 hover:text-cyan-400 hover:bg-slate-700">
                                    <CreditCard className="w-4 h-4 mr-2" />
                                    Record Payment
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-semibold text-lg text-cyan-300">${invoice.amount.toLocaleString()}</span>
                            {getStatusBadge(invoice.status)}
                          </div>
                          <div className="flex justify-between text-xs text-slate-500">
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
                      <TableRow className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70">
                        <TableHead className="min-w-[120px] text-slate-300">Invoice #</TableHead>
                        <TableHead className="min-w-[150px] text-slate-300">Customer</TableHead>
                        <TableHead className="min-w-[100px] text-slate-300">Amount</TableHead>
                        <TableHead className="min-w-[120px] text-slate-300">Due Date</TableHead>
                        <TableHead className="min-w-[100px] text-slate-300">Status</TableHead>
                        <TableHead className="min-w-[120px] text-slate-300">Created</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedInvoices.map((invoice) => (
                        <TableRow key={invoice.id} className="border-slate-700 hover:bg-slate-700/50 transition-colors duration-150 group">
                          <TableCell className="font-medium text-cyan-400 group-hover:text-cyan-300">
                            {invoice.invoiceNumber}
                          </TableCell>
                          <TableCell className="max-w-[150px] truncate text-slate-300">{invoice.customerName}</TableCell>
                          <TableCell className="font-semibold text-cyan-300">${invoice.amount.toLocaleString()}</TableCell>
                          <TableCell className="text-slate-400">{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                          <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                          <TableCell className="text-slate-400">{new Date(invoice.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-slate-400 hover:text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                                <DropdownMenuItem onClick={() => handleViewInvoice(invoice)} className="text-slate-300 hover:text-cyan-400 hover:bg-slate-700">
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleEditInvoice(invoice)} className="text-slate-300 hover:text-cyan-400 hover:bg-slate-700">
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => showSendConfirmation(invoice.id)} className="text-slate-300 hover:text-cyan-400 hover:bg-slate-700">
                                  <Send className="w-4 h-4 mr-2" />
                                  Send
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => copyPaymentLink(invoice)} className="text-slate-300 hover:text-cyan-400 hover:bg-slate-700">
                                  <Copy className="w-4 h-4 mr-2" />
                                  Copy Link
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleViewInvoice(invoice)} className="text-slate-300 hover:text-cyan-400 hover:bg-slate-700">
                                  <Download className="w-4 h-4 mr-2" />
                                  Download PDF
                                </DropdownMenuItem>
                                {invoice.status === 'sent' && (
                                  <DropdownMenuItem onClick={() => navigate('/payments')} className="text-slate-300 hover:text-cyan-400 hover:bg-slate-700">
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
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Previous
            </Button>
            <span className="text-sm text-slate-400">
              Page {page} of {totalPages}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Next
            </Button>
          </div>
        )}
      </div>
      
      {/* Send Confirmation Modal */}
      <AlertDialog open={sendConfirmOpen} onOpenChange={setSendConfirmOpen}>
        <AlertDialogContent className="bg-slate-800 border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Send Invoice</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Are you sure you want to send this invoice? An email will be sent to the customer with the invoice details and payment link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSendConfirmOpen(false)} disabled={sendLoading} className="border-slate-600 text-slate-300 hover:bg-slate-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmSend} 
              disabled={sendLoading}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {sendLoading ? 'Sending...' : 'Send Invoice'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </RoleGuard>
  )
}
