// Price Tracking Module for MTG Collection Tracker

class PriceTracker {
    constructor(app) {
        this.app = app;
        this.priceHistory = JSON.parse(localStorage.getItem('priceHistory')) || {};
        this.priceAlerts = JSON.parse(localStorage.getItem('priceAlerts')) || [];
        this.lastUpdate = localStorage.getItem('lastPriceUpdate') || null;
        this.updateInterval = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        
        this.init();
    }

    init() {
        this.setupPriceTracking();
        this.renderPriceChart();
        this.renderPriceAlerts();
        this.checkForPriceUpdates();
    }

    setupPriceTracking() {
        // Add price update button to the prices tab
        const pricesTab = document.getElementById('prices');
        const tabHeader = pricesTab.querySelector('.tab-header');
        
        if (!tabHeader.querySelector('.update-prices-btn')) {
            const updateButton = document.createElement('button');
            updateButton.className = 'btn btn-primary update-prices-btn';
            updateButton.innerHTML = '<i class="fas fa-sync-alt"></i> Update Prices';
            updateButton.addEventListener('click', () => this.updateAllPrices());
            tabHeader.appendChild(updateButton);
        }
    }

    async updateAllPrices() {
        if (this.app.collection.length === 0) {
            this.app.showNotification('No cards in collection to update', 'warning');
            return;
        }

        const updateButton = document.querySelector('.update-prices-btn');
        const originalText = updateButton.innerHTML;
        updateButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
        updateButton.disabled = true;

        try {
            let updatedCount = 0;
            const totalCards = this.app.collection.length;

            for (let i = 0; i < this.app.collection.length; i++) {
                const card = this.app.collection[i];
                
                try {
                    // Add delay to respect API rate limits
                    if (i > 0) {
                        await new Promise(resolve => setTimeout(resolve, 100));
                    }

                    const cardData = await this.fetchCardPrice(card.scryfallId || card.name);
                    const newPrice = parseFloat(cardData.prices?.usd || 0);
                    const oldPrice = parseFloat(card.currentPrice || 0);

                    // Update price history
                    this.recordPriceHistory(card.id, newPrice);

                    // Check for price alerts
                    this.checkPriceAlert(card, oldPrice, newPrice);

                    // Update card price
                    card.currentPrice = newPrice;
                    updatedCount++;

                    // Update progress
                    updateButton.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Updating... ${updatedCount}/${totalCards}`;

                } catch (error) {
                    console.error(`Error updating price for ${card.name}:`, error);
                }
            }

            // Save updated collection
            this.app.saveCollection();
            this.app.updateCollectionStats();
            this.app.renderCollection();

            // Update last update time
            localStorage.setItem('lastPriceUpdate', new Date().toISOString());
            this.lastUpdate = new Date().toISOString();

            // Re-render price components
            this.renderPriceChart();
            this.renderPriceAlerts();

            this.app.showNotification(`Updated prices for ${updatedCount} cards`, 'success');

        } catch (error) {
            console.error('Error updating prices:', error);
            this.app.showNotification('Error updating prices', 'error');
        } finally {
            updateButton.innerHTML = originalText;
            updateButton.disabled = false;
        }
    }

    async fetchCardPrice(scryfallIdOrName) {
        try {
            let url;
            if (scryfallIdOrName.length === 36 && scryfallIdOrName.includes('-')) {
                // It's a Scryfall ID
                url = `https://api.scryfall.com/cards/${scryfallIdOrName}`;
            } else {
                // It's a card name
                url = `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(scryfallIdOrName)}`;
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Card not found');
            }

            return await response.json();
        } catch (error) {
            console.error('Error fetching card price:', error);
            return { prices: { usd: '0' } };
        }
    }

    recordPriceHistory(cardId, price) {
        const today = new Date().toISOString().split('T')[0];
        
        if (!this.priceHistory[cardId]) {
            this.priceHistory[cardId] = {};
        }

        this.priceHistory[cardId][today] = price;

        // Keep only last 30 days of history
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];

        Object.keys(this.priceHistory[cardId]).forEach(date => {
            if (date < cutoffDate) {
                delete this.priceHistory[cardId][date];
            }
        });

        localStorage.setItem('priceHistory', JSON.stringify(this.priceHistory));
    }

    checkPriceAlert(card, oldPrice, newPrice) {
        const priceChange = newPrice - oldPrice;
        const percentChange = oldPrice > 0 ? (priceChange / oldPrice) * 100 : 0;

        // Create alert for significant price changes (>20% or >$5)
        if (Math.abs(percentChange) > 20 || Math.abs(priceChange) > 5) {
            const alert = {
                id: Date.now(),
                cardId: card.id,
                cardName: card.name,
                oldPrice: oldPrice,
                newPrice: newPrice,
                change: priceChange,
                percentChange: percentChange,
                date: new Date().toISOString(),
                type: priceChange > 0 ? 'increase' : 'decrease'
            };

            this.priceAlerts.unshift(alert);
            
            // Keep only last 50 alerts
            if (this.priceAlerts.length > 50) {
                this.priceAlerts = this.priceAlerts.slice(0, 50);
            }

            localStorage.setItem('priceAlerts', JSON.stringify(this.priceAlerts));
        }
    }

    checkForPriceUpdates() {
        if (!this.lastUpdate) return;

        const lastUpdateTime = new Date(this.lastUpdate);
        const now = new Date();
        const timeSinceUpdate = now - lastUpdateTime;

        if (timeSinceUpdate > this.updateInterval) {
            // Show notification suggesting price update
            const daysSinceUpdate = Math.floor(timeSinceUpdate / (24 * 60 * 60 * 1000));
            this.app.showNotification(`Prices haven't been updated in ${daysSinceUpdate} days. Consider updating them.`, 'info');
        }
    }

    renderPriceChart() {
        const chartContainer = document.querySelector('.chart-placeholder');
        
        if (this.app.collection.length === 0) {
            chartContainer.innerHTML = '<p>Add cards to your collection to see price trends</p>';
            return;
        }

        // Calculate collection value over time
        const valueHistory = this.calculateCollectionValueHistory();
        
        if (Object.keys(valueHistory).length < 2) {
            chartContainer.innerHTML = '<p>Price history will appear after updating prices over time</p>';
            return;
        }

        // Create simple ASCII chart
        const dates = Object.keys(valueHistory).sort();
        const values = dates.map(date => valueHistory[date]);
        const maxValue = Math.max(...values);
        const minValue = Math.min(...values);
        const range = maxValue - minValue;

        let chartHTML = '<div class="price-chart-container">';
        chartHTML += '<div class="chart-header">';
        chartHTML += `<span>Collection Value: $${values[values.length - 1].toFixed(2)}</span>`;
        
        const change = values.length > 1 ? values[values.length - 1] - values[values.length - 2] : 0;
        const changePercent = values.length > 1 && values[values.length - 2] > 0 ? 
            (change / values[values.length - 2]) * 100 : 0;
        
        chartHTML += `<span class="price-change ${change >= 0 ? 'positive' : 'negative'}">`;
        chartHTML += `${change >= 0 ? '+' : ''}$${change.toFixed(2)} (${changePercent.toFixed(1)}%)`;
        chartHTML += '</span>';
        chartHTML += '</div>';

        // Simple bar chart
        chartHTML += '<div class="chart-bars">';
        dates.forEach((date, index) => {
            const value = values[index];
            const height = range > 0 ? ((value - minValue) / range) * 100 : 50;
            const formattedDate = new Date(date).toLocaleDateString();
            
            chartHTML += `<div class="chart-bar" style="height: ${height}%" title="${formattedDate}: $${value.toFixed(2)}"></div>`;
        });
        chartHTML += '</div>';

        chartHTML += '<div class="chart-labels">';
        chartHTML += `<span>${new Date(dates[0]).toLocaleDateString()}</span>`;
        chartHTML += `<span>${new Date(dates[dates.length - 1]).toLocaleDateString()}</span>`;
        chartHTML += '</div>';

        chartHTML += '</div>';

        chartContainer.innerHTML = chartHTML;
    }

    calculateCollectionValueHistory() {
        const valueHistory = {};

        // Get all unique dates from price history
        const allDates = new Set();
        Object.values(this.priceHistory).forEach(cardHistory => {
            Object.keys(cardHistory).forEach(date => allDates.add(date));
        });

        // Calculate collection value for each date
        allDates.forEach(date => {
            let totalValue = 0;
            
            this.app.collection.forEach(card => {
                const cardHistory = this.priceHistory[card.id];
                if (cardHistory) {
                    // Find the most recent price on or before this date
                    const availableDates = Object.keys(cardHistory)
                        .filter(d => d <= date)
                        .sort();
                    
                    if (availableDates.length > 0) {
                        const latestDate = availableDates[availableDates.length - 1];
                        const price = cardHistory[latestDate];
                        totalValue += price * card.quantity;
                    }
                }
            });

            if (totalValue > 0) {
                valueHistory[date] = totalValue;
            }
        });

        return valueHistory;
    }

    renderPriceAlerts() {
        const alertsContainer = document.getElementById('price-alerts');
        
        if (this.priceAlerts.length === 0) {
            alertsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bell" style="font-size: 2rem; color: #ffd700; margin-bottom: 1rem;"></i>
                    <p>No price alerts yet</p>
                    <p>Price alerts will appear when cards have significant price changes</p>
                </div>
            `;
            return;
        }

        alertsContainer.innerHTML = this.priceAlerts.slice(0, 10).map(alert => `
            <div class="price-alert ${alert.type}">
                <div class="alert-header">
                    <span class="alert-card-name">${alert.cardName}</span>
                    <span class="alert-date">${new Date(alert.date).toLocaleDateString()}</span>
                </div>
                <div class="alert-details">
                    <span class="price-old">$${alert.oldPrice.toFixed(2)}</span>
                    <i class="fas fa-arrow-${alert.type === 'increase' ? 'up' : 'down'}"></i>
                    <span class="price-new">$${alert.newPrice.toFixed(2)}</span>
                    <span class="price-change ${alert.type}">
                        ${alert.change >= 0 ? '+' : ''}${alert.change.toFixed(2)} (${alert.percentChange.toFixed(1)}%)
                    </span>
                </div>
            </div>
        `).join('');
    }

    // Public method to add manual price alert
    addPriceAlert(cardId, targetPrice, alertType = 'above') {
        const card = this.app.collection.find(c => c.id === cardId);
        if (!card) return;

        const alert = {
            id: Date.now(),
            cardId: cardId,
            cardName: card.name,
            targetPrice: targetPrice,
            alertType: alertType, // 'above' or 'below'
            active: true,
            created: new Date().toISOString()
        };

        this.priceAlerts.unshift(alert);
        localStorage.setItem('priceAlerts', JSON.stringify(this.priceAlerts));
        this.renderPriceAlerts();
    }
}

// Add price chart styles
const priceStyles = document.createElement('style');
priceStyles.textContent = `
    .price-chart-container {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 8px;
        padding: 1rem;
        margin-top: 1rem;
    }

    .chart-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
        font-weight: bold;
    }

    .price-change.positive {
        color: #4CAF50;
    }

    .price-change.negative {
        color: #f44336;
    }

    .chart-bars {
        display: flex;
        align-items: end;
        height: 200px;
        gap: 2px;
        margin-bottom: 0.5rem;
    }

    .chart-bar {
        flex: 1;
        background: linear-gradient(to top, #ffd700, #ffed4e);
        border-radius: 2px 2px 0 0;
        min-height: 5px;
        cursor: pointer;
        transition: opacity 0.3s ease;
    }

    .chart-bar:hover {
        opacity: 0.8;
    }

    .chart-labels {
        display: flex;
        justify-content: space-between;
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.7);
    }

    .price-alert {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 0.5rem;
        border-left: 4px solid;
    }

    .price-alert.increase {
        border-left-color: #4CAF50;
    }

    .price-alert.decrease {
        border-left-color: #f44336;
    }

    .alert-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 0.5rem;
    }

    .alert-card-name {
        font-weight: bold;
        color: #ffd700;
    }

    .alert-date {
        font-size: 0.8rem;
        color: rgba(255, 255, 255, 0.7);
    }

    .alert-details {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-size: 0.9rem;
    }

    .price-old {
        color: rgba(255, 255, 255, 0.7);
        text-decoration: line-through;
    }

    .price-new {
        font-weight: bold;
    }

    .update-prices-btn {
        margin-left: auto;
    }

    .empty-state {
        text-align: center;
        padding: 2rem;
        color: rgba(255, 255, 255, 0.7);
    }
`;
document.head.appendChild(priceStyles);

// Export for use in main app
window.PriceTracker = PriceTracker;
