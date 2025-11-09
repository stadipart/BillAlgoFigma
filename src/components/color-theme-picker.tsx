import { Palette, Check } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useTheme } from "./theme-provider";

const colors = [
  { name: "Purple Dream", value: "violet", color: "bg-violet-600", hex: "#8b5cf6" },
  { name: "Ocean Blue", value: "blue", color: "bg-blue-600", hex: "#3b82f6" },
  { name: "Emerald Green", value: "emerald", color: "bg-emerald-600", hex: "#10b981" },
  { name: "Sunset Orange", value: "orange", color: "bg-orange-600", hex: "#f97316" },
  { name: "Ruby Red", value: "red", color: "bg-red-600", hex: "#ef4444" },
  { name: "Rose Pink", value: "pink", color: "bg-pink-600", hex: "#ec4899" },
  { name: "Rose Gold", value: "rose", color: "bg-rose-600", hex: "#e11d48" },
  { name: "Midnight Slate", value: "slate", color: "bg-slate-600", hex: "#64748b" },
] as const;

export function ColorThemePicker() {
  const { colorTheme, setColorTheme } = useTheme();

  const currentColor = colors.find(c => c.value === colorTheme);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 relative">
          <Palette className="h-4 w-4" />
          {currentColor && (
            <div 
              className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background"
              style={{ backgroundColor: currentColor.hex }}
            />
          )}
          <span className="sr-only">Choose color theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Color Palette
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="p-1">
          {colors.map((color) => (
            <DropdownMenuItem
              key={color.value}
              onClick={() => setColorTheme(color.value)}
              className="flex items-center justify-between cursor-pointer rounded-md px-3 py-2.5"
            >
              <div className="flex items-center gap-3">
                <div 
                  className={`h-5 w-5 rounded-full ring-2 ring-offset-2 ring-offset-background ${
                    colorTheme === color.value ? 'ring-foreground' : 'ring-transparent'
                  }`}
                  style={{ backgroundColor: color.hex }}
                />
                <span className="text-sm">{color.name}</span>
              </div>
              {colorTheme === color.value && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
