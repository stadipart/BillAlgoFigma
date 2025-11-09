import { MoreHorizontal, ExternalLink, Pencil, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const entries = [
  {
    id: "PRJ-001",
    name: "Website Redesign",
    status: "in-progress",
    priority: "high",
    assignee: {
      name: "Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      initials: "SJ",
    },
    dueDate: "2025-10-28",
    progress: 65,
  },
  {
    id: "PRJ-002",
    name: "Mobile App Development",
    status: "in-progress",
    priority: "high",
    assignee: {
      name: "Michael Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      initials: "MC",
    },
    dueDate: "2025-11-15",
    progress: 45,
  },
  {
    id: "PRJ-003",
    name: "Database Migration",
    status: "completed",
    priority: "medium",
    assignee: {
      name: "Emily Davis",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      initials: "ED",
    },
    dueDate: "2025-10-20",
    progress: 100,
  },
  {
    id: "PRJ-004",
    name: "API Integration",
    status: "pending",
    priority: "medium",
    assignee: {
      name: "David Wilson",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      initials: "DW",
    },
    dueDate: "2025-11-01",
    progress: 0,
  },
  {
    id: "PRJ-005",
    name: "Security Audit",
    status: "in-progress",
    priority: "high",
    assignee: {
      name: "Lisa Anderson",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop",
      initials: "LA",
    },
    dueDate: "2025-10-25",
    progress: 80,
  },
  {
    id: "PRJ-006",
    name: "Content Management System",
    status: "in-progress",
    priority: "low",
    assignee: {
      name: "James Brown",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
      initials: "JB",
    },
    dueDate: "2025-11-30",
    progress: 30,
  },
  {
    id: "PRJ-007",
    name: "Marketing Campaign",
    status: "completed",
    priority: "medium",
    assignee: {
      name: "Jennifer Lee",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
      initials: "JL",
    },
    dueDate: "2025-10-15",
    progress: 100,
  },
  {
    id: "PRJ-008",
    name: "Customer Portal",
    status: "overdue",
    priority: "high",
    assignee: {
      name: "Robert Taylor",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop",
      initials: "RT",
    },
    dueDate: "2025-10-20",
    progress: 55,
  },
];

const statusConfig = {
  "in-progress": { label: "In Progress", variant: "default" as const },
  completed: { label: "Completed", variant: "secondary" as const },
  pending: { label: "Pending", variant: "outline" as const },
  overdue: { label: "Overdue", variant: "destructive" as const },
};

const priorityConfig = {
  high: { label: "High", variant: "destructive" as const },
  medium: { label: "Medium", variant: "default" as const },
  low: { label: "Low", variant: "secondary" as const },
};

export function EntriesTable() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Projects</CardTitle>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>
                    <div>
                      <p className="text-sm">{entry.name}</p>
                      <p className="text-xs text-muted-foreground">{entry.id}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[entry.status as keyof typeof statusConfig].variant}>
                      {statusConfig[entry.status as keyof typeof statusConfig].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={priorityConfig[entry.priority as keyof typeof priorityConfig].variant}>
                      {priorityConfig[entry.priority as keyof typeof priorityConfig].label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={entry.assignee.avatar} alt={entry.assignee.name} />
                        <AvatarFallback>{entry.assignee.initials}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{entry.assignee.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{entry.dueDate}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full bg-blue-600"
                          style={{ width: `${entry.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {entry.progress}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
