// Enhanced Mobile UI JavaScript - Touch Interactions and Mobile-First Features
// Supports bottom navigation, swipe gestures, pull-to-refresh, and mobile optimizations

class MobileUIEnhanced {
    constructor(app) {
        this.app = app;
        this.isMobile = window.innerWidth <= 768;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.touchEndX = 0;
        this.touchEndY = 0;
        this.isScrolling = false;
        this.pullToRefreshThreshold = 80;
        this.swipeThreshold = 50;
        this.currentTab = 'collection';
        
        // Pull-to-refresh preference (can be disabled by user)
        this.pullToRefreshEnabled = localStorage.getItem('pullToRefreshEnabled') !== 'false';
        
        this.init();
    }

    init() {
        if (this.isMobile) {
            this.createMobileUI();
            this.setupEventListeners();
            this.setupSwipeGestures();
            this.setupPullToRefresh();
            this.initializeBottomNavigation();
            this.setupMobileToasts();
        }

        // Listen for orientation changes
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleOrientationChange();
            }, 100);
        });

        // Listen for resize events
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    createMobileUI() {
        // Create mobile header
        this.createMobileHeader();
        
        // Create bottom navigation
        this.createBottomNavigation();
        
        // Create floating action button
        this.createFloatingActionButton();
        
        // Create pull-to-refresh indicator
        this.createPullToRefreshIndicator();
        
        // Apply mobile styles
        this.applyMobileStyles();
    }

    createMobileHeader() {
        // Check if mobile header already exists (from new HTML structure)
        const existingHeader = document.querySelector('.mobile-header');
        if (existingHeader) {
            return; // Use the existing header from the new HTML structure
        }

        const header = document.createElement('div');
        header.className = 'mobile-header';
        header.innerHTML = `
            <div class="mobile-header-title">
                <i class="fas fa-magic"></i>
                <span id="mobile-header-text">My Collection</span>
            </div>
            <div class="mobile-header-actions">
                <button class="mobile-header-btn" id="mobile-search-btn" title="Search">
                    <i class="fas fa-search"></i>
                </button>
                <button class="mobile-header-btn" id="mobile-menu-btn" title="Menu">
                    <i class="fas fa-user"></i>
                </button>
            </div>
        `;
        
        document.body.insertBefore(header, document.body.firstChild);
    }

    createBottomNavigation() {
        const bottomNav = document.createElement('div');
        bottomNav.className = 'mobile-bottom-nav';
        bottomNav.innerHTML = `
            <div class="mobile-nav-item active" data-tab="collection">
                <i class="mobile-nav-icon fas fa-cards-blank"></i>
                <span class="mobile-nav-label">Collection</span>
            </div>
            <div class="mobile-nav-item" data-tab="search">
                <i class="mobile-nav-icon fas fa-search"></i>
                <span class="mobile-nav-label">Search</span>
            </div>
            <div class="mobile-nav-item" data-tab="prices">
                <i class="mobile-nav-icon fas fa-dollar-sign"></i>
                <span class="mobile-nav-label">Prices</span>
            </div>
            <div class="mobile-nav-item" data-tab="wishlist">
                <i class="mobile-nav-icon fas fa-heart"></i>
                <span class="mobile-nav-label">Wishlist</span>
            </div>
            <div class="mobile-nav-item" data-tab="more">
                <i class="mobile-nav-icon fas fa-ellipsis-h"></i>
                <span class="mobile-nav-label">More</span>
            </div>
        `;
        
        document.body.appendChild(bottomNav);
    }

    createFloatingActionButton() {
        const fab = document.createElement('button');
        fab.className = 'mobile-fab';
        fab.id = 'mobile-fab';
        fab.innerHTML = '<i class="fas fa-plus"></i>';
        fab.title = 'Add Card';
        
        document.body.appendChild(fab);
    }

    createPullToRefreshIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'mobile-pull-refresh';
        indicator.id = 'mobile-pull-refresh';
        indicator.innerHTML = '<i class="fas fa-sync-alt"></i>';
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.position = 'relative';
            mainContent.appendChild(indicator);
        }
    }

    applyMobileStyles() {
        // Add mobile UI enhanced stylesheet if not already present
        if (!document.querySelector('link[href="mobile-ui-enhanced.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'mobile-ui-enhanced.css';
            document.head.appendChild(link);
        }
    }

    setupEventListeners() {
        // Mobile menu toggle for sidebar
        const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        if (mobileMenuToggle) {
            mobileMenuToggle.addEventListener('click', () => {
                this.toggleMobileSidebar();
            });
        }

        // Sidebar overlay to close menu
        const sidebarOverlay = document.getElementById('sidebar-overlay');
        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
                this.closeMobileSidebar();
            });
        }

        // Sidebar navigation items
        document.querySelectorAll('.sidebar-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = e.currentTarget.dataset.tab;
                if (tabName) {
                    this.handleSidebarNavigation(tabName);
                }
            });
        });

        // Bottom navigation (if still present)
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                this.handleTabSwitch(e.currentTarget.dataset.tab);
            });
        });

        // Floating Action Button
        const fab = document.getElementById('mobile-fab');
        if (fab) {
            fab.addEventListener('click', () => {
                this.handleFabClick();
            });
        }

        // Header buttons
        const searchBtn = document.getElementById('mobile-search-btn');
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.handleHeaderSearch();
            });
        }

        const menuBtn = document.getElementById('mobile-menu-btn');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                this.handleHeaderMenu();
            });
        }

        // Touch events for better mobile interaction
        document.addEventListener('touchstart', (e) => {
            this.handleTouchStart(e);
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            this.handleTouchMove(e);
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            this.handleTouchEnd(e);
        }, { passive: true });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            const sidebar = document.querySelector('.sidebar');
            const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
            
            if (window.innerWidth <= 768 && 
                sidebar && 
                sidebar.classList.contains('mobile-open') &&
                !sidebar.contains(e.target) && 
                !mobileMenuToggle.contains(e.target)) {
                this.closeMobileSidebar();
            }
        });
    }

    setupSwipeGestures() {
        const cardItems = document.querySelectorAll('.card-item');
        cardItems.forEach(card => {
            this.addSwipeGestures(card);
        });
    }

    addSwipeGestures(element) {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        element.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        }, { passive: true });

        element.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            currentX = e.touches[0].clientX;
            const diffX = currentX - startX;
            
            if (Math.abs(diffX) > 10) {
                e.preventDefault();
                
                if (diffX < -this.swipeThreshold) {
                    element.classList.add('swiping-left');
                    element.classList.remove('swiping-right');
                } else if (diffX > this.swipeThreshold) {
                    element.classList.add('swiping-right');
                    element.classList.remove('swiping-left');
                } else {
                    element.classList.remove('swiping-left', 'swiping-right');
                }
            }
        }, { passive: false });

        element.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;
            
            const diffX = currentX - startX;
            
            if (Math.abs(diffX) > this.swipeThreshold * 2) {
                if (diffX < 0) {
                    this.handleSwipeLeft(element);
                } else {
                    this.handleSwipeRight(element);
                }
            }
            
            // Reset swipe state
            setTimeout(() => {
                element.classList.remove('swiping-left', 'swiping-right');
            }, 300);
        }, { passive: true });

        // Add swipe action elements
        const leftAction = document.createElement('div');
        leftAction.className = 'card-swipe-actions left';
        leftAction.innerHTML = '<i class="fas fa-trash"></i>';
        
        const rightAction = document.createElement('div');
        rightAction.className = 'card-swipe-actions right';
        rightAction.innerHTML = '<i class="fas fa-edit"></i>';
        
        element.style.position = 'relative';
        element.appendChild(leftAction);
        element.appendChild(rightAction);
    }

    setupPullToRefresh() {
        const mainContent = document.querySelector('.main-content');
        const indicator = document.getElementById('mobile-pull-refresh');
        
        if (!mainContent || !indicator || !this.pullToRefreshEnabled) return;

        let startY = 0;
        let currentY = 0;
        let startX = 0;
        let currentX = 0;
        let isPulling = false;
        let isRefreshing = false;
        let touchStartTime = 0;
        let hasMovedHorizontally = false;
        
        // Minimum distance before we start intercepting (prevents accidental triggers)
        const minPullDistance = 30;
        // Maximum horizontal movement allowed for pull-to-refresh
        const maxHorizontalMovement = 50;

        mainContent.addEventListener('touchstart', (e) => {
            // Only start tracking if we're at the very top of the page
            if (mainContent.scrollTop === 0) {
                startY = e.touches[0].clientY;
                startX = e.touches[0].clientX;
                touchStartTime = Date.now();
                isPulling = false; // Don't set to true immediately
                hasMovedHorizontally = false;
            }
        }, { passive: true });

        mainContent.addEventListener('touchmove', (e) => {
            // Don't interfere if we're already refreshing
            if (isRefreshing) return;
            
            // Only proceed if we started at the top
            if (mainContent.scrollTop > 0 || startY === 0) return;
            
            currentY = e.touches[0].clientY;
            currentX = e.touches[0].clientX;
            const pullDistance = currentY - startY;
            const horizontalDistance = Math.abs(currentX - startX);
            
            // Check if this is a horizontal swipe (should not trigger pull-to-refresh)
            if (horizontalDistance > maxHorizontalMovement) {
                hasMovedHorizontally = true;
                return;
            }
            
            // Only start pull-to-refresh logic if:
            // 1. We're pulling down (positive distance)
            // 2. We've moved at least the minimum distance
            // 3. We haven't moved too much horizontally
            // 4. We're still at the top of the page
            if (pullDistance > minPullDistance && 
                !hasMovedHorizontally && 
                mainContent.scrollTop === 0) {
                
                // Now we can start intercepting
                if (!isPulling) {
                    isPulling = true;
                }
                
                e.preventDefault();
                
                // Adjust pullDistance to account for the minimum threshold
                const adjustedPullDistance = pullDistance - minPullDistance;
                const progress = Math.min(adjustedPullDistance / this.pullToRefreshThreshold, 1);
                
                indicator.style.transform = `translateX(-50%) translateY(${adjustedPullDistance * 0.5}px) rotate(${progress * 360}deg)`;
                indicator.style.opacity = progress;
                
                if (adjustedPullDistance > this.pullToRefreshThreshold) {
                    indicator.classList.add('visible');
                } else {
                    indicator.classList.remove('visible');
                }
            }
        }, { passive: false });

        mainContent.addEventListener('touchend', (e) => {
            if (!isPulling || isRefreshing || hasMovedHorizontally) {
                // Reset state
                isPulling = false;
                hasMovedHorizontally = false;
                startY = 0;
                return;
            }
            
            const pullDistance = currentY - startY;
            const touchDuration = Date.now() - touchStartTime;
            
            // Only trigger refresh if we've pulled far enough and it wasn't too quick
            // (prevents accidental triggers from fast scrolling)
            if (pullDistance > (this.pullToRefreshThreshold + minPullDistance) && touchDuration > 200) {
                this.triggerRefresh();
            } else {
                this.resetPullToRefresh();
            }
            
            // Reset state
            isPulling = false;
            hasMovedHorizontally = false;
            startY = 0;
        }, { passive: true });
    }

    triggerRefresh() {
        const indicator = document.getElementById('mobile-pull-refresh');
        if (!indicator) return;

        indicator.classList.add('loading');
        indicator.style.transform = 'translateX(-50%) translateY(20px)';
        indicator.style.opacity = '1';

        // Simulate refresh action
        setTimeout(() => {
            this.performRefresh();
        }, 500);
    }

    async performRefresh() {
        try {
            // Refresh current tab data
            switch (this.currentTab) {
                case 'collection':
                    if (this.app.updateCollectionStats) {
                        this.app.updateCollectionStats();
                    }
                    if (this.app.renderCollection) {
                        this.app.renderCollection();
                    }
                    break;
                case 'prices':
                    if (this.app.priceTracker && this.app.priceTracker.updateAllPrices) {
                        await this.app.priceTracker.updateAllPrices();
                    }
                    break;
                case 'search':
                    // Clear search results
                    const searchResults = document.getElementById('search-results');
                    if (searchResults) {
                        searchResults.innerHTML = '';
                    }
                    break;
            }

            this.showMobileToast('Refreshed successfully!', 'success');
        } catch (error) {
            console.error('Refresh error:', error);
            this.showMobileToast('Refresh failed', 'error');
        } finally {
            this.resetPullToRefresh();
        }
    }

    resetPullToRefresh() {
        const indicator = document.getElementById('mobile-pull-refresh');
        if (!indicator) return;

        indicator.classList.remove('visible', 'loading');
        indicator.style.transform = 'translateX(-50%)';
        indicator.style.opacity = '0';
    }

    initializeBottomNavigation() {
        // Set initial active tab
        this.updateActiveTab(this.currentTab);
        this.updateHeaderTitle(this.currentTab);
    }

    handleTabSwitch(tabName) {
        if (tabName === 'more') {
            this.showMoreMenu();
            return;
        }

        this.currentTab = tabName;
        this.updateActiveTab(tabName);
        this.updateHeaderTitle(tabName);
        this.updateFabAction(tabName);
        
        // Switch to the actual tab
        if (this.app.switchTab) {
            this.app.switchTab(tabName);
        }

        // Add haptic feedback if available
        this.triggerHapticFeedback();
    }

    updateActiveTab(tabName) {
        document.querySelectorAll('.mobile-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.add('active');
        }
    }

    updateHeaderTitle(tabName) {
        const headerText = document.getElementById('mobile-header-text');
        if (!headerText) return;

        const titles = {
            collection: 'My Collection',
            search: 'Card Search',
            prices: 'Price Tracking',
            wishlist: 'My Wishlist',
            rules: 'MTG Rules',
            dictionary: 'MTG Dictionary'
        };

        headerText.textContent = titles[tabName] || 'MTG Tracker';
    }

    updateFabAction(tabName) {
        const fab = document.getElementById('mobile-fab');
        if (!fab) return;

        const fabActions = {
            collection: { icon: 'fas fa-plus', action: 'add-card' },
            search: { icon: 'fas fa-filter', action: 'advanced-search' },
            prices: { icon: 'fas fa-bell', action: 'create-alert' },
            wishlist: { icon: 'fas fa-heart', action: 'add-wishlist' }
        };

        const action = fabActions[tabName];
        if (action) {
            fab.innerHTML = `<i class="${action.icon}"></i>`;
            fab.dataset.action = action.action;
            fab.style.display = 'flex';
        } else {
            fab.style.display = 'none';
        }
    }

    handleFabClick() {
        const fab = document.getElementById('mobile-fab');
        const action = fab?.dataset.action;

        switch (action) {
            case 'add-card':
                if (this.app.openAddCardModal) {
                    this.app.openAddCardModal();
                }
                break;
            case 'advanced-search':
                this.showAdvancedSearchModal();
                break;
            case 'create-alert':
                this.showCreateAlertModal();
                break;
            case 'add-wishlist':
                this.showAddWishlistModal();
                break;
        }

        this.triggerHapticFeedback();
    }

    handleHeaderSearch() {
        // Focus on search input if visible
        const searchInput = document.getElementById('card-search') || 
                           document.getElementById('collection-search');
        
        if (searchInput) {
            searchInput.focus();
            searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            // Switch to search tab
            this.handleTabSwitch('search');
        }
    }

    handleHeaderMenu() {
        // Toggle mobile sidebar instead of showing user menu
        if (this.isMobile) {
            this.toggleMobileSidebar();
        } else {
            // Show user menu or auth options on desktop
            if (this.app.isAuthenticated) {
                const userMenu = document.getElementById('user-menu');
                if (userMenu) {
                    userMenu.style.display = 'block';
                    setTimeout(() => {
                        userMenu.style.display = 'none';
                    }, 1500);
                }
            } else {
                if (this.app.openLoginModal) {
                    this.app.openLoginModal();
                }
            }
        }
    }

    // New methods for sidebar functionality
    toggleMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        
        if (!sidebar) return;

        const isOpen = sidebar.classList.contains('mobile-open');
        
        if (isOpen) {
            this.closeMobileSidebar();
        } else {
            this.openMobileSidebar();
        }
        
        this.triggerHapticFeedback();
    }

    openMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        
        if (sidebar) {
            sidebar.classList.add('mobile-open');
            document.body.classList.add('sidebar-open');
        }
        
        if (overlay) {
            overlay.classList.add('active');
        }
    }

    closeMobileSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        
        if (sidebar) {
            sidebar.classList.remove('mobile-open');
            document.body.classList.remove('sidebar-open');
        }
        
        if (overlay) {
            overlay.classList.remove('active');
        }
    }

    handleSidebarNavigation(tabName) {
        // Close mobile sidebar after navigation
        if (this.isMobile) {
            this.closeMobileSidebar();
        }

        // Update active sidebar item
        document.querySelectorAll('.sidebar-nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }

        // Update current tab
        this.currentTab = tabName;
        this.updateHeaderTitle(tabName);
        this.updateFabAction(tabName);
        
        // Switch to the actual tab
        if (this.app.switchTab) {
            this.app.switchTab(tabName);
        }

        this.triggerHapticFeedback();
    }

    showMoreMenu() {
        const moreMenu = document.createElement('div');
        moreMenu.className = 'mobile-more-menu';
        moreMenu.innerHTML = `
            <div class="mobile-more-overlay"></div>
            <div class="mobile-more-content">
                <div class="mobile-more-header">
                    <h3>More Options</h3>
                    <button class="mobile-more-close">&times;</button>
                </div>
                <div class="mobile-more-items">
                    <div class="mobile-more-item" data-tab="rules">
                        <i class="fas fa-book"></i>
                        <span>MTG Rules</span>
                    </div>
                    <div class="mobile-more-item" data-tab="dictionary">
                        <i class="fas fa-spell-check"></i>
                        <span>Dictionary</span>
                    </div>
                    <div class="mobile-more-item" data-action="import">
                        <i class="fas fa-upload"></i>
                        <span>Import Collection</span>
                    </div>
                    <div class="mobile-more-item" data-action="export">
                        <i class="fas fa-download"></i>
                        <span>Export Collection</span>
                    </div>
                    <div class="mobile-more-item" data-action="settings">
                        <i class="fas fa-cog"></i>
                        <span>Settings</span>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(moreMenu);

        // Add event listeners
        moreMenu.querySelector('.mobile-more-close').addEventListener('click', () => {
            moreMenu.remove();
        });

        moreMenu.querySelector('.mobile-more-overlay').addEventListener('click', () => {
            moreMenu.remove();
        });

        moreMenu.querySelectorAll('.mobile-more-item').forEach(item => {
            item.addEventListener('click', () => {
                const tab = item.dataset.tab;
                const action = item.dataset.action;

                if (tab) {
                    this.handleTabSwitch(tab);
                } else if (action) {
                    this.handleMoreAction(action);
                }

                moreMenu.remove();
            });
        });

        // Animate in
        setTimeout(() => {
            moreMenu.classList.add('show');
        }, 10);
    }

    handleMoreAction(action) {
        switch (action) {
            case 'import':
                if (this.app.importExport && this.app.importExport.showImportModal) {
                    this.app.importExport.showImportModal();
                }
                break;
            case 'export':
                if (this.app.importExport && this.app.importExport.showExportModal) {
                    this.app.importExport.showExportModal();
                }
                break;
            case 'settings':
                this.showMobileSettings();
                break;
        }
    }

    handleSwipeLeft(element) {
        // Delete action
        const cardId = element.dataset.cardId;
        if (cardId && this.app.removeCard) {
            if (confirm('Delete this card?')) {
                this.app.removeCard(parseInt(cardId));
                this.showMobileToast('Card deleted', 'success');
            }
        }
    }

    handleSwipeRight(element) {
        // Edit action
        const cardId = element.dataset.cardId;
        if (cardId && this.app.editCard) {
            this.app.editCard(parseInt(cardId));
        }
    }

    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
    }

    handleTouchMove(e) {
        // Prevent default scrolling behavior for certain elements
        const target = e.target.closest('.mobile-nav-item, .mobile-fab, .mobile-header-btn');
        if (target) {
            e.preventDefault();
        }
    }

    handleTouchEnd(e) {
        this.touchEndX = e.changedTouches[0].clientX;
        this.touchEndY = e.changedTouches[0].clientY;
        
        // Handle global swipe gestures
        this.handleGlobalSwipe();
    }

    handleGlobalSwipe() {
        const deltaX = this.touchEndX - this.touchStartX;
        const deltaY = this.touchEndY - this.touchStartY;
        
        // Only handle horizontal swipes that are significant
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 100) {
            if (deltaX > 0) {
                // Swipe right - go to previous tab
                this.switchToPreviousTab();
            } else {
                // Swipe left - go to next tab
                this.switchToNextTab();
            }
        }
    }

    switchToPreviousTab() {
        const tabs = ['collection', 'search', 'prices', 'wishlist'];
        const currentIndex = tabs.indexOf(this.currentTab);
        const previousIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        this.handleTabSwitch(tabs[previousIndex]);
    }

    switchToNextTab() {
        const tabs = ['collection', 'search', 'prices', 'wishlist'];
        const currentIndex = tabs.indexOf(this.currentTab);
        const nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        this.handleTabSwitch(tabs[nextIndex]);
    }

    setupMobileToasts() {
        // Override the app's showNotification method for mobile
        if (this.app && this.isMobile) {
            const originalShowNotification = this.app.showNotification;
            this.app.showNotification = (message, type = 'info') => {
                this.showMobileToast(message, type);
            };
        }
    }

    showMobileToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `mobile-toast ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };

        toast.innerHTML = `
            <i class="mobile-toast-icon ${icons[type] || icons.info}"></i>
            <span class="mobile-toast-message">${message}</span>
        `;

        document.body.appendChild(toast);

        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Hide and remove toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 400);
        }, 3000);
    }

    triggerHapticFeedback() {
        // Trigger haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    }

    handleOrientationChange() {
        // Adjust UI for orientation change
        setTimeout(() => {
            this.updateLayoutForOrientation();
        }, 500);
    }

    updateLayoutForOrientation() {
        const isLandscape = window.innerHeight < window.innerWidth;
        document.body.classList.toggle('landscape', isLandscape);
        
        // Adjust FAB position in landscape
        const fab = document.getElementById('mobile-fab');
        if (fab && isLandscape) {
            fab.style.bottom = 'calc(60px + 12px)';
        } else if (fab) {
            fab.style.bottom = 'calc(var(--mobile-nav-height) + 16px)';
        }
    }

    handleResize() {
        const wasMobile = this.isMobile;
        this.isMobile = window.innerWidth <= 768;
        
        if (wasMobile !== this.isMobile) {
            if (this.isMobile) {
                this.createMobileUI();
            } else {
                this.removeMobileUI();
            }
        }
    }

    removeMobileUI() {
        // Remove mobile UI elements when switching to desktop
        const mobileElements = [
            '.mobile-header',
            '.mobile-bottom-nav',
            '.mobile-fab',
            '.mobile-pull-refresh'
        ];

        mobileElements.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.remove();
            }
        });
    }

    // Public methods for integration
    updateCardSwipeGestures() {
        // Re-apply swipe gestures to new card elements
        const cardItems = document.querySelectorAll('.card-item:not([data-swipe-enabled])');
        cardItems.forEach(card => {
            card.dataset.swipeEnabled = 'true';
            this.addSwipeGestures(card);
        });
    }

    showLoadingSkeleton(container, count = 3) {
        if (!container) return;

        const skeletons = Array.from({ length: count }, () => 
            '<div class="mobile-skeleton mobile-skeleton-card"></div>'
        ).join('');

        container.innerHTML = skeletons;
    }

    hideLoadingSkeleton(container) {
        if (!container) return;
        
        const skeletons = container.querySelectorAll('.mobile-skeleton');
        skeletons.forEach(skeleton => skeleton.remove());
    }

    // Mobile Settings Modal
    showMobileSettings() {
        const settingsModal = document.createElement('div');
        settingsModal.className = 'mobile-more-menu mobile-settings-modal';
        settingsModal.innerHTML = `
            <div class="mobile-more-overlay"></div>
            <div class="mobile-more-content">
                <div class="mobile-more-header">
                    <h3>Mobile Settings</h3>
                    <button class="mobile-more-close">&times;</button>
                </div>
                <div class="mobile-settings-items">
                    <div class="mobile-setting-item">
                        <div class="mobile-setting-info">
                            <h4>Pull to Refresh</h4>
                            <p>Enable pull-down gesture to refresh content</p>
                        </div>
                        <label class="mobile-toggle">
                            <input type="checkbox" id="pull-refresh-toggle" ${this.pullToRefreshEnabled ? 'checked' : ''}>
                            <span class="mobile-toggle-slider"></span>
                        </label>
                    </div>
                    <div class="mobile-setting-item">
                        <div class="mobile-setting-info">
                            <h4>Haptic Feedback</h4>
                            <p>Vibrate on button presses and interactions</p>
                        </div>
                        <label class="mobile-toggle">
                            <input type="checkbox" id="haptic-toggle" ${navigator.vibrate ? 'checked' : ''}>
                            <span class="mobile-toggle-slider"></span>
                        </label>
                    </div>
                    <div class="mobile-setting-item">
                        <div class="mobile-setting-info">
                            <h4>About</h4>
                            <p>MTG Collection Tracker v1.0 - Mobile Enhanced</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(settingsModal);

        // Add event listeners
        settingsModal.querySelector('.mobile-more-close').addEventListener('click', () => {
            settingsModal.remove();
        });

        settingsModal.querySelector('.mobile-more-overlay').addEventListener('click', () => {
            settingsModal.remove();
        });

        // Pull to refresh toggle
        const pullRefreshToggle = settingsModal.querySelector('#pull-refresh-toggle');
        pullRefreshToggle.addEventListener('change', (e) => {
            this.pullToRefreshEnabled = e.target.checked;
            localStorage.setItem('pullToRefreshEnabled', this.pullToRefreshEnabled.toString());
            
            // Re-setup pull to refresh with new setting
            this.setupPullToRefresh();
            
            this.showMobileToast(
                this.pullToRefreshEnabled ? 'Pull to refresh enabled' : 'Pull to refresh disabled',
                'success'
            );
        });

        // Haptic feedback toggle
        const hapticToggle = settingsModal.querySelector('#haptic-toggle');
        if (!navigator.vibrate) {
            hapticToggle.disabled = true;
            hapticToggle.parentElement.style.opacity = '0.5';
        }

        // Animate in
        setTimeout(() => {
            settingsModal.classList.add('show');
        }, 10);
    }

    // Method to toggle pull-to-refresh programmatically
    togglePullToRefresh(enabled) {
        this.pullToRefreshEnabled = enabled;
        localStorage.setItem('pullToRefreshEnabled', enabled.toString());
        this.setupPullToRefresh();
    }
}

// Enhanced mobile styles for the more menu and additional components
const mobileUIStyles = document.createElement('style');
mobileUIStyles.textContent = `
    .mobile-more-menu {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        z-index: 3000;
        opacity: 0;
        transition: opacity 0.3s ease;
    }

    .mobile-more-menu.show {
        opacity: 1;
    }

    .mobile-more-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
    }

    .mobile-more-content {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: var(--mobile-surface, white);
        border-radius: 20px 20px 0 0;
        padding: 1.5rem;
        transform: translateY(100%);
        transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    }

    .mobile-more-menu.show .mobile-more-content {
        transform: translateY(0);
    }

    .mobile-more-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid rgba(102, 187, 106, 0.2);
    }

    .mobile-more-header h3 {
        margin: 0;
        color: var(--mobile-text, #2C3E50);
        font-size: 1.3rem;
        font-weight: 700;
    }

    .mobile-more-close {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: rgba(102, 187, 106, 0.1);
        border: none;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
        color: var(--mobile-text, #2C3E50);
        cursor: pointer;
    }

    .mobile-more-items {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }

    .mobile-more-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        padding: 1.5rem 1rem;
        background: rgba(102, 187, 106, 0.05);
        border-radius: 16px;
        cursor: pointer;
        transition: all 0.3s ease;
        border: 2px solid transparent;
    }

    .mobile-more-item:active {
        transform: scale(0.95);
        background: rgba(102, 187, 106, 0.15);
        border-color: rgba(102, 187, 106, 0.3);
    }

    .mobile-more-item i {
        font-size: 1.5rem;
        color: var(--mobile-primary, #66BB6A);
    }

    .mobile-more-item span {
        font-size: 0.9rem;
        font-weight: 600;
        color: var(--mobile-text, #2C3E50);
        text-align: center;
    }

    .landscape {
        --mobile-nav-height: 60px;
        --mobile-header-height: 50px;
    }

    @media (max-width: 480px) {
        .mobile-more-items {
            grid-template-columns: 1fr;
        }
        
        .mobile-more-item {
            flex-direction: row;
            justify-content: flex-start;
            text-align: left;
            padding: 1rem 1.5rem;
        }
        
        .mobile-more-item i {
            font-size: 1.3rem;
        }
    }

    /* Mobile Settings Modal Styles */
    .mobile-settings-items {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .mobile-setting-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
        background: rgba(102, 187, 106, 0.05);
        border-radius: 12px;
        border: 1px solid rgba(102, 187, 106, 0.1);
    }

    .mobile-setting-info {
        flex: 1;
    }

    .mobile-setting-info h4 {
        margin: 0 0 0.25rem 0;
        font-size: 1rem;
        font-weight: 600;
        color: var(--mobile-text, #2C3E50);
    }

    .mobile-setting-info p {
        margin: 0;
        font-size: 0.85rem;
        color: var(--mobile-text-secondary, #7F8C8D);
        line-height: 1.3;
    }

    /* Toggle Switch Styles */
    .mobile-toggle {
        position: relative;
        display: inline-block;
        width: 50px;
        height: 28px;
        margin-left: 1rem;
    }

    .mobile-toggle input {
        opacity: 0;
        width: 0;
        height: 0;
    }

    .mobile-toggle-slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        transition: 0.3s;
        border-radius: 28px;
    }

    .mobile-toggle-slider:before {
        position: absolute;
        content: "";
        height: 22px;
        width: 22px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        transition: 0.3s;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .mobile-toggle input:checked + .mobile-toggle-slider {
        background-color: var(--mobile-primary, #66BB6A);
    }

    .mobile-toggle input:checked + .mobile-toggle-slider:before {
        transform: translateX(22px);
    }

    .mobile-toggle input:disabled + .mobile-toggle-slider {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

document.head.appendChild(mobileUIStyles);

// Export for global access
window.MobileUIEnhanced = MobileUIEnhanced;
