import { useState } from "react";
import { Palette, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useTheme, type CustomColors } from "./theme-provider";
import { Card } from "./ui/card";
import { toast } from "sonner@2.0.3";

const presetThemes = [
  {
    name: "Default Blue",
    value: "blue" as const,
    colors: ["#3B82F6", "#60A5FA", "#DBEAFE"],
    primary: "#3B82F6",
    accent: "#60A5FA",
    secondary: "#DBEAFE",
    background: "#FFFFFF",
  },
  {
    name: "Emerald Green",
    value: "emerald" as const,
    colors: ["#10B981", "#34D399", "#D1FAE5"],
    primary: "#10B981",
    accent: "#34D399",
    secondary: "#D1FAE5",
    background: "#FFFFFF",
  },
  {
    name: "Purple Dream",
    value: "violet" as const,
    colors: ["#8B5CF6", "#A78BFA", "#EDE9FE"],
    primary: "#8B5CF6",
    accent: "#A78BFA",
    secondary: "#EDE9FE",
    background: "#FFFFFF",
  },
  {
    name: "Orange Sunset",
    value: "orange" as const,
    colors: ["#F97316", "#FB923C", "#FFEDD5"],
    primary: "#F97316",
    accent: "#FB923C",
    secondary: "#FFEDD5",
    background: "#FFFFFF",
  },
  {
    name: "Rose Gold",
    value: "rose" as const,
    colors: ["#E11D48", "#F43F5E", "#FFE4E6"],
    primary: "#E11D48",
    accent: "#F43F5E",
    secondary: "#FFF1F2",
    background: "#FFFFFF",
  },
  {
    name: "Midnight Dark",
    value: "slate" as const,
    colors: ["#64748B", "#94A3B8", "#F1F5F9"],
    primary: "#64748B",
    accent: "#94A3B8",
    secondary: "#F1F5F9",
    background: "#FFFFFF",
  },
];

export function ThemeCustomizationDialog() {
  const { colorTheme, setColorTheme, customColors, applyCustomColors, resetToDefault } = useTheme();
  
  const [localColors, setLocalColors] = useState<CustomColors>(
    customColors || {
      primary: "#E11D48",
      accent: "#F43F5E",
      secondary: "#FFF1F2",
      background: "#FFFFFF",
    }
  );

  const handlePresetClick = (preset: typeof presetThemes[0]) => {
    setColorTheme(preset.value);
    setLocalColors({
      primary: preset.primary,
      accent: preset.accent,
      secondary: preset.secondary,
      background: preset.background,
    });
  };

  const handleColorChange = (key: keyof CustomColors, value: string) => {
    setLocalColors((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveTheme = () => {
    applyCustomColors(localColors);
    toast.success("Theme saved successfully!");
  };

  const handleReset = () => {
    resetToDefault();
    setLocalColors({
      primary: "#8B5CF6",
      accent: "#A78BFA",
      secondary: "#EDE9FE",
      background: "#FFFFFF",
    });
    toast.success("Theme reset to default!");
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Palette className="h-4 w-4" />
          Customize Theme
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Customization
          </DialogTitle>
          <DialogDescription>
            Customize the colors of BillFlow to match your brand.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Quick Themes */}
          <div>
            <h3 className="mb-4 text-sm text-muted-foreground uppercase tracking-wide">
              Quick Themes
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {presetThemes.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handlePresetClick(preset)}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all hover:scale-105
                    ${colorTheme === preset.value && !customColors
                      ? "border-primary shadow-lg"
                      : "border-border hover:border-muted-foreground"
                    }
                  `}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {preset.colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="w-5 h-5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-left">{preset.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div>
            <h3 className="mb-4 text-sm text-muted-foreground uppercase tracking-wide">
              Custom Colors
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="primary-color">Primary Color</Label>
                <div className="flex gap-2">
                  <div
                    className="w-12 h-10 rounded border border-border cursor-pointer"
                    style={{ backgroundColor: localColors.primary }}
                    onClick={() => {
                      const input = document.getElementById("primary-color") as HTMLInputElement;
                      input?.click();
                    }}
                  />
                  <Input
                    id="primary-color"
                    type="color"
                    value={localColors.primary}
                    onChange={(e) => handleColorChange("primary", e.target.value)}
                    className="hidden"
                  />
                  <Input
                    type="text"
                    value={localColors.primary}
                    onChange={(e) => handleColorChange("primary", e.target.value)}
                    placeholder="#E11D48"
                    className="flex-1 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="accent-color">Accent Color</Label>
                <div className="flex gap-2">
                  <div
                    className="w-12 h-10 rounded border border-border cursor-pointer"
                    style={{ backgroundColor: localColors.accent }}
                    onClick={() => {
                      const input = document.getElementById("accent-color") as HTMLInputElement;
                      input?.click();
                    }}
                  />
                  <Input
                    id="accent-color"
                    type="color"
                    value={localColors.accent}
                    onChange={(e) => handleColorChange("accent", e.target.value)}
                    className="hidden"
                  />
                  <Input
                    type="text"
                    value={localColors.accent}
                    onChange={(e) => handleColorChange("accent", e.target.value)}
                    placeholder="#F43F5E"
                    className="flex-1 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secondary-color">Secondary Color</Label>
                <div className="flex gap-2">
                  <div
                    className="w-12 h-10 rounded border border-border cursor-pointer"
                    style={{ backgroundColor: localColors.secondary }}
                    onClick={() => {
                      const input = document.getElementById("secondary-color") as HTMLInputElement;
                      input?.click();
                    }}
                  />
                  <Input
                    id="secondary-color"
                    type="color"
                    value={localColors.secondary}
                    onChange={(e) => handleColorChange("secondary", e.target.value)}
                    className="hidden"
                  />
                  <Input
                    type="text"
                    value={localColors.secondary}
                    onChange={(e) => handleColorChange("secondary", e.target.value)}
                    placeholder="#FFF1F2"
                    className="flex-1 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="background-color">Background Color</Label>
                <div className="flex gap-2">
                  <div
                    className="w-12 h-10 rounded border border-border cursor-pointer"
                    style={{ backgroundColor: localColors.background }}
                    onClick={() => {
                      const input = document.getElementById("background-color") as HTMLInputElement;
                      input?.click();
                    }}
                  />
                  <Input
                    id="background-color"
                    type="color"
                    value={localColors.background}
                    onChange={(e) => handleColorChange("background", e.target.value)}
                    className="hidden"
                  />
                  <Input
                    type="text"
                    value={localColors.background}
                    onChange={(e) => handleColorChange("background", e.target.value)}
                    placeholder="#FFFFFF"
                    className="flex-1 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="mb-4 text-sm text-muted-foreground uppercase tracking-wide">
                Live Preview
              </h3>
              <div className="space-y-3">
                <Button
                  style={{ backgroundColor: localColors.primary, color: "#fff" }}
                  className="w-full"
                >
                  Primary Button
                </Button>
                <Button
                  variant="outline"
                  style={{
                    borderColor: localColors.accent,
                    color: localColors.accent,
                  }}
                  className="w-full"
                >
                  Secondary Button
                </Button>
                <Card
                  className="p-4"
                  style={{ backgroundColor: localColors.secondary }}
                >
                  <p className="text-sm">
                    <span style={{ color: localColors.primary }}>Card Example</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This is how cards will render with your selected palette.
                  </p>
                </Card>
              </div>
            </div>

            <div>
              <h3 className="mb-4 text-sm text-muted-foreground uppercase tracking-wide">
                Tips
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Primary color drives buttons and highlights across the app.</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Accent color is used for secondary emphasis and charts.</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Keep sufficient contrast between foreground text and background.</span>
                </li>
                <li className="flex gap-2">
                  <span>•</span>
                  <span>Use light backgrounds for better readability in light mode.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4 border-t">
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset to Default
            </Button>
            <Button onClick={handleSaveTheme} style={{ backgroundColor: localColors.primary, color: "#fff" }}>
              Save Theme
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
