import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Search, Bell, Settings, User, LogOut, HelpCircle, Command } from "lucide-react";
import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { ThemeToggle } from "./theme-toggle";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "sonner";

interface BillFlowHeaderProps {
  onOpenCommandPalette?: () => void;
}

export function BillFlowHeader({ onOpenCommandPalette }: BillFlowHeaderProps) {
  const [hasNotifications, setHasNotifications] = useState(3);
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenCommandPalette?.();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onOpenCommandPalette]);

  return (
    <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Left side - Search */}
        <div className="flex-1 max-w-2xl">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-400 transition-colors" />
            <Input
              type="search"
              placeholder="Search invoices, bills, vendors..."
              className="pl-10 pr-20 bg-muted/50 border-border text-foreground placeholder:text-muted-foreground focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all"
              onClick={onOpenCommandPalette}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 text-xs text-muted-foreground">
              <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border border-border bg-muted/50 px-1.5 font-mono text-[10px] opacity-100 flex">
                <Command className="h-3 w-3" />
              </kbd>
              <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border border-border bg-muted/50 px-1.5 font-mono text-[10px] opacity-100 flex">
                K
              </kbd>
            </div>
          </div>
        </div>

        {/* Right side - Actions & Profile */}
        <div className="flex items-center gap-3 ml-6">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground hover:bg-accent">
                <Bell className="h-5 w-5" />
                {hasNotifications > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs bg-red-600 text-white border-0 flex items-center justify-center">
                      {hasNotifications}
                    </Badge>
                  </motion.div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-card border-border">
              <DropdownMenuLabel className="text-foreground">Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <div className="max-h-96 overflow-y-auto">
                <DropdownMenuItem className="flex flex-col items-start p-4 text-muted-foreground hover:bg-accent cursor-pointer">
                  <div className="flex items-start gap-3 w-full">
                    <div className="h-2 w-2 rounded-full bg-indigo-500 mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-foreground">New invoice received</p>
                      <p className="text-xs text-muted-foreground mt-1">Cloud Services Ltd - $890.00</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">2 hours ago</p>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start p-4 text-muted-foreground hover:bg-accent cursor-pointer">
                  <div className="flex items-start gap-3 w-full">
                    <div className="h-2 w-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-foreground">Payment processed</p>
                      <p className="text-xs text-muted-foreground mt-1">Office Supplies Inc - $1,250.00</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">5 hours ago</p>
                    </div>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start p-4 text-muted-foreground hover:bg-accent cursor-pointer">
                  <div className="flex items-start gap-3 w-full">
                    <div className="h-2 w-2 rounded-full bg-orange-500 mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-foreground">Bill needs approval</p>
                      <p className="text-xs text-muted-foreground mt-1">Marketing Agency - $3,200.00</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">1 day ago</p>
                    </div>
                  </div>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem className="text-indigo-400 justify-center cursor-pointer hover:bg-accent">
                View all notifications
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 hover:bg-accent">
                <Avatar className="h-8 w-8 ring-2 ring-border hover:ring-indigo-500 transition-all">
                  <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" />
                  <AvatarFallback className="bg-indigo-600 text-white text-xs">SP</AvatarFallback>
                </Avatar>
                <div className="text-left hidden md:block">
                  <p className="text-sm text-foreground">Admin</p>
                  <p className="text-xs text-muted-foreground">{user?.email || 'user@example.com'}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border">
              <DropdownMenuLabel className="text-foreground">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem className="text-foreground hover:bg-accent cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-foreground hover:bg-accent cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-foreground hover:bg-accent cursor-pointer">
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Help & Support</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border" />
              <DropdownMenuItem
                className="text-red-400 hover:bg-red-950/30 cursor-pointer"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
