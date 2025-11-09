import { TrendingUp, Award, Target, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const performanceData = [
  { month: "Jan", value: 2400 },
  { month: "Feb", value: 1398 },
  { month: "Mar", value: 9800 },
  { month: "Apr", value: 3908 },
  { month: "May", value: 4800 },
  { month: "Jun", value: 3800 },
  { month: "Jul", value: 4300 },
];

const growthData = [
  { month: "Jan", users: 400, revenue: 2400 },
  { month: "Feb", users: 600, revenue: 2210 },
  { month: "Mar", users: 800, revenue: 2290 },
  { month: "Apr", users: 1200, revenue: 2000 },
  { month: "May", users: 1800, revenue: 2181 },
  { month: "Jun", users: 2400, revenue: 2500 },
];

const achievements = [
  {
    title: "Total Projects",
    value: "248",
    change: "+12.5%",
    icon: Target,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950",
  },
  {
    title: "Team Members",
    value: "42",
    change: "+3.2%",
    icon: Users,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950",
  },
  {
    title: "Achievements",
    value: "156",
    change: "+8.1%",
    icon: Award,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950",
  },
  {
    title: "Growth Rate",
    value: "94.2%",
    change: "+5.4%",
    icon: TrendingUp,
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950",
  },
];

export function HeroPanel() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white dark:from-blue-700 dark:to-blue-900">
        <h1 className="mb-2">Welcome back, John! 👋</h1>
        <p className="text-blue-50">
          Here's what's happening with your projects today.
        </p>
      </div>

      {/* Achievement Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {achievements.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl">{stat.value}</p>
                    <p className="text-xs text-green-600">{stat.change} from last month</p>
                  </div>
                  <div className={`rounded-lg ${stat.bgColor} p-3`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Data Visualizations */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={performanceData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#3b82f6"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle>User & Revenue Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip />
                <Bar dataKey="users" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}