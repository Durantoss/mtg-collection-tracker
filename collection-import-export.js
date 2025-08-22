// Collection Import/Export Module for MTG Collection Tracker

class CollectionImportExport {
    constructor(app) {
        this.app = app;
        this.supportedFormats = ['json', 'csv', 'deckbox', 'mtgo'];
        this.init();
    }

    init() {
        this.addImportExportButtons();
        this.setupEventListeners();
    }

    addImportExportButtons() {
        const collectionTab = document.getElementById('collection');
        const tabHeader = collectionTab.querySelector('.tab-header');
        
        if (!tabHeader.querySelector('.import-export-controls')) {
            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'import-export-controls';
            controlsDiv.innerHTML = `
                <div class="import-export-buttons">
                    <button class="btn btn-secondary" id="export-collection-btn">
                        <i class="fas fa-download"></i> Export
                    </button>
                    <button class="btn btn-secondary" id="import-collection-btn">
                        <i class="fas fa-upload"></i> Import
                    </button>
                </div>
            `;
            
            // Insert before the Add Card button
            const addCardBtn = tabHeader.querySelector('#add-card-btn');
            tabHeader.insertBefore(controlsDiv, addCardBtn);
        }
    }

    setupEventListeners() {
        const exportBtn = document.getElementById('export-collection-btn');
        const importBtn = document.getElementById('import-collection-btn');

        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.showExportModal());
        }

        if (importBtn) {
            importBtn.addEventListener('click', () => this.showImportModal());
        }
    }

    showExportModal() {
        const modal = this.createModal('export', 'Export Collection', `
            <div class="export-options">
                <h4>Choose Export Format:</h4>
                <div class="format-options">
                    <label class="format-option">
                        <input type="radio" name="export-format" value="json" checked>
                        <div class="format-details">
                            <strong>JSON</strong>
                            <p>Complete data with all fields, prices, and metadata. Best for backup and re-importing.</p>
                        </div>
                    </label>
                    <label class="format-option">
                        <input type="radio" name="export-format" value="csv">
                        <div class="format-details">
                            <strong>CSV</strong>
                            <p>Spreadsheet format compatible with Excel, Google Sheets, and other collection tools.</p>
                        </div>
                    </label>
                    <label class="format-option">
                        <input type="radio" name="export-format" value="deckbox">
                        <div class="format-details">
                            <strong>Deckbox CSV</strong>
                            <p>Compatible with Deckbox.org import format.</p>
                        </div>
                    </label>
                    <label class="format-option">
                        <input type="radio" name="export-format" value="mtgo">
                        <div class="format-details">
                            <strong>MTGO Format</strong>
                            <p>Magic Online compatible format for deck building.</p>
                        </div>
                    </label>
                </div>
                <div class="export-options-advanced">
                    <h4>Export Options:</h4>
                    <label class="checkbox-option">
                        <input type="checkbox" id="include-prices" checked>
                        <span>Include current prices</span>
                    </label>
                    <label class="checkbox-option">
                        <input type="checkbox" id="include-purchase-prices" checked>
                        <span>Include purchase prices</span>
                    </label>
                    <label class="checkbox-option">
                        <input type="checkbox" id="include-notes">
                        <span>Include notes</span>
                    </label>
                    <label class="checkbox-option">
                        <input type="checkbox" id="include-metadata" checked>
                        <span>Include metadata (date added, IDs, etc.)</span>
                    </label>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                <button class="btn btn-primary" onclick="collectionImportExport.performExport()">Export Collection</button>
            </div>
        `);

        document.body.appendChild(modal);
    }

    showImportModal() {
        const modal = this.createModal('import', 'Import Collection', `
            <div class="import-options">
                <h4>Import Collection Data:</h4>
                <div class="import-methods">
                    <div class="import-method active" data-method="file">
                        <h5><i class="fas fa-file-upload"></i> Upload File</h5>
                        <div class="file-upload-area" id="file-upload-area">
                            <input type="file" id="import-file" accept=".json,.csv,.txt" style="display: none;">
                            <div class="upload-placeholder">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <p>Click to select file or drag and drop</p>
                                <small>Supports: JSON, CSV, TXT formats</small>
                            </div>
                        </div>
                    </div>
                    <div class="import-method" data-method="text">
                        <h5><i class="fas fa-keyboard"></i> Paste Text</h5>
                        <textarea id="import-text" placeholder="Paste your collection data here...
Examples:
- Card names (one per line)
- CSV data
- JSON data
- MTGO export format"></textarea>
                    </div>
                </div>
                <div class="import-options-advanced">
                    <h4>Import Options:</h4>
                    <label class="checkbox-option">
                        <input type="checkbox" id="merge-collection" checked>
                        <span>Merge with existing collection (uncheck to replace)</span>
                    </label>
                    <label class="checkbox-option">
                        <input type="checkbox" id="update-prices">
                        <span>Fetch current prices for imported cards</span>
                    </label>
                    <label class="checkbox-option">
                        <input type="checkbox" id="skip-duplicates">
                        <span>Skip duplicate cards (same name and set)</span>
                    </label>
                </div>
                <div class="import-preview" id="import-preview" style="display: none;">
                    <h4>Import Preview:</h4>
                    <div class="preview-stats"></div>
                    <div class="preview-cards"></div>
                </div>
            </div>
            <div class="modal-actions">
                <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                <button class="btn btn-primary" onclick="collectionImportExport.performImport()" id="import-btn" disabled>Import Collection</button>
            </div>
        `);

        document.body.appendChild(modal);
        this.setupImportModalEvents();
    }

    setupImportModalEvents() {
        const fileInput = document.getElementById('import-file');
        const uploadArea = document.getElementById('file-upload-area');
        const importText = document.getElementById('import-text');
        const importMethods = document.querySelectorAll('.import-method');

        // File upload handling
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleFileUpload(files[0]);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0]);
            }
        });

        // Text input handling
        importText.addEventListener('input', () => {
            if (importText.value.trim()) {
                this.previewImport(importText.value.trim());
            }
        });

        // Method switching
        importMethods.forEach(method => {
            method.addEventListener('click', () => {
                importMethods.forEach(m => m.classList.remove('active'));
                method.classList.add('active');
            });
        });
    }

    async handleFileUpload(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            this.previewImport(content);
            
            // Update UI
            const uploadArea = document.getElementById('file-upload-area');
            uploadArea.innerHTML = `
                <div class="file-selected">
                    <i class="fas fa-file-check"></i>
                    <p><strong>${file.name}</strong></p>
                    <small>${(file.size / 1024).toFixed(1)} KB</small>
                </div>
            `;
        };
        reader.readAsText(file);
    }

    previewImport(data) {
        try {
            const parsedData = this.parseImportData(data);
            const preview = document.getElementById('import-preview');
            const importBtn = document.getElementById('import-btn');

            if (parsedData.length > 0) {
                preview.style.display = 'block';
                importBtn.disabled = false;

                const stats = this.calculateImportStats(parsedData);
                preview.querySelector('.preview-stats').innerHTML = `
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

                preview.querySelector('.preview-cards').innerHTML = `
                    <div class="preview-card-list">
                        ${parsedData.slice(0, 10).map(card => `
                            <div class="preview-card-item">
                                <span class="card-name">${card.name}</span>
                                <span class="card-quantity">×${card.quantity || 1}</span>
                                ${card.set ? `<span class="card-set">${card.set}</span>` : ''}
                            </div>
                        `).join('')}
                        ${parsedData.length > 10 ? `<div class="preview-more">...and ${parsedData.length - 10} more cards</div>` : ''}
                    </div>
                `;
            } else {
                preview.style.display = 'none';
                importBtn.disabled = true;
            }
        } catch (error) {
            console.error('Error parsing import data:', error);
            this.app.showNotification('Error parsing import data. Please check the format.', 'error');
        }
    }

    parseImportData(data) {
        const trimmedData = data.trim();
        
        // Try to parse as JSON first
        try {
            const jsonData = JSON.parse(trimmedData);
            if (Array.isArray(jsonData)) {
                return jsonData;
            } else if (jsonData.collection && Array.isArray(jsonData.collection)) {
                return jsonData.collection;
            }
        } catch (e) {
            // Not JSON, continue with other formats
        }

        // Try CSV format
        if (trimmedData.includes(',') || trimmedData.includes('\t')) {
            return this.parseCSV(trimmedData);
        }

        // Try simple card list (one per line)
        const lines = trimmedData.split('\n').filter(line => line.trim());
        return lines.map(line => {
            const match = line.match(/^(\d+)?\s*(.+?)(?:\s+\((.+?)\))?$/);
            if (match) {
                return {
                    name: match[2].trim(),
                    quantity: parseInt(match[1]) || 1,
                    set: match[3] || ''
                };
            }
            return { name: line.trim(), quantity: 1 };
        });
    }

    parseCSV(csvData) {
        const lines = csvData.split('\n').filter(line => line.trim());
        const headers = lines[0].toLowerCase().split(',').map(h => h.trim());
        
        return lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
            const card = {};
            
            headers.forEach((header, index) => {
                const value = values[index] || '';
                
                // Map common CSV headers to our format
                if (header.includes('name') || header.includes('card')) {
                    card.name = value;
                } else if (header.includes('quantity') || header.includes('count') || header.includes('qty')) {
                    card.quantity = parseInt(value) || 1;
                } else if (header.includes('set') || header.includes('edition')) {
                    card.set = value;
                } else if (header.includes('condition')) {
                    card.condition = value;
                } else if (header.includes('foil')) {
                    card.isFoil = value.toLowerCase() === 'true' || value.toLowerCase() === 'yes';
                } else if (header.includes('price')) {
                    card.purchasePrice = parseFloat(value) || 0;
                } else if (header.includes('note')) {
                    card.notes = value;
                }
            });
            
            return card;
        }).filter(card => card.name);
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

    async performImport() {
        const activeMethod = document.querySelector('.import-method.active');
        const mergeCollection = document.getElementById('merge-collection').checked;
        const updatePrices = document.getElementById('update-prices').checked;
        const skipDuplicates = document.getElementById('skip-duplicates').checked;

        let importData;
        if (activeMethod.dataset.method === 'file') {
            const fileContent = document.querySelector('.file-selected') ? 
                document.getElementById('import-text').value : null;
            if (!fileContent) {
                this.app.showNotification('Please select a file to import', 'warning');
                return;
            }
            importData = fileContent;
        } else {
            importData = document.getElementById('import-text').value.trim();
            if (!importData) {
                this.app.showNotification('Please enter data to import', 'warning');
                return;
            }
        }

        try {
            const parsedCards = this.parseImportData(importData);
            let importedCount = 0;
            let skippedCount = 0;

            // Show progress
            const importBtn = document.getElementById('import-btn');
            const originalText = importBtn.innerHTML;
            importBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Importing...';
            importBtn.disabled = true;

            // Clear collection if not merging
            if (!mergeCollection) {
                this.app.collection = [];
            }

            for (let i = 0; i < parsedCards.length; i++) {
                const cardData = parsedCards[i];
                
                // Check for duplicates
                if (skipDuplicates) {
                    const existing = this.app.collection.find(c => 
                        c.name.toLowerCase() === cardData.name.toLowerCase() && 
                        c.set === cardData.set
                    );
                    if (existing) {
                        skippedCount++;
                        continue;
                    }
                }

                // Create card object
                const newCard = {
                    id: Date.now() + i,
                    name: cardData.name,
                    set: cardData.set || '',
                    setCode: cardData.setCode || '',
                    quantity: cardData.quantity || 1,
                    condition: cardData.condition || 'Near Mint',
                    isFoil: cardData.isFoil || false,
                    purchasePrice: cardData.purchasePrice || 0,
                    notes: cardData.notes || '',
                    dateAdded: new Date().toISOString(),
                    currentPrice: cardData.currentPrice || 0
                };

                // Fetch current price if requested
                if (updatePrices) {
                    try {
                        const cardInfo = await this.app.fetchCardData(cardData.name, cardData.set);
                        newCard.currentPrice = parseFloat(cardInfo.prices?.usd || 0);
                        newCard.imageUrl = cardInfo.image_uris?.normal || cardInfo.image_uris?.small || '';
                        newCard.scryfallId = cardInfo.id || '';
                        newCard.type = cardInfo.type_line || '';
                        newCard.manaCost = cardInfo.mana_cost || '';
                        newCard.rarity = cardInfo.rarity || '';
                        
                        // Small delay to respect API limits
                        await new Promise(resolve => setTimeout(resolve, 100));
                    } catch (error) {
                        console.error(`Error fetching data for ${cardData.name}:`, error);
                    }
                }

                this.app.collection.push(newCard);
                importedCount++;

                // Update progress
                importBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Importing... ${importedCount}/${parsedCards.length}`;
            }

            // Save and update UI
            this.app.saveCollection();
            this.app.updateCollectionStats();
            this.app.renderCollection();
            this.app.populateSetFilter();

            // Close modal
            document.querySelector('.modal').remove();

            // Show success message
            let message = `Successfully imported ${importedCount} cards`;
            if (skippedCount > 0) {
                message += ` (${skippedCount} duplicates skipped)`;
            }
            this.app.showNotification(message, 'success');

        } catch (error) {
            console.error('Error importing collection:', error);
            this.app.showNotification('Error importing collection. Please check the data format.', 'error');
        }
    }

    async performExport() {
        const format = document.querySelector('input[name="export-format"]:checked').value;
        const includePrices = document.getElementById('include-prices').checked;
        const includePurchasePrices = document.getElementById('include-purchase-prices').checked;
        const includeNotes = document.getElementById('include-notes').checked;
        const includeMetadata = document.getElementById('include-metadata').checked;

        if (this.app.collection.length === 0) {
            this.app.showNotification('No cards in collection to export', 'warning');
            return;
        }

        let exportData;
        let filename;
        let mimeType;

        switch (format) {
            case 'json':
                exportData = this.exportAsJSON(includePrices, includePurchasePrices, includeNotes, includeMetadata);
                filename = `mtg-collection-${new Date().toISOString().split('T')[0]}.json`;
                mimeType = 'application/json';
                break;
            case 'csv':
                exportData = this.exportAsCSV(includePrices, includePurchasePrices, includeNotes, includeMetadata);
                filename = `mtg-collection-${new Date().toISOString().split('T')[0]}.csv`;
                mimeType = 'text/csv';
                break;
            case 'deckbox':
                exportData = this.exportAsDeckboxCSV();
                filename = `mtg-collection-deckbox-${new Date().toISOString().split('T')[0]}.csv`;
                mimeType = 'text/csv';
                break;
            case 'mtgo':
                exportData = this.exportAsMTGO();
                filename = `mtg-collection-mtgo-${new Date().toISOString().split('T')[0]}.txt`;
                mimeType = 'text/plain';
                break;
        }

        // Download file
        const blob = new Blob([exportData], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Close modal
        document.querySelector('.modal').remove();

        this.app.showNotification(`Collection exported as ${filename}`, 'success');
    }

    exportAsJSON(includePrices, includePurchasePrices, includeNotes, includeMetadata) {
        const exportCollection = this.app.collection.map(card => {
            const exportCard = {
                name: card.name,
                set: card.set,
                quantity: card.quantity,
                condition: card.condition,
                isFoil: card.isFoil
            };

            if (includePrices && card.currentPrice) {
                exportCard.currentPrice = card.currentPrice;
            }
            if (includePurchasePrices && card.purchasePrice) {
                exportCard.purchasePrice = card.purchasePrice;
            }
            if (includeNotes && card.notes) {
                exportCard.notes = card.notes;
            }
            if (includeMetadata) {
                exportCard.id = card.id;
                exportCard.setCode = card.setCode;
                exportCard.scryfallId = card.scryfallId;
                exportCard.imageUrl = card.imageUrl;
                exportCard.type = card.type;
                exportCard.manaCost = card.manaCost;
                exportCard.rarity = card.rarity;
                exportCard.dateAdded = card.dateAdded;
            }

            return exportCard;
        });

        return JSON.stringify({
            exportDate: new Date().toISOString(),
            totalCards: this.app.collection.reduce((sum, card) => sum + card.quantity, 0),
            uniqueCards: this.app.collection.length,
            collection: exportCollection
        }, null, 2);
    }

    exportAsCSV(includePrices, includePurchasePrices, includeNotes, includeMetadata) {
        const headers = ['Name', 'Set', 'Quantity', 'Condition', 'Foil'];
        
        if (includePrices) headers.push('Current Price');
        if (includePurchasePrices) headers.push('Purchase Price');
        if (includeNotes) headers.push('Notes');
        if (includeMetadata) headers.push('Set Code', 'Type', 'Mana Cost', 'Rarity', 'Date Added');

        const rows = [headers.join(',')];

        this.app.collection.forEach(card => {
            const row = [
                `"${card.name}"`,
                `"${card.set}"`,
                card.quantity,
                `"${card.condition}"`,
                card.isFoil ? 'Yes' : 'No'
            ];

            if (includePrices) row.push(card.currentPrice || 0);
            if (includePurchasePrices) row.push(card.purchasePrice || 0);
            if (includeNotes) row.push(`"${card.notes || ''}"`);
            if (includeMetadata) {
                row.push(
                    `"${card.setCode || ''}"`,
                    `"${card.type || ''}"`,
                    `"${card.manaCost || ''}"`,
                    `"${card.rarity || ''}"`,
                    `"${card.dateAdded || ''}"`
                );
            }

            rows.push(row.join(','));
        });

        return rows.join('\n');
    }

    exportAsDeckboxCSV() {
        const headers = ['Count', 'Name', 'Edition', 'Condition', 'Language', 'Foil', 'Signed', 'Artist Proof', 'Altered Art', 'Misprint', 'Promo', 'Textless', 'My Price'];
        const rows = [headers.join(',')];

        this.app.collection.forEach(card => {
            const row = [
                card.quantity,
                `"${card.name}"`,
                `"${card.set}"`,
                `"${card.condition}"`,
                'English',
                card.isFoil ? 'foil' : '',
                '', '', '', '', '', '',
                card.purchasePrice || ''
            ];
            rows.push(row.join(','));
        });

        return rows.join('\n');
    }

    exportAsMTGO() {
        const lines = [];
        this.app.collection.forEach(card => {
            lines.push(`${card.quantity} ${card.name}`);
        });
        return lines.join('\n');
    }

    createModal(type, title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content import-export-modal">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        return modal;
    }
}

// Add import/export styles
const importExportStyles = document.createElement('style');
importExportStyles.textContent = `
    .import-export-controls {
        display: flex;
        gap: 0.5rem;
        margin-right: 1rem;
    }

    .import-export-modal {
        max-width: 800px;
        max-height: 90vh;
        overflow-y: auto;
    }

    .format-options {
        display: grid;
        gap: 1rem;
        margin: 1rem 0;
    }

    .format-option {
        display: flex;
        align-items: flex-start;
        gap: 1rem;
        padding: 1rem;
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .format-option:hover {
        border-color: rgba(255, 215, 0, 0.5);
        background: rgba(255, 215, 0, 0.1);
    }

    .format-option input[type="radio"] {
        margin-top: 0.25rem;
    }

    .format-option input[type="radio"]:checked + .format-details {
        color: #ffd700;
    }

    .format-details strong {
        display: block;
        margin-bottom: 0.5rem;
        font-size: 1.1rem;
    }

    .format-details p {
        margin: 0;
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.9rem;
    }

    .export-options-advanced,
    .import-options-advanced {
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
    }

    .checkbox-option {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        cursor: pointer;
    }

    .import-methods {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin: 1rem 0;
    }

    .import-method {
        border: 2px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        padding: 1rem;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .import-method.active {
        border-color: #ffd700;
        background: rgba(255, 215, 0, 0.1);
    }

    .import-method h5 {
        margin: 0 0 1rem 0;
        color: #ffd700;
    }

    .file-upload-area {
        border: 2px dashed rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        padding: 2rem;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s ease;
    }

    .file-upload-area:hover,
    .file-upload-area.drag-over {
        border-color: #ffd700;
        background: rgba(255, 215, 0, 0.1);
    }

    .upload-placeholder i {
        font-size: 2rem;
        color: #ffd700;
        margin-bottom: 1rem;
    }

    .file-selected {
        color: #4CAF50;
    }

    .file-selected i {
        font-size: 2rem;
        margin-bottom: 1rem;
    }

    #import-text {
        width: 100%;
        height: 200px;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 4px;
        color: white;
        padding: 1rem;
        font-family: 'Courier New', monospace;
        font-size: 0.9rem;
        resize: vertical;
    }

    .import-preview {
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
    }

    .stats-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        margin-bottom: 1rem;
    }

    .stat-item {
        text-align: center;
        background: rgba(255, 255, 255, 0.1);
        padding: 1rem;
        border-radius: 8px;
    }

    .stat-item strong {
        display: block;
        font-size: 1.5rem;
        color: #ffd700;
        margin-bottom: 0.5rem;
    }

    .stat-item span {
        color: rgba(255, 255, 255, 0.8);
        font-size: 0.9rem;
    }

    .preview-card-list {
        max-height: 200px;
        overflow-y: auto;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 8px;
        padding: 1rem;
    }

    .preview-card-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.5rem 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .preview-card-item:last-child {
        border-bottom: none;
    }

    .card-name {
        flex: 1;
        font-weight: bold;
    }

    .card-quantity {
        color: #ffd700;
        font-weight: bold;
    }

    .card-set {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.9rem;
    }

    .preview-more {
        text-align: center;
        color: rgba(255, 255, 255, 0.7);
        font-style: italic;
        padding: 1rem 0;
    }

    @media (max-width: 768px) {
        .import-methods {
            grid-template-columns: 1fr;
        }
        
        .stats-grid {
            grid-template-columns: 1fr;
        }
        
        .import-export-modal {
            max-width: 95vw;
            margin: 1rem;
        }
    }
`;
document.head.appendChild(importExportStyles);

// Export for use in main app
window.CollectionImportExport = CollectionImportExport;
