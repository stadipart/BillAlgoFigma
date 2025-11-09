import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Trash2,
  Plus,
  Edit,
  Copy,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  ExternalLink,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Loader2
} from "lucide-react";
import { motion } from "motion/react";
import { AnimatedCounter } from "./animated-counter";
import { InvoiceCreatePage } from "./invoice-create-page";
import { invoiceService } from "../services/invoices";
import { toast } from "sonner";
import { format } from "date-fns";

type Invoice = {
  id: string;
  customer_id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  status: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customer?: {
    id: string;
    name: string;
    email: string | null;
  };
};

type PaymentLinkInfo = {
  url: string;
  expiresAt?: string;
};

const getStatusConfig = (status: string) => {
  const configs: Record<string, { color: string; icon: typeof CheckCircle }> = {
    draft: {
      color: "bg-gray-600/20 text-gray-400 border-gray-600/30",
      icon: FileText
    },
    sent: {
      color: "bg-blue-600/20 text-blue-400 border-blue-600/30",
      icon: Send
    },
    paid: {
      color: "bg-green-600/20 text-green-400 border-green-600/30",
      icon: CheckCircle
    },
    overdue: {
      color: "bg-red-600/20 text-red-400 border-red-600/30",
      icon: XCircle
    },
    cancelled: {
      color: "bg-orange-600/20 text-orange-400 border-orange-600/30",
      icon: XCircle
    },
  };
  return configs[status] || configs.draft;
};

const isOverdue = (dueDate: string, status: string) => {
  if (status === 'paid' || status === 'cancelled') return false;
  return new Date(dueDate) < new Date();
};

export function BillFlowInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [sendConfirmOpen, setSendConfirmOpen] = useState(false);
  const [sendingInvoiceId, setSendingInvoiceId] = useState<string | null>(null);
  const [sendLoading, setSendLoading] = useState(false);
  const [paymentLinkCache, setPaymentLinkCache] = useState<Record<string, PaymentLinkInfo>>({});
  const [linkLoading, setLinkLoading] = useState<{ id: string; action: 'copy' | 'open' } | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const data = await invoiceService.getAll();

      const invoicesWithOverdue = (data || []).map(invoice => ({
        ...invoice,
        status: isOverdue(invoice.due_date, invoice.status) ? 'overdue' : invoice.status
      }));

      setInvoices(invoicesWithOverdue);
    } catch (error) {
      console.error("Error loading invoices:", error);
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this invoice? This action cannot be undone.")) return;

    try {
      await invoiceService.delete(id);
      toast.success("Invoice deleted successfully");
      loadInvoices();
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Failed to delete invoice");
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await invoiceService.update(id, { status: newStatus });
      toast.success(`Invoice marked as ${newStatus}`);
      loadInvoices();
    } catch (error) {
      console.error("Error updating invoice status:", error);
      toast.error("Failed to update invoice status");
    }
  };

  const handleDuplicate = async (invoice: Invoice) => {
    try {
      const newInvoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
      const invoiceData = {
        customer_id: invoice.customer_id,
        invoice_number: newInvoiceNumber,
        invoice_date: new Date().toISOString().split('T')[0],
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'draft',
        subtotal: invoice.subtotal,
        tax_amount: invoice.tax_amount,
        total_amount: invoice.total_amount,
        notes: invoice.notes,
      };

      await invoiceService.create(invoiceData, []);
      toast.success("Invoice duplicated successfully");
      loadInvoices();
    } catch (error) {
      console.error("Error duplicating invoice:", error);
      toast.error("Failed to duplicate invoice");
    }
  };

  const showSendConfirmation = (invoiceId: string) => {
    setSendingInvoiceId(invoiceId);
    setSendConfirmOpen(true);
  };

  const handleConfirmSend = async () => {
    if (!sendingInvoiceId) return;

    try {
      setSendLoading(true);
      toast.info("Sending invoice...");

      await invoiceService.update(sendingInvoiceId, { status: 'sent' });

      toast.success("Invoice sent successfully!");
      setSendConfirmOpen(false);
      setSendingInvoiceId(null);
      loadInvoices();
    } catch (error) {
      console.error("Error sending invoice:", error);
      toast.error("Failed to send invoice");
    } finally {
      setSendLoading(false);
    }
  };

  const errorMessage = (error: unknown, fallback: string) => {
    if (!error) return fallback;
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message || fallback;
    if (typeof error === 'object') {
      const candidate = (error as any)?.message || (error as any)?.error;
      if (candidate) return String(candidate);
    }
    return fallback;
  };

  const copyPaymentLink = async (invoice: Invoice) => {
    try {
      setLinkLoading({ id: invoice.id, action: 'copy' });

      if (invoice.status === 'draft') {
        throw new Error('Send the invoice before sharing a payment link.');
      }

      const baseUrl = window.location.origin;
      const paymentUrl = `${baseUrl}/pay.html?id=${invoice.id}`;

      await navigator.clipboard.writeText(paymentUrl);
      toast.success("Payment link copied to clipboard");
    } catch (error) {
      toast.error(errorMessage(error, "Failed to copy payment link"));
    } finally {
      setLinkLoading(current => (current?.id === invoice.id ? null : current));
    }
  };

  const openPaymentPage = async (invoice: Invoice) => {
    try {
      setLinkLoading({ id: invoice.id, action: 'open' });

      if (invoice.status === 'draft') {
        throw new Error('Send the invoice before opening payment page.');
      }

      const baseUrl = window.location.origin;
      const paymentUrl = `${baseUrl}/pay.html?id=${invoice.id}`;

      window.open(paymentUrl, '_blank', 'noopener,noreferrer');
    } catch (error) {
      toast.error(errorMessage(error, "Failed to open payment page"));
    } finally {
      setLinkLoading(current => (current?.id === invoice.id ? null : current));
    }
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      toast.info('Generating PDF...');

      const items = invoice.items ? (typeof invoice.items === 'string' ? JSON.parse(invoice.items) : invoice.items) : [];

      const itemsHtml = items.length > 0 ? `
        <div style="margin-top: 30px;">
          <h3 style="border-bottom: 2px solid #2563EB; padding-bottom: 10px;">Invoice Items</h3>
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
              ${items.map((item: any) => `
                <tr>
                  <td style="padding: 8px; border: 1px solid #e2e8f0;">${item.description}</td>
                  <td style="padding: 8px; text-align: right; border: 1px solid #e2e8f0;">${item.quantity}</td>
                  <td style="padding: 8px; text-align: right; border: 1px solid #e2e8f0;">$${item.unit_price?.toFixed(2)}</td>
                  <td style="padding: 8px; text-align: right; border: 1px solid #e2e8f0;">$${item.amount?.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      ` : '';

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Invoice ${invoice.invoice_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { color: #2563EB; }
            .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .invoice-info { margin: 20px 0; }
            .label { color: #666; font-size: 12px; }
            .value { font-weight: bold; margin-bottom: 10px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>INVOICE</h1>
              <div class="value">${invoice.invoice_number}</div>
            </div>
            <div style="text-align: right;">
              <div class="label">Issue Date</div>
              <div class="value">${format(new Date(invoice.invoice_date), 'MMM dd, yyyy')}</div>
              <div class="label">Due Date</div>
              <div class="value">${format(new Date(invoice.due_date), 'MMM dd, yyyy')}</div>
            </div>
          </div>

          <div class="invoice-info">
            <div class="label">Bill To</div>
            <div class="value">${invoice.customer?.name || 'Unknown'}</div>
            ${invoice.customer?.email ? `<div style="color: #666;">${invoice.customer.email}</div>` : ''}
          </div>

          ${itemsHtml}

          <div style="margin-top: 40px; text-align: right;">
            <div style="font-size: 18px; margin: 10px 0;">
              <span>Subtotal: </span>
              <strong>$${invoice.subtotal.toFixed(2)}</strong>
            </div>
            <div style="font-size: 18px; margin: 10px 0;">
              <span>Tax: </span>
              <strong>$${invoice.tax_amount.toFixed(2)}</strong>
            </div>
            <div style="font-size: 24px; margin: 10px 0; color: #2563EB;">
              <span>Total: </span>
              <strong>$${invoice.total_amount.toFixed(2)}</strong>
            </div>
          </div>

          ${invoice.notes ? `
            <div style="margin-top: 40px; padding: 20px; background: #f9fafb; border-radius: 8px;">
              <div class="label">Notes</div>
              <div>${invoice.notes}</div>
            </div>
          ` : ''}
        </body>
        </html>
      `;

      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice-${invoice.invoice_number}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Invoice downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download invoice');
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const calculateStats = () => {
    const total = invoices.length;
    const paidAmount = invoices
      .filter(inv => inv.status === 'paid')
      .reduce((sum, inv) => sum + Number(inv.total_amount), 0);

    const pendingAmount = invoices
      .filter(inv => inv.status === 'sent')
      .reduce((sum, inv) => sum + Number(inv.total_amount), 0);

    const overdueAmount = invoices
      .filter(inv => inv.status === 'overdue')
      .reduce((sum, inv) => sum + Number(inv.total_amount), 0);

    const paidCount = invoices.filter(inv => inv.status === 'paid').length;
    const pendingCount = invoices.filter(inv => inv.status === 'sent').length;
    const overdueCount = invoices.filter(inv => inv.status === 'overdue').length;

    return {
      total,
      paidAmount,
      pendingAmount,
      overdueAmount,
      paidCount,
      pendingCount,
      overdueCount,
    };
  };

  const stats = calculateStats();

  if (showCreatePage) {
    return (
      <InvoiceCreatePage
        onCancel={() => setShowCreatePage(false)}
        onSuccess={() => {
          setShowCreatePage(false);
          loadInvoices();
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-1">Invoices</h1>
          <p className="text-sm text-muted-foreground">Track, manage, and follow up on customer invoices.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadInvoices}
            disabled={loading}
            className="border-border text-foreground hover:bg-accent"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={() => setShowCreatePage(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Invoice
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">Total Invoices</p>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-3xl font-bold text-foreground mb-1">
              <AnimatedCounter value={stats.total.toString()} />
            </p>
            <p className="text-xs text-muted-foreground">{invoices.length} shown</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">Paid</p>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
            <p className="text-3xl font-bold text-green-500 mb-1">
              $<AnimatedCounter value={stats.paidAmount.toFixed(1)} />
            </p>
            <p className="text-xs text-green-600">{((stats.paidCount / (stats.total || 1)) * 100).toFixed(0)}% of total</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">Pending</p>
              <TrendingDown className="h-4 w-4 text-blue-500" />
            </div>
            <p className="text-3xl font-bold text-blue-500 mb-1">
              $<AnimatedCounter value={stats.pendingAmount.toFixed(1)} />
            </p>
            <p className="text-xs text-blue-600">{stats.pendingCount} awaiting</p>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">Overdue</p>
              <TrendingDown className="h-4 w-4 text-red-500" />
            </div>
            <p className="text-3xl font-bold text-red-500 mb-1">
              $<AnimatedCounter value={stats.overdueAmount.toFixed(1)} />
            </p>
            <p className="text-xs text-red-600">{stats.overdueCount} invoices</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground text-lg font-medium">All Invoices</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search invoices"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64 bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-background border-border text-foreground">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status: All" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all" className="text-foreground">Status: All</SelectItem>
                  <SelectItem value="draft" className="text-foreground">Draft</SelectItem>
                  <SelectItem value="sent" className="text-foreground">Sent</SelectItem>
                  <SelectItem value="paid" className="text-foreground">Paid</SelectItem>
                  <SelectItem value="overdue" className="text-foreground">Overdue</SelectItem>
                  <SelectItem value="cancelled" className="text-foreground">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="border-border text-foreground hover:bg-accent">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12 text-muted-foreground">
              Loading invoices...
            </div>
          ) : filteredInvoices.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {searchTerm || statusFilter !== "all" ? "No invoices found" : "No invoices yet. Create your first invoice!"}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Invoice #</TableHead>
                  <TableHead className="text-muted-foreground">Customer</TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">Due Date</TableHead>
                  <TableHead className="text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice, index) => {
                  const statusConfig = getStatusConfig(invoice.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <TableRow
                      key={invoice.id}
                      className="border-border hover:bg-accent/50 transition-colors"
                    >
                      <TableCell className="font-medium text-foreground">{invoice.invoice_number}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-foreground font-medium">{invoice.customer?.name || "Unknown"}</p>
                          {invoice.customer?.email && (
                            <p className="text-xs text-muted-foreground">{invoice.customer.email}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(invoice.invoice_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(invoice.due_date), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell className="text-foreground font-medium">
                        ${Number(invoice.total_amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusConfig.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {invoice.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border w-48">
                            <DropdownMenuItem
                              className="text-foreground hover:bg-accent cursor-pointer"
                              onClick={() => setViewingInvoice(invoice)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-foreground hover:bg-accent cursor-pointer"
                              onClick={() => setEditingInvoice(invoice)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-foreground hover:bg-accent cursor-pointer"
                              onClick={() => handleDuplicate(invoice)}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border" />
                            {invoice.status === 'draft' && (
                              <DropdownMenuItem
                                className="text-foreground hover:bg-accent cursor-pointer"
                                onClick={() => showSendConfirmation(invoice.id)}
                              >
                                <Send className="mr-2 h-4 w-4" />
                                Send Invoice
                              </DropdownMenuItem>
                            )}
                            {(invoice.status === 'sent' || invoice.status === 'overdue') && (
                              <DropdownMenuItem
                                className="text-foreground hover:bg-accent cursor-pointer"
                                onClick={() => handleUpdateStatus(invoice.id, 'paid')}
                              >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Mark as Paid
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => copyPaymentLink(invoice)}
                              disabled={linkLoading?.id === invoice.id || invoice.status === 'draft'}
                              className="text-foreground hover:bg-accent cursor-pointer"
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              {linkLoading?.id === invoice.id && linkLoading?.action === 'copy' ? 'Preparing...' : 'Copy Payment Link'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => openPaymentPage(invoice)}
                              disabled={linkLoading?.id === invoice.id || invoice.status === 'draft'}
                              className="text-foreground hover:bg-accent cursor-pointer"
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Open Payment Page
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-foreground hover:bg-accent cursor-pointer"
                              onClick={() => handleDownloadPDF(invoice)}
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem
                              className="text-red-400 hover:bg-red-950/30 cursor-pointer"
                              onClick={() => handleDelete(invoice.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={sendConfirmOpen} onOpenChange={setSendConfirmOpen}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Send Invoice</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to send this invoice? The invoice status will be updated to "Sent" and the customer will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSendConfirmOpen(false)} disabled={sendLoading} className="border-border text-foreground">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSend}
              disabled={sendLoading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {sendLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Invoice'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {viewingInvoice && (
        <AlertDialog open={!!viewingInvoice} onOpenChange={() => setViewingInvoice(null)}>
          <AlertDialogContent className="bg-card border-border max-w-3xl max-h-[80vh] overflow-y-auto">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground text-2xl">Invoice {viewingInvoice.invoice_number}</AlertDialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge className={getStatusConfig(viewingInvoice.status).color}>
                  {viewingInvoice.status}
                </Badge>
              </div>
            </AlertDialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium text-foreground">{viewingInvoice.customer?.name || 'Unknown'}</p>
                  {viewingInvoice.customer?.email && (
                    <p className="text-sm text-muted-foreground">{viewingInvoice.customer.email}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Issue Date</p>
                  <p className="font-medium text-foreground">{format(new Date(viewingInvoice.invoice_date), 'MMM dd, yyyy')}</p>
                  <p className="text-sm text-muted-foreground mt-2">Due Date</p>
                  <p className="font-medium text-foreground">{format(new Date(viewingInvoice.due_date), 'MMM dd, yyyy')}</p>
                </div>
              </div>

              {viewingInvoice.items && (
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Invoice Items</h3>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-accent">
                        <tr>
                          <th className="text-left p-3 text-sm font-medium text-muted-foreground">Description</th>
                          <th className="text-center p-3 text-sm font-medium text-muted-foreground">Qty</th>
                          <th className="text-right p-3 text-sm font-medium text-muted-foreground">Rate</th>
                          <th className="text-right p-3 text-sm font-medium text-muted-foreground">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(typeof viewingInvoice.items === 'string' ? JSON.parse(viewingInvoice.items) : viewingInvoice.items).map((item: any, index: number) => (
                          <tr key={index} className="border-t border-border">
                            <td className="p-3 text-foreground">{item.description}</td>
                            <td className="p-3 text-center text-foreground">{item.quantity}</td>
                            <td className="p-3 text-right text-foreground">${item.unit_price?.toFixed(2)}</td>
                            <td className="p-3 text-right font-medium text-foreground">${item.amount?.toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="space-y-2 pt-4 border-t border-border">
                <div className="flex justify-between text-foreground">
                  <span>Subtotal</span>
                  <span className="font-medium">${viewingInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-foreground">
                  <span>Tax</span>
                  <span className="font-medium">${viewingInvoice.tax_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-foreground pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-indigo-400">${viewingInvoice.total_amount.toFixed(2)}</span>
                </div>
              </div>

              {viewingInvoice.notes && (
                <div className="bg-accent p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Notes</p>
                  <p className="text-foreground">{viewingInvoice.notes}</p>
                </div>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-border text-foreground">Close</AlertDialogCancel>
              <Button onClick={() => handleDownloadPDF(viewingInvoice)} className="bg-indigo-600 hover:bg-indigo-700">
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {editingInvoice && (
        <AlertDialog open={!!editingInvoice} onOpenChange={() => setEditingInvoice(null)}>
          <AlertDialogContent className="bg-card border-border max-w-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">Edit Invoice</AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Editing: {editingInvoice.invoice_number}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-4">
              <p className="text-center text-muted-foreground py-8">
                Full invoice editing interface coming soon. For now, you can use the duplicate feature to create a modified copy.
              </p>
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-border text-foreground">Close</AlertDialogCancel>
              <Button onClick={() => {
                handleDuplicate(editingInvoice);
                setEditingInvoice(null);
              }} className="bg-indigo-600 hover:bg-indigo-700">
                Duplicate Instead
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
