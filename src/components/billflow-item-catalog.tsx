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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Search, Filter, Plus, MoreHorizontal, Edit, Trash2, Package, TrendingUp, Loader2, AlertCircle } from "lucide-react";
import { motion } from "motion/react";
import { AnimatedCounter } from "./animated-counter";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { itemService } from "../services/items";
import type { Database } from "../types/database";
import { Alert, AlertDescription } from "./ui/alert";

type Item = Database['public']['Tables']['items']['Row'];

const stats = [
  { label: "Total Items", value: "0", color: "text-foreground", icon: Package, iconBg: "bg-blue-600/20", iconColor: "text-blue-400", change: "Loading...", changeColor: "text-muted-foreground" },
  { label: "Active", value: "0", color: "text-green-600", icon: TrendingUp, iconBg: "bg-green-600/20", iconColor: "text-green-400", change: "0%", changeColor: "text-muted-foreground" },
  { label: "Categories", value: "0", color: "text-blue-600", icon: Filter, iconBg: "bg-cyan-600/20", iconColor: "text-cyan-400", change: "Unique", changeColor: "text-muted-foreground" },
  { label: "Avg. Price", value: "$0", color: "text-emerald-600", icon: TrendingUp, iconBg: "bg-emerald-600/20", iconColor: "text-emerald-400", change: "Per item", changeColor: "text-muted-foreground" },
];

export function BillFlowItemCatalog() {
  const [items, setItems] = useState<Item[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    unit_price: "",
    unit: "pc",
    sku: "",
    tax_rate: "0",
  });

  const [computedStats, setComputedStats] = useState(stats);

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    const filtered = items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredItems(filtered);
  }, [searchQuery, items]);

  useEffect(() => {
    if (items.length > 0) {
      const activeItems = items.filter(i => i.status === 'active');
      const categories = new Set(items.map(i => i.category).filter(Boolean));
      const avgPrice = items.reduce((sum, i) => sum + Number(i.unit_price), 0) / items.length;

      setComputedStats([
        { label: "Total Items", value: items.length.toString(), color: "text-foreground", icon: Package, iconBg: "bg-blue-600/20", iconColor: "text-blue-400", change: `${activeItems.length} active`, changeColor: "text-green-600" },
        { label: "Active", value: activeItems.length.toString(), color: "text-green-600", icon: TrendingUp, iconBg: "bg-green-600/20", iconColor: "text-green-400", change: `${Math.round((activeItems.length / items.length) * 100)}%`, changeColor: "text-muted-foreground" },
        { label: "Categories", value: categories.size.toString(), color: "text-blue-600", icon: Filter, iconBg: "bg-cyan-600/20", iconColor: "text-cyan-400", change: "Unique", changeColor: "text-muted-foreground" },
        { label: "Avg. Price", value: `$${avgPrice.toFixed(2)}`, color: "text-emerald-600", icon: TrendingUp, iconBg: "bg-emerald-600/20", iconColor: "text-emerald-400", change: "Per item", changeColor: "text-muted-foreground" },
      ]);
    }
  }, [items]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await itemService.getAll();
      setItems(data || []);
    } catch (error: any) {
      console.error('Error loading items:', error);
      toast.error('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Item name is required");
      return false;
    }
    if (!formData.unit_price || Number(formData.unit_price) <= 0) {
      setError("Valid price is required");
      return false;
    }
    if (!formData.unit.trim()) {
      setError("Unit is required");
      return false;
    }
    setError("");
    return true;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const newItem = await itemService.create({
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        category: formData.category || null,
        unit_price: Number(formData.unit_price),
        unit: formData.unit,
        sku: formData.sku.trim() || null,
        tax_rate: Number(formData.tax_rate),
        status: 'active',
      });

      setItems([newItem, ...items]);
      setDialogOpen(false);
      resetForm();
      toast.success("Item created successfully!");
    } catch (error: any) {
      console.error('Error creating item:', error);
      toast.error(error.message || 'Failed to create item');
      setError(error.message || 'Failed to create item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || "",
      category: item.category || "",
      unit_price: item.unit_price.toString(),
      unit: item.unit,
      sku: item.sku || "",
      tax_rate: item.tax_rate.toString(),
    });
    setDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!validateForm() || !editingItem) return;

    setSubmitting(true);
    try {
      const updated = await itemService.update(editingItem.id, {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        category: formData.category || null,
        unit_price: Number(formData.unit_price),
        unit: formData.unit,
        sku: formData.sku.trim() || null,
        tax_rate: Number(formData.tax_rate),
      });

      setItems(items.map(item => item.id === editingItem.id ? updated : item));
      setDialogOpen(false);
      setEditingItem(null);
      resetForm();
      toast.success("Item updated successfully!");
    } catch (error: any) {
      console.error('Error updating item:', error);
      toast.error(error.message || 'Failed to update item');
      setError(error.message || 'Failed to update item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await itemService.delete(id);
      setItems(items.filter(item => item.id !== id));
      toast.success("Item deleted successfully!");
    } catch (error: any) {
      console.error('Error deleting item:', error);
      toast.error(error.message || 'Failed to delete item');
    }
  };

  const handleToggleStatus = async (item: Item) => {
    try {
      const newStatus = item.status === 'active' ? 'inactive' : 'active';
      const updated = await itemService.update(item.id, { status: newStatus });
      setItems(items.map(i => i.id === item.id ? updated : i));
      toast.success(`Item ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    } catch (error: any) {
      console.error('Error toggling status:', error);
      toast.error('Failed to update status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      category: "",
      unit_price: "",
      unit: "pc",
      sku: "",
      tax_rate: "0",
    });
    setEditingItem(null);
    setError("");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading items...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Item Catalog</h1>
          <p className="text-muted-foreground">Manage your products and services</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Item" : "Add New Item"}
              </DialogTitle>
              <DialogDescription>
                {editingItem ? "Update item details" : "Create a new item in your catalog"}
              </DialogDescription>
            </DialogHeader>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Item Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Professional Consulting"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="CONS-001"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the item"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Services">Services</SelectItem>
                      <SelectItem value="Software">Software</SelectItem>
                      <SelectItem value="Subscription">Subscription</SelectItem>
                      <SelectItem value="Hardware">Hardware</SelectItem>
                      <SelectItem value="Consulting">Consulting</SelectItem>
                      <SelectItem value="Products">Products</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Unit Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.unit_price}
                    onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                    placeholder="150.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pc">Piece</SelectItem>
                      <SelectItem value="hour">Hour</SelectItem>
                      <SelectItem value="day">Day</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                      <SelectItem value="year">Year</SelectItem>
                      <SelectItem value="license">License</SelectItem>
                      <SelectItem value="package">Package</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                <Input
                  id="tax_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.tax_rate}
                  onChange={(e) => setFormData({ ...formData, tax_rate: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDialogOpen(false);
                  resetForm();
                }}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={editingItem ? handleUpdate : handleCreate}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {editingItem ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingItem ? 'Update Item' : 'Create Item'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {computedStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="border-border bg-gradient-to-br from-card to-card/50 hover:from-accent hover:to-card transition-all hover:shadow-lg group">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm text-muted-foreground">{stat.label}</CardTitle>
                  <div className={`rounded-lg p-2 ${stat.iconBg} group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl ${stat.color} mb-1`}>
                    <AnimatedCounter value={stat.value} />
                  </div>
                  <p className={`text-xs ${stat.changeColor}`}>{stat.change}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Items Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">All Items</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 w-64"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? 'No items found matching your search' : 'No items yet. Add your first item to get started.'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Tax Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 * index }}
                      className="group"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-blue-600/20 flex items-center justify-center group-hover:bg-blue-600/30 transition-colors">
                            <Package className="h-5 w-5 text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            {item.sku && <p className="text-xs text-muted-foreground">{item.sku}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{item.category || '-'}</TableCell>
                      <TableCell className="font-medium">${Number(item.unit_price).toFixed(2)}</TableCell>
                      <TableCell className="capitalize">{item.unit}</TableCell>
                      <TableCell>{Number(item.tax_rate).toFixed(2)}%</TableCell>
                      <TableCell>
                        <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                          {item.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="opacity-50 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Item
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(item)}>
                              {item.status === 'active' ? 'Deactivate' : 'Activate'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(item.id, item.name)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
