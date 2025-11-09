import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  FileText, 
  Download,
  Calendar,
  TrendingUp,
  DollarSign,
  BarChart3,
  PieChart,
} from "lucide-react";
import { motion } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts";

const revenueByCategory = [
  { category: "Software", amount: 45000 },
  { category: "Services", amount: 32000 },
  { category: "Hardware", amount: 18000 },
  { category: "Consulting", amount: 25000 },
  { category: "Support", amount: 15000 },
];

const expensesByVendor = [
  { name: "Office Supplies", value: 15240 },
  { name: "Cloud Services", value: 12120 },
  { name: "Marketing", value: 9600 },
  { name: "Software", value: 7800 },
  { name: "Other", value: 5240 },
];

const COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#c084fc", "#d8b4fe"];

const reportTemplates = [
  {
    title: "Profit & Loss Statement",
    description: "Comprehensive P&L report for the selected period",
    icon: TrendingUp,
    color: "bg-green-600/20 text-green-400",
  },
  {
    title: "Cash Flow Report",
    description: "Track cash inflows and outflows",
    icon: DollarSign,
    color: "bg-blue-600/20 text-blue-400",
  },
  {
    title: "Accounts Receivable",
    description: "Outstanding invoices and payment status",
    icon: FileText,
    color: "bg-purple-600/20 text-purple-400",
  },
  {
    title: "Accounts Payable",
    description: "Bills due and payment schedules",
    icon: Calendar,
    color: "bg-orange-600/20 text-orange-400",
  },
  {
    title: "Vendor Analysis",
    description: "Spending breakdown by vendor",
    icon: BarChart3,
    color: "bg-indigo-600/20 text-indigo-400",
  },
  {
    title: "Revenue by Category",
    description: "Income categorization and trends",
    icon: PieChart,
    color: "bg-pink-600/20 text-pink-400",
  },
];

export function BillFlowReports() {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl text-foreground mb-2">Reports & Analytics</h1>
        <p className="text-muted-foreground">Generate insights from your financial data</p>
      </motion.div>

      {/* Quick Reports */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reportTemplates.map((report, index) => {
          const Icon = report.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="border-border bg-card hover:bg-[#141925] transition-all cursor-pointer group">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${report.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  <h3 className="text-white font-semibold mb-2">{report.title}</h3>
                  <p className="text-sm text-gray-400 mb-4">{report.description}</p>
                  <Button variant="outline" size="sm" className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
                    Generate Report
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue by Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Revenue by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueByCategory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" opacity={0.3} />
                  <XAxis dataKey="category" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f1421",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                  <Bar dataKey="amount" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Expenses by Vendor */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
        >
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Expenses by Vendor</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RePieChart>
                  <Pie
                    data={expensesByVendor}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {expensesByVendor.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f1421",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                      color: "#fff",
                    }}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Reports */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.8 }}
      >
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Q3 2024 P&L Statement", date: "Oct 25, 2024", size: "245 KB" },
                { name: "September Cash Flow", date: "Oct 1, 2024", size: "189 KB" },
                { name: "Vendor Spending Analysis", date: "Sep 28, 2024", size: "312 KB" },
                { name: "August AR Aging Report", date: "Sep 1, 2024", size: "156 KB" },
              ].map((report, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg border border-gray-800 bg-gray-900/30 hover:bg-gray-800/50 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-600/20 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{report.name}</p>
                      <p className="text-xs text-gray-500">{report.date} • {report.size}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
