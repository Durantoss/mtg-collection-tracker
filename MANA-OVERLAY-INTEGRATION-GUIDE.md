# Mana Overlay System Integration Guide

## Overview

The Mana Overlay System is a comprehensive component for displaying interactive mana symbols on MTG cards in your collection tracker. It provides beautiful, themed overlays that match your project's aesthetic and includes both visual and interactive functionality.

## Files Created

- `mana-overlay.css` - Styling for mana overlays with theme integration
- `mana-overlay.js` - JavaScript component with full functionality
- `mana-overlay-demo.html` - Demo page showing all features
- Updated `index.html` - Integrated CSS and JS references

## Features

### ✨ Core Features
- **Automatic overlay generation** from mana cost strings (e.g., `{2}{W}{U}`)
- **Interactive clicking** for mana type selection/filtering
- **Fallback system** - Works with or without SVG files
- **Multiple sizes** - Small, normal, large variants
- **Flexible positioning** - Top-right, top-left, bottom, center, relative
- **Theme integration** - Matches your gold/fantasy aesthetic
- **Mobile responsive** - Adapts to different screen sizes
- **Accessibility support** - High contrast and reduced motion support

### 🎯 Integration Points
- Collection grid cards
- Search results
- Deck builder
- Card detail views
- Any element with `data-mana-cost` attribute

## Quick Start

### 1. Basic Usage

Add a `data-mana-cost` attribute to any card element:

```html
<div class="card-item" data-mana-cost="{2}{W}{U}">
    <div class="card-name">Azorius Charm</div>
    <!-- Overlay will be automatically added here -->
</div>
```

### 2. Interactive Overlays

For clickable mana symbols that can be used for filtering:

```html
<div class="card-item interactive-mana" data-mana-cost="{W}{U}{B}{R}{G}">
    <div class="card-name">Five-Color Spell</div>
    <!-- Interactive overlay will be added -->
</div>
```

### 3. Manual Creation

Create overlays programmatically:

```javascript
// Create overlay from mana cost
const overlay = window.manaOverlay.createOverlayFromManaCost('{2}{R}{R}', {
    interactive: true,
    size: 'large',
    position: 'top-left'
});

// Add to specific card
window.manaOverlay.addOverlayToCard(cardElement, '{1}{U}', {
    interactive: false,
    showTooltips: true
});
```

## Configuration Options

### Overlay Options

```javascript
{
    interactive: false,      // Enable clicking for selection
    size: 'normal',         // 'small', 'normal', 'large'
    position: 'top-right',  // 'top-left', 'bottom-right', etc.
    showTooltips: true,     // Show hover tooltips
    className: ''           // Additional CSS classes
}
```

### Size Variants

- **Small**: 16px symbols (mobile, compact displays)
- **Normal**: 20px symbols (default)
- **Large**: 24px symbols (headers, emphasis)

### Position Options

- `top-right` (default)
- `top-left`
- `bottom-right`
- `bottom-left`
- `center`
- `relative` (for inline display)

## CSS Classes

### Core Classes

```css
.mana-overlay              /* Main overlay container */
.mana-overlay.interactive  /* Interactive overlay */
.mana-overlay.small        /* Small size variant */
.mana-overlay.large        /* Large size variant */
.mana-overlay.top-left     /* Position variant */
```

### Card Integration

```css
.card-item                 /* Cards get position: relative */
.card-item:hover .mana-overlay  /* Show on hover */
.search-card .mana-overlay /* Search result styling */
.deck-card-item .mana-overlay   /* Deck builder styling */
```

## JavaScript API

### Main Class: `ManaOverlay`

```javascript
// Global instance available as window.manaOverlay
const overlay = window.manaOverlay;

// Create overlay from mana cost
overlay.createOverlayFromManaCost(manaCost, options);

// Create overlay with specific colors
overlay.createOverlay(['W', 'U', 'B'], options);

// Add overlay to existing card
overlay.addOverlayToCard(cardElement, manaCost, options);

// Get selected mana types (for filtering)
overlay.getSelectedManaTypes(); // Returns array like ['W', 'U']

// Clear all selections
overlay.clearSelection();

// Set callback for selection changes
overlay.setSelectionChangeCallback((selectedColors) => {
    console.log('Selected:', selectedColors);
});
```

### Events

```javascript
// Listen for mana selection changes
document.addEventListener('manaSelectionChanged', (event) => {
    const { selectedColors, toggledColor, element } = event.detail;
    // Implement filtering logic here
});
```

## Integration with Existing Systems

### With Mana Symbol Renderer

The overlay system integrates with your existing `mana-symbols.js`:

```javascript
// Extended functionality added to existing renderer
window.manaSymbolRenderer.createOverlay(manaCost, options);
window.manaSymbolRenderer.addOverlayToCard(cardElement, manaCost, options);
```

### With Search/Filter System

```javascript
// Example integration with filtering
document.addEventListener('manaSelectionChanged', (event) => {
    const selectedColors = event.detail.selectedColors;
    
    if (window.app && window.app.filterByManaColors) {
        window.app.filterByManaColors(selectedColors);
    }
});
```

## Fallback System

The system includes a robust fallback for missing SVG files:

1. **Primary**: Attempts to load SVG files from `/icons/`
2. **Fallback**: Creates styled text-based symbols with correct colors
3. **Error handling**: Graceful degradation with console logging

### Expected SVG Files

- `white-mana.svg`
- `blue-mana.svg`
- `black-mana.svg`
- `red-mana.svg`
- `green-mana.svg`
- `colorless-mana.svg`

## Styling Customization

### Custom Colors

```css
.mana-overlay img:hover {
    border-color: your-custom-color;
    box-shadow: 0 0 10px your-custom-glow;
}
```

### Custom Animations

```css
.mana-overlay.interactive img.active::after {
    animation: your-custom-pulse 2s ease-in-out infinite;
}
```

### Theme Integration

The system automatically inherits your project's theme:
- Gold accents and borders
- Fantasy-style gradients
- Cinzel font family
- Consistent hover effects

## Mobile Responsiveness

Automatic responsive adjustments:

- **Desktop**: 20px symbols
- **Tablet** (≤768px): 18px symbols
- **Mobile** (≤480px): 16px symbols
- **Touch-friendly**: Larger click targets
- **Reduced gaps**: Optimized spacing

## Accessibility Features

- **High contrast support**: Enhanced borders and colors
- **Reduced motion support**: Disabled animations when requested
- **Keyboard navigation**: Focus states and tab order
- **Screen reader support**: Proper alt text and ARIA labels
- **Tooltips**: Descriptive hover information

## Performance Considerations

- **Lazy loading**: Overlays created only when needed
- **Mutation observer**: Automatic detection of new cards
- **Event delegation**: Efficient click handling
- **Memory management**: Proper cleanup of event listeners

## Testing

Use the demo page (`mana-overlay-demo.html`) to test:

1. **Basic overlays**: Visual appearance and hover effects
2. **Interactive functionality**: Click selection and tracking
3. **Size variants**: Different overlay sizes
4. **Fallback system**: Text-based symbols when SVGs missing
5. **Manual creation**: Programmatic overlay generation

## Troubleshooting

### Common Issues

1. **Overlays not appearing**
   - Check `data-mana-cost` attribute format
   - Ensure CSS and JS files are loaded
   - Verify card has `position: relative`

2. **Interactive clicks not working**
   - Add `interactive-mana` class to card
   - Check for JavaScript errors in console
   - Ensure event listeners are attached

3. **Styling issues**
   - Check CSS load order
   - Verify theme integration
   - Test responsive breakpoints

### Debug Information

```javascript
// Check if system is loaded
console.log('Mana Overlay:', window.manaOverlay);
console.log('Selected colors:', window.manaOverlay.getSelectedManaTypes());

// Force update all cards
window.manaOverlay.updateCardDisplays();
```

## Future Enhancements

Potential improvements for the system:

1. **SVG Creation**: Add the missing mana symbol SVG files
2. **Animation Library**: Enhanced hover and selection animations
3. **Drag & Drop**: Drag mana symbols for deck building
4. **Color Combinations**: Support for hybrid and complex mana costs
5. **Themes**: Multiple visual themes (classic, modern, etc.)
6. **Performance**: Virtual scrolling for large collections

## Conclusion

The Mana Overlay System provides a complete solution for displaying and interacting with mana symbols in your MTG collection tracker. It's designed to be:

- **Easy to use**: Simple data attributes for basic functionality
- **Flexible**: Extensive customization options
- **Robust**: Fallback systems and error handling
- **Integrated**: Works seamlessly with existing code
- **Accessible**: Supports all users and devices

The system is ready to use immediately and will enhance the user experience of your MTG collection tracker with beautiful, interactive mana displays.
