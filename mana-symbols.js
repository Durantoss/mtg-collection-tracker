// Mana Symbol Display System for MTG Collection Tracker
// Replaces text mana costs like "{2}{R}{R}" with actual mana symbols using SVG icons

class ManaSymbolRenderer {
    constructor() {
        this.symbolMap = this.initializeSymbolMap();
        this.init();
    }

    init() {
        this.injectManaSymbolStyles();
        this.setupManaSymbolObserver();
    }

    initializeSymbolMap() {
        return {
            // Numbers (Generic mana)
            '0': { type: 'generic', symbol: '0', color: '#cac5c0' },
            '1': { type: 'generic', symbol: '1', color: '#cac5c0' },
            '2': { type: 'generic', symbol: '2', color: '#cac5c0' },
            '3': { type: 'generic', symbol: '3', color: '#cac5c0' },
            '4': { type: 'generic', symbol: '4', color: '#cac5c0' },
            '5': { type: 'generic', symbol: '5', color: '#cac5c0' },
            '6': { type: 'generic', symbol: '6', color: '#cac5c0' },
            '7': { type: 'generic', symbol: '7', color: '#cac5c0' },
            '8': { type: 'generic', symbol: '8', color: '#cac5c0' },
            '9': { type: 'generic', symbol: '9', color: '#cac5c0' },
            '10': { type: 'generic', symbol: '10', color: '#cac5c0' },
            '11': { type: 'generic', symbol: '11', color: '#cac5c0' },
            '12': { type: 'generic', symbol: '12', color: '#cac5c0' },
            '13': { type: 'generic', symbol: '13', color: '#cac5c0' },
            '14': { type: 'generic', symbol: '14', color: '#cac5c0' },
            '15': { type: 'generic', symbol: '15', color: '#cac5c0' },
            '16': { type: 'generic', symbol: '16', color: '#cac5c0' },
            '20': { type: 'generic', symbol: '20', color: '#cac5c0' },
            'X': { type: 'generic', symbol: 'X', color: '#cac5c0' },
            'Y': { type: 'generic', symbol: 'Y', color: '#cac5c0' },
            'Z': { type: 'generic', symbol: 'Z', color: '#cac5c0' },

            // Basic colors
            'W': { type: 'color', symbol: 'W', color: '#fffbd5', textColor: '#000' },
            'U': { type: 'color', symbol: 'U', color: '#0e68ab', textColor: '#fff' },
            'B': { type: 'color', symbol: 'B', color: '#150b00', textColor: '#fff' },
            'R': { type: 'color', symbol: 'R', color: '#d3202a', textColor: '#fff' },
            'G': { type: 'color', symbol: 'G', color: '#00733e', textColor: '#fff' },
            'C': { type: 'colorless', symbol: 'C', color: '#cac5c0', textColor: '#000' },

            // Hybrid mana
            'W/U': { type: 'hybrid', symbol: 'W/U', colors: ['#fffbd5', '#0e68ab'], textColor: '#000' },
            'W/B': { type: 'hybrid', symbol: 'W/B', colors: ['#fffbd5', '#150b00'], textColor: '#000' },
            'U/B': { type: 'hybrid', symbol: 'U/B', colors: ['#0e68ab', '#150b00'], textColor: '#fff' },
            'U/R': { type: 'hybrid', symbol: 'U/R', colors: ['#0e68ab', '#d3202a'], textColor: '#fff' },
            'B/R': { type: 'hybrid', symbol: 'B/R', colors: ['#150b00', '#d3202a'], textColor: '#fff' },
            'B/G': { type: 'hybrid', symbol: 'B/G', colors: ['#150b00', '#00733e'], textColor: '#fff' },
            'R/G': { type: 'hybrid', symbol: 'R/G', colors: ['#d3202a', '#00733e'], textColor: '#fff' },
            'R/W': { type: 'hybrid', symbol: 'R/W', colors: ['#d3202a', '#fffbd5'], textColor: '#000' },
            'G/W': { type: 'hybrid', symbol: 'G/W', colors: ['#00733e', '#fffbd5'], textColor: '#000' },
            'G/U': { type: 'hybrid', symbol: 'G/U', colors: ['#00733e', '#0e68ab'], textColor: '#fff' },

            // Phyrexian mana
            'W/P': { type: 'phyrexian', symbol: 'W/Φ', color: '#fffbd5', textColor: '#000' },
            'U/P': { type: 'phyrexian', symbol: 'U/Φ', color: '#0e68ab', textColor: '#fff' },
            'B/P': { type: 'phyrexian', symbol: 'B/Φ', color: '#150b00', textColor: '#fff' },
            'R/P': { type: 'phyrexian', symbol: 'R/Φ', color: '#d3202a', textColor: '#fff' },
            'G/P': { type: 'phyrexian', symbol: 'G/Φ', color: '#00733e', textColor: '#fff' },

            // Hybrid generic
            '2/W': { type: 'hybrid-generic', symbol: '2/W', colors: ['#cac5c0', '#fffbd5'], textColor: '#000' },
            '2/U': { type: 'hybrid-generic', symbol: '2/U', colors: ['#cac5c0', '#0e68ab'], textColor: '#fff' },
            '2/B': { type: 'hybrid-generic', symbol: '2/B', colors: ['#cac5c0', '#150b00'], textColor: '#fff' },
            '2/R': { type: 'hybrid-generic', symbol: '2/R', colors: ['#cac5c0', '#d3202a'], textColor: '#fff' },
            '2/G': { type: 'hybrid-generic', symbol: '2/G', colors: ['#cac5c0', '#00733e'], textColor: '#fff' },

            // Special symbols
            'S': { type: 'special', symbol: 'S', color: '#cac5c0', textColor: '#000' }, // Snow
            'T': { type: 'special', symbol: '⟲', color: '#cac5c0', textColor: '#000' }, // Tap
            'Q': { type: 'special', symbol: '⟳', color: '#cac5c0', textColor: '#000' }, // Untap
            'E': { type: 'special', symbol: 'E', color: '#cac5c0', textColor: '#000' }, // Energy
            'CHAOS': { type: 'special', symbol: '☄', color: '#ff6b6b', textColor: '#fff' },
            'PW': { type: 'special', symbol: 'PW', color: '#9c27b0', textColor: '#fff' }
        };
    }

    // Convert mana cost string to HTML with mana symbols
    renderManaSymbols(manaCost) {
        if (!manaCost) return '';

        // Match all mana symbols in curly braces
        const symbolRegex = /\{([^}]+)\}/g;
        
        return manaCost.replace(symbolRegex, (match, symbol) => {
            return this.createManaSymbolHTML(symbol);
        });
    }

    // Create HTML for a single mana symbol
    createManaSymbolHTML(symbol) {
        const symbolData = this.symbolMap[symbol.toUpperCase()];
        
        if (!symbolData) {
            // Fallback for unknown symbols
            return `<span class="mana-symbol mana-unknown" title="Unknown: {${symbol}}">${symbol}</span>`;
        }

        const classes = ['mana-symbol', `mana-${symbolData.type}`];
        let style = '';
        let content = symbolData.symbol;

        switch (symbolData.type) {
            case 'generic':
                style = `background: ${symbolData.color}; color: ${symbolData.textColor || '#000'};`;
                break;
            case 'color':
                style = `background: ${symbolData.color}; color: ${symbolData.textColor};`;
                break;
            case 'colorless':
                style = `background: ${symbolData.color}; color: ${symbolData.textColor};`;
                break;
            case 'hybrid':
                style = `background: linear-gradient(45deg, ${symbolData.colors[0]} 50%, ${symbolData.colors[1]} 50%); color: ${symbolData.textColor};`;
                break;
            case 'hybrid-generic':
                style = `background: linear-gradient(45deg, ${symbolData.colors[0]} 50%, ${symbolData.colors[1]} 50%); color: ${symbolData.textColor};`;
                break;
            case 'phyrexian':
                style = `background: ${symbolData.color}; color: ${symbolData.textColor}; border: 2px solid #8b0000;`;
                break;
            case 'special':
                style = `background: ${symbolData.color}; color: ${symbolData.textColor};`;
                break;
        }

        return `<span class="${classes.join(' ')}" style="${style}" title="{${symbol}}">${content}</span>`;
    }

    // Inject CSS styles for mana symbols
    injectManaSymbolStyles() {
        const styleId = 'mana-symbol-styles';
        if (document.getElementById(styleId)) return;

        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            .mana-symbol {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                font-size: 11px;
                font-weight: bold;
                font-family: 'Arial', sans-serif;
                text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3);
                margin: 0 1px;
                border: 1px solid rgba(0, 0, 0, 0.2);
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
                vertical-align: middle;
                line-height: 1;
                cursor: help;
                transition: transform 0.2s ease;
            }

            .mana-symbol:hover {
                transform: scale(1.2);
                z-index: 10;
                position: relative;
            }

            .mana-symbol.mana-generic {
                background: #cac5c0 !important;
                color: #000 !important;
                border-color: #999;
            }

            .mana-symbol.mana-color {
                border-color: rgba(255, 255, 255, 0.3);
            }

            .mana-symbol.mana-hybrid {
                border-color: rgba(255, 255, 255, 0.4);
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
            }

            .mana-symbol.mana-phyrexian {
                box-shadow: 0 0 5px rgba(139, 0, 0, 0.5);
                animation: phyrexianGlow 2s ease-in-out infinite alternate;
            }

            @keyframes phyrexianGlow {
                from { box-shadow: 0 0 5px rgba(139, 0, 0, 0.5); }
                to { box-shadow: 0 0 8px rgba(139, 0, 0, 0.8); }
            }

            .mana-symbol.mana-special {
                border-color: #666;
            }

            .mana-symbol.mana-unknown {
                background: #ff6b6b !important;
                color: white !important;
                border-color: #d32f2f;
                font-size: 9px;
            }

            /* Larger symbols for headers and important displays */
            .mana-cost-large .mana-symbol {
                width: 24px;
                height: 24px;
                font-size: 13px;
                margin: 0 2px;
            }

            .mana-cost-xlarge .mana-symbol {
                width: 32px;
                height: 32px;
                font-size: 16px;
                margin: 0 3px;
            }

            /* Smaller symbols for compact displays */
            .mana-cost-small .mana-symbol {
                width: 16px;
                height: 16px;
                font-size: 9px;
                margin: 0 1px;
            }

            /* Inline mana costs */
            .mana-cost-inline {
                display: inline-flex;
                align-items: center;
                gap: 1px;
                vertical-align: middle;
            }

            /* Card display mana costs */
            .card-mana-cost {
                display: flex;
                align-items: center;
                gap: 2px;
                margin: 0.25rem 0;
                flex-wrap: wrap;
            }

            /* Search result mana costs */
            .search-mana-cost {
                display: inline-flex;
                align-items: center;
                gap: 1px;
                margin-left: 0.5rem;
            }

            /* Wishlist mana costs */
            .wishlist-mana-cost {
                display: flex;
                align-items: center;
                gap: 2px;
                margin: 0.25rem 0;
            }

            /* Mobile responsive adjustments */
            @media (max-width: 768px) {
                .mana-symbol {
                    width: 18px;
                    height: 18px;
                    font-size: 10px;
                }

                .mana-cost-large .mana-symbol {
                    width: 20px;
                    height: 20px;
                    font-size: 11px;
                }

                .mana-cost-xlarge .mana-symbol {
                    width: 28px;
                    height: 28px;
                    font-size: 14px;
                }
            }

            @media (max-width: 480px) {
                .mana-symbol {
                    width: 16px;
                    height: 16px;
                    font-size: 9px;
                    margin: 0;
                }

                .card-mana-cost,
                .wishlist-mana-cost {
                    gap: 1px;
                }
            }
        `;

        document.head.appendChild(style);
    }

    // Set up mutation observer to automatically convert mana symbols in new content
    setupManaSymbolObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.convertManaSymbolsInElement(node);
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Convert mana symbols in a specific element and its children
    convertManaSymbolsInElement(element) {
        // Skip if already processed or is a mana symbol itself
        if (element.classList?.contains('mana-symbol') || 
            element.classList?.contains('mana-symbols-processed')) {
            return;
        }

        // Find elements that might contain mana costs
        const selectors = [
            '.card-mana-cost',
            '.search-mana-cost',
            '.wishlist-mana-cost',
            '.mana-cost',
            '[data-mana-cost]',
            '.preview-mana-cost'
        ];

        // Check if the element itself matches
        if (selectors.some(selector => element.matches?.(selector))) {
            this.processElementManaSymbols(element);
        }

        // Check children
        selectors.forEach(selector => {
            const elements = element.querySelectorAll?.(selector);
            elements?.forEach(el => this.processElementManaSymbols(el));
        });

        // Mark as processed
        element.classList?.add('mana-symbols-processed');
    }

    // Process mana symbols in a specific element
    processElementManaSymbols(element) {
        if (element.classList.contains('mana-symbols-processed')) return;

        // Get mana cost from data attribute or text content
        let manaCost = element.dataset.manaCost || element.textContent;
        
        // Only process if it looks like a mana cost (contains curly braces)
        if (manaCost && manaCost.includes('{')) {
            const renderedSymbols = this.renderManaSymbols(manaCost);
            element.innerHTML = renderedSymbols;
            element.classList.add('mana-symbols-processed');
        }
    }

    // Public method to manually convert mana symbols in the entire document
    convertAllManaSymbols() {
        this.convertManaSymbolsInElement(document.body);
    }

    // Public method to convert a specific mana cost string
    convertManaString(manaCost) {
        return this.renderManaSymbols(manaCost);
    }

    // Helper method to create a mana cost display element
    createManaDisplay(manaCost, size = 'normal') {
        const container = document.createElement('div');
        container.className = `mana-cost-inline mana-cost-${size}`;
        container.innerHTML = this.renderManaSymbols(manaCost);
        return container;
    }

    // Method to update existing card displays with mana symbols
    updateCardDisplays() {
        // Update collection cards
        document.querySelectorAll('.card-item').forEach(card => {
            const manaCostElements = card.querySelectorAll('[data-mana-cost]');
            manaCostElements.forEach(element => {
                const manaCost = element.dataset.manaCost;
                if (manaCost) {
                    element.innerHTML = this.renderManaSymbols(manaCost);
                    element.classList.add('card-mana-cost', 'mana-symbols-processed');
                }
            });
        });

        // Update search results
        document.querySelectorAll('.search-card').forEach(card => {
            const manaCostElements = card.querySelectorAll('[data-mana-cost]');
            manaCostElements.forEach(element => {
                const manaCost = element.dataset.manaCost;
                if (manaCost) {
                    element.innerHTML = this.renderManaSymbols(manaCost);
                    element.classList.add('search-mana-cost', 'mana-symbols-processed');
                }
            });
        });

        // Update wishlist items
        document.querySelectorAll('.wishlist-item').forEach(item => {
            const manaCostElements = item.querySelectorAll('[data-mana-cost]');
            manaCostElements.forEach(element => {
                const manaCost = element.dataset.manaCost;
                if (manaCost) {
                    element.innerHTML = this.renderManaSymbols(manaCost);
                    element.classList.add('wishlist-mana-cost', 'mana-symbols-processed');
                }
            });
        });
    }

    // Method to get CMC (Converted Mana Cost) from mana cost string
    calculateCMC(manaCost) {
        if (!manaCost) return 0;

        let cmc = 0;
        const symbols = manaCost.match(/\{([^}]+)\}/g) || [];

        symbols.forEach(symbol => {
            const content = symbol.replace(/[{}]/g, '');
            
            // Handle numeric symbols
            if (/^\d+$/.test(content)) {
                cmc += parseInt(content);
            }
            // Handle X, Y, Z (count as 0 for CMC calculation)
            else if (/^[XYZ]$/.test(content)) {
                cmc += 0;
            }
            // Handle colored mana and hybrid mana (each counts as 1)
            else if (/^[WUBRG]$/.test(content) || content.includes('/')) {
                cmc += 1;
            }
            // Handle colorless mana
            else if (content === 'C') {
                cmc += 1;
            }
        });

        return cmc;
    }

    // Method to extract colors from mana cost
    extractColors(manaCost) {
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
        });

        return Array.from(colors);
    }
}

// Initialize the mana symbol renderer
let manaSymbolRenderer;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    manaSymbolRenderer = new ManaSymbolRenderer();
    window.manaSymbolRenderer = manaSymbolRenderer;
    
    // Convert existing mana symbols after a short delay to ensure all content is loaded
    setTimeout(() => {
        manaSymbolRenderer.convertAllManaSymbols();
    }, 500);
});

// Export for use in other modules
window.ManaSymbolRenderer = ManaSymbolRenderer;
