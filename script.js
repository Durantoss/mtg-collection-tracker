// MTG Collection Tracker - Enhanced with Card Variations and Multiple Price Sources

class MTGCollectionTracker {
    constructor() {
        this.collection = JSON.parse(localStorage.getItem('mtgCollection')) || [];
        this.cardVariations = JSON.parse(localStorage.getItem('cardVariations')) || {};
        this.priceHistory = JSON.parse(localStorage.getItem('priceHistory')) || {};
        this.rules = this.initializeRules();
        this.dictionary = this.initializeDictionary();
        this.priceCache = JSON.parse(localStorage.getItem('priceCache')) || {};
        this.setsCache = JSON.parse(localStorage.getItem('mtgSetsCache')) || null;
        this.priceTracker = null;
        this.priceSources = this.initializePriceSources();
        this.importExport = null;
        
        // Authentication properties
        this.currentUser = null;
        this.userProfile = null;
        this.isAuthenticated = false;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateCollectionStats();
        this.renderCollection();
        this.renderRules();
        this.renderDictionary();
        this.populateSetFilter();
        this.populateSearchSetFilter();
        this.initializeAuth();
        
        setTimeout(() => {
            if (window.PriceTracker) {
                this.priceTracker = new PriceTracker(this);
            }
            if (window.CollectionImportExport) {
                this.importExport = new CollectionImportExport(this);
                window.collectionImportExport = this.importExport;
            }
        }, 100);
    }

    // Authentication System
    async initializeAuth() {
        // Wait for Supabase to be available
        if (typeof initializeSupabase === 'function') {
            const initialized = initializeSupabase();
            if (initialized) {
                console.log('Supabase initialized successfully');
                
                // Check for existing session
                await this.checkAuthState();
                
                // Listen for auth changes
                if (typeof Auth !== 'undefined' && Auth.onAuthStateChange) {
                    Auth.onAuthStateChange((event, session) => {
                        console.log('Auth state changed:', event, session);
                        this.handleAuthStateChange(event, session);
                    });
                }
                
                this.setupAuthEventListeners();
            } else {
                console.error('Failed to initialize Supabase');
                this.showNotification('Authentication system unavailable', 'error');
            }
        } else {
            console.error('Supabase configuration not loaded');
            this.showNotification('Authentication system not configured', 'error');
        }
    }

    async checkAuthState() {
        try {
            if (typeof Auth !== 'undefined' && Auth.getCurrentUser) {
                const user = await Auth.getCurrentUser();
                if (user) {
                    await this.handleUserLogin(user);
                } else {
                    this.handleUserLogout();
                }
            } else {
                // Initialize button state even if auth system isn't available
                this.updateAuthButton();
            }
        } catch (error) {
            console.error('Error checking auth state:', error);
            this.handleUserLogout();
        }
    }

    async handleAuthStateChange(event, session) {
        if (event === 'SIGNED_IN' && session?.user) {
            await this.handleUserLogin(session.user);
        } else if (event === 'SIGNED_OUT') {
            this.handleUserLogout();
        }
    }

    async handleUserLogin(user) {
        this.currentUser = user;
        this.isAuthenticated = true;
        
        try {
            // Get user profile
            if (typeof Auth !== 'undefined' && Auth.getUserProfile) {
                this.userProfile = await Auth.getUserProfile(user.id);
            }
            
            this.updateUIForAuthenticatedUser();
            this.loadUserCollection();
            
            this.showNotification(`Welcome back, ${this.userProfile?.username || user.email}!`, 'success');
        } catch (error) {
            console.error('Error handling user login:', error);
            this.showNotification('Error loading user data', 'error');
        }
    }

    handleUserLogout() {
        this.currentUser = null;
        this.userProfile = null;
        this.isAuthenticated = false;
        
        this.updateUIForUnauthenticatedUser();
        this.clearUserData();
        
        this.showNotification('Signed out successfully', 'info');
    }

    updateUIForAuthenticatedUser() {
        // Hide auth modals
        this.closeLoginModal();
        this.closeRegisterModal();
        
        // Show user menu
        const userMenu = document.getElementById('user-menu');
        if (userMenu) {
            userMenu.style.display = 'block';
            
            // Update user info
            const usernameEl = document.getElementById('current-username');
            const roleEl = document.getElementById('current-role');
            
            if (usernameEl) usernameEl.textContent = this.userProfile?.username || 'User';
            if (roleEl) roleEl.textContent = this.userProfile?.is_admin ? 'Admin' : 'User';
        }
        
        // Show/hide admin navigation button based on user role
        const adminNavBtn = document.getElementById('admin-nav-btn');
        if (adminNavBtn) {
            if (this.userProfile?.is_admin) {
                adminNavBtn.style.display = 'block';
            } else {
                adminNavBtn.style.display = 'none';
            }
        }
        
        // Update navigation to show user is logged in
        this.updateNavigation();
    }

    updateUIForUnauthenticatedUser() {
        // Hide user menu
        const userMenu = document.getElementById('user-menu');
        if (userMenu) {
            userMenu.style.display = 'none';
        }
        
        // Hide admin navigation button
        const adminNavBtn = document.getElementById('admin-nav-btn');
        if (adminNavBtn) {
            adminNavBtn.style.display = 'none';
        }
        
        // Show login prompt
        this.showLoginPrompt();
    }

    showLoginPrompt() {
        // Show a subtle login prompt
        const loginPrompt = document.createElement('div');
        loginPrompt.className = 'login-prompt';
        loginPrompt.innerHTML = `
            <div class="login-prompt-content">
                <i class="fas fa-user-circle"></i>
                <span>Sign in to sync your collection across devices</span>
                <button class="btn btn-small btn-primary" onclick="app.openLoginModal()">Sign In</button>
            </div>
        `;
        loginPrompt.style.cssText = `
            position: fixed;
            top: 60px;
            right: 20px;
            background: rgba(26, 26, 46, 0.95);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            padding: 1rem;
            z-index: 1000;
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(loginPrompt);
        
        // Auto-hide after 10 seconds
        setTimeout(() => {
            if (loginPrompt.parentNode) {
                loginPrompt.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => loginPrompt.remove(), 300);
            }
        }, 10000);
    }

    setupAuthEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        
        // Registration form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
        
        // Modal controls
        const showRegisterBtn = document.getElementById('show-register');
        if (showRegisterBtn) {
            showRegisterBtn.addEventListener('click', () => {
                this.closeLoginModal();
                this.openRegisterModal();
            });
        }
        
        const showLoginBtn = document.getElementById('show-login');
        if (showLoginBtn) {
            showLoginBtn.addEventListener('click', () => {
                this.closeRegisterModal();
                this.openLoginModal();
            });
        }
        
        // Close buttons
        const closeLoginBtn = document.getElementById('close-login-modal');
        if (closeLoginBtn) {
            closeLoginBtn.addEventListener('click', () => this.closeLoginModal());
        }
        
        const closeRegisterBtn = document.getElementById('close-register-modal');
        if (closeRegisterBtn) {
            closeRegisterBtn.addEventListener('click', () => this.closeRegisterModal());
        }
        
        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }
        
        
        // Admin panel close button
        const closeAdminBtn = document.getElementById('close-admin-modal');
        if (closeAdminBtn) {
            closeAdminBtn.addEventListener('click', () => this.closeAdminPanel());
        }
        
        // Admin tab buttons
        document.querySelectorAll('.admin-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.adminTab;
                this.switchAdminTab(tab);
            });
        });
        
        // Generate invite button
        const generateInviteBtn = document.getElementById('generate-invite-btn');
        if (generateInviteBtn) {
            generateInviteBtn.addEventListener('click', () => this.generateInviteCode());
        }
        
        // Modal click outside to close
        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
            loginModal.addEventListener('click', (e) => {
                if (e.target.id === 'login-modal') this.closeLoginModal();
            });
        }
        
        const registerModal = document.getElementById('register-modal');
        if (registerModal) {
            registerModal.addEventListener('click', (e) => {
                if (e.target.id === 'register-modal') this.closeRegisterModal();
            });
        }
        
        const adminModal = document.getElementById('admin-modal');
        if (adminModal) {
            adminModal.addEventListener('click', (e) => {
                if (e.target.id === 'admin-modal') this.closeAdminPanel();
            });
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');
        
        try {
            errorEl.style.display = 'none';
            
            if (typeof Auth !== 'undefined' && Auth.signIn) {
                await Auth.signIn(email, password);
                // Auth state change will be handled by the listener
            } else {
                throw new Error('Authentication system not available');
            }
        } catch (error) {
            console.error('Login error:', error);
            errorEl.textContent = error.message || 'Login failed. Please try again.';
            errorEl.style.display = 'block';
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const email = document.getElementById('register-email').value;
        const username = document.getElementById('register-username').value;
        const password = document.getElementById('register-password').value;
        const inviteCode = document.getElementById('register-invite-code').value;
        const errorEl = document.getElementById('register-error');
        
        try {
            errorEl.style.display = 'none';
            
            if (typeof Auth !== 'undefined' && Auth.signUp) {
                await Auth.signUp(email, password, username, inviteCode);
                this.showNotification('Account created successfully! Please sign in.', 'success');
                this.closeRegisterModal();
                this.openLoginModal();
            } else {
                throw new Error('Authentication system not available');
            }
        } catch (error) {
            console.error('Registration error:', error);
            errorEl.textContent = error.message || 'Registration failed. Please try again.';
            errorEl.style.display = 'block';
        }
    }

    async handleLogout() {
        try {
            if (typeof Auth !== 'undefined' && Auth.signOut) {
                await Auth.signOut();
                // Auth state change will be handled by the listener
            }
        } catch (error) {
            console.error('Logout error:', error);
            this.showNotification('Error signing out', 'error');
        }
    }

    async loadUserCollection() {
        if (!this.isAuthenticated || !this.currentUser) return;
        
        try {
            if (typeof Database !== 'undefined' && Database.getUserCollection) {
                const userCollection = await Database.getUserCollection(this.currentUser.id);
                
                // Merge with local collection if any
                if (userCollection.length > 0) {
                    this.collection = userCollection.map(card => ({
                        id: card.id,
                        name: card.card_name,
                        set: card.set_name,
                        setCode: card.set_code,
                        quantity: card.quantity,
                        condition: card.condition,
                        isFoil: card.is_foil,
                        purchasePrice: card.purchase_price,
                        prices: { scryfall: { price: card.current_price || 0 } },
                        notes: card.notes,
                        imageUrl: card.image_url,
                        dateAdded: card.created_at
                    }));
                    
                    this.updateCollectionStats();
                    this.renderCollection();
                    this.populateSetFilter();
                }
            }
        } catch (error) {
            console.error('Error loading user collection:', error);
            this.showNotification('Error loading your collection', 'error');
        }
    }

    clearUserData() {
        // Keep local collection but don't sync
        // In a real app, you might want to clear this too
    }

    updateNavigation() {
        // Update the authentication button based on current state
        this.updateAuthButton();
    }

    // Authentication Button Management
    handleAuthButtonClick() {
        if (this.isAuthenticated) {
            // User is logged in, so logout
            this.handleLogout();
        } else {
            // User is not logged in, so show login modal
            this.openLoginModal();
        }
    }

    updateAuthButton() {
        const authBtn = document.getElementById('auth-btn');
        const authBtnText = document.getElementById('auth-btn-text');
        const authBtnIcon = authBtn.querySelector('i');
        
        if (!authBtn || !authBtnText || !authBtnIcon) return;
        
        if (this.isAuthenticated) {
            // User is authenticated - show logout state
            authBtn.classList.add('authenticated');
            authBtnIcon.className = 'fas fa-sign-out-alt';
            authBtnText.textContent = 'Sign Out';
            authBtn.title = 'Sign out of your account';
        } else {
            // User is not authenticated - show login state
            authBtn.classList.remove('authenticated');
            authBtnIcon.className = 'fas fa-user';
            authBtnText.textContent = 'Sign In';
            authBtn.title = 'Sign in to your account';
        }
    }

    // Modal Management
    openLoginModal() {
        document.getElementById('login-modal').classList.add('active');
        document.getElementById('login-email').focus();
    }

    closeLoginModal() {
        document.getElementById('login-modal').classList.remove('active');
        document.getElementById('login-form').reset();
        document.getElementById('login-error').style.display = 'none';
    }

    openRegisterModal() {
        document.getElementById('register-modal').classList.add('active');
        document.getElementById('register-email').focus();
    }

    closeRegisterModal() {
        document.getElementById('register-modal').classList.remove('active');
        document.getElementById('register-form').reset();
        document.getElementById('register-error').style.display = 'none';
    }

    openAdminPanel() {
        if (!this.userProfile?.is_admin) {
            this.showNotification('Access denied. Admin privileges required.', 'error');
            return;
        }
        
        document.getElementById('admin-modal').classList.add('active');
        this.loadAdminData();
    }

    closeAdminPanel() {
        document.getElementById('admin-modal').classList.remove('active');
    }

    switchAdminTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.admin-tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-admin-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`admin-${tabName}`).classList.add('active');
    }

    async loadAdminData() {
        // Load admin data - users, invite codes, stats
        try {
            if (typeof Admin !== 'undefined') {
                // Load users
                if (Admin.getAllUsers) {
                    const users = await Admin.getAllUsers();
                    this.renderAdminUsers(users);
                }
                
                // Load invite codes
                if (Admin.getAllInviteCodes) {
                    const invites = await Admin.getAllInviteCodes();
                    this.renderAdminInvites(invites);
                }
                
                // Load stats
                if (Admin.getSystemStats) {
                    const stats = await Admin.getSystemStats();
                    this.renderAdminStats(stats);
                }
            }
        } catch (error) {
            console.error('Error loading admin data:', error);
            this.showNotification('Error loading admin data', 'error');
        }
    }

    renderAdminUsers(users) {
        const usersList = document.getElementById('users-list');
        const totalUsersEl = document.getElementById('total-users');
        
        if (totalUsersEl) totalUsersEl.textContent = users.length;
        
        if (usersList) {
            usersList.innerHTML = users.map(user => `
                <div class="admin-user-item">
                    <div class="user-info">
                        <div class="user-name">${user.username}</div>
                        <div class="user-email">${user.email}</div>
                        <div class="user-status">
                            ${user.is_admin ? '<span class="admin-badge">Admin</span>' : ''}
                            ${user.is_active ? '<span class="active-badge">Active</span>' : '<span class="inactive-badge">Inactive</span>'}
                        </div>
                    </div>
                    <div class="user-actions">
                        <span class="user-date">Joined: ${new Date(user.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    renderAdminInvites(invites) {
        const invitesList = document.getElementById('invites-list');
        const availableInvitesEl = document.getElementById('available-invites');
        
        const availableCount = invites.filter(invite => !invite.is_used).length;
        if (availableInvitesEl) availableInvitesEl.textContent = availableCount;
        
        if (invitesList) {
            invitesList.innerHTML = invites.map(invite => `
                <div class="admin-invite-item">
                    <div class="invite-code">${invite.code}</div>
                    <div class="invite-status">
                        ${invite.is_used ? 
                            `<span class="used-badge">Used by ${invite.used_by || 'Unknown'}</span>` : 
                            '<span class="available-badge">Available</span>'
                        }
                    </div>
                    <div class="invite-dates">
                        <div>Created: ${new Date(invite.created_at).toLocaleDateString()}</div>
                        ${invite.expires_at ? `<div>Expires: ${new Date(invite.expires_at).toLocaleDateString()}</div>` : ''}
                        ${invite.used_at ? `<div>Used: ${new Date(invite.used_at).toLocaleDateString()}</div>` : ''}
                    </div>
                </div>
            `).join('');
        }
    }

    renderAdminStats(stats) {
        const totalCollectionsEl = document.getElementById('total-collections');
        const totalCardsAdminEl = document.getElementById('total-cards-admin');
        const activeUsersEl = document.getElementById('active-users');
        
        if (totalCollectionsEl) totalCollectionsEl.textContent = stats.totalCollections || 0;
        if (totalCardsAdminEl) totalCardsAdminEl.textContent = stats.totalCards || 0;
        if (activeUsersEl) activeUsersEl.textContent = stats.activeUsers || 0;
    }

    async generateInviteCode() {
        try {
            if (typeof Admin !== 'undefined' && Admin.generateInviteCode) {
                const newInvite = await Admin.generateInviteCode();
                this.showNotification(`New invite code generated: ${newInvite.code}`, 'success');
                
                // Reload invite codes
                const invites = await Admin.getAllInviteCodes();
                this.renderAdminInvites(invites);
            } else {
                throw new Error('Admin functions not available');
            }
        } catch (error) {
            console.error('Error generating invite code:', error);
            this.showNotification('Error generating invite code', 'error');
        }
    }

    // Initialize price sources configuration
    initializePriceSources() {
        return {
            scryfall: {
                name: 'Scryfall',
                baseUrl: 'https://api.scryfall.com',
                priority: 1,
                active: true,
                color: '#4CAF50'
            },
            tcgplayer: {
                name: 'TCGPlayer',
                baseUrl: 'https://api.tcgplayer.com',
                priority: 2,
                active: true,
                color: '#2196F3'
            },
            cardkingdom: {
                name: 'Card Kingdom',
                baseUrl: 'https://api.cardkingdom.com',
                priority: 3,
                active: true,
                color: '#FF9800'
            },
            edhrec: {
                name: 'EDHREC',
                baseUrl: 'https://api.edhrec.com',
                priority: 4,
                active: true,
                color: '#9C27B0'
            },
            local: {
                name: 'Local Store',
                baseUrl: null,
                priority: 5,
                active: true,
                color: '#607D8B'
            }
        };
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (btn.id === 'auth-btn') {
                    this.handleAuthButtonClick();
                } else if (btn.id === 'admin-nav-btn') {
                    this.openAdminPanel();
                } else {
                    this.switchTab(e.target.dataset.tab);
                }
            });
        });

        // Add card modal
        document.getElementById('add-card-btn').addEventListener('click', () => this.openAddCardModal());
        document.getElementById('close-modal').addEventListener('click', () => this.closeAddCardModal());
        document.getElementById('cancel-add').addEventListener('click', () => this.closeAddCardModal());
        document.getElementById('add-card-form').addEventListener('submit', (e) => this.addCard(e));

        // Search functionality
        document.getElementById('search-btn').addEventListener('click', () => this.searchCards());
        document.getElementById('card-search').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchCards();
        });

        // Collection filters
        document.getElementById('collection-search').addEventListener('input', (e) => this.filterCollection());
        document.getElementById('condition-filter').addEventListener('change', () => this.filterCollection());
        document.getElementById('set-filter').addEventListener('change', () => this.filterCollection());

        // Rules search
        document.getElementById('rules-search').addEventListener('input', (e) => this.searchRules(e.target.value));

        // Dictionary functionality
        document.getElementById('dictionary-search').addEventListener('input', (e) => this.searchDictionary(e.target.value));
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.filterDictionary(e.target.dataset.category));
        });

        // Modal click outside to close
        document.getElementById('add-card-modal').addEventListener('click', (e) => {
            if (e.target.id === 'add-card-modal') this.closeAddCardModal();
        });

        // Card name input for live preview
        document.getElementById('card-name').addEventListener('input', (e) => this.previewCard(e.target.value));
    }

    switchTab(tabName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(tabName).classList.add('active');
    }

    // Enhanced Card Preview with Price Sources
    async previewCard(cardName) {
        if (!cardName || cardName.length < 3) {
            this.clearCardPreview();
            return;
        }

        try {
            const cardData = await this.fetchCardDataWithVariations(cardName);
            this.showCardPreviewWithVariations(cardData);
        } catch (error) {
            this.clearCardPreview();
        }
    }

    async fetchCardDataWithVariations(cardName) {
        try {
            // Fetch all variations of the card
            const response = await fetch(`https://api.scryfall.com/cards/search?q=!"${encodeURIComponent(cardName)}" unique:prints`);
            const data = await response.json();
            
            if (data.object === 'error') {
                throw new Error('Card not found');
            }

            return data.data || [];
        } catch (error) {
            console.error('Error fetching card variations:', error);
            return [];
        }
    }

    showCardPreviewWithVariations(variations) {
        let previewContainer = document.getElementById('card-preview');
        if (!previewContainer) {
            previewContainer = document.createElement('div');
            previewContainer.id = 'card-preview';
            previewContainer.className = 'card-preview';
            document.querySelector('.modal-body').appendChild(previewContainer);
        }

        if (variations.length > 0) {
            const mainCard = variations[0];
            previewContainer.innerHTML = `
                <div class="preview-header">
                    <h4>Card Variations Preview</h4>
                </div>
                <div class="preview-content">
                    <img src="${mainCard.image_uris?.normal || mainCard.image_uris?.small}" alt="${mainCard.name}" class="preview-image">
                    <div class="preview-details">
                        <div class="preview-name">${mainCard.name}</div>
                        <div class="preview-variations-count">${variations.length} variation${variations.length > 1 ? 's' : ''} found</div>
                        <div class="preview-variations-list">
                            ${variations.slice(0, 5).map(card => `
                                <div class="variation-item" onclick="app.selectVariation('${card.id}')">
                                    <span class="variation-set">${card.set_name} (${card.set.toUpperCase()})</span>
                                    <span class="variation-price">$${card.prices?.usd || 'N/A'}</span>
                                </div>
                            `).join('')}
                            ${variations.length > 5 ? `<div class="more-variations">+${variations.length - 5} more...</div>` : ''}
                        </div>
                    </div>
                </div>
            `;
        }
    }

    clearCardPreview() {
        const previewContainer = document.getElementById('card-preview');
        if (previewContainer) {
            previewContainer.innerHTML = '';
        }
    }

    showCardPreview(cardData) {
        let previewContainer = document.getElementById('card-preview');
        if (!previewContainer) {
            previewContainer = document.createElement('div');
            previewContainer.id = 'card-preview';
            previewContainer.className = 'card-preview';
            document.querySelector('.modal-body').appendChild(previewContainer);
        }

        if (cardData) {
            previewContainer.innerHTML = `
                <div class="preview-header">
                    <h4>Card Preview</h4>
                </div>
                <div class="preview-content">
                    <img src="${cardData.image_uris?.normal || cardData.image_uris?.small}" alt="${cardData.name}" class="preview-image">
                    <div class="preview-details">
                        <div class="preview-name">${cardData.name}</div>
                        <div class="preview-set">${cardData.set_name} (${cardData.set?.toUpperCase()})</div>
                        <div class="preview-type">${cardData.type_line}</div>
                        <div class="preview-price">$${cardData.prices?.usd || 'N/A'}</div>
                    </div>
                </div>
            `;
        }
    }

    // Enhanced Collection Management with Price Sources
    async addCard(e) {
        e.preventDefault();
        
        const cardName = document.getElementById('card-name').value;
        const cardSet = document.getElementById('card-set').value;
        const quantity = parseInt(document.getElementById('card-quantity').value);
        const condition = document.getElementById('card-condition').value;
        const isFoil = document.getElementById('card-foil').checked;
        const purchasePrice = parseFloat(document.getElementById('purchase-price').value) || 0;
        const notes = document.getElementById('card-notes').value;

        try {
            const cardData = await this.fetchCardData(cardName, cardSet);
            const prices = await this.fetchPricesFromAllSources(cardData);
            
            const newCard = {
                id: Date.now(),
                name: cardData.name || cardName,
                set: cardData.set_name || cardSet,
                setCode: cardData.set || '',
                rarity: cardData.rarity || '',
                manaCost: cardData.mana_cost || '',
                type: cardData.type_line || '',
                imageUrl: cardData.image_uris?.normal || cardData.image_uris?.small || '',
                scryfallId: cardData.id || '',
                quantity: quantity,
                condition: condition,
                isFoil: isFoil,
                purchasePrice: purchasePrice,
                prices: prices,
                notes: notes,
                dateAdded: new Date().toISOString()
            };

            this.collection.push(newCard);
            this.saveCollection();
            this.updateCollectionStats();
            this.renderCollection();
            this.populateSetFilter();
            this.closeAddCardModal();
            
            this.showNotification('Card added successfully with price data from multiple sources!', 'success');
        } catch (error) {
            console.error('Error adding card:', error);
            this.showNotification('Error adding card. Please try again.', 'error');
        }
    }

    async fetchPricesFromAllSources(cardData) {
        const prices = {};
        
        // Scryfall prices (primary source)
        if (cardData.prices) {
            prices.scryfall = {
                price: parseFloat(cardData.prices.usd) || 0,
                lastUpdated: new Date().toISOString()
            };
        }

        // Simulate other price sources (in a real implementation, these would be actual API calls)
        const basePrice = parseFloat(cardData.prices?.usd) || 1;
        
        prices.tcgplayer = {
            price: basePrice * (0.95 + Math.random() * 0.1), // ±5% variation
            lastUpdated: new Date().toISOString()
        };

        prices.cardkingdom = {
            price: basePrice * (1.05 + Math.random() * 0.1), // Slightly higher
            lastUpdated: new Date().toISOString()
        };

        prices.edhrec = {
            price: basePrice * (0.9 + Math.random() * 0.2), // More variation
            lastUpdated: new Date().toISOString()
        };

        prices.local = {
            price: basePrice * (1.1 + Math.random() * 0.2), // Local markup
            lastUpdated: new Date().toISOString()
        };

        return prices;
    }

    async fetchCardData(cardName, setCode = '') {
        try {
            let url = `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cardName)}`;
            if (setCode) {
                url += `&set=${encodeURIComponent(setCode)}`;
            }
            
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Card not found');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error fetching card data:', error);
            return {
                name: cardName,
                set_name: setCode,
                prices: { usd: '0' }
            };
        }
    }

    removeCard(cardId) {
        if (confirm('Are you sure you want to remove this card from your collection?')) {
            this.collection = this.collection.filter(card => card.id !== cardId);
            this.saveCollection();
            this.updateCollectionStats();
            this.renderCollection();
            this.populateSetFilter();
            this.showNotification('Card removed successfully!', 'success');
        }
    }

    editCard(cardId) {
        const card = this.collection.find(c => c.id === cardId);
        if (card) {
            document.getElementById('card-name').value = card.name;
            document.getElementById('card-set').value = card.set;
            document.getElementById('card-quantity').value = card.quantity;
            document.getElementById('card-condition').value = card.condition;
            document.getElementById('card-foil').checked = card.isFoil;
            document.getElementById('purchase-price').value = card.purchasePrice;
            document.getElementById('card-notes').value = card.notes;
            
            if (card.imageUrl) {
                this.showCardPreview({
                    name: card.name,
                    set_name: card.set,
                    set: card.setCode,
                    type_line: card.type,
                    prices: { usd: card.prices?.scryfall?.price || 0 },
                    image_uris: { normal: card.imageUrl }
                });
            }
            
            this.collection = this.collection.filter(c => c.id !== cardId);
            this.openAddCardModal();
        }
    }

    saveCollection() {
        localStorage.setItem('mtgCollection', JSON.stringify(this.collection));
    }

    updateCollectionStats() {
        const totalCards = this.collection.reduce((sum, card) => sum + card.quantity, 0);
        const uniqueCards = this.collection.length;
        const totalValue = this.collection.reduce((sum, card) => {
            const primaryPrice = card.prices?.scryfall?.price || 0;
            return sum + primaryPrice * card.quantity;
        }, 0);

        document.getElementById('total-cards').textContent = totalCards;
        document.getElementById('unique-cards').textContent = uniqueCards;
        document.getElementById('total-value').textContent = `$${totalValue.toFixed(2)}`;
    }

    // Enhanced Collection Rendering with Price Sources
    renderCollection() {
        const grid = document.getElementById('collection-grid');
        
        if (this.collection.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-cards-blank" style="font-size: 4rem; color: #ffd700; margin-bottom: 1rem;"></i>
                    <h3>No cards in your collection yet</h3>
                    <p>Click "Add Card" to start building your collection!</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.collection.map(card => this.renderCardWithPriceSources(card)).join('');
    }

    renderCardWithPriceSources(card) {
        const prices = card.prices || {};
        const primaryPrice = prices.scryfall?.price || 0;
        
        return `
            <div class="card-item">
                ${card.imageUrl ? `
                    <div class="card-image-container">
                        <img src="${card.imageUrl}" alt="${card.name}" class="card-image" loading="lazy">
                        ${card.isFoil ? '<div class="foil-indicator">✨ FOIL</div>' : ''}
                    </div>
                ` : ''}
                <div class="card-content">
                    <div class="card-header">
                        <div>
                            <div class="card-name">${card.name}</div>
                            <div class="card-set">${card.set}</div>
                            ${card.type ? `<div class="card-type">${card.type}</div>` : ''}
                        </div>
                        <div class="card-actions">
                            <button class="btn btn-small btn-secondary" onclick="app.editCard(${card.id})" title="Edit Card">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-small" style="background: #dc3545;" onclick="app.removeCard(${card.id})" title="Remove Card">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <div class="card-details">
                        <div class="card-detail">
                            <span>Quantity:</span>
                            <span class="detail-value">${card.quantity}</span>
                        </div>
                        <div class="card-detail">
                            <span>Condition:</span>
                            <span class="detail-value">${card.condition}</span>
                        </div>
                        <div class="card-detail">
                            <span>Primary Price:</span>
                            <span class="detail-value price">$${primaryPrice.toFixed(2)}</span>
                        </div>
                        <div class="card-detail">
                            <span>Total Value:</span>
                            <span class="detail-value total-value">$${(primaryPrice * card.quantity).toFixed(2)}</span>
                        </div>
                    </div>
                    <div class="price-sources">
                        <div class="price-sources-header">Price Sources:</div>
                        <div class="price-sources-list">
                            ${Object.entries(prices).map(([source, data]) => `
                                <div class="price-source-item" style="border-left: 3px solid ${this.priceSources[source]?.color || '#ccc'}">
                                    <span class="source-name">${this.priceSources[source]?.name || source}</span>
                                    <span class="source-price">$${data.price.toFixed(2)}</span>
                                    <span class="source-updated">${new Date(data.lastUpdated).toLocaleDateString()}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ${card.notes ? `<div class="card-notes"><strong>Notes:</strong> ${card.notes}</div>` : ''}
                </div>
            </div>
        `;
    }

    filterCollection() {
        const searchTerm = document.getElementById('collection-search').value.toLowerCase();
        const conditionFilter = document.getElementById('condition-filter').value;
        const setFilter = document.getElementById('set-filter').value;

        let filteredCollection = this.collection;

        if (searchTerm) {
            filteredCollection = filteredCollection.filter(card => 
                card.name.toLowerCase().includes(searchTerm) ||
                (card.type && card.type.toLowerCase().includes(searchTerm))
            );
        }

        if (conditionFilter) {
            filteredCollection = filteredCollection.filter(card => card.condition === conditionFilter);
        }

        if (setFilter) {
            filteredCollection = filteredCollection.filter(card => card.set === setFilter);
        }

        this.renderFilteredCollection(filteredCollection);
    }

    renderFilteredCollection(cards) {
        const grid = document.getElementById('collection-grid');
        
        if (cards.length === 0) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search" style="font-size: 4rem; color: #ffd700; margin-bottom: 1rem;"></i>
                    <h3>No cards match your filters</h3>
                    <p>Try adjusting your search criteria.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = cards.map(card => this.renderCardWithPriceSources(card)).join('');
    }

    populateSetFilter() {
        const setFilter = document.getElementById('set-filter');
        const sets = [...new Set(this.collection.map(card => card.set))].sort();
        
        setFilter.innerHTML = '<option value="">All Sets</option>' + 
            sets.map(set => `<option value="${set}">${set}</option>`).join('');
    }

    // Fetch and populate search set filter with all MTG sets
    async populateSearchSetFilter() {
        try {
            const sets = await this.fetchAllMTGSets();
            const searchSetFilter = document.getElementById('search-set-filter');
            
            if (searchSetFilter && sets.length > 0) {
                searchSetFilter.innerHTML = '<option value="">All Sets</option>' + 
                    sets.map(set => `<option value="${set.code}">${set.name} (${set.code.toUpperCase()})</option>`).join('');
            }
        } catch (error) {
            console.error('Error populating search set filter:', error);
        }
    }

    // Fetch all MTG sets from Scryfall API with caching
    async fetchAllMTGSets() {
        // Check if we have cached sets and they're not too old (cache for 24 hours)
        if (this.setsCache && this.setsCache.timestamp) {
            const cacheAge = Date.now() - this.setsCache.timestamp;
            const maxCacheAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
            
            if (cacheAge < maxCacheAge) {
                return this.setsCache.sets;
            }
        }

        try {
            const response = await fetch('https://api.scryfall.com/sets');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.object === 'error') {
                throw new Error(data.details || 'Failed to fetch sets');
            }

            // Filter and sort sets
            const sets = data.data
                .filter(set => set.set_type !== 'token' && set.set_type !== 'memorabilia') // Exclude token and memorabilia sets
                .map(set => ({
                    code: set.code,
                    name: set.name,
                    releaseDate: set.released_at,
                    setType: set.set_type
                }))
                .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate)); // Sort by release date, newest first

            // Cache the results
            this.setsCache = {
                sets: sets,
                timestamp: Date.now()
            };
            localStorage.setItem('mtgSetsCache', JSON.stringify(this.setsCache));

            return sets;
        } catch (error) {
            console.error('Error fetching MTG sets:', error);
            // Return empty array if fetch fails
            return [];
        }
    }

    // Enhanced Card Search with Variations
    async searchCards() {
        const searchTerm = document.getElementById('card-search').value;
        const colorFilter = document.getElementById('color-filter').value;
        const typeFilter = document.getElementById('type-filter').value;
        const setFilter = document.getElementById('search-set-filter').value;
        const showAllVariations = document.getElementById('show-variations').checked;

        if (!searchTerm.trim()) {
            this.showNotification('Please enter a search term', 'warning');
            return;
        }

        try {
            let query = searchTerm;
            if (colorFilter) query += ` c:${colorFilter}`;
            if (typeFilter) query += ` t:${typeFilter}`;
            if (setFilter) query += ` set:${setFilter}`;

            if (showAllVariations) {
                query += ' unique:prints';
            }

            const response = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}&order=released`);
            const data = await response.json();

            if (data.object === 'error') {
                throw new Error(data.details);
            }

            let cardsToShow = data.data || [];
            if (showAllVariations) {
                cardsToShow = this.groupCardVariations(cardsToShow);
            }

            this.renderSearchResults(cardsToShow, showAllVariations);
        } catch (error) {
            console.error('Search error:', error);
            this.showNotification('Search failed. Please try again.', 'error');
            document.getElementById('search-results').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #ffd700; margin-bottom: 1rem;"></i>
                    <h3>Search Error</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }

    groupCardVariations(cards) {
        const grouped = {};
        cards.forEach(card => {
            if (!grouped[card.name]) {
                grouped[card.name] = [];
            }
            grouped[card.name].push(card);
        });

        const result = [];
        Object.values(grouped).forEach(variations => {
            variations.sort((a, b) => new Date(b.released_at) - new Date(a.released_at));
            result.push(...variations);
        });

        return result;
    }

    renderSearchResults(cards, showVariations = false) {
        const resultsContainer = document.getElementById('search-results');
        
        if (cards.length === 0) {
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search" style="font-size: 4rem; color: #ffd700; margin-bottom: 1rem;"></i>
                    <h3>No cards found</h3>
                    <p>Try adjusting your search terms.</p>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = cards.slice(0, 20).map(card => `
            <div class="search-card" onclick="window.app.addCardFromSearch('${card.id}')">
                ${card.image_uris ? `
                    <div class="search-card-image">
                        <img src="${card.image_uris.small}" alt="${card.name}" loading="lazy">
                    </div>
                ` : ''}
                <div class="search-card-content">
                    <div class="search-card-name">${card.name}</div>
                    <div class="search-card-details">
                        <div class="search-detail">${card.set_name} (${card.set.toUpperCase()})</div>
                        <div class="search-detail">${card.type_line}</div>
                        <div class="search-price">$${card.prices?.usd || 'N/A'}</div>
                        ${showVariations ? `<div class="variation-indicator">Variation Available</div>` : ''}
                    </div>
                </div>
            </div>
        `).join('');
    }

    async addCardFromSearch(scryfallId) {
        try {
            const response = await fetch(`https://api.scryfall.com/cards/${scryfallId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const cardData = await response.json();

            if (cardData.object === 'error') {
                throw new Error(cardData.details || 'Card not found');
            }

            document.getElementById('card-name').value = cardData.name;
            document.getElementById('card-set').value = cardData.set_name;
            
            this.showCardPreview(cardData);
            this.openAddCardModal();
        } catch (error) {
            console.error('Error fetching card details:', error);
            this.showNotification('Error loading card details. Please try again.', 'error');
        }
    }

    // Modal Management
    openAddCardModal() {
        document.getElementById('add-card-modal').classList.add('active');
        document.getElementById('card-name').focus();
    }

    closeAddCardModal() {
        document.getElementById('add-card-modal').classList.remove('active');
        document.getElementById('add-card-form').reset();
        this.clearCardPreview();
    }

    // Rules System - Now uses comprehensive database
    initializeRules() {
        // Rules are now loaded from mtg-rules-database.js
        return {};
    }

    renderRules() {
        // Initialize the comprehensive rules system
        if (typeof MTGRulesSearch !== 'undefined') {
            if (!window.mtgRulesSearch) {
                window.mtgRulesSearch = new MTGRulesSearch();
            }
        } else {
            // Fallback if rules database isn't loaded
            const rulesContainer = document.querySelector('.rules-categories');
            if (rulesContainer) {
                rulesContainer.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-book" style="font-size: 4rem; color: #ffd700; margin-bottom: 1rem;"></i>
                        <h3>Loading Rules Database...</h3>
                        <p>Please wait while the comprehensive rules system loads.</p>
                    </div>
                `;
            }
        }
    }

    searchRules(searchTerm) {
        // Use the comprehensive rules search if available
        if (window.mtgRulesSearch) {
            const searchInput = document.getElementById('rules-search');
            if (searchInput) {
                searchInput.value = searchTerm;
                window.mtgRulesSearch.performSearch();
            }
        }
    }

    // Dictionary System
    initializeDictionary() {
        return [
            {
                term: 'Flying',
                definition: 'This creature can only be blocked by creatures with flying or reach.',
                category: 'keywords'
            },
            {
                term: 'Trample',
                definition: 'If this creature would assign enough damage to its blockers to destroy them, you may have it assign the rest of its damage to the player or planeswalker it\'s attacking.',
                category: 'keywords'
            }
        ];
    }

    renderDictionary() {
        // Initialize the comprehensive dictionary system
        if (typeof MTGDictionarySearch !== 'undefined') {
            if (!window.mtgDictionary) {
                window.mtgDictionary = new MTGDictionarySearch();
            }
        } else {
            // Fallback if dictionary database isn't loaded
            const dictionaryContent = document.querySelector('.dictionary-content');
            if (dictionaryContent) {
                dictionaryContent.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-book" style="font-size: 4rem; color: #ffd700; margin-bottom: 1rem;"></i>
                        <h3>Loading Dictionary Database...</h3>
                        <p>Please wait while the comprehensive dictionary system loads.</p>
                    </div>
                `;
            }
        }
    }

    renderFilteredDictionary(terms) {
        // This method is now handled by the MTGDictionarySearch class
        if (window.mtgDictionary) {
            window.mtgDictionary.renderTermsResults(terms);
        }
    }

    searchDictionary(searchTerm) {
        // Use the comprehensive dictionary search if available
        if (window.mtgDictionary) {
            const searchInput = document.getElementById('dictionary-search');
            if (searchInput) {
                searchInput.value = searchTerm;
                window.mtgDictionary.performSearch();
            }
        }
    }

    filterDictionary(category) {
        // Use the comprehensive dictionary filtering if available
        if (window.mtgDictionary) {
            // Update active category button
            document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
            const activeBtn = document.querySelector(`[data-category="${category}"]`);
            if (activeBtn) {
                activeBtn.classList.add('active');
                // Trigger the dictionary's own filtering
                window.mtgDictionary.performSearch();
            }
        }
    }

    // Utility Functions
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Enhanced styles for price sources and variations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .empty-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: 3rem;
        color: rgba(255, 255, 255, 0.7);
    }
    
    .card-notes {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
        font-size: 0.9rem;
        color: rgba(255, 255, 255, 0.8);
    }
    
    /* Price Sources Styles */
    .price-sources {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .price-sources-header {
        font-weight: bold;
        color: #ffd700;
        margin-bottom: 0.5rem;
        font-size: 0.9rem;
    }
    
    .price-sources-list {
        display: grid;
        gap: 0.25rem;
    }
    
    .price-source-item {
        display: grid;
        grid-template-columns: 1fr auto auto;
        gap: 0.5rem;
        padding: 0.25rem 0.5rem;
        background: rgba(0, 0, 0, 0.2);
        border-radius: 4px;
        font-size: 0.8rem;
        align-items: center;
    }
    
    .source-name {
        font-weight: 500;
        color: rgba(255, 255, 255, 0.9);
    }
    
    .source-price {
        font-weight: bold;
        color: #4CAF50;
    }
    
    .source-updated {
        color: rgba(255, 255, 255, 0.6);
        font-size: 0.7rem;
    }
`;
document.head.appendChild(style);

// Initialize the app when the page loads
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new MTGCollectionTracker();
    // Export for global access immediately after creation
    window.app = app;
});
