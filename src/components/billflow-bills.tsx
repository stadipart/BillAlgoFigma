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
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Search, Filter, Upload, MoreHorizontal, Eye, CheckCircle, Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { motion } from "motion/react";
import { AnimatedCounter } from "./animated-counter";

const bills = [
  {
    id: "BILL-001",
    vendor: "Office Supplies Inc",
    date: "Oct 24, 2024",
    dueDate: "Nov 8, 2024",
    amount: "$1,250.00",
    status: "Paid",
    statusColor: "bg-green-600/20 text-green-400 border-green-600/30",
  },
  {
    id: "BILL-002",
    vendor: "Cloud Services Ltd",
    date: "Oct 23, 2024",
    dueDate: "Nov 7, 2024",
    amount: "$890.00",
    status: "Pending",
    statusColor: "bg-orange-600/20 text-orange-400 border-orange-600/30",
  },
  {
    id: "BILL-003",
    vendor: "Marketing Agency",
    date: "Oct 22, 2024",
    dueDate: "Nov 6, 2024",
    amount: "$3,200.00",
    status: "Approved",
    statusColor: "bg-blue-600/20 text-blue-400 border-blue-600/30",
  },
  {
    id: "BILL-004",
    vendor: "Software Licensing Corp",
    date: "Oct 20, 2024",
    dueDate: "Nov 4, 2024",
    amount: "$5,400.00",
    status: "Awaiting Approval",
    statusColor: "bg-yellow-600/20 text-yellow-400 border-yellow-600/30",
  },
  {
    id: "BILL-005",
    vendor: "Internet Services Provider",
    date: "Oct 18, 2024",
    dueDate: "Nov 2, 2024",
    amount: "$450.00",
    status: "Scheduled",
    statusColor: "bg-purple-600/20 text-purple-400 border-purple-600/30",
  },
];

const stats = [
  { label: "Total Bills", value: "18", color: "text-foreground", icon: TrendingUp, change: "+3 from last month", changeColor: "text-green-500" },
  { label: "Paid This Month", value: "$12,340", color: "text-green-400", icon: TrendingUp, change: "+18.2%", changeColor: "text-green-500" },
  { label: "Pending Payment", value: "$8,640", color: "text-orange-400", icon: TrendingDown, change: "4 bills", changeColor: "text-orange-500" },
  { label: "Awaiting Approval", value: "3", color: "text-yellow-400", icon: TrendingUp, change: "Needs action", changeColor: "text-yellow-500" },
];

export function BillFlowBills() {
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
          <h1 className="text-3xl text-foreground mb-1">Bills</h1>
          <p className="text-sm text-muted-foreground">Track and manage vendor bills</p>
        </div>
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

      {/* Bills Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">All Bills</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    placeholder="Search bills..."
                    className="pl-9 w-64 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
                <Button variant="outline" size="icon" className="border-border text-muted-foreground hover:text-foreground hover:bg-accent">
                  <Filter className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="border-border text-muted-foreground hover:bg-accent hover:text-foreground">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Bill
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Bill ID</TableHead>
                  <TableHead className="text-muted-foreground">Vendor</TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">Due Date</TableHead>
                  <TableHead className="text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bills.map((bill, index) => (
                  <motion.tr
                    key={bill.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                    className="border-border hover:bg-accent transition-colors group"
                  >
                    <TableCell className="font-medium text-foreground">{bill.id}</TableCell>
                    <TableCell className="text-foreground">{bill.vendor}</TableCell>
                    <TableCell className="text-muted-foreground">{bill.date}</TableCell>
                    <TableCell className="text-muted-foreground">{bill.dueDate}</TableCell>
                    <TableCell className="text-foreground font-medium">{bill.amount}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={bill.statusColor}>
                        {bill.status}
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
                          <DropdownMenuItem className="text-foreground hover:bg-accent cursor-pointer">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-foreground hover:bg-accent cursor-pointer">
                            <Upload className="mr-2 h-4 w-4" />
                            Pay Bill
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-400 hover:bg-red-950/30 cursor-pointer">
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
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}