// Comprehensive MTG Rules Database
// Contains official rules with simplified explanations and examples

const MTG_RULES_DATABASE = {
    // Basic Game Rules
    basic: [
        {
            id: 'rule-100-1',
            number: '100.1',
            category: 'basic',
            title: 'Game Overview',
            officialText: 'These Magic rules apply to any Magic game with two or more players, including two-player games and multiplayer games.',
            simplifiedText: 'Magic is a game for 2 or more players where you cast spells and summon creatures to defeat your opponents.',
            example: 'In a typical game, you and your opponent each start with 20 life and try to reduce each other\'s life to 0 using spells and creatures.',
            keywords: ['game', 'players', 'multiplayer', 'basic'],
            relatedRules: ['100.2', '100.3'],
            difficulty: 'beginner'
        },
        {
            id: 'rule-100-2',
            number: '100.2',
            category: 'basic',
            title: 'Winning the Game',
            officialText: 'A player wins the game if that player\'s life total is greater than 0 when all other players have been eliminated.',
            simplifiedText: 'You win by being the last player with life remaining, or by fulfilling certain card conditions.',
            example: 'If you have 5 life and your opponent reaches 0 life, you win. Some cards like "Laboratory Maniac" provide alternate win conditions.',
            keywords: ['winning', 'life', 'victory', 'elimination'],
            relatedRules: ['104.1', '104.2', '104.3'],
            difficulty: 'beginner'
        },
        {
            id: 'rule-101-1',
            number: '101.1',
            category: 'basic',
            title: 'Starting Life Total',
            officialText: 'Each player begins the game with a starting life total of 20. Some variant games have different starting life totals.',
            simplifiedText: 'Most Magic games start with each player having 20 life points.',
            example: 'In Standard and Modern, you start with 20 life. In Commander, you start with 40 life.',
            keywords: ['life', 'starting', 'total', 'variant'],
            relatedRules: ['100.2', '104.1'],
            difficulty: 'beginner'
        },
        {
            id: 'rule-102-1',
            number: '102.1',
            category: 'basic',
            title: 'Deck Construction',
            officialText: 'In constructed play, each deck must contain a minimum of sixty cards. There is no maximum deck size.',
            simplifiedText: 'Your deck must have at least 60 cards, but can have more (though most players stick to 60).',
            example: 'A typical competitive deck has exactly 60 cards plus a 15-card sideboard for best consistency.',
            keywords: ['deck', 'construction', 'sixty', 'minimum', 'cards'],
            relatedRules: ['102.2', '102.3'],
            difficulty: 'beginner'
        },
        {
            id: 'rule-103-1',
            number: '103.1',
            category: 'basic',
            title: 'Starting the Game',
            officialText: 'At the start of a game, each player shuffles their deck so that the cards are in a random order.',
            simplifiedText: 'Before the game begins, shuffle your deck thoroughly to randomize the card order.',
            example: 'Riffle shuffle, pile shuffle, or use other methods to ensure your deck is properly randomized before drawing your opening hand.',
            keywords: ['shuffle', 'random', 'start', 'deck'],
            relatedRules: ['103.2', '103.3', '103.4'],
            difficulty: 'beginner'
        }
    ],

    // Turn Structure and Phases
    phases: [
        {
            id: 'rule-500-1',
            number: '500.1',
            category: 'phases',
            title: 'Turn Structure',
            officialText: 'A turn consists of five phases, in this order: beginning, precombat main, combat, postcombat main, and ending.',
            simplifiedText: 'Each turn has 5 phases: Beginning → Main → Combat → Main → End.',
            example: 'On your turn: untap and draw (Beginning), cast spells (Main), attack with creatures (Combat), cast more spells (Main), then end your turn.',
            keywords: ['turn', 'phases', 'beginning', 'main', 'combat', 'ending'],
            relatedRules: ['501.1', '505.1', '506.1', '512.1', '513.1'],
            difficulty: 'beginner'
        },
        {
            id: 'rule-501-1',
            number: '501.1',
            category: 'phases',
            title: 'Beginning Phase',
            officialText: 'The beginning phase consists of three steps, in this order: untap, upkeep, and draw.',
            simplifiedText: 'At the start of your turn: untap your permanents, handle upkeep triggers, then draw a card.',
            example: 'Untap your tapped lands and creatures, resolve any "at the beginning of your upkeep" triggers, then draw one card from your library.',
            keywords: ['beginning', 'untap', 'upkeep', 'draw', 'steps'],
            relatedRules: ['502.1', '503.1', '504.1'],
            difficulty: 'beginner'
        },
        {
            id: 'rule-505-1',
            number: '505.1',
            category: 'phases',
            title: 'Main Phase',
            officialText: 'A player may cast artifact, creature, enchantment, planeswalker, and sorcery spells during their main phase.',
            simplifiedText: 'During your main phases, you can cast most spells and activate abilities.',
            example: 'Cast creatures like "Lightning Bolt" or "Grizzly Bears", play lands, and activate abilities like equipment.',
            keywords: ['main', 'phase', 'cast', 'spells', 'artifacts', 'creatures'],
            relatedRules: ['307.1', '308.1', '309.1'],
            difficulty: 'beginner'
        },
        {
            id: 'rule-506-1',
            number: '506.1',
            category: 'phases',
            title: 'Combat Phase Overview',
            officialText: 'The combat phase has five steps: beginning of combat, declare attackers, declare blockers, combat damage, and end of combat.',
            simplifiedText: 'Combat has 5 steps: start combat, choose attackers, opponent chooses blockers, deal damage, end combat.',
            example: 'Declare your creatures as attackers, opponent blocks with their creatures, then damage is dealt simultaneously.',
            keywords: ['combat', 'attackers', 'blockers', 'damage', 'steps'],
            relatedRules: ['507.1', '508.1', '509.1', '510.1', '511.1'],
            difficulty: 'intermediate'
        }
    ],

    // Combat Rules
    combat: [
        {
            id: 'rule-508-1',
            number: '508.1',
            category: 'combat',
            title: 'Declare Attackers Step',
            officialText: 'The active player chooses which creatures they control will attack, then all chosen creatures become attacking creatures.',
            simplifiedText: 'Choose which of your untapped creatures will attack, then tap them and declare them as attackers.',
            example: 'You have a 2/2 Bear and 3/1 Goblin. You can attack with both, one, or neither - but they must be untapped to attack.',
            keywords: ['attackers', 'creatures', 'attacking', 'tap', 'declare'],
            relatedRules: ['508.2', '508.3', '509.1'],
            difficulty: 'beginner'
        },
        {
            id: 'rule-509-1',
            number: '509.1',
            category: 'combat',
            title: 'Declare Blockers Step',
            officialText: 'The defending player chooses which creatures they control will block attacking creatures.',
            simplifiedText: 'The defending player chooses which of their untapped creatures will block the attacking creatures.',
            example: 'If attacked by a 3/3 creature, you can block with your 2/4 creature to prevent damage to yourself.',
            keywords: ['blockers', 'defending', 'block', 'creatures'],
            relatedRules: ['509.2', '509.3', '510.1'],
            difficulty: 'beginner'
        },
        {
            id: 'rule-510-1',
            number: '510.1',
            category: 'combat',
            title: 'Combat Damage Step',
            officialText: 'All combat damage is dealt simultaneously. Creatures deal damage equal to their power.',
            simplifiedText: 'All creatures deal damage at the same time, equal to their power value.',
            example: 'A 3/2 creature deals 3 damage. If blocked by a 2/4 creature, the 3/2 dies (took 2 damage) and the 2/4 survives (took 3 damage but has 4 toughness).',
            keywords: ['damage', 'power', 'toughness', 'simultaneous', 'combat'],
            relatedRules: ['510.2', '510.3', '704.5g'],
            difficulty: 'intermediate'
        },
        {
            id: 'rule-702-9a',
            number: '702.9a',
            category: 'combat',
            title: 'First Strike',
            officialText: 'First strike is a static ability that modifies the rules for the combat damage step.',
            simplifiedText: 'Creatures with first strike deal their combat damage before creatures without first strike.',
            example: 'A 2/1 first strike creature can kill a 3/2 creature without dying, because it deals damage first.',
            keywords: ['first', 'strike', 'damage', 'before', 'combat'],
            relatedRules: ['702.4a', '510.2'],
            difficulty: 'intermediate'
        },
        {
            id: 'rule-702-19a',
            number: '702.19a',
            category: 'combat',
            title: 'Trample',
            officialText: 'Trample is a static ability that modifies the rules for assigning an attacking creature\'s combat damage.',
            simplifiedText: 'Excess damage from a trampling creature carries over to the defending player.',
            example: 'A 5/5 trample creature blocked by a 2/2 deals 2 damage to the blocker and 3 damage to the defending player.',
            keywords: ['trample', 'excess', 'damage', 'carry', 'over'],
            relatedRules: ['510.1c', '702.19b'],
            difficulty: 'intermediate'
        }
    ],

    // Keyword Abilities
    keywords: [
        {
            id: 'rule-702-9a-flying',
            number: '702.9a',
            category: 'keywords',
            title: 'Flying',
            officialText: 'Flying is an evasion ability. A creature with flying can\'t be blocked except by creatures with flying or reach.',
            simplifiedText: 'Flying creatures can only be blocked by other flying creatures or creatures with reach.',
            example: 'A "Serra Angel" with flying can\'t be blocked by a "Grizzly Bears", but can be blocked by another flying creature or one with reach.',
            keywords: ['flying', 'evasion', 'blocked', 'reach', 'air'],
            relatedRules: ['702.17a', '509.1b'],
            difficulty: 'beginner'
        },
        {
            id: 'rule-702-17a',
            number: '702.17a',
            category: 'keywords',
            title: 'Reach',
            officialText: 'Reach is a static ability that modifies the rules for declaring blockers.',
            simplifiedText: 'Creatures with reach can block flying creatures.',
            example: 'A "Giant Spider" with reach can block flying creatures like "Serra Angel" even though the spider doesn\'t have flying.',
            keywords: ['reach', 'block', 'flying', 'static', 'ability'],
            relatedRules: ['702.9a', '509.1b'],
            difficulty: 'beginner'
        },
        {
            id: 'rule-702-15a',
            number: '702.15a',
            category: 'keywords',
            title: 'Lifelink',
            officialText: 'Lifelink is a static ability. Damage dealt by a source with lifelink causes that source\'s controller to gain that much life.',
            simplifiedText: 'When a creature with lifelink deals damage, you gain that much life.',
            example: 'If your 3/3 lifelink creature deals 3 damage to an opponent, you gain 3 life.',
            keywords: ['lifelink', 'damage', 'gain', 'life', 'static'],
            relatedRules: ['120.3', '702.15b'],
            difficulty: 'beginner'
        },
        {
            id: 'rule-702-12a',
            number: '702.12a',
            category: 'keywords',
            title: 'Vigilance',
            officialText: 'Vigilance is a static ability that modifies the rules for the declare attackers step.',
            simplifiedText: 'Creatures with vigilance don\'t tap when they attack.',
            example: 'A creature with vigilance can attack and still be available to block on your opponent\'s turn.',
            keywords: ['vigilance', 'tap', 'attack', 'block', 'static'],
            relatedRules: ['508.1f', '702.12b'],
            difficulty: 'beginner'
        },
        {
            id: 'rule-702-11a',
            number: '702.11a',
            category: 'keywords',
            title: 'Deathtouch',
            officialText: 'Deathtouch is a static ability. Any amount of damage dealt by a source with deathtouch to a creature is enough to destroy it.',
            simplifiedText: 'Any amount of damage from a deathtouch creature destroys the creature it damages.',
            example: 'A 1/1 deathtouch creature can destroy a 10/10 creature in combat because any damage from deathtouch is lethal.',
            keywords: ['deathtouch', 'damage', 'destroy', 'lethal', 'static'],
            relatedRules: ['704.5g', '702.11b'],
            difficulty: 'intermediate'
        },
        {
            id: 'rule-702-10a',
            number: '702.10a',
            category: 'keywords',
            title: 'Haste',
            officialText: 'Haste is a static ability that allows a creature to ignore the "summoning sickness" rule.',
            simplifiedText: 'Creatures with haste can attack and use tap abilities immediately when they enter the battlefield.',
            example: 'A creature with haste can attack on the same turn you cast it, unlike normal creatures which must wait a turn.',
            keywords: ['haste', 'summoning', 'sickness', 'attack', 'immediately'],
            relatedRules: ['302.6', '702.10b'],
            difficulty: 'beginner'
        }
    ],

    // Spell and Ability Rules
    spells: [
        {
            id: 'rule-601-1',
            number: '601.1',
            category: 'spells',
            title: 'Casting Spells',
            officialText: 'Previously, the action of casting a spell, or casting a card as a spell, was referred to on cards as "playing" that spell or that card.',
            simplifiedText: 'To cast a spell, announce it, pay its costs, choose targets, then it goes on the stack.',
            example: 'To cast "Lightning Bolt", announce it, pay 1 red mana, choose a target, then it waits on the stack for resolution.',
            keywords: ['casting', 'spells', 'announce', 'costs', 'targets', 'stack'],
            relatedRules: ['601.2', '601.3', '608.1'],
            difficulty: 'intermediate'
        },
        {
            id: 'rule-405-1',
            number: '405.1',
            category: 'spells',
            title: 'The Stack',
            officialText: 'When a spell is cast, the physical card is put on the stack. When an activated or triggered ability is put on the stack, a card is not physically put there.',
            simplifiedText: 'The stack is where spells and abilities wait to resolve. The last thing added resolves first (LIFO - Last In, First Out).',
            example: 'If you cast "Lightning Bolt" and opponent responds with "Counterspell", Counterspell resolves first and counters Lightning Bolt.',
            keywords: ['stack', 'resolve', 'LIFO', 'last', 'first', 'spells'],
            relatedRules: ['608.1', '608.2', '116.1'],
            difficulty: 'intermediate'
        },
        {
            id: 'rule-608-1',
            number: '608.1',
            category: 'spells',
            title: 'Resolving Spells',
            officialText: 'Each time all players pass in succession, the spell or ability on top of the stack resolves.',
            simplifiedText: 'When both players pass priority, the top spell or ability on the stack happens (resolves).',
            example: 'You cast "Lightning Bolt", opponent passes, you pass, then Lightning Bolt resolves and deals 3 damage.',
            keywords: ['resolving', 'priority', 'pass', 'top', 'stack'],
            relatedRules: ['116.3', '608.2', '405.1'],
            difficulty: 'intermediate'
        },
        {
            id: 'rule-114-1',
            number: '114.1',
            category: 'spells',
            title: 'Targeting',
            officialText: 'Some spells and abilities require their controller to choose one or more targets for them.',
            simplifiedText: 'Some spells need you to choose what they affect when you cast them.',
            example: '"Lightning Bolt" requires you to choose a target (creature, player, or planeswalker) when you cast it.',
            keywords: ['targeting', 'choose', 'targets', 'spells', 'abilities'],
            relatedRules: ['114.2', '114.3', '608.2b'],
            difficulty: 'intermediate'
        }
    ],

    // Zone Rules
    zones: [
        {
            id: 'rule-400-1',
            number: '400.1',
            category: 'zones',
            title: 'Game Zones',
            officialText: 'A zone is a place where objects can be during a game. There are normally seven zones: library, hand, battlefield, graveyard, stack, exile, and command.',
            simplifiedText: 'Cards exist in different zones: your deck (library), hand, battlefield (in play), graveyard (discard pile), stack, exile, and command zone.',
            example: 'Cards start in your library, go to your hand when drawn, enter the battlefield when played, and go to graveyard when destroyed.',
            keywords: ['zones', 'library', 'hand', 'battlefield', 'graveyard', 'stack', 'exile'],
            relatedRules: ['401.1', '402.1', '403.1', '404.1'],
            difficulty: 'beginner'
        },
        {
            id: 'rule-401-1',
            number: '401.1',
            category: 'zones',
            title: 'Library',
            officialText: 'When a game begins, each player\'s deck becomes their library.',
            simplifiedText: 'Your library is your deck - the pile of cards you draw from.',
            example: 'You draw one card from the top of your library during your draw step each turn.',
            keywords: ['library', 'deck', 'draw', 'cards', 'top'],
            relatedRules: ['121.1', '504.1', '401.2'],
            difficulty: 'beginner'
        },
        {
            id: 'rule-403-1',
            number: '403.1',
            category: 'zones',
            title: 'Battlefield',
            officialText: 'The battlefield is the zone where permanents exist. It used to be called the "in-play" zone.',
            simplifiedText: 'The battlefield is where your creatures, lands, and other permanents exist and can affect the game.',
            example: 'When you cast a creature spell, it enters the battlefield and can attack, block, and use its abilities.',
            keywords: ['battlefield', 'permanents', 'in-play', 'creatures', 'lands'],
            relatedRules: ['110.1', '403.2', '403.3'],
            difficulty: 'beginner'
        },
        {
            id: 'rule-404-1',
            number: '404.1',
            category: 'zones',
            title: 'Graveyard',
            officialText: 'A player\'s graveyard is their discard pile. Any object that\'s countered, discarded, destroyed, or sacrificed is put on top of its owner\'s graveyard.',
            simplifiedText: 'Your graveyard is where destroyed, discarded, or countered cards go.',
            example: 'When your creature dies in combat or a spell is countered, it goes to your graveyard.',
            keywords: ['graveyard', 'discard', 'destroyed', 'countered', 'sacrificed'],
            relatedRules: ['404.2', '404.3', '700.4'],
            difficulty: 'beginner'
        },
        {
            id: 'rule-406-1',
            number: '406.1',
            category: 'zones',
            title: 'Exile',
            officialText: 'The exile zone is essentially a holding area for objects. Some spells and abilities exile an object without any way to return that object to another zone.',
            simplifiedText: 'Exile is a zone where cards are removed from the game, usually permanently.',
            example: 'Cards exiled by "Path to Exile" are removed from the game and typically can\'t return.',
            keywords: ['exile', 'removed', 'holding', 'permanently', 'return'],
            relatedRules: ['406.2', '406.3', '610.3'],
            difficulty: 'intermediate'
        }
    ],

    // Multiplayer and Commander Rules
    multiplayer: [
        {
            id: 'rule-903-1',
            number: '903.1',
            category: 'multiplayer',
            title: 'Commander Format',
            officialText: 'In the Commander variant, each deck is led by a legendary creature designated as that deck\'s commander.',
            simplifiedText: 'Commander is a multiplayer format where you choose a legendary creature as your commander and build a 100-card deck around it.',
            example: 'If your commander is "Atraxa, Praetors\' Voice", your deck must be exactly 100 cards and can only contain white, blue, black, and green cards.',
            keywords: ['commander', 'legendary', 'creature', '100', 'cards', 'multiplayer'],
            relatedRules: ['903.2', '903.3', '903.4'],
            difficulty: 'intermediate'
        },
        {
            id: 'rule-903-8',
            number: '903.8',
            category: 'multiplayer',
            title: 'Commander Damage',
            officialText: 'A player that\'s been dealt 21 or more combat damage by the same commander over the course of the game loses the game.',
            simplifiedText: 'If any single commander deals 21 or more combat damage to you throughout the game, you lose.',
            example: 'If an opponent\'s commander hits you for 7 damage three times, you lose the game (7+7+7=21).',
            keywords: ['commander', 'damage', '21', 'combat', 'loses', 'game'],
            relatedRules: ['903.10', '704.5u'],
            difficulty: 'intermediate'
        },
        {
            id: 'rule-800-1',
            number: '800.1',
            category: 'multiplayer',
            title: 'Multiplayer Rules',
            officialText: 'A multiplayer game is a game that begins with more than two players.',
            simplifiedText: 'Multiplayer games have special rules for turn order, attacking, and player elimination.',
            example: 'In a 4-player game, players take turns in clockwise order, and you can attack any opponent or their planeswalkers.',
            keywords: ['multiplayer', 'players', 'turn', 'order', 'attacking'],
            relatedRules: ['101.1', '800.2', '800.4'],
            difficulty: 'intermediate'
        }
    ]
};

// Search and filter functionality
class MTGRulesSearch {
    constructor() {
        this.allRules = this.flattenRules();
        this.setupSearch();
    }

    flattenRules() {
        const flattened = [];
        Object.values(MTG_RULES_DATABASE).forEach(category => {
            flattened.push(...category);
        });
        return flattened;
    }

    setupSearch() {
        // This will be called when the rules tab is initialized
        this.renderRulesInterface();
    }

    searchRules(query, category = 'all', difficulty = 'all') {
        if (!query.trim() && category === 'all' && difficulty === 'all') {
            return this.allRules;
        }

        let results = this.allRules;

        // Filter by category
        if (category !== 'all') {
            results = results.filter(rule => rule.category === category);
        }

        // Filter by difficulty
        if (difficulty !== 'all') {
            results = results.filter(rule => rule.difficulty === difficulty);
        }

        // Text search
        if (query.trim()) {
            const searchTerm = query.toLowerCase();
            results = results.filter(rule => 
                rule.title.toLowerCase().includes(searchTerm) ||
                rule.simplifiedText.toLowerCase().includes(searchTerm) ||
                rule.officialText.toLowerCase().includes(searchTerm) ||
                rule.example.toLowerCase().includes(searchTerm) ||
                rule.keywords.some(keyword => keyword.toLowerCase().includes(searchTerm)) ||
                rule.number.includes(searchTerm)
            );
        }

        return results;
    }

    renderRulesInterface() {
        const rulesContainer = document.querySelector('.rules-categories');
        if (!rulesContainer) return;

        rulesContainer.innerHTML = `
            <div class="rules-search-interface">
                <div class="rules-filters">
                    <select id="rules-category-filter">
                        <option value="all">All Categories</option>
                        <option value="basic">Basic Rules</option>
                        <option value="phases">Turn Structure</option>
                        <option value="combat">Combat Rules</option>
                        <option value="keywords">Keyword Abilities</option>
                        <option value="spells">Spells & Abilities</option>
                        <option value="zones">Game Zones</option>
                        <option value="multiplayer">Multiplayer/Commander</option>
                    </select>
                    <select id="rules-difficulty-filter">
                        <option value="all">All Levels</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </select>
                    <button id="rules-clear-search" class="btn btn-secondary">Clear</button>
                </div>
                <div class="rules-results" id="rules-results">
                    <!-- Results will be populated here -->
                </div>
            </div>
        `;

        this.renderRulesResults(this.allRules);
        this.setupRulesEventListeners();
    }

    renderRulesResults(rules) {
        const resultsContainer = document.getElementById('rules-results');
        if (!resultsContainer) return;

        if (rules.length === 0) {
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search" style="font-size: 3rem; color: #ffd700; margin-bottom: 1rem;"></i>
                    <h3>No rules found</h3>
                    <p>Try adjusting your search terms or filters.</p>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = rules.map(rule => `
            <div class="rule-card" data-rule-id="${rule.id}">
                <div class="rule-header">
                    <div class="rule-number">${rule.number}</div>
                    <div class="rule-title">${rule.title}</div>
                    <div class="rule-difficulty ${rule.difficulty}">${rule.difficulty}</div>
                </div>
                <div class="rule-content">
                    <div class="rule-simplified">
                        <strong>Quick Explanation:</strong>
                        <p>${rule.simplifiedText}</p>
                    </div>
                    <div class="rule-example">
                        <strong>Example:</strong>
                        <p>${rule.example}</p>
                    </div>
                    <div class="rule-official" style="display: none;">
                        <strong>Official Rule Text:</strong>
                        <p>${rule.officialText}</p>
                    </div>
                    ${rule.relatedRules && rule.relatedRules.length > 0 ? `
                        <div class="rule-related">
                            <strong>Related Rules:</strong>
                            <span class="related-links">
                                ${rule.relatedRules.map(ruleNum => `<span class="rule-link" data-rule="${ruleNum}">${ruleNum}</span>`).join(', ')}
                            </span>
                        </div>
                    ` : ''}
                    <div class="rule-actions">
                        <button class="btn btn-small toggle-official" onclick="mtgRulesSearch.toggleOfficial('${rule.id}')">
                            Show Official Text
                        </button>
                        <button class="btn btn-small btn-secondary" onclick="mtgRulesSearch.copyRule('${rule.id}')">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    setupRulesEventListeners() {
        const searchInput = document.getElementById('rules-search');
        const categoryFilter = document.getElementById('rules-category-filter');
        const difficultyFilter = document.getElementById('rules-difficulty-filter');
        const clearButton = document.getElementById('rules-clear-search');

        if (searchInput) {
            searchInput.addEventListener('input', () => this.performSearch());
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.performSearch());
        }

        if (difficultyFilter) {
            difficultyFilter.addEventListener('change', () => this.performSearch());
        }

        if (clearButton) {
            clearButton.addEventListener('click', () => {
                if (searchInput) searchInput.value = '';
                if (categoryFilter) categoryFilter.value = 'all';
                if (difficultyFilter) difficultyFilter.value = 'all';
                this.performSearch();
            });
        }
    }

    performSearch() {
        const query = document.getElementById('rules-search')?.value || '';
        const category = document.getElementById('rules-category-filter')?.value || 'all';
        const difficulty = document.getElementById('rules-difficulty-filter')?.value || 'all';

        const results = this.searchRules(query, category, difficulty);
        this.renderRulesResults(results);
    }

    toggleOfficial(ruleId) {
        const ruleCard = document.querySelector(`[data-rule-id="${ruleId}"]`);
        if (!ruleCard) return;

        const officialDiv = ruleCard.querySelector('.rule-official');
        const toggleBtn = ruleCard.querySelector('.toggle-official');

        if (officialDiv.style.display === 'none') {
            officialDiv.style.display = 'block';
            toggleBtn.textContent = 'Hide Official Text';
        } else {
            officialDiv.style.display = 'none';
            toggleBtn.textContent = 'Show Official Text';
        }
    }

    copyRule(ruleId) {
        const rule = this.allRules.find(r => r.id === ruleId);
        if (!rule) return;

        const textToCopy = `${rule.number} - ${rule.title}\n\nSimplified: ${rule.simplifiedText}\n\nExample: ${rule.example}\n\nOfficial: ${rule.officialText}`;
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            // Show temporary success message
            const copyBtn = document.querySelector(`[onclick="mtgRulesSearch.copyRule('${ruleId}')"]`);
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            copyBtn.style.background = '#4CAF50';
            
            setTimeout(() => {
                copyBtn.innerHTML = originalText;
                copyBtn.style.background = '';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy rule:', err);
        });
    }

    jumpToRule(ruleNumber) {
        const rule = this.allRules.find(r => r.number === ruleNumber);
        if (rule) {
            // Clear search and show the specific rule
            document.getElementById('rules-search').value = rule.number;
            this.performSearch();
            
            // Scroll to the rule
            setTimeout(() => {
                const ruleCard = document.querySelector(`[data-rule-id="${rule.id}"]`);
                if (ruleCard) {
                    ruleCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    ruleCard.style.border = '2px solid #ffd700';
                    setTimeout(() => {
                        ruleCard.style.border = '';
                    }, 3000);
                }
            }, 100);
        }
    }
}

// Initialize the rules search system
let mtgRulesSearch;

// Export for global access
if (typeof window !== 'undefined') {
    window.MTG_RULES_DATABASE = MTG_RULES_DATABASE;
    window.MTGRulesSearch = MTGRulesSearch;
}
