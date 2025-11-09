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
import { Search, Filter, Download, TrendingUp, DollarSign, CreditCard, Clock } from "lucide-react";
import { motion } from "motion/react";
import { AnimatedCounter } from "./animated-counter";

const payments = [
  {
    id: "PAY-001",
    vendor: "Office Supplies Inc",
    date: "Oct 25, 2024",
    method: "Credit Card",
    amount: "$1,250.00",
    status: "Completed",
    statusColor: "bg-green-600/20 text-green-400 border-green-600/30",
    reference: "CH-4567890",
  },
  {
    id: "PAY-002",
    vendor: "Cloud Services Ltd",
    date: "Oct 23, 2024",
    method: "ACH Transfer",
    amount: "$890.00",
    status: "Processing",
    statusColor: "bg-blue-600/20 text-blue-400 border-blue-600/30",
    reference: "ACH-8901234",
  },
  {
    id: "PAY-003",
    vendor: "Marketing Agency",
    date: "Oct 22, 2024",
    method: "Wire Transfer",
    amount: "$3,200.00",
    status: "Completed",
    statusColor: "bg-green-600/20 text-green-400 border-green-600/30",
    reference: "WT-5678901",
  },
  {
    id: "PAY-004",
    vendor: "Software Licensing Corp",
    date: "Oct 20, 2024",
    method: "Credit Card",
    amount: "$5,400.00",
    status: "Scheduled",
    statusColor: "bg-purple-600/20 text-purple-400 border-purple-600/30",
    reference: "SCH-2345678",
  },
  {
    id: "PAY-005",
    vendor: "Internet Services Provider",
    date: "Oct 18, 2024",
    method: "ACH Transfer",
    amount: "$450.00",
    status: "Failed",
    statusColor: "bg-red-600/20 text-red-400 border-red-600/30",
    reference: "ACH-3456789",
  },
];

const stats = [
  { label: "Total Payments", value: "$45,230", color: "text-foreground", icon: DollarSign, change: "This month", changeColor: "text-muted-foreground" },
  { label: "Completed", value: "24", color: "text-green-400", icon: TrendingUp, change: "+12 from last month", changeColor: "text-green-500" },
  { label: "Processing", value: "$8,640", color: "text-blue-400", icon: Clock, change: "3 payments", changeColor: "text-blue-500" },
  { label: "Failed", value: "2", color: "text-red-400", icon: CreditCard, change: "Requires attention", changeColor: "text-red-500" },
];

export function BillFlowPayments() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl text-foreground mb-2">Payments</h1>
        <p className="text-muted-foreground">Track and manage all payment transactions</p>
      </motion.div>

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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-foreground">Payment History</CardTitle>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <Input
                    placeholder="Search payments..."
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
                  <TableHead className="text-muted-foreground">Payment ID</TableHead>
                  <TableHead className="text-muted-foreground">Vendor</TableHead>
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">Method</TableHead>
                  <TableHead className="text-muted-foreground">Reference</TableHead>
                  <TableHead className="text-muted-foreground">Amount</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment, index) => (
                  <motion.tr
                    key={payment.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                    className="border-border hover:bg-accent transition-colors"
                  >
                    <TableCell className="font-medium text-foreground">{payment.id}</TableCell>
                    <TableCell className="text-foreground">{payment.vendor}</TableCell>
                    <TableCell className="text-muted-foreground">{payment.date}</TableCell>
                    <TableCell className="text-muted-foreground">{payment.method}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-xs">{payment.reference}</TableCell>
                    <TableCell className="text-foreground font-medium">{payment.amount}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={payment.statusColor}>
                        {payment.status}
                      </Badge>
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
