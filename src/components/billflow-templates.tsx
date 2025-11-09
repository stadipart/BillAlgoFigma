import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
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
} from "./ui/dropdown-menu";
import { Search, Filter, Plus, MoreHorizontal, Edit, Trash2, Copy, FileText, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { AnimatedCounter } from "./animated-counter";
import { useState } from "react";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  type: "Invoice" | "Bill";
  description: string;
  category: string;
  usageCount: number;
  lastUsed: string;
  items: string[];
  terms: string;
  notes: string;
}

const initialTemplates: Template[] = [
  {
    id: "TMPL-001",
    name: "Monthly Consulting Invoice",
    type: "Invoice",
    description: "Standard monthly consulting services invoice",
    category: "Consulting",
    usageCount: 24,
    lastUsed: "Oct 25, 2024",
    items: ["Professional Consulting Hour"],
    terms: "Net 30",
    notes: "Thank you for your business",
  },
  {
    id: "TMPL-002",
    name: "Software License Bill",
    type: "Bill",
    description: "Annual software license renewal",
    category: "Software",
    usageCount: 12,
    lastUsed: "Oct 20, 2024",
    items: ["Software License - Pro"],
    terms: "Due on receipt",
    notes: "Please process payment within 7 days",
  },
  {
    id: "TMPL-003",
    name: "Marketing Services Package",
    type: "Invoice",
    description: "Complete marketing services package",
    category: "Marketing",
    usageCount: 8,
    lastUsed: "Oct 15, 2024",
    items: ["Marketing Package - Basic"],
    terms: "50% upfront, 50% on completion",
    notes: "Includes social media and content marketing",
  },
];

const stats = [
  { label: "Total Templates", value: "15", color: "text-white", change: "+3 this month", changeColor: "text-green-500" },
  { label: "Invoice Templates", value: "9", color: "text-blue-400", change: "60%", changeColor: "text-blue-500" },
  { label: "Bill Templates", value: "6", color: "text-purple-400", change: "40%", changeColor: "text-purple-500" },
  { label: "Most Used", value: "24x", color: "text-green-400", change: "Consulting", changeColor: "text-gray-500" },
];

export function BillFlowTemplates() {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "Invoice" as "Invoice" | "Bill",
    description: "",
    category: "",
    items: "",
    terms: "",
    notes: "",
  });

  const handleCreate = () => {
    const newTemplate: Template = {
      id: `TMPL-${String(templates.length + 1).padStart(3, "0")}`,
      name: formData.name,
      type: formData.type,
      description: formData.description,
      category: formData.category,
      usageCount: 0,
      lastUsed: "Never",
      items: formData.items.split(",").map(i => i.trim()),
      terms: formData.terms,
      notes: formData.notes,
    };
    setTemplates([...templates, newTemplate]);
    setDialogOpen(false);
    resetForm();
    toast.success("Template created successfully!");
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      description: template.description,
      category: template.category,
      items: template.items.join(", "),
      terms: template.terms,
      notes: template.notes,
    });
    setDialogOpen(true);
  };

  const handleUpdate = () => {
    if (editingTemplate) {
      setTemplates(
        templates.map((template) =>
          template.id === editingTemplate.id
            ? {
                ...template,
                name: formData.name,
                type: formData.type,
                description: formData.description,
                category: formData.category,
                items: formData.items.split(",").map(i => i.trim()),
                terms: formData.terms,
                notes: formData.notes,
              }
            : template
        )
      );
      setDialogOpen(false);
      setEditingTemplate(null);
      resetForm();
      toast.success("Template updated successfully!");
    }
  };

  const handleDelete = (id: string) => {
    setTemplates(templates.filter((template) => template.id !== id));
    toast.success("Template deleted successfully!");
  };

  const handleDuplicate = (template: Template) => {
    const newTemplate: Template = {
      ...template,
      id: `TMPL-${String(templates.length + 1).padStart(3, "0")}`,
      name: `${template.name} (Copy)`,
      usageCount: 0,
      lastUsed: "Never",
    };
    setTemplates([...templates, newTemplate]);
    toast.success("Template duplicated successfully!");
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "Invoice",
      description: "",
      category: "",
      items: "",
      terms: "",
      notes: "",
    });
    setEditingTemplate(null);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl text-foreground mb-2">Templates</h1>
          <p className="text-muted-foreground">Create reusable invoice and bill templates</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0f1421] border-gray-800 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {editingTemplate ? "Edit Template" : "Create New Template"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {editingTemplate ? "Update template details" : "Create a reusable template for invoices or bills"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Template Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-muted/50 border-gray-800 text-white"
                    placeholder="Monthly Consulting Invoice"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-foreground">Type *</Label>
                  <Select value={formData.type} onValueChange={(value: "Invoice" | "Bill") => setFormData({ ...formData, type: value })}>
                    <SelectTrigger className="bg-muted/50 border-gray-800 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f1421] border-gray-800">
                      <SelectItem value="Invoice">Invoice</SelectItem>
                      <SelectItem value="Bill">Bill</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-muted/50 border-gray-800 text-white"
                  placeholder="Brief description of the template"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-foreground">Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="bg-muted/50 border-gray-800 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0f1421] border-gray-800">
                    <SelectItem value="Consulting">Consulting</SelectItem>
                    <SelectItem value="Software">Software</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Services">Services</SelectItem>
                    <SelectItem value="Subscription">Subscription</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="items" className="text-foreground">Default Items</Label>
                <Input
                  id="items"
                  value={formData.items}
                  onChange={(e) => setFormData({ ...formData, items: e.target.value })}
                  className="bg-muted/50 border-gray-800 text-white"
                  placeholder="Item 1, Item 2, Item 3"
                />
                <p className="text-xs text-gray-500">Separate items with commas</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="terms" className="text-foreground">Payment Terms</Label>
                <Input
                  id="terms"
                  value={formData.terms}
                  onChange={(e) => setFormData({ ...formData, terms: e.target.value })}
                  className="bg-muted/50 border-gray-800 text-white"
                  placeholder="Net 30"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-foreground">Default Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="bg-muted/50 border-gray-800 text-white"
                  placeholder="Thank you for your business"
                  rows={3}
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
                className="border-border text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                onClick={editingTemplate ? handleUpdate : handleCreate}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {editingTemplate ? "Update Template" : "Create Template"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="border-border bg-gradient-to-br from-card to-card/50 hover:from-accent hover:to-card hover:shadow-lg hover:shadow-indigo-500/10 transition-all group">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                    <p className={`text-2xl font-semibold ${stat.color}`}>
                      <AnimatedCounter value={stat.value} />
                    </p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" />
                </div>
                <p className={`text-xs ${stat.changeColor}`}>{stat.change}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 + index * 0.1 }}
          >
            <Card className="border-border bg-card hover:bg-[#141925] transition-all cursor-pointer group h-full">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-3 rounded-lg ${template.type === "Invoice" ? "bg-blue-600/20" : "bg-purple-600/20"}`}>
                    <FileText className={`h-6 w-6 ${template.type === "Invoice" ? "text-blue-400" : "text-purple-400"}`} />
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-[#0f1421] border-gray-800">
                      <DropdownMenuItem onClick={() => handleEdit(template)} className="text-gray-300 hover:bg-gray-800 cursor-pointer">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(template)} className="text-gray-300 hover:bg-gray-800 cursor-pointer">
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(template.id)} className="text-red-400 hover:bg-red-950/30 cursor-pointer">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div>
                  <CardTitle className="text-white text-lg mb-1">{template.name}</CardTitle>
                  <p className="text-sm text-gray-400 mb-3">{template.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className={template.type === "Invoice" ? "bg-blue-600/20 text-blue-400 border-blue-600/30" : "bg-purple-600/20 text-purple-400 border-purple-600/30"}>
                      {template.type}
                    </Badge>
                    <Badge variant="secondary" className="bg-gray-600/20 text-gray-400 border-gray-600/30">
                      {template.category}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Usage:</span>
                    <span className="text-white font-medium">{template.usageCount}x</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Last used:</span>
                    <span className="text-foreground">{template.lastUsed}</span>
                  </div>
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white mt-4">
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
