import { 
  LayoutDashboard, 
  FileText, 
  Package, 
  FileStack,
  Repeat,
  Receipt,
  CheckCircle,
  Users,
  UserCircle,
  CreditCard,
  BarChart3,
  Puzzle,
  Settings,
} from "lucide-react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";

const navigation = [
  { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
  { id: "invoices", name: "Invoices", icon: FileText },
  { id: "item-catalog", name: "Item Catalog", icon: Package },
  { id: "templates", name: "Templates", icon: FileStack },
  { id: "recurring", name: "Recurring", icon: Repeat },
  { id: "bills", name: "Bills", icon: Receipt },
  { id: "approvals", name: "Approvals", icon: CheckCircle },
  { id: "vendors", name: "Vendors", icon: Users },
  { id: "customers", name: "Customers", icon: UserCircle },
  { id: "payments", name: "Payments", icon: CreditCard },
  { id: "reports", name: "Reports", icon: BarChart3 },
  { id: "integrations", name: "Integrations", icon: Puzzle },
  { id: "settings", name: "Settings", icon: Settings },
];

interface BillFlowSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function BillFlowSidebar({ currentPage, onNavigate }: BillFlowSidebarProps) {
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 bg-card border-r border-border">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600">
            <span className="text-white text-lg">BF</span>
          </div>
          <div>
            <h1 className="text-foreground font-semibold">BillFlow</h1>
            <p className="text-xs text-muted-foreground">Business Finance</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => onNavigate(item.id)}
                className={`w-full justify-start gap-3 h-10 ${
                  isActive 
                    ? "bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 hover:text-indigo-400" 
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="text-sm">{item.name}</span>
              </Button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 bg-indigo-600">
              <AvatarFallback className="bg-indigo-600 text-white text-xs">S</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground truncate">stadiparti@gmail.com</p>
              <p className="text-xs text-muted-foreground">Authenticated</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
