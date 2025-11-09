import { Search, Plus, Settings, LogOut, User } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ThemeToggle } from "./theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function TopNav() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700">
              <span className="text-white">D</span>
            </div>
            <span className="hidden sm:inline-block">Dashboard</span>
          </div>

          {/* Navigation Links */}
          <div className="hidden items-center gap-6 md:flex">
            <a href="#" className="text-sm transition-colors hover:text-blue-600">
              Overview
            </a>
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Projects
            </a>
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Analytics
            </a>
            <a href="#" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Reports
            </a>
          </div>

          {/* Right side actions */}
          <div className="flex flex-1 items-center justify-end gap-3">
            {/* Search */}
            <div className="relative hidden w-full max-w-sm lg:block">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search projects..."
                className="pl-9"
              />
            </div>

            {/* New Project Button */}
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Project</span>
            </Button>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop" alt="User" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p>John Doe</p>
                    <p className="text-xs text-muted-foreground">
                      john.doe@example.com
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}