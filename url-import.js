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
        
        // Validate URL format
        try {
            new URL(url);
        } catch (error) {
            this.app.showNotification('Please enter a valid URL (e.g., https://example.com)', 'error');
            return;
        }
        
        // Check if the URL is from a supported site
        const hostname = new URL(url).hostname.toLowerCase();
        const parser = this.findParser(hostname);
        
        if (!parser) {
            this.app.showNotification(`Unsupported website: ${hostname}. Supported sites: Collectr, Moxfield, EDHRec, MTGGoldfish, Archidekt`, 'warning');
            return;
        }
        
        // Show loading state with progress updates
        const originalText = fetchBtn.innerHTML;
        fetchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Connecting...';
        fetchBtn.disabled = true;

        try {
            this.app.showNotification(`Attempting to fetch cards from ${hostname}...`, 'info');
            
            const cards = await this.importFromURL(url);
            
            if (cards && cards.length > 0) {
                // Use existing import preview system
                this.displayImportPreview(cards);
                this.app.showNotification(`Successfully found ${cards.length} cards from ${hostname}!`, 'success');
                
                // Clear the URL input on success
                urlInput.value = '';
            } else {
                this.app.showNotification(`No cards found at this URL. The page may not contain a card collection or may use an unsupported format.`, 'warning');
            }
        } catch (error) {
            console.error('URL import error:', error);
            
            // Provide more specific error messages
            let errorMessage = 'Error importing from URL';
            
            if (error.message.includes('CORS')) {
                errorMessage = 'Website blocks direct access. Please try the manual import method shown below.';
            } else if (error.message.includes('Failed to fetch')) {
                errorMessage = 'Unable to connect to the website. Please check the URL and try again.';
            } else if (error.message.includes('Unsupported website')) {
                errorMessage = error.message;
            } else if (error.message.includes('Failed to parse')) {
                errorMessage = 'Unable to parse the page content. The website may have changed its format.';
            } else {
                errorMessage = `Import failed: ${error.message}`;
            }
            
            this.app.showNotification(errorMessage, 'error');
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
        this.app.showNotification('Direct access blocked by website. Trying alternative methods...', 'info');
        
        // Option 1: Try multiple CORS proxies
        const proxies = [
            `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`,
            `https://corsproxy.io/?${encodeURIComponent(url)}`,
            `https://cors-anywhere.herokuapp.com/${url}`
        ];
        
        for (const proxyUrl of proxies) {
            try {
                console.log(`Trying proxy: ${proxyUrl}`);
                const response = await fetch(proxyUrl, {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                
                if (response.ok) {
                    let content;
                    if (proxyUrl.includes('allorigins.win')) {
                        const data = await response.json();
                        content = data.contents;
                    } else {
                        content = await response.text();
                    }
                    
                    if (content) {
                        const hostname = new URL(url).hostname.toLowerCase();
                        const parser = this.findParser(hostname);
                        const cards = await parser(content, url);
                        if (cards && cards.length > 0) {
                            return cards;
                        }
                    }
                }
            } catch (proxyError) {
                console.error(`Proxy ${proxyUrl} failed:`, proxyError);
                continue;
            }
        }

        // Option 2: Provide instructions for manual copy-paste
        this.showManualImportInstructions(url);
        throw new Error('Unable to access URL directly. Please use manual import method below.');
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

    // Enhanced Parser for Collectr.com
    async parseCollectr(html, url) {
        const cards = [];
        
        try {
            // Create a temporary DOM to parse the HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            console.log('Parsing Collectr page...');
            
            // Try multiple parsing strategies for different Collectr layouts
            
            // Strategy 1: Look for card entries with h3 headers (original approach)
            const h3Elements = doc.querySelectorAll('h3');
            console.log(`Found ${h3Elements.length} h3 elements`);
            
            h3Elements.forEach((cardElement, index) => {
                try {
                    const cardName = cardElement.textContent.trim();
                    
                    // Skip if it's not a card name
                    if (!cardName || 
                        cardName.includes('$') || 
                        cardName.includes('Total') || 
                        cardName.includes('Eric') ||
                        cardName.includes('Portfolio') ||
                        cardName.includes('Value') ||
                        cardName.length < 2) {
                        return;
                    }
                    
                    console.log(`Processing card: ${cardName}`);
                    
                    // Find the parent container to get additional info
                    const container = cardElement.closest('div, article, section');
                    if (!container) return;
                    
                    const containerText = container.textContent;
                    
                    // Extract set information - look for common MTG set patterns
                    let setName = '';
                    const setPatterns = [
                        /Set:\s*([^$\n]+)/i,
                        /Edition:\s*([^$\n]+)/i,
                        /\(([A-Z0-9]{3,4})\)/,  // Set codes like (DOM), (RNA)
                        /from\s+([^$\n]+?)(?:\s|$)/i
                    ];
                    
                    for (const pattern of setPatterns) {
                        const match = containerText.match(pattern);
                        if (match && match[1]) {
                            setName = match[1].trim();
                            break;
                        }
                    }
                    
                    // Extract quantity with multiple patterns
                    let quantity = 1;
                    const qtyPatterns = [
                        /Qty:\s*(\d+)/i,
                        /Quantity:\s*(\d+)/i,
                        /x(\d+)/i,
                        /(\d+)x/i
                    ];
                    
                    for (const pattern of qtyPatterns) {
                        const match = containerText.match(pattern);
                        if (match && match[1]) {
                            quantity = parseInt(match[1]) || 1;
                            break;
                        }
                    }
                    
                    // Extract foil status
                    let isFoil = false;
                    const foilPatterns = [
                        /\b(foil|Foil|FOIL)\b/,
                        /\b(premium|Premium|PREMIUM)\b/,
                        /✨/
                    ];
                    
                    for (const pattern of foilPatterns) {
                        if (containerText.match(pattern)) {
                            isFoil = true;
                            break;
                        }
                    }
                    
                    // Extract price with multiple currency formats
                    let price = 0;
                    const pricePatterns = [
                        /\$(\d+\.?\d*)/,
                        /USD\s*(\d+\.?\d*)/i,
                        /Price:\s*\$?(\d+\.?\d*)/i,
                        /Value:\s*\$?(\d+\.?\d*)/i
                    ];
                    
                    for (const pattern of pricePatterns) {
                        const match = containerText.match(pattern);
                        if (match && match[1]) {
                            price = parseFloat(match[1]) || 0;
                            break;
                        }
                    }
                    
                    // Clean up card name
                    let cleanCardName = cardName
                        .replace(/\s*\([^)]*\)\s*$/, '') // Remove parenthetical info
                        .replace(/\s*\[[^\]]*\]\s*$/, '') // Remove bracketed info
                        .replace(/\s*\{[^}]*\}\s*$/, '') // Remove curly brace info
                        .trim();
                    
                    if (cleanCardName && cleanCardName.length > 1) {
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
                        
                        console.log(`Added card: ${cleanCardName} (${quantity}x) from ${setName} - $${price}`);
                    }
                } catch (error) {
                    console.error(`Error parsing card element ${index}:`, error);
                }
            });
            
            // Strategy 2: Look for table-based layouts
            if (cards.length === 0) {
                console.log('Trying table-based parsing...');
                const tables = doc.querySelectorAll('table');
                tables.forEach(table => {
                    const rows = table.querySelectorAll('tr');
                    rows.forEach(row => {
                        const cells = row.querySelectorAll('td, th');
                        if (cells.length >= 2) {
                            const cardName = cells[0].textContent.trim();
                            if (cardName && !cardName.includes('Card') && !cardName.includes('Name')) {
                                cards.push({
                                    name: cardName,
                                    set: cells[1] ? cells[1].textContent.trim() : '',
                                    quantity: cells[2] ? parseInt(cells[2].textContent) || 1 : 1,
                                    condition: 'Near Mint',
                                    isFoil: false,
                                    purchasePrice: 0,
                                    currentPrice: 0,
                                    notes: `Imported from ${new URL(url).hostname}`,
                                    source: 'url-import'
                                });
                            }
                        }
                    });
                });
            }
            
            // Strategy 3: Look for list-based layouts
            if (cards.length === 0) {
                console.log('Trying list-based parsing...');
                const listItems = doc.querySelectorAll('li, .card-item, .collection-item');
                listItems.forEach(item => {
                    const text = item.textContent.trim();
                    if (text && text.length > 2 && !text.includes('$')) {
                        const cardName = text.split(/[(\[\{]/)[0].trim();
                        if (cardName) {
                            cards.push({
                                name: cardName,
                                set: '',
                                quantity: 1,
                                condition: 'Near Mint',
                                isFoil: false,
                                purchasePrice: 0,
                                currentPrice: 0,
                                notes: `Imported from ${new URL(url).hostname}`,
                                source: 'url-import'
                            });
                        }
                    }
                });
            }
            
            console.log(`Successfully parsed ${cards.length} cards from Collectr`);
            
        } catch (error) {
            console.error('Error parsing Collectr page:', error);
            throw new Error(`Failed to parse Collectr page: ${error.message}`);
        }
        
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
