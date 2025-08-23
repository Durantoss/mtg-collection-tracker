// Enhanced Deck Builder JavaScript - MTG Collection Tracker
// Provides comprehensive deck building functionality with collection integration

class DeckBuilder {
    constructor(app) {
        this.app = app;
        this.currentDeck = [];
        this.deckName = '';
        this.savedDecks = JSON.parse(localStorage.getItem('mtgSavedDecks')) || {};
        this.deckStats = {
            totalCards: 0,
            creatures: 0,
            spells: 0,
            lands: 0,
            avgCmc: 0.0
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderDeckList();
        this.updateDeckStats();
        this.updateManaCurve();
        this.loadCollectionPreview();
    }

    setupEventListeners() {
        // Deck management buttons
        const saveDeckBtn = document.getElementById('save-deck');
        if (saveDeckBtn) {
            saveDeckBtn.addEventListener('click', () => this.saveDeck());
        }

        const loadDeckBtn = document.getElementById('load-deck');
        if (loadDeckBtn) {
            loadDeckBtn.addEventListener('click', () => this.showLoadDeckModal());
        }

        const exportDeckBtn = document.getElementById('export-deck');
        if (exportDeckBtn) {
            exportDeckBtn.addEventListener('click', () => this.exportDeck());
        }

        // Card search for deck
        const searchCardsBtn = document.getElementById('search-cards-for-deck');
        if (searchCardsBtn) {
            searchCardsBtn.addEventListener('click', () => this.searchCardsForDeck());
        }

        const deckCardSearch = document.getElementById('deck-card-search');
        if (deckCardSearch) {
            deckCardSearch.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchCardsForDeck();
                }
            });
        }

        // Deck name input
        const deckNameInput = document.getElementById('deck-name');
        if (deckNameInput) {
            deckNameInput.addEventListener('input', (e) => {
                this.deckName = e.target.value;
            });
        }
    }

    // Add card to deck from collection or search
    addCardToDeck(card, quantity = 1) {
        const existingCard = this.currentDeck.find(c => c.name === card.name && c.set === card.set);
        
        if (existingCard) {
            existingCard.quantity += quantity;
        } else {
            const deckCard = {
                ...card,
                quantity: quantity,
                deckId: Date.now() + Math.random() // Unique ID for deck management
            };
            this.currentDeck.push(deckCard);
        }

        this.renderDeckList();
        this.updateDeckStats();
        this.updateManaCurve();
        
        if (this.app.showNotification) {
            this.app.showNotification(`Added ${card.name} to deck`, 'success');
        }
    }

    // Remove card from deck
    removeCardFromDeck(deckId) {
        this.currentDeck = this.currentDeck.filter(card => card.deckId !== deckId);
        this.renderDeckList();
        this.updateDeckStats();
        this.updateManaCurve();
        
        if (this.app.showNotification) {
            this.app.showNotification('Card removed from deck', 'success');
        }
    }

    // Update card quantity in deck
    updateCardQuantity(deckId, newQuantity) {
        const card = this.currentDeck.find(c => c.deckId === deckId);
        if (card) {
            if (newQuantity <= 0) {
                this.removeCardFromDeck(deckId);
            } else {
                card.quantity = newQuantity;
                this.renderDeckList();
                this.updateDeckStats();
                this.updateManaCurve();
            }
        }
    }

    // Render the current deck list
    renderDeckList() {
        const deckListContainer = document.getElementById('deck-list');
        if (!deckListContainer) return;

        if (this.currentDeck.length === 0) {
            deckListContainer.innerHTML = `
                <div class="empty-deck-message">
                    <i class="fas fa-cards-blank"></i>
                    <p>Your deck is empty</p>
                    <p>Search for cards above to start building your deck!</p>
                </div>
            `;
            return;
        }

        // Sort cards by type and CMC
        const sortedDeck = [...this.currentDeck].sort((a, b) => {
            const typeOrder = { 'Land': 0, 'Creature': 1, 'Artifact': 2, 'Enchantment': 3, 'Planeswalker': 4, 'Instant': 5, 'Sorcery': 6 };
            const aType = this.getCardType(a.type);
            const bType = this.getCardType(b.type);
            
            if (typeOrder[aType] !== typeOrder[bType]) {
                return (typeOrder[aType] || 7) - (typeOrder[bType] || 7);
            }
            
            return this.getConvertedManaCost(a.manaCost) - this.getConvertedManaCost(b.manaCost);
        });

        deckListContainer.innerHTML = sortedDeck.map(card => this.renderDeckCard(card)).join('');
    }

    // Render individual deck card
    renderDeckCard(card) {
        const cmc = this.getConvertedManaCost(card.manaCost);
        const cardType = this.getCardType(card.type);
        const manaSymbols = window.manaSymbolRenderer ? 
            window.manaSymbolRenderer.renderManaSymbols(card.manaCost || '') : 
            (card.manaCost || '');

        return `
            <div class="deck-card-item" data-deck-id="${card.deckId}">
                <div class="deck-card-info">
                    <div class="deck-card-name">${card.name}</div>
                    <div class="deck-card-details">
                        <span class="card-type">${cardType}</span>
                        <span class="card-cmc">CMC: ${cmc}</span>
                        <span class="card-set">${card.set || 'Unknown Set'}</span>
                        ${card.manaCost ? `<span class="card-mana-cost">${manaSymbols}</span>` : ''}
                    </div>
                </div>
                <div class="deck-card-actions">
                    <div class="quantity-controls">
                        <button class="quantity-btn" onclick="deckBuilder.updateCardQuantity('${card.deckId}', ${card.quantity - 1})">-</button>
                        <span class="quantity-display">${card.quantity}</span>
                        <button class="quantity-btn" onclick="deckBuilder.updateCardQuantity('${card.deckId}', ${card.quantity + 1})">+</button>
                    </div>
                    <button class="remove-from-deck-btn" onclick="deckBuilder.removeCardFromDeck('${card.deckId}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // Update deck statistics
    updateDeckStats() {
        let totalCards = 0;
        let creatures = 0;
        let spells = 0;
        let lands = 0;
        let totalCmc = 0;
        let nonLandCards = 0;

        this.currentDeck.forEach(card => {
            const quantity = card.quantity;
            totalCards += quantity;
            
            const cardType = this.getCardType(card.type);
            const cmc = this.getConvertedManaCost(card.manaCost);
            
            if (cardType === 'Land') {
                lands += quantity;
            } else {
                nonLandCards += quantity;
                totalCmc += cmc * quantity;
                
                if (cardType === 'Creature') {
                    creatures += quantity;
                } else {
                    spells += quantity;
                }
            }
        });

        this.deckStats = {
            totalCards,
            creatures,
            spells,
            lands,
            avgCmc: nonLandCards > 0 ? (totalCmc / nonLandCards) : 0
        };

        // Update UI
        this.updateStatsDisplay();
    }

    // Update stats display in UI
    updateStatsDisplay() {
        const elements = {
            'deck-total-cards': this.deckStats.totalCards,
            'deck-creatures': this.deckStats.creatures,
            'deck-spells': this.deckStats.spells,
            'deck-lands': this.deckStats.lands,
            'deck-avg-cmc': this.deckStats.avgCmc.toFixed(1)
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    // Update mana curve visualization
    updateManaCurve() {
        const curve = [0, 0, 0, 0, 0, 0, 0]; // 0, 1, 2, 3, 4, 5, 6+
        
        this.currentDeck.forEach(card => {
            const cmc = this.getConvertedManaCost(card.manaCost);
            const cardType = this.getCardType(card.type);
            
            // Don't include lands in mana curve
            if (cardType !== 'Land') {
                const curveIndex = Math.min(cmc, 6);
                curve[curveIndex] += card.quantity;
            }
        });

        const maxCount = Math.max(...curve, 1);
        
        curve.forEach((count, index) => {
            const bar = document.querySelector(`[data-cmc="${index}"] .bar-fill`);
            const countDisplay = document.querySelector(`[data-cmc="${index}"] .bar-count`);
            
            if (bar && countDisplay) {
                const height = (count / maxCount) * 100;
                bar.style.height = `${height}%`;
                countDisplay.textContent = count;
            }
        });
    }

    // Load collection preview for quick adding
    loadCollectionPreview() {
        const previewContainer = document.getElementById('collection-cards-preview');
        if (!previewContainer || !this.app.collection) return;

        // Show first 20 cards from collection
        const previewCards = this.app.collection.slice(0, 20);
        
        if (previewCards.length === 0) {
            previewContainer.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 20px; color: rgba(240, 230, 210, 0.6);">
                    <p>No cards in your collection yet.</p>
                    <p>Add cards to your collection to see them here for quick deck building.</p>
                </div>
            `;
            return;
        }

        previewContainer.innerHTML = previewCards.map(card => `
            <div class="collection-card-preview">
                <div class="card-name">${card.name}</div>
                <button class="add-to-deck-btn" onclick="deckBuilder.addCardFromCollection('${card.id}')">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        `).join('');
    }

    // Add card from collection to deck
    addCardFromCollection(cardId) {
        const card = this.app.collection.find(c => c.id == cardId);
        if (card) {
            this.addCardToDeck(card, 1);
        }
    }

    // Search for cards to add to deck
    async searchCardsForDeck() {
        const searchTerm = document.getElementById('deck-card-search').value.trim();
        if (!searchTerm) {
            if (this.app.showNotification) {
                this.app.showNotification('Please enter a search term', 'warning');
            }
            return;
        }

        try {
            // First search in user's collection
            const collectionResults = this.app.collection.filter(card => 
                card.name.toLowerCase().includes(searchTerm.toLowerCase())
            );

            // Then search Scryfall API for additional cards
            const response = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(searchTerm)}&order=name`);
            const data = await response.json();
            
            let scryfallResults = [];
            if (data.object !== 'error' && data.data) {
                scryfallResults = data.data.slice(0, 10); // Limit to 10 results
            }

            this.showCardSearchResults(collectionResults, scryfallResults);
        } catch (error) {
            console.error('Error searching for cards:', error);
            if (this.app.showNotification) {
                this.app.showNotification('Error searching for cards', 'error');
            }
        }
    }

    // Show card search results modal
    showCardSearchResults(collectionResults, scryfallResults) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'deck-search-modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3>Add Cards to Deck</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    ${collectionResults.length > 0 ? `
                        <h4 style="color: gold; margin-bottom: 15px;">From Your Collection</h4>
                        <div class="search-results-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; margin-bottom: 25px;">
                            ${collectionResults.map(card => this.renderSearchResultCard(card, true)).join('')}
                        </div>
                    ` : ''}
                    
                    ${scryfallResults.length > 0 ? `
                        <h4 style="color: gold; margin-bottom: 15px;">From Card Database</h4>
                        <div class="search-results-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;">
                            ${scryfallResults.map(card => this.renderSearchResultCard(card, false)).join('')}
                        </div>
                    ` : ''}
                    
                    ${collectionResults.length === 0 && scryfallResults.length === 0 ? `
                        <div style="text-align: center; padding: 40px; color: rgba(240, 230, 210, 0.6);">
                            <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 15px;"></i>
                            <p>No cards found matching your search.</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.classList.add('active');
        modal.style.display = 'block';

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Render search result card
    renderSearchResultCard(card, fromCollection) {
        const cardData = fromCollection ? card : {
            name: card.name,
            set: card.set_name,
            setCode: card.set,
            type: card.type_line,
            manaCost: card.mana_cost,
            imageUrl: card.image_uris?.small || card.image_uris?.normal,
            prices: card.prices
        };

        return `
            <div class="search-result-card" style="background: linear-gradient(135deg, #2e1f4d, #1a0f2f); border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 10px; padding: 15px; transition: all 0.3s ease;">
                <div class="card-name" style="font-weight: 700; color: #f0e6d2; margin-bottom: 8px;">${cardData.name}</div>
                <div class="card-details" style="font-size: 0.9rem; color: rgba(240, 230, 210, 0.7); margin-bottom: 12px;">
                    <div>${cardData.set || 'Unknown Set'}</div>
                    <div>${cardData.type || 'Unknown Type'}</div>
                    ${cardData.manaCost ? `<div>CMC: ${this.getConvertedManaCost(cardData.manaCost)}</div>` : ''}
                </div>
                <button class="btn btn-primary" style="width: 100%; padding: 8px;" onclick="deckBuilder.addCardToDeckFromSearch(${JSON.stringify(cardData).replace(/"/g, '&quot;')}); this.closest('.modal').remove();">
                    <i class="fas fa-plus"></i> Add to Deck
                </button>
            </div>
        `;
    }

    // Add card to deck from search results
    addCardToDeckFromSearch(cardData) {
        this.addCardToDeck(cardData, 1);
    }

    // Save current deck
    saveDeck() {
        if (!this.deckName.trim()) {
            if (this.app.showNotification) {
                this.app.showNotification('Please enter a deck name', 'warning');
            }
            return;
        }

        if (this.currentDeck.length === 0) {
            if (this.app.showNotification) {
                this.app.showNotification('Cannot save an empty deck', 'warning');
            }
            return;
        }

        const deckData = {
            name: this.deckName,
            cards: this.currentDeck,
            stats: this.deckStats,
            dateCreated: new Date().toISOString(),
            dateModified: new Date().toISOString()
        };

        this.savedDecks[this.deckName] = deckData;
        localStorage.setItem('mtgSavedDecks', JSON.stringify(this.savedDecks));

        if (this.app.showNotification) {
            this.app.showNotification(`Deck "${this.deckName}" saved successfully!`, 'success');
        }
    }

    // Show load deck modal
    showLoadDeckModal() {
        const deckNames = Object.keys(this.savedDecks);
        
        if (deckNames.length === 0) {
            if (this.app.showNotification) {
                this.app.showNotification('No saved decks found', 'info');
            }
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Load Deck</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="saved-decks-list">
                        ${deckNames.map(deckName => {
                            const deck = this.savedDecks[deckName];
                            return `
                                <div class="saved-deck-item" style="background: rgba(42, 26, 77, 0.3); border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 8px; padding: 15px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                                    <div>
                                        <div style="font-weight: 700; color: #f0e6d2; margin-bottom: 5px;">${deckName}</div>
                                        <div style="font-size: 0.9rem; color: rgba(240, 230, 210, 0.7);">
                                            ${deck.stats.totalCards} cards • Created: ${new Date(deck.dateCreated).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div style="display: flex; gap: 10px;">
                                        <button class="btn btn-primary" onclick="deckBuilder.loadDeck('${deckName}'); this.closest('.modal').remove();">Load</button>
                                        <button class="btn btn-secondary" onclick="deckBuilder.deleteDeck('${deckName}'); this.closest('.modal').remove();" style="background: linear-gradient(135deg, #e74c3c, #c0392b);">Delete</button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.classList.add('active');
        modal.style.display = 'block';

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Load a saved deck
    loadDeck(deckName) {
        const deck = this.savedDecks[deckName];
        if (!deck) return;

        this.currentDeck = deck.cards;
        this.deckName = deckName;
        
        const deckNameInput = document.getElementById('deck-name');
        if (deckNameInput) {
            deckNameInput.value = deckName;
        }

        this.renderDeckList();
        this.updateDeckStats();
        this.updateManaCurve();

        if (this.app.showNotification) {
            this.app.showNotification(`Deck "${deckName}" loaded successfully!`, 'success');
        }
    }

    // Delete a saved deck
    deleteDeck(deckName) {
        if (confirm(`Are you sure you want to delete the deck "${deckName}"?`)) {
            delete this.savedDecks[deckName];
            localStorage.setItem('mtgSavedDecks', JSON.stringify(this.savedDecks));
            
            if (this.app.showNotification) {
                this.app.showNotification(`Deck "${deckName}" deleted`, 'success');
            }
        }
    }

    // Export deck to various formats
    exportDeck() {
        if (this.currentDeck.length === 0) {
            if (this.app.showNotification) {
                this.app.showNotification('Cannot export an empty deck', 'warning');
            }
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Export Deck</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="export-options" style="display: grid; gap: 15px;">
                        <button class="btn btn-primary" onclick="deckBuilder.exportAsText(); this.closest('.modal').remove();">
                            <i class="fas fa-file-alt"></i> Export as Text (.txt)
                        </button>
                        <button class="btn btn-primary" onclick="deckBuilder.exportAsJSON(); this.closest('.modal').remove();">
                            <i class="fas fa-code"></i> Export as JSON
                        </button>
                        <button class="btn btn-primary" onclick="deckBuilder.exportAsMTGO(); this.closest('.modal').remove();">
                            <i class="fas fa-desktop"></i> Export for MTGO
                        </button>
                        <button class="btn btn-primary" onclick="deckBuilder.copyToClipboard(); this.closest('.modal').remove();">
                            <i class="fas fa-copy"></i> Copy to Clipboard
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.classList.add('active');
        modal.style.display = 'block';

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Export as text file
    exportAsText() {
        const deckText = this.generateDeckText();
        this.downloadFile(`${this.deckName || 'deck'}.txt`, deckText);
    }

    // Export as JSON
    exportAsJSON() {
        const deckData = {
            name: this.deckName,
            cards: this.currentDeck,
            stats: this.deckStats,
            exportDate: new Date().toISOString()
        };
        
        const jsonText = JSON.stringify(deckData, null, 2);
        this.downloadFile(`${this.deckName || 'deck'}.json`, jsonText);
    }

    // Export for MTGO format
    exportAsMTGO() {
        const mtgoText = this.generateMTGOFormat();
        this.downloadFile(`${this.deckName || 'deck'}.dec`, mtgoText);
    }

    // Copy deck to clipboard
    async copyToClipboard() {
        const deckText = this.generateDeckText();
        
        try {
            await navigator.clipboard.writeText(deckText);
            if (this.app.showNotification) {
                this.app.showNotification('Deck copied to clipboard!', 'success');
            }
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            if (this.app.showNotification) {
                this.app.showNotification('Failed to copy to clipboard', 'error');
            }
        }
    }

    // Generate deck text format
    generateDeckText() {
        const sortedDeck = [...this.currentDeck].sort((a, b) => {
            const typeOrder = { 'Land': 0, 'Creature': 1, 'Artifact': 2, 'Enchantment': 3, 'Planeswalker': 4, 'Instant': 5, 'Sorcery': 6 };
            const aType = this.getCardType(a.type);
            const bType = this.getCardType(b.type);
            
            if (typeOrder[aType] !== typeOrder[bType]) {
                return (typeOrder[aType] || 7) - (typeOrder[bType] || 7);
            }
            
            return this.getConvertedManaCost(a.manaCost) - this.getConvertedManaCost(b.manaCost);
        });

        let deckText = `${this.deckName || 'Untitled Deck'}\n`;
        deckText += `Total Cards: ${this.deckStats.totalCards}\n`;
        deckText += `Average CMC: ${this.deckStats.avgCmc.toFixed(1)}\n\n`;

        let currentType = '';
        sortedDeck.forEach(card => {
            const cardType = this.getCardType(card.type);
            if (cardType !== currentType) {
                if (currentType !== '') deckText += '\n';
                deckText += `// ${cardType}s\n`;
                currentType = cardType;
            }
            deckText += `${card.quantity}x ${card.name}\n`;
        });

        return deckText;
    }

    // Generate MTGO format
    generateMTGOFormat() {
        return this.currentDeck.map(card => `${card.quantity} ${card.name}`).join('\n');
    }

    // Download file helper
    downloadFile(filename, content) {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Utility functions
    getCardType(typeString) {
        if (!typeString) return 'Unknown';
        
        const types = ['Land', 'Creature', 'Artifact', 'Enchantment', 'Planeswalker', 'Instant', 'Sorcery'];
        for (const type of types) {
            if (typeString.includes(type)) {
                return type;
            }
        }
        return 'Other';
    }

    getConvertedManaCost(manaCost) {
        if (!manaCost) return 0;
        
        // Extract numbers and count mana symbols
        const numbers = manaCost.match(/\{(\d+)\}/g);
        const symbols = manaCost.match(/\{[WUBRG]\}/g);
        const hybrid = manaCost.match(/\{[WUBRG]\/[WUBRG]\}/g);
        const generic = manaCost.match(/\{X\}/g);
        
        let cmc = 0;
        
        if (numbers) {
            numbers.forEach(num => {
                cmc += parseInt(num.replace(/[{}]/g, ''));
            });
        }
        
        if (symbols) cmc += symbols.length;
        if (hybrid) cmc += hybrid.length;
        // X costs count as 0 for CMC calculation
        
        return cmc;
    }

    // Clear current deck
    clearDeck() {
        if (this.currentDeck.length === 0) return;
        
        if (confirm('Are you sure you want to clear the current deck?')) {
            this.currentDeck = [];
            this.deckName = '';
            
            const deckNameInput = document.getElementById('deck-name');
            if (deckNameInput) {
                deckNameInput.value = '';
            }
            
            this.renderDeckList();
            this.updateDeckStats();
            this.updateManaCurve();
            
            if (this.app.showNotification) {
                this.app.showNotification('Deck cleared', 'info');
            }
        }
    }
}

// Export for global access
window.DeckBuilder = DeckBuilder;
