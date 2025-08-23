// Swipeable UI Components - MTG Collection Tracker
// Handles swipeable deck tabs and enhanced card modal functionality

class SwipeableUI {
    constructor(app) {
        this.app = app;
        this.currentTab = 0;
        this.tabs = [];
        this.cardModal = null;
        this.currentCardData = null;
        this.scale = 1;
        this.pressTimer = null;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.isZoomed = false;
        
        this.init();
    }

    init() {
        this.setupDeckTabs();
        this.setupCardModal();
        this.setupEventListeners();
    }

    setupDeckTabs() {
        const tabsContainer = document.getElementById('deckTabs');
        if (!tabsContainer) return;

        this.tabs = Array.from(tabsContainer.querySelectorAll('.deck-tab'));
        this.currentTab = this.tabs.findIndex(tab => tab.classList.contains('active'));
        if (this.currentTab === -1) this.currentTab = 0;

        // Add click handlers for tabs
        this.tabs.forEach((tab, index) => {
            tab.addEventListener('click', () => this.switchTab(index));
        });

        // Add touch gesture support for tab swiping
        this.setupTabSwipeGestures(tabsContainer);
        
        // Add keyboard navigation
        this.setupTabKeyboardNavigation();
    }

    setupCardModal() {
        this.cardModal = document.getElementById('cardModal');
        if (!this.cardModal) return;

        const closeBtn = document.getElementById('closeCardModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeCardModal());
        }

        // Close modal when clicking outside
        this.cardModal.addEventListener('click', (e) => {
            if (e.target === this.cardModal) {
                this.closeCardModal();
            }
        });

        // Setup card image interactions
        const cardImage = document.getElementById('cardImage');
        if (cardImage) {
            this.setupCardImageInteractions(cardImage);
        }

        // Setup quick action buttons
        this.setupQuickActions();
    }

    setupEventListeners() {
        // Keyboard navigation for tabs
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight' && this.isTabsVisible()) {
                e.preventDefault();
                this.switchTab(1, true);
            }
            if (e.key === 'ArrowLeft' && this.isTabsVisible()) {
                e.preventDefault();
                this.switchTab(-1, true);
            }
            if (e.key === 'Escape' && this.cardModal && this.cardModal.classList.contains('active')) {
                this.closeCardModal();
            }
        });

        // Add card click handlers to existing card elements
        this.setupCardClickHandlers();
    }

    setupTabSwipeGestures(container) {
        let startX = 0;
        let startY = 0;
        let isScrolling = false;

        container.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
            isScrolling = false;
        }, { passive: true });

        container.addEventListener('touchmove', (e) => {
            if (!startX || !startY) return;

            const currentX = e.touches[0].clientX;
            const currentY = e.touches[0].clientY;
            const diffX = Math.abs(currentX - startX);
            const diffY = Math.abs(currentY - startY);

            if (diffY > diffX) {
                isScrolling = true;
            }
        }, { passive: true });

        container.addEventListener('touchend', (e) => {
            if (!startX || isScrolling) return;

            const endX = e.changedTouches[0].clientX;
            const diffX = startX - endX;

            // Minimum swipe distance
            if (Math.abs(diffX) > 50) {
                if (diffX > 0) {
                    // Swipe left - next tab
                    this.switchTab(1, true);
                } else {
                    // Swipe right - previous tab
                    this.switchTab(-1, true);
                }
            }

            startX = 0;
            startY = 0;
        }, { passive: true });
    }

    setupTabKeyboardNavigation() {
        this.tabs.forEach((tab, index) => {
            tab.setAttribute('tabindex', '0');
            tab.setAttribute('role', 'tab');
            tab.setAttribute('aria-selected', index === this.currentTab ? 'true' : 'false');
            
            tab.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.switchTab(index);
                }
            });
        });
    }

    setupCardImageInteractions(cardImage) {
        // Mouse wheel zoom
        cardImage.addEventListener('wheel', (e) => {
            e.preventDefault();
            this.handleZoom(e.deltaY * -0.001);
        });

        // Touch pinch zoom (basic implementation)
        let initialDistance = 0;
        let initialScale = 1;

        cardImage.addEventListener('touchstart', (e) => {
            if (e.touches.length === 2) {
                initialDistance = this.getTouchDistance(e.touches);
                initialScale = this.scale;
            } else if (e.touches.length === 1) {
                // Long press for quick actions
                this.startLongPress();
            }
        });

        cardImage.addEventListener('touchmove', (e) => {
            if (e.touches.length === 2) {
                e.preventDefault();
                const currentDistance = this.getTouchDistance(e.touches);
                const scaleChange = currentDistance / initialDistance;
                this.scale = Math.min(Math.max(1, initialScale * scaleChange), 3);
                this.updateImageScale();
            }
        });

        cardImage.addEventListener('touchend', () => {
            this.clearLongPress();
        });

        // Mouse interactions
        cardImage.addEventListener('mousedown', () => {
            this.startLongPress();
        });

        cardImage.addEventListener('mouseup', () => {
            this.clearLongPress();
        });

        cardImage.addEventListener('mouseleave', () => {
            this.clearLongPress();
        });

        // Click to toggle zoom
        cardImage.addEventListener('click', (e) => {
            if (!this.pressTimer) {
                this.toggleZoom();
            }
        });
    }

    setupQuickActions() {
        const addToDeckBtn = document.getElementById('addToDeckBtn');
        const addToCollectionBtn = document.getElementById('addToCollectionBtn');
        const favoriteBtn = document.getElementById('favoriteBtn');

        if (addToDeckBtn) {
            addToDeckBtn.addEventListener('click', () => this.addToDeck());
        }

        if (addToCollectionBtn) {
            addToCollectionBtn.addEventListener('click', () => this.addToCollection());
        }

        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', () => this.toggleFavorite());
        }
    }

    setupCardClickHandlers() {
        // Add click handlers to existing card thumbnails
        const updateCardHandlers = () => {
            const cardThumbs = document.querySelectorAll('.card-thumb, .search-result-card');
            cardThumbs.forEach(card => {
                if (!card.hasAttribute('data-swipe-handler')) {
                    card.setAttribute('data-swipe-handler', 'true');
                    card.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.openCardModal(this.extractCardData(card));
                    });
                }
            });
        };

        // Initial setup
        updateCardHandlers();

        // Update when new cards are added
        const observer = new MutationObserver(() => {
            updateCardHandlers();
        });

        const collectionGrid = document.getElementById('collection-grid');
        const searchResults = document.getElementById('search-results');

        if (collectionGrid) {
            observer.observe(collectionGrid, { childList: true, subtree: true });
        }
        if (searchResults) {
            observer.observe(searchResults, { childList: true, subtree: true });
        }
    }

    // Tab Management
    switchTab(direction, relative = false) {
        if (this.tabs.length === 0) return;

        // Remove active class from current tab
        this.tabs[this.currentTab].classList.remove('active');
        this.tabs[this.currentTab].setAttribute('aria-selected', 'false');

        if (relative) {
            // Relative movement (for swipe/keyboard)
            this.currentTab = (this.currentTab + direction + this.tabs.length) % this.tabs.length;
        } else {
            // Absolute position (for click)
            this.currentTab = direction;
        }

        // Add active class to new tab
        this.tabs[this.currentTab].classList.add('active');
        this.tabs[this.currentTab].setAttribute('aria-selected', 'true');

        // Scroll tab into view
        this.tabs[this.currentTab].scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
        });

        // Filter decks based on selected tab
        this.filterDecksByType();

        // Announce change for screen readers
        this.announceTabChange();
    }

    filterDecksByType() {
        const activeTab = this.tabs[this.currentTab];
        const deckType = activeTab.getAttribute('data-deck-type');
        
        // This would integrate with the existing deck builder to filter saved decks
        if (this.app && this.app.deckBuilder && this.app.deckBuilder.filterDecksByType) {
            this.app.deckBuilder.filterDecksByType(deckType);
        }

        // Update deck list display based on type
        this.updateDeckListForType(deckType);
    }

    updateDeckListForType(deckType) {
        // This is a placeholder for deck filtering logic
        // In a real implementation, this would filter the saved decks list
        console.log(`Filtering decks by type: ${deckType}`);
        
        // You could add visual indicators or update the deck management UI here
        const deckManagement = document.querySelector('.deck-management');
        if (deckManagement) {
            deckManagement.setAttribute('data-current-type', deckType);
        }
    }

    // Card Modal Management
    openCardModal(cardData) {
        if (!this.cardModal || !cardData) return;

        this.currentCardData = cardData;
        
        // Update modal content
        const cardImage = document.getElementById('cardImage');
        const cardName = document.getElementById('modalCardName');
        const cardDetails = document.getElementById('modalCardDetails');

        if (cardImage) {
            cardImage.src = cardData.imageUrl || cardData.image_uris?.normal || '/placeholder-card.jpg';
            cardImage.alt = cardData.name || 'Card Image';
        }

        if (cardName) {
            cardName.textContent = cardData.name || 'Unknown Card';
        }

        if (cardDetails) {
            cardDetails.innerHTML = this.generateCardDetails(cardData);
        }

        // Reset zoom
        this.scale = 1;
        this.isZoomed = false;
        this.updateImageScale();

        // Show modal
        this.cardModal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Show quick actions after a delay
        setTimeout(() => {
            this.cardModal.classList.add('show-actions');
        }, 300);

        // Focus management for accessibility
        const closeBtn = document.getElementById('closeCardModal');
        if (closeBtn) {
            closeBtn.focus();
        }
    }

    closeCardModal() {
        if (!this.cardModal) return;

        this.cardModal.classList.remove('active', 'show-actions');
        document.body.style.overflow = '';
        this.currentCardData = null;
        
        // Clear any ongoing timers
        this.clearLongPress();
    }

    generateCardDetails(cardData) {
        let details = '';
        
        if (cardData.type_line || cardData.type) {
            details += `<div><strong>Type:</strong> ${cardData.type_line || cardData.type}</div>`;
        }
        
        if (cardData.mana_cost || cardData.manaCost) {
            const manaCost = cardData.mana_cost || cardData.manaCost;
            const renderedMana = window.manaSymbolRenderer ? 
                window.manaSymbolRenderer.renderManaSymbols(manaCost) : manaCost;
            details += `<div><strong>Mana Cost:</strong> ${renderedMana}</div>`;
        }
        
        if (cardData.set_name || cardData.set) {
            details += `<div><strong>Set:</strong> ${cardData.set_name || cardData.set}</div>`;
        }
        
        if (cardData.rarity) {
            details += `<div><strong>Rarity:</strong> ${cardData.rarity}</div>`;
        }
        
        if (cardData.oracle_text || cardData.text) {
            details += `<div><strong>Text:</strong> ${cardData.oracle_text || cardData.text}</div>`;
        }

        if (cardData.prices && cardData.prices.usd) {
            details += `<div><strong>Price:</strong> $${cardData.prices.usd}</div>`;
        }

        return details;
    }

    // Image Interaction Methods
    handleZoom(delta) {
        this.scale += delta;
        this.scale = Math.min(Math.max(1, this.scale), 3);
        this.updateImageScale();
    }

    toggleZoom() {
        if (this.isZoomed) {
            this.scale = 1;
            this.isZoomed = false;
        } else {
            this.scale = 2;
            this.isZoomed = true;
        }
        this.updateImageScale();
    }

    updateImageScale() {
        const cardImage = document.getElementById('cardImage');
        if (cardImage) {
            cardImage.style.transform = `scale(${this.scale})`;
            cardImage.classList.toggle('zoomed', this.scale > 1);
        }
    }

    getTouchDistance(touches) {
        const dx = touches[0].clientX - touches[1].clientX;
        const dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    startLongPress() {
        this.clearLongPress();
        this.pressTimer = setTimeout(() => {
            this.showQuickActions();
            this.pressTimer = null;
        }, 600);
    }

    clearLongPress() {
        if (this.pressTimer) {
            clearTimeout(this.pressTimer);
            this.pressTimer = null;
        }
    }

    showQuickActions() {
        if (this.cardModal && this.cardModal.classList.contains('active')) {
            this.cardModal.classList.add('show-actions');
            
            // Haptic feedback if available
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        }
    }

    // Quick Action Methods
    addToDeck() {
        if (!this.currentCardData) return;

        if (this.app && this.app.deckBuilder) {
            this.app.deckBuilder.addCardToDeck(this.currentCardData, 1);
            this.showNotification('Card added to deck!', 'success');
        }
        
        this.closeCardModal();
    }

    addToCollection() {
        if (!this.currentCardData) return;

        // This would integrate with the existing collection management
        if (this.app && this.app.addCardToCollection) {
            this.app.addCardToCollection(this.currentCardData);
            this.showNotification('Card added to collection!', 'success');
        }
        
        this.closeCardModal();
    }

    toggleFavorite() {
        if (!this.currentCardData) return;

        // This would integrate with a favorites system
        const favoriteBtn = document.getElementById('favoriteBtn');
        const isFavorited = favoriteBtn.classList.contains('favorited');
        
        if (isFavorited) {
            favoriteBtn.classList.remove('favorited');
            favoriteBtn.innerHTML = '<i class="fas fa-heart"></i> Favorite';
            this.showNotification('Removed from favorites', 'info');
        } else {
            favoriteBtn.classList.add('favorited');
            favoriteBtn.innerHTML = '<i class="fas fa-heart" style="color: #ff3c3c;"></i> Favorited';
            this.showNotification('Added to favorites!', 'success');
        }
    }

    // Utility Methods
    extractCardData(cardElement) {
        // Extract card data from DOM element
        // This is a simplified version - you'd adapt this to your card structure
        const cardData = {
            name: cardElement.querySelector('.card-name')?.textContent || 
                  cardElement.getAttribute('data-card-name') || 'Unknown Card',
            imageUrl: cardElement.querySelector('img')?.src || 
                     cardElement.getAttribute('data-image-url'),
            type: cardElement.getAttribute('data-card-type') || '',
            set: cardElement.getAttribute('data-card-set') || '',
            manaCost: cardElement.getAttribute('data-mana-cost') || '',
            rarity: cardElement.getAttribute('data-rarity') || ''
        };

        return cardData;
    }

    isTabsVisible() {
        const deckSection = document.getElementById('deck-section');
        return deckSection && deckSection.classList.contains('active');
    }

    announceTabChange() {
        const activeTab = this.tabs[this.currentTab];
        const tabName = activeTab.textContent;
        
        // Create announcement for screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = `Selected ${tabName} deck type`;
        
        document.body.appendChild(announcement);
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    showNotification(message, type = 'info') {
        if (this.app && this.app.showNotification) {
            this.app.showNotification(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Export for global access
window.SwipeableUI = SwipeableUI;
