import { 
  LayoutDashboard, 
  BarChart3, 
  FileText, 
  Users, 
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard, active: true },
  { name: "Analytics", icon: BarChart3, active: false },
  { name: "Reports", icon: FileText, active: false },
  { name: "Team", icon: Users, active: false },
  { name: "Settings", icon: Settings, active: false },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside 
      animate={{ width: collapsed ? 80 : 256 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="fixed left-0 top-0 z-40 h-screen border-r border-border bg-card/50 backdrop-blur-xl"
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border px-6 bg-gradient-to-r from-[var(--accent-color)]/5 to-transparent">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--accent-color)] to-[var(--accent-hover)] shadow-lg shadow-[var(--accent-color)]/20">
                  <span className="text-white">D</span>
                </div>
                <span className="text-lg">Dashboard</span>
              </motion.div>
            )}
          </AnimatePresence>
          
          {collapsed && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--accent-color)] to-[var(--accent-hover)] shadow-lg shadow-[var(--accent-color)]/20 mx-auto">
              <span className="text-white">D</span>
            </div>
          )}
        </div>

        {/* Collapse Button */}
        <div className="px-4 pt-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className="w-full hover:bg-[var(--accent-color)]/10"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.name}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant={item.active ? "secondary" : "ghost"}
                  className={`w-full ${collapsed ? "justify-center px-0" : "justify-start"} gap-3 ${
                    item.active ? "bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-hover)] text-white hover:from-[var(--accent-color)] hover:to-[var(--accent-hover)] shadow-lg shadow-[var(--accent-color)]/20" : ""
                  }`}
                  title={collapsed ? item.name : undefined}
                >
                  <Icon className="h-5 w-5" />
                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </motion.div>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="space-y-1 border-t border-border p-4">
          <Button variant="ghost" className={`w-full ${collapsed ? "justify-center px-0" : "justify-start"} gap-3`} title={collapsed ? "Help & Support" : undefined}>
            <HelpCircle className="h-5 w-5" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  Help & Support
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
          <Button variant="ghost" className={`w-full ${collapsed ? "justify-center px-0" : "justify-start"} gap-3 text-destructive hover:text-destructive dark:hover:bg-destructive/10`} title={collapsed ? "Logout" : undefined}>
            <LogOut className="h-5 w-5" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>
    </motion.aside>
  );
}