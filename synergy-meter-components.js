// SynergyMeter UI Components for MTG Deck Builder
// Provides visual synergy feedback with tooltips, recommendations, and fantasy effects

class SynergyMeter {
    constructor(container, synergyEngine) {
        this.container = container;
        this.synergyEngine = synergyEngine;
        this.currentScore = 0;
        this.animationId = null;
        this.glowTimeout = null;
        
        this.init();
    }

    init() {
        this.createSynergyMeterHTML();
        this.setupEventListeners();
    }

    createSynergyMeterHTML() {
        const synergyHTML = `
            <div class="synergy-meter-container">
                <div class="synergy-header">
                    <h4 class="synergy-title">
                        <i class="fas fa-magic"></i>
                        Deck Synergy
                    </h4>
                    <div class="synergy-score-display">
                        <span class="synergy-score" id="synergy-score">0</span>
                        <span class="synergy-max">/100</span>
                    </div>
                </div>
                
                <div class="synergy-meter-wrapper">
                    <div class="synergy-meter" id="synergy-meter">
                        <div class="synergy-fill" id="synergy-fill"></div>
                        <div class="synergy-label" id="synergy-label">No Synergy</div>
                        <div class="synergy-particles" id="synergy-particles"></div>
                    </div>
                    <div class="synergy-breakdown-btn" id="synergy-breakdown-btn" title="View detailed breakdown">
                        <i class="fas fa-chart-pie"></i>
                    </div>
                </div>

                <div class="synergy-breakdown" id="synergy-breakdown" style="display: none;">
                    <div class="breakdown-header">
                        <h5>Synergy Breakdown</h5>
                        <button class="close-breakdown" id="close-breakdown">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="breakdown-categories">
                        <div class="breakdown-category">
                            <div class="category-header">
                                <span class="category-name">Archetype Cohesion</span>
                                <span class="category-weight">30%</span>
                            </div>
                            <div class="category-bar">
                                <div class="category-fill" id="cohesion-fill"></div>
                            </div>
                            <div class="category-score" id="cohesion-score">0</div>
                        </div>
                        
                        <div class="breakdown-category">
                            <div class="category-header">
                                <span class="category-name">Card Interactions</span>
                                <span class="category-weight">25%</span>
                            </div>
                            <div class="category-bar">
                                <div class="category-fill" id="interaction-fill"></div>
                            </div>
                            <div class="category-score" id="interaction-score">0</div>
                        </div>
                        
                        <div class="breakdown-category">
                            <div class="category-header">
                                <span class="category-name">Mana Curve</span>
                                <span class="category-weight">20%</span>
                            </div>
                            <div class="category-bar">
                                <div class="category-fill" id="curve-fill"></div>
                            </div>
                            <div class="category-score" id="curve-score">0</div>
                        </div>
                        
                        <div class="breakdown-category">
                            <div class="category-header">
                                <span class="category-name">Color Consistency</span>
                                <span class="category-weight">15%</span>
                            </div>
                            <div class="category-bar">
                                <div class="category-fill" id="color-fill"></div>
                            </div>
                            <div class="category-score" id="color-score">0</div>
                        </div>
                        
                        <div class="breakdown-category">
                            <div class="category-header">
                                <span class="category-name">Type Balance</span>
                                <span class="category-weight">10%</span>
                            </div>
                            <div class="category-bar">
                                <div class="category-fill" id="types-fill"></div>
                            </div>
                            <div class="category-score" id="types-score">0</div>
                        </div>
                    </div>
                </div>

                <div class="ai-recommendations" id="ai-recommendations">
                    <div class="recommendations-header">
                        <h5>
                            <i class="fas fa-lightbulb"></i>
                            AI Recommendations
                        </h5>
                        <div class="recommendations-toggle" id="recommendations-toggle">
                            <i class="fas fa-chevron-down"></i>
                        </div>
                    </div>
                    <div class="recommendations-content" id="recommendations-content">
                        <div class="recommendations-list" id="recommendations-list">
                            <div class="no-recommendations">
                                Add cards to your deck to get personalized recommendations!
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.container.innerHTML = synergyHTML;
    }

    setupEventListeners() {
        // Breakdown toggle
        const breakdownBtn = document.getElementById('synergy-breakdown-btn');
        const breakdown = document.getElementById('synergy-breakdown');
        const closeBreakdown = document.getElementById('close-breakdown');

        if (breakdownBtn) {
            breakdownBtn.addEventListener('click', () => {
                breakdown.style.display = breakdown.style.display === 'none' ? 'block' : 'none';
            });
        }

        if (closeBreakdown) {
            closeBreakdown.addEventListener('click', () => {
                breakdown.style.display = 'none';
            });
        }

        // Recommendations toggle
        const recommendationsToggle = document.getElementById('recommendations-toggle');
        const recommendationsContent = document.getElementById('recommendations-content');

        if (recommendationsToggle) {
            recommendationsToggle.addEventListener('click', () => {
                const isExpanded = recommendationsContent.style.display !== 'none';
                recommendationsContent.style.display = isExpanded ? 'none' : 'block';
                recommendationsToggle.innerHTML = isExpanded ? 
                    '<i class="fas fa-chevron-down"></i>' : 
                    '<i class="fas fa-chevron-up"></i>';
            });
        }

        // Synergy meter hover effects
        const synergyMeter = document.getElementById('synergy-meter');
        if (synergyMeter) {
            synergyMeter.addEventListener('mouseenter', () => {
                this.showTooltip();
            });
            
            synergyMeter.addEventListener('mouseleave', () => {
                this.hideTooltip();
            });
        }
    }

    updateSynergy(deck) {
        if (!this.synergyEngine || !deck) return;

        const score = this.synergyEngine.getSynergyScore(deck);
        const breakdown = this.calculateBreakdown(deck);
        const suggestions = this.synergyEngine.suggestImprovements(deck);

        this.animateScoreChange(this.currentScore, score);
        this.updateBreakdown(breakdown);
        this.updateRecommendations(suggestions);
        this.updateVisualEffects(score);

        this.currentScore = score;
    }

    calculateBreakdown(deck) {
        if (!deck.cards || deck.cards.length === 0) {
            return {
                cohesion: 0,
                interaction: 0,
                curve: 0,
                color: 0,
                types: 0
            };
        }

        // Calculate individual component scores
        const tagCounts = this.synergyEngine.countTags(deck.cards);
        const dominantTag = this.synergyEngine.getDominantTag(tagCounts);
        const cohesionRatio = deck.cards.filter(c => 
            this.synergyEngine.getCardTags(c.name).includes(dominantTag)
        ).length / deck.cards.length;

        const interactionHits = deck.cards.filter(c =>
            this.synergyEngine.getSynergyPartners(c.name).some(partner => 
                deck.cards.some(d => d.name === partner)
            )
        ).length;

        return {
            cohesion: Math.round(cohesionRatio * 100),
            interaction: Math.round((interactionHits / deck.cards.length) * 100),
            curve: Math.round(this.synergyEngine.evaluateCurve(deck.stats.manaCurve) * 100),
            color: Math.round(this.synergyEngine.evaluateColorMatch(deck.stats.colorSpread) * 100),
            types: Math.round(this.synergyEngine.evaluateTypeBalance(deck.stats.typeBreakdown) * 100)
        };
    }

    animateScoreChange(fromScore, toScore) {
        const scoreElement = document.getElementById('synergy-score');
        const fillElement = document.getElementById('synergy-fill');
        const labelElement = document.getElementById('synergy-label');

        if (!scoreElement || !fillElement || !labelElement) return;

        // Cancel any existing animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        const duration = 1000; // 1 second
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            
            const currentScore = Math.round(fromScore + (toScore - fromScore) * easeOutCubic);
            
            // Update score display
            scoreElement.textContent = currentScore;
            
            // Update fill bar
            fillElement.style.width = `${currentScore}%`;
            fillElement.style.backgroundColor = this.synergyEngine.getSynergyColor(currentScore);
            
            // Update label
            labelElement.textContent = this.synergyEngine.getSynergyTitle(currentScore);
            
            if (progress < 1) {
                this.animationId = requestAnimationFrame(animate);
            } else {
                this.animationId = null;
                // Trigger special effects for high scores
                if (toScore >= 70) {
                    this.triggerSpecialEffects(toScore);
                }
            }
        };

        this.animationId = requestAnimationFrame(animate);
    }

    updateBreakdown(breakdown) {
        const categories = ['cohesion', 'interaction', 'curve', 'color', 'types'];
        
        categories.forEach(category => {
            const fillElement = document.getElementById(`${category}-fill`);
            const scoreElement = document.getElementById(`${category}-score`);
            
            if (fillElement && scoreElement) {
                const score = breakdown[category] || 0;
                fillElement.style.width = `${score}%`;
                fillElement.style.backgroundColor = this.synergyEngine.getSynergyColor(score);
                scoreElement.textContent = `${score}%`;
            }
        });
    }

    updateRecommendations(suggestions) {
        const recommendationsList = document.getElementById('recommendations-list');
        if (!recommendationsList) return;

        if (!suggestions || suggestions.length === 0) {
            recommendationsList.innerHTML = `
                <div class="no-recommendations">
                    <i class="fas fa-check-circle"></i>
                    Your deck looks good! No specific recommendations at this time.
                </div>
            `;
            return;
        }

        recommendationsList.innerHTML = suggestions.map((suggestion, index) => `
            <div class="suggestion-card" style="animation-delay: ${index * 0.1}s">
                <div class="suggestion-icon">
                    <i class="fas fa-lightbulb"></i>
                </div>
                <div class="suggestion-text">${suggestion}</div>
                <div class="suggestion-priority ${this.getSuggestionPriority(suggestion)}">
                    ${this.getSuggestionPriorityText(suggestion)}
                </div>
            </div>
        `).join('');
    }

    getSuggestionPriority(suggestion) {
        if (suggestion.includes('replacing') || suggestion.includes('doesn\'t support')) {
            return 'high';
        } else if (suggestion.includes('Add') && suggestion.includes('boost synergy')) {
            return 'medium';
        }
        return 'low';
    }

    getSuggestionPriorityText(suggestion) {
        const priority = this.getSuggestionPriority(suggestion);
        switch (priority) {
            case 'high': return 'High';
            case 'medium': return 'Medium';
            case 'low': return 'Low';
            default: return 'Info';
        }
    }

    updateVisualEffects(score) {
        const meterElement = document.getElementById('synergy-meter');
        if (!meterElement) return;

        // Remove existing effect classes
        meterElement.classList.remove('glow-arcane', 'glow-legendary', 'glow-powerful');

        // Add appropriate glow effect
        if (score >= 90) {
            meterElement.classList.add('glow-legendary');
        } else if (score >= 80) {
            meterElement.classList.add('glow-powerful');
        } else if (score >= 70) {
            meterElement.classList.add('glow-arcane');
        }
    }

    triggerSpecialEffects(score) {
        if (score >= 90) {
            this.createParticleEffect('legendary');
        } else if (score >= 80) {
            this.createParticleEffect('powerful');
        } else if (score >= 70) {
            this.createParticleEffect('arcane');
        }
    }

    createParticleEffect(type) {
        const particlesContainer = document.getElementById('synergy-particles');
        if (!particlesContainer) return;

        // Clear existing particles
        particlesContainer.innerHTML = '';

        const colors = {
            legendary: ['#ffd700', '#ffed4e', '#fff59d'],
            powerful: ['#e74c3c', '#f39c12', '#ff6b6b'],
            arcane: ['#9b59b6', '#8e44ad', '#bb6bd9']
        };

        const particleColors = colors[type] || colors.arcane;

        // Create multiple particles
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.className = 'synergy-particle';
            particle.style.cssText = `
                position: absolute;
                width: 4px;
                height: 4px;
                background: ${particleColors[Math.floor(Math.random() * particleColors.length)]};
                border-radius: 50%;
                pointer-events: none;
                animation: particleFloat 2s ease-out forwards;
                animation-delay: ${Math.random() * 0.5}s;
                left: ${Math.random() * 100}%;
                top: 50%;
                box-shadow: 0 0 6px currentColor;
            `;
            
            particlesContainer.appendChild(particle);
            
            // Remove particle after animation
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 2500);
        }
    }

    showTooltip() {
        // Implementation for detailed tooltip on hover
        const tooltip = document.createElement('div');
        tooltip.className = 'synergy-tooltip';
        tooltip.innerHTML = `
            <div class="tooltip-content">
                <h6>Synergy Score: ${this.currentScore}/100</h6>
                <p>${this.synergyEngine.getSynergyTitle(this.currentScore)}</p>
                <small>Click the chart icon for detailed breakdown</small>
            </div>
        `;
        
        document.body.appendChild(tooltip);
        
        // Position tooltip
        const meter = document.getElementById('synergy-meter');
        if (meter) {
            const rect = meter.getBoundingClientRect();
            tooltip.style.cssText = `
                position: fixed;
                top: ${rect.top - tooltip.offsetHeight - 10}px;
                left: ${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px;
                z-index: 1000;
                background: linear-gradient(135deg, #2a1a4d, #1a0f2f);
                color: white;
                padding: 12px;
                border-radius: 8px;
                border: 1px solid #e74c3c;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                animation: fadeIn 0.2s ease;
            `;
        }
        
        this.currentTooltip = tooltip;
    }

    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.style.animation = 'fadeOut 0.2s ease';
            setTimeout(() => {
                if (this.currentTooltip && this.currentTooltip.parentNode) {
                    this.currentTooltip.parentNode.removeChild(this.currentTooltip);
                }
                this.currentTooltip = null;
            }, 200);
        }
    }

    // Public method to manually trigger synergy update
    refresh(deck) {
        this.updateSynergy(deck);
    }

    // Get current synergy score
    getCurrentScore() {
        return this.currentScore;
    }

    // Destroy the synergy meter and clean up
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.glowTimeout) {
            clearTimeout(this.glowTimeout);
        }
        if (this.currentTooltip) {
            this.hideTooltip();
        }
        
        this.container.innerHTML = '';
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SynergyMeter;
} else {
    window.SynergyMeter = SynergyMeter;
}
