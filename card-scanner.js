// MTG Card Scanner - Ultra Simple Mobile Card Scanning
class MTGCardScanner {
    constructor(app) {
        this.app = app;
        this.isScanning = false;
        this.stream = null;
        this.video = null;
        this.canvas = null;
        this.context = null;
        this.detectionInterval = null;
        this.lastDetectionTime = 0;
        this.detectionCooldown = 1000; // 1 second between detections
        this.autoCapture = true;
        this.flashEnabled = false;
        
        this.init();
    }

    init() {
        this.createScannerModal();
        this.setupEventListeners();
    }

    createScannerModal() {
        const modal = document.createElement('div');
        modal.id = 'card-scanner-modal';
        modal.className = 'modal scanner-modal';
        modal.innerHTML = `
            <div class="scanner-modal-content">
                <div class="scanner-header">
                    <h3><i class="fas fa-camera"></i> Scan MTG Card</h3>
                    <button class="scanner-close-btn" id="close-scanner">&times;</button>
                </div>
                
                <div class="scanner-body">
                    <!-- Camera View -->
                    <div class="camera-container" id="camera-container">
                        <video id="scanner-video" autoplay playsinline></video>
                        <canvas id="scanner-canvas" style="display: none;"></canvas>
                        
                        <!-- Card Detection Overlay -->
                        <div class="card-detection-overlay">
                            <div class="card-frame" id="card-frame">
                                <div class="corner top-left"></div>
                                <div class="corner top-right"></div>
                                <div class="corner bottom-left"></div>
                                <div class="corner bottom-right"></div>
                                <div class="detection-text" id="detection-text">
                                    Position card within frame
                                </div>
                            </div>
                        </div>
                        
                        <!-- Camera Controls -->
                        <div class="camera-controls">
                            <button class="control-btn" id="flash-toggle" title="Toggle Flash">
                                <i class="fas fa-bolt"></i>
                            </button>
                            <button class="control-btn capture-btn" id="manual-capture" title="Capture">
                                <i class="fas fa-camera"></i>
                            </button>
                            <button class="control-btn" id="camera-switch" title="Switch Camera">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                        </div>
                        
                        <!-- Loading Indicator -->
                        <div class="scanner-loading" id="scanner-loading" style="display: none;">
                            <div class="loading-spinner"></div>
                            <div class="loading-text">Identifying card...</div>
                        </div>
                    </div>
                    
                    <!-- Card Verification View -->
                    <div class="card-verification" id="card-verification" style="display: none;">
                        <div class="verification-header">
                            <h4>Is this correct?</h4>
                        </div>
                        
                        <div class="verification-content">
                            <div class="captured-image">
                                <img id="captured-image" alt="Captured card">
                                <div class="image-label">Your Photo</div>
                            </div>
                            
                            <div class="identified-card">
                                <img id="identified-image" alt="Identified card">
                                <div class="card-details">
                                    <div class="card-name" id="identified-name">Card Name</div>
                                    <div class="card-set" id="identified-set">Set Name</div>
                                    <div class="card-price" id="identified-price">$0.00</div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="verification-actions">
                            <button class="btn btn-success btn-large" id="confirm-card">
                                <i class="fas fa-check"></i> Correct - Add to Collection
                            </button>
                            <button class="btn btn-secondary" id="try-again">
                                <i class="fas fa-redo"></i> Try Again
                            </button>
                            <button class="btn btn-outline" id="manual-entry">
                                <i class="fas fa-edit"></i> Manual Entry
                            </button>
                        </div>
                    </div>
                    
                    <!-- Error View -->
                    <div class="scanner-error" id="scanner-error" style="display: none;">
                        <div class="error-icon">
                            <i class="fas fa-exclamation-triangle"></i>
                        </div>
                        <div class="error-message" id="error-message">
                            Card not found
                        </div>
                        <div class="error-suggestions" id="error-suggestions">
                            Try better lighting or a different angle
                        </div>
                        <div class="error-actions">
                            <button class="btn btn-primary" id="retry-scan">
                                <i class="fas fa-camera"></i> Try Again
                            </button>
                            <button class="btn btn-secondary" id="manual-search">
                                <i class="fas fa-search"></i> Manual Search
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    setupEventListeners() {
        // Scanner modal controls
        document.getElementById('close-scanner').addEventListener('click', () => this.closeScanner());
        document.getElementById('flash-toggle').addEventListener('click', () => this.toggleFlash());
        document.getElementById('manual-capture').addEventListener('click', () => this.captureCard());
        document.getElementById('camera-switch').addEventListener('click', () => this.switchCamera());
        
        // Verification controls
        document.getElementById('confirm-card').addEventListener('click', () => this.confirmCard());
        document.getElementById('try-again').addEventListener('click', () => this.retryScanning());
        document.getElementById('manual-entry').addEventListener('click', () => this.openManualEntry());
        
        // Error controls
        document.getElementById('retry-scan').addEventListener('click', () => this.retryScanning());
        document.getElementById('manual-search').addEventListener('click', () => this.openManualSearch());
        
        // Modal click outside to close
        document.getElementById('card-scanner-modal').addEventListener('click', (e) => {
            if (e.target.id === 'card-scanner-modal') this.closeScanner();
        });
    }

    async openScanner() {
        try {
            document.getElementById('card-scanner-modal').classList.add('active');
            await this.startCamera();
            this.startCardDetection();
            this.showNotification('Point your camera at an MTG card', 'info');
        } catch (error) {
            console.error('Error opening scanner:', error);
            this.showError('Camera access denied', 'Please allow camera access to scan cards');
        }
    }

    async startCamera() {
        try {
            // Request camera permission with back camera preference
            const constraints = {
                video: {
                    facingMode: 'environment', // Back camera
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            };

            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video = document.getElementById('scanner-video');
            this.canvas = document.getElementById('scanner-canvas');
            this.context = this.canvas.getContext('2d');
            
            this.video.srcObject = this.stream;
            
            // Wait for video to be ready
            await new Promise((resolve) => {
                this.video.onloadedmetadata = () => {
                    this.canvas.width = this.video.videoWidth;
                    this.canvas.height = this.video.videoHeight;
                    resolve();
                };
            });
            
            this.isScanning = true;
            
        } catch (error) {
            console.error('Error starting camera:', error);
            throw new Error('Unable to access camera');
        }
    }

    startCardDetection() {
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
        }
        
        // Check for card every 500ms
        this.detectionInterval = setInterval(() => {
            if (this.isScanning && this.autoCapture) {
                this.detectCard();
            }
        }, 500);
    }

    async detectCard() {
        if (!this.video || !this.canvas || Date.now() - this.lastDetectionTime < this.detectionCooldown) {
            return;
        }

        try {
            // Capture current frame
            this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            
            // Simple card detection based on rectangular shapes and contrast
            const imageData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
            const cardDetected = this.analyzeImageForCard(imageData);
            
            if (cardDetected) {
                this.updateDetectionUI(true);
                
                // Auto-capture after brief delay for stability
                setTimeout(() => {
                    if (this.isScanning) {
                        this.captureCard();
                    }
                }, 1000);
                
                this.lastDetectionTime = Date.now();
            } else {
                this.updateDetectionUI(false);
            }
            
        } catch (error) {
            console.error('Error in card detection:', error);
        }
    }

    analyzeImageForCard(imageData) {
        // Simplified card detection algorithm
        // In a real implementation, this would use more sophisticated computer vision
        
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        
        // Look for rectangular shapes with high contrast edges
        let edgeCount = 0;
        const samplePoints = 100; // Sample points for performance
        
        for (let i = 0; i < samplePoints; i++) {
            const x = Math.floor(Math.random() * width);
            const y = Math.floor(Math.random() * height);
            const index = (y * width + x) * 4;
            
            if (index + 4 < data.length) {
                const brightness = (data[index] + data[index + 1] + data[index + 2]) / 3;
                
                // Check neighboring pixels for edge detection
                const rightIndex = index + 4;
                const bottomIndex = index + (width * 4);
                
                if (rightIndex < data.length && bottomIndex < data.length) {
                    const rightBrightness = (data[rightIndex] + data[rightIndex + 1] + data[rightIndex + 2]) / 3;
                    const bottomBrightness = (data[bottomIndex] + data[bottomIndex + 1] + data[bottomIndex + 2]) / 3;
                    
                    if (Math.abs(brightness - rightBrightness) > 50 || Math.abs(brightness - bottomBrightness) > 50) {
                        edgeCount++;
                    }
                }
            }
        }
        
        // If we detect enough edges, assume a card is present
        return edgeCount > samplePoints * 0.3;
    }

    updateDetectionUI(cardDetected) {
        const cardFrame = document.getElementById('card-frame');
        const detectionText = document.getElementById('detection-text');
        
        if (cardDetected) {
            cardFrame.classList.add('card-detected');
            detectionText.textContent = 'Card detected! Capturing...';
            
            // Haptic feedback if available
            if (navigator.vibrate) {
                navigator.vibrate(100);
            }
        } else {
            cardFrame.classList.remove('card-detected');
            detectionText.textContent = 'Position card within frame';
        }
    }

    async captureCard() {
        if (!this.video || !this.canvas) return;
        
        try {
            // Show loading
            this.showLoading(true);
            
            // Capture the current frame
            this.context.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
            const imageDataUrl = this.canvas.toDataURL('image/jpeg', 0.8);
            
            // Stop detection during processing
            this.isScanning = false;
            
            // Identify the card
            const cardData = await this.identifyCard(imageDataUrl);
            
            if (cardData) {
                this.showVerification(imageDataUrl, cardData);
            } else {
                this.showError('Card not recognized', 'Try better lighting or a different angle');
            }
            
        } catch (error) {
            console.error('Error capturing card:', error);
            this.showError('Capture failed', 'Please try again');
        } finally {
            this.showLoading(false);
        }
    }

    async identifyCard(imageDataUrl) {
        try {
            // In a real implementation, this would use:
            // 1. Scryfall's image recognition API (if available)
            // 2. OCR to extract card name
            // 3. Machine learning models for card identification
            
            // For now, we'll simulate the process and use OCR for text extraction
            const extractedText = await this.extractTextFromImage(imageDataUrl);
            
            if (extractedText) {
                // Search for the card using extracted text
                const cardData = await this.searchCardByName(extractedText);
                return cardData;
            }
            
            return null;
            
        } catch (error) {
            console.error('Error identifying card:', error);
            return null;
        }
    }

    async extractTextFromImage(imageDataUrl) {
        try {
            // Simple OCR simulation - in reality would use Tesseract.js or similar
            // For demo purposes, we'll simulate text extraction
            
            // In a real implementation, you would:
            // 1. Load Tesseract.js for OCR
            // 2. Process the image to enhance text readability
            // 3. Extract text from the card name area
            
            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // For demo, return some common card names randomly
            const sampleCards = [
                'Lightning Bolt',
                'Black Lotus',
                'Counterspell',
                'Sol Ring',
                'Swords to Plowshares',
                'Dark Ritual',
                'Giant Growth',
                'Ancestral Recall'
            ];
            
            return sampleCards[Math.floor(Math.random() * sampleCards.length)];
            
        } catch (error) {
            console.error('Error extracting text:', error);
            return null;
        }
    }

    async searchCardByName(cardName) {
        try {
            const response = await fetch(`https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cardName)}`);
            
            if (!response.ok) {
                throw new Error('Card not found');
            }
            
            const cardData = await response.json();
            
            if (cardData.object === 'error') {
                throw new Error(cardData.details);
            }
            
            return cardData;
            
        } catch (error) {
            console.error('Error searching for card:', error);
            return null;
        }
    }

    showVerification(capturedImage, cardData) {
        // Hide camera view
        document.getElementById('camera-container').style.display = 'none';
        document.getElementById('scanner-error').style.display = 'none';
        
        // Show verification view
        const verificationView = document.getElementById('card-verification');
        verificationView.style.display = 'block';
        
        // Set captured image
        document.getElementById('captured-image').src = capturedImage;
        
        // Set identified card data
        document.getElementById('identified-image').src = cardData.image_uris?.normal || cardData.image_uris?.small || '';
        document.getElementById('identified-name').textContent = cardData.name;
        document.getElementById('identified-set').textContent = `${cardData.set_name} (${cardData.set.toUpperCase()})`;
        document.getElementById('identified-price').textContent = `$${cardData.prices?.usd || 'N/A'}`;
        
        // Store card data for confirmation
        this.currentCardData = cardData;
        this.currentCapturedImage = capturedImage;
    }

    showError(title, message) {
        // Hide other views
        document.getElementById('camera-container').style.display = 'none';
        document.getElementById('card-verification').style.display = 'none';
        
        // Show error view
        const errorView = document.getElementById('scanner-error');
        errorView.style.display = 'block';
        
        document.getElementById('error-message').textContent = title;
        document.getElementById('error-suggestions').textContent = message;
    }

    showLoading(show) {
        const loadingEl = document.getElementById('scanner-loading');
        loadingEl.style.display = show ? 'flex' : 'none';
    }

    async confirmCard() {
        if (!this.currentCardData) return;
        
        try {
            // Add card to collection with smart defaults
            const cardToAdd = {
                id: Date.now(),
                name: this.currentCardData.name,
                set: this.currentCardData.set_name,
                setCode: this.currentCardData.set,
                rarity: this.currentCardData.rarity,
                manaCost: this.currentCardData.mana_cost,
                type: this.currentCardData.type_line,
                imageUrl: this.currentCardData.image_uris?.normal || this.currentCardData.image_uris?.small,
                scryfallId: this.currentCardData.id,
                quantity: 1, // Smart default
                condition: 'Near Mint', // Smart default
                isFoil: false, // Smart default
                purchasePrice: 0,
                prices: await this.app.fetchPricesFromAllSources(this.currentCardData),
                notes: 'Added via card scanner',
                dateAdded: new Date().toISOString()
            };
            
            // Add to collection
            this.app.collection.push(cardToAdd);
            this.app.saveCollection();
            this.app.updateCollectionStats();
            this.app.renderCollection();
            this.app.populateSetFilter();
            
            this.closeScanner();
            this.app.showNotification(`${cardToAdd.name} added to collection!`, 'success');
            
        } catch (error) {
            console.error('Error adding card:', error);
            this.app.showNotification('Error adding card to collection', 'error');
        }
    }

    retryScanning() {
        // Reset to camera view
        document.getElementById('card-verification').style.display = 'none';
        document.getElementById('scanner-error').style.display = 'none';
        document.getElementById('camera-container').style.display = 'block';
        
        // Restart scanning
        this.isScanning = true;
        this.startCardDetection();
    }

    openManualEntry() {
        // Close scanner and open add card modal with pre-filled data
        this.closeScanner();
        
        if (this.currentCardData) {
            // Pre-fill the add card form
            document.getElementById('card-name').value = this.currentCardData.name;
            document.getElementById('card-set').value = this.currentCardData.set_name;
        }
        
        this.app.openAddCardModal();
    }

    openManualSearch() {
        // Close scanner and switch to search tab
        this.closeScanner();
        this.app.switchTab('search');
        
        // Focus on search input
        setTimeout(() => {
            document.getElementById('card-search').focus();
        }, 100);
    }

    toggleFlash() {
        if (!this.stream) return;
        
        try {
            const track = this.stream.getVideoTracks()[0];
            const capabilities = track.getCapabilities();
            
            if (capabilities.torch) {
                this.flashEnabled = !this.flashEnabled;
                track.applyConstraints({
                    advanced: [{ torch: this.flashEnabled }]
                });
                
                const flashBtn = document.getElementById('flash-toggle');
                flashBtn.classList.toggle('active', this.flashEnabled);
            }
        } catch (error) {
            console.error('Flash not supported:', error);
            this.app.showNotification('Flash not supported on this device', 'warning');
        }
    }

    async switchCamera() {
        if (!this.stream) return;
        
        try {
            // Stop current stream
            this.stream.getTracks().forEach(track => track.stop());
            
            // Toggle between front and back camera
            const currentFacingMode = this.stream.getVideoTracks()[0].getSettings().facingMode;
            const newFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
            
            // Start new stream with different camera
            const constraints = {
                video: {
                    facingMode: newFacingMode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            };
            
            this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.stream;
            
        } catch (error) {
            console.error('Error switching camera:', error);
            this.app.showNotification('Unable to switch camera', 'error');
        }
    }

    closeScanner() {
        // Stop camera stream
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        
        // Clear detection interval
        if (this.detectionInterval) {
            clearInterval(this.detectionInterval);
            this.detectionInterval = null;
        }
        
        // Reset state
        this.isScanning = false;
        this.currentCardData = null;
        this.currentCapturedImage = null;
        
        // Hide modal
        document.getElementById('card-scanner-modal').classList.remove('active');
        
        // Reset views
        document.getElementById('camera-container').style.display = 'block';
        document.getElementById('card-verification').style.display = 'none';
        document.getElementById('scanner-error').style.display = 'none';
        this.showLoading(false);
    }

    showNotification(message, type) {
        if (this.app && this.app.showNotification) {
            this.app.showNotification(message, type);
        }
    }
}

// Export for global access
window.MTGCardScanner = MTGCardScanner;
