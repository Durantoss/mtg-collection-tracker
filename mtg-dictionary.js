// Comprehensive MTG Dictionary Database
// Contains MTG terminology with definitions, examples, and categories

const MTG_DICTIONARY = {
    // Keyword Abilities
    keywords: [
        {
            id: 'flying',
            term: 'Flying',
            category: 'keywords',
            definition: 'An evasion ability that allows creatures to only be blocked by other creatures with flying or reach.',
            example: 'Serra Angel has flying, so it can only be blocked by creatures with flying or reach.',
            relatedTerms: ['reach', 'evasion', 'blocking'],
            firstAppeared: 'Alpha (1993)'
        },
        {
            id: 'trample',
            term: 'Trample',
            category: 'keywords',
            definition: 'Allows excess combat damage to carry over to the defending player when blocked.',
            example: 'A 5/5 creature with trample blocked by a 2/2 deals 2 damage to the blocker and 3 to the defending player.',
            relatedTerms: ['combat damage', 'blocking', 'excess damage'],
            firstAppeared: 'Alpha (1993)'
        },
        {
            id: 'lifelink',
            term: 'Lifelink',
            category: 'keywords',
            definition: 'Damage dealt by this source causes you to gain that much life.',
            example: 'If a creature with lifelink deals 3 damage, its controller gains 3 life.',
            relatedTerms: ['life gain', 'damage', 'healing'],
            firstAppeared: 'Future Sight (2007)'
        },
        {
            id: 'deathtouch',
            term: 'Deathtouch',
            category: 'keywords',
            definition: 'Any amount of damage this deals to a creature is enough to destroy it.',
            example: 'A 1/1 creature with deathtouch can destroy any creature it damages in combat.',
            relatedTerms: ['combat', 'destroy', 'lethal damage'],
            firstAppeared: 'Future Sight (2007)'
        },
        {
            id: 'vigilance',
            term: 'Vigilance',
            category: 'keywords',
            definition: 'This creature doesn\'t tap when attacking.',
            example: 'A creature with vigilance can attack and still be available to block.',
            relatedTerms: ['attacking', 'tapping', 'blocking'],
            firstAppeared: 'Champions of Kamigawa (2004)'
        },
        {
            id: 'haste',
            term: 'Haste',
            category: 'keywords',
            definition: 'This creature can attack and use tap abilities the turn it enters the battlefield.',
            example: 'A creature with haste ignores summoning sickness and can attack immediately.',
            relatedTerms: ['summoning sickness', 'attacking', 'tap abilities'],
            firstAppeared: 'Alpha (1993)'
        },
        {
            id: 'first-strike',
            term: 'First Strike',
            category: 'keywords',
            definition: 'This creature deals combat damage before creatures without first strike.',
            example: 'A 2/1 first strike creature can kill a 3/2 creature without dying.',
            relatedTerms: ['combat damage', 'double strike', 'combat'],
            firstAppeared: 'Alpha (1993)'
        },
        {
            id: 'double-strike',
            term: 'Double Strike',
            category: 'keywords',
            definition: 'This creature deals first strike and regular combat damage.',
            example: 'A 2/2 double strike creature deals 4 total damage in combat.',
            relatedTerms: ['first strike', 'combat damage', 'combat'],
            firstAppeared: 'Legions (2003)'
        },
        {
            id: 'reach',
            term: 'Reach',
            category: 'keywords',
            definition: 'This creature can block creatures with flying.',
            example: 'Giant Spider can block flying creatures even though it doesn\'t have flying.',
            relatedTerms: ['flying', 'blocking', 'evasion'],
            firstAppeared: 'Future Sight (2007)'
        },
        {
            id: 'hexproof',
            term: 'Hexproof',
            category: 'keywords',
            definition: 'This permanent can\'t be the target of spells or abilities your opponents control.',
            example: 'A creature with hexproof can\'t be targeted by opponent\'s removal spells.',
            relatedTerms: ['targeting', 'protection', 'shroud'],
            firstAppeared: 'Duels of the Planeswalkers (2012)'
        },
        {
            id: 'indestructible',
            term: 'Indestructible',
            category: 'keywords',
            definition: 'This permanent can\'t be destroyed by damage or effects that say "destroy".',
            example: 'An indestructible creature survives damage and destroy effects, but can still be exiled or sacrificed.',
            relatedTerms: ['destroy', 'damage', 'exile', 'sacrifice'],
            firstAppeared: 'Darksteel (2004)'
        }
    ],

    // Game Mechanics
    mechanics: [
        {
            id: 'mana-curve',
            term: 'Mana Curve',
            category: 'mechanics',
            definition: 'The distribution of mana costs in a deck, typically shown as a curve on a graph.',
            example: 'A good aggro deck has a low mana curve with mostly 1-3 mana spells.',
            relatedTerms: ['mana cost', 'deck building', 'tempo'],
            firstAppeared: 'Community term'
        },
        {
            id: 'card-advantage',
            term: 'Card Advantage',
            category: 'mechanics',
            definition: 'Having access to more cards than your opponent, either in hand or through card effects.',
            example: 'Drawing two cards while your opponent draws one gives you card advantage.',
            relatedTerms: ['card draw', 'hand size', 'resources'],
            firstAppeared: 'Community term'
        },
        {
            id: 'tempo',
            term: 'Tempo',
            category: 'mechanics',
            definition: 'The pace of the game and efficiency of mana usage to maintain pressure.',
            example: 'Playing a creature every turn maintains good tempo.',
            relatedTerms: ['mana efficiency', 'pressure', 'board state'],
            firstAppeared: 'Community term'
        },
        {
            id: 'board-state',
            term: 'Board State',
            category: 'mechanics',
            definition: 'The current situation of all permanents on the battlefield.',
            example: 'Analyzing the board state helps determine the best play.',
            relatedTerms: ['battlefield', 'permanents', 'game state'],
            firstAppeared: 'Community term'
        },
        {
            id: 'stack',
            term: 'The Stack',
            category: 'mechanics',
            definition: 'The zone where spells and abilities wait to resolve in Last In, First Out order.',
            example: 'If you cast Lightning Bolt and opponent responds with Counterspell, Counterspell resolves first.',
            relatedTerms: ['LIFO', 'priority', 'resolving'],
            firstAppeared: 'Sixth Edition (1999)'
        },
        {
            id: 'priority',
            term: 'Priority',
            category: 'mechanics',
            definition: 'The right to cast spells or activate abilities, passed between players.',
            example: 'The active player gets priority first in each phase.',
            relatedTerms: ['stack', 'passing', 'response'],
            firstAppeared: 'Sixth Edition (1999)'
        },
        {
            id: 'summoning-sickness',
            term: 'Summoning Sickness',
            category: 'mechanics',
            definition: 'Creatures can\'t attack or use tap abilities the turn they enter the battlefield.',
            example: 'A creature without haste must wait a turn before attacking.',
            relatedTerms: ['haste', 'attacking', 'tap abilities'],
            firstAppeared: 'Alpha (1993)'
        }
    ],

    // Formats
    formats: [
        {
            id: 'standard',
            term: 'Standard',
            category: 'formats',
            definition: 'A rotating format using cards from the most recent sets, typically the last 2 years.',
            example: 'Standard currently includes cards from the last 5-8 sets.',
            relatedTerms: ['rotation', 'constructed', 'competitive'],
            firstAppeared: 'Ice Age (1995)'
        },
        {
            id: 'modern',
            term: 'Modern',
            category: 'formats',
            definition: 'A non-rotating format including cards from Eighth Edition forward.',
            example: 'Modern allows powerful cards but bans the most broken ones.',
            relatedTerms: ['non-rotating', 'constructed', 'ban list'],
            firstAppeared: 'Pro Tour Philadelphia (2011)'
        },
        {
            id: 'legacy',
            term: 'Legacy',
            category: 'formats',
            definition: 'A non-rotating format allowing cards from all sets except Un-sets, with a ban list.',
            example: 'Legacy features powerful cards like Force of Will and dual lands.',
            relatedTerms: ['eternal', 'ban list', 'reserved list'],
            firstAppeared: 'Community format'
        },
        {
            id: 'vintage',
            term: 'Vintage',
            category: 'formats',
            definition: 'The most powerful format, allowing almost all cards with restrictions instead of bans.',
            example: 'Vintage allows Black Lotus but restricts it to one copy per deck.',
            relatedTerms: ['restricted list', 'power nine', 'eternal'],
            firstAppeared: 'Community format'
        },
        {
            id: 'commander',
            term: 'Commander (EDH)',
            category: 'formats',
            definition: 'A multiplayer format with 100-card singleton decks led by a legendary creature.',
            example: 'Commander decks have exactly 100 cards with no duplicates except basic lands.',
            relatedTerms: ['EDH', 'singleton', 'multiplayer', 'legendary'],
            firstAppeared: 'Community format (1996)'
        },
        {
            id: 'draft',
            term: 'Draft',
            category: 'formats',
            definition: 'A limited format where players build decks from booster packs opened during the event.',
            example: 'In draft, you pick one card from a pack and pass the rest.',
            relatedTerms: ['limited', 'booster draft', 'sealed'],
            firstAppeared: 'Mirage (1996)'
        },
        {
            id: 'sealed',
            term: 'Sealed',
            category: 'formats',
            definition: 'A limited format where players build decks from a fixed number of unopened booster packs.',
            example: 'Sealed typically uses 6 booster packs to build a 40-card deck.',
            relatedTerms: ['limited', 'prerelease', 'booster packs'],
            firstAppeared: 'Alpha (1993)'
        }
    ],

    // Card Types
    cardTypes: [
        {
            id: 'creature',
            term: 'Creature',
            category: 'cardTypes',
            definition: 'A permanent type that can attack and block, with power and toughness.',
            example: 'Lightning Bolt can target creatures to destroy them.',
            relatedTerms: ['permanent', 'power', 'toughness', 'combat'],
            firstAppeared: 'Alpha (1993)'
        },
        {
            id: 'instant',
            term: 'Instant',
            category: 'cardTypes',
            definition: 'A spell that can be cast at any time you have priority.',
            example: 'Lightning Bolt is an instant that can be cast during combat.',
            relatedTerms: ['spell', 'priority', 'stack', 'flash'],
            firstAppeared: 'Alpha (1993)'
        },
        {
            id: 'sorcery',
            term: 'Sorcery',
            category: 'cardTypes',
            definition: 'A spell that can only be cast during your main phase when the stack is empty.',
            example: 'Wrath of God is a sorcery that destroys all creatures.',
            relatedTerms: ['spell', 'main phase', 'stack', 'timing'],
            firstAppeared: 'Alpha (1993)'
        },
        {
            id: 'enchantment',
            term: 'Enchantment',
            category: 'cardTypes',
            definition: 'A permanent that provides ongoing effects.',
            example: 'Enchantments like Pacifism can neutralize opposing creatures.',
            relatedTerms: ['permanent', 'ongoing effect', 'aura'],
            firstAppeared: 'Alpha (1993)'
        },
        {
            id: 'artifact',
            term: 'Artifact',
            category: 'cardTypes',
            definition: 'A permanent representing magical items, usually colorless.',
            example: 'Sol Ring is an artifact that produces mana.',
            relatedTerms: ['permanent', 'colorless', 'equipment'],
            firstAppeared: 'Alpha (1993)'
        },
        {
            id: 'planeswalker',
            term: 'Planeswalker',
            category: 'cardTypes',
            definition: 'A permanent representing powerful mages with loyalty abilities.',
            example: 'Jace, the Mind Sculptor has multiple loyalty abilities.',
            relatedTerms: ['loyalty', 'ultimate', 'spark'],
            firstAppeared: 'Lorwyn (2007)'
        },
        {
            id: 'land',
            term: 'Land',
            category: 'cardTypes',
            definition: 'A permanent that typically produces mana, played once per turn.',
            example: 'Basic lands like Island produce one mana of their color.',
            relatedTerms: ['mana', 'basic', 'nonbasic', 'land drop'],
            firstAppeared: 'Alpha (1993)'
        }
    ],

    // Player Slang and Strategy
    slang: [
        {
            id: 'aggro',
            term: 'Aggro',
            category: 'slang',
            definition: 'An aggressive strategy focused on dealing damage quickly.',
            example: 'Red Deck Wins is a classic aggro strategy.',
            relatedTerms: ['aggressive', 'burn', 'tempo', 'beatdown'],
            firstAppeared: 'Community term'
        },
        {
            id: 'control',
            term: 'Control',
            category: 'slang',
            definition: 'A strategy focused on answering threats and winning with powerful late-game spells.',
            example: 'Control decks use counterspells and removal to survive to the late game.',
            relatedTerms: ['counterspells', 'removal', 'card advantage', 'late game'],
            firstAppeared: 'Community term'
        },
        {
            id: 'midrange',
            term: 'Midrange',
            category: 'slang',
            definition: 'A strategy that plays efficient threats and answers, adapting to the opponent.',
            example: 'Midrange decks can play aggressively or defensively as needed.',
            relatedTerms: ['efficient', 'adaptable', 'threats', 'answers'],
            firstAppeared: 'Community term'
        },
        {
            id: 'combo',
            term: 'Combo',
            category: 'slang',
            definition: 'A strategy built around specific card interactions that win the game quickly.',
            example: 'Storm combo decks try to cast many spells in one turn.',
            relatedTerms: ['synergy', 'engine', 'infinite', 'win condition'],
            firstAppeared: 'Community term'
        },
        {
            id: 'ramp',
            term: 'Ramp',
            category: 'slang',
            definition: 'Accelerating mana production to cast expensive spells early.',
            example: 'Green ramp decks use creatures and spells to produce extra mana.',
            relatedTerms: ['mana acceleration', 'big mana', 'expensive spells'],
            firstAppeared: 'Community term'
        },
        {
            id: 'burn',
            term: 'Burn',
            category: 'slang',
            definition: 'A strategy focused on dealing direct damage to opponents.',
            example: 'Burn decks use Lightning Bolt and similar spells to win quickly.',
            relatedTerms: ['direct damage', 'aggro', 'red deck wins', 'face damage'],
            firstAppeared: 'Community term'
        },
        {
            id: 'mill',
            term: 'Mill',
            category: 'slang',
            definition: 'Putting cards from a library directly into the graveyard.',
            example: 'Mill strategies try to empty the opponent\'s library.',
            relatedTerms: ['library', 'graveyard', 'millstone', 'deck out'],
            firstAppeared: 'Antiquities (1994) - Millstone'
        },
        {
            id: 'tribal',
            term: 'Tribal',
            category: 'slang',
            definition: 'A strategy built around a specific creature type.',
            example: 'Goblin tribal decks use creatures and spells that benefit goblins.',
            relatedTerms: ['creature type', 'synergy', 'lord effects'],
            firstAppeared: 'Community term'
        }
    ],

    // Tournament Terms
    tournament: [
        {
            id: 'sideboard',
            term: 'Sideboard',
            category: 'tournament',
            definition: 'Up to 15 additional cards that can be swapped with main deck cards between games.',
            example: 'Sideboards contain cards for specific matchups.',
            relatedTerms: ['best of three', 'sideboarding', 'game two'],
            firstAppeared: 'Ice Age (1995)'
        },
        {
            id: 'mulligan',
            term: 'Mulligan',
            category: 'tournament',
            definition: 'Shuffling your opening hand back and drawing a new hand with one fewer card.',
            example: 'You can mulligan hands with no lands or all lands.',
            relatedTerms: ['opening hand', 'keep', 'scry'],
            firstAppeared: 'Community term'
        },
        {
            id: 'scoop',
            term: 'Scoop',
            category: 'tournament',
            definition: 'Conceding the game, often by picking up your cards.',
            example: 'Players often scoop when facing lethal damage.',
            relatedTerms: ['concede', 'forfeit', 'give up'],
            firstAppeared: 'Community term'
        },
        {
            id: 'topdeck',
            term: 'Topdeck',
            category: 'tournament',
            definition: 'Drawing the perfect card from the top of your library when needed.',
            example: 'He topdecked Lightning Bolt for the win.',
            relatedTerms: ['draw', 'luck', 'perfect draw'],
            firstAppeared: 'Community term'
        },
        {
            id: 'flood',
            term: 'Flood',
            category: 'tournament',
            definition: 'Drawing too many lands and not enough spells.',
            example: 'Mana flood can prevent you from playing meaningful spells.',
            relatedTerms: ['mana screw', 'too many lands', 'bad draws'],
            firstAppeared: 'Community term'
        },
        {
            id: 'screw',
            term: 'Mana Screw',
            category: 'tournament',
            definition: 'Not drawing enough lands to cast your spells.',
            example: 'Mana screw can leave expensive spells stranded in hand.',
            relatedTerms: ['mana flood', 'not enough lands', 'bad draws'],
            firstAppeared: 'Community term'
        }
    ],

    // Rules Terms
    rules: [
        {
            id: 'etb',
            term: 'ETB (Enters the Battlefield)',
            category: 'rules',
            definition: 'Triggered abilities that occur when a permanent enters the battlefield.',
            example: 'Mulldrifter has an ETB ability that draws cards.',
            relatedTerms: ['triggered ability', 'enters', 'battlefield'],
            firstAppeared: 'Magic 2010 (2009)'
        },
        {
            id: 'ltb',
            term: 'LTB (Leaves the Battlefield)',
            category: 'rules',
            definition: 'Triggered abilities that occur when a permanent leaves the battlefield.',
            example: 'Some creatures have LTB abilities that trigger when they die.',
            relatedTerms: ['triggered ability', 'leaves', 'dies'],
            firstAppeared: 'Community term'
        },
        {
            id: 'state-based-actions',
            term: 'State-Based Actions',
            category: 'rules',
            definition: 'Automatic game actions that happen whenever a player would receive priority.',
            example: 'Creatures with 0 toughness are destroyed by state-based actions.',
            relatedTerms: ['automatic', 'priority', 'game rules'],
            firstAppeared: 'Sixth Edition (1999)'
        },
        {
            id: 'replacement-effect',
            term: 'Replacement Effect',
            category: 'rules',
            definition: 'An effect that replaces one event with another.',
            example: 'If a creature would die, regenerate it instead.',
            relatedTerms: ['instead', 'replaces', 'prevention'],
            firstAppeared: 'Alpha (1993)'
        },
        {
            id: 'triggered-ability',
            term: 'Triggered Ability',
            category: 'rules',
            definition: 'An ability that automatically triggers when certain conditions are met.',
            example: 'When this creature enters the battlefield, draw a card.',
            relatedTerms: ['when', 'whenever', 'at', 'automatic'],
            firstAppeared: 'Alpha (1993)'
        },
        {
            id: 'activated-ability',
            term: 'Activated Ability',
            category: 'rules',
            definition: 'An ability with a cost that can be activated by paying that cost.',
            example: 'Tap: Add one mana of any color.',
            relatedTerms: ['cost', 'colon', 'activate'],
            firstAppeared: 'Alpha (1993)'
        }
    ]
};

// Dictionary search and management class
class MTGDictionarySearch {
    constructor() {
        this.allTerms = this.flattenTerms();
        this.setupDictionary();
    }

    flattenTerms() {
        const flattened = [];
        Object.values(MTG_DICTIONARY).forEach(category => {
            flattened.push(...category);
        });
        return flattened;
    }

    setupDictionary() {
        this.renderDictionaryInterface();
    }

    searchTerms(query, category = 'all') {
        if (!query.trim() && category === 'all') {
            return this.allTerms;
        }

        let results = this.allTerms;

        // Filter by category
        if (category !== 'all') {
            results = results.filter(term => term.category === category);
        }

        // Text search
        if (query.trim()) {
            const searchTerm = query.toLowerCase();
            results = results.filter(term => 
                term.term.toLowerCase().includes(searchTerm) ||
                term.definition.toLowerCase().includes(searchTerm) ||
                term.example.toLowerCase().includes(searchTerm) ||
                (term.relatedTerms && term.relatedTerms.some(related => 
                    related.toLowerCase().includes(searchTerm)
                ))
            );
        }

        return results;
    }

    renderDictionaryInterface() {
        const dictionaryContent = document.querySelector('.dictionary-content');
        if (!dictionaryContent) return;

        dictionaryContent.innerHTML = `
            <div class="dictionary-filters">
                <div class="term-categories">
                    <button class="category-btn active" data-category="all">All Terms</button>
                    <button class="category-btn" data-category="keywords">Keywords</button>
                    <button class="category-btn" data-category="mechanics">Mechanics</button>
                    <button class="category-btn" data-category="formats">Formats</button>
                    <button class="category-btn" data-category="cardTypes">Card Types</button>
                    <button class="category-btn" data-category="slang">Strategy</button>
                    <button class="category-btn" data-category="tournament">Tournament</button>
                    <button class="category-btn" data-category="rules">Rules</button>
                </div>
                <div class="dictionary-actions">
                    <button id="dictionary-clear-search" class="btn btn-secondary">Clear Search</button>
                    <button id="dictionary-random-term" class="btn btn-primary">Random Term</button>
                </div>
            </div>
            <div class="terms-list" id="terms-list">
                <!-- Terms will be populated here -->
            </div>
        `;

        this.renderTermsResults(this.allTerms);
        this.setupDictionaryEventListeners();
    }

    renderTermsResults(terms) {
        const termsList = document.getElementById('terms-list');
        if (!termsList) return;

        if (terms.length === 0) {
            termsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book" style="font-size: 3rem; color: #ffd700; margin-bottom: 1rem;"></i>
                    <h3>No terms found</h3>
                    <p>Try adjusting your search criteria.</p>
                </div>
            `;
            return;
        }

        termsList.innerHTML = terms.map(term => `
            <div class="term-card" data-term-id="${term.id}">
                <div class="term-header">
                    <div class="term-name">${term.term}</div>
                    <div class="term-category ${term.category}">${this.getCategoryDisplayName(term.category)}</div>
                </div>
                <div class="term-content">
                    <div class="term-definition">
                        <strong>Definition:</strong>
                        <p>${term.definition}</p>
                    </div>
                    <div class="term-example">
                        <strong>Example:</strong>
                        <p>${term.example}</p>
                    </div>
                    ${term.relatedTerms && term.relatedTerms.length > 0 ? `
                        <div class="term-related">
                            <strong>Related Terms:</strong>
                            <span class="related-terms-list">
                                ${term.relatedTerms.map(related => `<span class="related-term" onclick="mtgDictionary.searchForTerm('${related}')">${related}</span>`).join(', ')}
                            </span>
                        </div>
                    ` : ''}
                    ${term.firstAppeared ? `
                        <div class="term-history">
                            <strong>First Appeared:</strong>
                            <span class="first-appeared">${term.firstAppeared}</span>
                        </div>
                    ` : ''}
                    <div class="term-actions">
                        <button class="btn btn-small btn-secondary" onclick="mtgDictionary.copyTerm('${term.id}')">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                        <button class="btn btn-small btn-primary" onclick="mtgDictionary.shareTerm('${term.id}')">
                            <i class="fas fa-share"></i> Share
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getCategoryDisplayName(category) {
        const categoryNames = {
            keywords: 'Keyword',
            mechanics: 'Mechanic',
            formats: 'Format',
            cardTypes: 'Card Type',
            slang: 'Strategy',
            tournament: 'Tournament',
            rules: 'Rules'
        };
        return categoryNames[category] || category;
    }

    setupDictionaryEventListeners() {
        const searchInput = document.getElementById('dictionary-search');
        const clearButton = document.getElementById('dictionary-clear-search');
        const randomButton = document.getElementById('dictionary-random-term');

        if (searchInput) {
            searchInput.addEventListener('input', () => this.performSearch());
        }

        if (clearButton) {
            clearButton.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelector('[data-category="all"]').classList.add('active');
                this.performSearch();
            });
        }

        if (randomButton) {
            randomButton.addEventListener('click', () => this.showRandomTerm());
        }

        // Category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.performSearch();
            });
        });
    }

    performSearch() {
        const query = document.getElementById('dictionary-search')?.value || '';
        const activeCategory = document.querySelector('.category-btn.active')?.dataset.category || 'all';

        const results = this.searchTerms(query, activeCategory);
        this.renderTermsResults(results);
    }

    searchForTerm(termName) {
        const searchInput = document.getElementById('dictionary-search');
        if (searchInput) {
            searchInput.value = termName;
            this.performSearch();
            
            // Scroll to top of results
            const termsList = document.getElementById('terms-list');
            if (termsList) {
                termsList.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }

    showRandomTerm() {
        const randomTerm = this.allTerms[Math.floor(Math.random() * this.allTerms.length)];
        this.searchForTerm(randomTerm.term);
    }

    copyTerm(termId) {
        const term = this.allTerms.find(t => t.id === termId);
        if (!term) return;

        const textToCopy = `${term.term}\n\nDefinition: ${term.definition}\n\nExample: ${term.example}${term.firstAppeared ? `\n\nFirst Appeared: ${term.firstAppeared}` : ''}`;
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            const copyBtn = document.querySelector(`[onclick="mtgDictionary.copyTerm('${termId}')"]`);
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            copyBtn.style.background = '#4CAF50';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.style.background = '';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy term:', err);
        });
    }

    shareTerm(termId) {
        const term = this.allTerms.find(t => t.id === termId);
        if (!term) return;

        const shareText = `${term.term}: ${term.definition}`;
        
        if (navigator.share) {
            navigator.share({
                title: `MTG Term: ${term.term}`,
                text: shareText,
                url: window.location.href
            }).catch(err => console.log('Error sharing:', err));
        } else {
            // Fallback to copying to clipboard
            navigator.clipboard.writeText(shareText).then(() => {
                const shareBtn = document.querySelector(`[onclick="mtgDictionary.shareTerm('${termId}')"]`);
                const originalText = shareBtn.innerHTML;
                shareBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                shareBtn.style.background = '#4CAF50';
                
                setTimeout(() => {
                    shareBtn.innerHTML = originalText;
                    shareBtn.style.background = '';
                }, 2000);
            });
        }
    }
}

// Initialize the dictionary search system
let mtgDictionary;

// Export for global access
if (typeof window !== 'undefined') {
    window.MTG_DICTIONARY = MTG_DICTIONARY;
    window.MTGDictionarySearch = MTGDictionarySearch;
}
