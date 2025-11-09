import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { DollarSign, Users, ShoppingCart, Activity, TrendingUp, TrendingDown } from "lucide-react";
import { AnimatedCounter } from "./animated-counter";
import { Sparkline } from "./sparkline";
import { motion } from "motion/react";

const stats = [
  {
    title: "Total Revenue",
    value: "$45,231",
    change: "+20.1%",
    trend: "up",
    icon: DollarSign,
    color: "text-green-600 dark:text-green-500",
    bgColor: "bg-green-600/10 dark:bg-green-500/20",
    sparklineData: [20, 35, 25, 45, 40, 50, 45],
  },
  {
    title: "Active Users",
    value: "2,845",
    change: "+12.5%",
    trend: "up",
    icon: Users,
    color: "text-blue-600 dark:text-blue-500",
    bgColor: "bg-blue-600/10 dark:bg-blue-500/20",
    sparklineData: [30, 40, 35, 50, 45, 55, 52],
  },
  {
    title: "Total Orders",
    value: "1,234",
    change: "-4.3%",
    trend: "down",
    icon: ShoppingCart,
    color: "text-orange-600 dark:text-orange-500",
    bgColor: "bg-orange-600/10 dark:bg-orange-500/20",
    sparklineData: [40, 35, 30, 28, 25, 22, 20],
  },
  {
    title: "Performance",
    value: "94.2%",
    change: "+8.1%",
    trend: "up",
    icon: Activity,
    color: "text-[var(--accent-color)]",
    bgColor: "bg-[var(--accent-color)]/10 dark:bg-[var(--accent-color)]/20",
    sparklineData: [60, 65, 70, 75, 80, 85, 94],
  },
];

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
        return (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="border-border bg-card/50 backdrop-blur hover:bg-card/80 transition-all hover:shadow-lg hover:shadow-[var(--accent-color)]/5 group">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm">{stat.title}</CardTitle>
                <div className={`rounded-lg p-2 ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl mb-2">
                  <AnimatedCounter value={stat.value} />
                </div>
                <div className="mb-3">
                  <Sparkline data={stat.sparklineData} trend={stat.trend} />
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div
                    className={`flex items-center gap-1 ${
                      stat.trend === "up"
                        ? "text-green-600 dark:text-green-500"
                        : "text-red-600 dark:text-red-500"
                    }`}
                  >
                    <TrendIcon className="h-3 w-3" />
                    <span>{stat.change}</span>
                  </div>
                  <span className="text-muted-foreground">from last month</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}