import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { 
  CheckCircle, 
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Receipt,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { AnimatedCounter } from "./animated-counter";

const pendingApprovals = [
  {
    id: "APP-001",
    type: "Bill",
    vendor: "Software Licensing Corp",
    amount: "$5,400.00",
    submittedBy: "Emily Chen",
    submittedDate: "Oct 25, 2024",
    description: "Annual software license renewal",
    priority: "high",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
  },
  {
    id: "APP-002",
    type: "Invoice",
    customer: "Acme Corporation",
    amount: "$12,500.00",
    submittedBy: "Mike Wilson",
    submittedDate: "Oct 24, 2024",
    description: "Q4 consulting services",
    priority: "medium",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  },
  {
    id: "APP-003",
    type: "Bill",
    vendor: "Marketing Agency",
    amount: "$3,200.00",
    submittedBy: "Sarah Johnson",
    submittedDate: "Oct 23, 2024",
    description: "October marketing campaign",
    priority: "medium",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  },
  {
    id: "APP-004",
    type: "Bill",
    vendor: "Office Supplies Inc",
    amount: "$450.00",
    submittedBy: "Alex Turner",
    submittedDate: "Oct 22, 2024",
    description: "Monthly office supplies",
    priority: "low",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
  },
];

const stats = [
  { 
    label: "Pending Approvals", 
    value: "8", 
    color: "text-orange-400", 
    icon: Clock, 
    change: "Needs review",
    changeColor: "text-orange-500" 
  },
  { 
    label: "Approved Today", 
    value: "12", 
    color: "text-green-400", 
    icon: CheckCircle, 
    change: "$45,230 total",
    changeColor: "text-green-500" 
  },
  { 
    label: "Rejected", 
    value: "2", 
    color: "text-red-400", 
    icon: XCircle, 
    change: "This week",
    changeColor: "text-gray-500" 
  },
  { 
    label: "High Priority", 
    value: "3", 
    color: "text-yellow-400", 
    icon: AlertCircle, 
    change: "Urgent review",
    changeColor: "text-yellow-500" 
  },
];

export function BillFlowApprovals() {
  const handleApprove = (id: string) => {
    toast.success(`Approval ${id} has been approved`);
  };

  const handleReject = (id: string) => {
    toast.error(`Approval ${id} has been rejected`);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl text-foreground mb-2">Approvals</h1>
        <p className="text-muted-foreground">Review and approve pending transactions</p>
      </motion.div>

      {/* Stats */}
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

      {/* Pending Approvals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Pending Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApprovals.map((approval, index) => (
                <motion.div
                  key={approval.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                  className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-accent transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${approval.type === "Bill" ? "bg-purple-600/20" : "bg-blue-600/20"}`}>
                        {approval.type === "Bill" ? (
                          <Receipt className={`h-5 w-5 ${approval.type === "Bill" ? "text-purple-400" : "text-blue-400"}`} />
                        ) : (
                          <FileText className="h-5 w-5 text-blue-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-foreground font-semibold">{approval.type === "Bill" ? approval.vendor : approval.customer}</h3>
                          <Badge
                            variant="secondary"
                            className={
                              approval.priority === "high"
                                ? "bg-red-600/20 text-red-400 border-red-600/30"
                                : approval.priority === "medium"
                                ? "bg-orange-600/20 text-orange-400 border-orange-600/30"
                                : "bg-blue-600/20 text-blue-400 border-blue-600/30"
                            }
                          >
                            {approval.priority} priority
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{approval.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={approval.avatar} />
                              <AvatarFallback className="bg-indigo-600 text-white text-[10px]">
                                {approval.submittedBy.split(" ").map(n => n[0]).join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span>{approval.submittedBy}</span>
                          </div>
                          <span>•</span>
                          <span>{approval.submittedDate}</span>
                          <span>•</span>
                          <span>{approval.id}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl text-foreground font-semibold mb-3">{approval.amount}</p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(approval.id)}
                          className="border-red-600/30 text-red-400 hover:bg-red-950/30 hover:text-red-400"
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleApprove(approval.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.8 }}
      >
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Recent Approval Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: "Approved", user: "John Doe", item: "Bill from Cloud Services ($890)", time: "2 hours ago", status: "approved" },
                { action: "Rejected", user: "Sarah Johnson", item: "Invoice to TechStart Inc ($3,200)", time: "5 hours ago", status: "rejected" },
                { action: "Approved", user: "Mike Wilson", item: "Bill from Office Supplies ($1,250)", time: "1 day ago", status: "approved" },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                >
                  <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                    activity.status === "approved" ? "bg-green-600/20" : "bg-red-600/20"
                  }`}>
                    {activity.status === "approved" ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-foreground">
                      <span className="font-medium">{activity.user}</span>{" "}
                      <span className={activity.status === "approved" ? "text-green-400" : "text-red-400"}>
                        {activity.action.toLowerCase()}
                      </span>{" "}
                      <span className="text-muted-foreground">{activity.item}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
