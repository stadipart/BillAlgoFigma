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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Switch } from "./ui/switch";
import { Search, Filter, Plus, MoreHorizontal, Edit, Trash2, Pause, Play, Calendar, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { AnimatedCounter } from "./animated-counter";
import { useState } from "react";
import { toast } from "sonner";

interface RecurringSchedule {
  id: string;
  name: string;
  type: "Invoice" | "Bill";
  customerOrVendor: string;
  amount: string;
  frequency: string;
  startDate: string;
  nextDate: string;
  endDate: string;
  status: "Active" | "Paused" | "Completed";
  occurrences: number;
  totalGenerated: number;
}

const initialSchedules: RecurringSchedule[] = [
  {
    id: "REC-001",
    name: "Monthly Cloud Services",
    type: "Bill",
    customerOrVendor: "Cloud Services Ltd",
    amount: "$890.00",
    frequency: "Monthly",
    startDate: "Jan 1, 2024",
    nextDate: "Nov 1, 2024",
    endDate: "Dec 31, 2024",
    status: "Active",
    occurrences: 10,
    totalGenerated: 10,
  },
  {
    id: "REC-002",
    name: "Quarterly Consulting Invoice",
    type: "Invoice",
    customerOrVendor: "Acme Corporation",
    amount: "$12,500.00",
    frequency: "Quarterly",
    startDate: "Jan 1, 2024",
    nextDate: "Jan 1, 2025",
    endDate: "Ongoing",
    status: "Active",
    occurrences: 3,
    totalGenerated: 3,
  },
  {
    id: "REC-003",
    name: "Annual Software License",
    type: "Bill",
    customerOrVendor: "Software Licensing Corp",
    amount: "$5,400.00",
    frequency: "Yearly",
    startDate: "Jan 1, 2024",
    nextDate: "Jan 1, 2025",
    endDate: "Ongoing",
    status: "Active",
    occurrences: 1,
    totalGenerated: 1,
  },
  {
    id: "REC-004",
    name: "Weekly Support Services",
    type: "Invoice",
    customerOrVendor: "TechStart Inc",
    amount: "$450.00",
    frequency: "Weekly",
    startDate: "Oct 1, 2024",
    nextDate: "Oct 29, 2024",
    endDate: "Dec 31, 2024",
    status: "Paused",
    occurrences: 4,
    totalGenerated: 4,
  },
];

const stats = [
  { label: "Active Schedules", value: "12", color: "text-green-400", change: "Running", changeColor: "text-green-500" },
  { label: "Paused", value: "3", color: "text-orange-400", change: "Temporarily stopped", changeColor: "text-orange-500" },
  { label: "Monthly Revenue", value: "$28,490", color: "text-blue-400", change: "From recurring", changeColor: "text-blue-500" },
  { label: "Next 30 Days", value: "18", color: "text-purple-400", change: "Upcoming", changeColor: "text-purple-500" },
];

export function BillFlowRecurring() {
  const [schedules, setSchedules] = useState<RecurringSchedule[]>(initialSchedules);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<RecurringSchedule | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    type: "Invoice" as "Invoice" | "Bill",
    customerOrVendor: "",
    amount: "",
    frequency: "",
    startDate: "",
    endDate: "",
  });

  const handleCreate = () => {
    const newSchedule: RecurringSchedule = {
      id: `REC-${String(schedules.length + 1).padStart(3, "0")}`,
      name: formData.name,
      type: formData.type,
      customerOrVendor: formData.customerOrVendor,
      amount: `$${formData.amount}`,
      frequency: formData.frequency,
      startDate: formData.startDate,
      nextDate: formData.startDate,
      endDate: formData.endDate || "Ongoing",
      status: "Active",
      occurrences: 0,
      totalGenerated: 0,
    };
    setSchedules([...schedules, newSchedule]);
    setDialogOpen(false);
    resetForm();
    toast.success("Recurring schedule created successfully!");
  };

  const handleEdit = (schedule: RecurringSchedule) => {
    setEditingSchedule(schedule);
    setFormData({
      name: schedule.name,
      type: schedule.type,
      customerOrVendor: schedule.customerOrVendor,
      amount: schedule.amount.replace("$", "").replace(",", ""),
      frequency: schedule.frequency,
      startDate: schedule.startDate,
      endDate: schedule.endDate === "Ongoing" ? "" : schedule.endDate,
    });
    setDialogOpen(true);
  };

  const handleUpdate = () => {
    if (editingSchedule) {
      setSchedules(
        schedules.map((schedule) =>
          schedule.id === editingSchedule.id
            ? {
                ...schedule,
                name: formData.name,
                type: formData.type,
                customerOrVendor: formData.customerOrVendor,
                amount: `$${formData.amount}`,
                frequency: formData.frequency,
                startDate: formData.startDate,
                endDate: formData.endDate || "Ongoing",
              }
            : schedule
        )
      );
      setDialogOpen(false);
      setEditingSchedule(null);
      resetForm();
      toast.success("Recurring schedule updated successfully!");
    }
  };

  const handleDelete = (id: string) => {
    setSchedules(schedules.filter((schedule) => schedule.id !== id));
    toast.success("Recurring schedule deleted successfully!");
  };

  const handleToggleStatus = (id: string) => {
    setSchedules(
      schedules.map((schedule) =>
        schedule.id === id
          ? {
              ...schedule,
              status: schedule.status === "Active" ? "Paused" : "Active",
            }
          : schedule
      )
    );
    const schedule = schedules.find(s => s.id === id);
    toast.success(`Schedule ${schedule?.status === "Active" ? "paused" : "activated"} successfully!`);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      type: "Invoice",
      customerOrVendor: "",
      amount: "",
      frequency: "",
      startDate: "",
      endDate: "",
    });
    setEditingSchedule(null);
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
          <h1 className="text-3xl text-foreground mb-2">Recurring Schedules</h1>
          <p className="text-muted-foreground">Automate recurring invoices and bills</p>
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
              Create Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#0f1421] border-gray-800 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {editingSchedule ? "Edit Recurring Schedule" : "Create Recurring Schedule"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                {editingSchedule ? "Update schedule details" : "Set up automatic recurring invoices or bills"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Schedule Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-muted/50 border-gray-800 text-white"
                    placeholder="Monthly Cloud Services"
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
                <Label htmlFor="customerOrVendor" className="text-foreground">
                  {formData.type === "Invoice" ? "Customer" : "Vendor"} *
                </Label>
                <Input
                  id="customerOrVendor"
                  value={formData.customerOrVendor}
                  onChange={(e) => setFormData({ ...formData, customerOrVendor: e.target.value })}
                  className="bg-muted/50 border-gray-800 text-white"
                  placeholder={formData.type === "Invoice" ? "Select customer" : "Select vendor"}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-foreground">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className="bg-muted/50 border-gray-800 text-white"
                    placeholder="890.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency" className="text-foreground">Frequency *</Label>
                  <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
                    <SelectTrigger className="bg-muted/50 border-gray-800 text-white">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f1421] border-gray-800">
                      <SelectItem value="Daily">Daily</SelectItem>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                      <SelectItem value="Bi-weekly">Bi-weekly</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Quarterly">Quarterly</SelectItem>
                      <SelectItem value="Semi-annually">Semi-annually</SelectItem>
                      <SelectItem value="Yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-foreground">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="bg-muted/50 border-gray-800 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-foreground">End Date (Optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="bg-muted/50 border-gray-800 text-white"
                  />
                  <p className="text-xs text-gray-500">Leave empty for ongoing</p>
                </div>
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
                onClick={editingSchedule ? handleUpdate : handleCreate}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {editingSchedule ? "Update Schedule" : "Create Schedule"}
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

      {/* Schedules Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">All Schedules</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    placeholder="Search schedules..."
                    className="pl-9 w-64 bg-gray-900/50 border-gray-800 text-white placeholder:text-gray-500 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <Button variant="outline" size="icon" className="border-border text-gray-400 hover:text-white hover:bg-gray-800">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Schedule</TableHead>
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground">Frequency</TableHead>
                  <TableHead className="text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-muted-foreground">Next Date</TableHead>
                  <TableHead className="text-muted-foreground">Generated</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule, index) => (
                  <motion.tr
                    key={schedule.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                    className="border-border hover:bg-gray-800/30 transition-colors group"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-indigo-600/20 flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-indigo-400" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{schedule.name}</p>
                          <p className="text-xs text-gray-500">{schedule.customerOrVendor}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={schedule.type === "Invoice" ? "bg-blue-600/20 text-blue-400 border-blue-600/30" : "bg-purple-600/20 text-purple-400 border-purple-600/30"}>
                        {schedule.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-foreground">{schedule.frequency}</TableCell>
                    <TableCell className="text-white font-medium">{schedule.amount}</TableCell>
                    <TableCell className="text-muted-foreground">{schedule.nextDate}</TableCell>
                    <TableCell className="text-muted-foreground">{schedule.totalGenerated}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          schedule.status === "Active"
                            ? "bg-green-600/20 text-green-400 border-green-600/30"
                            : schedule.status === "Paused"
                            ? "bg-orange-600/20 text-orange-400 border-orange-600/30"
                            : "bg-gray-600/20 text-gray-400 border-gray-600/30"
                        }
                      >
                        {schedule.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleToggleStatus(schedule.id)}
                          className="text-gray-400 hover:text-white"
                        >
                          {schedule.status === "Active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#0f1421] border-gray-800">
                            <DropdownMenuItem onClick={() => handleEdit(schedule)} className="text-gray-300 hover:bg-gray-800 cursor-pointer">
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Schedule
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(schedule.id)} className="text-red-400 hover:bg-red-950/30 cursor-pointer">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
