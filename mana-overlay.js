// Mana Overlay Component for MTG Collection Tracker
// Integrates with existing mana symbol system and provides interactive overlays

class ManaOverlay {
    constructor() {
        this.manaColors = {
            'W': { name: 'White', file: 'white-mana.svg', color: '#fffbd5' },
            'U': { name: 'Blue', file: 'blue-mana.svg', color: '#0e68ab' },
            'B': { name: 'Black', file: 'black-mana.svg', color: '#150b00' },
            'R': { name: 'Red', file: 'red-mana.svg', color: '#d3202a' },
            'G': { name: 'Green', file: 'green-mana.svg', color: '#00733e' },
            'C': { name: 'Colorless', file: 'colorless-mana.svg', color: '#cac5c0' }
        };
        
        this.selectedManaTypes = new Set();
        this.onSelectionChange = null;
        
        this.init();
    }

    init() {
        // Auto-initialize overlays on existing cards
        this.initializeExistingOverlays();
        
        // Set up mutation observer for dynamic content
        this.setupMutationObserver();
        
        // Integrate with existing mana symbol renderer
        this.integrateWithManaRenderer();
    }

    // Create a mana overlay from a mana cost string (e.g., "{2}{W}{U}")
    createOverlayFromManaCost(manaCost, options = {}) {
        if (!manaCost) return null;

        const {
            interactive = false,
            size = 'normal',
            position = 'top-right',
            showTooltips = true
        } = options;

        // Extract unique mana colors from the mana cost
        const colors = this.extractColorsFromManaCost(manaCost);
        
        if (colors.length === 0) return null;

        return this.createOverlay(colors, {
            interactive,
            size,
            position,
            showTooltips
        });
    }

    // Create a mana overlay with specific colors
    createOverlay(colors, options = {}) {
        const {
            interactive = false,
            size = 'normal',
            position = 'top-right',
            showTooltips = true,
            className = ''
        } = options;

        const overlay = document.createElement('div');
        overlay.className = `mana-overlay ${size} ${position} ${className}`;
        
        if (interactive) {
            overlay.classList.add('interactive');
        }

        colors.forEach(color => {
            const img = this.createManaSymbolImage(color, showTooltips);
            if (img) {
                overlay.appendChild(img);
                
                if (interactive) {
                    this.addInteractiveHandlers(img, color);
                }
            }
        });

        return overlay;
    }

    // Create individual mana symbol image
    createManaSymbolImage(color, showTooltips = true) {
        const manaData = this.manaColors[color.toUpperCase()];
        if (!manaData) return null;

        const img = document.createElement('img');
        img.src = `/icons/${manaData.file}`;
        img.alt = `${manaData.name} Mana`;
        img.dataset.manaColor = color.toUpperCase();
        
        if (showTooltips) {
            img.title = `${manaData.name} Mana`;
        }

        // Add error handling for missing SVG files
        img.onerror = () => {
            // Fallback to text-based mana symbol if SVG is missing
            this.createFallbackSymbol(img, color);
        };

        return img;
    }

    // Create fallback text-based mana symbol
    createFallbackSymbol(img, color) {
        const manaData = this.manaColors[color.toUpperCase()];
        if (!manaData) return;

        // Replace img with a styled div
        const symbol = document.createElement('div');
        symbol.className = 'mana-symbol-fallback';
        symbol.textContent = color.toUpperCase();
        symbol.dataset.manaColor = color.toUpperCase();
        symbol.title = img.title;
        
        // Apply inline styles to match the mana color
        symbol.style.cssText = `
            width: 20px;
            height: 20px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            font-family: 'Cinzel', serif;
            background: ${manaData.color};
            color: ${this.getContrastColor(manaData.color)};
            border: 1px solid rgba(0,0,0,0.3);
            box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            cursor: pointer;
            transition: all 0.3s ease;
        `;

        img.parentNode.replaceChild(symbol, img);
    }

    // Get contrasting text color for background
    getContrastColor(hexColor) {
        // Simple contrast calculation
        const r = parseInt(hexColor.slice(1, 3), 16);
        const g = parseInt(hexColor.slice(3, 5), 16);
        const b = parseInt(hexColor.slice(5, 7), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 128 ? '#000000' : '#ffffff';
    }

    // Add interactive click handlers
    addInteractiveHandlers(element, color) {
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleManaSelection(color, element);
        });

        element.addEventListener('mouseenter', () => {
            if (!element.classList.contains('active')) {
                element.style.transform = 'scale(1.2)';
            }
        });

        element.addEventListener('mouseleave', () => {
            if (!element.classList.contains('active')) {
                element.style.transform = '';
            }
        });
    }

    // Toggle mana type selection
    toggleManaSelection(color, element) {
        const colorUpper = color.toUpperCase();
        
        if (this.selectedManaTypes.has(colorUpper)) {
            this.selectedManaTypes.delete(colorUpper);
            element.classList.remove('active');
        } else {
            this.selectedManaTypes.add(colorUpper);
            element.classList.add('active');
        }

        // Trigger selection change callback
        if (this.onSelectionChange) {
            this.onSelectionChange(Array.from(this.selectedManaTypes));
        }

        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('manaSelectionChanged', {
            detail: {
                selectedColors: Array.from(this.selectedManaTypes),
                toggledColor: colorUpper,
                element: element
            }
        }));
    }

    // Extract colors from mana cost string
    extractColorsFromManaCost(manaCost) {
        if (!manaCost) return [];

        const colors = new Set();
        const symbols = manaCost.match(/\{([^}]+)\}/g) || [];

        symbols.forEach(symbol => {
            const content = symbol.replace(/[{}]/g, '');
            
            // Single colors
            if (/^[WUBRG]$/.test(content)) {
                colors.add(content);
            }
            // Hybrid colors
            else if (content.includes('/')) {
                const parts = content.split('/');
                parts.forEach(part => {
                    if (/^[WUBRG]$/.test(part)) {
                        colors.add(part);
                    }
                });
            }
            // Colorless
            else if (content === 'C') {
                colors.add('C');
            }
        });

        return Array.from(colors);
    }

    // Add overlay to existing card element
    addOverlayToCard(cardElement, manaCost, options = {}) {
        if (!cardElement || !manaCost) return;

        // Remove existing overlay if present
        const existingOverlay = cardElement.querySelector('.mana-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }

        const overlay = this.createOverlayFromManaCost(manaCost, options);
        if (overlay) {
            cardElement.appendChild(overlay);
        }
    }

    // Initialize overlays on existing cards
    initializeExistingOverlays() {
        // Look for cards with mana cost data
        const cards = document.querySelectorAll('[data-mana-cost]');
        cards.forEach(card => {
            const manaCost = card.dataset.manaCost;
            if (manaCost) {
                this.addOverlayToCard(card, manaCost, {
                    interactive: card.classList.contains('interactive-mana'),
                    size: card.dataset.overlaySize || 'normal'
                });
            }
        });
    }

    // Set up mutation observer for dynamic content
    setupMutationObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        // Check if the added node has mana cost data
                        if (node.dataset && node.dataset.manaCost) {
                            this.addOverlayToCard(node, node.dataset.manaCost);
                        }
                        
                        // Check children for mana cost data
                        const manaCards = node.querySelectorAll && node.querySelectorAll('[data-mana-cost]');
                        if (manaCards) {
                            manaCards.forEach(card => {
                                const manaCost = card.dataset.manaCost;
                                if (manaCost) {
                                    this.addOverlayToCard(card, manaCost);
                                }
                            });
                        }
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Integrate with existing mana symbol renderer
    integrateWithManaRenderer() {
        // Wait for mana symbol renderer to be available
        const checkRenderer = () => {
            if (window.manaSymbolRenderer) {
                // Extend the existing renderer with overlay functionality
                window.manaSymbolRenderer.createOverlay = (manaCost, options) => {
                    return this.createOverlayFromManaCost(manaCost, options);
                };
                
                window.manaSymbolRenderer.addOverlayToCard = (cardElement, manaCost, options) => {
                    return this.addOverlayToCard(cardElement, manaCost, options);
                };
            } else {
                setTimeout(checkRenderer, 100);
            }
        };
        
        checkRenderer();
    }

    // Clear all selections
    clearSelection() {
        this.selectedManaTypes.clear();
        document.querySelectorAll('.mana-overlay img.active, .mana-symbol-fallback.active').forEach(element => {
            element.classList.remove('active');
        });
        
        if (this.onSelectionChange) {
            this.onSelectionChange([]);
        }
    }

    // Get currently selected mana types
    getSelectedManaTypes() {
        return Array.from(this.selectedManaTypes);
    }

    // Set selection change callback
    setSelectionChangeCallback(callback) {
        this.onSelectionChange = callback;
    }

    // Update card displays with overlays
    updateCardDisplays() {
        // Update collection cards
        document.querySelectorAll('.card-item').forEach(card => {
            const manaCostElement = card.querySelector('[data-mana-cost]');
            if (manaCostElement) {
                const manaCost = manaCostElement.dataset.manaCost;
                this.addOverlayToCard(card, manaCost);
            }
        });

        // Update search results
        document.querySelectorAll('.search-card').forEach(card => {
            const manaCostElement = card.querySelector('[data-mana-cost]');
            if (manaCostElement) {
                const manaCost = manaCostElement.dataset.manaCost;
                this.addOverlayToCard(card, manaCost);
            }
        });

        // Update deck builder cards
        document.querySelectorAll('.deck-card-item').forEach(card => {
            const manaCostElement = card.querySelector('[data-mana-cost]');
            if (manaCostElement) {
                const manaCost = manaCostElement.dataset.manaCost;
                this.addOverlayToCard(card, manaCost, { position: 'relative' });
            }
        });
    }
}

// Initialize the mana overlay system
let manaOverlay;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    manaOverlay = new ManaOverlay();
    window.manaOverlay = manaOverlay;
    
    // Update existing card displays after a short delay
    setTimeout(() => {
        manaOverlay.updateCardDisplays();
    }, 1000);
});

// Export for use in other modules
window.ManaOverlay = ManaOverlay;

// Integration with existing search/filter system
document.addEventListener('manaSelectionChanged', (event) => {
    const selectedColors = event.detail.selectedColors;
    
    // Integrate with existing filter system if available
    if (window.app && window.app.filterByManaColors) {
        window.app.filterByManaColors(selectedColors);
    }
    
    console.log('Mana selection changed:', selectedColors);
});
