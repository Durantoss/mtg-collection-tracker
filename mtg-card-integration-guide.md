# Enhanced MTG Card Component - Integration Guide

This guide shows how to integrate the enhanced MTG card component with your existing MTG Collection Tracker application.

## Files Created

1. **enhanced-mtg-card.css** - Complete styling system with advanced features
2. **mtg-card-component.js** - Interactive JavaScript component
3. **enhanced-mtg-card-demo.html** - Working demo with examples
4. **mtg-card-integration-guide.md** - This integration guide

## Quick Start

### 1. Add CSS to Your Application

Add the enhanced card styles to your main HTML file:

```html
<!-- Add after your existing styles.css -->
<link rel="stylesheet" href="enhanced-mtg-card.css">
```

### 2. Add JavaScript Component

Add the component script to your HTML file:

```html
<!-- Add before closing </body> tag -->
<script src="mtg-card-component.js"></script>
```

### 3. Update Your Existing Card Rendering

Replace your existing `renderCardWithPriceSources` method in `script.js`:

```javascript
// In your MTGCollectionTracker class, replace the existing method:
renderCardWithPriceSources(card) {
    // Create enhanced card component
    const cardComponent = new MTGCardComponent(card, {
        enableQuantityControls: true,
        enablePriceTracking: true,
        enableDeckBuilder: !!this.deckBuilder,
        enableSwipeActions: window.innerWidth <= 768,
        enableCardPreview: true,
        enableKeyboardShortcuts: true
    });
    
    // Listen for card events
    cardComponent.getElement().addEventListener('mtg-card-update', (event) => {
        this.handleCardEvent(event);
    });
    
    return cardComponent.getElement().outerHTML;
}
```

### 4. Add Event Handler

Add this method to your MTGCollectionTracker class:

```javascript
handleCardEvent(event) {
    const { type, cardData, quantity, message } = event.detail;
    
    switch (type) {
        case 'quantity-changed':
            // Update the card in your collection
            const cardIndex = this.collection.findIndex(c => c.id === cardData.id);
            if (cardIndex !== -1) {
                this.collection[cardIndex].quantity = quantity;
                this.saveCollection();
                this.updateCollectionStats();
            }
            break;
            
        case 'add-to-deck':
            // Integrate with your deck builder
            if (this.deckBuilder) {
                this.deckBuilder.addCardToDeck(cardData);
            }
            this.showNotification(`Added ${cardData.name} to deck!`, 'success');
            break;
            
        case 'edit-card':
            // Open your existing edit modal
            this.editCard(cardData.id);
            break;
            
        case 'remove-card':
            // Use your existing remove method
            this.removeCard(cardData.id);
            break;
            
        case 'show-card-preview':
            // Show card preview modal
            this.showCardPreviewModal(cardData);
            break;
            
        case 'card-hover':
            // Trigger price update if needed
            if (this.enhancedPriceTracker) {
                this.enhancedPriceTracker.checkPriceUpdate(cardData);
            }
            break;
            
        case 'show-notification':
            this.showNotification(message, 'info');
            break;
    }
}
```

## Advanced Integration

### Custom Card Preview Modal

Add this method to show full-size card previews:

```javascript
showCardPreviewModal(cardData) {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 600px;">
            <div class="modal-header">
                <h3>${cardData.name}</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body" style="text-align: center;">
                <img src="${cardData.imageUrl || cardData.image_uris?.normal}" 
                     alt="${cardData.name}" 
                     style="max-width: 100%; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
                <div style="margin-top: 20px;">
                    <p><strong>Set:</strong> ${cardData.set} (${cardData.setCode})</p>
                    <p><strong>Type:</strong> ${cardData.type}</p>
                    <p><strong>Rarity:</strong> ${cardData.rarity}</p>
                    ${cardData.notes ? `<p><strong>Notes:</strong> ${cardData.notes}</p>` : ''}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}
```

### Mobile Swipe Integration

The component automatically enables swipe actions on mobile. Customize the swipe behavior:

```javascript
// In your card event handler, customize swipe actions:
case 'swipe-right':
    // Right swipe - add to deck
    if (this.deckBuilder) {
        this.deckBuilder.addCardToDeck(cardData);
        this.showNotification(`Added ${cardData.name} to deck!`, 'success');
    }
    break;
    
case 'swipe-left':
    // Left swipe - remove card
    if (confirm(`Remove ${cardData.name} from collection?`)) {
        this.removeCard(cardData.id);
    }
    break;
```

### Price Tracking Integration

Integrate with your existing price tracking system:

```javascript
// Update your price fetching to work with the new component
async fetchPricesFromAllSources(cardData) {
    const prices = {};
    
    // Use your existing price sources
    if (this.enhancedPriceTracker) {
        const priceData = await this.enhancedPriceTracker.fetchAllPrices(cardData);
        Object.assign(prices, priceData);
    } else {
        // Fallback to existing price fetching
        prices.scryfall = {
            price: parseFloat(cardData.prices?.usd) || 0,
            lastUpdated: new Date().toISOString()
        };
    }
    
    return prices;
}
```

## Styling Customization

### Theme Integration

The component uses CSS custom properties for easy theming. Add these to your existing styles:

```css
:root {
    /* Override card dimensions if needed */
    --mtg-card-width: 350px; /* Default: 320px */
    --mtg-card-padding: 24px; /* Default: 20px */
    
    /* Customize rarity colors */
    --rarity-mythic: #ff6b35; /* Custom mythic color */
    --rarity-special: #e91e63; /* Custom special color */
    
    /* Adjust condition colors */
    --condition-nm: #00e676; /* Brighter green for NM */
    --condition-dmg: #f44336; /* Brighter red for damaged */
}
```

### Mobile Customization

Customize mobile behavior in your mobile-ui-enhanced.css:

```css
@media (max-width: 768px) {
    .mtg-card {
        /* Override mobile card styling */
        margin-bottom: 20px;
        border-radius: 12px;
    }
    
    .mtg-card-btn {
        /* Ensure buttons are touch-friendly */
        min-height: 48px;
        font-size: 1rem;
    }
}
```

## Keyboard Shortcuts

The component includes these keyboard shortcuts:

- **+/=**: Increase quantity
- **-**: Decrease quantity  
- **Ctrl/Cmd + A**: Add to deck
- **Ctrl/Cmd + E**: Edit card
- **Ctrl/Cmd + Delete**: Remove card
- **Enter/Space**: Show card preview

## Accessibility Features

The component includes:

- ARIA labels for all interactive elements
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Reduced motion support

## Performance Considerations

### Lazy Loading

The component includes lazy loading for card images:

```javascript
// Images load only when needed
<img loading="lazy" src="${imageUrl}" alt="${cardName}">
```

### Event Delegation

Use event delegation for better performance with many cards:

```javascript
// In your collection container
document.getElementById('collection-grid').addEventListener('mtg-card-update', (event) => {
    this.handleCardEvent(event);
});
```

### Memory Management

Clean up components when removing cards:

```javascript
removeCard(cardId) {
    // Find and destroy the component
    const cardElement = document.querySelector(`[data-card-id="${cardId}"]`);
    if (cardElement && cardElement.mtgCardComponent) {
        cardElement.mtgCardComponent.destroy();
    }
    
    // Continue with your existing removal logic
    this.collection = this.collection.filter(card => card.id !== cardId);
    this.saveCollection();
    this.updateCollectionStats();
    this.renderCollection();
}
```

## Testing

### Demo Page

Open `enhanced-mtg-card-demo.html` in your browser to test all features:

1. Interactive quantity controls
2. Price source display
3. Foil effects and animations
4. Mobile swipe gestures
5. Keyboard shortcuts
6. Card preview functionality

### Integration Testing

Test the integration by:

1. Adding cards to your collection
2. Editing card quantities
3. Testing mobile responsiveness
4. Verifying price updates
5. Testing deck builder integration

## Troubleshooting

### Common Issues

1. **Cards not displaying correctly**
   - Ensure `enhanced-mtg-card.css` is loaded after your main styles
   - Check that Font Awesome icons are available

2. **JavaScript errors**
   - Verify `mtg-card-component.js` is loaded before use
   - Check browser console for specific errors

3. **Mobile issues**
   - Test touch events on actual mobile devices
   - Verify viewport meta tag is set correctly

4. **Performance issues**
   - Limit the number of cards rendered at once
   - Use virtual scrolling for large collections
   - Optimize images with appropriate sizes

### Browser Support

The component supports:
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Migration from Existing Cards

To migrate from your existing card display:

1. **Backup your current implementation**
2. **Update one section at a time** (e.g., start with collection view)
3. **Test thoroughly** on different devices
4. **Gradually enable advanced features**
5. **Monitor performance** and user feedback

## Future Enhancements

The component is designed to be extensible. Future additions could include:

- Card comparison tools
- Advanced filtering UI
- Bulk operations
- Card condition editing
- Price alerts
- Collection analytics
- Export functionality

## Support

For issues or questions:

1. Check the demo page for examples
2. Review the component source code
3. Test with minimal data first
4. Check browser developer tools for errors

The enhanced MTG card component provides a significant upgrade to your collection tracker with modern UI/UX patterns, accessibility features, and mobile optimization while maintaining compatibility with your existing codebase.
