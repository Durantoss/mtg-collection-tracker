// Collection Import/Export Module for MTG Collection Tracker

class CollectionImportExport {
    constructor(app) {
        this.app = app;
        this.supportedFormats = ['json', 'csv', 'deckbox', 'mtgo'];
        this.storedFileContent = null;
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
                    <div class="import-method" data-method="url">
                        <h5><i class="fas fa-link"></i> Import from URL</h5>
                        <div class="url-import-area">
                            <input type="url" id="import-url" placeholder="Enter collection URL (e.g., Collectr, Deckbox, etc.)">
                            <button type="button" class="btn btn-secondary" id="fetch-url-btn">
                                <i class="fas fa-download"></i> Fetch Collection
                            </button>
                            <div class="url-import-status" id="url-import-status"></div>
                            <div class="supported-sites">
                                <small>Supported sites: Collectr.com, and more coming soon</small>
                            </div>
                        </div>
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
                <button class="btn btn-primary" id="import-btn" disabled>Import Collection</button>
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

        // URL import handling
        const importUrl = document.getElementById('import-url');
        const fetchUrlBtn = document.getElementById('fetch-url-btn');
        const urlImportStatus = document.getElementById('url-import-status');

        if (fetchUrlBtn) {
            fetchUrlBtn.addEventListener('click', async () => {
                const url = importUrl.value.trim();
                if (!url) {
                    this.app.showNotification('Please enter a URL to import from', 'warning');
                    return;
                }

                // Show loading state
                fetchUrlBtn.disabled = true;
                fetchUrlBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fetching...';
                urlImportStatus.innerHTML = '<div class="status-loading">Fetching collection data...</div>';

                try {
                    // Use the URL import functionality
                    if (window.URLImporter) {
                        const urlImporter = new window.URLImporter();
                        const cards = await urlImporter.importFromURL(url);
                        
                        if (cards && cards.length > 0) {
                            // Store the imported data for the main import process
                            window.urlImportData = cards;
                            
                            // Show success and preview
                            urlImportStatus.innerHTML = `<div class="status-success">Successfully fetched ${cards.length} cards!</div>`;
                            this.previewImport(JSON.stringify(cards));
                        } else {
                            urlImportStatus.innerHTML = '<div class="status-error">No cards found at the provided URL</div>';
                        }
                    } else {
                        throw new Error('URL import functionality not available');
                    }
                } catch (error) {
                    console.error('URL import error:', error);
                    urlImportStatus.innerHTML = `<div class="status-error">Error: ${error.message}</div>`;
                } finally {
                    // Reset button state
                    fetchUrlBtn.disabled = false;
                    fetchUrlBtn.innerHTML = '<i class="fas fa-download"></i> Fetch Collection';
                }
            });
        }

        // Method switching
        importMethods.forEach(method => {
            method.addEventListener('click', () => {
                importMethods.forEach(m => m.classList.remove('active'));
                method.classList.add('active');
            });
        });

        // Import button event listener
        const importBtn = document.getElementById('import-btn');
        if (importBtn) {
            importBtn.addEventListener('click', () => this.performImport());
        }
    }

    async handleFileUpload(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            this.storedFileContent = content; // Store for later use
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
        const headers = lines[0].split('\t').map(h => h.trim()); // Use tab delimiter for your format
        
        // Check if this is the specific collection format with known headers
        if (headers.includes('Product Name') && headers.includes('Category') && headers.includes('Quantity')) {
            return this.parseCollectionCSV(lines, headers);
        }
        
        // Fallback to generic CSV parsing
        const csvHeaders = headers.length === 1 ? lines[0].toLowerCase().split(',').map(h => h.trim()) : headers.map(h => h.toLowerCase());
        
        return lines.slice(1).map(line => {
            const values = csvHeaders.length === 1 ? line.split(',').map(v => v.trim().replace(/^"|"$/g, '')) : line.split('\t').map(v => v.trim());
            const card = {};
            
            csvHeaders.forEach((header, index) => {
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

    parseCollectionCSV(lines, headers) {
        console.log('Parsing specialized collection CSV format...');
        
        // Map header indices for your specific format
        const headerMap = {};
        headers.forEach((header, index) => {
            headerMap[header] = index;
        });
        
        const cards = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split('\t');
            
            // Skip if not enough values or not MTG cards
            if (values.length < headers.length || values[headerMap['Category']] !== 'Magic: The Gathering') {
                continue;
            }
            
            const card = {
                name: values[headerMap['Product Name']] || '',
                set: values[headerMap['Set']] || '',
                quantity: parseInt(values[headerMap['Quantity']]) || 1,
                condition: values[headerMap['Card Condition']] || 'Near Mint',
                rarity: values[headerMap['Rarity']] || '',
                purchasePrice: parseFloat(values[headerMap['Average Cost Paid']]) || 0,
                currentPrice: parseFloat(values[headerMap['Market Price (As of 2025-08-22)']]) || 0,
                isFoil: values[headerMap['Variance']] !== 'Normal',
                cardNumber: values[headerMap['Card Number']] || '',
                grade: values[headerMap['Grade']] || 'Ungraded',
                dateAdded: values[headerMap['Date Added']] || new Date().toISOString().split('T')[0]
            };
            
            // Only add cards with valid names
            if (card.name && card.name.trim()) {
                cards.push(card);
            }
        }
        
        console.log(`Parsed ${cards.length} cards from collection CSV`);
        return cards;
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
        let parsedCards;

        // Handle URL import data
        if (activeMethod && activeMethod.dataset.method === 'url' && window.urlImportData) {
            parsedCards = window.urlImportData;
            // Clear the stored data
            window.urlImportData = null;
        } else if (activeMethod && activeMethod.dataset.method === 'file') {
            // Get the stored file content from the file upload
            importData = this.storedFileContent;
            if (!importData) {
                this.app.showNotification('Please select a file to import', 'warning');
                return;
            }
            parsedCards = this.parseImportData(importData);
        } else {
            importData = document.getElementById('import-text').value.trim();
            if (!importData) {
                this.app.showNotification('Please enter data to import', 'warning');
                return;
            }
            parsedCards = this.parseImportData(importData);
        }

        // Use bulk import for large collections (>100 cards)
        if (parsedCards.length > 100) {
            return this.performBulkImport(parsedCards, mergeCollection, updatePrices, skipDuplicates);
        }

        // Standard import for smaller collections
        return this.performStandardImport(parsedCards, mergeCollection, updatePrices, skipDuplicates);
    }

    async performBulkImport(parsedCards, mergeCollection, updatePrices, skipDuplicates) {
        console.log(`Starting bulk import of ${parsedCards.length} cards...`);
        
        // Create progress modal
        const progressModal = this.createProgressModal(parsedCards.length);
        document.body.appendChild(progressModal);
        
        // Close the import modal
        const importModal = document.querySelector('.modal:not(.progress-modal)');
        if (importModal) importModal.remove();

        try {
            let importedCount = 0;
            let skippedCount = 0;
            let errorCount = 0;
            const batchSize = 50; // Process in batches of 50
            const errors = [];

            // Clear collection if not merging
            if (!mergeCollection) {
                this.app.collection = [];
            }

            // Process in batches
            for (let batchStart = 0; batchStart < parsedCards.length; batchStart += batchSize) {
                const batch = parsedCards.slice(batchStart, Math.min(batchStart + batchSize, parsedCards.length));
                
                this.updateProgress(progressModal, batchStart, parsedCards.length, `Processing batch ${Math.floor(batchStart / batchSize) + 1}...`);

                for (let i = 0; i < batch.length; i++) {
                    const cardData = batch[i];
                    
                    try {
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

                        // Create card object with all available data
                        const newCard = {
                            id: Date.now() + batchStart + i,
                            name: cardData.name,
                            set: cardData.set || '',
                            setCode: cardData.setCode || '',
                            quantity: cardData.quantity || 1,
                            condition: cardData.condition || 'Near Mint',
                            isFoil: cardData.isFoil || false,
                            purchasePrice: cardData.purchasePrice || 0,
                            notes: cardData.notes || '',
                            dateAdded: cardData.dateAdded || new Date().toISOString(),
                            currentPrice: cardData.currentPrice || 0,
                            rarity: cardData.rarity || '',
                            cardNumber: cardData.cardNumber || '',
                            grade: cardData.grade || 'Ungraded'
                        };

                        // Only fetch additional data if updatePrices is enabled and we don't have current price
                        if (updatePrices && !newCard.currentPrice) {
                            try {
                                const cardInfo = await this.app.fetchCardData(cardData.name, cardData.set);
                                newCard.currentPrice = parseFloat(cardInfo.prices?.usd || 0);
                                newCard.imageUrl = cardInfo.image_uris?.normal || cardInfo.image_uris?.small || '';
                                newCard.scryfallId = cardInfo.id || '';
                                newCard.type = cardInfo.type_line || '';
                                newCard.manaCost = cardInfo.mana_cost || '';
                                if (!newCard.rarity) newCard.rarity = cardInfo.rarity || '';
                                
                                // Respect API limits
                                await new Promise(resolve => setTimeout(resolve, 75));
                            } catch (error) {
                                console.warn(`Could not fetch data for ${cardData.name}:`, error.message);
                            }
                        }

                        this.app.collection.push(newCard);
                        importedCount++;

                    } catch (error) {
                        console.error(`Error processing card ${cardData.name}:`, error);
                        errors.push({ card: cardData.name, error: error.message });
                        errorCount++;
                    }
                }

                // Save progress periodically
                if (batchStart % (batchSize * 4) === 0) {
                    this.app.saveCollection();
                }

                // Update progress
                this.updateProgress(progressModal, batchStart + batch.length, parsedCards.length, 
                    `Imported ${importedCount} cards...`);
            }

            // Final save and UI update
            this.app.saveCollection();
            this.app.updateCollectionStats();
            this.app.renderCollection();
            this.app.populateSetFilter();

            // Close progress modal
            progressModal.remove();

            // Show completion message
            let message = `Bulk import completed! Imported ${importedCount} cards`;
            if (skippedCount > 0) message += `, skipped ${skippedCount} duplicates`;
            if (errorCount > 0) message += `, ${errorCount} errors`;

            this.app.showNotification(message, importedCount > 0 ? 'success' : 'warning');

            // Show error details if any
            if (errors.length > 0) {
                console.warn('Import errors:', errors);
            }

        } catch (error) {
            console.error('Bulk import failed:', error);
            progressModal.remove();
            this.app.showNotification('Bulk import failed. Please try again.', 'error');
        }
    }

    async performStandardImport(parsedCards, mergeCollection, updatePrices, skipDuplicates) {
        try {
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

    createProgressModal(totalCards) {
        const modal = document.createElement('div');
        modal.className = 'modal active progress-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Importing ${totalCards} Cards</h3>
                </div>
                <div class="modal-body">
                    <div class="progress-container">
                        <div class="progress-bar">
                            <div class="progress-fill" id="progress-fill"></div>
                        </div>
                        <div class="progress-text" id="progress-text">Preparing import...</div>
                        <div class="progress-stats" id="progress-stats">0 / ${totalCards} cards processed</div>
                    </div>
                </div>
            </div>
        `;
        return modal;
    }

    updateProgress(modal, current, total, message) {
        const progressFill = modal.querySelector('#progress-fill');
        const progressText = modal.querySelector('#progress-text');
        const progressStats = modal.querySelector('#progress-stats');
        
        const percentage = Math.round((current / total) * 100);
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = message;
        }
        
        if (progressStats) {
            progressStats.textContent = `${current} / ${total} cards processed (${percentage}%)`;
        }
    }

    async performExport() {
        const format = document.querySelector('input[name="export-format"]:checked').value;
        const includePrices = document.getElementById('include-prices').checked;
        const includePurchasePrices = document.getElementById('include-purchase-prices').checked;
        const includeNotes = document.getElementById('include-notes').checked;
        const includeMetadata = document.getElementById('include-metadata').checked;

        try {
            let exportData;
            let filename;
            let mimeType;

            switch (format) {
                case 'json':
                    exportData = this.exportToJSON(includePrices, includePurchasePrices, includeNotes, includeMetadata);
                    filename = `mtg-collection-${new Date().toISOString().split('T')[0]}.json`;
                    mimeType = 'application/json';
                    break;
                case 'csv':
                    exportData = this.exportToCSV(includePrices, includePurchasePrices, includeNotes, includeMetadata);
                    filename = `mtg-collection-${new Date().toISOString().split('T')[0]}.csv`;
                    mimeType = 'text/csv';
                    break;
                case 'deckbox':
                    exportData = this.exportToDeckbox();
                    filename = `mtg-collection-deckbox-${new Date().toISOString().split('T')[0]}.csv`;
                    mimeType = 'text/csv';
                    break;
                case 'mtgo':
                    exportData = this.exportToMTGO();
                    filename = `mtg-collection-mtgo-${new Date().toISOString().split('T')[0]}.txt`;
                    mimeType = 'text/plain';
                    break;
                default:
                    throw new Error('Unsupported export format');
            }

            // Create and download file
            const blob = new Blob([exportData], { type: mimeType });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Close modal and show success
            document.querySelector('.modal').remove();
            this.app.showNotification(`Collection exported successfully as ${filename}`, 'success');

        } catch (error) {
            console.error('Export error:', error);
            this.app.showNotification('Error exporting collection. Please try again.', 'error');
        }
    }

    exportToJSON(includePrices, includePurchasePrices, includeNotes, includeMetadata) {
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
                exportCard.dateAdded = card.dateAdded;
                exportCard.setCode = card.setCode;
                exportCard.rarity = card.rarity;
                exportCard.type = card.type;
                exportCard.manaCost = card.manaCost;
                exportCard.scryfallId = card.scryfallId;
            }

            return exportCard;
        });

        return JSON.stringify({
            collection: exportCollection,
            exportDate: new Date().toISOString(),
            totalCards: this.app.collection.reduce((sum, card) => sum + card.quantity, 0),
            uniqueCards: this.app.collection.length
        }, null, 2);
    }

    exportToCSV(includePrices, includePurchasePrices, includeNotes, includeMetadata) {
        const headers = ['Name', 'Set', 'Quantity', 'Condition', 'Foil'];
        
        if (includePrices) headers.push('Current Price');
        if (includePurchasePrices) headers.push('Purchase Price');
        if (includeNotes) headers.push('Notes');
        if (includeMetadata) headers.push('Date Added', 'Rarity', 'Type', 'Mana Cost');

        const rows = [headers.join(',')];

        this.app.collection.forEach(card => {
            const row = [
                `"${card.name}"`,
                `"${card.set || ''}"`,
                card.quantity,
                `"${card.condition}"`,
                card.isFoil ? 'Yes' : 'No'
            ];

            if (includePrices) row.push(card.currentPrice || 0);
            if (includePurchasePrices) row.push(card.purchasePrice || 0);
            if (includeNotes) row.push(`"${(card.notes || '').replace(/"/g, '""')}"`);
            if (includeMetadata) {
                row.push(
                    `"${card.dateAdded || ''}"`,
                    `"${card.rarity || ''}"`,
                    `"${card.type || ''}"`,
                    `"${card.manaCost || ''}"`
                );
            }

            rows.push(row.join(','));
        });

        return rows.join('\n');
    }

    exportToDeckbox() {
        const headers = ['Count', 'Name', 'Edition', 'Condition', 'Language', 'Foil', 'Signed', 'Artist Proof', 'Altered Art', 'Misprint', 'Promo', 'Textless', 'My Price'];
        const rows = [headers.join(',')];

        this.app.collection.forEach(card => {
            const row = [
                card.quantity,
                `"${card.name}"`,
                `"${card.set || ''}"`,
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

    exportToMTGO() {
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
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        return modal;
    }
}

// Initialize when DOM is loaded
if (typeof window !== 'undefined') {
    window.CollectionImportExport = CollectionImportExport;
}
