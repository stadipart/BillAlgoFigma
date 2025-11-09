import { useEffect, useState } from "react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./ui/command";
import {
  LayoutDashboard,
  BarChart3,
  FileText,
  Users,
  Settings,
  Search,
  Palette,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "./theme-provider";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { setColorTheme, toggleTheme, theme } = useTheme();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          <CommandItem onSelect={() => setOpen(false)}>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
          </CommandItem>
          <CommandItem onSelect={() => setOpen(false)}>
            <BarChart3 className="mr-2 h-4 w-4" />
            <span>Analytics</span>
          </CommandItem>
          <CommandItem onSelect={() => setOpen(false)}>
            <FileText className="mr-2 h-4 w-4" />
            <span>Reports</span>
          </CommandItem>
          <CommandItem onSelect={() => setOpen(false)}>
            <Users className="mr-2 h-4 w-4" />
            <span>Team</span>
          </CommandItem>
          <CommandItem onSelect={() => setOpen(false)}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Theme">
          <CommandItem
            onSelect={() => {
              toggleTheme();
              setOpen(false);
            }}
          >
            {theme === "dark" ? (
              <Sun className="mr-2 h-4 w-4" />
            ) : (
              <Moon className="mr-2 h-4 w-4" />
            )}
            <span>Toggle {theme === "dark" ? "Light" : "Dark"} Mode</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Color Themes">
          <CommandItem
            onSelect={() => {
              setColorTheme("violet");
              setOpen(false);
            }}
          >
            <Palette className="mr-2 h-4 w-4 text-violet-600" />
            <span>Violet Theme</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setColorTheme("blue");
              setOpen(false);
            }}
          >
            <Palette className="mr-2 h-4 w-4 text-blue-600" />
            <span>Blue Theme</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setColorTheme("green");
              setOpen(false);
            }}
          >
            <Palette className="mr-2 h-4 w-4 text-green-600" />
            <span>Green Theme</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setColorTheme("orange");
              setOpen(false);
            }}
          >
            <Palette className="mr-2 h-4 w-4 text-orange-600" />
            <span>Orange Theme</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setColorTheme("red");
              setOpen(false);
            }}
          >
            <Palette className="mr-2 h-4 w-4 text-red-600" />
            <span>Red Theme</span>
          </CommandItem>
          <CommandItem
            onSelect={() => {
              setColorTheme("pink");
              setOpen(false);
            }}
          >
            <Palette className="mr-2 h-4 w-4 text-pink-600" />
            <span>Pink Theme</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
