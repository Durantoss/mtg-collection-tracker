// Deck QR Code Integration - MTG Collection Tracker
// Provides QR code generation and scanning for deck sharing

class DeckQRIntegration {
    constructor(app, deckBuilder) {
        this.app = app;
        this.deckBuilder = deckBuilder;
        this.qrCanvas = null;
        this.qrVideo = null;
        this.scanning = false;
        this.stream = null;
        
        this.init();
    }

    init() {
        this.loadQRLibraries();
        this.setupEventListeners();
        this.addQRButtons();
    }

    // Load QR code libraries
    loadQRLibraries() {
        // Load QRCode.js for generation
        if (!window.QRCode) {
            const qrScript = document.createElement('script');
            qrScript.src = 'https://cdn.jsdelivr.net/npm/qrcode/build/qrcode.min.js';
            document.head.appendChild(qrScript);
        }

        // Load jsQR for scanning
        if (!window.jsQR) {
            const jsQRScript = document.createElement('script');
            jsQRScript.src = 'https://cdn.jsdelivr.net/npm/jsqr/dist/jsQR.js';
            document.head.appendChild(jsQRScript);
        }
    }

    // Add QR buttons to deck management section
    addQRButtons() {
        const deckActions = document.querySelector('.deck-actions');
        if (!deckActions) return;

        // Create QR Generate button
        const generateQRBtn = document.createElement('button');
        generateQRBtn.className = 'btn btn-secondary';
        generateQRBtn.id = 'generate-qr-btn';
        generateQRBtn.innerHTML = '<i class="fas fa-qrcode"></i> Share QR';
        
        // Create QR Scan button
        const scanQRBtn = document.createElement('button');
        scanQRBtn.className = 'btn btn-secondary';
        scanQRBtn.id = 'scan-qr-btn';
        scanQRBtn.innerHTML = '<i class="fas fa-camera"></i> Scan QR';

        deckActions.appendChild(generateQRBtn);
        deckActions.appendChild(scanQRBtn);
    }

    setupEventListeners() {
        // Wait for buttons to be added
        setTimeout(() => {
            const generateBtn = document.getElementById('generate-qr-btn');
            const scanBtn = document.getElementById('scan-qr-btn');

            if (generateBtn) {
                generateBtn.addEventListener('click', () => this.showGenerateQRModal());
            }

            if (scanBtn) {
                scanBtn.addEventListener('click', () => this.showScanQRModal());
            }
        }, 100);
    }

    // Generate QR code for current deck
    generateQRCode() {
        if (!this.deckBuilder.currentDeck || this.deckBuilder.currentDeck.length === 0) {
            if (this.app.showNotification) {
                this.app.showNotification('Cannot generate QR for empty deck', 'warning');
            }
            return;
        }

        // Create deck object for QR code
        const deckObject = {
            deckName: this.deckBuilder.deckName || 'Untitled Deck',
            cards: this.deckBuilder.currentDeck.map(card => ({
                name: card.name,
                qty: card.quantity,
                type: this.getSimplifiedType(card.type),
                manaCost: card.manaCost,
                set: card.set || card.setCode,
                power: card.power,
                toughness: card.toughness,
                effect: this.getCardEffect(card)
            })),
            synergyScore: this.calculateSynergyScore(),
            stats: this.deckBuilder.deckStats,
            exportDate: new Date().toISOString()
        };

        return deckObject;
    }

    // Show QR generation modal
    showGenerateQRModal() {
        const deckData = this.generateQRCode();
        if (!deckData) return;

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'qr-generate-modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>🧙 Share Your Deck</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body" style="text-align: center;">
                    <div class="deck-summary" style="background: var(--bg-charcoal); padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid var(--red-primary);">
                        <h4 style="color: var(--red-primary); margin-bottom: 10px;">${deckData.deckName}</h4>
                        <div style="display: flex; justify-content: space-around; font-size: 0.9rem; color: var(--text-muted);">
                            <span>${deckData.cards.length} Unique Cards</span>
                            <span>${deckData.stats.totalCards} Total Cards</span>
                            <span>Synergy: ${deckData.synergyScore}%</span>
                        </div>
                    </div>
                    
                    <canvas id="qr-canvas" style="border: 3px solid var(--red-primary); border-radius: 12px; box-shadow: 0 0 12px var(--red-primary); margin-bottom: 20px;"></canvas>
                    
                    <div class="synergy-meter" style="margin: 20px 0;">
                        <div style="background: #444; height: 20px; border-radius: 10px; overflow: hidden; margin-bottom: 10px;">
                            <div id="synergy-fill" style="height: 100%; background: linear-gradient(to right, #ff5c5c, #ffa64d, #5cff5c); width: ${deckData.synergyScore}%; transition: width 1s ease-in-out;"></div>
                        </div>
                        <div style="color: var(--text-muted); font-size: 0.9rem;">Deck Synergy Score</div>
                    </div>
                    
                    <div class="qr-actions" style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                        <button class="btn btn-primary" onclick="deckQRIntegration.downloadQRCode()">
                            <i class="fas fa-download"></i> Download QR
                        </button>
                        <button class="btn btn-secondary" onclick="deckQRIntegration.shareQRCode()">
                            <i class="fas fa-share"></i> Share
                        </button>
                        <button class="btn btn-secondary" onclick="deckQRIntegration.copyDeckURL()">
                            <i class="fas fa-link"></i> Copy Link
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.classList.add('active');
        modal.style.display = 'block';

        // Generate QR code
        setTimeout(() => {
            this.renderQRCode(deckData);
        }, 100);

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Render QR code to canvas
    renderQRCode(deckData) {
        const canvas = document.getElementById('qr-canvas');
        if (!canvas || !window.QRCode) return;

        const deckDataString = JSON.stringify(deckData);
        
        QRCode.toCanvas(canvas, deckDataString, {
            width: 256,
            margin: 2,
            color: {
                dark: '#e50914',
                light: '#ffffff'
            },
            errorCorrectionLevel: 'M'
        }, (error) => {
            if (error) {
                console.error('QR Code generation error:', error);
                if (this.app.showNotification) {
                    this.app.showNotification('Failed to generate QR code', 'error');
                }
            } else {
                console.log('QR Code generated successfully!');
            }
        });
    }

    // Show QR scanning modal
    showScanQRModal() {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'qr-scan-modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 500px;">
                <div class="modal-header">
                    <h3>🔍 Scan Deck QR Code</h3>
                    <button class="close-btn" onclick="deckQRIntegration.stopScanning(); this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body" style="text-align: center;">
                    <div style="margin-bottom: 20px; color: var(--text-muted);">
                        <p>Point your camera at a deck QR code to import it</p>
                    </div>
                    
                    <video id="qr-video" width="300" height="300" autoplay style="border: 3px solid var(--red-primary); border-radius: 12px; box-shadow: 0 0 12px var(--red-primary); margin-bottom: 20px; background: #000;"></video>
                    
                    <div id="scan-status" style="margin-bottom: 20px; padding: 10px; border-radius: 8px; background: var(--bg-charcoal); color: var(--text-muted);">
                        Initializing camera...
                    </div>
                    
                    <div class="scan-actions">
                        <button class="btn btn-secondary" onclick="deckQRIntegration.stopScanning(); this.closest('.modal').remove();">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.classList.add('active');
        modal.style.display = 'block';

        // Start scanning
        setTimeout(() => {
            this.startScanning();
        }, 100);

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.stopScanning();
                modal.remove();
            }
        });
    }

    // Start QR code scanning
    async startScanning() {
        const video = document.getElementById('qr-video');
        const statusDiv = document.getElementById('scan-status');
        
        if (!video || !window.jsQR) {
            if (statusDiv) statusDiv.textContent = 'QR scanning library not loaded';
            return;
        }

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "environment" } 
            });
            
            video.srcObject = this.stream;
            this.scanning = true;
            
            if (statusDiv) statusDiv.textContent = 'Camera ready - scan a QR code';

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            const scanLoop = () => {
                if (!this.scanning) return;

                if (video.readyState === video.HAVE_ENOUGH_DATA) {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    context.drawImage(video, 0, 0, canvas.width, canvas.height);
                    
                    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, canvas.width, canvas.height);

                    if (code) {
                        this.handleScannedQR(code.data);
                        return;
                    }
                }
                
                requestAnimationFrame(scanLoop);
            };
            
            scanLoop();
            
        } catch (error) {
            console.error('Camera access error:', error);
            if (statusDiv) {
                statusDiv.textContent = 'Camera access denied or not available';
                statusDiv.style.color = '#e74c3c';
            }
            if (this.app.showNotification) {
                this.app.showNotification('Camera access denied', 'error');
            }
        }
    }

    // Stop QR code scanning
    stopScanning() {
        this.scanning = false;
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
    }

    // Handle scanned QR code
    handleScannedQR(qrData) {
        this.stopScanning();
        
        try {
            const deckData = JSON.parse(qrData);
            
            // Validate deck data structure
            if (!deckData.deckName || !deckData.cards || !Array.isArray(deckData.cards)) {
                throw new Error('Invalid deck data format');
            }

            this.showImportDeckModal(deckData);
            
        } catch (error) {
            console.error('QR decode error:', error);
            if (this.app.showNotification) {
                this.app.showNotification('Invalid QR code format', 'error');
            }
        }
    }

    // Show import deck confirmation modal
    showImportDeckModal(deckData) {
        // Close scan modal
        const scanModal = document.getElementById('qr-scan-modal');
        if (scanModal) scanModal.remove();

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px;">
                <div class="modal-header">
                    <h3>📦 Import Deck</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="deck-preview" style="background: var(--bg-charcoal); padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 1px solid var(--red-primary);">
                        <h4 style="color: var(--red-primary); margin-bottom: 15px;">🧙 ${deckData.deckName}</h4>
                        
                        <div class="deck-stats-preview" style="display: flex; justify-content: space-around; margin-bottom: 15px; font-size: 0.9rem;">
                            <div style="text-align: center;">
                                <div style="color: var(--red-primary); font-weight: 700;">${deckData.stats?.totalCards || deckData.cards.reduce((sum, card) => sum + card.qty, 0)}</div>
                                <div style="color: var(--text-muted);">Total Cards</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="color: var(--red-primary); font-weight: 700;">${deckData.cards.length}</div>
                                <div style="color: var(--text-muted);">Unique Cards</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="color: var(--red-primary); font-weight: 700;">${deckData.synergyScore || 0}%</div>
                                <div style="color: var(--text-muted);">Synergy</div>
                            </div>
                        </div>
                        
                        <div class="synergy-meter" style="margin-bottom: 15px;">
                            <div style="background: #444; height: 16px; border-radius: 8px; overflow: hidden;">
                                <div style="height: 100%; background: linear-gradient(to right, #ff5c5c, #ffa64d, #5cff5c); width: ${deckData.synergyScore || 0}%; transition: width 1s ease-in-out;"></div>
                            </div>
                        </div>
                        
                        <div class="card-preview" style="max-height: 200px; overflow-y: auto; background: var(--bg-dark); padding: 15px; border-radius: 8px;">
                            <h5 style="color: var(--text-light); margin-bottom: 10px;">📦 Cards Preview:</h5>
                            ${deckData.cards.slice(0, 10).map(card => `
                                <div style="display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 0.9rem;">
                                    <span style="color: var(--text-light);">${card.qty}x ${card.name}</span>
                                    <span style="color: var(--text-muted);">[${card.type || 'Unknown'}]</span>
                                </div>
                            `).join('')}
                            ${deckData.cards.length > 10 ? `<div style="color: var(--text-muted); font-style: italic; margin-top: 10px;">...and ${deckData.cards.length - 10} more cards</div>` : ''}
                        </div>
                    </div>
                    
                    <div class="import-options" style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                        <button class="btn btn-primary" onclick="deckQRIntegration.importDeck(${JSON.stringify(deckData).replace(/"/g, '&quot;')}); this.closest('.modal').remove();">
                            <i class="fas fa-download"></i> Import Deck
                        </button>
                        <button class="btn btn-secondary" onclick="deckQRIntegration.previewDeck(${JSON.stringify(deckData).replace(/"/g, '&quot;')}); this.closest('.modal').remove();">
                            <i class="fas fa-eye"></i> Preview Only
                        </button>
                        <button class="btn btn-secondary" onclick="this.closest('.modal').remove();">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.classList.add('active');
        modal.style.display = 'block';

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Import deck from QR data
    importDeck(deckData) {
        try {
            // Convert QR deck format to internal format
            const convertedCards = deckData.cards.map((card, index) => ({
                name: card.name,
                quantity: card.qty,
                type: card.type,
                manaCost: card.manaCost,
                set: card.set,
                power: card.power,
                toughness: card.toughness,
                deckId: Date.now() + index // Unique ID for deck management
            }));

            // Clear current deck and import new one
            this.deckBuilder.currentDeck = convertedCards;
            this.deckBuilder.deckName = deckData.deckName;

            // Update deck name input
            const deckNameInput = document.getElementById('deck-name');
            if (deckNameInput) {
                deckNameInput.value = deckData.deckName;
            }

            // Update UI
            this.deckBuilder.renderDeckList();
            this.deckBuilder.updateDeckStats();
            this.deckBuilder.updateManaCurve();

            if (this.app.showNotification) {
                this.app.showNotification(`Deck "${deckData.deckName}" imported successfully!`, 'success');
            }

        } catch (error) {
            console.error('Import error:', error);
            if (this.app.showNotification) {
                this.app.showNotification('Failed to import deck', 'error');
            }
        }
    }

    // Preview deck without importing
    previewDeck(deckData) {
        // Show deck in a preview modal
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 700px;">
                <div class="modal-header">
                    <h3>👁️ Deck Preview: ${deckData.deckName}</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="deck-full-list" style="max-height: 400px; overflow-y: auto; background: var(--bg-charcoal); padding: 20px; border-radius: 12px; border: 1px solid var(--red-primary);">
                        ${this.formatDeckPreview(deckData)}
                    </div>
                    
                    <div style="margin-top: 20px; text-align: center;">
                        <button class="btn btn-primary" onclick="deckQRIntegration.importDeck(${JSON.stringify(deckData).replace(/"/g, '&quot;')}); this.closest('.modal').remove();">
                            <i class="fas fa-download"></i> Import This Deck
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.classList.add('active');
        modal.style.display = 'block';

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    // Format deck for preview
    formatDeckPreview(deckData) {
        let result = `<h4 style="color: var(--red-primary); margin-bottom: 15px;">🧙 ${deckData.deckName}</h4>`;
        result += `<div style="margin-bottom: 15px; color: var(--text-muted);">Synergy Score: ${deckData.synergyScore || 0}%</div>`;
        result += `<h5 style="color: var(--text-light); margin-bottom: 10px;">📦 Cards:</h5>`;
        
        deckData.cards.forEach(card => {
            result += `<div style="display: flex; justify-content: space-between; margin-bottom: 8px; padding: 8px; background: var(--bg-dark); border-radius: 6px;">`;
            result += `<span style="color: var(--text-light);">${card.qty}x ${card.name}</span>`;
            result += `<span style="color: var(--text-muted);">[${card.type || 'Unknown'}`;
            if (card.power && card.toughness) result += ` ${card.power}/${card.toughness}`;
            if (card.manaCost) result += ` | ${card.manaCost}`;
            result += `]</span></div>`;
        });
        
        return result;
    }

    // Download QR code as image
    downloadQRCode() {
        const canvas = document.getElementById('qr-canvas');
        if (!canvas) return;

        const link = document.createElement('a');
        link.download = `${this.deckBuilder.deckName || 'deck'}-qr.png`;
        link.href = canvas.toDataURL();
        link.click();

        if (this.app.showNotification) {
            this.app.showNotification('QR code downloaded!', 'success');
        }
    }

    // Share QR code
    async shareQRCode() {
        const canvas = document.getElementById('qr-canvas');
        if (!canvas) return;

        try {
            canvas.toBlob(async (blob) => {
                if (navigator.share && navigator.canShare) {
                    const file = new File([blob], `${this.deckBuilder.deckName || 'deck'}-qr.png`, { type: 'image/png' });
                    
                    if (navigator.canShare({ files: [file] })) {
                        await navigator.share({
                            title: `MTG Deck: ${this.deckBuilder.deckName}`,
                            text: 'Check out my Magic: The Gathering deck!',
                            files: [file]
                        });
                        return;
                    }
                }
                
                // Fallback: copy to clipboard
                await navigator.clipboard.write([
                    new ClipboardItem({ 'image/png': blob })
                ]);
                
                if (this.app.showNotification) {
                    this.app.showNotification('QR code copied to clipboard!', 'success');
                }
            });
        } catch (error) {
            console.error('Share error:', error);
            if (this.app.showNotification) {
                this.app.showNotification('Sharing not supported on this device', 'warning');
            }
        }
    }

    // Copy deck URL (for future web sharing)
    async copyDeckURL() {
        const deckData = this.generateQRCode();
        if (!deckData) return;

        // Create a shareable URL (this would need a backend service)
        const shortURL = `https://deckforge.app/deck?id=${btoa(JSON.stringify(deckData)).substring(0, 12)}`;
        
        try {
            await navigator.clipboard.writeText(shortURL);
            if (this.app.showNotification) {
                this.app.showNotification('Deck URL copied to clipboard!', 'success');
            }
        } catch (error) {
            console.error('Copy error:', error);
            if (this.app.showNotification) {
                this.app.showNotification('Failed to copy URL', 'error');
            }
        }
    }

    // Utility functions
    getSimplifiedType(typeString) {
        if (!typeString) return 'Unknown';
        
        const types = ['Land', 'Creature', 'Artifact', 'Enchantment', 'Planeswalker', 'Instant', 'Sorcery'];
        for (const type of types) {
            if (typeString.includes(type)) {
                return type;
            }
        }
        return 'Other';
    }

    getCardEffect(card) {
        // Extract basic effect description
        if (card.abilities) return card.abilities;
        if (card.text) return card.text.substring(0, 50) + '...';
        if (card.power && card.toughness) return `${card.power}/${card.toughness}`;
        return '';
    }

    calculateSynergyScore() {
        if (!this.deckBuilder.currentDeck || this.deckBuilder.currentDeck.length === 0) {
            return 0;
        }

        // Simple synergy calculation based on card types and mana curve
        const stats = this.deckBuilder.deckStats;
        let score = 50; // Base score

        // Reward balanced mana curve
        const totalNonLand = stats.totalCards - stats.lands;
        if (totalNonLand > 0) {
            const creatureRatio = stats.creatures / totalNonLand;
            const spellRatio = stats.spells / totalNonLand;
            
            // Reward balanced creature/spell ratio
            if (creatureRatio >= 0.3 && creatureRatio <= 0.7) score += 15;
            if (spellRatio >= 0.2 && spellRatio <= 0.5) score += 10;
        }

        // Reward appropriate deck size
        if (stats.totalCards >= 60 && stats.totalCards <= 75) score += 15;
        else if (stats.totalCards < 60) score -= 10;

        // Reward reasonable land count
        const landRatio = stats.lands / stats.totalCards;
        if (landRatio >= 0.35 && landRatio <= 0.45) score += 10;

        // Reward reasonable average CMC
        if (stats.avgCmc >= 2.0 && stats.avgCmc <= 4.0) score += 10;

        return Math.max(0, Math.min(100, Math.round(score)));
    }
}

// Export for global access
window.DeckQRIntegration = DeckQRIntegration;
