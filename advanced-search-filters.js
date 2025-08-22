// Advanced Search Filters Module for MTG Collection Tracker
// Phase 2: Advanced Features - Add advanced search filters (CMC, power/toughness, etc.)

class AdvancedSearchFilters {
    constructor(app) {
        this.app = app;
        this.advancedFilters = {
            cmc: { min: null, max: null },
            power: { min: null, max: null },
            toughness: { min: null, max: null },
            colors: [],
            colorIdentity: [],
            rarity: [],
            types: [],
            subtypes: [],
            keywords: [],
            artist: '',
            flavorText: '',
            oracleText: '',
            priceRange: { min: null, max: null },
            yearPrinted: { min: null, max: null },
            legality: {},
            owned: null // null = all, true = owned only, false = not owned
        };
        
        this.init();
    }

    init() {
        this.enhanceSearchInterface();
        this.setupAdvancedFilterEvents();
    }

    enhanceSearchInterface() {
        const searchTab = document.getElementById('search');
        const existingFilters = searchTab.querySelector('.search-filters');
        
        if (existingFilters) {
            // Add advanced filters toggle button
            const toggleButton = document.createElement('button');
            toggleButton.className = 'btn btn-secondary advanced-filters-toggle';
            toggleButton.innerHTML = '<i class="fas fa-sliders-h"></i> Advanced Filters';
            toggleButton.addEventListener('click', () => this.toggleAdvancedFilters());
            
            existingFilters.appendChild(toggleButton);
            
            // Create advanced filters panel
            const advancedPanel = document.createElement('div');
            advancedPanel.className = 'advanced-filters-panel';
            advancedPanel.style.display = 'none';
            advancedPanel.innerHTML = this.createAdvancedFiltersHTML();
            
            existingFilters.parentNode.insertBefore(advancedPanel, existingFilters.nextSibling);
        }
    }

    createAdvancedFiltersHTML() {
        return `
            <div class="advanced-filters-container">
                <div class="advanced-filters-header">
                    <h3>Advanced Search Filters</h3>
                    <div class="filter-actions">
                        <button class="btn btn-small btn-secondary" id="clear-advanced-filters">Clear All</button>
                        <button class="btn btn-small btn-primary" id="apply-advanced-filters">Apply Filters</button>
                    </div>
                </div>
                
                <div class="advanced-filters-grid">
                    <!-- Mana Cost & Stats -->
                    <div class="filter-section">
                        <h4>Mana & Stats</h4>
                        <div class="filter-group">
                            <label>Converted Mana Cost (CMC)</label>
                            <div class="range-inputs">
                                <input type="number" id="cmc-min" placeholder="Min" min="0" max="20">
                                <span>to</span>
                                <input type="number" id="cmc-max" placeholder="Max" min="0" max="20">
                            </div>
                        </div>
                        <div class="filter-group">
                            <label>Power</label>
                            <div class="range-inputs">
                                <input type="number" id="power-min" placeholder="Min" min="0" max="20">
                                <span>to</span>
                                <input type="number" id="power-max" placeholder="Max" min="0" max="20">
                            </div>
                        </div>
                        <div class="filter-group">
                            <label>Toughness</label>
                            <div class="range-inputs">
                                <input type="number" id="toughness-min" placeholder="Min" min="0" max="20">
                                <span>to</span>
                                <input type="number" id="toughness-max" placeholder="Max" min="0" max="20">
                            </div>
                        </div>
                    </div>

                    <!-- Colors -->
                    <div class="filter-section">
                        <h4>Colors</h4>
                        <div class="filter-group">
                            <label>Mana Colors</label>
                            <div class="color-selector">
                                <div class="color-option" data-color="W">
                                    <div class="mana-symbol white">W</div>
                                    <span>White</span>
                                </div>
                                <div class="color-option" data-color="U">
                                    <div class="mana-symbol blue">U</div>
                                    <span>Blue</span>
                                </div>
                                <div class="color-option" data-color="B">
                                    <div class="mana-symbol black">B</div>
                                    <span>Black</span>
                                </div>
                                <div class="color-option" data-color="R">
                                    <div class="mana-symbol red">R</div>
                                    <span>Red</span>
                                </div>
                                <div class="color-option" data-color="G">
                                    <div class="mana-symbol green">G</div>
                                    <span>Green</span>
                                </div>
                                <div class="color-option" data-color="C">
                                    <div class="mana-symbol colorless">C</div>
                                    <span>Colorless</span>
                                </div>
                            </div>
                            <div class="color-match-options">
                                <label class="radio-option">
                                    <input type="radio" name="color-match" value="any" checked>
                                    <span>Any of these colors</span>
                                </label>
                                <label class="radio-option">
                                    <input type="radio" name="color-match" value="all">
                                    <span>All of these colors</span>
                                </label>
                                <label class="radio-option">
                                    <input type="radio" name="color-match" value="exactly">
                                    <span>Exactly these colors</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Card Types -->
                    <div class="filter-section">
                        <h4>Card Types</h4>
                        <div class="filter-group">
                            <label>Rarity</label>
                            <div class="checkbox-group">
                                <label class="checkbox-option">
                                    <input type="checkbox" value="common" data-filter="rarity">
                                    <span class="rarity-common">Common</span>
                                </label>
                                <label class="checkbox-option">
                                    <input type="checkbox" value="uncommon" data-filter="rarity">
                                    <span class="rarity-uncommon">Uncommon</span>
                                </label>
                                <label class="checkbox-option">
                                    <input type="checkbox" value="rare" data-filter="rarity">
                                    <span class="rarity-rare">Rare</span>
                                </label>
                                <label class="checkbox-option">
                                    <input type="checkbox" value="mythic" data-filter="rarity">
                                    <span class="rarity-mythic">Mythic Rare</span>
                                </label>
                            </div>
                        </div>
                        <div class="filter-group">
                            <label>Card Types</label>
                            <div class="checkbox-group">
                                <label class="checkbox-option">
                                    <input type="checkbox" value="creature" data-filter="types">
                                    <span>Creature</span>
                                </label>
                                <label class="checkbox-option">
                                    <input type="checkbox" value="instant" data-filter="types">
                                    <span>Instant</span>
                                </label>
                                <label class="checkbox-option">
                                    <input type="checkbox" value="sorcery" data-filter="types">
                                    <span>Sorcery</span>
                                </label>
                                <label class="checkbox-option">
                                    <input type="checkbox" value="enchantment" data-filter="types">
                                    <span>Enchantment</span>
                                </label>
                                <label class="checkbox-option">
                                    <input type="checkbox" value="artifact" data-filter="types">
                                    <span>Artifact</span>
                                </label>
                                <label class="checkbox-option">
                                    <input type="checkbox" value="planeswalker" data-filter="types">
                                    <span>Planeswalker</span>
                                </label>
                                <label class="checkbox-option">
                                    <input type="checkbox" value="land" data-filter="types">
                                    <span>Land</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Text Search -->
                    <div class="filter-section">
                        <h4>Text & Keywords</h4>
                        <div class="filter-group">
                            <label>Oracle Text Contains</label>
                            <input type="text" id="oracle-text-filter" placeholder="Search card text...">
                        </div>
                        <div class="filter-group">
                            <label>Flavor Text Contains</label>
                            <input type="text" id="flavor-text-filter" placeholder="Search flavor text...">
                        </div>
                        <div class="filter-group">
                            <label>Artist</label>
                            <input type="text" id="artist-filter" placeholder="Artist name...">
                        </div>
                        <div class="filter-group">
                            <label>Keywords</label>
                            <div class="keywords-input">
                                <input type="text" id="keywords-input" placeholder="e.g., Flying, Trample, Haste">
                                <div class="keywords-suggestions" id="keywords-suggestions"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Price & Collection -->
                    <div class="filter-section">
                        <h4>Price & Collection</h4>
                        <div class="filter-group">
                            <label>Price Range (USD)</label>
                            <div class="range-inputs">
                                <input type="number" id="price-min" placeholder="Min" min="0" step="0.01">
                                <span>to</span>
                                <input type="number" id="price-max" placeholder="Max" min="0" step="0.01">
                            </div>
                        </div>
                        <div class="filter-group">
                            <label>Year Printed</label>
                            <div class="range-inputs">
                                <input type="number" id="year-min" placeholder="Min" min="1993" max="2025">
                                <span>to</span>
                                <input type="number" id="year-max" placeholder="Max" min="1993" max="2025">
                            </div>
                        </div>
                        <div class="filter-group">
                            <label>Collection Status</label>
                            <div class="radio-group">
                                <label class="radio-option">
                                    <input type="radio" name="owned-status" value="all" checked>
                                    <span>All Cards</span>
                                </label>
                                <label class="radio-option">
                                    <input type="radio" name="owned-status" value="owned">
                                    <span>Cards I Own</span>
                                </label>
                                <label class="radio-option">
                                    <input type="radio" name="owned-status" value="not-owned">
                                    <span>Cards I Don't Own</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    <!-- Format Legality -->
                    <div class="filter-section">
                        <h4>Format Legality</h4>
                        <div class="filter-group">
                            <div class="checkbox-group">
                                <label class="checkbox-option">
                                    <input type="checkbox" value="standard" data-filter="legality">
                                    <span>Standard</span>
                                </label>
                                <label class="checkbox-option">
                                    <input type="checkbox" value="pioneer" data-filter="legality">
                                    <span>Pioneer</span>
                                </label>
                                <label class="checkbox-option">
                                    <input type="checkbox" value="modern" data-filter="legality">
                                    <span>Modern</span>
                                </label>
                                <label class="checkbox-option">
                                    <input type="checkbox" value="legacy" data-filter="legality">
                                    <span>Legacy</span>
                                </label>
                                <label class="checkbox-option">
                                    <input type="checkbox" value="vintage" data-filter="legality">
                                    <span>Vintage</span>
                                </label>
                                <label class="checkbox-option">
                                    <input type="checkbox" value="commander" data-filter="legality">
                                    <span>Commander</span>
                                </label>
                                <label class="checkbox-option">
                                    <input type="checkbox" value="pauper" data-filter="legality">
                                    <span>Pauper</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    setupAdvancedFilterEvents() {
        // Wait for DOM to be ready
        setTimeout(() => {
            // Clear filters button
            const clearBtn = document.getElementById('clear-advanced-filters');
            if (clearBtn) {
                clearBtn.addEventListener('click', () => this.clearAllFilters());
            }

            // Apply filters button
            const applyBtn = document.getElementById('apply-advanced-filters');
            if (applyBtn) {
                applyBtn.addEventListener('click', () => this.applyAdvancedFilters());
            }

            // Color selector events
            document.querySelectorAll('.color-option').forEach(option => {
                option.addEventListener('click', (e) => this.toggleColorSelection(e.target.closest('.color-option')));
            });

            // Keywords input with suggestions
            const keywordsInput = document.getElementById('keywords-input');
            if (keywordsInput) {
                keywordsInput.addEventListener('input', (e) => this.showKeywordSuggestions(e.target.value));
                keywordsInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.addKeyword(e.target.value);
                        e.target.value = '';
                    }
                });
            }

            // Real-time filter updates for range inputs
            ['cmc', 'power', 'toughness', 'price', 'year'].forEach(type => {
                const minInput = document.getElementById(`${type}-min`);
                const maxInput = document.getElementById(`${type}-max`);
                
                if (minInput) minInput.addEventListener('change', () => this.updateRangeFilter(type, 'min', minInput.value));
                if (maxInput) maxInput.addEventListener('change', () => this.updateRangeFilter(type, 'max', maxInput.value));
            });

            // Checkbox and radio button events
            document.querySelectorAll('input[data-filter]').forEach(input => {
                input.addEventListener('change', () => this.updateCheckboxFilter(input));
            });

            document.querySelectorAll('input[name="owned-status"]').forEach(input => {
                input.addEventListener('change', () => this.updateOwnedFilter(input.value));
            });

            document.querySelectorAll('input[name="color-match"]').forEach(input => {
                input.addEventListener('change', () => this.updateColorMatchMode(input.value));
            });
        }, 100);
    }

    toggleAdvancedFilters() {
        const panel = document.querySelector('.advanced-filters-panel');
        const button = document.querySelector('.advanced-filters-toggle');
        
        if (panel.style.display === 'none') {
            panel.style.display = 'block';
            button.innerHTML = '<i class="fas fa-times"></i> Hide Advanced Filters';
            panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            panel.style.display = 'none';
            button.innerHTML = '<i class="fas fa-sliders-h"></i> Advanced Filters';
        }
    }

    toggleColorSelection(colorOption) {
        const color = colorOption.dataset.color;
        colorOption.classList.toggle('selected');
        
        if (colorOption.classList.contains('selected')) {
            if (!this.advancedFilters.colors.includes(color)) {
                this.advancedFilters.colors.push(color);
            }
        } else {
            this.advancedFilters.colors = this.advancedFilters.colors.filter(c => c !== color);
        }
    }

    updateRangeFilter(type, minMax, value) {
        const numValue = value ? parseFloat(value) : null;
        
        switch (type) {
            case 'cmc':
                this.advancedFilters.cmc[minMax] = numValue;
                break;
            case 'power':
                this.advancedFilters.power[minMax] = numValue;
                break;
            case 'toughness':
                this.advancedFilters.toughness[minMax] = numValue;
                break;
            case 'price':
                this.advancedFilters.priceRange[minMax] = numValue;
                break;
            case 'year':
                this.advancedFilters.yearPrinted[minMax] = numValue;
                break;
        }
    }

    updateCheckboxFilter(input) {
        const filterType = input.dataset.filter;
        const value = input.value;
        
        if (input.checked) {
            if (!this.advancedFilters[filterType].includes(value)) {
                this.advancedFilters[filterType].push(value);
            }
        } else {
            this.advancedFilters[filterType] = this.advancedFilters[filterType].filter(v => v !== value);
        }
    }

    updateOwnedFilter(value) {
        switch (value) {
            case 'all':
                this.advancedFilters.owned = null;
                break;
            case 'owned':
                this.advancedFilters.owned = true;
                break;
            case 'not-owned':
                this.advancedFilters.owned = false;
                break;
        }
    }

    updateColorMatchMode(mode) {
        this.advancedFilters.colorMatchMode = mode;
    }

    showKeywordSuggestions(input) {
        const keywords = [
            'Flying', 'Trample', 'Haste', 'Vigilance', 'Lifelink', 'Deathtouch', 'First Strike', 'Double Strike',
            'Hexproof', 'Shroud', 'Indestructible', 'Flash', 'Defender', 'Reach', 'Menace', 'Prowess',
            'Scry', 'Surveil', 'Mill', 'Exile', 'Flashback', 'Kicker', 'Morph', 'Cycling', 'Echo',
            'Buyback', 'Storm', 'Cascade', 'Delve', 'Convoke', 'Affinity', 'Landfall', 'Threshold'
        ];

        const suggestions = keywords.filter(keyword => 
            keyword.toLowerCase().includes(input.toLowerCase()) && input.length > 0
        );

        const suggestionsDiv = document.getElementById('keywords-suggestions');
        if (suggestionsDiv) {
            if (suggestions.length > 0 && input.length > 0) {
                suggestionsDiv.innerHTML = suggestions.slice(0, 8).map(keyword => 
                    `<div class="keyword-suggestion" onclick="advancedSearchFilters.addKeyword('${keyword}')">${keyword}</div>`
                ).join('');
                suggestionsDiv.style.display = 'block';
            } else {
                suggestionsDiv.style.display = 'none';
            }
        }
    }

    addKeyword(keyword) {
        if (keyword && !this.advancedFilters.keywords.includes(keyword)) {
            this.advancedFilters.keywords.push(keyword);
            this.renderSelectedKeywords();
        }
        
        const suggestionsDiv = document.getElementById('keywords-suggestions');
        if (suggestionsDiv) {
            suggestionsDiv.style.display = 'none';
        }
    }

    renderSelectedKeywords() {
        const keywordsInput = document.getElementById('keywords-input');
        if (!keywordsInput) return;

        // Create or update keywords display
        let keywordsDisplay = keywordsInput.parentNode.querySelector('.selected-keywords');
        if (!keywordsDisplay) {
            keywordsDisplay = document.createElement('div');
            keywordsDisplay.className = 'selected-keywords';
            keywordsInput.parentNode.appendChild(keywordsDisplay);
        }

        keywordsDisplay.innerHTML = this.advancedFilters.keywords.map(keyword => 
            `<span class="keyword-tag">
                ${keyword}
                <button type="button" onclick="advancedSearchFilters.removeKeyword('${keyword}')">&times;</button>
            </span>`
        ).join('');
    }

    removeKeyword(keyword) {
        this.advancedFilters.keywords = this.advancedFilters.keywords.filter(k => k !== keyword);
        this.renderSelectedKeywords();
    }

    clearAllFilters() {
        // Reset all filter values
        this.advancedFilters = {
            cmc: { min: null, max: null },
            power: { min: null, max: null },
            toughness: { min: null, max: null },
            colors: [],
            colorIdentity: [],
            rarity: [],
            types: [],
            subtypes: [],
            keywords: [],
            artist: '',
            flavorText: '',
            oracleText: '',
            priceRange: { min: null, max: null },
            yearPrinted: { min: null, max: null },
            legality: {},
            owned: null
        };

        // Clear UI elements
        document.querySelectorAll('.advanced-filters-panel input[type="number"]').forEach(input => input.value = '');
        document.querySelectorAll('.advanced-filters-panel input[type="text"]').forEach(input => input.value = '');
        document.querySelectorAll('.advanced-filters-panel input[type="checkbox"]').forEach(input => input.checked = false);
        document.querySelectorAll('.color-option').forEach(option => option.classList.remove('selected'));
        document.querySelector('input[name="owned-status"][value="all"]').checked = true;
        document.querySelector('input[name="color-match"][value="any"]').checked = true;

        // Clear selected keywords
        const keywordsDisplay = document.querySelector('.selected-keywords');
        if (keywordsDisplay) {
            keywordsDisplay.innerHTML = '';
        }

        this.app.showNotification('Advanced filters cleared', 'info');
    }

    async applyAdvancedFilters() {
        const searchTerm = document.getElementById('card-search').value;
        
        if (!searchTerm.trim() && !this.hasActiveFilters()) {
            this.app.showNotification('Please enter a search term or select filters', 'warning');
            return;
        }

        try {
            // Build Scryfall query
            const query = this.buildScryfallQuery(searchTerm);
            console.log('Advanced search query:', query);

            // Show loading state
            const resultsContainer = document.getElementById('search-results');
            resultsContainer.innerHTML = `
                <div class="loading-state">
                    <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #66BB6A; margin-bottom: 1rem;"></i>
                    <p>Searching with advanced filters...</p>
                </div>
            `;

            // Perform search
            const response = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}&order=name`);
            const data = await response.json();

            if (data.object === 'error') {
                throw new Error(data.details);
            }

            let results = data.data || [];
            
            // Apply client-side filters that Scryfall doesn't support
            results = this.applyClientSideFilters(results);

            // Apply collection ownership filter
            if (this.advancedFilters.owned !== null) {
                results = this.filterByOwnership(results);
            }

            this.renderAdvancedSearchResults(results);
            
            // Update filter count display
            this.updateFilterCountDisplay();

        } catch (error) {
            console.error('Advanced search error:', error);
            this.app.showNotification('Search failed. Please try again.', 'error');
            document.getElementById('search-results').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #ffd700; margin-bottom: 1rem;"></i>
                    <h3>Search Error</h3>
                    <p>${error.message}</p>
                </div>
            `;
        }
    }

    buildScryfallQuery(searchTerm) {
        let queryParts = [];

        // Base search term
        if (searchTerm.trim()) {
            queryParts.push(searchTerm);
        }

        // CMC filter
        if (this.advancedFilters.cmc.min !== null || this.advancedFilters.cmc.max !== null) {
            if (this.advancedFilters.cmc.min !== null && this.advancedFilters.cmc.max !== null) {
                queryParts.push(`cmc>=${this.advancedFilters.cmc.min} cmc<=${this.advancedFilters.cmc.max}`);
            } else if (this.advancedFilters.cmc.min !== null) {
                queryParts.push(`cmc>=${this.advancedFilters.cmc.min}`);
            } else if (this.advancedFilters.cmc.max !== null) {
                queryParts.push(`cmc<=${this.advancedFilters.cmc.max}`);
            }
        }

        // Power/Toughness filters
        if (this.advancedFilters.power.min !== null || this.advancedFilters.power.max !== null) {
            if (this.advancedFilters.power.min !== null && this.advancedFilters.power.max !== null) {
                queryParts.push(`pow>=${this.advancedFilters.power.min} pow<=${this.advancedFilters.power.max}`);
            } else if (this.advancedFilters.power.min !== null) {
                queryParts.push(`pow>=${this.advancedFilters.power.min}`);
            } else if (this.advancedFilters.power.max !== null) {
                queryParts.push(`pow<=${this.advancedFilters.power.max}`);
            }
        }

        if (this.advancedFilters.toughness.min !== null || this.advancedFilters.toughness.max !== null) {
            if (this.advancedFilters.toughness.min !== null && this.advancedFilters.toughness.max !== null) {
                queryParts.push(`tou>=${this.advancedFilters.toughness.min} tou<=${this.advancedFilters.toughness.max}`);
            } else if (this.advancedFilters.toughness.min !== null) {
                queryParts.push(`tou>=${this.advancedFilters.toughness.min}`);
            } else if (this.advancedFilters.toughness.max !== null) {
                queryParts.push(`tou<=${this.advancedFilters.toughness.max}`);
            }
        }

        // Color filters
        if (this.advancedFilters.colors.length > 0) {
            const colorQuery = this.advancedFilters.colors.join('');
            const matchMode = this.advancedFilters.colorMatchMode || 'any';
            
            switch (matchMode) {
                case 'any':
                    queryParts.push(`c:${colorQuery}`);
                    break;
                case 'all':
                    this.advancedFilters.colors.forEach(color => {
                        queryParts.push(`c:${color}`);
                    });
                    break;
                case 'exactly':
                    queryParts.push(`c=${colorQuery}`);
                    break;
            }
        }

        // Rarity filter
        if (this.advancedFilters.rarity.length > 0) {
            const rarityQuery = this.advancedFilters.rarity.map(r => `r:${r}`).join(' OR ');
            queryParts.push(`(${rarityQuery})`);
        }

        // Type filters
        if (this.advancedFilters.types.length > 0) {
            const typeQuery = this.advancedFilters.types.map(t => `t:${t}`).join(' OR ');
            queryParts.push(`(${typeQuery})`);
        }

        // Text filters
        const oracleText = document.getElementById('oracle-text-filter')?.value;
        if (oracleText) {
            queryParts.push(`o:"${oracleText}"`);
        }

        const flavorText = document.getElementById('flavor-text-filter')?.value;
        if (flavorText) {
            queryParts.push(`ft:"${flavorText}"`);
        }

        const artist = document.getElementById('artist-filter')?.value;
        if (artist) {
            queryParts.push(`a:"${artist}"`);
        }

        // Keywords
        if (this.advancedFilters.keywords.length > 0) {
            this.advancedFilters.keywords.forEach(keyword => {
                queryParts.push(`o:${keyword}`);
            });
        }

        // Price range (USD)
        if (this.advancedFilters.priceRange.min !== null || this.advancedFilters.priceRange.max !== null) {
            if (this.advancedFilters.priceRange.min !== null && this.advancedFilters.priceRange.max !== null) {
                queryParts.push(`usd>=${this.advancedFilters.priceRange.min} usd<=${this.advancedFilters.priceRange.max}`);
            } else if (this.advancedFilters.priceRange.min !== null) {
                queryParts.push(`usd>=${this.advancedFilters.priceRange.min}`);
            } else if (this.advancedFilters.priceRange.max !== null) {
                queryParts.push(`usd<=${this.advancedFilters.priceRange.max}`);
            }
        }

        // Year printed
        if (this.advancedFilters.yearPrinted.min !== null || this.advancedFilters.yearPrinted.max !== null) {
            if (this.advancedFilters.yearPrinted.min !== null && this.advancedFilters.yearPrinted.max !== null) {
                queryParts.push(`year>=${this.advancedFilters.yearPrinted.min} year<=${this.advancedFilters.yearPrinted.max}`);
            } else if (this.advancedFilters.yearPrinted.min !== null) {
                queryParts.push(`year>=${this.advancedFilters.yearPrinted.min}`);
            } else if (this.advancedFilters.yearPrinted.max !== null) {
                queryParts.push(`year<=${this.advancedFilters.yearPrinted.max}`);
            }
        }

        // Format legality
        if (this.advancedFilters.legality.length > 0) {
            this.advancedFilters.legality.forEach(format => {
                queryParts.push(`legal:${format}`);
            });
        }

        return queryParts.join(' ');
    }

    hasActiveFilters() {
        return (
            this.advancedFilters.cmc.min !== null || this.advancedFilters.cmc.max !== null ||
            this.advancedFilters.power.min !== null || this.advancedFilters.power.max !== null ||
            this.advancedFilters.toughness.min !== null || this.advancedFilters.toughness.max !== null ||
            this.advancedFilters.colors.length > 0 ||
            this.advancedFilters.rarity.length > 0 ||
            this.advancedFilters.types.length > 0 ||
            this.advancedFilters.keywords.length > 0 ||
            this.advancedFilters.priceRange.min !== null || this.advancedFilters.priceRange.max !== null ||
            this.advancedFilters.yearPrinted.min !== null || this.advancedFilters.yearPrinted.max !== null ||
            this.advancedFilters.legality.length > 0 ||
            this.advancedFilters.owned !== null ||
            document.getElementById('oracle-text-filter')?.value ||
            document.getElementById('flavor-text-filter')?.value ||
            document.getElementById('artist-filter')?.value
        );
    }

    applyClientSideFilters(results) {
        // Apply filters that Scryfall doesn't support or need refinement
        return results.filter(card => {
            // Additional client-side filtering can be added here
            return true;
        });
    }

    filterByOwnership(results) {
        return results.filter(card => {
            const isOwned = this.app.collection.some(ownedCard => 
                ownedCard.name.toLowerCase() === card.name.toLowerCase()
            );
            
            if (this.advancedFilters.owned === true) {
                return isOwned;
            } else if (this.advancedFilters.owned === false) {
                return !isOwned;
            }
            
            return true;
        });
    }

    renderAdvancedSearchResults(results) {
        const resultsContainer = document.getElementById('search-results');
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search" style="font-size: 4rem; color: #ffd700; margin-bottom: 1rem;"></i>
                    <h3>No cards found</h3>
                    <p>Try adjusting your search criteria or filters.</p>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = results.slice(0, 50).map(card => {
            const isOwned = this.app.collection.some(ownedCard => 
                ownedCard.name.toLowerCase() === card.name.toLowerCase()
            );

            return `
                <div class="search-card advanced-search-result ${isOwned ? 'owned' : ''}" onclick="window.app.addCardFromSearch('${card.id}')">
                    ${card.image_uris ? `
                        <div class="search-card-image">
                            <img src="${card.image_uris.small}" alt="${card.name}" loading="lazy">
                            ${isOwned ? '<div class="owned-indicator"><i class="fas fa-check-circle"></i></div>' : ''}
                        </div>
                    ` : ''}
                    <div class="search-card-content">
                        <div class="search-card-name">${card.name}</div>
                        <div class="search-card-details">
                            <div class="search-detail">${card.set_name} (${card.set.toUpperCase()})</div>
                            <div class="search-detail">${card.type_line}</div>
                            <div class="search-detail">
                                <span class="rarity-${card.rarity}">${card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1)}</span>
                            </div>
                            ${card.mana_cost ? `<div class="mana-cost">${this.renderManaCost(card.mana_cost)}</div>` : ''}
                            ${card.power && card.toughness ? `<div class="power-toughness">${card.power}/${card.toughness}</div>` : ''}
                            <div class="search-price">$${card.prices?.usd || 'N/A'}</div>
                        </div>
                        ${card.oracle_text ? `<div class="oracle-text">${card.oracle_text.substring(0, 150)}${card.oracle_text.length > 150 ? '...' : ''}</div>` : ''}
                    </div>
                </div>
            `;
        }).join('');

        // Show result count
        const resultCount = document.createElement('div');
        resultCount.className = 'search-result-count';
        resultCount.innerHTML = `
            <div class="result-stats">
                <span>Found ${results.length} cards</span>
                ${results.length > 50 ? '<span class="result-limit">Showing first 50 results</span>' : ''}
            </div>
        `;
        resultsContainer.insertBefore(resultCount, resultsContainer.firstChild);
    }

    renderManaCost(manaCost) {
        // Convert mana cost symbols to styled spans
        return manaCost.replace(/{([^}]+)}/g, (match, symbol) => {
            const symbolClass = this.getManaSymbolClass(symbol);
            return `<span class="mana-symbol ${symbolClass}">${symbol}</span>`;
        });
    }

    getManaSymbolClass(symbol) {
        const symbolMap = {
            'W': 'white',
            'U': 'blue',
            'B': 'black',
            'R': 'red',
            'G': 'green',
            'C': 'colorless'
        };

        if (symbolMap[symbol]) {
            return symbolMap[symbol];
        } else if (/^\d+$/.test(symbol)) {
            return 'generic';
        } else {
            return 'hybrid';
        }
    }

    updateFilterCountDisplay() {
        const button = document.querySelector('.advanced-filters-toggle');
        const activeCount = this.getActiveFilterCount();
        
        if (activeCount > 0) {
            button.innerHTML = `<i class="fas fa-sliders-h"></i> Advanced Filters (${activeCount})`;
            button.classList.add('has-filters');
        } else {
            button.innerHTML = '<i class="fas fa-sliders-h"></i> Advanced Filters';
            button.classList.remove('has-filters');
        }
    }

    getActiveFilterCount() {
        let count = 0;
        
        if (this.advancedFilters.cmc.min !== null || this.advancedFilters.cmc.max !== null) count++;
        if (this.advancedFilters.power.min !== null || this.advancedFilters.power.max !== null) count++;
        if (this.advancedFilters.toughness.min !== null || this.advancedFilters.toughness.max !== null) count++;
        if (this.advancedFilters.colors.length > 0) count++;
        if (this.advancedFilters.rarity.length > 0) count++;
        if (this.advancedFilters.types.length > 0) count++;
        if (this.advancedFilters.keywords.length > 0) count++;
        if (this.advancedFilters.priceRange.min !== null || this.advancedFilters.priceRange.max !== null) count++;
        if (this.advancedFilters.yearPrinted.min !== null || this.advancedFilters.yearPrinted.max !== null) count++;
        if (this.advancedFilters.legality.length > 0) count++;
        if (this.advancedFilters.owned !== null) count++;
        if (document.getElementById('oracle-text-filter')?.value) count++;
        if (document.getElementById('flavor-text-filter')?.value) count++;
        if (document.getElementById('artist-filter')?.value) count++;
        
        return count;
    }
}

// Advanced search filter styles
const advancedSearchStyles = document.createElement('style');
advancedSearchStyles.textContent = `
    .advanced-filters-toggle {
        margin-left: auto;
        transition: all 0.3s ease;
    }

    .advanced-filters-toggle.has-filters {
        background: linear-gradient(135deg, #FF9800, #F57C00);
        color: white;
        border-color: #FF9800;
        box-shadow: 0 4px 15px rgba(255, 152, 0, 0.3);
    }

    .advanced-filters-panel {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(20px);
        border-radius: 20px;
        padding: 2rem;
        margin: 2rem 0;
        border: 1px solid rgba(168, 230, 207, 0.3);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    }

    .advanced-filters-container {
        max-width: 100%;
    }

    .advanced-filters-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
        padding-bottom: 1rem;
        border-bottom: 2px solid rgba(168, 230, 207, 0.3);
    }

    .advanced-filters-header h3 {
        color: var(--primary-green);
        margin: 0;
        font-size: 1.5rem;
        font-weight: 700;
    }

    .filter-actions {
        display: flex;
        gap: 1rem;
    }

    .advanced-filters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
    }

    .filter-section {
        background: rgba(255, 255, 255, 0.7);
        border-radius: 15px;
        padding: 1.5rem;
        border: 1px solid rgba(168, 230, 207, 0.2);
    }

    .filter-section h4 {
        color: var(--primary-green);
        margin: 0 0 1rem 0;
        font-size: 1.2rem;
        font-weight: 600;
        border-bottom: 2px solid rgba(168, 230, 207, 0.3);
        padding-bottom: 0.5rem;
    }

    .filter-group {
        margin-bottom: 1.5rem;
    }

    .filter-group:last-child {
        margin-bottom: 0;
    }

    .filter-group label {
        display: block;
        margin-bottom: 0.5rem;
        color: var(--charcoal);
        font-weight: 500;
        font-size: 0.9rem;
    }

    .range-inputs {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .range-inputs input {
        flex: 1;
        padding: 0.75rem;
        border: 2px solid rgba(168, 230, 207, 0.3);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.9);
        color: var(--charcoal);
        font-size: 0.9rem;
    }

    .range-inputs input:focus {
        outline: none;
        border-color: var(--primary-green);
        box-shadow: 0 0 0 2px rgba(102, 187, 106, 0.1);
    }

    .range-inputs span {
        color: var(--sage-green);
        font-weight: 500;
        font-size: 0.9rem;
    }

    .color-selector {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 0.75rem;
        margin-bottom: 1rem;
    }

    .color-option {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem;
        border: 2px solid rgba(168, 230, 207, 0.3);
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        background: rgba(255, 255, 255, 0.5);
    }

    .color-option:hover {
        border-color: var(--primary-green);
        background: rgba(168, 230, 207, 0.1);
    }

    .color-option.selected {
        border-color: var(--primary-green);
        background: rgba(102, 187, 106, 0.2);
        box-shadow: 0 2px 8px rgba(102, 187, 106, 0.3);
    }

    .mana-symbol {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        font-size: 0.8rem;
        color: white;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    }

    .mana-symbol.white { background: #FFFBD5; color: #000; }
    .mana-symbol.blue { background: #0E68AB; }
    .mana-symbol.black { background: #150B00; }
    .mana-symbol.red { background: #D3202A; }
    .mana-symbol.green { background: #00733E; }
    .mana-symbol.colorless { background: #CAC5C0; color: #000; }
    .mana-symbol.generic { background: #CAC5C0; color: #000; }
    .mana-symbol.hybrid { background: linear-gradient(45deg, #D3202A, #00733E); }

    .color-match-options {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .radio-option,
    .checkbox-option {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        cursor: pointer;
        padding: 0.25rem 0;
    }

    .radio-option input,
    .checkbox-option input {
        margin: 0;
    }

    .checkbox-group {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 0.5rem;
    }

    .radio-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .rarity-common { color: #1a1a1a; }
    .rarity-uncommon { color: #c0c0c0; }
    .rarity-rare { color: #ffb300; }
    .rarity-mythic { color: #ff6d00; }

    .keywords-input {
        position: relative;
    }

    .keywords-input input {
        width: 100%;
        padding: 0.75rem;
        border: 2px solid rgba(168, 230, 207, 0.3);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.9);
        color: var(--charcoal);
        font-size: 0.9rem;
    }

    .keywords-input input:focus {
        outline: none;
        border-color: var(--primary-green);
        box-shadow: 0 0 0 2px rgba(102, 187, 106, 0.1);
    }

    .keywords-suggestions {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border: 1px solid rgba(168, 230, 207, 0.3);
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        max-height: 200px;
        overflow-y: auto;
        display: none;
    }

    .keyword-suggestion {
        padding: 0.75rem;
        cursor: pointer;
        transition: background 0.2s ease;
        border-bottom: 1px solid rgba(168, 230, 207, 0.2);
    }

    .keyword-suggestion:hover {
        background: rgba(168, 230, 207, 0.1);
    }

    .keyword-suggestion:last-child {
        border-bottom: none;
    }

    .selected-keywords {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 0.5rem;
    }

    .keyword-tag {
        background: var(--primary-green);
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 15px;
        font-size: 0.8rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .keyword-tag button {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 1rem;
        padding: 0;
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.2s ease;
    }

    .keyword-tag button:hover {
        background: rgba(255, 255, 255, 0.2);
    }

    .advanced-search-result {
        position: relative;
    }

    .advanced-search-result.owned {
        border-color: #4CAF50;
        background: rgba(76, 175, 80, 0.05);
    }

    .owned-indicator {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        background: #4CAF50;
        color: white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.8rem;
        box-shadow: 0 2px 8px rgba(76, 175, 80, 0.3);
    }

    .search-result-count {
        background: rgba(102, 187, 106, 0.1);
        border-radius: 8px;
        padding: 1rem;
        margin-bottom: 1.5rem;
        border: 1px solid rgba(102, 187, 106, 0.2);
    }

    .result-stats {
        display: flex;
        justify-content: space-between;
        align-items: center;
        color: var(--primary-green);
        font-weight: 600;
    }

    .result-limit {
        font-size: 0.9rem;
        color: var(--sage-green);
        font-weight: 400;
    }

    .mana-cost {
        display: flex;
        align-items: center;
        gap: 0.25rem;
        margin: 0.25rem 0;
    }

    .power-toughness {
        background: rgba(102, 187, 106, 0.2);
        color: var(--primary-green);
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-weight: bold;
        font-size: 0.9rem;
    }

    .oracle-text {
        font-size: 0.8rem;
        color: var(--charcoal);
        margin-top: 0.5rem;
        line-height: 1.4;
        font-style: italic;
    }

    .loading-state {
        text-align: center;
        padding: 3rem;
        color: var(--sage-green);
    }

    @media (max-width: 768px) {
        .advanced-filters-grid {
            grid-template-columns: 1fr;
        }

        .color-selector {
            grid-template-columns: repeat(2, 1fr);
        }

        .checkbox-group {
            grid-template-columns: 1fr;
        }

        .filter-actions {
            flex-direction: column;
            gap: 0.5rem;
        }

        .advanced-filters-header {
            flex-direction: column;
            gap: 1rem;
            align-items: flex-start;
        }

        .result-stats {
            flex-direction: column;
            gap: 0.5rem;
            align-items: flex-start;
        }
    }

    @media (max-width: 480px) {
        .advanced-filters-panel {
            padding: 1rem;
            margin: 1rem 0;
        }

        .range-inputs {
            flex-direction: column;
            gap: 0.5rem;
        }

        .range-inputs span {
            display: none;
        }

        .color-selector {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(advancedSearchStyles);

// Export for use in main app
window.AdvancedSearchFilters = AdvancedSearchFilters;
