// Enhanced Deck Builder with Fuzzy Matching, Real-time Stats, and Drag & Drop
// Implements the complete user flow: fuzzy match → suggestions → auto-fill → instant updates

class EnhancedDeckBuilder {
    constructor(app) {
        this.app = app;
        this.currentDeck = {
            name: "Untitled Deck",
            cards: [],
            stats: {
                manaCurve: [0, 0, 0, 0, 0, 0, 0], // 0-6+ CMC
                typeBreakdown: {},
                colorSpread: {},
                synergyScore: 0,
                totalCards: 0,
                avgCMC: 0,
                deckConsistency: 0
            },
            history: [],
            saved: false
        };
        
        this.historyIndex = -1;
        this.maxHistorySize = 50;
        this.searchCache = new Map();
        this.debounceTimer = null;
        this.draggedCard = null;
        
        // Initialize synergy engine and meter
        this.synergyEngine = new SynergyEngine();
        this.synergyMeter = null;
        
        // Fuzzy search configuration
        this.fuseOptions = {
            keys: ['name', 'type_line', 'oracle_text'],
            threshold: 0.3,
            includeScore: true,
            minMatchCharLength: 2
        };
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupDragAndDrop();
        this.setupKeyboardShortcuts();
        this.renderDeckInterface();
        this.updateAllStats();
    }

    setupEventListeners() {
        // Enhanced card search with fuzzy matching
        const cardSearchInput = document.getElementById('deck-card-search');
        if (cardSearchInput) {
            cardSearchInput.addEventListener('input', (e) => {
                this.handleFuzzySearch(e.target.value);
            });
            
            cardSearchInput.addEventListener('keydown', (e) => {
                this.handleSearchKeydown(e);
            });
            
            cardSearchInput.addEventListener('focus', () => {
                this.showSearchSuggestions();
            });
        }

        // Deck management
        const saveBtn = document.getElementById('save-deck');
        const loadBtn = document.getElementById('load-deck');
        const exportBtn = document.getElementById('export-deck');
        const clearBtn = document.getElementById('clear-deck');

        if (saveBtn) saveBtn.addEventListener('click', () => this.saveDeck());
        if (loadBtn) loadBtn.addEventListener('click', () => this.showLoadDeckModal());
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportDeck());
        if (clearBtn) clearBtn.addEventListener('click', () => this.clearDeck());

        // Deck name input
        const deckNameInput = document.getElementById('deck-name');
        if (deckNameInput) {
            deckNameInput.addEventListener('input', (e) => {
                this.currentDeck.name = e.target.value;
                this.currentDeck.saved = false;
                this.saveToHistory('rename');
            });
        }
    }

    setupDragAndDrop() {
        // Make deck list a drop zone
        const deckList = document.getElementById('deck-list');
        if (deckList) {
            deckList.addEventListener('dragover', this.handleDragOver.bind(this));
            deckList.addEventListener('drop', this.handleDrop.bind(this));
        }

        // Setup drag for existing cards (will be called when rendering)
        this.setupCardDragHandlers();
    }

    setupCardDragHandlers() {
        const deckCards = document.querySelectorAll('.deck-card-item');
        deckCards.forEach(card => {
            card.draggable = true;
            card.addEventListener('dragstart', this.handleDragStart.bind(this));
            card.addEventListener('dragend', this.handleDragEnd.bind(this));
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'z':
                        e.preventDefault();
                        this.undo();
                        break;
                    case 'y':
                        e.preventDefault();
                        this.redo();
                        break;
                    case 's':
                        e.preventDefault();
                        this.saveDeck();
                        break;
                    case 'f':
                        e.preventDefault();
                        document.getElementById('deck-card-search')?.focus();
                        break;
                }
            }
        });
    }

    // Fuzzy Search Implementation
    async handleFuzzySearch(query) {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        this.debounceTimer = setTimeout(async () => {
            if (query.length < 2) {
                this.hideSuggestions();
                return;
            }

            const suggestions = await this.getFuzzyMatches(query);
            this.showSuggestions(suggestions);
        }, 150);
    }

    async getFuzzyMatches(query) {
        // Check cache first
        if (this.searchCache.has(query)) {
            return this.searchCache.get(query);
        }

        const suggestions = [];

        // Search in user's collection first
        if (this.app.collection) {
            const collectionMatches = this.fuzzySearchArray(this.app.collection, query);
            suggestions.push(...collectionMatches.map(match => ({
                ...match.item,
                score: match.score,
                source: 'collection'
            })));
        }

        // Search Scryfall API
        try {
            const response = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}&order=name`);
            const data = await response.json();
            
            if (data.object !== 'error' && data.data) {
                const scryfallMatches = data.data.slice(0, 8).map(card => ({
                    ...this.normalizeCardData(card),
                    score: 0,
                    source: 'scryfall'
                }));
                suggestions.push(...scryfallMatches);
            }
        } catch (error) {
            console.error('Scryfall search error:', error);
        }

        // Sort by relevance and limit results
        const sortedSuggestions = suggestions
            .sort((a, b) => {
                // Prioritize collection cards
                if (a.source === 'collection' && b.source !== 'collection') return -1;
                if (b.source === 'collection' && a.source !== 'collection') return 1;
                return a.score - b.score;
            })
            .slice(0, 10);

        // Cache results
        this.searchCache.set(query, sortedSuggestions);
        return sortedSuggestions;
    }

    fuzzySearchArray(array, query) {
        // Simple fuzzy search implementation
        const results = [];
        const queryLower = query.toLowerCase();
        
        array.forEach(item => {
            const name = item.name.toLowerCase();
            const type = (item.type_line || item.type || '').toLowerCase();
            
            let score = 0;
            
            // Exact match gets highest score
            if (name === queryLower) score = 0;
            else if (name.startsWith(queryLower)) score = 0.1;
            else if (name.includes(queryLower)) score = 0.3;
            else if (type.includes(queryLower)) score = 0.5;
            else {
                // Calculate Levenshtein distance for fuzzy matching
                const distance = this.levenshteinDistance(name, queryLower);
                score = distance / Math.max(name.length, queryLower.length);
            }
            
            if (score <= 0.6) { // Only include reasonably close matches
                results.push({ item, score });
            }
        });
        
        return results.sort((a, b) => a.score - b.score);
    }

    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    showSuggestions(suggestions) {
        let suggestionsContainer = document.getElementById('card-suggestions');
        
        if (!suggestionsContainer) {
            suggestionsContainer = document.createElement('div');
            suggestionsContainer.id = 'card-suggestions';
            suggestionsContainer.className = 'card-suggestions';
            
            const searchInput = document.getElementById('deck-card-search');
            if (searchInput) {
                searchInput.parentNode.appendChild(suggestionsContainer);
            }
        }

        if (suggestions.length === 0) {
            suggestionsContainer.innerHTML = '<div class="no-suggestions">No cards found</div>';
        } else {
            suggestionsContainer.innerHTML = suggestions.map((card, index) => 
                this.renderSuggestionItem(card, index)
            ).join('');
        }

        suggestionsContainer.style.display = 'block';
        this.selectedSuggestionIndex = -1;
    }

    renderSuggestionItem(card, index) {
        const manaSymbols = this.renderManaSymbols(card.manaCost || card.mana_cost || '');
        const sourceIcon = card.source === 'collection' ? '★' : '🔍';
        
        return `
            <div class="suggestion-item" data-index="${index}" onclick="enhancedDeckBuilder.selectSuggestion(${index})">
                <div class="suggestion-main">
                    <div class="suggestion-name">
                        ${sourceIcon} ${card.name}
                        ${manaSymbols ? `<span class="suggestion-mana">${manaSymbols}</span>` : ''}
                    </div>
                    <div class="suggestion-details">
                        ${card.type_line || card.type || 'Unknown Type'} • ${card.set_name || card.set || 'Unknown Set'}
                    </div>
                </div>
                <button class="suggestion-add-btn" onclick="event.stopPropagation(); enhancedDeckBuilder.addCardFromSuggestion(${index})">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        `;
    }

    hideSuggestions() {
        const suggestionsContainer = document.getElementById('card-suggestions');
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
        }
    }

    showSearchSuggestions() {
        const searchInput = document.getElementById('deck-card-search');
        if (searchInput && searchInput.value.length >= 2) {
            this.handleFuzzySearch(searchInput.value);
        }
    }

    handleSearchKeydown(e) {
        const suggestionsContainer = document.getElementById('card-suggestions');
        if (!suggestionsContainer || suggestionsContainer.style.display === 'none') return;

        const suggestions = suggestionsContainer.querySelectorAll('.suggestion-item');
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.selectedSuggestionIndex = Math.min(this.selectedSuggestionIndex + 1, suggestions.length - 1);
                this.highlightSuggestion();
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.selectedSuggestionIndex = Math.max(this.selectedSuggestionIndex - 1, -1);
                this.highlightSuggestion();
                break;
            case 'Enter':
                e.preventDefault();
                if (this.selectedSuggestionIndex >= 0) {
                    this.addCardFromSuggestion(this.selectedSuggestionIndex);
                }
                break;
            case 'Escape':
                this.hideSuggestions();
                break;
        }
    }

    highlightSuggestion() {
        const suggestions = document.querySelectorAll('.suggestion-item');
        suggestions.forEach((item, index) => {
            item.classList.toggle('highlighted', index === this.selectedSuggestionIndex);
        });
    }

    selectSuggestion(index) {
        this.selectedSuggestionIndex = index;
        this.addCardFromSuggestion(index);
    }

    async addCardFromSuggestion(index) {
        const suggestionsContainer = document.getElementById('card-suggestions');
        if (!suggestionsContainer) return;

        const suggestions = JSON.parse(suggestionsContainer.dataset.suggestions || '[]');
        const card = suggestions[index];
        
        if (card) {
            await this.addCardToDeck(card);
            this.hideSuggestions();
            document.getElementById('deck-card-search').value = '';
        }
    }

    // Enhanced Card Management
    async addCardToDeck(cardData, quantity = 1) {
        const normalizedCard = this.normalizeCardData(cardData);
        
        // Check if card already exists in deck
        const existingCardIndex = this.currentDeck.cards.findIndex(c => 
            c.name === normalizedCard.name && c.set === normalizedCard.set
        );

        if (existingCardIndex >= 0) {
            this.currentDeck.cards[existingCardIndex].qty += quantity;
        } else {
            this.currentDeck.cards.push({
                ...normalizedCard,
                qty: quantity,
                deckId: Date.now() + Math.random()
            });
        }

        this.saveToHistory('add_card');
        this.updateAllStats();
        this.renderDeckList();
        this.currentDeck.saved = false;

        if (this.app.showNotification) {
            this.app.showNotification(`Added ${normalizedCard.name} to deck`, 'success');
        }
    }

    removeCardFromDeck(deckId) {
        const cardIndex = this.currentDeck.cards.findIndex(c => c.deckId === deckId);
        if (cardIndex >= 0) {
            const card = this.currentDeck.cards[cardIndex];
            this.currentDeck.cards.splice(cardIndex, 1);
            
            this.saveToHistory('remove_card');
            this.updateAllStats();
            this.renderDeckList();
            this.currentDeck.saved = false;

            if (this.app.showNotification) {
                this.app.showNotification(`Removed ${card.name} from deck`, 'info');
            }
        }
    }

    updateCardQuantity(deckId, newQuantity) {
        const card = this.currentDeck.cards.find(c => c.deckId === deckId);
        if (card) {
            if (newQuantity <= 0) {
                this.removeCardFromDeck(deckId);
            } else {
                card.qty = newQuantity;
                this.saveToHistory('update_quantity');
                this.updateAllStats();
                this.renderDeckList();
                this.currentDeck.saved = false;
            }
        }
    }

    // Advanced Statistics Engine
    updateAllStats() {
        this.calculateManaCurve();
        this.calculateTypeBreakdown();
        this.calculateColorSpread();
        this.calculateSynergyScore();
        this.calculateConsistency();
        this.updateStatsDisplay();
    }

    calculateManaCurve() {
        const curve = [0, 0, 0, 0, 0, 0, 0]; // 0-6+ CMC
        let totalCards = 0;
        let totalCMC = 0;
        let nonLandCards = 0;

        this.currentDeck.cards.forEach(card => {
            const cmc = this.getConvertedManaCost(card.manaCost);
            const isLand = this.getCardType(card.type).toLowerCase().includes('land');
            const quantity = card.qty;

            totalCards += quantity;

            if (!isLand) {
                const curveIndex = Math.min(cmc, 6);
                curve[curveIndex] += quantity;
                totalCMC += cmc * quantity;
                nonLandCards += quantity;
            }
        });

        this.currentDeck.stats.manaCurve = curve;
        this.currentDeck.stats.totalCards = totalCards;
        this.currentDeck.stats.avgCMC = nonLandCards > 0 ? totalCMC / nonLandCards : 0;
    }

    calculateTypeBreakdown() {
        const breakdown = {};
        
        this.currentDeck.cards.forEach(card => {
            const type = this.getCardType(card.type);
            breakdown[type] = (breakdown[type] || 0) + card.qty;
        });

        this.currentDeck.stats.typeBreakdown = breakdown;
    }

    calculateColorSpread() {
        const colors = { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 };
        
        this.currentDeck.cards.forEach(card => {
            const manaCost = card.manaCost || '';
            const quantity = card.qty;
            
            // Count mana symbols
            const symbols = manaCost.match(/\{[WUBRG]\}/g) || [];
            symbols.forEach(symbol => {
                const color = symbol.replace(/[{}]/g, '');
                colors[color] = (colors[color] || 0) + quantity;
            });
            
            // Check for colorless
            if (!symbols.length && manaCost.includes('{')) {
                colors.C += quantity;
            }
        });

        // Convert to color names
        const colorNames = {
            W: 'White', U: 'Blue', B: 'Black', 
            R: 'Red', G: 'Green', C: 'Colorless'
        };
        
        const spread = {};
        Object.entries(colors).forEach(([key, value]) => {
            if (value > 0) {
                spread[colorNames[key]] = value;
            }
        });

        this.currentDeck.stats.colorSpread = spread;
    }

    calculateSynergyScore() {
        // Use the advanced synergy engine for calculation
        if (this.synergyEngine) {
            this.currentDeck.stats.synergyScore = this.synergyEngine.getSynergyScore(this.currentDeck);
        } else {
            this.currentDeck.stats.synergyScore = 0;
        }
        
        // Update synergy meter if it exists
        if (this.synergyMeter) {
            this.synergyMeter.updateSynergy(this.currentDeck);
        }
    }

    calculateConsistency() {
        const totalCards = this.currentDeck.stats.totalCards;
        if (totalCards === 0) {
            this.currentDeck.stats.deckConsistency = 0;
            return;
        }

        // Calculate based on card distribution
        let consistency = 0;
        const cardCounts = this.currentDeck.cards.map(card => card.qty);
        const maxCount = Math.max(...cardCounts);
        
        // Reward having 4-ofs for key cards
        const fourOfs = cardCounts.filter(count => count === 4).length;
        consistency += (fourOfs / this.currentDeck.cards.length) * 0.4;
        
        // Reward reasonable deck size
        if (totalCards >= 60 && totalCards <= 75) {
            consistency += 0.3;
        }
        
        // Reward mana curve consistency
        const curve = this.currentDeck.stats.manaCurve;
        const curveVariance = this.calculateVariance(curve);
        consistency += Math.max(0, 0.3 - (curveVariance / 100));

        this.currentDeck.stats.deckConsistency = Math.max(0, Math.min(1, consistency));
    }

    calculateVariance(array) {
        const mean = array.reduce((a, b) => a + b, 0) / array.length;
        const variance = array.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / array.length;
        return variance;
    }

    updateStatsDisplay() {
        // Update basic stats
        const elements = {
            'deck-total-cards': this.currentDeck.stats.totalCards,
            'deck-creatures': this.currentDeck.stats.typeBreakdown.Creature || 0,
            'deck-spells': (this.currentDeck.stats.typeBreakdown.Instant || 0) + 
                          (this.currentDeck.stats.typeBreakdown.Sorcery || 0),
            'deck-lands': this.currentDeck.stats.typeBreakdown.Land || 0,
            'deck-avg-cmc': this.currentDeck.stats.avgCMC.toFixed(1),
            'deck-synergy-score': Math.round(this.currentDeck.stats.synergyScore),
            'deck-consistency': Math.round(this.currentDeck.stats.deckConsistency * 100) + '%'
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                // Add smooth transition for number changes
                if (element.textContent !== value.toString()) {
                    element.style.transform = 'scale(1.1)';
                    element.textContent = value;
                    setTimeout(() => {
                        element.style.transform = 'scale(1)';
                    }, 150);
                }
            }
        });

        this.updateManaCurveDisplay();
        this.updateColorSpreadDisplay();
        this.updateTypeBreakdownDisplay();
    }

    updateManaCurveDisplay() {
        const curve = this.currentDeck.stats.manaCurve;
        const maxCount = Math.max(...curve, 1);
        
        curve.forEach((count, index) => {
            const bar = document.querySelector(`[data-cmc="${index}"] .bar-fill`);
            const countDisplay = document.querySelector(`[data-cmc="${index}"] .bar-count`);
            
            if (bar && countDisplay) {
                const height = (count / maxCount) * 100;
                bar.style.height = `${height}%`;
                bar.style.transition = 'height 0.3s ease';
                countDisplay.textContent = count;
            }
        });
    }

    updateColorSpreadDisplay() {
        const colorContainer = document.getElementById('color-spread-display');
        if (!colorContainer) return;

        const colors = this.currentDeck.stats.colorSpread;
        const total = Object.values(colors).reduce((a, b) => a + b, 0);
        
        if (total === 0) {
            colorContainer.innerHTML = '<div class="no-colors">No colored mana</div>';
            return;
        }

        colorContainer.innerHTML = Object.entries(colors).map(([color, count]) => {
            const percentage = Math.round((count / total) * 100);
            return `
                <div class="color-segment" style="width: ${percentage}%">
                    <span class="color-name">${color}</span>
                    <span class="color-count">${count}</span>
                </div>
            `;
        }).join('');
    }

    updateTypeBreakdownDisplay() {
        const typeContainer = document.getElementById('type-breakdown-display');
        if (!typeContainer) return;

        const types = this.currentDeck.stats.typeBreakdown;
        const total = Object.values(types).reduce((a, b) => a + b, 0);
        
        if (total === 0) {
            typeContainer.innerHTML = '<div class="no-types">No cards in deck</div>';
            return;
        }

        typeContainer.innerHTML = Object.entries(types).map(([type, count]) => {
            const percentage = Math.round((count / total) * 100);
            return `
                <div class="type-segment">
                    <span class="type-name">${type}</span>
                    <span class="type-count">${count} (${percentage}%)</span>
                </div>
            `;
        }).join('');
    }

    // Drag and Drop Implementation
    handleDragStart(e) {
        this.draggedCard = e.target.closest('.deck-card-item');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.draggedCard.outerHTML);
        this.draggedCard.classList.add('dragging');
    }

    handleDragEnd(e) {
        if (this.draggedCard) {
            this.draggedCard.classList.remove('dragging');
            this.draggedCard = null;
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const afterElement = this.getDragAfterElement(e.clientY);
        const deckList = document.getElementById('deck-list');
        
        if (afterElement == null) {
            deckList.appendChild(this.draggedCard);
        } else {
            deckList.insertBefore(this.draggedCard, afterElement);
        }
    }

    handleDrop(e) {
        e.preventDefault();
        this.reorderDeckCards();
    }

    getDragAfterElement(y) {
        const deckList = document.getElementById('deck-list');
        const draggableElements = [...deckList.querySelectorAll('.deck-card-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    reorderDeckCards() {
        const deckItems = document.querySelectorAll('.deck-card-item');
        const newOrder = [];
        
        deckItems.forEach(item => {
            const deckId = item.dataset.deckId;
            const card = this.currentDeck.cards.find(c => c.deckId == deckId);
            if (card) {
                newOrder.push(card);
            }
        });
        
        this.currentDeck.cards = newOrder;
        this.saveToHistory('reorder');
    }

    // History System (Undo/Redo)
    saveToHistory(action) {
        // Remove any history after current index
        this.currentDeck.history = this.currentDeck.history.slice(0, this.historyIndex + 1);
        
        // Add new state
        const state = {
            action,
            timestamp: Date.now(),
            deck: JSON.parse(JSON.stringify(this.currentDeck.cards)),
            stats: JSON.parse(JSON.stringify(this.currentDeck.stats))
        };
        
        this.currentDeck.history.push(state);
        this.historyIndex++;
        
        // Limit history size
        if (this.currentDeck.history.length > this.maxHistorySize) {
            this.currentDeck.history.shift();
            this.historyIndex--;
        }
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const state = this.currentDeck.history[this.historyIndex];
            this.currentDeck.cards = JSON.parse(JSON.stringify(state.deck));
            this.updateAllStats();
            this.renderDeckList();
            
            if (this.app.showNotification) {
                this.app.showNotification('Undid last action', 'info');
            }
        }
    }

    redo() {
        if (this.historyIndex < this.currentDeck.history.length - 1) {
            this.historyIndex++;
            const state = this.currentDeck.history[this.historyIndex];
            this.currentDeck.cards = JSON.parse(JSON.stringify(state.deck));
            this.updateAllStats();
            this.renderDeckList();
            
            if (this.app.showNotification) {
                this.app.showNotification('Redid last action', 'info');
            }
        }
    }

    // Rendering Methods
    renderDeckInterface() {
        // Add enhanced search interface
        this.addSearchInterface();
        
        // Add advanced stats displays
        this.addAdvancedStatsDisplay();
        
        // Render initial deck list
        this.renderDeckList();
    }

    addSearchInterface() {
        const deckSection = document.getElementById('deck-section');
        if (!deckSection) return;

        const searchContainer = document.createElement('div');
        searchContainer.className = 'enhanced-search-container';
        searchContainer.innerHTML = `
            <div class="search-input-wrapper">
                <input type="text" id="deck-card-search" placeholder="Type to search cards..." class="enhanced-search-input">
                <div class="search-shortcuts">
                    <span class="shortcut-hint">Ctrl+F to focus</span>
                </div>
            </div>
        `;

        // Insert after deck management section
        const deckManagement = deckSection.querySelector('.deck-management');
        if (deckManagement) {
            deckManagement.parentNode.insertBefore(searchContainer, deckManagement.nextSibling);
        }
    }

    addAdvancedStatsDisplay() {
        const deckSection = document.getElementById('deck-section');
        if (!deckSection) return;

        // Add enhanced stats container
        const advancedStatsContainer = document.createElement('div');
        advancedStatsContainer.className = 'advanced-stats-container';
        advancedStatsContainer.innerHTML = `
            <div class="stats-row">
                <div class="stat-card">
                    <div class="stat-label">Synergy Score</div>
                    <div class="stat-value" id="deck-synergy-score">0</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Consistency</div>
                    <div class="stat-value" id="deck-consistency">0%</div>
                </div>
                <div class="stat-card">
                    <div class="stat-label">Avg CMC</div>
                    <div class="stat-value" id="deck-avg-cmc">0.0</div>
                </div>
            </div>
            
            <!-- Synergy Meter Container -->
            <div id="synergy-meter-container"></div>
            
            <div class="mana-curve-container">
                <h4>Mana Curve</h4>
                <div class="mana-curve-bars">
                    ${[0, 1, 2, 3, 4, 5, 6].map(cmc => `
                        <div class="mana-bar" data-cmc="${cmc}">
                            <div class="bar-fill"></div>
                            <div class="bar-label">${cmc === 6 ? '6+' : cmc}</div>
                            <div class="bar-count">0</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="color-spread-container">
                <h4>Color Distribution</h4>
                <div id="color-spread-display"></div>
            </div>
            <div class="type-breakdown-container">
                <h4>Type Breakdown</h4>
                <div id="type-breakdown-display"></div>
            </div>
        `;

        // Insert after existing deck stats
        const existingStats = deckSection.querySelector('.deck-stats');
        if (existingStats) {
            existingStats.parentNode.insertBefore(advancedStatsContainer, existingStats.nextSibling);
        }

        // Initialize synergy meter
        this.initializeSynergyMeter();
    }

    initializeSynergyMeter() {
        const synergyContainer = document.getElementById('synergy-meter-container');
        if (synergyContainer && this.synergyEngine && window.SynergyMeter) {
            this.synergyMeter = new SynergyMeter(synergyContainer, this.synergyEngine);
            // Initial update
            this.synergyMeter.updateSynergy(this.currentDeck);
        }
    }

    renderDeckList() {
        const deckListContainer = document.getElementById('deck-list');
        if (!deckListContainer) return;

        if (this.currentDeck.cards.length === 0) {
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
        const sortedDeck = [...this.currentDeck.cards].sort((a, b) => {
            const typeOrder = { 'Land': 0, 'Creature': 1, 'Artifact': 2, 'Enchantment': 3, 'Planeswalker': 4, 'Instant': 5, 'Sorcery': 6 };
            const aType = this.getCardType(a.type);
            const bType = this.getCardType(b.type);
            
            if (typeOrder[aType] !== typeOrder[bType]) {
                return (typeOrder[aType] || 7) - (typeOrder[bType] || 7);
            }
            
            return this.getConvertedManaCost(a.manaCost) - this.getConvertedManaCost(b.manaCost);
        });

        deckListContainer.innerHTML = sortedDeck.map(card => this.renderDeckCard(card)).join('');
        
        // Setup drag handlers for new cards
        this.setupCardDragHandlers();
    }

    renderDeckCard(card) {
        const cmc = this.getConvertedManaCost(card.manaCost);
        const cardType = this.getCardType(card.type);
        const manaSymbols = this.renderManaSymbols(card.manaCost || '');

        return `
            <div class="deck-card-item enhanced-deck-card" data-deck-id="${card.deckId}" draggable="true">
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
                        <button class="quantity-btn" onclick="enhancedDeckBuilder.updateCardQuantity('${card.deckId}', ${card.qty - 1})">-</button>
                        <span class="quantity-display">${card.qty}</span>
                        <button class="quantity-btn" onclick="enhancedDeckBuilder.updateCardQuantity('${card.deckId}', ${card.qty + 1})">+</button>
                    </div>
                    <button class="remove-from-deck-btn" onclick="enhancedDeckBuilder.removeCardFromDeck('${card.deckId}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="drag-handle">
                    <i class="fas fa-grip-vertical"></i>
                </div>
            </div>
        `;
    }

    // Utility Methods
    normalizeCardData(cardData) {
        return {
            name: cardData.name,
            type: cardData.type_line || cardData.type || 'Unknown',
            manaCost: cardData.mana_cost || cardData.manaCost || '',
            set: cardData.set_name || cardData.set || 'Unknown Set',
            setCode: cardData.set || cardData.setCode || '',
            power: cardData.power || null,
            toughness: cardData.toughness || null,
            color: this.extractColors(cardData.mana_cost || cardData.manaCost || ''),
            artUrl: cardData.image_uris?.normal || cardData.image_url || cardData.artUrl || '',
            lore: cardData.flavor_text || cardData.lore || ''
        };
    }

    extractColors(manaCost) {
        const colors = [];
        const colorMap = { W: 'White', U: 'Blue', B: 'Black', R: 'Red', G: 'Green' };
        
        Object.keys(colorMap).forEach(symbol => {
            if (manaCost.includes(`{${symbol}}`)) {
                colors.push(colorMap[symbol]);
            }
        });
        
        return colors.length > 0 ? colors.join(', ') : 'Colorless';
    }

    renderManaSymbols(manaCost) {
        if (!manaCost) return '';
        
        // Use existing mana symbol renderer if available
        if (window.manaSymbolRenderer) {
            return window.manaSymbolRenderer.renderManaSymbols(manaCost);
        }
        
        // Fallback to simple text representation
        return manaCost;
    }

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
        
        let cmc = 0;
        
        if (numbers) {
            numbers.forEach(num => {
                cmc += parseInt(num.replace(/[{}]/g, ''));
            });
        }
        
        if (symbols) cmc += symbols.length;
        if (hybrid) cmc += hybrid.length;
        
        return cmc;
    }

    // Deck Management Methods
    saveDeck() {
        if (!this.currentDeck.name.trim()) {
            if (this.app.showNotification) {
                this.app.showNotification('Please enter a deck name', 'warning');
            }
            return;
        }

        if (this.currentDeck.cards.length === 0) {
            if (this.app.showNotification) {
                this.app.showNotification('Cannot save an empty deck', 'warning');
            }
            return;
        }

        const savedDecks = JSON.parse(localStorage.getItem('mtgSavedDecks')) || {};
        const deckData = {
            ...this.currentDeck,
            dateCreated: savedDecks[this.currentDeck.name]?.dateCreated || new Date().toISOString(),
            dateModified: new Date().toISOString()
        };

        savedDecks[this.currentDeck.name] = deckData;
        localStorage.setItem('mtgSavedDecks', JSON.stringify(savedDecks));
        
        this.currentDeck.saved = true;

        if (this.app.showNotification) {
            this.app.showNotification(`Deck "${this.currentDeck.name}" saved successfully!`, 'success');
        }
    }

    showLoadDeckModal() {
        const savedDecks = JSON.parse(localStorage.getItem('mtgSavedDecks')) || {};
        const deckNames = Object.keys(savedDecks);
        
        if (deckNames.length === 0) {
            if (this.app.showNotification) {
                this.app.showNotification('No saved decks found', 'info');
            }
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal enhanced-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Load Deck</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="saved-decks-list">
                        ${deckNames.map(deckName => {
                            const deck = savedDecks[deckName];
                            return `
                                <div class="saved-deck-item">
                                    <div class="deck-info">
                                        <div class="deck-name">${deckName}</div>
                                        <div class="deck-details">
                                            ${deck.stats.totalCards} cards • Synergy: ${Math.round(deck.stats.synergyScore)}
                                        </div>
                                        <div class="deck-date">
                                            Modified: ${new Date(deck.dateModified).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div class="deck-actions">
                                        <button class="btn btn-primary" onclick="enhancedDeckBuilder.loadDeck('${deckName}'); this.closest('.modal').remove();">Load</button>
                                        <button class="btn btn-secondary" onclick="enhancedDeckBuilder.deleteDeck('${deckName}'); this.closest('.modal').remove();">Delete</button>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'block';

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    loadDeck(deckName) {
        const savedDecks = JSON.parse(localStorage.getItem('mtgSavedDecks')) || {};
        const deck = savedDecks[deckName];
        
        if (!deck) return;

        this.currentDeck = { ...deck };
        this.historyIndex = this.currentDeck.history.length - 1;
        
        const deckNameInput = document.getElementById('deck-name');
        if (deckNameInput) {
            deckNameInput.value = deckName;
        }

        this.updateAllStats();
        this.renderDeckList();

        if (this.app.showNotification) {
            this.app.showNotification(`Deck "${deckName}" loaded successfully!`, 'success');
        }
    }

    deleteDeck(deckName) {
        if (confirm(`Are you sure you want to delete the deck "${deckName}"?`)) {
            const savedDecks = JSON.parse(localStorage.getItem('mtgSavedDecks')) || {};
            delete savedDecks[deckName];
            localStorage.setItem('mtgSavedDecks', JSON.stringify(savedDecks));
            
            if (this.app.showNotification) {
                this.app.showNotification(`Deck "${deckName}" deleted`, 'success');
            }
        }
    }

    exportDeck() {
        if (this.currentDeck.cards.length === 0) {
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
                    <div class="export-options">
                        <button class="btn btn-primary" onclick="enhancedDeckBuilder.exportAsText(); this.closest('.modal').remove();">
                            <i class="fas fa-file-alt"></i> Export as Text (.txt)
                        </button>
                        <button class="btn btn-primary" onclick="enhancedDeckBuilder.exportAsJSON(); this.closest('.modal').remove();">
                            <i class="fas fa-code"></i> Export as JSON
                        </button>
                        <button class="btn btn-primary" onclick="enhancedDeckBuilder.copyToClipboard(); this.closest('.modal').remove();">
                            <i class="fas fa-copy"></i> Copy to Clipboard
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.style.display = 'block';

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    exportAsText() {
        const deckText = this.generateDeckText();
        this.downloadFile(`${this.currentDeck.name || 'deck'}.txt`, deckText);
    }

    exportAsJSON() {
        const jsonText = JSON.stringify(this.currentDeck, null, 2);
        this.downloadFile(`${this.currentDeck.name || 'deck'}.json`, jsonText);
    }

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

    generateDeckText() {
        let deckText = `${this.currentDeck.name}\n`;
        deckText += `Total Cards: ${this.currentDeck.stats.totalCards}\n`;
        deckText += `Synergy Score: ${Math.round(this.currentDeck.stats.synergyScore)}\n`;
        deckText += `Average CMC: ${this.currentDeck.stats.avgCMC.toFixed(1)}\n\n`;

        const sortedDeck = [...this.currentDeck.cards].sort((a, b) => {
            const typeOrder = { 'Land': 0, 'Creature': 1, 'Artifact': 2, 'Enchantment': 3, 'Planeswalker': 4, 'Instant': 5, 'Sorcery': 6 };
            const aType = this.getCardType(a.type);
            const bType = this.getCardType(b.type);
            
            if (typeOrder[aType] !== typeOrder[bType]) {
                return (typeOrder[aType] || 7) - (typeOrder[bType] || 7);
            }
            
            return this.getConvertedManaCost(a.manaCost) - this.getConvertedManaCost(b.manaCost);
        });

        let currentType = '';
        sortedDeck.forEach(card => {
            const cardType = this.getCardType(card.type);
            if (cardType !== currentType) {
                if (currentType !== '') deckText += '\n';
                deckText += `// ${cardType}s\n`;
                currentType = cardType;
            }
            deckText += `${card.qty}x ${card.name}\n`;
        });

        return deckText;
    }

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

    clearDeck() {
        if (this.currentDeck.cards.length === 0) return;
        
        if (confirm('Are you sure you want to clear the current deck?')) {
            this.currentDeck.cards = [];
            this.currentDeck.name = 'Untitled Deck';
            this.currentDeck.saved = false;
            
            const deckNameInput = document.getElementById('deck-name');
            if (deckNameInput) {
                deckNameInput.value = '';
            }
            
            this.saveToHistory('clear');
            this.updateAllStats();
            this.renderDeckList();
            
            if (this.app.showNotification) {
                this.app.showNotification('Deck cleared', 'info');
            }
        }
    }
}

// Export for global access
window.EnhancedDeckBuilder = EnhancedDeckBuilder;
