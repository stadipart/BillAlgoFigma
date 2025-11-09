import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { 
  User, 
  Mail,
  Building2,
  Shield,
  Users,
  MoreHorizontal,
  UserPlus,
  Trash2,
  Edit,
  Crown,
  Palette,
  Moon,
  Sun,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ThemeCustomizationDialog } from "./theme-customization-dialog";
import { useTheme } from "./theme-provider";
import { ThemeToggle } from "./theme-toggle";

const teamMembers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@acmecorp.com",
    role: "owner",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
    status: "active",
    lastActive: "Online now",
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "sarah@acmecorp.com",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
    status: "active",
    lastActive: "2 hours ago",
  },
  {
    id: 3,
    name: "Mike Wilson",
    email: "mike@acmecorp.com",
    role: "manager",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
    status: "active",
    lastActive: "1 day ago",
  },
  {
    id: 4,
    name: "Emily Chen",
    email: "emily@acmecorp.com",
    role: "accountant",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
    status: "active",
    lastActive: "3 hours ago",
  },
  {
    id: 5,
    name: "Alex Turner",
    email: "alex@acmecorp.com",
    role: "employee",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
    status: "invited",
    lastActive: "Pending invitation",
  },
];

const rolePermissions = {
  owner: {
    color: "bg-purple-600/20 text-purple-400 border-purple-600/30",
    icon: Crown,
    description: "Full access to all features and settings",
    permissions: ["All permissions", "Manage billing", "Delete organization", "Manage integrations"],
  },
  admin: {
    color: "bg-blue-600/20 text-blue-400 border-blue-600/30",
    icon: Shield,
    description: "Manage users, settings, and most features",
    permissions: ["Manage users", "Configure settings", "View reports", "Manage integrations"],
  },
  manager: {
    color: "bg-green-600/20 text-green-400 border-green-600/30",
    icon: Users,
    description: "Approve bills and manage team workflows",
    permissions: ["Approve bills", "View reports", "Manage team tasks", "Export data"],
  },
  accountant: {
    color: "bg-orange-600/20 text-orange-400 border-orange-600/30",
    icon: User,
    description: "Full access to financial data and reporting",
    permissions: ["View all financials", "Manage invoices", "Manage bills", "Export reports"],
  },
  employee: {
    color: "bg-gray-600/20 text-gray-400 border-gray-600/30",
    icon: User,
    description: "Basic access to submit and view bills",
    permissions: ["Submit bills", "View assigned tasks", "Basic reporting"],
  },
};

// Component to display current theme
function CurrentThemeDisplay() {
  const { theme, colorTheme, customColors } = useTheme();
  
  const themeNames = {
    violet: "Purple Dream",
    blue: "Default Blue",
    green: "Green",
    emerald: "Emerald Green",
    orange: "Orange Sunset",
    red: "Red",
    rose: "Rose Gold",
    pink: "Pink",
    slate: "Midnight Dark",
    custom: "Custom Theme",
  };

  return (
    <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/30">
      <div className="space-y-2">
        <h4 className="text-white font-medium">Current Theme</h4>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-indigo-600/20 text-indigo-400 border-indigo-600/30">
            {theme === "dark" ? "Dark" : "Light"}
          </Badge>
          <Badge variant="outline" className="bg-purple-600/20 text-purple-400 border-purple-600/30">
            {themeNames[colorTheme] || colorTheme}
          </Badge>
        </div>
        {customColors && (
          <div className="mt-3 flex gap-2">
            <div
              className="w-8 h-8 rounded border border-gray-700"
              style={{ backgroundColor: customColors.primary }}
              title="Primary"
            />
            <div
              className="w-8 h-8 rounded border border-gray-700"
              style={{ backgroundColor: customColors.accent }}
              title="Accent"
            />
            <div
              className="w-8 h-8 rounded border border-gray-700"
              style={{ backgroundColor: customColors.secondary }}
              title="Secondary"
            />
            <div
              className="w-8 h-8 rounded border border-gray-700"
              style={{ backgroundColor: customColors.background }}
              title="Background"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function BillFlowSettings() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account and team settings</p>
      </motion.div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted/50 border border-gray-800">
          <TabsTrigger value="general" className="data-[state=active]:bg-indigo-600">
            General
          </TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-indigo-600">
            Appearance
          </TabsTrigger>
          <TabsTrigger value="team" className="data-[state=active]:bg-indigo-600">
            Team & Roles
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-indigo-600">
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="data-[state=active]:bg-indigo-600">
            Security
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Company Information</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Update your company details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="company-name" className="text-foreground">Company Name</Label>
                    <Input
                      id="company-name"
                      defaultValue="Acme Corporation"
                      className="bg-muted/50 border-gray-800 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company-email" className="text-foreground">Email</Label>
                    <Input
                      id="company-email"
                      type="email"
                      defaultValue="contact@acmecorp.com"
                      className="bg-muted/50 border-gray-800 text-white"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-address" className="text-foreground">Address</Label>
                  <Input
                    id="company-address"
                    defaultValue="123 Business St, Suite 100"
                    className="bg-muted/50 border-gray-800 text-white"
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-foreground">City</Label>
                    <Input
                      id="city"
                      defaultValue="San Francisco"
                      className="bg-muted/50 border-gray-800 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-foreground">State</Label>
                    <Input
                      id="state"
                      defaultValue="CA"
                      className="bg-muted/50 border-gray-800 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip" className="text-foreground">ZIP Code</Label>
                    <Input
                      id="zip"
                      defaultValue="94102"
                      className="bg-muted/50 border-gray-800 text-white"
                    />
                  </div>
                </div>
                <div className="pt-4">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Preferences</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Customize your experience
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-800 bg-gray-900/30">
                  <div className="space-y-1">
                    <h4 className="text-white font-medium">Currency</h4>
                    <p className="text-sm text-muted-foreground">Default currency for transactions</p>
                  </div>
                  <Select defaultValue="usd">
                    <SelectTrigger className="w-32 bg-gray-900/50 border-gray-800 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f1421] border-gray-800">
                      <SelectItem value="usd">USD ($)</SelectItem>
                      <SelectItem value="eur">EUR (€)</SelectItem>
                      <SelectItem value="gbp">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-800 bg-gray-900/30">
                  <div className="space-y-1">
                    <h4 className="text-white font-medium">Time Zone</h4>
                    <p className="text-sm text-muted-foreground">Your local time zone</p>
                  </div>
                  <Select defaultValue="pst">
                    <SelectTrigger className="w-48 bg-gray-900/50 border-gray-800 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0f1421] border-gray-800">
                      <SelectItem value="pst">Pacific Time (PST)</SelectItem>
                      <SelectItem value="est">Eastern Time (EST)</SelectItem>
                      <SelectItem value="cst">Central Time (CST)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Theme Preferences
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Customize the look and feel of BillFlow
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Theme Mode Toggle */}
                <div className="flex items-center justify-between p-4 rounded-lg border border-gray-800 bg-gray-900/30">
                  <div className="space-y-1">
                    <h4 className="text-white font-medium flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Theme Mode
                    </h4>
                    <p className="text-sm text-muted-foreground">Toggle between light and dark themes</p>
                  </div>
                  <ThemeToggle />
                </div>

                {/* Theme Customization */}
                <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/30">
                  <div className="flex items-start justify-between mb-4">
                    <div className="space-y-1">
                      <h4 className="text-white font-medium flex items-center gap-2">
                        <Palette className="h-4 w-4" />
                        Color Theme
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Choose from presets or create your own custom theme
                      </p>
                    </div>
                  </div>
                  <ThemeCustomizationDialog />
                </div>

                {/* Current Theme Display */}
                <CurrentThemeDisplay />
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Team & Roles Tab */}
        <TabsContent value="team" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-border bg-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground">Team Members</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Manage your team and their roles
                    </CardDescription>
                  </div>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead className="text-muted-foreground">Member</TableHead>
                      <TableHead className="text-muted-foreground">Role</TableHead>
                      <TableHead className="text-muted-foreground">Status</TableHead>
                      <TableHead className="text-muted-foreground">Last Active</TableHead>
                      <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamMembers.map((member, index) => {
                      const roleConfig = rolePermissions[member.role as keyof typeof rolePermissions];
                      const RoleIcon = roleConfig.icon;
                      return (
                        <motion.tr
                          key={member.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="border-border hover:bg-gray-800/30 transition-colors group"
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 ring-2 ring-gray-800 group-hover:ring-indigo-500 transition-all">
                                <AvatarImage src={member.avatar} />
                                <AvatarFallback className="bg-indigo-600 text-white text-xs">
                                  {member.name.split(" ").map(n => n[0]).join("")}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-white font-medium">{member.name}</p>
                                <p className="text-xs text-gray-500">{member.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className={roleConfig.color}>
                              <RoleIcon className="h-3 w-3 mr-1" />
                              {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className={member.status === "active" 
                                ? "bg-green-600/20 text-green-400 border-green-600/30"
                                : "bg-orange-600/20 text-orange-400 border-orange-600/30"
                              }
                            >
                              {member.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-400 text-sm">{member.lastActive}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-[#0f1421] border-gray-800">
                                <DropdownMenuItem className="text-gray-300 hover:bg-gray-800 cursor-pointer">
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Role
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-gray-300 hover:bg-gray-800 cursor-pointer">
                                  <Mail className="mr-2 h-4 w-4" />
                                  Resend Invitation
                                </DropdownMenuItem>
                                {member.role !== "owner" && (
                                  <DropdownMenuItem className="text-red-400 hover:bg-red-950/30 cursor-pointer">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remove Member
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </motion.tr>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Role Permissions</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Understanding what each role can do
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(rolePermissions).map(([role, config]) => {
                  const RoleIcon = config.icon;
                  return (
                    <div key={role} className="p-4 rounded-lg border border-gray-800 bg-gray-900/30">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${config.color.split(" ")[0]}/20`}>
                          <RoleIcon className={`h-5 w-5 ${config.color.split(" ")[1]}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-white font-medium capitalize">{role}</h4>
                            <Badge variant="secondary" className={config.color}>
                              {role}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400 mb-3">{config.description}</p>
                          <div className="flex flex-wrap gap-2">
                            {config.permissions.map((permission) => (
                              <span
                                key={permission}
                                className="text-xs px-2 py-1 rounded-md bg-gray-800/50 text-gray-300"
                              >
                                {permission}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Notification Preferences</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Choose what notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: "New Invoice Created", description: "Get notified when a new invoice is created" },
                  { title: "Bill Approval Required", description: "Alert when a bill needs your approval" },
                  { title: "Payment Received", description: "Notification when payment is received" },
                  { title: "Overdue Invoices", description: "Daily digest of overdue invoices" },
                  { title: "Weekly Reports", description: "Receive weekly financial summary reports" },
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-gray-800 bg-gray-900/30">
                    <div className="space-y-1">
                      <h4 className="text-white font-medium">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch defaultChecked={index < 3} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="text-foreground">Security Settings</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage your account security
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="text-white font-medium">Change Password</h4>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label htmlFor="current-password" className="text-foreground">Current Password</Label>
                      <Input
                        id="current-password"
                        type="password"
                        className="bg-muted/50 border-gray-800 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="text-foreground">New Password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        className="bg-muted/50 border-gray-800 text-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-foreground">Confirm New Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        className="bg-muted/50 border-gray-800 text-white"
                      />
                    </div>
                  </div>
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Update Password
                  </Button>
                </div>

                <div className="pt-6 border-t border-gray-800 space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-gray-800 bg-gray-900/30">
                    <div className="space-y-1">
                      <h4 className="text-white font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                    </div>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-gray-800 bg-gray-900/30">
                    <div className="space-y-1">
                      <h4 className="text-white font-medium">Session Timeout</h4>
                      <p className="text-sm text-muted-foreground">Auto logout after 30 minutes of inactivity</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
