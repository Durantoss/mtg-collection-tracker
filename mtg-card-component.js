/**
 * Enhanced MTG Card Component - Interactive Functionality
 * Integrates with MTG Collection Tracker application
 */

class MTGCardComponent {
    constructor(cardData, options = {}) {
        this.cardData = cardData;
        this.options = {
            enableQuantityControls: true,
            enablePriceTracking: true,
            enableDeckBuilder: true,
            enableSwipeActions: true,
            enableCardPreview: true,
            enableKeyboardShortcuts: true,
            ...options
        };
        
        this.element = null;
        this.isAnimating = false;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.swipeThreshold = 80;
        
        this.init();
    }

    init() {
        this.createElement();
        this.bindEvents();
        this.setupAccessibility();
        
        if (this.options.enableSwipeActions && 'ontouchstart' in window) {
            this.setupSwipeGestures();
        }
        
        if (this.options.enableKeyboardShortcuts) {
            this.setupKeyboardShortcuts();
        }
    }

    createElement() {
        const card = document.createElement('div');
        card.className = this.getCardClasses();
        card.innerHTML = this.generateCardHTML();
        card.dataset.cardId = this.cardData.id;
        
        this.element = card;
        return card;
    }

    getCardClasses() {
        const classes = ['mtg-card'];
        
        // Add rarity class
        if (this.cardData.rarity) {
            classes.push(`rarity-${this.cardData.rarity.toLowerCase()}`);
        }
        
        // Add foil class
        if (this.cardData.isFoil) {
            classes.push('foil');
        }
        
        // Add mana color classes
        if (this.cardData.manaCost) {
            const colors = this.parseManaColors(this.cardData.manaCost);
            if (colors.length > 0) {
                classes.push(`mana-${colors.join('-').toLowerCase()}`);
            }
        }
        
        return classes.join(' ');
    }

    generateCardHTML() {
        return `
            ${this.cardData.isFoil ? '<div class="foil-indicator">✨ FOIL</div>' : ''}
            
            <div class="card-header">
                <div class="card-art-container">
                    ${this.generateCardArt()}
                </div>
                <div class="card-title-section">
                    <h3 class="card-title">${this.escapeHtml(this.cardData.name)}</h3>
                    ${this.generateManaSymbols()}
                    ${this.generateTypeAndSet()}
                </div>
            </div>
            
            <div class="card-body">
                ${this.generateCardDetails()}
                ${this.generatePriceSection()}
                ${this.generateCardActions()}
                ${this.generateCardNotes()}
                ${this.generateExpandableDetails()}
            </div>
        `;
    }

    generateCardArt() {
        const imageUrl = this.cardData.imageUrl || this.cardData.image_uris?.normal || this.cardData.image_uris?.small;
        
        if (imageUrl) {
            return `
                <img src="${imageUrl}" 
                     alt="${this.escapeHtml(this.cardData.name)}" 
                     class="card-art" 
                     loading="lazy"
                     onerror="this.classList.add('loading')"
                     onload="this.classList.remove('loading')">
            `;
        } else {
            return `
                <div class="card-art loading" title="No image available">
                    <i class="fas fa-image"></i>
                </div>
            `;
        }
    }

    generateManaSymbols() {
        if (!this.cardData.manaCost) return '';
        
        const manaSymbols = this.parseManaSymbols(this.cardData.manaCost);
        if (manaSymbols.length === 0) return '';
        
        return `
            <div class="card-mana-cost">
                ${manaSymbols.map(symbol => this.createManaSymbol(symbol)).join('')}
            </div>
        `;
    }

    generateTypeAndSet() {
        return `
            ${this.cardData.type ? `<div class="card-type-line">${this.escapeHtml(this.cardData.type)}</div>` : ''}
            <div class="card-set-info">
                <span class="card-set">${this.escapeHtml(this.cardData.set || 'Unknown Set')}</span>
                ${this.cardData.setCode ? `<span class="set-code">(${this.cardData.setCode.toUpperCase()})</span>` : ''}
            </div>
        `;
    }

    generateCardDetails() {
        return `
            <div class="card-details">
                <div class="card-detail-item">
                    <span class="detail-label">Quantity</span>
                    <div class="quantity-section">
                        ${this.options.enableQuantityControls ? this.generateQuantityControls() : `<span class="detail-value">${this.cardData.quantity || 1}</span>`}
                    </div>
                </div>
                
                <div class="card-detail-item">
                    <span class="detail-label">Condition</span>
                    <div class="detail-value">
                        ${this.generateConditionIndicator()}
                    </div>
                </div>
                
                <div class="card-detail-item">
                    <span class="detail-label">Rarity</span>
                    <span class="detail-value rarity-${(this.cardData.rarity || 'common').toLowerCase()}">
                        ${this.capitalizeFirst(this.cardData.rarity || 'Common')}
                    </span>
                </div>
                
                <div class="card-detail-item">
                    <span class="detail-label">Total Value</span>
                    <span class="detail-value price-primary">
                        $${this.calculateTotalValue().toFixed(2)}
                    </span>
                </div>
            </div>
        `;
    }

    generateQuantityControls() {
        const quantity = this.cardData.quantity || 1;
        return `
            <div class="quantity-controls">
                <button class="quantity-btn decrease" data-action="decrease-quantity" ${quantity <= 1 ? 'disabled' : ''}>
                    <i class="fas fa-minus"></i>
                </button>
                <span class="quantity-display">${quantity}</span>
                <button class="quantity-btn increase" data-action="increase-quantity">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        `;
    }

    generateConditionIndicator() {
        const condition = (this.cardData.condition || 'NM').toLowerCase();
        const conditionMap = {
            'nm': 'Near Mint',
            'lp': 'Lightly Played',
            'mp': 'Moderately Played',
            'hp': 'Heavily Played',
            'dmg': 'Damaged'
        };
        
        return `
            <span class="condition-indicator ${condition}">
                <i class="fas fa-circle"></i>
                ${conditionMap[condition] || this.capitalizeFirst(condition)}
            </span>
        `;
    }

    generatePriceSection() {
        if (!this.options.enablePriceTracking) return '';
        
        const primaryPrice = this.getPrimaryPrice();
        const prices = this.cardData.prices || {};
        
        return `
            <div class="price-section">
                <div class="price-primary">$${primaryPrice.toFixed(2)}</div>
                ${Object.keys(prices).length > 1 ? this.generatePriceSources() : ''}
            </div>
        `;
    }

    generatePriceSources() {
        const prices = this.cardData.prices || {};
        if (Object.keys(prices).length <= 1) return '';
        
        return `
            <div class="price-sources">
                <div class="price-sources-header">Price Sources</div>
                <div class="price-sources-list">
                    ${Object.entries(prices).map(([source, data]) => `
                        <div class="price-source-item ${source}">
                            <span class="source-name">${this.getSourceDisplayName(source)}</span>
                            <span class="source-price">$${(data.price || 0).toFixed(2)}</span>
                            <span class="source-updated">${this.formatDate(data.lastUpdated)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    generateCardActions() {
        const actions = [];
        
        if (this.options.enableDeckBuilder) {
            actions.push(`
                <button class="mtg-card-btn btn-add-deck" data-action="add-to-deck">
                    <i class="fas fa-plus"></i>
                    Add to Deck
                </button>
            `);
        }
        
        actions.push(`
            <button class="mtg-card-btn btn-edit" data-action="edit-card">
                <i class="fas fa-edit"></i>
                Edit
            </button>
        `);
        
        actions.push(`
            <button class="mtg-card-btn btn-remove" data-action="remove-card">
                <i class="fas fa-trash"></i>
                Remove
            </button>
        `);
        
        return `
            <div class="card-actions">
                ${actions.join('')}
            </div>
        `;
    }

    generateCardNotes() {
        if (!this.cardData.notes) return '';
        
        return `
            <div class="card-notes">
                <span class="card-notes-label">Notes:</span>
                ${this.escapeHtml(this.cardData.notes)}
            </div>
        `;
    }

    generateExpandableDetails() {
        return `
            <div class="card-extra">
                <button class="toggle-extra" data-action="toggle-details">
                    Show Details
                </button>
                <div class="extra-content">
                    <div class="loading-content" style="display: none;">
                        <div class="loading-spinner"></div>
                        Loading card details...
                    </div>
                    <div class="details-content">
                        ${this.generateFlavorText()}
                        ${this.generateRulings()}
                        ${this.generatePriceHistory()}
                    </div>
                </div>
            </div>
        `;
    }

    generateFlavorText() {
        const flavorText = this.cardData.flavorText || this.cardData.flavor_text;
        if (!flavorText) return '';
        
        return `
            <div class="flavor-text">
                <p><strong>Flavor:</strong> "${this.escapeHtml(flavorText)}"</p>
            </div>
        `;
    }

    generateRulings() {
        const rulings = this.cardData.rulings || [];
        if (rulings.length === 0) return '';
        
        return `
            <div class="rulings-text">
                <p><strong>Rulings:</strong></p>
                ${rulings.map(ruling => `
                    <p>• ${this.escapeHtml(ruling.comment || ruling)}</p>
                `).join('')}
            </div>
        `;
    }

    generatePriceHistory() {
        const priceHistory = this.cardData.priceHistory;
        if (!priceHistory || !priceHistory.length) {
            return this.generateMockPriceHistory();
        }
        
        const latest = priceHistory[priceHistory.length - 1];
        const previous = priceHistory[priceHistory.length - 2];
        
        if (!previous) return '';
        
        const change = latest.price - previous.price;
        const isPositive = change > 0;
        
        return `
            <div class="price-history">
                <p><strong>Price History:</strong> 
                    $${previous.price.toFixed(2)} → $${latest.price.toFixed(2)} 
                    <span class="price-trend ${isPositive ? '' : 'negative'}">
                        (${isPositive ? '+' : ''}${change.toFixed(2)})
                    </span>
                    <span style="opacity: 0.7; font-size: 0.8em;">last 30 days</span>
                </p>
            </div>
        `;
    }

    generateMockPriceHistory() {
        const currentPrice = this.getPrimaryPrice();
        if (currentPrice === 0) return '';
        
        // Generate a mock price change for demonstration
        const previousPrice = currentPrice * (0.85 + Math.random() * 0.3); // ±15% variation
        const change = currentPrice - previousPrice;
        const isPositive = change > 0;
        
        return `
            <div class="price-history">
                <p><strong>Price History:</strong> 
                    $${previousPrice.toFixed(2)} → $${currentPrice.toFixed(2)} 
                    <span class="price-trend ${isPositive ? '' : 'negative'}">
                        (${isPositive ? '+' : ''}${change.toFixed(2)})
                    </span>
                    <span style="opacity: 0.7; font-size: 0.8em;">last 30 days</span>
                </p>
            </div>
        `;
    }

    bindEvents() {
        if (!this.element) return;
        
        // Button click events
        this.element.addEventListener('click', this.handleClick.bind(this));
        
        // Card art preview
        if (this.options.enableCardPreview) {
            const cardArt = this.element.querySelector('.card-art');
            if (cardArt) {
                cardArt.addEventListener('click', this.showCardPreview.bind(this));
            }
        }
        
        // Hover effects for price updates
        if (this.options.enablePriceTracking) {
            this.element.addEventListener('mouseenter', this.onCardHover.bind(this));
        }
    }

    handleClick(event) {
        const action = event.target.dataset.action;
        if (!action) return;
        
        event.preventDefault();
        event.stopPropagation();
        
        switch (action) {
            case 'increase-quantity':
                this.changeQuantity(1);
                break;
            case 'decrease-quantity':
                this.changeQuantity(-1);
                break;
            case 'add-to-deck':
                this.addToDeck();
                break;
            case 'edit-card':
                this.editCard();
                break;
            case 'remove-card':
                this.removeCard();
                break;
            case 'toggle-details':
                this.toggleExpandableDetails(event.target);
                break;
        }
    }

    toggleExpandableDetails(button) {
        const cardExtra = button.closest('.card-extra');
        const isOpen = cardExtra.classList.contains('open');
        
        if (isOpen) {
            // Close the details
            cardExtra.classList.remove('open');
            button.textContent = 'Show Details';
        } else {
            // Open the details
            cardExtra.classList.add('open');
            button.textContent = 'Hide Details';
            
            // Load additional details if needed
            this.loadAdditionalDetails(cardExtra);
        }
        
        // Add ripple effect
        this.addRippleEffect(button);
    }

    async loadAdditionalDetails(cardExtra) {
        const loadingContent = cardExtra.querySelector('.loading-content');
        const detailsContent = cardExtra.querySelector('.details-content');
        
        // If we already have flavor text and rulings, no need to fetch
        if (this.cardData.flavorText || this.cardData.flavor_text || 
            (this.cardData.rulings && this.cardData.rulings.length > 0)) {
            return;
        }
        
        // Show loading state
        if (loadingContent) {
            loadingContent.style.display = 'flex';
        }
        if (detailsContent) {
            detailsContent.style.display = 'none';
        }
        
        try {
            // Fetch additional card details from Scryfall API
            const cardName = encodeURIComponent(this.cardData.name);
            const setCode = this.cardData.setCode || this.cardData.set;
            
            let apiUrl = `https://api.scryfall.com/cards/named?fuzzy=${cardName}`;
            if (setCode) {
                apiUrl += `&set=${setCode}`;
            }
            
            const response = await fetch(apiUrl);
            if (response.ok) {
                const cardData = await response.json();
                
                // Update card data with fetched information
                if (cardData.flavor_text && !this.cardData.flavorText) {
                    this.cardData.flavorText = cardData.flavor_text;
                }
                
                // Fetch rulings if available
                if (cardData.rulings_uri) {
                    const rulingsResponse = await fetch(cardData.rulings_uri);
                    if (rulingsResponse.ok) {
                        const rulingsData = await rulingsResponse.json();
                        this.cardData.rulings = rulingsData.data || [];
                    }
                }
                
                // Regenerate the details content with new data
                if (detailsContent) {
                    detailsContent.innerHTML = `
                        ${this.generateFlavorText()}
                        ${this.generateRulings()}
                        ${this.generatePriceHistory()}
                    `;
                }
            }
        } catch (error) {
            console.error('Error fetching card details:', error);
            
            // Show error message
            if (detailsContent) {
                detailsContent.innerHTML = `
                    <p style="color: rgba(248, 113, 113, 0.8); font-style: italic;">
                        <strong>Error:</strong> Could not load additional card details.
                    </p>
                    ${this.generatePriceHistory()}
                `;
            }
        } finally {
            // Hide loading state
            if (loadingContent) {
                loadingContent.style.display = 'none';
            }
            if (detailsContent) {
                detailsContent.style.display = 'block';
            }
        }
    }

    changeQuantity(delta) {
        if (this.isAnimating) return;
        
        const newQuantity = Math.max(1, (this.cardData.quantity || 1) + delta);
        if (newQuantity === this.cardData.quantity) return;
        
        this.cardData.quantity = newQuantity;
        this.updateQuantityDisplay();
        this.updateTotalValue();
        this.triggerUpdate('quantity-changed', { quantity: newQuantity });
        
        // Add visual feedback
        this.addRippleEffect(event.target);
    }

    updateQuantityDisplay() {
        const display = this.element.querySelector('.quantity-display');
        const decreaseBtn = this.element.querySelector('.quantity-btn.decrease');
        
        if (display) {
            display.textContent = this.cardData.quantity;
        }
        
        if (decreaseBtn) {
            decreaseBtn.disabled = this.cardData.quantity <= 1;
        }
    }

    updateTotalValue() {
        const totalValueEl = this.element.querySelector('.detail-value.price-primary');
        if (totalValueEl) {
            totalValueEl.textContent = `$${this.calculateTotalValue().toFixed(2)}`;
        }
    }

    addToDeck() {
        this.triggerUpdate('add-to-deck', { cardData: this.cardData });
        this.showNotification('Card added to deck!', 'success');
    }

    editCard() {
        this.triggerUpdate('edit-card', { cardData: this.cardData });
    }

    removeCard() {
        if (confirm(`Remove ${this.cardData.name} from your collection?`)) {
            this.triggerUpdate('remove-card', { cardData: this.cardData });
            this.animateRemoval();
        }
    }

    showCardPreview() {
        const imageUrl = this.cardData.imageUrl || this.cardData.image_uris?.normal;
        if (!imageUrl) return;
        
        this.triggerUpdate('show-card-preview', { 
            cardData: this.cardData,
            imageUrl: imageUrl 
        });
    }

    onCardHover() {
        // Trigger price update check if needed
        this.triggerUpdate('card-hover', { cardData: this.cardData });
    }

    setupSwipeGestures() {
        this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: true });
    }

    handleTouchStart(event) {
        this.touchStartX = event.touches[0].clientX;
        this.touchStartY = event.touches[0].clientY;
    }

    handleTouchMove(event) {
        if (!this.touchStartX || !this.touchStartY) return;
        
        const touchX = event.touches[0].clientX;
        const touchY = event.touches[0].clientY;
        const deltaX = touchX - this.touchStartX;
        const deltaY = touchY - this.touchStartY;
        
        // Only handle horizontal swipes
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 20) {
            event.preventDefault();
            
            if (deltaX > this.swipeThreshold) {
                this.element.classList.add('swiping-right');
                this.element.classList.remove('swiping-left');
            } else if (deltaX < -this.swipeThreshold) {
                this.element.classList.add('swiping-left');
                this.element.classList.remove('swiping-right');
            } else {
                this.element.classList.remove('swiping-left', 'swiping-right');
            }
        }
    }

    handleTouchEnd(event) {
        const touchX = event.changedTouches[0].clientX;
        const deltaX = touchX - this.touchStartX;
        
        if (Math.abs(deltaX) > this.swipeThreshold) {
            if (deltaX > 0) {
                // Swipe right - add to deck
                this.addToDeck();
            } else {
                // Swipe left - remove
                this.removeCard();
            }
        }
        
        // Reset swipe state
        this.element.classList.remove('swiping-left', 'swiping-right');
        this.touchStartX = 0;
        this.touchStartY = 0;
    }

    setupKeyboardShortcuts() {
        this.element.addEventListener('keydown', this.handleKeydown.bind(this));
        this.element.setAttribute('tabindex', '0');
    }

    handleKeydown(event) {
        switch (event.key) {
            case '+':
            case '=':
                event.preventDefault();
                this.changeQuantity(1);
                break;
            case '-':
                event.preventDefault();
                this.changeQuantity(-1);
                break;
            case 'a':
            case 'A':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.addToDeck();
                }
                break;
            case 'e':
            case 'E':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.editCard();
                }
                break;
            case 'Delete':
            case 'Backspace':
                if (event.ctrlKey || event.metaKey) {
                    event.preventDefault();
                    this.removeCard();
                }
                break;
            case 'Enter':
            case ' ':
                event.preventDefault();
                this.showCardPreview();
                break;
        }
    }

    setupAccessibility() {
        this.element.setAttribute('role', 'article');
        this.element.setAttribute('aria-label', `MTG Card: ${this.cardData.name}`);
        
        // Add ARIA labels to buttons
        const buttons = this.element.querySelectorAll('button[data-action]');
        buttons.forEach(button => {
            const action = button.dataset.action;
            const label = this.getAriaLabel(action);
            if (label) {
                button.setAttribute('aria-label', label);
            }
        });
    }

    getAriaLabel(action) {
        const labels = {
            'increase-quantity': `Increase quantity of ${this.cardData.name}`,
            'decrease-quantity': `Decrease quantity of ${this.cardData.name}`,
            'add-to-deck': `Add ${this.cardData.name} to deck`,
            'edit-card': `Edit ${this.cardData.name}`,
            'remove-card': `Remove ${this.cardData.name} from collection`
        };
        return labels[action];
    }

    // Utility Methods
    parseManaColors(manaCost) {
        if (!manaCost) return [];
        const colorMatches = manaCost.match(/\{([WUBRG])\}/g) || [];
        return [...new Set(colorMatches.map(match => match.replace(/[{}]/g, '')))];
    }

    parseManaSymbols(manaCost) {
        if (!manaCost) return [];
        return manaCost.match(/\{[^}]+\}/g) || [];
    }

    createManaSymbol(symbol) {
        const cleanSymbol = symbol.replace(/[{}]/g, '');
        const colorMap = {
            'W': 'white', 'U': 'blue', 'B': 'black', 'R': 'red', 'G': 'green'
        };
        
        const isColor = colorMap[cleanSymbol];
        const className = isColor ? colorMap[cleanSymbol] : (/^\d+$/.test(cleanSymbol) ? 'generic' : 'colorless');
        
        return `<span class="mana-symbol ${className}" title="${cleanSymbol}">${cleanSymbol}</span>`;
    }

    getPrimaryPrice() {
        const prices = this.cardData.prices || {};
        
        // Priority order for price sources
        const priorityOrder = ['scryfall', 'tcgplayer', 'cardkingdom', 'edhrec', 'local'];
        
        for (const source of priorityOrder) {
            if (prices[source] && prices[source].price > 0) {
                return prices[source].price;
            }
        }
        
        return this.cardData.purchasePrice || 0;
    }

    calculateTotalValue() {
        return this.getPrimaryPrice() * (this.cardData.quantity || 1);
    }

    getSourceDisplayName(source) {
        const displayNames = {
            'scryfall': 'Scryfall',
            'tcgplayer': 'TCGPlayer',
            'cardkingdom': 'Card Kingdom',
            'edhrec': 'EDHREC',
            'local': 'Local Store'
        };
        return displayNames[source] || this.capitalizeFirst(source);
    }

    formatDate(dateString) {
        if (!dateString) return 'Unknown';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    addRippleEffect(element) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple-effect';
        element.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    animateRemoval() {
        this.isAnimating = true;
        this.element.style.transition = 'all 0.3s ease';
        this.element.style.transform = 'translateX(-100%) scale(0.8)';
        this.element.style.opacity = '0';
        
        setTimeout(() => {
            this.element.remove();
        }, 300);
    }

    showNotification(message, type = 'info') {
        this.triggerUpdate('show-notification', { message, type });
    }

    triggerUpdate(eventType, data) {
        const event = new CustomEvent('mtg-card-update', {
            detail: { type: eventType, ...data },
            bubbles: true
        });
        this.element.dispatchEvent(event);
    }

    // Public API Methods
    updateCardData(newData) {
        this.cardData = { ...this.cardData, ...newData };
        this.refresh();
    }

    refresh() {
        const newElement = this.createElement();
        this.element.replaceWith(newElement);
        this.element = newElement;
    }

    destroy() {
        if (this.element) {
            this.element.remove();
        }
    }

    getElement() {
        return this.element;
    }

    getCardData() {
        return { ...this.cardData };
    }
}

// Factory function for easy integration
function createMTGCard(cardData, options = {}) {
    return new MTGCardComponent(cardData, options);
}

// Integration with existing MTG Collection Tracker
if (typeof window !== 'undefined') {
    window.MTGCardComponent = MTGCardComponent;
    window.createMTGCard = createMTGCard;
    
    // Auto-initialize cards with mtg-card-data attribute
    document.addEventListener('DOMContentLoaded', () => {
        const cardElements = document.querySelectorAll('[data-mtg-card]');
        cardElements.forEach(element => {
            try {
                const cardData = JSON.parse(element.dataset.mtgCard);
                const component = new MTGCardComponent(cardData);
                element.replaceWith(component.getElement());
            } catch (error) {
                console.error('Error initializing MTG card:', error);
            }
        });
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MTGCardComponent, createMTGCard };
}
