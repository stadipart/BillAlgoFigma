import { motion } from "motion/react";
import { Search, Bell, Command } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ThemeToggle } from "./theme-toggle";
import { Badge } from "./ui/badge";

export function DashboardHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/50 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-4 px-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md group">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-[var(--accent-color)] transition-colors" />
          <Input
            type="search"
            placeholder="Search anything..."
            className="pl-9 dark:bg-muted/50 focus:ring-2 focus:ring-[var(--accent-color)]/20 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 text-xs text-muted-foreground">
            <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] opacity-100 flex">
              <Command className="h-3 w-3" />
            </kbd>
            <kbd className="pointer-events-none h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-[10px] opacity-100 flex">
              K
            </kbd>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notifications */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
              >
                <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs bg-[var(--accent-color)] text-white border-0 flex items-center justify-center">
                  3
                </Badge>
              </motion.div>
            </Button>
          </motion.div>

          {/* User Avatar */}
          <div className="flex items-center gap-3 border-l border-border pl-3">
            <div className="text-right hidden md:block">
              <p className="text-sm">John Doe</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Avatar className="cursor-pointer ring-2 ring-transparent hover:ring-[var(--accent-color)]/50 transition-all">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </motion.div>
          </div>
        </div>
      </div>
    </header>
  );
}