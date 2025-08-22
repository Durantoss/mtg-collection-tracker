// Wishlist and Enhanced Statistics Module for MTG Collection Tracker
// Phase 3: User Experience - Add wishlist functionality and improve collection statistics with charts

class WishlistAndStats {
    constructor(app) {
        this.app = app;
        this.wishlist = JSON.parse(localStorage.getItem('mtgWishlist')) || [];
        this.statsHistory = JSON.parse(localStorage.getItem('statsHistory')) || {};
        
        this.init();
    }

    init() {
        this.addWishlistTab();
        this.enhanceCollectionStats();
        this.setupEventListeners();
        this.recordStatsHistory();
    }

    addWishlistTab() {
        // Add wishlist navigation button
        const navMenu = document.querySelector('.nav-menu');
        const authBtn = document.getElementById('auth-btn');
        
        if (navMenu && authBtn) {
            const wishlistBtn = document.createElement('button');
            wishlistBtn.className = 'nav-btn';
            wishlistBtn.setAttribute('data-tab', 'wishlist');
            wishlistBtn.innerHTML = '<i class="fas fa-heart"></i> Wishlist';
            
            navMenu.insertBefore(wishlistBtn, authBtn);
        }

        // Add wishlist tab content
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            const wishlistTab = document.createElement('div');
            wishlistTab.className = 'tab-content';
            wishlistTab.id = 'wishlist';
            wishlistTab.innerHTML = this.createWishlistHTML();
            
            mainContent.appendChild(wishlistTab);
        }
    }

    createWishlistHTML() {
        return `
            <div class="tab-header">
                <h2>My Wishlist</h2>
                <div class="wishlist-actions">
                    <button class="btn btn-secondary" id="import-wishlist-btn">
                        <i class="fas fa-upload"></i> Import Wishlist
                    </button>
                    <button class="btn btn-primary" id="add-to-wishlist-btn">
                        <i class="fas fa-plus"></i> Add Card
                    </button>
                </div>
            </div>
            
            <div class="wishlist-stats">
                <div class="stat-card">
                    <h3>Total Cards</h3>
                    <span id="wishlist-total-cards">0</span>
                </div>
                <div class="stat-card">
                    <h3>Estimated Value</h3>
                    <span id="wishlist-total-value">$0.00</span>
                </div>
                <div class="stat-card">
                    <h3>Priority Cards</h3>
                    <span id="wishlist-priority-cards">0</span>
                </div>
                <div class="stat-card">
                    <h3>Budget Needed</h3>
                    <span id="wishlist-budget-needed">$0.00</span>
                </div>
            </div>

            <div class="wishlist-filters">
                <input type="text" id="wishlist-search" placeholder="Search wishlist...">
                <select id="wishlist-priority-filter">
                    <option value="">All Priorities</option>
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                </select>
                <select id="wishlist-budget-filter">
                    <option value="">All Budgets</option>
                    <option value="under-5">Under $5</option>
                    <option value="5-20">$5 - $20</option>
                    <option value="20-50">$20 - $50</option>
                    <option value="over-50">Over $50</option>
                </select>
                <button class="btn btn-secondary" id="clear-wishlist-filters">Clear Filters</button>
            </div>

            <div class="wishlist-grid" id="wishlist-grid">
                <!-- Wishlist cards will be populated here -->
            </div>
        `;
    }

    enhanceCollectionStats() {
        const collectionTab = document.getElementById('collection');
        const existingStats = collectionTab.querySelector('.collection-stats');
        
        if (existingStats) {
            // Add enhanced stats section after existing stats
            const enhancedStatsSection = document.createElement('div');
            enhancedStatsSection.className = 'enhanced-stats-section';
            enhancedStatsSection.innerHTML = this.createEnhancedStatsHTML();
            
            existingStats.parentNode.insertBefore(enhancedStatsSection, existingStats.nextSibling);
        }
    }

    createEnhancedStatsHTML() {
        return `
            <div class="enhanced-stats-container">
                <div class="stats-tabs">
                    <button class="stats-tab-btn active" data-stats-tab="overview">Overview</button>
                    <button class="stats-tab-btn" data-stats-tab="charts">Charts</button>
                    <button class="stats-tab-btn" data-stats-tab="breakdown">Breakdown</button>
                    <button class="stats-tab-btn" data-stats-tab="trends">Trends</button>
                </div>

                <div class="stats-content">
                    <!-- Overview Tab -->
                    <div class="stats-tab-content active" id="stats-overview">
                        <div class="overview-grid">
                            <div class="overview-card">
                                <div class="overview-icon">
                                    <i class="fas fa-layer-group"></i>
                                </div>
                                <div class="overview-content">
                                    <h4>Collection Completion</h4>
                                    <div class="completion-bar">
                                        <div class="completion-fill" id="completion-fill" style="width: 0%"></div>
                                    </div>
                                    <span id="completion-percentage">0%</span>
                                </div>
                            </div>

                            <div class="overview-card">
                                <div class="overview-icon">
                                    <i class="fas fa-gem"></i>
                                </div>
                                <div class="overview-content">
                                    <h4>Most Valuable Card</h4>
                                    <div class="valuable-card" id="most-valuable-card">
                                        <span class="card-name">-</span>
                                        <span class="card-value">$0.00</span>
                                    </div>
                                </div>
                            </div>

                            <div class="overview-card">
                                <div class="overview-icon">
                                    <i class="fas fa-chart-line"></i>
                                </div>
                                <div class="overview-content">
                                    <h4>Collection Growth</h4>
                                    <div class="growth-stats" id="growth-stats">
                                        <span class="growth-period">This Month</span>
                                        <span class="growth-value">+0 cards</span>
                                    </div>
                                </div>
                            </div>

                            <div class="overview-card">
                                <div class="overview-icon">
                                    <i class="fas fa-balance-scale"></i>
                                </div>
                                <div class="overview-content">
                                    <h4>Average Card Value</h4>
                                    <div class="average-value" id="average-card-value">$0.00</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Charts Tab -->
                    <div class="stats-tab-content" id="stats-charts">
                        <div class="charts-grid">
                            <div class="chart-container">
                                <h4>Collection by Color</h4>
                                <canvas id="color-distribution-chart" width="300" height="300"></canvas>
                            </div>
                            <div class="chart-container">
                                <h4>Collection by Rarity</h4>
                                <canvas id="rarity-distribution-chart" width="300" height="300"></canvas>
                            </div>
                            <div class="chart-container">
                                <h4>Collection by Type</h4>
                                <canvas id="type-distribution-chart" width="300" height="300"></canvas>
                            </div>
                            <div class="chart-container">
                                <h4>Collection by Set</h4>
                                <canvas id="set-distribution-chart" width="300" height="300"></canvas>
                            </div>
                        </div>
                    </div>

                    <!-- Breakdown Tab -->
                    <div class="stats-tab-content" id="stats-breakdown">
                        <div class="breakdown-grid">
                            <div class="breakdown-section">
                                <h4>By Mana Cost</h4>
                                <div class="breakdown-list" id="cmc-breakdown"></div>
                            </div>
                            <div class="breakdown-section">
                                <h4>By Set</h4>
                                <div class="breakdown-list" id="set-breakdown"></div>
                            </div>
                            <div class="breakdown-section">
                                <h4>By Condition</h4>
                                <div class="breakdown-list" id="condition-breakdown"></div>
                            </div>
                            <div class="breakdown-section">
                                <h4>By Value Range</h4>
                                <div class="breakdown-list" id="value-breakdown"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Trends Tab -->
                    <div class="stats-tab-content" id="stats-trends">
                        <div class="trends-container">
                            <div class="trend-chart-container">
                                <h4>Collection Growth Over Time</h4>
                                <canvas id="growth-trend-chart" width="800" height="400"></canvas>
                            </div>
                            <div class="trends-insights">
                                <h4>Insights</h4>
                                <div class="insights-list" id="collection-insights"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupEventListeners() {
        // Wishlist navigation
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-tab="wishlist"]')) {
                this.app.switchTab('wishlist');
                this.renderWishlist();
            }
        });

        // Stats tabs
        document.addEventListener('click', (e) => {
            if (e.target.matches('.stats-tab-btn')) {
                this.switchStatsTab(e.target.dataset.statsTab);
            }
        });

        // Wishlist buttons
        setTimeout(() => {
            const addToWishlistBtn = document.getElementById('add-to-wishlist-btn');
            if (addToWishlistBtn) {
                addToWishlistBtn.addEventListener('click', () => this.showAddToWishlistModal());
            }

            const importWishlistBtn = document.getElementById('import-wishlist-btn');
            if (importWishlistBtn) {
                importWishlistBtn.addEventListener('click', () => this.showImportWishlistModal());
            }

            // Wishlist filters
            const wishlistSearch = document.getElementById('wishlist-search');
            if (wishlistSearch) {
                wishlistSearch.addEventListener('input', () => this.filterWishlist());
            }

            const priorityFilter = document.getElementById('wishlist-priority-filter');
            if (priorityFilter) {
                priorityFilter.addEventListener('change', () => this.filterWishlist());
            }

            const budgetFilter = document.getElementById('wishlist-budget-filter');
            if (budgetFilter) {
                budgetFilter.addEventListener('change', () => this.filterWishlist());
            }

            const clearFiltersBtn = document.getElementById('clear-wishlist-filters');
            if (clearFiltersBtn) {
                clearFiltersBtn.addEventListener('click', () => this.clearWishlistFilters());
            }
        }, 100);
    }

    switchStatsTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.stats-tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-stats-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.stats-tab-content').forEach(content => content.classList.remove('active'));
        document.getElementById(`stats-${tabName}`).classList.add('active');

        // Load tab-specific content
        switch (tabName) {
            case 'overview':
                this.updateOverviewStats();
                break;
            case 'charts':
                this.renderCharts();
                break;
            case 'breakdown':
                this.renderBreakdown();
                break;
            case 'trends':
                this.renderTrends();
                break;
        }
    }

    updateOverviewStats() {
        const collection = this.app.collection;
        
        // Collection completion (mock calculation)
        const totalPossibleCards = 20000; // Approximate total MTG cards
        const completionPercentage = Math.min((collection.length / totalPossibleCards) * 100, 100);
        
        const completionFill = document.getElementById('completion-fill');
        const completionText = document.getElementById('completion-percentage');
        if (completionFill && completionText) {
            completionFill.style.width = `${completionPercentage}%`;
            completionText.textContent = `${completionPercentage.toFixed(2)}%`;
        }

        // Most valuable card
        const mostValuableCard = collection.reduce((max, card) => {
            const cardValue = (card.prices?.scryfall?.price || card.currentPrice || 0) * card.quantity;
            const maxValue = (max.prices?.scryfall?.price || max.currentPrice || 0) * max.quantity;
            return cardValue > maxValue ? card : max;
        }, collection[0] || {});

        const mostValuableEl = document.getElementById('most-valuable-card');
        if (mostValuableEl && mostValuableCard.name) {
            const cardValue = (mostValuableCard.prices?.scryfall?.price || mostValuableCard.currentPrice || 0) * mostValuableCard.quantity;
            mostValuableEl.innerHTML = `
                <span class="card-name">${mostValuableCard.name}</span>
                <span class="card-value">$${cardValue.toFixed(2)}</span>
            `;
        }

        // Collection growth
        const thisMonth = new Date().toISOString().slice(0, 7);
        const thisMonthCards = collection.filter(card => 
            card.dateAdded && card.dateAdded.startsWith(thisMonth)
        ).length;

        const growthStatsEl = document.getElementById('growth-stats');
        if (growthStatsEl) {
            growthStatsEl.innerHTML = `
                <span class="growth-period">This Month</span>
                <span class="growth-value">+${thisMonthCards} cards</span>
            `;
        }

        // Average card value
        const totalValue = collection.reduce((sum, card) => {
            return sum + (card.prices?.scryfall?.price || card.currentPrice || 0) * card.quantity;
        }, 0);
        const averageValue = collection.length > 0 ? totalValue / collection.reduce((sum, card) => sum + card.quantity, 0) : 0;

        const averageValueEl = document.getElementById('average-card-value');
        if (averageValueEl) {
            averageValueEl.textContent = `$${averageValue.toFixed(2)}`;
        }
    }

    renderCharts() {
        this.renderColorDistributionChart();
        this.renderRarityDistributionChart();
        this.renderTypeDistributionChart();
        this.renderSetDistributionChart();
    }

    renderColorDistributionChart() {
        const canvas = document.getElementById('color-distribution-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const collection = this.app.collection;

        // Count cards by color
        const colorCounts = {
            'White': 0,
            'Blue': 0,
            'Black': 0,
            'Red': 0,
            'Green': 0,
            'Colorless': 0,
            'Multicolor': 0
        };

        collection.forEach(card => {
            const manaCost = card.manaCost || '';
            const colors = [];
            
            if (manaCost.includes('W')) colors.push('White');
            if (manaCost.includes('U')) colors.push('Blue');
            if (manaCost.includes('B')) colors.push('Black');
            if (manaCost.includes('R')) colors.push('Red');
            if (manaCost.includes('G')) colors.push('Green');
            
            if (colors.length === 0) {
                colorCounts['Colorless'] += card.quantity;
            } else if (colors.length === 1) {
                colorCounts[colors[0]] += card.quantity;
            } else {
                colorCounts['Multicolor'] += card.quantity;
            }
        });

        this.drawPieChart(ctx, colorCounts, {
            'White': '#FFFBD5',
            'Blue': '#0E68AB',
            'Black': '#150B00',
            'Red': '#D3202A',
            'Green': '#00733E',
            'Colorless': '#CAC5C0',
            'Multicolor': '#FFD700'
        });
    }

    renderRarityDistributionChart() {
        const canvas = document.getElementById('rarity-distribution-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const collection = this.app.collection;

        const rarityCounts = {
            'Common': 0,
            'Uncommon': 0,
            'Rare': 0,
            'Mythic': 0
        };

        collection.forEach(card => {
            const rarity = card.rarity || 'common';
            const rarityKey = rarity.charAt(0).toUpperCase() + rarity.slice(1);
            if (rarityCounts[rarityKey] !== undefined) {
                rarityCounts[rarityKey] += card.quantity;
            }
        });

        this.drawPieChart(ctx, rarityCounts, {
            'Common': '#1a1a1a',
            'Uncommon': '#c0c0c0',
            'Rare': '#ffb300',
            'Mythic': '#ff6d00'
        });
    }

    renderTypeDistributionChart() {
        const canvas = document.getElementById('type-distribution-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const collection = this.app.collection;

        const typeCounts = {};

        collection.forEach(card => {
            const type = card.type || 'Unknown';
            const mainType = type.split(' ')[0] || 'Unknown';
            
            if (!typeCounts[mainType]) {
                typeCounts[mainType] = 0;
            }
            typeCounts[mainType] += card.quantity;
        });

        // Get top 6 types
        const sortedTypes = Object.entries(typeCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 6);

        const typeData = Object.fromEntries(sortedTypes);

        this.drawPieChart(ctx, typeData, {
            'Creature': '#4CAF50',
            'Instant': '#2196F3',
            'Sorcery': '#FF9800',
            'Enchantment': '#9C27B0',
            'Artifact': '#795548',
            'Land': '#8BC34A',
            'Planeswalker': '#E91E63'
        });
    }

    renderSetDistributionChart() {
        const canvas = document.getElementById('set-distribution-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const collection = this.app.collection;

        const setCounts = {};

        collection.forEach(card => {
            const set = card.set || 'Unknown';
            if (!setCounts[set]) {
                setCounts[set] = 0;
            }
            setCounts[set] += card.quantity;
        });

        // Get top 8 sets
        const sortedSets = Object.entries(setCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8);

        const setData = Object.fromEntries(sortedSets);

        // Generate colors for sets
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
            '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
        ];

        const setColors = {};
        Object.keys(setData).forEach((set, index) => {
            setColors[set] = colors[index % colors.length];
        });

        this.drawPieChart(ctx, setData, setColors);
    }

    drawPieChart(ctx, data, colors) {
        const canvas = ctx.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 20;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const total = Object.values(data).reduce((sum, value) => sum + value, 0);
        if (total === 0) {
            ctx.fillStyle = '#ccc';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No data available', centerX, centerY);
            return;
        }

        let currentAngle = -Math.PI / 2;

        Object.entries(data).forEach(([label, value]) => {
            if (value === 0) return;

            const sliceAngle = (value / total) * 2 * Math.PI;
            
            // Draw slice
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fillStyle = colors[label] || '#ccc';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw label
            const labelAngle = currentAngle + sliceAngle / 2;
            const labelX = centerX + Math.cos(labelAngle) * (radius * 0.7);
            const labelY = centerY + Math.sin(labelAngle) * (radius * 0.7);
            
            ctx.fillStyle = '#000';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${label}`, labelX, labelY);
            ctx.fillText(`${value}`, labelX, labelY + 15);

            currentAngle += sliceAngle;
        });
    }

    renderBreakdown() {
        this.renderCMCBreakdown();
        this.renderSetBreakdown();
        this.renderConditionBreakdown();
        this.renderValueBreakdown();
    }

    renderCMCBreakdown() {
        const container = document.getElementById('cmc-breakdown');
        if (!container) return;

        const collection = this.app.collection;
        const cmcCounts = {};

        collection.forEach(card => {
            // Extract CMC from mana cost (simplified)
            const manaCost = card.manaCost || '';
            let cmc = 0;
            
            // Count generic mana
            const genericMatch = manaCost.match(/\{(\d+)\}/);
            if (genericMatch) {
                cmc += parseInt(genericMatch[1]);
            }
            
            // Count colored mana symbols
            const coloredSymbols = manaCost.match(/\{[WUBRG]\}/g);
            if (coloredSymbols) {
                cmc += coloredSymbols.length;
            }

            const cmcKey = `${cmc} CMC`;
            if (!cmcCounts[cmcKey]) {
                cmcCounts[cmcKey] = 0;
            }
            cmcCounts[cmcKey] += card.quantity;
        });

        this.renderBreakdownList(container, cmcCounts);
    }

    renderSetBreakdown() {
        const container = document.getElementById('set-breakdown');
        if (!container) return;

        const collection = this.app.collection;
        const setCounts = {};

        collection.forEach(card => {
            const set = card.set || 'Unknown';
            if (!setCounts[set]) {
                setCounts[set] = 0;
            }
            setCounts[set] += card.quantity;
        });

        this.renderBreakdownList(container, setCounts);
    }

    renderConditionBreakdown() {
        const container = document.getElementById('condition-breakdown');
        if (!container) return;

        const collection = this.app.collection;
        const conditionCounts = {};

        collection.forEach(card => {
            const condition = card.condition || 'Unknown';
            if (!conditionCounts[condition]) {
                conditionCounts[condition] = 0;
            }
            conditionCounts[condition] += card.quantity;
        });

        this.renderBreakdownList(container, conditionCounts);
    }

    renderValueBreakdown() {
        const container = document.getElementById('value-breakdown');
        if (!container) return;

        const collection = this.app.collection;
        const valueCounts = {
            'Under $1': 0,
            '$1 - $5': 0,
            '$5 - $20': 0,
            '$20 - $50': 0,
            'Over $50': 0
        };

        collection.forEach(card => {
            const value = (card.prices?.scryfall?.price || card.currentPrice || 0) * card.quantity;
            
            if (value < 1) {
                valueCounts['Under $1'] += card.quantity;
            } else if (value < 5) {
                valueCounts['$1 - $5'] += card.quantity;
            } else if (value < 20) {
                valueCounts['$5 - $20'] += card.quantity;
            } else if (value < 50) {
                valueCounts['$20 - $50'] += card.quantity;
            } else {
                valueCounts['Over $50'] += card.quantity;
            }
        });

        this.renderBreakdownList(container, valueCounts);
    }

    renderBreakdownList(container, data) {
        const sortedData = Object.entries(data)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        const total = Object.values(data).reduce((sum, value) => sum + value, 0);

        container.innerHTML = sortedData.map(([label, count]) => {
            const percentage = total > 0 ? (count / total) * 100 : 0;
            return `
                <div class="breakdown-item">
                    <div class="breakdown-label">${label}</div>
                    <div class="breakdown-bar">
                        <div class="breakdown-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="breakdown-count">${count}</div>
                </div>
            `;
        }).join('');
    }

    renderTrends() {
        this.renderGrowthTrendChart();
        this.generateInsights();
    }

    renderGrowthTrendChart() {
        const canvas = document.getElementById('growth-trend-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const collection = this.app.collection;

        // Group cards by month
        const monthlyData = {};
        collection.forEach(card => {
            if (card.dateAdded) {
                const month = card.dateAdded.slice(0, 7); // YYYY-MM
                if (!monthlyData[month]) {
                    monthlyData[month] = 0;
                }
                monthlyData[month] += card.quantity;
            }
        });

        // Create cumulative data
        const sortedMonths = Object.keys(monthlyData).sort();
        const cumulativeData = {};
        let cumulative = 0;

        sortedMonths.forEach(month => {
            cumulative += monthlyData[month];
            cumulativeData[month] = cumulative;
        });

        this.drawLineChart(ctx, cumulativeData, 'Collection Growth Over Time');
    }

    drawLineChart(ctx, data, title) {
        const canvas = ctx.canvas;
        const padding = 60;
        const chartWidth = canvas.width - 2 * padding;
        const chartHeight = canvas.height - 2 * padding;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const entries = Object.entries(data);
        if (entries.length === 0) {
            ctx.fillStyle = '#ccc';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
            return;
        }

        const values = entries.map(([, value]) => value);
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);
        const valueRange = maxValue - minValue || 1;

        // Draw grid
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            ctx.stroke();
        }

        // Draw line
        ctx.strokeStyle = '#66BB6A';
        ctx.lineWidth = 3;
        ctx.beginPath();

        entries.forEach(([month, value], index) => {
            const x = padding + (chartWidth / (entries.length - 1)) * index;
            const y = canvas.height - padding - ((value - minValue) / valueRange) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw points
        ctx.fillStyle = '#66BB6A';
        entries.forEach(([month, value], index) => {
            const x = padding + (chartWidth / (entries.length - 1)) * index;
            const y = canvas.height - padding - ((value - minValue) / valueRange) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });

        // Draw labels
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';

        // Y-axis labels
        for (let i = 0; i <= 5; i++) {
            const value = minValue + (valueRange / 5) * (5 - i);
            const y = padding + (chartHeight / 5) * i;
            ctx.textAlign = 'right';
            ctx.fillText(value.toFixed(0), padding - 10, y + 4);
        }

        // X-axis labels
        const labelStep = Math.ceil(entries.length / 6);
        entries.forEach(([month, value], index) => {
            if (index % labelStep === 0) {
                const x = padding + (chartWidth / (entries.length - 1)) * index;
                ctx.textAlign = 'center';
                ctx.fillText(month, x, canvas.height - padding + 20);
            }
        });
    }

    generateInsights() {
        const container = document.getElementById('collection-insights');
        if (!container) return;

        const collection = this.app.collection;
        const insights = [];

        // Most collected set
        const setCounts = {};
        collection.forEach(card => {
            const set = card.set || 'Unknown';
            setCounts[set] = (setCounts[set] || 0) + card.quantity;
        });

        const topSet = Object.entries(setCounts).sort(([,a], [,b]) => b - a)[0];
        if (topSet) {
            insights.push(`Your most collected set is ${topSet[0]} with ${topSet[1]} cards.`);
        }

        // Favorite color
        const colorCounts = { W: 0, U: 0, B: 0, R: 0, G: 0 };
        collection.forEach(card => {
            const manaCost = card.manaCost || '';
            if (manaCost.includes('W')) colorCounts.W += card.quantity;
            if (manaCost.includes('U')) colorCounts.U += card.quantity;
            if (manaCost.includes('B')) colorCounts.B += card.quantity;
            if (manaCost.includes('R')) colorCounts.R += card.quantity;
            if (manaCost.includes('G')) colorCounts.G += card.quantity;
        });

        const colorNames = { W: 'White', U: 'Blue', B: 'Black', R: 'Red', G: 'Green' };
        const topColor = Object.entries(colorCounts).sort(([,a], [,b]) => b - a)[0];
        if (topColor && topColor[1] > 0) {
            insights.push(`You seem to favor ${colorNames[topColor[0]]} cards with ${topColor[1]} cards.`);
        }

        // Collection value insight
        const totalValue = collection.reduce((sum, card) => {
            return sum + (card.prices?.scryfall?.price || card.currentPrice || 0) * card.quantity;
        }, 0);

        if (totalValue > 1000) {
            insights.push(`Your collection is worth over $${Math.floor(totalValue / 100) * 100}! 💰`);
        } else if (totalValue > 100) {
            insights.push(`Your collection has reached $${totalValue.toFixed(0)} in value.`);
        }

        // Growth insight
        const recentCards = collection.filter(card => {
            if (!card.dateAdded) return false;
            const addedDate = new Date(card.dateAdded);
            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            return addedDate > thirtyDaysAgo;
        });

        if (recentCards.length > 10) {
            insights.push(`You've been actively collecting! ${recentCards.length} cards added in the last 30 days.`);
        }

        container.innerHTML = insights.length > 0 ? insights.map(insight => 
            `<div class="insight-item"><i class="fas fa-lightbulb"></i> ${insight}</div>`
        ).join('') : '<div class="insight-item">Start collecting more cards to see insights!</div>';
    }

    recordStatsHistory() {
        const today = new Date().toISOString().split('T')[0];
        const collection = this.app.collection;

        const todayStats = {
            totalCards: collection.reduce((sum, card) => sum + card.quantity, 0),
            uniqueCards: collection.length,
            totalValue: collection.reduce((sum, card) => {
                return sum + (card.prices?.scryfall?.price || card.currentPrice || 0) * card.quantity;
            }, 0)
        };

        this.statsHistory[today] = todayStats;

        // Keep only last 365 days
        const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        Object.keys(this.statsHistory).forEach(date => {
            if (date < oneYearAgo) {
                delete this.statsHistory[date];
            }
        });

        localStorage.setItem('statsHistory', JSON.stringify(this.statsHistory));
    }

    // Wishlist functionality
    showAddToWishlistModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Add Card to Wishlist</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="add-wishlist-form">
                        <div class="form-group">
                            <label>Card Name</label>
                            <input type="text" id="wishlist-card-name" placeholder="Enter card name..." required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Set (optional)</label>
                                <input type="text" id="wishlist-set" placeholder="Set name or code...">
                            </div>
                            <div class="form-group">
                                <label>Priority</label>
                                <select id="wishlist-priority" required>
                                    <option value="medium">Medium Priority</option>
                                    <option value="high">High Priority</option>
                                    <option value="low">Low Priority</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Max Budget</label>
                                <input type="number" id="wishlist-budget" step="0.01" min="0" placeholder="0.00">
                            </div>
                            <div class="form-group">
                                <label>Quantity Wanted</label>
                                <input type="number" id="wishlist-quantity" min="1" value="1" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Notes (optional)</label>
                            <textarea id="wishlist-notes" rows="2" placeholder="Why do you want this card?"></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Add to Wishlist</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('add-wishlist-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addToWishlist();
            modal.remove();
        });
    }

    async addToWishlist() {
        const cardName = document.getElementById('wishlist-card-name').value;
        const setName = document.getElementById('wishlist-set').value;
        const priority = document.getElementById('wishlist-priority').value;
        const budget = parseFloat(document.getElementById('wishlist-budget').value) || 0;
        const quantity = parseInt(document.getElementById('wishlist-quantity').value) || 1;
        const notes = document.getElementById('wishlist-notes').value;

        try {
            // Fetch card data
            const cardData = await this.app.fetchCardData(cardName, setName);
            const currentPrice = parseFloat(cardData.prices?.usd || 0);

            const wishlistItem = {
                id: Date.now(),
                name: cardData.name || cardName,
                set: cardData.set_name || setName,
                setCode: cardData.set || '',
                currentPrice: currentPrice,
                maxBudget: budget,
                priority: priority,
                quantity: quantity,
                imageUrl: cardData.image_uris?.small || '',
                scryfallId: cardData.id || '',
                notes: notes,
                dateAdded: new Date().toISOString(),
                type: cardData.type_line || '',
                manaCost: cardData.mana_cost || '',
                rarity: cardData.rarity || ''
            };

            this.wishlist.unshift(wishlistItem);
            localStorage.setItem('mtgWishlist', JSON.stringify(this.wishlist));
            
            this.updateWishlistStats();
            this.renderWishlist();
            this.app.showNotification(`${cardData.name || cardName} added to wishlist`, 'success');
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            this.app.showNotification('Error adding card to wishlist', 'error');
        }
    }

    renderWishlist() {
        const wishlistGrid = document.getElementById('wishlist-grid');
        if (!wishlistGrid) return;

        this.updateWishlistStats();

        if (this.wishlist.length === 0) {
            wishlistGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-heart" style="font-size: 3rem; color: #E91E63; margin-bottom: 1rem;"></i>
                    <h3>Your wishlist is empty</h3>
                    <p>Add cards you want to acquire to track their prices and availability</p>
                </div>
            `;
            return;
        }

        wishlistGrid.innerHTML = this.wishlist.map(item => `
            <div class="wishlist-item priority-${item.priority}">
                ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" class="wishlist-image">` : ''}
                <div class="wishlist-content">
                    <div class="wishlist-header">
                        <div class="wishlist-name">${item.name}</div>
                        <div class="wishlist-priority priority-${item.priority}">${item.priority.toUpperCase()}</div>
                    </div>
                    <div class="wishlist-details">
                        <div class="wishlist-set">${item.set}</div>
                        <div class="wishlist-type">${item.type}</div>
                        ${item.manaCost ? `<div class="wishlist-mana-cost">${item.manaCost}</div>` : ''}
                    </div>
                    <div class="wishlist-pricing">
                        <div class="current-price">Current: $${item.currentPrice.toFixed(2)}</div>
                        ${item.maxBudget > 0 ? `<div class="max-budget">Budget: $${item.maxBudget.toFixed(2)}</div>` : ''}
                        <div class="quantity-wanted">Want: ${item.quantity}</div>
                    </div>
                    ${item.notes ? `<div class="wishlist-notes">${item.notes}</div>` : ''}
                    <div class="wishlist-actions">
                        <button class="btn btn-small btn-primary" onclick="wishlistAndStats.addWishlistToCollection(${item.id})">
                            <i class="fas fa-plus"></i> Add to Collection
                        </button>
                        <button class="btn btn-small btn-secondary" onclick="wishlistAndStats.editWishlistItem(${item.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-small" style="background: #dc3545;" onclick="wishlistAndStats.removeFromWishlist(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateWishlistStats() {
        const totalCards = this.wishlist.reduce((sum, item) => sum + item.quantity, 0);
        const totalValue = this.wishlist.reduce((sum, item) => sum + (item.currentPrice * item.quantity), 0);
        const priorityCards = this.wishlist.filter(item => item.priority === 'high').length;
        const budgetNeeded = this.wishlist.reduce((sum, item) => {
            const targetPrice = item.maxBudget > 0 ? Math.min(item.maxBudget, item.currentPrice) : item.currentPrice;
            return sum + (targetPrice * item.quantity);
        }, 0);

        document.getElementById('wishlist-total-cards').textContent = totalCards;
        document.getElementById('wishlist-total-value').textContent = `$${totalValue.toFixed(2)}`;
        document.getElementById('wishlist-priority-cards').textContent = priorityCards;
        document.getElementById('wishlist-budget-needed').textContent = `$${budgetNeeded.toFixed(2)}`;
    }

    filterWishlist() {
        const searchTerm = document.getElementById('wishlist-search').value.toLowerCase();
        const priorityFilter = document.getElementById('wishlist-priority-filter').value;
        const budgetFilter = document.getElementById('wishlist-budget-filter').value;

        let filteredWishlist = this.wishlist;

        if (searchTerm) {
            filteredWishlist = filteredWishlist.filter(item => 
                item.name.toLowerCase().includes(searchTerm) ||
                item.set.toLowerCase().includes(searchTerm) ||
                item.type.toLowerCase().includes(searchTerm)
            );
        }

        if (priorityFilter) {
            filteredWishlist = filteredWishlist.filter(item => item.priority === priorityFilter);
        }

        if (budgetFilter) {
            filteredWishlist = filteredWishlist.filter(item => {
                const price = item.currentPrice;
                switch (budgetFilter) {
                    case 'under-5': return price < 5;
                    case '5-20': return price >= 5 && price <= 20;
                    case '20-50': return price >= 20 && price <= 50;
                    case 'over-50': return price > 50;
                    default: return true;
                }
            });
        }

        this.renderFilteredWishlist(filteredWishlist);
    }

    renderFilteredWishlist(items) {
        const wishlistGrid = document.getElementById('wishlist-grid');
        if (!wishlistGrid) return;

        if (items.length === 0) {
            wishlistGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search" style="font-size: 3rem; color: #E91E63; margin-bottom: 1rem;"></i>
                    <h3>No cards match your filters</h3>
                    <p>Try adjusting your search criteria</p>
                </div>
            `;
            return;
        }

        // Use the same rendering logic as renderWishlist but with filtered items
        const originalWishlist = this.wishlist;
        this.wishlist = items;
        this.renderWishlist();
        this.wishlist = originalWishlist;
    }

    clearWishlistFilters() {
        document.getElementById('wishlist-search').value = '';
        document.getElementById('wishlist-priority-filter').value = '';
        document.getElementById('wishlist-budget-filter').value = '';
        this.renderWishlist();
    }

    addWishlistToCollection(wishlistId) {
        const item = this.wishlist.find(w => w.id === wishlistId);
        if (!item) return;

        // Pre-fill the add card modal with wishlist item data
        document.getElementById('card-name').value = item.name;
        document.getElementById('card-set').value = item.set;
        document.getElementById('card-quantity').value = item.quantity;
        
        if (item.imageUrl) {
            this.app.showCardPreview({
                name: item.name,
                set_name: item.set,
                set: item.setCode,
                type_line: item.type,
                mana_cost: item.manaCost,
                prices: { usd: item.currentPrice },
                image_uris: { normal: item.imageUrl }
            });
        }

        this.app.openAddCardModal();
    }

    removeFromWishlist(wishlistId) {
        if (confirm('Remove this card from your wishlist?')) {
            this.wishlist = this.wishlist.filter(w => w.id !== wishlistId);
            localStorage.setItem('mtgWishlist', JSON.stringify(this.wishlist));
            this.renderWishlist();
            this.app.showNotification('Card removed from wishlist', 'success');
        }
    }

    showImportWishlistModal() {
        // Similar to collection import but for wishlist
        this.app.showNotification('Wishlist import feature coming soon!', 'info');
    }
}

// Enhanced styles for wishlist and stats
const wishlistStatsStyles = document.createElement('style');
wishlistStatsStyles.textContent = `
    .enhanced-stats-section {
        margin: 2rem 0;
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border-radius: 20px;
        padding: 2rem;
        border: 1px solid rgba(168, 230, 207, 0.3);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .stats-tabs {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 2rem;
        border-bottom: 2px solid rgba(168, 230, 207, 0.3);
        padding-bottom: 1rem;
    }

    .stats-tab-btn {
        background: transparent;
        border: 2px solid transparent;
        color: var(--charcoal);
        padding: 0.75rem 1.5rem;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 500;
    }

    .stats-tab-btn:hover {
        background: rgba(168, 230, 207, 0.2);
        border-color: var(--primary-green);
    }

    .stats-tab-btn.active {
        background: var(--primary-green);
        color: white;
        border-color: var(--primary-green);
    }

    .stats-tab-content {
        display: none;
    }

    .stats-tab-content.active {
        display: block;
    }

    .overview-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
    }

    .overview-card {
        background: rgba(255, 255, 255, 0.8);
        border-radius: 15px;
        padding: 1.5rem;
        border: 1px solid rgba(168, 230, 207, 0.2);
        display: flex;
        align-items: center;
        gap: 1rem;
        transition: all 0.3s ease;
    }

    .overview-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        border-color: var(--primary-green);
    }

    .overview-icon {
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, var(--primary-green), var(--sage-green));
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.5rem;
    }

    .overview-content h4 {
        margin: 0 0 0.5rem 0;
        color: var(--charcoal);
        font-size: 0.9rem;
        font-weight: 600;
    }

    .completion-bar {
        width: 100%;
        height: 8px;
        background: rgba(168, 230, 207, 0.3);
        border-radius: 4px;
        overflow: hidden;
        margin: 0.5rem 0;
    }

    .completion-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--primary-green), var(--sage-green));
        transition: width 0.3s ease;
    }

    .charts-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
    }

    .chart-container {
        background: rgba(255, 255, 255, 0.8);
        border-radius: 15px;
        padding: 1.5rem;
        border: 1px solid rgba(168, 230, 207, 0.2);
        text-align: center;
    }

    .chart-container h4 {
        margin: 0 0 1rem 0;
        color: var(--primary-green);
        font-weight: 600;
    }

    .breakdown-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 2rem;
    }

    .breakdown-section {
        background: rgba(255, 255, 255, 0.8);
        border-radius: 15px;
        padding: 1.5rem;
        border: 1px solid rgba(168, 230, 207, 0.2);
    }

    .breakdown-section h4 {
        margin: 0 0 1rem 0;
        color: var(--primary-green);
        font-weight: 600;
        border-bottom: 2px solid rgba(168, 230, 207, 0.3);
        padding-bottom: 0.5rem;
    }

    .breakdown-item {
        display: grid;
        grid-template-columns: 1fr 2fr auto;
        gap: 1rem;
        align-items: center;
        margin-bottom: 0.75rem;
        padding: 0.5rem 0;
    }

    .breakdown-label {
        font-size: 0.9rem;
        color: var(--charcoal);
        font-weight: 500;
    }

    .breakdown-bar {
        height: 8px;
        background: rgba(168, 230, 207, 0.3);
        border-radius: 4px;
        overflow: hidden;
    }

    .breakdown-fill {
        height: 100%;
        background: linear-gradient(90deg, var(--primary-green), var(--sage-green));
        transition: width 0.3s ease;
    }

    .breakdown-count {
        font-weight: 600;
        color: var(--primary-green);
        font-size: 0.9rem;
    }

    .trends-container {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 2rem;
    }

    .trend-chart-container {
        background: rgba(255, 255, 255, 0.8);
        border-radius: 15px;
        padding: 1.5rem;
        border: 1px solid rgba(168, 230, 207, 0.2);
    }

    .trends-insights {
        background: rgba(255, 255, 255, 0.8);
        border-radius: 15px;
        padding: 1.5rem;
        border: 1px solid rgba(168, 230, 207, 0.2);
    }

    .trends-insights h4 {
        margin: 0 0 1rem 0;
        color: var(--primary-green);
        font-weight: 600;
    }

    .insight-item {
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        margin-bottom: 1rem;
        padding: 0.75rem;
        background: rgba(168, 230, 207, 0.1);
        border-radius: 8px;
        font-size: 0.9rem;
        line-height: 1.4;
    }

    .insight-item i {
        color: var(--sage-green);
        margin-top: 0.1rem;
    }

    /* Wishlist Styles */
    .wishlist-actions {
        display: flex;
        gap: 1rem;
        justify-content: flex-end;
    }

    .wishlist-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
    }

    .wishlist-filters {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
        padding: 1.5rem;
        background: rgba(255, 255, 255, 0.7);
        backdrop-filter: blur(20px);
        border-radius: 15px;
        border: 1px solid rgba(168, 230, 207, 0.2);
    }

    .wishlist-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
        gap: 2rem;
    }

    .wishlist-item {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border-radius: 15px;
        padding: 1.5rem;
        border: 1px solid rgba(168, 230, 207, 0.2);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
    }

    .wishlist-item::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--soft-mint), var(--primary-green));
    }

    .wishlist-item.priority-high::before {
        background: linear-gradient(90deg, #ff6b6b, #ee5a52);
    }

    .wishlist-item.priority-medium::before {
        background: linear-gradient(90deg, #ffa726, #ff9800);
    }

    .wishlist-item.priority-low::before {
        background: linear-gradient(90deg, #66bb6a, #4caf50);
    }

    .wishlist-item:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
        border-color: var(--primary-green);
    }

    .wishlist-image {
        width: 100%;
        max-width: 150px;
        height: auto;
        border-radius: 8px;
        margin: 0 auto 1rem auto;
        display: block;
    }

    .wishlist-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 1rem;
    }

    .wishlist-name {
        font-weight: 600;
        color: var(--primary-green);
        font-size: 1.1rem;
        line-height: 1.3;
    }

    .wishlist-priority {
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-size: 0.7rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .wishlist-priority.priority-high {
        background: rgba(255, 107, 107, 0.2);
        color: #d32f2f;
    }

    .wishlist-priority.priority-medium {
        background: rgba(255, 167, 38, 0.2);
        color: #f57c00;
    }

    .wishlist-priority.priority-low {
        background: rgba(102, 187, 106, 0.2);
        color: #388e3c;
    }

    .wishlist-details {
        margin-bottom: 1rem;
        font-size: 0.9rem;
        color: var(--sage-green);
    }

    .wishlist-pricing {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
        gap: 0.5rem;
        margin-bottom: 1rem;
        font-size: 0.9rem;
    }

    .current-price {
        font-weight: 600;
        color: var(--charcoal);
    }

    .max-budget {
        color: var(--sage-green);
    }

    .quantity-wanted {
        color: var(--primary-green);
        font-weight: 500;
    }

    .wishlist-notes {
        font-size: 0.8rem;
        color: var(--charcoal);
        font-style: italic;
        background: rgba(168, 230, 207, 0.1);
        padding: 0.5rem;
        border-radius: 6px;
        margin-bottom: 1rem;
    }

    .wishlist-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
        flex-wrap: wrap;
    }

    @media (max-width: 768px) {
        .trends-container {
            grid-template-columns: 1fr;
        }

        .charts-grid {
            grid-template-columns: repeat(2, 1fr);
        }

        .breakdown-grid {
            grid-template-columns: 1fr;
        }

        .overview-grid {
            grid-template-columns: repeat(2, 1fr);
        }

        .wishlist-filters {
            flex-direction: column;
            gap: 1rem;
        }

        .wishlist-grid {
            grid-template-columns: 1fr;
        }

        .wishlist-actions {
            flex-direction: column;
            gap: 0.5rem;
        }

        .stats-tabs {
            flex-wrap: wrap;
            gap: 0.25rem;
        }

        .stats-tab-btn {
            padding: 0.5rem 1rem;
            font-size: 0.9rem;
        }

        .overview-card {
            flex-direction: column;
            text-align: center;
            gap: 0.75rem;
        }

        .overview-icon {
            width: 40px;
            height: 40px;
            font-size: 1.2rem;
        }

        .chart-container canvas {
            max-width: 100%;
            height: auto;
        }

        .breakdown-item {
            grid-template-columns: 1fr;
            gap: 0.5rem;
            text-align: center;
        }

        .breakdown-bar {
            order: 2;
        }

        .breakdown-count {
            order: 3;
        }
    }

    @media (max-width: 480px) {
        .enhanced-stats-section {
            padding: 1rem;
            margin: 1rem 0;
        }

        .charts-grid {
            grid-template-columns: 1fr;
        }

        .overview-grid {
            grid-template-columns: 1fr;
        }

        .wishlist-stats {
            grid-template-columns: repeat(2, 1fr);
        }

        .wishlist-pricing {
            grid-template-columns: 1fr;
            text-align: center;
        }

        .overview-card {
            padding: 1rem;
        }

        .chart-container {
            padding: 1rem;
        }

        .breakdown-section {
            padding: 1rem;
        }
    }
`;

// Initialize global instance
let wishlistAndStats;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for the main app to be initialized
    setTimeout(() => {
        if (window.mtgApp) {
            wishlistAndStats = new WishlistAndStats(window.mtgApp);
        }
    }, 500);
});

// Inject styles
document.head.appendChild(wishlistStatsStyles);
