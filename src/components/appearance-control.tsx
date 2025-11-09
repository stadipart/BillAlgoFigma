import { Palette, Sun, Moon, Monitor, Check } from "lucide-react";
import { Button } from "./ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { useTheme } from "./theme-provider";
import { completeThemes } from "../config/complete-themes";
import { ThemeMode } from "../types/theme-tokens";
import { Separator } from "./ui/separator";

const modeOptions = [
  { value: "light" as const, label: "Light", icon: Sun },
  { value: "dark" as const, label: "Dark", icon: Moon },
  { value: "classic-dark" as const, label: "Classic Dark", icon: Moon },
  { value: "system" as const, label: "System", icon: Monitor },
];

export function AppearanceControl() {
  const { mode, setMode, themeId, setThemeId, resolvedMode } = useTheme();

  const getCurrentIcon = () => {
    if (mode === "system") return Monitor;
    if (resolvedMode === "light") return Sun;
    return Moon;
  };

  const Icon = getCurrentIcon();

  const currentTheme = completeThemes.find((t) => t.id === themeId);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 relative">
          <Palette className="h-4 w-4" />
          {currentTheme && (
            <div
              className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-background"
              style={{ backgroundColor: currentTheme.previewGradient[2] }}
            />
          )}
          <span className="sr-only">Appearance settings</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Palette className="h-5 w-5" />
            <h3 className="font-semibold text-base">Appearance</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-3 block">
                Brightness
              </label>
              <div className="grid grid-cols-4 gap-2">
                {modeOptions.map((option) => {
                  const OptionIcon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setMode(option.value)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:bg-accent ${
                        mode === option.value
                          ? "border-primary bg-accent"
                          : "border-border"
                      }`}
                    >
                      <OptionIcon className="h-4 w-4" />
                      <span className="text-xs font-medium">
                        {option.label.split(" ")[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <Separator />

            <div>
              <label className="text-sm font-medium mb-3 block">
                Color Theme
              </label>
              <div className="space-y-2 max-h-[280px] overflow-y-auto">
                {completeThemes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => setThemeId(theme.id as any)}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg border transition-all hover:bg-accent ${
                      themeId === theme.id
                        ? "border-primary bg-accent"
                        : "border-border"
                    }`}
                  >
                    <div className="flex-shrink-0 flex gap-0.5 mt-0.5">
                      {theme.previewGradient.map((color, idx) => (
                        <div
                          key={idx}
                          className="h-8 w-2 rounded-sm"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          {theme.name}
                        </span>
                        {themeId === theme.id && (
                          <Check className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {theme.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
