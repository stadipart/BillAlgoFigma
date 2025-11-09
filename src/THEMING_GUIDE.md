# BillFlow Theme Customization Guide

## Overview

BillFlow now includes a comprehensive theming system that allows users to customize the application's appearance to match their brand identity. This includes light/dark mode switching and extensive color customization options.

## Features

### 1. **Light/Dark Mode Toggle**
- Quick toggle between light and dark themes
- Accessible via the header (sun/moon icon)
- Persisted to localStorage
- Available on all pages

### 2. **Predefined Color Themes**

Six beautiful preset themes are available:

1. **Default Blue** - Professional blue tones
   - Primary: #3B82F6
   - Accent: #60A5FA
   - Best for: Financial services, corporate environments

2. **Emerald Green** - Fresh and modern green palette
   - Primary: #10B981
   - Accent: #34D399
   - Best for: Eco-friendly businesses, sustainability-focused companies

3. **Purple Dream** (Default) - Elegant violet shades
   - Primary: #8B5CF6
   - Accent: #A78BFA
   - Best for: Creative agencies, tech startups

4. **Orange Sunset** - Warm and energetic orange tones
   - Primary: #F97316
   - Accent: #FB923C
   - Best for: Restaurants, hospitality, creative industries

5. **Rose Gold** - Sophisticated pink/rose palette
   - Primary: #E11D48
   - Accent: #F43F5E
   - Best for: Fashion, beauty, lifestyle brands

6. **Midnight Dark** - Professional slate/gray tones
   - Primary: #64748B
   - Accent: #94A3B8
   - Best for: Enterprise, B2B, professional services

### 3. **Custom Color Picker**

Create completely custom themes by selecting:

- **Primary Color** - Drives buttons, CTAs, and main highlights
- **Accent Color** - Used for secondary emphasis, charts, and badges
- **Secondary Color** - Background tints and subtle UI elements
- **Background Color** - Main canvas color

Each color can be selected via:
- Visual color picker (click the color swatch)
- Hex code input (manual entry)

### 4. **Live Preview**

Before saving, preview your theme with:
- Primary and secondary buttons
- Card components
- Sample text and UI elements
- Real-time color updates

### 5. **Theme Persistence**

- All theme preferences are saved to localStorage
- Themes persist across sessions
- Can be reset to default at any time

## How to Use

### Quick Theme Change

1. Click the **color circle icon** in the header
2. Select from the dropdown menu of preset themes
3. Theme applies immediately

### Custom Theme Creation

1. Navigate to **Settings > Appearance**
2. Click **"Customize Theme"** button
3. Choose from **Quick Themes** or create custom colors:
   - Click on a preset to use as a starting point
   - Adjust individual colors using the color pickers
   - See live preview on the right
4. Click **"Save Theme"** to apply

### Light/Dark Mode Toggle

1. Click the **sun/moon icon** in the header
2. Theme toggles between light and dark modes
3. Works with all color themes

### Reset to Default

1. Go to **Settings > Appearance**
2. Open **Theme Customization** dialog
3. Click **"Reset to Default"**
4. Returns to Purple Dream theme in Light mode

## Technical Implementation

### Theme Provider

The application uses a React Context-based theme provider that manages:
- Light/Dark mode state
- Color theme selection
- Custom color storage
- CSS variable injection

### CSS Architecture

Themes are implemented using CSS custom properties (variables) that cascade throughout the application:

```css
:root {
  --accent-color: #8b5cf6;
  --background: #ffffff;
  /* ... */
}

.dark {
  --background: #0a0e1a;
  /* ... */
}

.violet {
  --accent-color: #8b5cf6;
  /* ... */
}
```

### Components

- **ThemeProvider** - Context provider managing theme state
- **ThemeToggle** - Light/Dark mode toggle button
- **ColorThemePicker** - Quick theme selector dropdown
- **ThemeCustomizationDialog** - Full theme customization interface
- **CurrentThemeDisplay** - Shows active theme in Settings

## Best Practices

### For Users

1. **Accessibility**: Ensure sufficient contrast between text and backgrounds
2. **Brand Alignment**: Choose colors that match your company's brand guidelines
3. **Consistency**: Stick to one theme across your organization for consistency
4. **Testing**: Preview your theme in both light and dark modes before saving

### Color Selection Tips

- **Primary Color**: Should be bold and recognizable - this is your brand color
- **Accent Color**: Should complement the primary, slightly lighter or different hue
- **Secondary Color**: Use a very light tint of primary or neutral for backgrounds
- **Background Color**: 
  - Light mode: White (#FFFFFF) or very light gray (#F8F9FA)
  - Dark mode: Very dark blue/gray (#0A0E1A) or black

### Contrast Guidelines

- Primary buttons should have high contrast with background
- Text should be easily readable on all background colors
- Charts and data visualizations benefit from distinct accent colors

## Integration Points

The theming system is integrated throughout the application:

### Pages
- ✅ Dashboard
- ✅ Invoices
- ✅ Bills
- ✅ Vendors
- ✅ Customers
- ✅ Payments
- ✅ Approvals
- ✅ Reports
- ✅ Item Catalog
- ✅ Templates
- ✅ Recurring
- ✅ Integrations
- ✅ Settings

### Components
- ✅ Sidebar navigation
- ✅ Header with actions
- ✅ Cards and panels
- ✅ Buttons and CTAs
- ✅ Forms and inputs
- ✅ Tables and data grids
- ✅ Charts and visualizations
- ✅ Dialogs and modals
- ✅ Notifications and toasts

## Future Enhancements

Potential future additions to the theming system:

- [ ] Backend storage (save themes per user account)
- [ ] Company-wide theme enforcement (admin sets theme for all users)
- [ ] Theme sharing and import/export
- [ ] Advanced customization (border radius, spacing, typography)
- [ ] High contrast accessibility mode
- [ ] Seasonal themes
- [ ] Theme preview gallery

## Troubleshooting

### Theme Not Persisting
- Check browser localStorage is enabled
- Clear cache and reload
- Ensure you clicked "Save Theme"

### Colors Look Wrong
- Reset to default and try again
- Check hex codes are valid (6 characters, #000000 format)
- Try a preset theme first, then customize

### Poor Contrast
- Use the live preview to check readability
- Stick to preset themes for guaranteed accessibility
- Test in both light and dark modes

## Support

For theme-related issues or suggestions, contact the BillFlow support team or refer to the main documentation.

---

**Last Updated**: November 2025
**Version**: 1.0
