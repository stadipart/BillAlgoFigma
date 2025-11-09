import { Clock, CheckCircle2, AlertCircle, PlayCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";

const summaries = [
  {
    title: "In Progress",
    count: 12,
    total: 18,
    icon: PlayCircle,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    progress: 67,
    progressColor: "bg-blue-600",
  },
  {
    title: "Completed",
    count: 156,
    total: 180,
    icon: CheckCircle2,
    color: "text-green-600",
    bgColor: "bg-green-50",
    progress: 87,
    progressColor: "bg-green-600",
  },
  {
    title: "Pending Review",
    count: 8,
    total: 12,
    icon: Clock,
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    progress: 67,
    progressColor: "bg-orange-600",
  },
  {
    title: "Overdue",
    count: 3,
    total: 156,
    icon: AlertCircle,
    color: "text-red-600",
    bgColor: "bg-red-50",
    progress: 2,
    progressColor: "bg-red-600",
  },
];

export function SummaryCards() {
  return (
    <div className="space-y-4">
      <h2>Project Summary</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaries.map((summary, index) => {
          const Icon = summary.icon;
          return (
            <Card key={index} className="transition-shadow hover:shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">{summary.title}</CardTitle>
                <div className={`rounded-lg ${summary.bgColor} p-2`}>
                  <Icon className={`h-4 w-4 ${summary.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl">{summary.count}</span>
                    <span className="text-sm text-muted-foreground">
                      / {summary.total}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <Progress value={summary.progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {summary.progress}% completion
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
