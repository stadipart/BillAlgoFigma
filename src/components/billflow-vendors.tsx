import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback } from "./ui/avatar";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Label } from "./ui/label";
import { Search, Filter, Download, MoreHorizontal, Mail, Phone, Eye, Edit, Trash2, TrendingUp, Plus } from "lucide-react";
import { motion } from "motion/react";
import { AnimatedCounter } from "./animated-counter";
import { vendorService } from "../services/vendors";
import { toast } from "sonner";

type Vendor = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  tax_id: string | null;
  payment_terms: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

type VendorFormData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  tax_id: string;
  payment_terms: string;
  status: string;
};

const getStatusColor = (status: string) => {
  return status === "active"
    ? "bg-green-600/20 text-green-400 border-green-600/30"
    : "bg-gray-600/20 text-gray-400 border-gray-600/30";
};

export function BillFlowVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState<VendorFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    tax_id: "",
    payment_terms: "",
    status: "active",
  });

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const data = await vendorService.getAll();
      setVendors(data || []);
    } catch (error) {
      console.error("Error loading vendors:", error);
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingVendor) {
        await vendorService.update(editingVendor.id, formData);
        toast.success("Vendor updated successfully");
      } else {
        await vendorService.create(formData);
        toast.success("Vendor created successfully");
      }
      setDialogOpen(false);
      resetForm();
      loadVendors();
    } catch (error) {
      console.error("Error saving vendor:", error);
      toast.error("Failed to save vendor");
    }
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name,
      email: vendor.email || "",
      phone: vendor.phone || "",
      address: vendor.address || "",
      tax_id: vendor.tax_id || "",
      payment_terms: vendor.payment_terms || "",
      status: vendor.status,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vendor?")) return;
    try {
      await vendorService.delete(id);
      toast.success("Vendor deleted successfully");
      loadVendors();
    } catch (error) {
      console.error("Error deleting vendor:", error);
      toast.error("Failed to delete vendor");
    }
  };

  const resetForm = () => {
    setEditingVendor(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      tax_id: "",
      payment_terms: "",
      status: "active",
    });
  };

  const filteredVendors = vendors.filter((vendor) =>
    vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vendor.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { label: "Total Vendors", value: vendors.length.toString(), color: "text-foreground", icon: TrendingUp, change: "+4 this month", changeColor: "text-green-500" },
    { label: "Active", value: vendors.filter(v => v.status === "active").length.toString(), color: "text-green-400", icon: TrendingUp, change: "87.5%", changeColor: "text-green-500" },
    { label: "Total Paid (YTD)", value: "$125,340", color: "text-blue-400", icon: TrendingUp, change: "+22.3%", changeColor: "text-green-500" },
    { label: "Avg. Payment", value: "$3,918", color: "text-purple-400", icon: TrendingUp, change: "Per vendor", changeColor: "text-muted-foreground" },
  ];
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl text-foreground mb-1">Vendors</h1>
          <p className="text-sm text-muted-foreground">Manage your vendor relationships</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Vendor
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">{editingVendor ? "Edit Vendor" : "Add New Vendor"}</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {editingVendor ? "Update vendor information" : "Create a new vendor record"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-foreground">Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-muted/50 border-border text-foreground"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-muted/50 border-border text-foreground"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone" className="text-foreground">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="bg-muted/50 border-border text-foreground"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address" className="text-foreground">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="bg-muted/50 border-border text-foreground"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tax_id" className="text-foreground">Tax ID</Label>
                  <Input
                    id="tax_id"
                    value={formData.tax_id}
                    onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                    className="bg-muted/50 border-border text-foreground"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="payment_terms" className="text-foreground">Payment Terms</Label>
                  <Input
                    id="payment_terms"
                    value={formData.payment_terms}
                    onChange={(e) => setFormData({ ...formData, payment_terms: e.target.value })}
                    placeholder="e.g., Net 30"
                    className="bg-muted/50 border-border text-foreground"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  {editingVendor ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="border-border bg-gradient-to-br from-card to-card/50 hover:from-accent hover:to-card transition-all hover:shadow-lg hover:shadow-indigo-500/10 group">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                      <p className={`text-2xl font-semibold ${stat.color}`}>
                        <AnimatedCounter value={stat.value} />
                      </p>
                    </div>
                    <Icon className="h-5 w-5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                  </div>
                  <p className={`text-xs ${stat.changeColor}`}>{stat.change}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Vendors Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">All Vendors</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    placeholder="Search vendors..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9 w-64 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <Button variant="outline" size="icon" className="border-border text-muted-foreground hover:text-foreground hover:bg-accent">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="border-border text-muted-foreground hover:text-foreground hover:bg-accent">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Vendor</TableHead>
                  <TableHead className="text-muted-foreground">Contact</TableHead>
                  <TableHead className="text-muted-foreground">Total Bills</TableHead>
                  <TableHead className="text-muted-foreground">Total Paid</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Loading vendors...
                    </TableCell>
                  </TableRow>
                ) : filteredVendors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      No vendors found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVendors.map((vendor, index) => (
                  <motion.tr
                    key={vendor.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                    className="border-border hover:bg-accent transition-colors group"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 bg-indigo-600 ring-2 ring-border group-hover:ring-indigo-500 transition-all">
                          <AvatarFallback className="bg-indigo-600 text-white text-xs">
                            {vendor.name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{vendor.name}</p>
                          <p className="text-xs text-muted-foreground">{vendor.tax_id || "No tax ID"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {vendor.email && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {vendor.email}
                          </div>
                        )}
                        {vendor.phone && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Phone className="h-3 w-3" />
                            {vendor.phone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-foreground">0</TableCell>
                    <TableCell className="text-foreground font-medium">$0.00</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(vendor.status)}>
                        {vendor.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border">
                          <DropdownMenuItem className="text-foreground hover:bg-accent cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEdit(vendor)}
                            className="text-foreground hover:bg-accent cursor-pointer"
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Vendor
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-foreground hover:bg-accent cursor-pointer">
                            <Mail className="mr-2 h-4 w-4" />
                            Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(vendor.id)}
                            className="text-red-400 hover:bg-red-950/30 cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}