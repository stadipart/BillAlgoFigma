# BillFlow Theming System Documentation

## Overview

BillFlow features a comprehensive, multi-layered theming system that provides users with extensive customization options for the application's appearance.

## Theme Structure

The theming system consists of **two independent layers**:

### 1. Base Theme Mode
Controls the overall light/dark appearance of the interface.

**Available Options:**
- **Light** - Clean, bright interface with light backgrounds
- **Dark** - Pure dark mode with deep blacks (OLED-friendly)
- **Classic Dark** - Navy/slate themed dark mode with softer contrast
- **System** - Automatically follows the operating system's theme preference

### 2. Color Palette
Applies accent colors across the interface while maintaining the selected theme mode.

**Available Palettes:**
- **Purple Dream** (Violet) - Default, vibrant purple accents (#8b5cf6)
- **Ocean Blue** - Professional blue tones (#3b82f6)
- **Emerald Green** - Fresh, modern green (#10b981)
- **Sunset Orange** - Warm, energetic orange (#f97316)
- **Ruby Red** - Bold, attention-grabbing red (#ef4444)
- **Rose Pink** - Soft, elegant pink (#ec4899)
- **Rose Gold** - Sophisticated rose tones (#e11d48)
- **Midnight Slate** - Neutral, professional slate (#64748b)

## How It Works

### Theme Combination
The system applies **both** theme mode and color palette simultaneously:
- Theme mode sets base colors (backgrounds, text, borders)
- Color palette applies accent colors for interactive elements

**Examples:**
- Light + Purple Dream = Bright interface with purple accents
- Classic Dark + Ocean Blue = Navy dark mode with blue highlights
- Dark + Emerald Green = Deep black with green accents
- System + Sunset Orange = Auto light/dark with orange highlights

### CSS Architecture

The system uses cascading CSS classes:

```css
/* Base theme classes */
.light { /* Light mode variables */ }
.dark { /* Dark mode variables */ }
.classic-dark { /* Classic dark variables */ }

/* Color palette classes */
.violet { /* Purple accent color */ }
.blue { /* Blue accent color */ }
/* etc... */

/* Combined selectors for fine-tuning */
.violet.light { /* Purple + Light specific overrides */ }
.violet.dark { /* Purple + Dark specific overrides */ }
.violet.classic-dark { /* Purple + Classic Dark specific overrides */ }
```

## User Controls

### Theme Mode Selector
Located in the header, the sun/moon icon opens a dropdown with:
- ☀️ Light
- 🌙 Dark
- 🌙 Classic Dark
- 💻 System

### Color Palette Picker
Located in the header, the palette icon opens a color selection menu showing all available color themes with visual swatches.

### Advanced Customization
For power users, the "Customize Theme" dialog (in Settings) provides:
- Custom color picker for primary, accent, secondary, and background colors
- Live preview of customizations
- Quick presets for common color schemes
- Save/reset functionality

## Technical Implementation

### Theme Provider
The `ThemeProvider` component manages theme state:

```tsx
const { 
  theme,           // Current theme: 'light' | 'dark' | 'classic-dark' | 'system'
  resolvedTheme,   // Actual theme in use (system resolves to light/dark)
  setTheme,        // Change theme mode
  colorTheme,      // Current color palette
  setColorTheme    // Change color palette
} = useTheme();
```

### System Theme Detection
When "System" is selected:
- Automatically detects OS preference via `prefers-color-scheme`
- Updates in real-time when OS theme changes
- Falls back to light mode if detection fails

### Persistence
- Theme preferences saved to `localStorage`
- Automatically restored on page reload
- Survives browser sessions

## CSS Variables

### Base Variables (Theme Mode)
```css
--background        /* Main background */
--foreground        /* Main text color */
--card              /* Card backgrounds */
--card-foreground   /* Card text */
--border            /* Border colors */
--muted             /* Muted backgrounds */
--muted-foreground  /* Muted text */
--accent            /* Accent backgrounds */
/* ... and more */
```

### Color Variables (Palette)
```css
--accent-color      /* Primary accent color */
--accent-hover      /* Hover state accent */
```

### Using Variables in Components
```tsx
<div className="bg-background text-foreground">
  <Card className="border-border bg-card">
    <Button className="bg-accent text-accent-foreground">
      Action
    </Button>
  </Card>
</div>
```

## Classic Dark Theme

The Classic Dark theme offers a unique middle-ground between light and dark modes:

**Characteristics:**
- Navy blue backgrounds (#0a0e1a, #0f1421)
- Softer contrast than pure dark mode
- Slate-toned borders and accents (#1e293b)
- Better for extended viewing sessions
- Inspired by classic IDEs and professional tools

**When to Use:**
- Long coding/work sessions
- Reduced eye strain preference
- Professional/corporate environments
- Users who find pure dark too harsh

## Best Practices

### For Developers

1. **Always use CSS variables** instead of hardcoded colors
   ```tsx
   ✅ className="bg-card text-foreground"
   ❌ className="bg-white text-black"
   ```

2. **Test with all theme combinations**
   - Each component should work with all 4 theme modes
   - Verify with multiple color palettes

3. **Use semantic color names**
   ```tsx
   ✅ className="text-muted-foreground"
   ❌ className="text-gray-500"
   ```

4. **Check contrast ratios**
   - Ensure text remains readable in all themes
   - Test interactive elements in all modes

### For Designers

1. **Design for both light and dark**
   - Don't assume one mode
   - Verify designs in Classic Dark as well

2. **Use accent colors sparingly**
   - Let the user's palette shine through
   - Reserve for important interactive elements

3. **Test with different palettes**
   - Verify designs work with all 8 color options
   - Avoid palette-specific assumptions

## Migration Guide

### Updating Hardcoded Colors

**Before:**
```tsx
<div className="bg-[#0f1421] text-white border-gray-800">
```

**After:**
```tsx
<div className="bg-card text-foreground border-border">
```

### Common Replacements
- `bg-white` → `bg-background` or `bg-card`
- `text-white` → `text-foreground`
- `text-black` → `text-foreground`
- `border-gray-800` → `border-border`
- `text-gray-400` → `text-muted-foreground`
- `hover:bg-gray-800` → `hover:bg-accent`

## Future Enhancements

Potential additions to the theming system:
- [ ] More color palettes (teal, amber, cyan)
- [ ] High contrast mode
- [ ] Colorblind-friendly palettes
- [ ] Font size scaling
- [ ] Spacing/density options
- [ ] Export/import theme configurations
- [ ] Theme scheduling (auto-switch at certain times)
- [ ] Per-page theme overrides

## Troubleshooting

### Theme not applying
- Check browser localStorage is enabled
- Verify CSS classes on `<html>` element
- Clear cache and reload

### Colors look wrong
- Ensure using CSS variables, not hardcoded colors
- Check for specificity conflicts
- Verify both theme and color classes are applied

### System theme not working
- Check browser supports `prefers-color-scheme`
- Verify OS theme is set
- Try manually selecting light/dark instead

## Support

For issues or questions about the theming system:
1. Check this documentation
2. Review component examples in `/components`
3. Inspect CSS variables in browser DevTools
4. Check console for theme-related errors

---

**Version:** 2.0  
**Last Updated:** November 2024  
**Maintained by:** BillFlow Development Team
