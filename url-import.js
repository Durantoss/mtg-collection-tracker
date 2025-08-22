// URL Import Module for MTG Collection Tracker
// Supports importing collections from various websites including Collectr

class URLImporter {
    constructor(app) {
        this.app = app;
        this.supportedSites = {
            'getcollectr.com': this.parseCollectr.bind(this),
            'moxfield.com': this.parseMoxfield.bind(this),
            'edhrec.com': this.parseEDHRec.bind(this),
            'mtggoldfish.com': this.parseMTGGoldfish.bind(this),
            'archidekt.com': this.parseArchidekt.bind(this)
        };
        this.init();
    }

    init() {
        this.addURLImportToExistingModal();
    }

    addURLImportToExistingModal() {
        // Add URL import option to the existing import modal
        const importModal = document.querySelector('#import-modal');
        if (importModal) {
            // Add URL import method to existing methods
            const importMethods = importModal.querySelector('.import-methods');
            if (importMethods) {
                const urlMethod = document.createElement('div');
                urlMethod.className = 'import-method';
                urlMethod.setAttribute('data-method', 'url');
                urlMethod.innerHTML = `
                    <h5><i class="fas fa-link"></i> Import from URL</h5>
                    <div class="url-import-area">
                        <input type="url" id="import-url" placeholder="Enter URL (e.g., Collectr, Moxfield, EDHRec...)">
                        <button class="btn btn-secondary" id="fetch-url-btn">
                            <i class="fas fa-download"></i> Fetch Cards
                        </button>
                    </div>
                    <div class="supported-sites">
                        <small>Supports: Collectr, Moxfield, EDHRec, MTGGoldfish, Archidekt</small>
                    </div>
                `;
                importMethods.appendChild(urlMethod);
                
                // Add event listeners
                this.setupURLImportEvents();
            }
        }
    }

    setupURLImportEvents() {
        const fetchBtn = document.getElementById('fetch-url-btn');
        const urlInput = document.getElementById('import-url');
        
        if (fetchBtn && urlInput) {
            fetchBtn.addEventListener('click', () => this.handleURLImport());
            urlInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.handleURLImport();
            });
            
            // Switch to URL method when clicked
            const urlMethod = document.querySelector('[data-method="url"]');
            if (urlMethod) {
                urlMethod.addEventListener('click', () => {
                    document.querySelectorAll('.import-method').forEach(m => m.classList.remove('active'));
                    urlMethod.classList.add('active');
                });
            }
        }
    }

    async handleURLImport() {
        const urlInput = document.getElementById('import-url');
        const fetchBtn = document.getElementById('fetch-url-btn');
        
        if (!urlInput || !urlInput.value.trim()) {
            this.app.showNotification('Please enter a valid URL', 'warning');
            return;
        }

        const url = urlInput.value.trim();
        
        // Show loading state
        const originalText = fetchBtn.innerHTML;
        fetchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fetching...';
        fetchBtn.disabled = true;

        try {
            const cards = await this.importFromURL(url);
            
            if (cards && cards.length > 0) {
                // Use existing import preview system
                this.displayImportPreview(cards);
                this.app.showNotification(`Found ${cards.length} cards from URL!`, 'success');
            } else {
                this.app.showNotification('No cards found at this URL', 'warning');
            }
        } catch (error) {
            console.error('URL import error:', error);
            this.app.showNotification(`Error importing from URL: ${error.message}`, 'error');
        } finally {
            // Restore button state
            fetchBtn.innerHTML = originalText;
            fetchBtn.disabled = false;
        }
    }

    async importFromURL(url) {
        try {
            // Determine which parser to use based on URL
            const hostname = new URL(url).hostname.toLowerCase();
            const parser = this.findParser(hostname);
            
            if (!parser) {
                throw new Error(`Unsupported website: ${hostname}`);
            }

            // Fetch the page content
            const response = await fetch(url, {
                mode: 'cors',
                headers: {
                    'User-Agent': 'MTG Collection Tracker'
                }
            });

            if (!response.ok) {
                // If CORS fails, try using a proxy or alternative method
                throw new Error(`Failed to fetch page: ${response.status} ${response.statusText}`);
            }

            const html = await response.text();
            
            // Parse the content using the appropriate parser
            return await parser(html, url);
            
        } catch (error) {
            if (error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
                // Try alternative methods for CORS-blocked sites
                return await this.handleCORSError(url);
            }
            throw error;
        }
    }

    findParser(hostname) {
        for (const [site, parser] of Object.entries(this.supportedSites)) {
            if (hostname.includes(site)) {
                return parser;
            }
        }
        return null;
    }

    async handleCORSError(url) {
        // For CORS-blocked sites, we can try alternative approaches
        this.app.showNotification('Direct access blocked by website. Trying alternative method...', 'info');
        
        // Option 1: Try using a CORS proxy (be careful with this in production)
        try {
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);
            const data = await response.json();
            
            if (data.contents) {
                const hostname = new URL(url).hostname.toLowerCase();
                const parser = this.findParser(hostname);
                return await parser(data.contents, url);
            }
        } catch (proxyError) {
            console.error('Proxy method failed:', proxyError);
        }

        // Option 2: Provide instructions for manual copy-paste
        this.showManualImportInstructions(url);
        throw new Error('Unable to access URL directly. Please use manual import method.');
    }

    showManualImportInstructions(url) {
        const hostname = new URL(url).hostname;
        const instructions = document.createElement('div');
        instructions.className = 'manual-import-instructions';
        instructions.innerHTML = `
            <div class="instruction-header">
                <h4><i class="fas fa-info-circle"></i> Manual Import Required</h4>
                <p>This website blocks direct access. Please follow these steps:</p>
            </div>
            <div class="instruction-steps">
                <ol>
                    <li>Open <a href="${url}" target="_blank">${hostname}</a> in a new tab</li>
                    <li>Copy the card list from the page</li>
                    <li>Return here and paste it in the "Paste Text" import method</li>
                </ol>
            </div>
            <button class="btn btn-primary" onclick="this.parentElement.remove()">Got it</button>
        `;
        
        const importModal = document.querySelector('.import-options');
        if (importModal) {
            importModal.appendChild(instructions);
        }
    }

    // Parser for Collectr.com
    async parseCollectr(html, url) {
        const cards = [];
        
        // Create a temporary DOM to parse the HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Look for card entries in the Collectr format
        // Based on the structure we saw: card name, set, quantity, price
        const cardElements = doc.querySelectorAll('h3');
        
        cardElements.forEach(cardElement => {
            try {
                const cardName = cardElement.textContent.trim();
                
                // Skip if it's not a card name (like "Estimated Portfolio Value")
                if (!cardName || cardName.includes('$') || cardName.includes('Total') || cardName.includes('Eric')) {
                    return;
                }
                
                // Find the parent container to get additional info
                const container = cardElement.closest('div');
                if (!container) return;
                
                // Extract set information (usually appears after the card name)
                let setName = '';
                const setElement = container.querySelector('p, div');
                if (setElement) {
                    const text = setElement.textContent.trim();
                    // Set names are usually not prices or quantities
                    if (!text.includes('$') && !text.includes('Qty:') && text !== 'Magic: The Gathering') {
                        setName = text;
                    }
                }
                
                // Extract quantity
                let quantity = 1;
                const qtyMatch = container.textContent.match(/Qty:\s*(\d+)/i);
                if (qtyMatch) {
                    quantity = parseInt(qtyMatch[1]) || 1;
                }
                
                // Extract foil status
                let isFoil = false;
                const foilMatch = container.textContent.match(/\b(foil|Foil)\b/);
                if (foilMatch) {
                    isFoil = true;
                }
                
                // Extract price
                let price = 0;
                const priceMatch = container.textContent.match(/\$(\d+\.?\d*)/);
                if (priceMatch) {
                    price = parseFloat(priceMatch[1]) || 0;
                }
                
                // Clean up card name (remove parenthetical info that might be variants)
                let cleanCardName = cardName;
                // Remove common variant indicators but keep the core name
                cleanCardName = cleanCardName.replace(/\s*\([^)]*\)\s*$/, '').trim();
                
                if (cleanCardName) {
                    cards.push({
                        name: cleanCardName,
                        set: setName,
                        quantity: quantity,
                        condition: 'Near Mint', // Default condition
                        isFoil: isFoil,
                        purchasePrice: price,
                        currentPrice: price,
                        notes: `Imported from ${new URL(url).hostname}`,
                        source: 'url-import'
                    });
                }
            } catch (error) {
                console.error('Error parsing card element:', error);
            }
        });
        
        return cards;
    }

    // Parser for Moxfield.com (placeholder)
    async parseMoxfield(html, url) {
        // TODO: Implement Moxfield parser
        const cards = [];
        // Moxfield typically has JSON data in script tags
        return cards;
    }

    // Parser for EDHRec.com (placeholder)
    async parseEDHRec(html, url) {
        // TODO: Implement EDHRec parser
        const cards = [];
        return cards;
    }

    // Parser for MTGGoldfish.com (placeholder)
    async parseMTGGoldfish(html, url) {
        // TODO: Implement MTGGoldfish parser
        const cards = [];
        return cards;
    }

    // Parser for Archidekt.com (placeholder)
    async parseArchidekt(html, url) {
        // TODO: Implement Archidekt parser
        const cards = [];
        return cards;
    }

    displayImportPreview(cards) {
        // Use the existing import preview system from collection-import-export.js
        if (window.collectionImportExport) {
            // Convert our card format to the expected format
            const formattedData = cards.map(card => ({
                name: card.name,
                set: card.set,
                quantity: card.quantity,
                condition: card.condition,
                isFoil: card.isFoil,
                purchasePrice: card.purchasePrice,
                currentPrice: card.currentPrice,
                notes: card.notes
            }));
            
            // Simulate the import preview
            const importPreview = document.getElementById('import-preview');
            const importBtn = document.getElementById('import-btn');
            
            if (importPreview && importBtn) {
                importPreview.style.display = 'block';
                importBtn.disabled = false;
                
                const stats = this.calculateImportStats(formattedData);
                importPreview.querySelector('.preview-stats').innerHTML = `
                    <div class="stats-grid">
                        <div class="stat-item">
                            <strong>${stats.totalCards}</strong>
                            <span>Total Cards</span>
                        </div>
                        <div class="stat-item">
                            <strong>${stats.uniqueCards}</strong>
                            <span>Unique Cards</span>
                        </div>
                        <div class="stat-item">
                            <strong>${stats.estimatedValue}</strong>
                            <span>Est. Value</span>
                        </div>
                    </div>
                `;
                
                importPreview.querySelector('.preview-cards').innerHTML = `
                    <div class="preview-card-list">
                        ${formattedData.slice(0, 10).map(card => `
                            <div class="preview-card-item">
                                <span class="card-name">${card.name}</span>
                                <span class="card-quantity">×${card.quantity || 1}</span>
                                ${card.set ? `<span class="card-set">${card.set}</span>` : ''}
                                ${card.isFoil ? `<span class="foil-indicator">✨</span>` : ''}
                            </div>
                        `).join('')}
                        ${formattedData.length > 10 ? `<div class="preview-more">...and ${formattedData.length - 10} more cards</div>` : ''}
                    </div>
                `;
                
                // Store the parsed data for import
                window.urlImportData = formattedData;
            }
        }
    }

    calculateImportStats(cards) {
        const totalCards = cards.reduce((sum, card) => sum + (card.quantity || 1), 0);
        const uniqueCards = cards.length;
        const estimatedValue = cards.reduce((sum, card) => {
            const price = card.purchasePrice || card.currentPrice || 0;
            return sum + (price * (card.quantity || 1));
        }, 0);

        return {
            totalCards,
            uniqueCards,
            estimatedValue: `$${estimatedValue.toFixed(2)}`
        };
    }
}

// Add URL import styles
const urlImportStyles = document.createElement('style');
urlImportStyles.textContent = `
    .url-import-area {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1rem;
    }
    
    #import-url {
        flex: 1;
        padding: 0.5rem;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 4px;
        background: rgba(0, 0, 0, 0.2);
        color: white;
        font-size: 0.9rem;
    }
    
    #import-url::placeholder {
        color: rgba(255, 255, 255, 0.5);
    }
    
    #fetch-url-btn {
        white-space: nowrap;
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
    }
    
    .supported-sites {
        color: rgba(255, 255, 255, 0.7);
        font-style: italic;
    }
    
    .manual-import-instructions {
        background: rgba(255, 193, 7, 0.1);
        border: 1px solid rgba(255, 193, 7, 0.3);
        border-radius: 8px;
        padding: 1rem;
        margin: 1rem 0;
    }
    
    .instruction-header h4 {
        color: #ffc107;
        margin: 0 0 0.5rem 0;
    }
    
    .instruction-steps ol {
        margin: 1rem 0;
        padding-left: 1.5rem;
    }
    
    .instruction-steps li {
        margin-bottom: 0.5rem;
    }
    
    .instruction-steps a {
        color: #ffd700;
        text-decoration: underline;
    }
    
    .foil-indicator {
        color: #ffd700;
        font-size: 0.8rem;
    }
    
    @media (max-width: 768px) {
        .url-import-area {
            flex-direction: column;
        }
        
        #fetch-url-btn {
            width: 100%;
        }
    }
`;
document.head.appendChild(urlImportStyles);

// Export for use in main app
window.URLImporter = URLImporter;
