# Enhanced Card Modal Integration Guide

## Overview

The enhanced card modal component provides a comprehensive, tabbed interface for displaying Magic: The Gathering card information. It features a modern dark theme design that integrates seamlessly with the Deck Forge application.

## Features

### ✨ Core Features
- **Tabbed Interface**: Stats, Flavor Text, and Rulings tabs
- **Image Zoom**: Click card images to zoom in/out
- **Keyboard Navigation**: Escape to close, 1/2/3 to switch tabs
- **Action Buttons**: Add to Deck, Add to Collection, and Favorite
- **Responsive Design**: Optimized for mobile, tablet, and desktop
- **Dark Theme**: Consistent with Deck Forge design system
- **Accessibility**: Screen reader support and keyboard navigation

### 🎨 Visual Design
- Dark background with red accent colors
- Smooth animations and transitions
- Mobile-first responsive layout
- Touch-friendly interface elements
- High contrast mode support

## Files Modified

### 1. `index.html`
- Updated card modal HTML structure with tabbed interface
- Added global JavaScript functions for tab switching
- Integrated with existing modal system

### 2. `deckforge.css`
- Enhanced modal styling with tabbed interface
- Responsive design improvements
- Mobile-optimized layout adjustments
- Accessibility enhancements

### 3. `deckforge.js`
- Enhanced `showCardDetails()` method
- Added `openCardModal()` and `closeCardModal()` methods
- Implemented tab switching functionality
- Added keyboard navigation support
- Integrated action button handlers

### 4. `card-modal-demo.html` (New)
- Standalone demo page for testing modal functionality
- Sample card data for demonstration
- Complete integration example

## Usage

### Basic Integration

```javascript
// Open modal with card data
const cardData = {
    name: 'Lightning Bolt',
    type_line: 'Instant',
    mana_cost: '{R}',
    oracle_text: 'Lightning Bolt deals 3 damage to any target.',
    set_name: 'Alpha',
    rarity: 'common',
    flavor_text: 'The sparkmage shrieked...',
    image_url: 'https://example.com/card-image.jpg',
    rulings: [
        {
            published_at: '2004-10-04',
            comment: 'Lightning Bolt can target any target.'
        }
    ]
};

// Using the global function
openCardModal(cardData);

// Or using the DeckForge instance
window.deckForge.openCardModal(cardData);
```

### Card Data Structure

```javascript
const cardData = {
    // Required fields
    name: string,                    // Card name
    type_line: string,              // Card type (e.g., "Creature — Angel")
    
    // Optional fields
    mana_cost: string,              // Mana cost (e.g., "{3}{W}{W}")
    power: string,                  // Power value
    toughness: string,              // Toughness value
    oracle_text: string,            // Card abilities text
    set_name: string,               // Set name
    rarity: string,                 // Rarity (common, uncommon, rare, mythic)
    flavor_text: string,            // Flavor text
    image_url: string,              // Card image URL
    image_uris: {                   // Alternative image structure
        normal: string              // Normal size image URL
    },
    rulings: [                      // Array of rulings
        {
            published_at: string,   // Date (YYYY-MM-DD)
            comment: string         // Ruling text
        }
    ]
};
```

### Tab Switching

```javascript
// Switch to specific tab
showCardTab('stats');    // Show stats tab
showCardTab('flavor');   // Show flavor tab
showCardTab('rulings');  // Show rulings tab
```

### Keyboard Shortcuts

- **Escape**: Close modal
- **1**: Switch to Stats tab
- **2**: Switch to Flavor tab
- **3**: Switch to Rulings tab

## Integration with Existing Systems

### Collection System Integration

```javascript
// In deckforge.js - addCardToCollection method
addCardToCollection() {
    if (window.app && window.app.addToCollection) {
        const cardData = this.getCurrentModalCard();
        window.app.addToCollection(cardData);
        this.showNotification('Card added to collection!', 'success');
    }
}
```

### Deck Builder Integration

```javascript
// In deckforge.js - addCardToDeck method
addCardToDeck() {
    if (window.deckBuilder && window.deckBuilder.addCard) {
        const cardData = this.getCurrentModalCard();
        window.deckBuilder.addCard(cardData);
        this.showNotification('Card added to deck!', 'success');
    }
}
```

### Search Results Integration

```javascript
// When displaying search results
searchResults.forEach(card => {
    const cardElement = createCardElement(card);
    cardElement.addEventListener('click', () => {
        window.deckForge.openCardModal(card);
    });
    resultsContainer.appendChild(cardElement);
});
```

## Responsive Design

### Mobile (≤480px)
- Full-width modal (96% of screen)
- Smaller card images (max 250px)
- Stacked action buttons
- Reduced padding and font sizes

### Tablet (768px+)
- Centered modal with max width
- Larger card images
- Side-by-side action buttons
- Enhanced hover effects

### Desktop (1024px+)
- Maximum modal width (800px)
- Full-size card images
- Optimized for mouse interaction
- Enhanced animations

## Customization

### Theme Colors

```css
:root {
  --bg-dark: #0b0b0e;           /* Modal background */
  --bg-charcoal: #1a1a1f;      /* Tab backgrounds */
  --red-primary: #e50914;      /* Primary accent */
  --red-accent: #ff3c3c;       /* Secondary accent */
  --text-light: #ffffff;       /* Primary text */
  --text-muted: #cccccc;       /* Secondary text */
}
```

### Custom Styling

```css
/* Override modal width */
.card-modal {
    width: 95%;
    max-width: 600px;
}

/* Custom tab styling */
.card-tabs .tab.active {
    background-color: #your-color;
}

/* Custom button styling */
.add-button {
    background-color: #your-color;
}
```

## Testing

### Demo Page
Open `card-modal-demo.html` in your browser to test:
- Tab switching functionality
- Image zoom feature
- Keyboard navigation
- Action button responses
- Responsive design on different screen sizes

### Manual Testing Checklist
- [ ] Modal opens and closes correctly
- [ ] All three tabs display content
- [ ] Image zoom works on click
- [ ] Keyboard shortcuts function
- [ ] Action buttons trigger correctly
- [ ] Responsive design works on mobile
- [ ] Accessibility features work with screen readers

## Troubleshooting

### Common Issues

1. **Modal doesn't open**
   - Check if `window.deckForge` is available
   - Verify card data structure
   - Check console for JavaScript errors

2. **Tabs don't switch**
   - Ensure `showCardTab()` function is defined globally
   - Check for CSS conflicts with `.hidden` class
   - Verify tab button onclick attributes

3. **Images don't load**
   - Check image URL validity
   - Verify CORS settings for external images
   - Test with placeholder images

4. **Responsive issues**
   - Check viewport meta tag
   - Verify CSS media queries
   - Test on actual devices

### Debug Mode

```javascript
// Enable debug logging
window.deckForge.debug = true;

// Check modal state
console.log('Modal active:', document.getElementById('cardModal').classList.contains('active'));

// Check current card data
console.log('Current card:', window.deckForge.getCurrentModalCard());
```

## Performance Considerations

- Images are loaded lazily when modal opens
- Modal content is populated dynamically
- Event listeners are cleaned up on modal close
- CSS animations can be disabled for reduced motion users

## Browser Support

- **Modern Browsers**: Full support (Chrome 80+, Firefox 75+, Safari 13+)
- **Mobile Browsers**: Optimized for iOS Safari and Chrome Mobile
- **Legacy Support**: Graceful degradation for older browsers

## Future Enhancements

Potential improvements for future versions:
- Card price information display
- Related cards suggestions
- Card legality information
- Print/export functionality
- Social sharing features
- Card comparison mode

## Support

For issues or questions regarding the card modal integration:
1. Check the demo page for reference implementation
2. Review the integration guide for proper usage
3. Test with the provided sample data
4. Check browser console for error messages

---

*This integration guide covers the enhanced card modal component for the Deck Forge MTG collection tracker application.*
