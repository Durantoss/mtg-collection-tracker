// Deck History UI Components - MTG Collection Tracker
// Provides deck history timeline and statistics display

class DeckHistoryManager {
    constructor(app) {
        this.app = app;
        this.currentUser = null;
        this.historyData = [];
        this.statsData = null;
        
        this.init();
    }

    async init() {
        // Wait for Supabase to be initialized
        if (typeof initializeSupabase === 'function') {
            initializeSupabase();
        }
        
        // Listen for auth state changes
        if (typeof Auth !== 'undefined' && Auth.onAuthStateChange) {
            Auth.onAuthStateChange((event, session) => {
                if (event === 'SIGNED_IN' && session?.user) {
                    this.currentUser = session.user;
                    this.loadUserHistory();
                } else if (event === 'SIGNED_OUT') {
                    this.currentUser = null;
                    this.historyData = [];
                    this.statsData = null;
                }
            });
        }

        this.addHistorySection();
        this.setupEventListeners();
    }

    // Add deck history section to settings
    addHistorySection() {
        const settingsSection = document.getElementById('settings-section');
        if (!settingsSection) return;

        // Find the data management group
        const dataManagementGroup = settingsSection.querySelector('.settings-group:nth-child(2)');
        if (!dataManagementGroup) return;

        // Create deck history section
        const historySection = document.createElement('div');
        historySection.className = 'settings-group';
        historySection.innerHTML = `
            <h3>📜 Deck History</h3>
            <div class="deck-history-container" id="deck-history-container">
                <div class="history-stats" id="history-stats">
                    <div class="stat-card">
                        <div class="stat-value" id="total-decks-stat">0</div>
                        <div class="stat-label">Total Decks</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="shared-decks-stat">0</div>
                        <div class="stat-label">Shared</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="avg-synergy-stat">0%</div>
                        <div class="stat-label">Avg Synergy</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value" id="favorite-archetype-stat">-</div>
                        <div class="stat-label">Favorite Type</div>
                    </div>
                </div>
                
                <div class="history-actions">
                    <button class="btn btn-secondary" id="refresh-history-btn">
                        <i class="fas fa-sync"></i> Refresh
                    </button>
                    <button class="btn btn-secondary" id="view-full-history-btn">
                        <i class="fas fa-history"></i> View Timeline
                    </button>
                </div>
                
                <div class="recent-activity" id="recent-activity">
                    <h4>Recent Activity</h4>
                    <div class="activity-list" id="activity-list">
                        <div class="empty-history">
                            <i class="fas fa-clock"></i>
                            <p>No deck activity yet</p>
                            <p>Create or import a deck to see your history!</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Insert after data management section
        dataManagementGroup.parentNode.insertBefore(historySection, dataManagementGroup.nextSibling);

        // Add CSS styles
        this.addHistoryStyles();
    }

    // Add CSS styles for deck history
    addHistoryStyles() {
        const styles = document.createElement('style');
        styles.textContent = `
            .deck-history-container {
                background: var(--bg-charcoal);
                border-radius: 12px;
                padding: 20px;
                border: 1px solid var(--red-primary);
                margin-top: 15px;
            }

            .history-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 15px;
                margin-bottom: 20px;
            }

            .stat-card {
                background: var(--bg-dark);
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                border: 1px solid rgba(229, 9, 20, 0.3);
            }

            .stat-card .stat-value {
                font-size: 1.5rem;
                font-weight: 700;
                color: var(--red-primary);
                margin-bottom: 5px;
            }

            .stat-card .stat-label {
                font-size: 0.8rem;
                color: var(--text-muted);
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .history-actions {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }

            .recent-activity h4 {
                color: var(--text-light);
                margin-bottom: 15px;
                font-size: 1.1rem;
            }

            .activity-list {
                max-height: 300px;
                overflow-y: auto;
            }

            .activity-item {
                display: flex;
                align-items: center;
                padding: 12px;
                background: var(--bg-dark);
                border-radius: 8px;
                margin-bottom: 10px;
                border-left: 3px solid var(--red-primary);
            }

            .activity-icon {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 15px;
                font-size: 1.2rem;
            }

            .activity-icon.created { background: #28a745; }
            .activity-icon.shared { background: #17a2b8; }
            .activity-icon.received { background: #ffc107; color: #000; }
            .activity-icon.imported { background: #6f42c1; }

            .activity-content {
                flex: 1;
            }

            .activity-title {
                color: var(--text-light);
                font-weight: 600;
                margin-bottom: 4px;
            }

            .activity-details {
                color: var(--text-muted);
                font-size: 0.9rem;
                display: flex;
                gap: 15px;
                flex-wrap: wrap;
            }

            .activity-time {
                color: var(--text-muted);
                font-size: 0.8rem;
                margin-left: auto;
                white-space: nowrap;
            }

            .empty-history {
                text-align: center;
                padding: 40px 20px;
                color: var(--text-muted);
            }

            .empty-history i {
                font-size: 3rem;
                margin-bottom: 15px;
                opacity: 0.5;
            }

            .archetype-badge {
                background: var(--red-primary);
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 0.7rem;
                text-transform: uppercase;
                font-weight: 600;
            }

            .synergy-badge {
                background: linear-gradient(45deg, #ff5c5c, #5cff5c);
                color: white;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 0.7rem;
                font-weight: 600;
            }

            @media (max-width: 768px) {
                .history-stats {
                    grid-template-columns: repeat(2, 1fr);
                }
                
                .activity-details {
                    flex-direction: column;
                    gap: 5px;
                }
                
                .activity-time {
                    margin-left: 0;
                    margin-top: 5px;
                }
            }
        `;
        document.head.appendChild(styles);
    }

    // Setup event listeners
    setupEventListeners() {
        setTimeout(() => {
            const refreshBtn = document.getElementById('refresh-history-btn');
            const viewTimelineBtn = document.getElementById('view-full-history-btn');

            if (refreshBtn) {
                refreshBtn.addEventListener('click', () => this.loadUserHistory());
            }

            if (viewTimelineBtn) {
                viewTimelineBtn.addEventListener('click', () => this.showFullHistoryModal());
            }
        }, 100);
    }

    // Load user's deck history
    async loadUserHistory() {
        if (!this.currentUser || typeof DeckHistory === 'undefined') return;

        try {
            // Load history and stats in parallel
            const [historyData, statsData] = await Promise.all([
                DeckHistory.getUserDeckHistory(this.currentUser.id),
                DeckHistory.getDeckStats(this.currentUser.id)
            ]);

            this.historyData = historyData;
            this.statsData = statsData;

            this.updateStatsDisplay();
            this.updateActivityList();

        } catch (error) {
            console.error('Error loading deck history:', error);
            if (this.app.showNotification) {
                this.app.showNotification('Failed to load deck history', 'error');
            }
        }
    }

    // Update statistics display
    updateStatsDisplay() {
        if (!this.statsData) return;

        const totalDecksEl = document.getElementById('total-decks-stat');
        const sharedDecksEl = document.getElementById('shared-decks-stat');
        const avgSynergyEl = document.getElementById('avg-synergy-stat');
        const favoriteArchetypeEl = document.getElementById('favorite-archetype-stat');

        if (totalDecksEl) totalDecksEl.textContent = this.statsData.totalDecks;
        if (sharedDecksEl) sharedDecksEl.textContent = this.statsData.sharedDecks;
        if (avgSynergyEl) avgSynergyEl.textContent = `${this.statsData.averageSynergy}%`;
        if (favoriteArchetypeEl) {
            favoriteArchetypeEl.textContent = this.statsData.favoriteArchetype === 'Unknown' 
                ? '-' 
                : this.capitalizeFirst(this.statsData.favoriteArchetype);
        }
    }

    // Update recent activity list
    updateActivityList() {
        const activityList = document.getElementById('activity-list');
        if (!activityList) return;

        if (!this.historyData || this.historyData.length === 0) {
            activityList.innerHTML = `
                <div class="empty-history">
                    <i class="fas fa-clock"></i>
                    <p>No deck activity yet</p>
                    <p>Create or import a deck to see your history!</p>
                </div>
            `;
            return;
        }

        // Show recent 5 activities
        const recentActivities = this.historyData.slice(0, 5);
        activityList.innerHTML = recentActivities.map(activity => this.createActivityItem(activity)).join('');
    }

    // Create activity item HTML
    createActivityItem(activity) {
        const actionIcons = {
            created: 'fas fa-plus',
            shared: 'fas fa-share',
            received: 'fas fa-download',
            imported: 'fas fa-file-import'
        };

        const timeAgo = this.getTimeAgo(new Date(activity.timestamp));
        
        return `
            <div class="activity-item">
                <div class="activity-icon ${activity.action}">
                    <i class="${actionIcons[activity.action] || 'fas fa-question'}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">${this.getActionTitle(activity)}</div>
                    <div class="activity-details">
                        ${activity.archetype ? `<span class="archetype-badge">${this.capitalizeFirst(activity.archetype)}</span>` : ''}
                        ${activity.synergy_score ? `<span class="synergy-badge">${activity.synergy_score}% Synergy</span>` : ''}
                    </div>
                </div>
                <div class="activity-time">${timeAgo}</div>
            </div>
        `;
    }

    // Get action title
    getActionTitle(activity) {
        const actions = {
            created: `Created "${activity.deck_name}"`,
            shared: `Shared "${activity.deck_name}"`,
            received: `Received "${activity.deck_name}"`,
            imported: `Imported "${activity.deck_name}"`
        };
        return actions[activity.action] || `${activity.action} "${activity.deck_name}"`;
    }

    // Show full history timeline modal
    showFullHistoryModal() {
        if (!this.historyData || this.historyData.length === 0) {
            if (this.app.showNotification) {
                this.app.showNotification('No deck history to display', 'info');
            }
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'deck-history-modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px;">
                <div class="modal-header">
                    <h3>📜 Deck History Timeline</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="timeline-container" style="max-height: 500px; overflow-y: auto;">
                        ${this.historyData.map(activity => this.createTimelineItem(activity)).join('')}
                    </div>
                    
                    <div class="history-summary" style="margin-top: 20px; padding: 15px; background: var(--bg-charcoal); border-radius: 8px;">
                        <h4 style="color: var(--red-primary); margin-bottom: 10px;">📊 Summary</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                            <div style="text-align: center;">
                                <div style="font-size: 1.2rem; font-weight: 700; color: var(--red-primary);">${this.statsData?.totalDecks || 0}</div>
                                <div style="font-size: 0.9rem; color: var(--text-muted);">Total Decks Created</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 1.2rem; font-weight: 700; color: var(--red-primary);">${this.statsData?.averageSynergy || 0}%</div>
                                <div style="font-size: 0.9rem; color: var(--text-muted);">Average Synergy</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 1.2rem; font-weight: 700; color: var(--red-primary);">${this.capitalizeFirst(this.statsData?.favoriteArchetype || 'None')}</div>
                                <div style="font-size: 0.9rem; color: var(--text-muted);">Favorite Archetype</div>
                            </div>
                        </div>
                    </div>
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

    // Create timeline item
    createTimelineItem(activity) {
        const date = new Date(activity.timestamp);
        const formattedDate = date.toLocaleDateString();
        const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        return `
            <div class="timeline-item" style="margin-bottom: 20px; padding: 15px; background: var(--bg-dark); border-radius: 8px; border-left: 4px solid var(--red-primary);">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                    <h5 style="color: var(--text-light); margin: 0;">${this.getActionTitle(activity)}</h5>
                    <span style="color: var(--text-muted); font-size: 0.9rem;">${formattedDate} ${formattedTime}</span>
                </div>
                <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                    ${activity.archetype ? `<span class="archetype-badge">${this.capitalizeFirst(activity.archetype)}</span>` : ''}
                    ${activity.synergy_score ? `<span class="synergy-badge">${activity.synergy_score}% Synergy</span>` : ''}
                    ${activity.rarity_common ? `<span style="background: #8B4513; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.7rem;">C:${activity.rarity_common}</span>` : ''}
                    ${activity.rarity_rare ? `<span style="background: #FFD700; color: black; padding: 2px 8px; border-radius: 12px; font-size: 0.7rem;">R:${activity.rarity_rare}</span>` : ''}
                    ${activity.rarity_mythic ? `<span style="background: #FF4500; color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.7rem;">M:${activity.rarity_mythic}</span>` : ''}
                </div>
            </div>
        `;
    }

    // Log deck action (to be called from other components)
    async logDeckAction(deckData, action, sourceUserId = null) {
        if (!this.currentUser || typeof DeckHistory === 'undefined') return;

        try {
            // Calculate rarity spread if deck data is available
            let raritySpread = null;
            if (deckData.cards && Array.isArray(deckData.cards)) {
                raritySpread = this.calculateRaritySpread(deckData.cards);
            }

            await DeckHistory.logDeckAction({
                userId: this.currentUser.id,
                deckId: deckData.deckId || `deck_${Date.now()}`,
                deckName: deckData.deckName || deckData.name || 'Untitled Deck',
                archetype: deckData.archetype || this.detectArchetype(deckData),
                action: action,
                synergyScore: deckData.synergyScore,
                raritySpread: raritySpread,
                sourceUserId: sourceUserId
            });

            // Refresh history display
            this.loadUserHistory();

        } catch (error) {
            console.error('Error logging deck action:', error);
        }
    }

    // Calculate rarity spread from cards
    calculateRaritySpread(cards) {
        const spread = { common: 0, rare: 0, mythic: 0 };
        
        cards.forEach(card => {
            const rarity = (card.rarity || '').toLowerCase();
            if (rarity.includes('common')) spread.common++;
            else if (rarity.includes('rare') || rarity.includes('uncommon')) spread.rare++;
            else if (rarity.includes('mythic')) spread.mythic++;
        });

        return spread;
    }

    // Detect archetype from deck data
    detectArchetype(deckData) {
        if (deckData.archetype) return deckData.archetype;
        
        // Simple archetype detection based on stats
        const stats = deckData.stats;
        if (!stats) return 'other';

        const avgCmc = stats.avgCmc || 0;
        const creatureRatio = stats.creatures / stats.totalCards;
        const spellRatio = stats.spells / stats.totalCards;

        if (avgCmc <= 2.5 && creatureRatio > 0.6) return 'aggro';
        if (avgCmc >= 4.0 && spellRatio > 0.5) return 'control';
        if (creatureRatio > 0.4 && spellRatio > 0.3) return 'midrange';
        
        return 'other';
    }

    // Utility functions
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    }
}

// Export for global access
window.DeckHistoryManager = DeckHistoryManager;

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for app to be available
    setTimeout(() => {
        if (typeof window.app !== 'undefined') {
            window.deckHistoryManager = new DeckHistoryManager(window.app);
        }
    }, 1000);
});
