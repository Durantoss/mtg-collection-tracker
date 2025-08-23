// Deck Forge Interface Controller
class DeckForgeApp {
    constructor() {
        this.currentSection = 'collection';
        this.filters = {
            active: [],
            search: ''
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupNavigation();
        this.setupFilterChips();
        this.setupAuthButtons();
        this.loadCollectionData();
    }

    setupEventListeners() {
        // Bottom navigation
        document.querySelectorAll('.nav-icon').forEach(icon => {
            icon.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.switchSection(section);
            });
        });

        // Search bars
        const collectionSearch = document.getElementById('collection-search');
        if (collectionSearch) {
            collectionSearch.addEventListener('input', (e) => {
                this.handleCollectionSearch(e.target.value);
            });
        }

        const cardSearch = document.getElementById('card-search');
        if (cardSearch) {
            cardSearch.addEventListener('input', (e) => {
                this.handleCardSearch(e.target.value);
            });
        }

        // Scan button
        const scanBtn = document.getElementById('scan-card-btn');
        if (scanBtn) {
            scanBtn.addEventListener('click', () => {
                this.openCardScanner();
            });
        }

        // Search button
        const searchBtn = document.getElementById('search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.performCardSearch();
            });
        }

        // Filter selects
        document.querySelectorAll('.filter-select').forEach(select => {
            select.addEventListener('change', () => {
                this.updateSearchFilters();
            });
        });

        // Deck management buttons
        const saveBtn = document.getElementById('save-deck');
        const loadBtn = document.getElementById('load-deck');
        const exportBtn = document.getElementById('export-deck');

        if (saveBtn) saveBtn.addEventListener('click', () => this.saveDeck());
        if (loadBtn) loadBtn.addEventListener('click', () => this.loadDeck());
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportDeck());

        // Settings buttons
        const importBtn = document.getElementById('import-collection');
        const exportCollectionBtn = document.getElementById('export-collection');
        const adminBtn = document.getElementById('open-admin-panel');

        if (importBtn) importBtn.addEventListener('click', () => this.importCollection());
        if (exportCollectionBtn) exportCollectionBtn.addEventListener('click', () => this.exportCollection());
        if (adminBtn) adminBtn.addEventListener('click', () => this.openAdminPanel());
    }

    setupNavigation() {
        // Initialize with collection section active
        this.switchSection('collection');
    }

    setupFilterChips() {
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                const filterType = e.target.dataset.filter;
                const filterValue = e.target.dataset.value;
                this.toggleFilter(chip, filterType, filterValue);
            });
        });
    }

    setupAuthButtons() {
        // Setup all auth buttons to use the same handlers
        const authButtons = [
            'auth-btn-mini',
            'auth-btn-full'
        ];

        authButtons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.addEventListener('click', () => {
                    this.handleAuth();
                });
            }
        });
    }

    switchSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-icon').forEach(icon => {
            icon.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

        // Update sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(`${sectionName}-section`).classList.add('active');

        this.currentSection = sectionName;

        // Load section-specific data
        this.loadSectionData(sectionName);
    }

    loadSectionData(sectionName) {
        switch (sectionName) {
            case 'collection':
                this.loadCollectionData();
                break;
            case 'search':
                this.loadSearchData();
                break;
            case 'deck':
                this.loadDeckData();
                break;
            case 'settings':
                this.loadSettingsData();
                break;
        }
    }

    toggleFilter(chipElement, filterType, filterValue) {
        const isActive = chipElement.classList.contains('active');
        
        if (isActive) {
            chipElement.classList.remove('active');
            this.removeFilter(filterType, filterValue);
        } else {
            // Remove other active chips of the same type (single selection)
            document.querySelectorAll(`[data-filter="${filterType}"]`).forEach(chip => {
                chip.classList.remove('active');
            });
            chipElement.classList.add('active');
            this.addFilter(filterType, filterValue);
        }

        this.applyFilters();
    }

    addFilter(type, value) {
        this.filters.active = this.filters.active.filter(f => f.type !== type);
        if (value) {
            this.filters.active.push({ type, value });
        }
    }

    removeFilter(type, value) {
        this.filters.active = this.filters.active.filter(f => 
            !(f.type === type && f.value === value)
        );
    }

    applyFilters() {
        // Apply filters to current collection view
        this.filterCollectionCards();
    }

    handleCollectionSearch(query) {
        this.filters.search = query;
        this.filterCollectionCards();
    }

    handleCardSearch(query) {
        // Handle card database search
        if (query.length > 2) {
            this.searchCardDatabase(query);
        } else {
            this.clearSearchResults();
        }
    }

    filterCollectionCards() {
        // This will integrate with the existing collection system
        if (window.app && window.app.filterCollection) {
            const filters = {
                search: this.filters.search,
                ...this.filters.active.reduce((acc, filter) => {
                    acc[filter.type] = filter.value;
                    return acc;
                }, {})
            };
            window.app.filterCollection(filters);
        }
    }

    searchCardDatabase(query) {
        // This will integrate with the existing search system
        if (window.app && window.app.searchCards) {
            const filters = this.getSearchFilters();
            window.app.searchCards(query, filters);
        }
    }

    getSearchFilters() {
        return {
            color: document.getElementById('color-filter')?.value || '',
            type: document.getElementById('type-filter')?.value || '',
            set: document.getElementById('search-set-filter')?.value || ''
        };
    }

    performCardSearch() {
        const query = document.getElementById('card-search')?.value || '';
        if (query) {
            this.searchCardDatabase(query);
        }
    }

    updateSearchFilters() {
        const query = document.getElementById('card-search')?.value || '';
        if (query) {
            this.searchCardDatabase(query);
        }
    }

    clearSearchResults() {
        const resultsContainer = document.getElementById('search-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = '';
        }
    }

    openCardScanner() {
        // Integrate with existing card scanner
        if (window.app && window.app.openCardScanner) {
            window.app.openCardScanner();
        } else {
            // Fallback to modal
            document.getElementById('add-card-modal')?.style.setProperty('display', 'block');
        }
    }

    loadCollectionData() {
        // Load and display collection stats
        this.updateCollectionStats();
        this.displayCollectionCards();
    }

    loadSearchData() {
        // Initialize search filters
        this.populateSetFilters();
    }

    loadDeckData() {
        // Load current deck data
        this.updateDeckStats();
        this.displayCurrentDeck();
    }

    loadSettingsData() {
        // Load user settings and info
        this.updateUserInfo();
        this.checkAdminStatus();
    }

    updateCollectionStats() {
        // This will integrate with existing collection stats
        if (window.app && window.app.collection) {
            const stats = window.app.getCollectionStats();
            document.getElementById('total-cards').textContent = stats.totalCards || '0';
            document.getElementById('total-value').textContent = stats.totalValue || '$0';
            document.getElementById('unique-cards').textContent = stats.uniqueCards || '0';
        }
    }

    displayCollectionCards() {
        const grid = document.getElementById('collection-grid');
        const emptyState = document.getElementById('empty-state');
        
        if (window.app && window.app.collection && window.app.collection.length > 0) {
            emptyState.style.display = 'none';
            this.renderCollectionGrid(window.app.collection);
        } else {
            emptyState.style.display = 'block';
        }
    }

    renderCollectionGrid(cards) {
        const grid = document.getElementById('collection-grid');
        const emptyState = document.getElementById('empty-state');
        
        // Clear existing cards (except empty state)
        const existingCards = grid.querySelectorAll('.card-thumb:not(.empty-state)');
        existingCards.forEach(card => card.remove());

        if (cards.length === 0) {
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        cards.forEach(card => {
            const cardElement = this.createCardElement(card);
            grid.appendChild(cardElement);
        });
    }

    createCardElement(card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'card-thumb';
        cardDiv.dataset.cardId = card.id;

        if (card.image_url) {
            const img = document.createElement('img');
            img.src = card.image_url;
            img.alt = card.name;
            img.loading = 'lazy';
            cardDiv.appendChild(img);
        } else {
            // Placeholder for cards without images
            cardDiv.innerHTML = `
                <div style="padding: 10px; text-align: center; color: var(--text-muted);">
                    <i class="fas fa-image" style="font-size: 2rem; margin-bottom: 8px;"></i>
                    <p style="font-size: 0.8rem; margin: 0;">${card.name}</p>
                </div>
            `;
        }

        // Add click handler
        cardDiv.addEventListener('click', () => {
            this.showCardDetails(card);
        });

        return cardDiv;
    }

    showCardDetails(card) {
        // Enhanced card modal display
        this.openCardModal(card);
    }

    openCardModal(card) {
        const modal = document.getElementById('cardModal');
        const cardImage = document.getElementById('cardImage');
        const cardName = document.getElementById('modalCardName');
        
        // Store current card for later use
        this.currentModalCard = card;
        
        // Populate card data
        if (card) {
            cardName.textContent = card.name || 'Unknown Card';
            cardImage.src = card.image_url || card.image_uris?.normal || '';
            cardImage.alt = card.name || 'Card Image';
            
            // Populate detailed information
            this.populateCardDetails(card);
        }
        
        // Show modal with animation
        modal.classList.add('active');
        modal.style.display = 'block';
        
        // Set up event listeners
        this.setupCardModalEvents();
        
        // Initialize with stats tab active
        this.showCardTab('stats');
    }

    populateCardDetails(card) {
        // Stats tab
        document.getElementById('cardType').textContent = card.type_line || 'Unknown Type';
        document.getElementById('cardManaCost').textContent = card.mana_cost || 'N/A';
        document.getElementById('cardPowerToughness').textContent = 
            card.power && card.toughness ? `${card.power}/${card.toughness}` : 'N/A';
        document.getElementById('cardAbilities').textContent = 
            card.oracle_text || 'No abilities listed';
        document.getElementById('cardSet').textContent = card.set_name || 'Unknown Set';
        document.getElementById('cardRarity').textContent = 
            card.rarity ? card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1) : 'Unknown';
        
        // Flavor tab
        const flavorText = document.getElementById('cardFlavorText');
        flavorText.textContent = card.flavor_text || 'No flavor text available.';
        
        // Rulings tab
        const rulingsDiv = document.getElementById('cardRulings');
        if (card.rulings && card.rulings.length > 0) {
            rulingsDiv.innerHTML = card.rulings.map(ruling => 
                `<p><strong>${ruling.published_at}:</strong> ${ruling.comment}</p>`
            ).join('');
        } else {
            rulingsDiv.innerHTML = '<p>No rulings available for this card.</p>';
        }
    }

    setupCardModalEvents() {
        const modal = document.getElementById('cardModal');
        const closeBtn = document.getElementById('closeCardModal');
        const cardImage = document.getElementById('cardImage');
        
        // Remove existing event listeners to prevent duplicates
        if (this.modalEventListeners) {
            this.modalEventListeners.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
        }
        this.modalEventListeners = [];
        
        // Close button
        const closeHandler = () => this.closeCardModal();
        closeBtn.onclick = closeHandler;
        this.modalEventListeners.push({ element: closeBtn, event: 'click', handler: closeHandler });
        
        // Click outside to close
        const modalClickHandler = (e) => {
            if (e.target === modal) {
                this.closeCardModal();
            }
        };
        modal.onclick = modalClickHandler;
        this.modalEventListeners.push({ element: modal, event: 'click', handler: modalClickHandler });
        
        // Image zoom functionality
        const imageClickHandler = () => {
            cardImage.classList.toggle('zoomed');
        };
        cardImage.onclick = imageClickHandler;
        this.modalEventListeners.push({ element: cardImage, event: 'click', handler: imageClickHandler });
        
        // Action buttons
        const addToDeckHandler = () => this.addCardToDeck();
        const addToCollectionHandler = () => this.addCardToCollection();
        const favoriteHandler = () => this.toggleCardFavorite();
        
        const addToDeckBtn = document.getElementById('addToDeckBtn');
        const addToCollectionBtn = document.getElementById('addToCollectionBtn');
        const favoriteBtn = document.getElementById('favoriteBtn');
        
        if (addToDeckBtn) {
            addToDeckBtn.onclick = addToDeckHandler;
            this.modalEventListeners.push({ element: addToDeckBtn, event: 'click', handler: addToDeckHandler });
        }
        
        if (addToCollectionBtn) {
            addToCollectionBtn.onclick = addToCollectionHandler;
            this.modalEventListeners.push({ element: addToCollectionBtn, event: 'click', handler: addToCollectionHandler });
        }
        
        if (favoriteBtn) {
            favoriteBtn.onclick = favoriteHandler;
            this.modalEventListeners.push({ element: favoriteBtn, event: 'click', handler: favoriteHandler });
        }
        
        // Keyboard navigation
        const keydownHandler = this.handleModalKeydown.bind(this);
        document.addEventListener('keydown', keydownHandler);
        this.modalEventListeners.push({ element: document, event: 'keydown', handler: keydownHandler });
    }

    closeCardModal() {
        const modal = document.getElementById('cardModal');
        modal.classList.remove('active');
        modal.style.display = 'none';
        
        // Clean up event listeners
        if (this.modalEventListeners) {
            this.modalEventListeners.forEach(({ element, event, handler }) => {
                element.removeEventListener(event, handler);
            });
            this.modalEventListeners = [];
        }
        
        // Reset image zoom
        const cardImage = document.getElementById('cardImage');
        cardImage.classList.remove('zoomed');
        
        // Clear current modal card
        this.currentModalCard = null;
    }

    handleModalKeydown(e) {
        const modal = document.getElementById('cardModal');
        if (!modal.classList.contains('active')) return;
        
        switch(e.key) {
            case 'Escape':
                this.closeCardModal();
                break;
            case '1':
                this.showCardTab('stats');
                break;
            case '2':
                this.showCardTab('flavor');
                break;
            case '3':
                this.showCardTab('rulings');
                break;
        }
    }

    addCardToDeck() {
        // Integration with deck builder
        if (window.deckBuilder && window.deckBuilder.addCard) {
            const cardData = this.getCurrentModalCard();
            window.deckBuilder.addCard(cardData);
            this.showNotification('Card added to deck!', 'success');
        } else {
            this.showNotification('Deck builder not available', 'error');
        }
    }

    addCardToCollection() {
        // Integration with collection system
        if (window.app && window.app.addToCollection) {
            const cardData = this.getCurrentModalCard();
            window.app.addToCollection(cardData);
            this.showNotification('Card added to collection!', 'success');
        } else {
            this.showNotification('Collection system not available', 'error');
        }
    }

    toggleCardFavorite() {
        // Integration with favorites system
        if (window.app && window.app.toggleFavorite) {
            const cardData = this.getCurrentModalCard();
            const isFavorited = window.app.toggleFavorite(cardData);
            this.showNotification(
                isFavorited ? 'Card added to favorites!' : 'Card removed from favorites!', 
                'success'
            );
        } else {
            this.showNotification('Favorites system not available', 'error');
        }
    }

    getCurrentModalCard() {
        // Return stored card data or extract from modal
        if (this.currentModalCard) {
            return this.currentModalCard;
        }
        
        // Fallback: extract current card data from modal
        const powerToughness = document.getElementById('cardPowerToughness').textContent;
        const ptParts = powerToughness.includes('/') ? powerToughness.split('/') : ['', ''];
        
        return {
            name: document.getElementById('modalCardName').textContent,
            type_line: document.getElementById('cardType').textContent,
            mana_cost: document.getElementById('cardManaCost').textContent,
            power: ptParts[0] || null,
            toughness: ptParts[1] || null,
            oracle_text: document.getElementById('cardAbilities').textContent,
            set_name: document.getElementById('cardSet').textContent,
            rarity: document.getElementById('cardRarity').textContent.toLowerCase(),
            flavor_text: document.getElementById('cardFlavorText').textContent,
            image_url: document.getElementById('cardImage').src
        };
    }

    // Enhanced card tab switching functionality
    showCardTab(tabName) {
        const tabs = ['stats', 'flavor', 'rulings'];
        
        // Hide all tab contents and deactivate all tabs
        tabs.forEach(name => {
            const tabContent = document.getElementById(`${name}Tab`);
            const tabButton = document.querySelector(`.card-tabs .tab[onclick*="${name}"]`);
            
            if (tabContent) {
                tabContent.classList.add('hidden');
            }
            if (tabButton) {
                tabButton.classList.remove('active');
            }
        });
        
        // Show active tab content and activate tab button
        const activeTabContent = document.getElementById(`${tabName}Tab`);
        const activeTabButton = document.querySelector(`.card-tabs .tab[onclick*="${tabName}"]`);
        
        if (activeTabContent) {
            activeTabContent.classList.remove('hidden');
        }
        if (activeTabButton) {
            activeTabButton.classList.add('active');
        }
    }

    populateSetFilters() {
        // Populate set filter options
        if (window.app && window.app.getAvailableSets) {
            const sets = window.app.getAvailableSets();
            const setFilter = document.getElementById('search-set-filter');
            if (setFilter && sets) {
                setFilter.innerHTML = '<option value="">All Sets</option>';
                sets.forEach(set => {
                    const option = document.createElement('option');
                    option.value = set.code;
                    option.textContent = set.name;
                    setFilter.appendChild(option);
                });
            }
        }
    }

    updateDeckStats() {
        // Update deck statistics
        if (window.deckBuilder && window.deckBuilder.currentDeck) {
            const deck = window.deckBuilder.currentDeck;
            const stats = window.deckBuilder.getDeckStats(deck);
            
            document.getElementById('deck-total-cards').textContent = stats.totalCards || '0';
            document.getElementById('deck-creatures').textContent = stats.creatures || '0';
            document.getElementById('deck-spells').textContent = stats.spells || '0';
            document.getElementById('deck-lands').textContent = stats.lands || '0';
        }
    }

    displayCurrentDeck() {
        // Display current deck contents
        if (window.deckBuilder && window.deckBuilder.currentDeck) {
            const deckList = document.getElementById('deck-list');
            const emptyMessage = deckList.querySelector('.empty-deck-message');
            
            if (window.deckBuilder.currentDeck.length > 0) {
                emptyMessage.style.display = 'none';
                this.renderDeckList(window.deckBuilder.currentDeck);
            } else {
                emptyMessage.style.display = 'block';
            }
        }
    }

    renderDeckList(deck) {
        const deckList = document.getElementById('deck-list');
        const emptyMessage = deckList.querySelector('.empty-deck-message');
        
        // Clear existing deck cards
        const existingCards = deckList.querySelectorAll('.deck-card-item');
        existingCards.forEach(card => card.remove());

        deck.forEach(card => {
            const cardElement = this.createDeckCardElement(card);
            deckList.appendChild(cardElement);
        });
    }

    createDeckCardElement(card) {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'deck-card-item';
        cardDiv.innerHTML = `
            <div class="deck-card-info">
                <div class="deck-card-name">${card.name}</div>
                <div class="deck-card-details">
                    <span>CMC: ${card.cmc || 0}</span>
                    <span>${card.type_line || 'Unknown Type'}</span>
                </div>
            </div>
            <div class="deck-card-actions">
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="deckForge.adjustCardQuantity('${card.id}', -1)">-</button>
                    <span class="quantity-display">${card.quantity || 1}</span>
                    <button class="quantity-btn" onclick="deckForge.adjustCardQuantity('${card.id}', 1)">+</button>
                </div>
                <button class="remove-from-deck-btn" onclick="deckForge.removeFromDeck('${card.id}')">Remove</button>
            </div>
        `;
        return cardDiv;
    }

    adjustCardQuantity(cardId, change) {
        if (window.deckBuilder && window.deckBuilder.adjustCardQuantity) {
            window.deckBuilder.adjustCardQuantity(cardId, change);
            this.updateDeckStats();
            this.displayCurrentDeck();
        }
    }

    removeFromDeck(cardId) {
        if (window.deckBuilder && window.deckBuilder.removeCard) {
            window.deckBuilder.removeCard(cardId);
            this.updateDeckStats();
            this.displayCurrentDeck();
        }
    }

    saveDeck() {
        if (window.deckBuilder && window.deckBuilder.saveDeck) {
            const deckName = document.getElementById('deck-name')?.value || 'Untitled Deck';
            window.deckBuilder.saveDeck(deckName);
            this.showNotification('Deck saved successfully!', 'success');
        }
    }

    loadDeck() {
        if (window.deckBuilder && window.deckBuilder.loadDeck) {
            window.deckBuilder.showLoadDeckModal();
        }
    }

    exportDeck() {
        if (window.deckBuilder && window.deckBuilder.exportDeck) {
            window.deckBuilder.exportDeck();
        }
    }

    updateUserInfo() {
        // Update user information in settings
        if (window.app && window.app.currentUser) {
            const user = window.app.currentUser;
            document.getElementById('current-username').textContent = user.username || 'Guest';
            document.getElementById('current-role').textContent = user.role || 'USER';
            
            // Update auth button text
            const authBtns = ['auth-btn-mini', 'auth-btn-full'];
            authBtns.forEach(btnId => {
                const btn = document.getElementById(btnId);
                const textSpan = document.getElementById(btnId.replace('btn', 'btn-text'));
                if (btn && textSpan) {
                    if (user.username) {
                        textSpan.textContent = 'Sign Out';
                    } else {
                        textSpan.textContent = 'Sign In';
                    }
                }
            });
        }
    }

    checkAdminStatus() {
        // Show/hide admin settings based on user role
        if (window.app && window.app.currentUser && window.app.currentUser.role === 'ADMIN') {
            const adminSettings = document.getElementById('admin-settings');
            if (adminSettings) {
                adminSettings.style.display = 'block';
            }
        }
    }

    handleAuth() {
        if (window.app) {
            if (window.app.currentUser && window.app.currentUser.username) {
                // User is logged in, sign out
                window.app.signOut();
            } else {
                // User is not logged in, show login modal
                document.getElementById('login-modal')?.style.setProperty('display', 'block');
            }
        }
    }

    importCollection() {
        if (window.collectionImportExport && window.collectionImportExport.showImportModal) {
            window.collectionImportExport.showImportModal();
        }
    }

    exportCollection() {
        if (window.collectionImportExport && window.collectionImportExport.exportCollection) {
            window.collectionImportExport.exportCollection();
        }
    }

    openAdminPanel() {
        document.getElementById('admin-modal')?.style.setProperty('display', 'block');
    }

    showNotification(message, type = 'info') {
        // Create and show notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--red-primary)' : 'var(--bg-charcoal)'};
            color: var(--text-light);
            padding: 12px 20px;
            border-radius: 8px;
            border: 1px solid var(--red-primary);
            z-index: 3000;
            animation: slideInRight 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Integration methods for existing functionality
    onCollectionUpdate() {
        if (this.currentSection === 'collection') {
            this.loadCollectionData();
        }
    }

    onUserUpdate() {
        this.updateUserInfo();
        this.checkAdminStatus();
    }

    onDeckUpdate() {
        if (this.currentSection === 'deck') {
            this.loadDeckData();
        }
    }
}

// Initialize Deck Forge App
let deckForge;
let swipeableUI;
let deckBuilder;
let deckQRIntegration;

document.addEventListener('DOMContentLoaded', () => {
    deckForge = new DeckForgeApp();
    
    // Initialize SwipeableUI with the main app
    swipeableUI = new SwipeableUI(deckForge);
    
    // Initialize Deck Builder
    if (window.DeckBuilder) {
        deckBuilder = new DeckBuilder(deckForge);
        window.deckBuilder = deckBuilder;
    }
    
    // Initialize QR Integration after deck builder is ready
    if (window.DeckQRIntegration && deckBuilder) {
        deckQRIntegration = new DeckQRIntegration(deckForge, deckBuilder);
        window.deckQRIntegration = deckQRIntegration;
    }
    
    // Make them globally available for integration
    window.deckForge = deckForge;
    window.swipeableUI = swipeableUI;
    
    // Connect the swipeable UI to the main app
    deckForge.swipeableUI = swipeableUI;
    
    // Add notification styles
    const notificationStyles = document.createElement('style');
    notificationStyles.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        .notification {
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            font-weight: 600;
            font-family: var(--font-body);
        }
    `;
    document.head.appendChild(notificationStyles);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DeckForgeApp;
}

// FAB (Floating Action Button) Functionality
function toggleFabMenu() {
    const actions = document.querySelector('.fab-actions');
    const fabMain = document.querySelector('.fab-main');
    
    if (actions && fabMain) {
        const isHidden = actions.classList.contains('hidden');
        
        if (isHidden) {
            // Show actions
            actions.classList.remove('hidden');
            fabMain.classList.add('rotating');
            
            // Animate action buttons in sequence
            const buttons = actions.querySelectorAll('button');
            buttons.forEach((button, index) => {
                button.style.animationDelay = `${(index + 1) * 0.1}s`;
            });
        } else {
            // Hide actions
            actions.classList.add('hidden');
            fabMain.classList.remove('rotating');
        }
    }
}

function initFAB(actions) {
    const container = document.querySelector('.fab-actions');
    if (!container) return;
    
    container.innerHTML = '';
    actions.forEach(({ icon, title, action }) => {
        const btn = document.createElement('button');
        btn.innerHTML = `<i class="${icon}"></i>`;
        btn.title = title;
        btn.onclick = action;
        container.appendChild(btn);
    });
}

// FAB Action Functions
function openDeckBuilder() {
    // Close FAB menu first
    toggleFabMenu();
    
    // Switch to deck section
    if (window.deckForge) {
        window.deckForge.switchSection('deck');
        window.deckForge.showNotification('Deck Builder opened!', 'success');
    }
}

function startCardScan() {
    // Close FAB menu first
    toggleFabMenu();
    
    // Open card scanner
    if (window.deckForge) {
        window.deckForge.openCardScanner();
        window.deckForge.showNotification('Card scanner activated!', 'success');
    } else {
        // Fallback to scan button click
        const scanBtn = document.getElementById('scan-card-btn');
        if (scanBtn) {
            scanBtn.click();
        }
    }
}

function launchARPreview() {
    // Close FAB menu first
    toggleFabMenu();
    
    // AR Preview functionality (placeholder for future implementation)
    if (window.deckForge) {
        window.deckForge.showNotification('AR Preview coming soon!', 'info');
    }
    
    // For now, show a modal or notification about AR features
    showARPreviewModal();
}

function openProfile() {
    // Close FAB menu first
    toggleFabMenu();
    
    // Switch to settings section (where profile is located)
    if (window.deckForge) {
        window.deckForge.switchSection('settings');
        window.deckForge.showNotification('Profile opened!', 'success');
    }
}

function showARPreviewModal() {
    // Create a temporary modal for AR preview info
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="modal-content" style="max-width: 400px;">
            <div class="modal-header">
                <h3>AR Preview</h3>
                <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div style="text-align: center; padding: 20px;">
                    <i class="fas fa-cube" style="font-size: 3rem; color: var(--red-primary); margin-bottom: 15px;"></i>
                    <h4 style="color: var(--red-primary); margin-bottom: 15px;">AR Preview Coming Soon!</h4>
                    <p style="color: var(--text-muted); margin-bottom: 20px;">
                        Experience your MTG cards in augmented reality. View 3D models, animations, and interactive card details.
                    </p>
                    <div style="background: var(--bg-charcoal); padding: 15px; border-radius: 8px; border: 1px solid var(--red-primary);">
                        <h5 style="color: var(--text-light); margin-bottom: 10px;">Planned Features:</h5>
                        <ul style="text-align: left; color: var(--text-muted); margin: 0; padding-left: 20px;">
                            <li>3D card visualization</li>
                            <li>Interactive card abilities</li>
                            <li>Deck preview in AR space</li>
                            <li>Card comparison tools</li>
                        </ul>
                    </div>
                </div>
                <div class="form-actions">
                    <button class="btn btn-primary" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-check"></i> Got it!
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // Add click outside to close
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    document.body.appendChild(modal);
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (modal.parentNode) {
            modal.remove();
        }
    }, 10000);
}

// Initialize FAB with default actions when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other scripts to load
    setTimeout(() => {
        // Set up default FAB actions
        const defaultActions = [
            {
                icon: 'fas fa-layer-group',
                title: 'New Deck',
                action: openDeckBuilder
            },
            {
                icon: 'fas fa-camera',
                title: 'Scan Card',
                action: startCardScan
            },
            {
                icon: 'fas fa-cube',
                title: 'AR Preview',
                action: launchARPreview
            },
            {
                icon: 'fas fa-user',
                title: 'Profile',
                action: openProfile
            }
        ];
        
        // Initialize FAB with default actions
        initFAB(defaultActions);
        
        // Add keyboard shortcut for FAB
        document.addEventListener('keydown', (e) => {
            // Press 'F' key to toggle FAB menu
            if (e.key.toLowerCase() === 'f' && !e.ctrlKey && !e.altKey && !e.metaKey) {
                // Only if not typing in an input field
                const activeElement = document.activeElement;
                if (activeElement.tagName !== 'INPUT' && 
                    activeElement.tagName !== 'TEXTAREA' && 
                    !activeElement.isContentEditable) {
                    e.preventDefault();
                    toggleFabMenu();
                }
            }
            
            // Press Escape to close FAB menu
            if (e.key === 'Escape') {
                const actions = document.querySelector('.fab-actions');
                if (actions && !actions.classList.contains('hidden')) {
                    toggleFabMenu();
                }
            }
        });
        
        // Close FAB menu when clicking outside
        document.addEventListener('click', (e) => {
            const fabContainer = document.querySelector('.fab-container');
            const actions = document.querySelector('.fab-actions');
            
            if (fabContainer && actions && !actions.classList.contains('hidden')) {
                if (!fabContainer.contains(e.target)) {
                    toggleFabMenu();
                }
            }
        });
        
        // Add touch support for mobile
        let touchStartY = 0;
        let touchStartX = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
            touchStartX = e.touches[0].clientX;
        });
        
        document.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const touchEndX = e.changedTouches[0].clientX;
            const deltaY = touchStartY - touchEndY;
            const deltaX = Math.abs(touchStartX - touchEndX);
            
            // Swipe up gesture to open FAB (if near bottom right)
            if (deltaY > 50 && deltaX < 100) {
                const fabContainer = document.querySelector('.fab-container');
                const actions = document.querySelector('.fab-actions');
                
                if (fabContainer && actions && actions.classList.contains('hidden')) {
                    const rect = fabContainer.getBoundingClientRect();
                    const touchX = e.changedTouches[0].clientX;
                    const touchY = touchStartY;
                    
                    // Check if touch started near FAB area
                    if (touchX > window.innerWidth - 150 && touchY > window.innerHeight - 200) {
                        toggleFabMenu();
                    }
                }
            }
        });
        
    }, 500);
});

// Make functions globally available
window.toggleFabMenu = toggleFabMenu;
window.initFAB = initFAB;
window.openDeckBuilder = openDeckBuilder;
window.startCardScan = startCardScan;
window.launchARPreview = launchARPreview;
window.openProfile = openProfile;
