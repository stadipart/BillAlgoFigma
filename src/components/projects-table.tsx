import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { MoreHorizontal } from "lucide-react";
import { motion } from "motion/react";

const projects = [
  {
    name: "Website Redesign",
    client: "Acme Corp",
    status: "In Progress",
    progress: 65,
    team: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    ],
    dueDate: "Dec 31, 2024",
  },
  {
    name: "Mobile App Development",
    client: "TechStart Inc",
    status: "Review",
    progress: 85,
    team: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    ],
    dueDate: "Nov 15, 2024",
  },
  {
    name: "Dashboard UI Design",
    client: "DataFlow",
    status: "Completed",
    progress: 100,
    team: [
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    ],
    dueDate: "Oct 20, 2024",
  },
  {
    name: "API Integration",
    client: "CloudSync",
    status: "In Progress",
    progress: 45,
    team: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    ],
    dueDate: "Jan 10, 2025",
  },
  {
    name: "E-commerce Platform",
    client: "ShopHub",
    status: "Planning",
    progress: 20,
    team: [
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    ],
    dueDate: "Feb 28, 2025",
  },
];

const statusColors = {
  "In Progress": "bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-600/20",
  "Review": "bg-orange-600/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 border-orange-600/20",
  "Completed": "bg-green-600/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 border-green-600/20",
  "Planning": "bg-purple-600/10 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 border-purple-600/20",
};

export function ProjectsTable() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
    >
      <Card className="col-span-3 border-border bg-card/50 backdrop-blur hover:shadow-lg hover:shadow-[var(--accent-color)]/5 transition-all">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Projects</CardTitle>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project, index) => (
                <motion.tr
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                  className="hover:bg-accent/50 transition-colors"
                >
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={statusColors[project.status as keyof typeof statusColors]}
                    >
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-24 overflow-hidden rounded-full bg-secondary">
                        <div
                          className="h-full bg-[var(--accent-color)]"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {project.progress}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {project.team.map((avatar, i) => (
                        <Avatar key={i} className="h-8 w-8">
                          <AvatarImage src={avatar} />
                          <AvatarFallback>?</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {project.dueDate}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </motion.div>
  );
}