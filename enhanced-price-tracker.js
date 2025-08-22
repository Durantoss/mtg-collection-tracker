// Enhanced Price Tracking Module for MTG Collection Tracker
// Phase 2: Advanced Features - Enhanced price tracking with better alerts and history

class EnhancedPriceTracker extends PriceTracker {
    constructor(app) {
        super(app);
        this.priceAlerts = JSON.parse(localStorage.getItem('enhancedPriceAlerts')) || [];
        this.alertSettings = JSON.parse(localStorage.getItem('alertSettings')) || {
            enableNotifications: true,
            priceChangeThreshold: 20, // percentage
            valueChangeThreshold: 5, // dollars
            checkInterval: 24 // hours
        };
        this.priceHistoryExtended = JSON.parse(localStorage.getItem('priceHistoryExtended')) || {};
        this.watchlist = JSON.parse(localStorage.getItem('priceWatchlist')) || [];
        
        this.initEnhancedFeatures();
    }

    initEnhancedFeatures() {
        this.setupAdvancedPriceTracking();
        this.setupPriceAlertSystem();
        this.setupPriceHistoryChart();
        this.setupWatchlistFeature();
        this.initNotificationSystem();
    }

    setupAdvancedPriceTracking() {
        // Enhanced price tracking UI
        const pricesTab = document.getElementById('prices');
        const existingOverview = pricesTab.querySelector('.price-overview');
        
        if (existingOverview) {
            existingOverview.innerHTML = `
                <div class="enhanced-price-dashboard">
                    <div class="price-summary-cards">
                        <div class="price-summary-card">
                            <div class="summary-icon">
                                <i class="fas fa-chart-line"></i>
                            </div>
                            <div class="summary-content">
                                <h4>Collection Value</h4>
                                <div class="summary-value" id="total-collection-value">$0.00</div>
                                <div class="summary-change" id="collection-value-change">+$0.00 (0%)</div>
                            </div>
                        </div>
                        
                        <div class="price-summary-card">
                            <div class="summary-icon">
                                <i class="fas fa-bell"></i>
                            </div>
                            <div class="summary-content">
                                <h4>Active Alerts</h4>
                                <div class="summary-value" id="active-alerts-count">0</div>
                                <div class="summary-change">Price Alerts</div>
                            </div>
                        </div>
                        
                        <div class="price-summary-card">
                            <div class="summary-icon">
                                <i class="fas fa-eye"></i>
                            </div>
                            <div class="summary-content">
                                <h4>Watchlist</h4>
                                <div class="summary-value" id="watchlist-count">0</div>
                                <div class="summary-change">Cards Tracked</div>
                            </div>
                        </div>
                        
                        <div class="price-summary-card">
                            <div class="summary-icon">
                                <i class="fas fa-trending-up"></i>
                            </div>
                            <div class="summary-content">
                                <h4>Top Gainer</h4>
                                <div class="summary-value" id="top-gainer-name">-</div>
                                <div class="summary-change" id="top-gainer-change">+0%</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="price-main-content">
                        <div class="price-chart-section">
                            <div class="chart-header">
                                <h3>Collection Value History</h3>
                                <div class="chart-controls">
                                    <button class="chart-period-btn active" data-period="7d">7D</button>
                                    <button class="chart-period-btn" data-period="30d">30D</button>
                                    <button class="chart-period-btn" data-period="90d">90D</button>
                                    <button class="chart-period-btn" data-period="1y">1Y</button>
                                </div>
                            </div>
                            <div class="enhanced-chart-container" id="enhanced-price-chart">
                                <canvas id="price-history-canvas" width="800" height="400"></canvas>
                            </div>
                        </div>
                        
                        <div class="price-alerts-section">
                            <div class="alerts-header">
                                <h3>Price Alerts</h3>
                                <button class="btn btn-primary btn-small" id="create-alert-btn">
                                    <i class="fas fa-plus"></i> Create Alert
                                </button>
                            </div>
                            <div class="alerts-tabs">
                                <button class="alert-tab-btn active" data-tab="recent">Recent</button>
                                <button class="alert-tab-btn" data-tab="active">Active</button>
                                <button class="alert-tab-btn" data-tab="settings">Settings</button>
                            </div>
                            <div class="alerts-content">
                                <div class="alert-tab-content active" id="recent-alerts">
                                    <div class="alert-list" id="recent-alerts-list"></div>
                                </div>
                                <div class="alert-tab-content" id="active-alerts">
                                    <div class="alert-list" id="active-alerts-list"></div>
                                </div>
                                <div class="alert-tab-content" id="alert-settings">
                                    <div class="alert-settings-form">
                                        <div class="setting-group">
                                            <label>
                                                <input type="checkbox" id="enable-notifications" ${this.alertSettings.enableNotifications ? 'checked' : ''}>
                                                Enable browser notifications
                                            </label>
                                        </div>
                                        <div class="setting-group">
                                            <label>Price change threshold (%)</label>
                                            <input type="number" id="price-threshold" value="${this.alertSettings.priceChangeThreshold}" min="1" max="100">
                                        </div>
                                        <div class="setting-group">
                                            <label>Value change threshold ($)</label>
                                            <input type="number" id="value-threshold" value="${this.alertSettings.valueChangeThreshold}" min="0.01" step="0.01">
                                        </div>
                                        <div class="setting-group">
                                            <label>Check interval (hours)</label>
                                            <select id="check-interval">
                                                <option value="1" ${this.alertSettings.checkInterval === 1 ? 'selected' : ''}>1 hour</option>
                                                <option value="6" ${this.alertSettings.checkInterval === 6 ? 'selected' : ''}>6 hours</option>
                                                <option value="12" ${this.alertSettings.checkInterval === 12 ? 'selected' : ''}>12 hours</option>
                                                <option value="24" ${this.alertSettings.checkInterval === 24 ? 'selected' : ''}>24 hours</option>
                                            </select>
                                        </div>
                                        <button class="btn btn-primary" id="save-alert-settings">Save Settings</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="watchlist-section">
                        <div class="watchlist-header">
                            <h3>Price Watchlist</h3>
                            <button class="btn btn-secondary btn-small" id="add-to-watchlist-btn">
                                <i class="fas fa-plus"></i> Add Card
                            </button>
                        </div>
                        <div class="watchlist-grid" id="watchlist-grid"></div>
                    </div>
                </div>
            `;
        }

        this.setupEnhancedEventListeners();
        this.updatePriceSummary();
        this.renderEnhancedPriceChart();
        this.renderPriceAlerts();
        this.renderWatchlist();
    }

    setupEnhancedEventListeners() {
        // Chart period buttons
        document.querySelectorAll('.chart-period-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.chart-period-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.renderEnhancedPriceChart(e.target.dataset.period);
            });
        });

        // Alert tabs
        document.querySelectorAll('.alert-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.alert-tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.alert-tab-content').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                document.getElementById(`${e.target.dataset.tab}-alerts`).classList.add('active');
            });
        });

        // Create alert button
        const createAlertBtn = document.getElementById('create-alert-btn');
        if (createAlertBtn) {
            createAlertBtn.addEventListener('click', () => this.showCreateAlertModal());
        }

        // Save alert settings
        const saveSettingsBtn = document.getElementById('save-alert-settings');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => this.saveAlertSettings());
        }

        // Add to watchlist
        const addWatchlistBtn = document.getElementById('add-to-watchlist-btn');
        if (addWatchlistBtn) {
            addWatchlistBtn.addEventListener('click', () => this.showAddToWatchlistModal());
        }
    }

    async updatePriceSummary() {
        const totalValue = this.calculateTotalCollectionValue();
        const valueChange = this.calculateValueChange();
        const topGainer = this.findTopGainer();

        document.getElementById('total-collection-value').textContent = `$${totalValue.toFixed(2)}`;
        document.getElementById('active-alerts-count').textContent = this.priceAlerts.filter(a => a.active).length;
        document.getElementById('watchlist-count').textContent = this.watchlist.length;

        const changeEl = document.getElementById('collection-value-change');
        if (valueChange.amount !== 0) {
            changeEl.textContent = `${valueChange.amount >= 0 ? '+' : ''}$${valueChange.amount.toFixed(2)} (${valueChange.percent.toFixed(1)}%)`;
            changeEl.className = `summary-change ${valueChange.amount >= 0 ? 'positive' : 'negative'}`;
        }

        if (topGainer) {
            document.getElementById('top-gainer-name').textContent = topGainer.name;
            document.getElementById('top-gainer-change').textContent = `+${topGainer.change.toFixed(1)}%`;
        }
    }

    calculateTotalCollectionValue() {
        return this.app.collection.reduce((total, card) => {
            const price = card.prices?.scryfall?.price || card.currentPrice || 0;
            return total + (price * card.quantity);
        }, 0);
    }

    calculateValueChange() {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        let todayValue = 0;
        let yesterdayValue = 0;

        this.app.collection.forEach(card => {
            const todayPrice = this.priceHistoryExtended[card.id]?.[today] || card.currentPrice || 0;
            const yesterdayPrice = this.priceHistoryExtended[card.id]?.[yesterday] || todayPrice;
            
            todayValue += todayPrice * card.quantity;
            yesterdayValue += yesterdayPrice * card.quantity;
        });

        const amount = todayValue - yesterdayValue;
        const percent = yesterdayValue > 0 ? (amount / yesterdayValue) * 100 : 0;

        return { amount, percent };
    }

    findTopGainer() {
        let topGainer = null;
        let maxChange = 0;

        this.app.collection.forEach(card => {
            const currentPrice = card.prices?.scryfall?.price || card.currentPrice || 0;
            const previousPrice = this.getPreviousPrice(card.id);
            
            if (previousPrice > 0) {
                const change = ((currentPrice - previousPrice) / previousPrice) * 100;
                if (change > maxChange) {
                    maxChange = change;
                    topGainer = { name: card.name, change };
                }
            }
        });

        return topGainer;
    }

    getPreviousPrice(cardId) {
        const history = this.priceHistoryExtended[cardId];
        if (!history) return 0;

        const dates = Object.keys(history).sort().reverse();
        return dates.length > 1 ? history[dates[1]] : 0;
    }

    renderEnhancedPriceChart(period = '30d') {
        const canvas = document.getElementById('price-history-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const valueHistory = this.getValueHistoryForPeriod(period);
        
        if (Object.keys(valueHistory).length < 2) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Insufficient data for chart', canvas.width / 2, canvas.height / 2);
            return;
        }

        this.drawAdvancedChart(ctx, valueHistory, canvas.width, canvas.height);
    }

    getValueHistoryForPeriod(period) {
        const now = new Date();
        let startDate;

        switch (period) {
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case '1y':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        const startDateStr = startDate.toISOString().split('T')[0];
        const allHistory = this.calculateCollectionValueHistory();
        
        const filteredHistory = {};
        Object.keys(allHistory).forEach(date => {
            if (date >= startDateStr) {
                filteredHistory[date] = allHistory[date];
            }
        });

        return filteredHistory;
    }

    drawAdvancedChart(ctx, valueHistory, width, height) {
        const padding = 60;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        const dates = Object.keys(valueHistory).sort();
        const values = dates.map(date => valueHistory[date]);
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);
        const valueRange = maxValue - minValue || 1;

        // Draw grid lines
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        
        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        // Vertical grid lines
        const gridPoints = Math.min(dates.length, 10);
        for (let i = 0; i <= gridPoints; i++) {
            const x = padding + (chartWidth / gridPoints) * i;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding);
            ctx.stroke();
        }

        // Draw price line
        ctx.strokeStyle = '#66BB6A';
        ctx.lineWidth = 3;
        ctx.beginPath();

        dates.forEach((date, index) => {
            const x = padding + (chartWidth / (dates.length - 1)) * index;
            const y = height - padding - ((values[index] - minValue) / valueRange) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw data points
        ctx.fillStyle = '#66BB6A';
        dates.forEach((date, index) => {
            const x = padding + (chartWidth / (dates.length - 1)) * index;
            const y = height - padding - ((values[index] - minValue) / valueRange) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });

        // Draw labels
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';

        // Y-axis labels (values)
        for (let i = 0; i <= 5; i++) {
            const value = minValue + (valueRange / 5) * (5 - i);
            const y = padding + (chartHeight / 5) * i;
            ctx.textAlign = 'right';
            ctx.fillText(`$${value.toFixed(0)}`, padding - 10, y + 4);
        }

        // X-axis labels (dates)
        const labelStep = Math.ceil(dates.length / 6);
        dates.forEach((date, index) => {
            if (index % labelStep === 0) {
                const x = padding + (chartWidth / (dates.length - 1)) * index;
                ctx.textAlign = 'center';
                ctx.fillText(new Date(date).toLocaleDateString(), x, height - padding + 20);
            }
        });
    }

    showCreateAlertModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Create Price Alert</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="create-alert-form">
                        <div class="form-group">
                            <label>Select Card</label>
                            <select id="alert-card-select" required>
                                <option value="">Choose a card from your collection...</option>
                                ${this.app.collection.map(card => 
                                    `<option value="${card.id}">${card.name} (${card.set})</option>`
                                ).join('')}
                            </select>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Alert Type</label>
                                <select id="alert-type" required>
                                    <option value="above">Price goes above</option>
                                    <option value="below">Price goes below</option>
                                    <option value="change">Price changes by</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>Target Value</label>
                                <input type="number" id="alert-value" step="0.01" min="0" required>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="alert-email" checked>
                                Send email notification (if available)
                            </label>
                        </div>
                        <div class="form-group">
                            <label>Notes (optional)</label>
                            <textarea id="alert-notes" rows="2" placeholder="Add any notes about this alert..."></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Create Alert</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle form submission
        document.getElementById('create-alert-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.createPriceAlert();
            modal.remove();
        });

        // Update target value placeholder based on selected card
        document.getElementById('alert-card-select').addEventListener('change', (e) => {
            const cardId = parseInt(e.target.value);
            const card = this.app.collection.find(c => c.id === cardId);
            if (card) {
                const currentPrice = card.prices?.scryfall?.price || card.currentPrice || 0;
                document.getElementById('alert-value').placeholder = `Current: $${currentPrice.toFixed(2)}`;
            }
        });
    }

    createPriceAlert() {
        const cardId = parseInt(document.getElementById('alert-card-select').value);
        const alertType = document.getElementById('alert-type').value;
        const targetValue = parseFloat(document.getElementById('alert-value').value);
        const emailNotification = document.getElementById('alert-email').checked;
        const notes = document.getElementById('alert-notes').value;

        const card = this.app.collection.find(c => c.id === cardId);
        if (!card) return;

        const alert = {
            id: Date.now(),
            cardId: cardId,
            cardName: card.name,
            cardSet: card.set,
            alertType: alertType,
            targetValue: targetValue,
            currentPrice: card.prices?.scryfall?.price || card.currentPrice || 0,
            emailNotification: emailNotification,
            notes: notes,
            active: true,
            created: new Date().toISOString(),
            triggered: false
        };

        this.priceAlerts.unshift(alert);
        localStorage.setItem('enhancedPriceAlerts', JSON.stringify(this.priceAlerts));
        
        this.renderPriceAlerts();
        this.updatePriceSummary();
        this.app.showNotification(`Price alert created for ${card.name}`, 'success');
    }

    renderPriceAlerts() {
        const recentAlerts = this.priceAlerts.slice(0, 10);
        const activeAlerts = this.priceAlerts.filter(a => a.active && !a.triggered);

        // Render recent alerts
        const recentList = document.getElementById('recent-alerts-list');
        if (recentList) {
            recentList.innerHTML = recentAlerts.length > 0 ? recentAlerts.map(alert => `
                <div class="enhanced-alert-item ${alert.triggered ? 'triggered' : ''} ${!alert.active ? 'inactive' : ''}">
                    <div class="alert-card-info">
                        <div class="alert-card-name">${alert.cardName}</div>
                        <div class="alert-card-set">${alert.cardSet}</div>
                    </div>
                    <div class="alert-condition">
                        <div class="alert-type">${this.formatAlertType(alert)}</div>
                        <div class="alert-status ${alert.triggered ? 'triggered' : 'waiting'}">${alert.triggered ? 'Triggered' : 'Active'}</div>
                    </div>
                    <div class="alert-actions">
                        <button class="btn btn-small btn-secondary" onclick="enhancedPriceTracker.toggleAlert(${alert.id})">
                            ${alert.active ? 'Disable' : 'Enable'}
                        </button>
                        <button class="btn btn-small" style="background: #dc3545;" onclick="enhancedPriceTracker.deleteAlert(${alert.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('') : '<div class="empty-state">No price alerts yet</div>';
        }

        // Render active alerts
        const activeList = document.getElementById('active-alerts-list');
        if (activeList) {
            activeList.innerHTML = activeAlerts.length > 0 ? activeAlerts.map(alert => `
                <div class="enhanced-alert-item">
                    <div class="alert-card-info">
                        <div class="alert-card-name">${alert.cardName}</div>
                        <div class="alert-card-set">${alert.cardSet}</div>
                        <div class="alert-current-price">Current: $${alert.currentPrice.toFixed(2)}</div>
                    </div>
                    <div class="alert-condition">
                        <div class="alert-type">${this.formatAlertType(alert)}</div>
                        <div class="alert-progress">
                            ${this.calculateAlertProgress(alert)}
                        </div>
                    </div>
                    <div class="alert-actions">
                        <button class="btn btn-small btn-secondary" onclick="enhancedPriceTracker.editAlert(${alert.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-small" style="background: #dc3545;" onclick="enhancedPriceTracker.deleteAlert(${alert.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('') : '<div class="empty-state">No active alerts</div>';
        }
    }

    formatAlertType(alert) {
        switch (alert.alertType) {
            case 'above':
                return `When price > $${alert.targetValue.toFixed(2)}`;
            case 'below':
                return `When price < $${alert.targetValue.toFixed(2)}`;
            case 'change':
                return `When price changes by ${alert.targetValue}%`;
            default:
                return 'Unknown alert type';
        }
    }

    calculateAlertProgress(alert) {
        const current = alert.currentPrice;
        const target = alert.targetValue;
        
        switch (alert.alertType) {
            case 'above':
                const progressAbove = (current / target) * 100;
                return `${Math.min(progressAbove, 100).toFixed(1)}% to target`;
            case 'below':
                const progressBelow = ((target - current) / target) * 100;
                return `${Math.max(progressBelow, 0).toFixed(1)}% below target`;
            case 'change':
                return 'Monitoring for changes';
            default:
                return '';
        }
    }

    toggleAlert(alertId) {
        const alert = this.priceAlerts.find(a => a.id === alertId);
        if (alert) {
            alert.active = !alert.active;
            localStorage.setItem('enhancedPriceAlerts', JSON.stringify(this.priceAlerts));
            this.renderPriceAlerts();
            this.updatePriceSummary();
        }
    }

    deleteAlert(alertId) {
        if (confirm('Are you sure you want to delete this price alert?')) {
            this.priceAlerts = this.priceAlerts.filter(a => a.id !== alertId);
            localStorage.setItem('enhancedPriceAlerts', JSON.stringify(this.priceAlerts));
            this.renderPriceAlerts();
            this.updatePriceSummary();
            this.app.showNotification('Price alert deleted', 'success');
        }
    }

    saveAlertSettings() {
        this.alertSettings = {
            enableNotifications: document.getElementById('enable-notifications').checked,
            priceChangeThreshold: parseFloat(document.getElementById('price-threshold').value),
            valueChangeThreshold: parseFloat(document.getElementById('value-threshold').value),
            checkInterval: parseInt(document.getElementById('check-interval').value)
        };

        localStorage.setItem('alertSettings', JSON.stringify(this.alertSettings));
        this.app.showNotification('Alert settings saved', 'success');

        // Request notification permission if enabled
        if (this.alertSettings.enableNotifications && 'Notification' in window) {
            Notification.requestPermission();
        }
    }

    initNotificationSystem() {
        // Request notification permission if enabled
        if (this.alertSettings.enableNotifications && 'Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }

    showNotification(title, message, icon = null) {
        if (!this.alertSettings.enableNotifications || !('Notification' in window) || Notification.permission !== 'granted') {
            return;
        }

        const notification = new Notification(title, {
            body: message,
            icon: icon || '/icons/icon-192x192.png',
            badge: '/icons/icon-96x96.png',
            tag: 'mtg-price-alert'
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };

        // Auto close after 5 seconds
        setTimeout(() => notification.close(), 5000);
    }

    // Enhanced price update with alert checking
    async updateAllPrices() {
        await super.updateAllPrices();
        this.checkPriceAlerts();
        this.updatePriceSummary();
    }

    checkPriceAlerts() {
        const triggeredAlerts = [];

        this.priceAlerts.forEach(alert => {
            if (!alert.active || alert.triggered) return;

            const card = this.app.collection.find(c => c.id === alert.cardId);
            if (!card) return;

            const currentPrice = card.prices?.scryfall?.price || card.currentPrice || 0;
            let shouldTrigger = false;

            switch (alert.alertType) {
                case 'above':
                    shouldTrigger = currentPrice >= alert.targetValue;
                    break;
                case 'below':
                    shouldTrigger = currentPrice <= alert.targetValue;
                    break;
                case 'change':
                    const changePercent = Math.abs((currentPrice - alert.currentPrice) / alert.currentPrice) * 100;
                    shouldTrigger = changePercent >= alert.targetValue;
                    break;
            }

            if (shouldTrigger) {
                alert.triggered = true;
                alert.triggeredAt = new Date().toISOString();
                triggeredAlerts.push(alert);

                // Show notification
                this.showNotification(
                    'MTG Price Alert',
                    `${alert.cardName} has ${alert.alertType === 'above' ? 'exceeded' : alert.alertType === 'below' ? 'dropped below' : 'changed by'} your target ${alert.alertType === 'change' ? 'percentage' : 'price'}!`
                );
            }

            // Update current price for next check
            alert.currentPrice = currentPrice;
        });

        if (triggeredAlerts.length > 0) {
            localStorage.setItem('enhancedPriceAlerts', JSON.stringify(this.priceAlerts));
            this.renderPriceAlerts();
        }
    }

    setupWatchlistFeature() {
        // Watchlist functionality will be implemented here
    }

    showAddToWatchlistModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Add Card to Watchlist</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="add-watchlist-form">
                        <div class="form-group">
                            <label>Card Name</label>
                            <input type="text" id="watchlist-card-name" placeholder="Enter card name..." required>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label>Set (optional)</label>
                                <input type="text" id="watchlist-set" placeholder="Set name or code...">
                            </div>
                            <div class="form-group">
                                <label>Target Price</label>
                                <input type="number" id="watchlist-target-price" step="0.01" min="0" placeholder="0.00">
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Notes (optional)</label>
                            <textarea id="watchlist-notes" rows="2" placeholder="Why are you watching this card?"></textarea>
                        </div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
                            <button type="submit" class="btn btn-primary">Add to Watchlist</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('add-watchlist-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addToWatchlist();
            modal.remove();
        });
    }

    async addToWatchlist() {
        const cardName = document.getElementById('watchlist-card-name').value;
        const setName = document.getElementById('watchlist-set').value;
        const targetPrice = parseFloat(document.getElementById('watchlist-target-price').value) || 0;
        const notes = document.getElementById('watchlist-notes').value;

        try {
            // Fetch card data
            const cardData = await this.app.fetchCardData(cardName, setName);
            const currentPrice = parseFloat(cardData.prices?.usd || 0);

            const watchlistItem = {
                id: Date.now(),
                name: cardData.name || cardName,
                set: cardData.set_name || setName,
                setCode: cardData.set || '',
                currentPrice: currentPrice,
                targetPrice: targetPrice,
                imageUrl: cardData.image_uris?.small || '',
                scryfallId: cardData.id || '',
                notes: notes,
                dateAdded: new Date().toISOString(),
                priceHistory: { [new Date().toISOString().split('T')[0]]: currentPrice }
            };

            this.watchlist.unshift(watchlistItem);
            localStorage.setItem('priceWatchlist', JSON.stringify(this.watchlist));
            
            this.renderWatchlist();
            this.updatePriceSummary();
            this.app.showNotification(`${cardData.name || cardName} added to watchlist`, 'success');
        } catch (error) {
            console.error('Error adding to watchlist:', error);
            this.app.showNotification('Error adding card to watchlist', 'error');
        }
    }

    renderWatchlist() {
        const watchlistGrid = document.getElementById('watchlist-grid');
        if (!watchlistGrid) return;

        if (this.watchlist.length === 0) {
            watchlistGrid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-eye" style="font-size: 3rem; color: #66BB6A; margin-bottom: 1rem;"></i>
                    <h3>No cards in watchlist</h3>
                    <p>Add cards you're interested in to track their prices</p>
                </div>
            `;
            return;
        }

        watchlistGrid.innerHTML = this.watchlist.map(item => `
            <div class="watchlist-item">
                ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" class="watchlist-image">` : ''}
                <div class="watchlist-content">
                    <div class="watchlist-header">
                        <div class="watchlist-name">${item.name}</div>
                        <div class="watchlist-set">${item.set}</div>
                    </div>
                    <div class="watchlist-prices">
                        <div class="current-price">Current: $${item.currentPrice.toFixed(2)}</div>
                        ${item.targetPrice > 0 ? `<div class="target-price">Target: $${item.targetPrice.toFixed(2)}</div>` : ''}
                    </div>
                    ${item.notes ? `<div class="watchlist-notes">${item.notes}</div>` : ''}
                    <div class="watchlist-actions">
                        <button class="btn btn-small btn-primary" onclick="enhancedPriceTracker.addWatchlistToCollection(${item.id})">
                            <i class="fas fa-plus"></i> Add to Collection
                        </button>
                        <button class="btn btn-small" style="background: #dc3545;" onclick="enhancedPriceTracker.removeFromWatchlist(${item.id})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    addWatchlistToCollection(watchlistId) {
        const item = this.watchlist.find(w => w.id === watchlistId);
        if (!item) return;

        // Pre-fill the add card modal with watchlist item data
        document.getElementById('card-name').value = item.name;
        document.getElementById('card-set').value = item.set;
        
        if (item.imageUrl) {
            this.app.showCardPreview({
                name: item.name,
                set_name: item.set,
                set: item.setCode,
                prices: { usd: item.currentPrice },
                image_uris: { normal: item.imageUrl }
            });
        }

        this.app.openAddCardModal();
    }

    removeFromWatchlist(watchlistId) {
        if (confirm('Remove this card from your watchlist?')) {
            this.watchlist = this.watchlist.filter(w => w.id !== watchlistId);
            localStorage.setItem('priceWatchlist', JSON.stringify(this.watchlist));
            this.renderWatchlist();
            this.updatePriceSummary();
            this.app.showNotification('Card removed from watchlist', 'success');
        }
    }

    setupPriceHistoryChart() {
        // Enhanced price history functionality
        this.recordExtendedPriceHistory();
    }

    recordExtendedPriceHistory() {
        const today = new Date().toISOString().split('T')[0];
        
        this.app.collection.forEach(card => {
            const currentPrice = card.prices?.scryfall?.price || card.currentPrice || 0;
            
            if (!this.priceHistoryExtended[card.id]) {
                this.priceHistoryExtended[card.id] = {};
            }
            
            this.priceHistoryExtended[card.id][today] = currentPrice;
        });

        // Clean up old data (keep 1 year)
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const cutoffDate = oneYearAgo.toISOString().split('T')[0];

        Object.keys(this.priceHistoryExtended).forEach(cardId => {
            Object.keys(this.priceHistoryExtended[cardId]).forEach(date => {
                if (date < cutoffDate) {
                    delete this.priceHistoryExtended[cardId][date];
                }
            });
        });

        localStorage.setItem('priceHistoryExtended', JSON.stringify(this.priceHistoryExtended));
    }
}

// Enhanced styles for the new price tracking features
const enhancedPriceStyles = document.createElement('style');
enhancedPriceStyles.textContent = `
    .enhanced-price-dashboard {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    .price-summary-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
    }

    .price-summary-card {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(20px);
        border-radius: 15px;
        padding: 1.5rem;
        border: 1px solid rgba(168, 230, 207, 0.2);
        display: flex;
        align-items: center;
        gap: 1rem;
        transition: all 0.3s ease;
    }

    .price-summary-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
        border-color: var(--primary-green);
    }

    .summary-icon {
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

    .summary-content h4 {
        margin: 0 0 0.5rem 0;
        color: var(--charcoal);
        font-size: 0.9rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .summary-value {
        font-size: 1.8rem;
        font-weight: 800;
        color: var(--primary-green);
        margin-bottom: 0.25rem;
    }

    .summary-change {
        font-size: 0.8rem;
        color: var(--sage-green);
    }

    .summary-change.positive {
        color: #4CAF50;
    }

    .summary-change.negative {
        color: #f44336;
    }

    .price-main-content {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 2rem;
    }

    .price-chart-section,
    .price-alerts-section {
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(20px);
        border-radius: 20px;
        padding: 2rem;
        border: 1px solid rgba(168, 230, 207, 0.2);
    }

    .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }

    .chart-header h3 {
        color: var(--primary-green);
        margin: 0;
        font-size: 1.3rem;
        font-weight: 700;
    }

    .chart-controls {
        display: flex;
        gap: 0.5rem;
    }

    .chart-period-btn {
        background: transparent;
        border: 2px solid rgba(168, 230, 207, 0.3);
        color: var(--charcoal);
        padding: 0.5rem 1rem;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.9rem;
        font-weight: 500;
    }

    .chart-period-btn:hover {
        border-color: var(--primary-green);
        background: rgba(168, 230, 207, 0.1);
    }

    .chart-period-btn.active {
        background: var(--primary-green);
        color: white;
        border-color: var(--primary-green);
    }

    .enhanced-chart-container {
        margin-top: 1rem;
        border-radius: 10px;
        overflow: hidden;
        background: #f8f9fa;
    }

    .alerts-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }

    .alerts-header h3 {
        color: var(--primary-green);
        margin: 0;
        font-size: 1.3rem;
        font-weight: 700;
    }

    .alerts-tabs {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
        border-bottom: 2px solid rgba(168, 230, 207, 0.2);
        padding-bottom: 1rem;
    }

    .alert-tab-btn {
        background: transparent;
        border: none;
        color: var(--charcoal);
        padding: 0.5rem 1rem;
        border-radius: 15px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.9rem;
        font-weight: 500;
    }

    .alert-tab-btn:hover {
        background: rgba(168, 230, 207, 0.2);
    }

    .alert-tab-btn.active {
        background: var(--primary-green);
        color: white;
    }

    .alert-tab-content {
        display: none;
    }

    .alert-tab-content.active {
        display: block;
    }

    .enhanced-alert-item {
        background: rgba(255, 255, 255, 0.7);
        border-radius: 10px;
        padding: 1rem;
        margin-bottom: 1rem;
        border: 1px solid rgba(168, 230, 207, 0.2);
        display: flex;
        justify-content: space-between;
        align-items: center;
        transition: all 0.3s ease;
    }

    .enhanced-alert-item:hover {
        border-color: var(--primary-green);
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    }

    .enhanced-alert-item.triggered {
        border-color: #4CAF50;
        background: rgba(76, 175, 80, 0.1);
    }

    .enhanced-alert-item.inactive {
        opacity: 0.6;
        border-color: #ccc;
    }

    .alert-card-info {
        flex: 1;
    }

    .alert-card-name {
        font-weight: 600;
        color: var(--primary-green);
        margin-bottom: 0.25rem;
    }

    .alert-card-set {
        font-size: 0.8rem;
        color: var(--sage-green);
    }

    .alert-current-price {
        font-size: 0.8rem;
        color: var(--charcoal);
        margin-top: 0.25rem;
    }

    .alert-condition {
        flex: 1;
        text-align: center;
    }

    .alert-type {
        font-size: 0.9rem;
        color: var(--charcoal);
        margin-bottom: 0.25rem;
    }

    .alert-status {
        font-size: 0.8rem;
        padding: 0.25rem 0.75rem;
        border-radius: 12px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }

    .alert-status.waiting {
        background: rgba(255, 193, 7, 0.2);
        color: #f57c00;
    }

    .alert-status.triggered {
        background: rgba(76, 175, 80, 0.2);
        color: #388e3c;
    }

    .alert-progress {
        font-size: 0.8rem;
        color: var(--sage-green);
    }

    .alert-actions {
        display: flex;
        gap: 0.5rem;
    }

    .alert-settings-form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .setting-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .setting-group label {
        font-weight: 500;
        color: var(--charcoal);
    }

    .setting-group input,
    .setting-group select {
        padding: 0.75rem;
        border: 2px solid rgba(168, 230, 207, 0.3);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.9);
        color: var(--charcoal);
    }

    .setting-group input:focus,
    .setting-group select:focus {
        outline: none;
        border-color: var(--primary-green);
    }

    .watchlist-section {
        margin-top: 2rem;
        background: rgba(255, 255, 255, 0.9);
        backdrop-filter: blur(20px);
        border-radius: 20px;
        padding: 2rem;
        border: 1px solid rgba(168, 230, 207, 0.2);
    }

    .watchlist-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
    }

    .watchlist-header h3 {
        color: var(--primary-green);
        margin: 0;
        font-size: 1.3rem;
        font-weight: 700;
    }

    .watchlist-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
    }

    .watchlist-item {
        background: rgba(255, 255, 255, 0.8);
        border-radius: 15px;
        padding: 1.5rem;
        border: 1px solid rgba(168, 230, 207, 0.2);
        transition: all 0.3s ease;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .watchlist-item:hover {
        border-color: var(--primary-green);
        transform: translateY(-5px);
        box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
    }

    .watchlist-image {
        width: 100%;
        max-width: 150px;
        height: auto;
        border-radius: 8px;
        margin: 0 auto;
    }

    .watchlist-name {
        font-weight: 600;
        color: var(--primary-green);
        font-size: 1.1rem;
    }

    .watchlist-set {
        font-size: 0.9rem;
        color: var(--sage-green);
        margin-bottom: 0.5rem;
    }

    .watchlist-prices {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 0.5rem 0;
    }

    .current-price {
        font-weight: 600;
        color: var(--charcoal);
    }

    .target-price {
        font-size: 0.9rem;
        color: var(--sage-green);
    }

    .watchlist-notes {
        font-size: 0.9rem;
        color: var(--charcoal);
        font-style: italic;
        background: rgba(168, 230, 207, 0.1);
        padding: 0.5rem;
        border-radius: 8px;
    }

    .watchlist-actions {
        display: flex;
        gap: 0.5rem;
        justify-content: center;
    }

    @media (max-width: 768px) {
        .price-main-content {
            grid-template-columns: 1fr;
        }

        .price-summary-cards {
            grid-template-columns: repeat(2, 1fr);
        }

        .chart-controls {
            flex-wrap: wrap;
        }

        .enhanced-alert-item {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
        }

        .alert-actions {
            width: 100%;
            justify-content: center;
        }

        .watchlist-grid {
            grid-template-columns: 1fr;
        }
    }

    @media (max-width: 480px) {
        .price-summary-cards {
            grid-template-columns: 1fr;
        }

        .chart-period-btn {
            padding: 0.4rem 0.8rem;
            font-size: 0.8rem;
        }

        .alert-tab-btn {
            padding: 0.4rem 0.8rem;
            font-size: 0.8rem;
        }
    }
`;
document.head.appendChild(enhancedPriceStyles);

// Export for use in main app
window.EnhancedPriceTracker = EnhancedPriceTracker;
