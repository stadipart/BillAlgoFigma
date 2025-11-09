import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Progress } from "./ui/progress";
import { 
  DollarSign, 
  FileCheck, 
  Wallet, 
  AlertCircle, 
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from "lucide-react";
import { motion } from "motion/react";
import { AnimatedCounter } from "./animated-counter";
import { Sparkline } from "./sparkline";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { useTheme } from "./theme-provider";

const stats = [
  {
    title: "Total Bills",
    value: "18",
    subtitle: "Company bills",
    detail: "+3 from last month",
    detailColor: "text-green-500",
    icon: FileCheck,
    iconBg: "bg-blue-600/20",
    iconColor: "text-blue-400",
    sparklineColor: "#3b82f6",
    trend: "up",
    change: "+15%",
    sparklineData: [12, 14, 13, 16, 15, 17, 18],
  },
  {
    title: "Bills to Approve",
    value: "3",
    subtitle: "Awaiting approval",
    detail: "Needs attention",
    detailColor: "text-orange-500",
    icon: Clock,
    iconBg: "bg-orange-600/20",
    iconColor: "text-orange-400",
    sparklineColor: "#f97316",
    trend: "up",
    change: "+2",
    sparklineData: [1, 0, 2, 1, 2, 3, 3],
  },
  {
    title: "Total Paid",
    value: "$45,230",
    subtitle: "This month",
    detail: "+$12.5k from last month",
    detailColor: "text-green-500",
    icon: Wallet,
    iconBg: "bg-green-600/20",
    iconColor: "text-green-400",
    sparklineColor: "#10b981",
    trend: "up",
    change: "+38%",
    sparklineData: [25000, 28000, 32000, 35000, 38000, 42000, 45230],
  },
  {
    title: "Overdue",
    value: "$3,800",
    subtitle: "Past due date",
    detail: "-$1.2k from last month",
    detailColor: "text-green-500",
    icon: AlertCircle,
    iconBg: "bg-red-600/20",
    iconColor: "text-red-400",
    sparklineColor: "#ef4444",
    trend: "down",
    change: "-24%",
    sparklineData: [8000, 7500, 6800, 5500, 4900, 4200, 3800],
  },
];

const cashFlowData = [
  { month: "Jan", income: 45000, expenses: 32000 },
  { month: "Feb", income: 52000, expenses: 38000 },
  { month: "Mar", income: 48000, expenses: 35000 },
  { month: "Apr", income: 61000, expenses: 42000 },
  { month: "May", income: 55000, expenses: 39000 },
  { month: "Jun", income: 67000, expenses: 45000 },
];

const monthlyData = [
  { month: "Jan", amount: 45000 },
  { month: "Feb", amount: 52000 },
  { month: "Mar", amount: 48000 },
  { month: "Apr", amount: 61000 },
  { month: "May", amount: 55000 },
  { month: "Jun", amount: 67000 },
];

const recentTransactions = [
  {
    id: 1,
    vendor: "Office Supplies Inc",
    type: "Bill Payment",
    time: "2 hours ago",
    amount: -1250.00,
    status: "Completed",
    statusColor: "text-green-500",
    avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=100&h=100&fit=crop",
  },
  {
    id: 2,
    vendor: "Acme Corporation",
    type: "Invoice Received",
    time: "5 hours ago",
    amount: 5240.00,
    status: "Pending",
    statusColor: "text-orange-500",
    avatar: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=100&h=100&fit=crop",
  },
  {
    id: 3,
    vendor: "Cloud Services Ltd",
    type: "Subscription",
    time: "1 day ago",
    amount: -890.00,
    status: "Processing",
    statusColor: "text-blue-500",
    avatar: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=100&h=100&fit=crop",
  },
  {
    id: 4,
    vendor: "Marketing Agency",
    type: "Bill Payment",
    time: "2 days ago",
    amount: -3200.00,
    status: "Completed",
    statusColor: "text-green-500",
    avatar: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=100&h=100&fit=crop",
  },
];

const upcomingPayments = [
  {
    vendor: "Software Licensing Corp",
    amount: "$5,400.00",
    dueDate: "Nov 4, 2024",
    daysLeft: 3,
    priority: "high",
  },
  {
    vendor: "Internet Services Provider",
    amount: "$450.00",
    dueDate: "Nov 8, 2024",
    daysLeft: 7,
    priority: "medium",
  },
  {
    vendor: "Equipment Rental",
    amount: "$1,200.00",
    dueDate: "Nov 15, 2024",
    daysLeft: 14,
    priority: "low",
  },
];

const topVendors = [
  { name: "Office Supplies Inc", spent: "$15,240", percentage: 85 },
  { name: "Cloud Services Ltd", spent: "$12,120", percentage: 72 },
  { name: "Marketing Agency", spent: "$9,600", percentage: 58 },
  { name: "Software Licensing", spent: "$7,800", percentage: 45 },
];

export function BillFlowDashboard() {
  const { resolvedTheme } = useTheme();
  
  // Dynamic colors based on theme
  const isDark = resolvedTheme === "dark" || resolvedTheme === "classic-dark";
  const chartGridColor = isDark ? "#1f2937" : "#e5e7eb";
  const chartTextColor = isDark ? "#6b7280" : "#9ca3af";
  const tooltipBg = isDark ? "#0f1421" : "#ffffff";
  const tooltipBorder = isDark ? "#374151" : "#e5e7eb";
  
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl text-foreground mb-2">Welcome back, Admin 👋</h1>
        <p className="text-muted-foreground">Here's what's happening with your finances today.</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="border-border bg-gradient-to-br from-card to-card/50 hover:from-accent hover:to-card transition-all hover:shadow-lg group">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm text-muted-foreground">{stat.title}</CardTitle>
                  <div className={`rounded-lg p-2 ${stat.iconBg} group-hover:scale-110 transition-transform`}>
                    <Icon className={`h-4 w-4 ${stat.iconColor}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl text-foreground mb-2">
                    <AnimatedCounter value={stat.value} />
                  </div>
                  <div className="mb-3">
                    <Sparkline data={stat.sparklineData} trend={stat.trend} color={stat.sparklineColor} />
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`${stat.detailColor}`}>{stat.detail}</span>
                    <div className={`flex items-center gap-1 ${stat.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                      <TrendIcon className="h-3 w-3" />
                      <span>{stat.change}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Cash Flow Chart - Spans 2 columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="border-border bg-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">Cash Flow Overview</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">Income vs Expenses (Last 6 months)</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-emerald-500" />
                    <span className="text-sm text-muted-foreground">Income</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-rose-500" />
                    <span className="text-sm text-muted-foreground">Expenses</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={cashFlowData}>
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartGridColor} opacity={0.3} />
                  <XAxis dataKey="month" stroke={chartTextColor} />
                  <YAxis stroke={chartTextColor} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: tooltipBg,
                      border: `1px solid ${tooltipBorder}`,
                      borderRadius: "8px",
                      color: isDark ? "#fff" : "#000",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorIncome)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expenses"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorExpenses)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Payments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-400" />
                Upcoming Payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingPayments.map((payment, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                    className="p-3 rounded-lg bg-muted/50 border border-border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="text-foreground font-medium text-sm">{payment.vendor}</p>
                        <p className="text-xs text-muted-foreground mt-1">{payment.dueDate}</p>
                      </div>
                      <p className="text-foreground font-semibold">{payment.amount}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={`text-xs ${
                          payment.priority === "high"
                            ? "bg-red-600/20 text-red-400 border-red-600/30"
                            : payment.priority === "medium"
                            ? "bg-orange-600/20 text-orange-400 border-orange-600/30"
                            : "bg-blue-600/20 text-blue-400 border-blue-600/30"
                        }`}
                      >
                        {payment.daysLeft} days left
                      </Badge>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Second Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          className="lg:col-span-2"
        >
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer group"
                  >
                    <Avatar className="h-12 w-12 ring-2 ring-border group-hover:ring-blue-500 transition-all">
                      <AvatarImage src={transaction.avatar} />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {transaction.vendor.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-foreground font-medium truncate">{transaction.vendor}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">{transaction.type}</p>
                        <span className="text-muted-foreground/50">•</span>
                        <p className="text-xs text-muted-foreground">{transaction.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${transaction.amount > 0 ? "text-green-500" : "text-foreground"}`}>
                        {transaction.amount > 0 ? "+" : ""}${Math.abs(transaction.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </p>
                      <p className={`text-xs mt-1 ${transaction.statusColor}`}>
                        {transaction.status}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Vendors */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Top Vendors</CardTitle>
              <p className="text-sm text-muted-foreground">By total spending</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topVendors.map((vendor, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-foreground font-medium">{vendor.name}</p>
                      <p className="text-sm text-muted-foreground">{vendor.spent}</p>
                    </div>
                    <Progress value={vendor.percentage} className="h-2 bg-muted">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-600 rounded-full transition-all" />
                    </Progress>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
