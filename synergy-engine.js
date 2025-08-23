// Advanced Synergy Engine for MTG Deck Builder
// Implements sophisticated synergy scoring with card interactions, archetype detection, and AI recommendations

class SynergyEngine {
    constructor() {
        this.weights = { 
            cohesion: 30, 
            interaction: 25, 
            curve: 20, 
            color: 15, 
            types: 10 
        };
        
        // Card synergy database - expandable
        this.synergyDatabase = {
            // Goblin tribal synergies
            'Goblin Guide': ['Goblin Chieftain', 'Goblin King', 'Goblin Wardriver', 'Goblin Bushwhacker'],
            'Goblin Chieftain': ['Goblin Guide', 'Goblin King', 'Goblin Wardriver', 'Mogg War Marshal'],
            'Goblin King': ['Goblin Guide', 'Goblin Chieftain', 'Goblin Wardriver', 'Mogg War Marshal'],
            
            // Burn synergies
            'Lightning Bolt': ['Lava Spike', 'Rift Bolt', 'Chain Lightning', 'Monastery Swiftspear'],
            'Lava Spike': ['Lightning Bolt', 'Rift Bolt', 'Chain Lightning', 'Monastery Swiftspear'],
            'Monastery Swiftspear': ['Lightning Bolt', 'Lava Spike', 'Rift Bolt', 'Chain Lightning'],
            
            // Prowess synergies
            'Monastery Swiftspear': ['Lightning Bolt', 'Lava Spike', 'Manamorphose', 'Mutagenic Growth'],
            'Soul-Scar Mage': ['Lightning Bolt', 'Lava Spike', 'Monastery Swiftspear', 'Manamorphose'],
            
            // Artifact synergies
            'Cranial Plating': ['Ornithopter', 'Signal Pest', 'Vault Skirge', 'Memnite'],
            'Ornithopter': ['Cranial Plating', 'Signal Pest', 'Springleaf Drum', 'Ensoul Artifact'],
            
            // Combo pieces
            'Splinter Twin': ['Deceiver Exarch', 'Pestermite', 'Village Bell-Ringer'],
            'Deceiver Exarch': ['Splinter Twin', 'Kiki-Jiki, Mirror Breaker'],
            
            // Control synergies
            'Counterspell': ['Snapcaster Mage', 'Cryptic Command', 'Force of Negation'],
            'Snapcaster Mage': ['Lightning Bolt', 'Counterspell', 'Path to Exile', 'Cryptic Command']
        };
        
        // Archetype tags for cards
        this.archetypeTags = {
            // Aggro/Burn
            'Lightning Bolt': ['burn', 'aggro', 'direct-damage'],
            'Goblin Guide': ['aggro', 'tribal-goblin', 'hasty-creature'],
            'Monastery Swiftspear': ['aggro', 'prowess', 'hasty-creature'],
            'Lava Spike': ['burn', 'direct-damage'],
            'Eidolon of the Great Revel': ['burn', 'aggro', 'damage-trigger'],
            
            // Tribal
            'Goblin Chieftain': ['tribal-goblin', 'lord', 'anthem'],
            'Goblin King': ['tribal-goblin', 'lord', 'anthem'],
            'Lord of Atlantis': ['tribal-merfolk', 'lord', 'anthem'],
            
            // Control
            'Counterspell': ['control', 'permission', 'instant'],
            'Wrath of God': ['control', 'board-wipe', 'sorcery'],
            'Snapcaster Mage': ['control', 'value', 'flash'],
            
            // Combo
            'Splinter Twin': ['combo', 'enchantment', 'infinite'],
            'Deceiver Exarch': ['combo', 'creature', 'tap-untap'],
            
            // Ramp
            'Birds of Paradise': ['ramp', 'mana-dork', 'fixing'],
            'Llanowar Elves': ['ramp', 'mana-dork', 'green'],
            
            // Artifacts
            'Cranial Plating': ['artifact', 'equipment', 'aggro'],
            'Ornithopter': ['artifact', 'creature', 'free'],
            
            // Lands
            'Mountain': ['land', 'basic', 'red'],
            'Island': ['land', 'basic', 'blue'],
            'Forest': ['land', 'basic', 'green'],
            'Plains': ['land', 'basic', 'white'],
            'Swamp': ['land', 'basic', 'black']
        };
    }

    // Main synergy scoring function
    getSynergyScore(deck) {
        if (!deck.cards || deck.cards.length === 0) {
            return 0;
        }

        let score = 0;

        // Archetype Cohesion (30%)
        const tagCounts = this.countTags(deck.cards);
        const dominantTag = this.getDominantTag(tagCounts);
        const cohesionRatio = deck.cards.filter(c => 
            this.getCardTags(c.name).includes(dominantTag)
        ).length / deck.cards.length;
        score += cohesionRatio * this.weights.cohesion;

        // Card Interactions (25%)
        const interactionHits = deck.cards.filter(c =>
            this.getSynergyPartners(c.name).some(partner => 
                deck.cards.some(d => d.name === partner)
            )
        ).length;
        score += (interactionHits / deck.cards.length) * this.weights.interaction;

        // Mana Curve (20%)
        const curveScore = this.evaluateCurve(deck.stats.manaCurve);
        score += curveScore * this.weights.curve;

        // Color Match (15%)
        const colorScore = this.evaluateColorMatch(deck.stats.colorSpread, deck.stats.manaSources);
        score += colorScore * this.weights.color;

        // Type Composition (10%)
        const typeScore = this.evaluateTypeBalance(deck.stats.typeBreakdown);
        score += typeScore * this.weights.types;

        return Math.round(Math.max(0, Math.min(100, score)));
    }

    // Get archetype tags for a card
    getCardTags(cardName) {
        return this.archetypeTags[cardName] || [];
    }

    // Get synergy partners for a card
    getSynergyPartners(cardName) {
        return this.synergyDatabase[cardName] || [];
    }

    // Count archetype tags across deck
    countTags(cards) {
        const tagCounts = {};
        
        cards.forEach(card => {
            const tags = this.getCardTags(card.name);
            tags.forEach(tag => {
                tagCounts[tag] = (tagCounts[tag] || 0) + card.qty;
            });
        });
        
        return tagCounts;
    }

    // Find the most prominent archetype
    getDominantTag(tagCounts) {
        let maxCount = 0;
        let dominantTag = '';
        
        Object.entries(tagCounts).forEach(([tag, count]) => {
            if (count > maxCount) {
                maxCount = count;
                dominantTag = tag;
            }
        });
        
        return dominantTag;
    }

    // Evaluate mana curve quality
    evaluateCurve(manaCurve) {
        if (!manaCurve || manaCurve.length === 0) return 0;
        
        const totalNonLand = manaCurve.reduce((sum, count) => sum + count, 0);
        if (totalNonLand === 0) return 0;
        
        // Ideal curve peaks at 1-2 CMC for aggro, 2-3 for midrange
        const peakCMC = manaCurve.indexOf(Math.max(...manaCurve));
        let curveScore = 0.5; // Base score
        
        // Reward good curve shapes
        if (peakCMC >= 1 && peakCMC <= 3) {
            curveScore += 0.3;
        }
        
        // Penalize too many high-cost cards
        const highCostCards = manaCurve.slice(5).reduce((sum, count) => sum + count, 0);
        const highCostRatio = highCostCards / totalNonLand;
        if (highCostRatio > 0.3) {
            curveScore -= 0.2;
        }
        
        // Reward having some 1-drops
        if (manaCurve[1] > 0) {
            curveScore += 0.2;
        }
        
        return Math.max(0, Math.min(1, curveScore));
    }

    // Evaluate color consistency
    evaluateColorMatch(colorSpread, manaSources) {
        if (!colorSpread || Object.keys(colorSpread).length === 0) return 1;
        
        const colorCount = Object.keys(colorSpread).filter(color => color !== 'Colorless').length;
        let colorScore = 1;
        
        // Penalize too many colors without proper mana base
        if (colorCount === 1) {
            colorScore = 1; // Mono-color is always consistent
        } else if (colorCount === 2) {
            colorScore = 0.8; // Two colors are manageable
        } else if (colorCount === 3) {
            colorScore = 0.6; // Three colors need good mana
        } else if (colorCount >= 4) {
            colorScore = 0.4; // Four+ colors are very demanding
        }
        
        return colorScore;
    }

    // Evaluate type balance
    evaluateTypeBalance(typeBreakdown) {
        if (!typeBreakdown || Object.keys(typeBreakdown).length === 0) return 0;
        
        const totalCards = Object.values(typeBreakdown).reduce((sum, count) => sum + count, 0);
        if (totalCards === 0) return 0;
        
        const creatureCount = typeBreakdown.Creature || 0;
        const spellCount = (typeBreakdown.Instant || 0) + (typeBreakdown.Sorcery || 0);
        const landCount = typeBreakdown.Land || 0;
        
        let typeScore = 0.5; // Base score
        
        // Reward reasonable creature/spell ratios
        const creatureRatio = creatureCount / totalCards;
        const spellRatio = spellCount / totalCards;
        const landRatio = landCount / totalCards;
        
        // Good land ratio (35-45% for most decks)
        if (landRatio >= 0.35 && landRatio <= 0.45) {
            typeScore += 0.3;
        } else if (landRatio < 0.3 || landRatio > 0.5) {
            typeScore -= 0.2;
        }
        
        // Balanced creature/spell mix
        if (creatureRatio >= 0.2 && creatureRatio <= 0.6) {
            typeScore += 0.2;
        }
        
        return Math.max(0, Math.min(1, typeScore));
    }

    // Generate improvement suggestions
    suggestImprovements(deck) {
        const suggestions = [];
        
        if (!deck.cards || deck.cards.length === 0) {
            return ['Add cards to your deck to get suggestions!'];
        }

        // Flag off-theme cards
        const tagCounts = this.countTags(deck.cards);
        const dominantTag = this.getDominantTag(tagCounts);
        
        if (dominantTag) {
            deck.cards.forEach(card => {
                const cardTags = this.getCardTags(card.name);
                if (!cardTags.includes(dominantTag) && cardTags.length > 0) {
                    suggestions.push(`Consider replacing ${card.name} — it doesn't support your ${dominantTag} strategy.`);
                }
            });
        }

        // Recommend synergy boosters
        const missingSynergies = this.findMissingSynergies(deck);
        missingSynergies.forEach(combo => {
            suggestions.push(`Add ${combo.card} to boost synergy with ${combo.partner}.`);
        });

        // Mana curve suggestions
        const curveIssues = this.analyzeCurveIssues(deck.stats.manaCurve);
        suggestions.push(...curveIssues);

        // Color fixing suggestions
        const colorIssues = this.analyzeColorIssues(deck.stats.colorSpread);
        suggestions.push(...colorIssues);

        return suggestions.slice(0, 8); // Limit to 8 suggestions
    }

    // Find missing synergy opportunities
    findMissingSynergies(deck) {
        const missingSynergies = [];
        const deckCardNames = deck.cards.map(c => c.name);
        
        deck.cards.forEach(card => {
            const partners = this.getSynergyPartners(card.name);
            partners.forEach(partner => {
                if (!deckCardNames.includes(partner)) {
                    missingSynergies.push({
                        card: partner,
                        partner: card.name,
                        strength: this.calculateSynergyStrength(card.name, partner)
                    });
                }
            });
        });
        
        // Sort by synergy strength and return top suggestions
        return missingSynergies
            .sort((a, b) => b.strength - a.strength)
            .slice(0, 3);
    }

    // Calculate synergy strength between two cards
    calculateSynergyStrength(card1, card2) {
        // Simple strength calculation - can be expanded
        const tags1 = this.getCardTags(card1);
        const tags2 = this.getCardTags(card2);
        
        const sharedTags = tags1.filter(tag => tags2.includes(tag));
        return sharedTags.length * 10 + Math.random() * 5; // Add some randomness
    }

    // Analyze mana curve issues
    analyzeCurveIssues(manaCurve) {
        const issues = [];
        
        if (!manaCurve || manaCurve.length === 0) return issues;
        
        const totalCards = manaCurve.reduce((sum, count) => sum + count, 0);
        if (totalCards === 0) return issues;
        
        // Check for too many high-cost cards
        const highCostCards = manaCurve.slice(5).reduce((sum, count) => sum + count, 0);
        if (highCostCards / totalCards > 0.3) {
            issues.push('Consider reducing high-cost cards for better consistency.');
        }
        
        // Check for lack of early game
        if (manaCurve[1] === 0 && manaCurve[2] < totalCards * 0.2) {
            issues.push('Add more low-cost cards for early game presence.');
        }
        
        // Check for curve gaps
        for (let i = 1; i < 4; i++) {
            if (manaCurve[i] === 0 && totalCards > 10) {
                issues.push(`Consider adding ${i}-cost cards to smooth your curve.`);
                break;
            }
        }
        
        return issues;
    }

    // Analyze color fixing issues
    analyzeColorIssues(colorSpread) {
        const issues = [];
        
        if (!colorSpread) return issues;
        
        const colors = Object.keys(colorSpread).filter(color => color !== 'Colorless');
        
        if (colors.length >= 3) {
            issues.push('Consider adding dual lands or mana fixing for your multicolor deck.');
        }
        
        if (colors.length >= 4) {
            issues.push('Your deck has many colors - ensure you have enough mana sources for each.');
        }
        
        return issues;
    }

    // Get synergy title based on score
    getSynergyTitle(score) {
        if (score >= 90) return 'Legendary Synergy';
        if (score >= 80) return 'Powerful Synergy';
        if (score >= 70) return 'Strong Synergy';
        if (score >= 60) return 'Good Synergy';
        if (score >= 50) return 'Decent Synergy';
        if (score >= 40) return 'Weak Synergy';
        if (score >= 30) return 'Poor Synergy';
        return 'No Synergy';
    }

    // Get synergy color based on score
    getSynergyColor(score) {
        if (score >= 80) return '#e74c3c'; // Red for high synergy
        if (score >= 60) return '#f39c12'; // Orange for good synergy
        if (score >= 40) return '#f1c40f'; // Yellow for decent synergy
        return '#95a5a6'; // Gray for poor synergy
    }

    // Add a card to synergy database (for dynamic learning)
    addSynergyRelation(card1, card2) {
        if (!this.synergyDatabase[card1]) {
            this.synergyDatabase[card1] = [];
        }
        if (!this.synergyDatabase[card2]) {
            this.synergyDatabase[card2] = [];
        }
        
        if (!this.synergyDatabase[card1].includes(card2)) {
            this.synergyDatabase[card1].push(card2);
        }
        if (!this.synergyDatabase[card2].includes(card1)) {
            this.synergyDatabase[card2].push(card1);
        }
    }

    // Add archetype tags to a card
    addArchetypeTags(cardName, tags) {
        if (!this.archetypeTags[cardName]) {
            this.archetypeTags[cardName] = [];
        }
        
        tags.forEach(tag => {
            if (!this.archetypeTags[cardName].includes(tag)) {
                this.archetypeTags[cardName].push(tag);
            }
        });
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SynergyEngine;
} else {
    window.SynergyEngine = SynergyEngine;
}
