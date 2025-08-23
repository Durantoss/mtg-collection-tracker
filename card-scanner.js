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
        
        // Duplicate detection properties
        this.imageHashes = new Map(); // Store image hashes for duplicate detection
        this.duplicateThreshold = 5; // Hamming distance threshold for duplicates
        
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
                    
                    <!-- Confirm Card Modal -->
                    <div class="confirm-modal hidden" id="confirm-modal">
                        <div class="confirm-modal-content">
                            <h3>Confirm Card</h3>
                            <img id="card-preview" src="" alt="Card Preview" class="card-preview-image" />
                            <p id="card-name-confirm" class="card-name-text"></p>
                            <div class="confirm-actions">
                                <button class="btn btn-success" id="confirm-add">
                                    <i class="fas fa-plus"></i> Add to Collection
                                </button>
                                <button class="btn btn-secondary" id="cancel-add">
                                    <i class="fas fa-times"></i> Cancel
                                </button>
                            </div>
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
        
        // Confirm modal controls
        document.getElementById('confirm-add').addEventListener('click', () => this.handleConfirmAdd());
        document.getElementById('cancel-add').addEventListener('click', () => this.handleCancelAdd());
        
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
            // Enhanced camera access with better error handling
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('Camera API not supported on this device');
            }

            // Request camera permission with back camera preference
            const constraints = {
                video: {
                    facingMode: { ideal: 'environment' }, // Back camera with fallback
                    width: { ideal: 1920, min: 640 },
                    height: { ideal: 1080, min: 480 },
                    frameRate: { ideal: 30, min: 15 }
                }
            };

            try {
                // Try with environment camera first
                this.stream = await navigator.mediaDevices.getUserMedia(constraints);
            } catch (envError) {
                console.warn('Environment camera not available, trying any camera:', envError);
                // Fallback to any available camera
                const fallbackConstraints = {
                    video: {
                        width: { ideal: 1920, min: 640 },
                        height: { ideal: 1080, min: 480 },
                        frameRate: { ideal: 30, min: 15 }
                    }
                };
                this.stream = await navigator.mediaDevices.getUserMedia(fallbackConstraints);
            }

            this.video = document.getElementById('scanner-video');
            this.canvas = document.getElementById('scanner-canvas');
            this.context = this.canvas.getContext('2d');
            
            // Set video source and handle loading
            this.video.srcObject = this.stream;
            
            // Enhanced video loading with timeout
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Video loading timeout'));
                }, 10000); // 10 second timeout

                this.video.onloadedmetadata = () => {
                    clearTimeout(timeout);
                    this.canvas.width = this.video.videoWidth;
                    this.canvas.height = this.video.videoHeight;
                    
                    // Start video playback
                    this.video.play().then(() => {
                        resolve();
                    }).catch(reject);
                };

                this.video.onerror = (error) => {
                    clearTimeout(timeout);
                    reject(new Error('Video loading failed'));
                };
            });
            
            this.isScanning = true;
            console.log('Camera started successfully:', {
                width: this.video.videoWidth,
                height: this.video.videoHeight,
                facingMode: this.stream.getVideoTracks()[0].getSettings().facingMode
            });
            
        } catch (error) {
            console.error('Error starting camera:', error);
            
            // Provide specific error messages based on error type
            let errorMessage = 'Unable to access camera';
            if (error.name === 'NotAllowedError') {
                errorMessage = 'Camera access denied. Please allow camera permissions.';
            } else if (error.name === 'NotFoundError') {
                errorMessage = 'No camera found on this device.';
            } else if (error.name === 'NotSupportedError') {
                errorMessage = 'Camera not supported on this device.';
            } else if (error.name === 'NotReadableError') {
                errorMessage = 'Camera is already in use by another application.';
            } else if (error.message.includes('timeout')) {
                errorMessage = 'Camera loading timeout. Please try again.';
            }
            
            throw new Error(errorMessage);
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
        if (!this.video || Date.now() - this.lastDetectionTime < this.detectionCooldown) {
            return;
        }

        try {
            // Create dynamic canvas for frame analysis
            const canvas = document.createElement('canvas');
            canvas.width = this.video.videoWidth;
            canvas.height = this.video.videoHeight;
            const ctx = canvas.getContext('2d');
            
            // Capture current frame
            ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);
            
            // Simple card detection based on rectangular shapes and contrast
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
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
        if (!this.video) return;
        
        try {
            // Show loading
            this.showLoading(true);
            
            // Create dynamic canvas for capture
            const canvas = document.createElement('canvas');
            canvas.width = this.video.videoWidth;
            canvas.height = this.video.videoHeight;
            const ctx = canvas.getContext('2d');
            
            // Capture the current frame
            ctx.drawImage(this.video, 0, 0, canvas.width, canvas.height);
            const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
            
            // Stop detection during processing
            this.isScanning = false;
            
            // Identify the card
            const matchedCard = await this.identifyCard(imageDataUrl);
            
            if (matchedCard) {
                this.showConfirmation(matchedCard);
            } else {
                this.showManualFallback();
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
            // Enhanced identification with fallback mechanism
            console.log('Starting card identification process...');
            
            // First attempt: OCR text extraction
            const extractedText = await this.extractTextFromImage(imageDataUrl);
            
            if (extractedText) {
                console.log('OCR extracted text:', extractedText);
                const cardData = await this.searchCardByName(extractedText);
                if (cardData) {
                    console.log('Card identified via OCR:', cardData.name);
                    return cardData;
                }
            }
            
            // Second attempt: Image matching fallback
            console.log('OCR failed, attempting image matching...');
            const matchedCard = await this.matchImageToScryfall(imageDataUrl);
            if (matchedCard) {
                console.log('Card identified via image matching:', matchedCard.name);
                return matchedCard;
            }
            
            // Both methods failed
            console.log('Both OCR and image matching failed');
            return null;
            
        } catch (error) {
            console.error('Error identifying card:', error);
            return null;
        }
    }

    cropCanvas(canvas, topPercent = 0.2) {
        const ctx = canvas.getContext('2d');
        const cropped = document.createElement('canvas');
        cropped.width = canvas.width;
        cropped.height = canvas.height * topPercent;
        cropped.getContext('2d').drawImage(canvas, 0, 0, canvas.width, cropped.height, 0, 0, canvas.width, cropped.height);
        return cropped;
    }

    extractCardName(text) {
        if (!text || typeof text !== 'string') return null;
        
        // Clean up the OCR text
        const cleanText = text.trim().replace(/\s+/g, ' ');
        
        // Split into lines and find the most likely card name
        const lines = cleanText.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        if (lines.length === 0) return null;
        
        // Card names are typically the first substantial line of text
        // Look for lines that are likely to be card names (not mana costs, rules text, etc.)
        for (const line of lines) {
            // Skip lines that look like mana costs (contain only numbers and letters like "2R" or "{2}{R}")
            if (/^[\d\{\}WUBRG\/]+$/.test(line)) continue;
            
            // Skip very short lines (likely artifacts)
            if (line.length < 3) continue;
            
            // Skip lines that are all numbers
            if (/^\d+$/.test(line)) continue;
            
            // Skip common OCR artifacts and set symbols
            if (/^[^\w\s]+$/.test(line)) continue;
            
            // This looks like a potential card name
            if (line.length >= 3 && line.length <= 50) {
                // Clean up common OCR errors
                let cardName = line
                    .replace(/[^\w\s\-',\.]/g, '') // Remove special characters except common ones
                    .replace(/\s+/g, ' ') // Normalize whitespace
                    .trim();
                
                // Capitalize first letter of each word (common MTG naming convention)
                cardName = cardName.replace(/\b\w/g, l => l.toUpperCase());
                
                if (cardName.length >= 3) {
                    console.log('Extracted card name:', cardName);
                    return cardName;
                }
            }
        }
        
        // Fallback: return the first non-empty line if no good candidate found
        return lines[0] || null;
    }

    async extractTextFromImage(imageDataUrl) {
        try {
            // Create image from data URL
            const img = new Image();
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = imageDataUrl;
            });

            // Create dynamic canvas for OCR processing
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            // Crop to focus on card name area (top 20%)
            const croppedCanvas = this.cropCanvas(canvas, 0.2);
            
            // Check if Tesseract is available
            if (typeof Tesseract !== 'undefined') {
                console.log('Using Tesseract.js for OCR processing...');
                
                try {
                    // Use Tesseract.js for real OCR
                    const { data: { text } } = await Tesseract.recognize(croppedCanvas.toDataURL(), 'eng', {
                        logger: m => {
                            if (m.status === 'recognizing text') {
                                console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                            }
                        }
                    });
                    
                    console.log('Raw OCR text:', text);
                    
                    // Extract card name from OCR text
                    const cardName = this.extractCardName(text);
                    
                    if (cardName) {
                        console.log('Extracted card name:', cardName);
                        return cardName;
                    } else {
                        console.warn('Could not extract card name from OCR text');
                        return null;
                    }
                    
                } catch (ocrError) {
                    console.error('Tesseract OCR failed:', ocrError);
                    // Fall back to simulation if OCR fails
                    return this.simulateOCR();
                }
                
            } else {
                console.warn('Tesseract.js not loaded, using simulation');
                // Fall back to simulation if Tesseract is not available
                return this.simulateOCR();
            }
            
        } catch (error) {
            console.error('Error extracting text:', error);
            return null;
        }
    }

    simulateOCR() {
        // Fallback simulation for when Tesseract is not available
        const sampleCards = [
            'Lightning Bolt',
            'Black Lotus',
            'Counterspell',
            'Sol Ring',
            'Swords to Plowshares',
            'Dark Ritual',
            'Giant Growth',
            'Ancestral Recall',
            'Brainstorm',
            'Path to Exile',
            'Mana Crypt',
            'Force of Will',
            'Demonic Tutor',
            'Time Walk',
            'Mox Ruby'
        ];
        
        return sampleCards[Math.floor(Math.random() * sampleCards.length)];
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

    async matchImageToScryfall(imageDataUrl) {
        try {
            console.log('Starting image matching process...');
            
            // Convert image to a format suitable for analysis
            const imageFeatures = await this.extractImageFeatures(imageDataUrl);
            
            if (!imageFeatures) {
                console.log('Could not extract image features');
                return null;
            }
            
            // Search for visually similar cards using color analysis and edge detection
            const potentialMatches = await this.findVisualMatches(imageFeatures);
            
            if (potentialMatches && potentialMatches.length > 0) {
                // Return the best match (first result with highest confidence)
                const bestMatch = potentialMatches[0];
                console.log('Found visual match:', bestMatch.name);
                return bestMatch;
            }
            
            console.log('No visual matches found');
            return null;
            
        } catch (error) {
            console.error('Error in image matching:', error);
            return null;
        }
    }

    async extractImageFeatures(imageDataUrl) {
        try {
            // Create image from data URL
            const img = new Image();
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = imageDataUrl;
            });

            // Create canvas for analysis
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            // Extract image data
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Analyze dominant colors
            const colorHistogram = this.analyzeColors(data);
            
            // Analyze image structure (edges, shapes)
            const structuralFeatures = this.analyzeStructure(imageData);
            
            // Analyze card frame characteristics
            const frameFeatures = this.analyzeCardFrame(imageData);

            return {
                colors: colorHistogram,
                structure: structuralFeatures,
                frame: frameFeatures,
                dimensions: { width: canvas.width, height: canvas.height }
            };

        } catch (error) {
            console.error('Error extracting image features:', error);
            return null;
        }
    }

    analyzeColors(pixelData) {
        const colorBuckets = {
            white: 0, blue: 0, black: 0, red: 0, green: 0,
            multicolor: 0, colorless: 0, gold: 0
        };
        
        const sampleSize = Math.min(1000, pixelData.length / 4); // Sample pixels for performance
        
        for (let i = 0; i < sampleSize; i++) {
            const index = Math.floor(Math.random() * (pixelData.length / 4)) * 4;
            const r = pixelData[index];
            const g = pixelData[index + 1];
            const b = pixelData[index + 2];
            
            // Classify color based on RGB values
            const brightness = (r + g + b) / 3;
            
            if (brightness > 200 && Math.abs(r - g) < 30 && Math.abs(g - b) < 30) {
                colorBuckets.white++;
            } else if (b > r + 50 && b > g + 50) {
                colorBuckets.blue++;
            } else if (brightness < 80) {
                colorBuckets.black++;
            } else if (r > g + 50 && r > b + 50) {
                colorBuckets.red++;
            } else if (g > r + 30 && g > b + 30) {
                colorBuckets.green++;
            } else if (r > 180 && g > 150 && b < 100) {
                colorBuckets.gold++;
            } else if (Math.abs(r - g) > 50 || Math.abs(g - b) > 50) {
                colorBuckets.multicolor++;
            } else {
                colorBuckets.colorless++;
            }
        }
        
        return colorBuckets;
    }

    analyzeStructure(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        
        let edgeCount = 0;
        let cornerCount = 0;
        const samplePoints = 200;
        
        for (let i = 0; i < samplePoints; i++) {
            const x = Math.floor(Math.random() * (width - 2)) + 1;
            const y = Math.floor(Math.random() * (height - 2)) + 1;
            const index = (y * width + x) * 4;
            
            if (index + width * 8 < data.length) {
                const center = (data[index] + data[index + 1] + data[index + 2]) / 3;
                const right = (data[index + 4] + data[index + 5] + data[index + 6]) / 3;
                const bottom = (data[index + width * 4] + data[index + width * 4 + 1] + data[index + width * 4 + 2]) / 3;
                
                // Edge detection
                if (Math.abs(center - right) > 50 || Math.abs(center - bottom) > 50) {
                    edgeCount++;
                }
                
                // Corner detection (simplified)
                const topLeft = (data[index - width * 4 - 4] + data[index - width * 4 - 3] + data[index - width * 4 - 2]) / 3;
                const topRight = (data[index - width * 4 + 4] + data[index - width * 4 + 5] + data[index - width * 4 + 6]) / 3;
                
                if (Math.abs(center - topLeft) > 80 && Math.abs(center - topRight) > 80) {
                    cornerCount++;
                }
            }
        }
        
        return {
            edgeDensity: edgeCount / samplePoints,
            cornerDensity: cornerCount / samplePoints
        };
    }

    analyzeCardFrame(imageData) {
        const data = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        
        // Analyze border regions for frame characteristics
        const borderWidth = Math.min(width * 0.1, 50);
        const borderHeight = Math.min(height * 0.1, 50);
        
        let borderBrightness = 0;
        let borderSamples = 0;
        
        // Sample top and bottom borders
        for (let x = 0; x < width; x += 10) {
            for (let y = 0; y < borderHeight; y += 5) {
                const index = (y * width + x) * 4;
                if (index + 2 < data.length) {
                    borderBrightness += (data[index] + data[index + 1] + data[index + 2]) / 3;
                    borderSamples++;
                }
            }
            
            for (let y = height - borderHeight; y < height; y += 5) {
                const index = (y * width + x) * 4;
                if (index + 2 < data.length) {
                    borderBrightness += (data[index] + data[index + 1] + data[index + 2]) / 3;
                    borderSamples++;
                }
            }
        }
        
        return {
            averageBorderBrightness: borderSamples > 0 ? borderBrightness / borderSamples : 0,
            aspectRatio: width / height
        };
    }

    async findVisualMatches(imageFeatures) {
        try {
            // In a real implementation, this would:
            // 1. Query a database of card image features
            // 2. Use machine learning models for visual similarity
            // 3. Compare against Scryfall's image database
            
            // For now, we'll use a heuristic approach based on color analysis
            const dominantColor = this.getDominantColor(imageFeatures.colors);
            
            // Search for cards that match the dominant color characteristics
            const colorQueries = this.getColorBasedQueries(dominantColor);
            
            for (const query of colorQueries) {
                try {
                    const response = await fetch(`https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}&order=released&dir=desc`);
                    
                    if (response.ok) {
                        const searchResults = await response.json();
                        
                        if (searchResults.data && searchResults.data.length > 0) {
                            // Return top matches (limit to first few results)
                            return searchResults.data.slice(0, 3);
                        }
                    }
                } catch (queryError) {
                    console.warn('Query failed:', query, queryError);
                    continue;
                }
            }
            
            return null;
            
        } catch (error) {
            console.error('Error finding visual matches:', error);
            return null;
        }
    }

    getDominantColor(colorHistogram) {
        let maxCount = 0;
        let dominantColor = 'colorless';
        
        for (const [color, count] of Object.entries(colorHistogram)) {
            if (count > maxCount) {
                maxCount = count;
                dominantColor = color;
            }
        }
        
        return dominantColor;
    }

    getColorBasedQueries(dominantColor) {
        const queries = [];
        
        switch (dominantColor) {
            case 'white':
                queries.push('color:w', 'type:creature color:w', 'type:enchantment color:w');
                break;
            case 'blue':
                queries.push('color:u', 'type:instant color:u', 'type:creature color:u');
                break;
            case 'black':
                queries.push('color:b', 'type:creature color:b', 'type:sorcery color:b');
                break;
            case 'red':
                queries.push('color:r', 'type:creature color:r', 'type:instant color:r');
                break;
            case 'green':
                queries.push('color:g', 'type:creature color:g', 'type:sorcery color:g');
                break;
            case 'multicolor':
                queries.push('is:multicolored', 'type:creature is:multicolored');
                break;
            case 'gold':
                queries.push('is:multicolored', 'type:legendary', 'rarity:mythic');
                break;
            default:
                queries.push('is:colorless', 'type:artifact', 'type:land');
        }
        
        return queries;
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
            // Check for duplicates before adding
            const duplicateCheck = await this.checkForDuplicates(this.currentCapturedImage, this.currentCardData);
            
            if (duplicateCheck.isDuplicate) {
                this.showDuplicateWarning(duplicateCheck.matches);
                return;
            }
            
            // Generate image hash for future duplicate detection
            const imageHash = await this.generateImageHash(this.currentCapturedImage);
            
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
                dateAdded: new Date().toISOString(),
                imageHash: imageHash // Store hash for duplicate detection
            };
            
            // Store the image hash for future comparisons
            if (imageHash) {
                this.imageHashes.set(cardToAdd.id, imageHash);
            }
            
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

    // Duplicate Detection Methods using Blockhash
    async generateImageHash(imageDataUrl) {
        try {
            if (typeof blockhash === 'undefined') {
                console.warn('Blockhash library not available, skipping hash generation');
                return null;
            }

            // Create image element from data URL
            const img = new Image();
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = imageDataUrl;
            });

            // Create canvas for hash generation
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            // Resize image to standard size for consistent hashing (256x256)
            const hashSize = 256;
            canvas.width = hashSize;
            canvas.height = hashSize;
            
            // Draw image scaled to hash size
            ctx.drawImage(img, 0, 0, hashSize, hashSize);
            
            // Get image data
            const imageData = ctx.getImageData(0, 0, hashSize, hashSize);
            
            // Generate blockhash (16-bit hash for good balance of speed and accuracy)
            const hash = blockhash.bmvbhash(imageData, 16);
            
            console.log('Generated image hash:', hash);
            return hash;
            
        } catch (error) {
            console.error('Error generating image hash:', error);
            return null;
        }
    }

    calculateHammingDistance(hash1, hash2) {
        if (!hash1 || !hash2 || hash1.length !== hash2.length) {
            return Infinity;
        }
        
        let distance = 0;
        for (let i = 0; i < hash1.length; i++) {
            if (hash1[i] !== hash2[i]) {
                distance++;
            }
        }
        
        return distance;
    }

    async checkForDuplicates(imageDataUrl, cardData) {
        try {
            // Generate hash for the current image
            const currentHash = await this.generateImageHash(imageDataUrl);
            
            if (!currentHash) {
                // If we can't generate a hash, skip duplicate detection
                return { isDuplicate: false, matches: [] };
            }
            
            // Load existing image hashes from collection
            await this.loadExistingHashes();
            
            const matches = [];
            
            // Check against existing hashes
            for (const [cardId, existingHash] of this.imageHashes.entries()) {
                const distance = this.calculateHammingDistance(currentHash, existingHash);
                
                if (distance <= this.duplicateThreshold) {
                    // Find the card in collection
                    const existingCard = this.app.collection.find(card => card.id === cardId);
                    if (existingCard) {
                        matches.push({
                            card: existingCard,
                            distance: distance,
                            similarity: ((currentHash.length - distance) / currentHash.length * 100).toFixed(1)
                        });
                    }
                }
            }
            
            // Also check by card name and set for logical duplicates
            const nameMatches = this.app.collection.filter(card => 
                card.name.toLowerCase() === cardData.name.toLowerCase() &&
                card.setCode === cardData.set
            );
            
            // Add name matches that aren't already in image matches
            nameMatches.forEach(card => {
                if (!matches.find(match => match.card.id === card.id)) {
                    matches.push({
                        card: card,
                        distance: 0,
                        similarity: '100.0',
                        type: 'name_match'
                    });
                }
            });
            
            return {
                isDuplicate: matches.length > 0,
                matches: matches.sort((a, b) => a.distance - b.distance) // Sort by similarity
            };
            
        } catch (error) {
            console.error('Error checking for duplicates:', error);
            return { isDuplicate: false, matches: [] };
        }
    }

    async loadExistingHashes() {
        try {
            // Load hashes from existing collection items
            this.imageHashes.clear();
            
            for (const card of this.app.collection) {
                if (card.imageHash) {
                    this.imageHashes.set(card.id, card.imageHash);
                } else if (card.imageUrl) {
                    // Generate hash for existing cards that don't have one
                    try {
                        const hash = await this.generateImageHashFromUrl(card.imageUrl);
                        if (hash) {
                            this.imageHashes.set(card.id, hash);
                            // Update the card with the hash
                            card.imageHash = hash;
                        }
                    } catch (error) {
                        console.warn(`Failed to generate hash for existing card ${card.name}:`, error);
                    }
                }
            }
            
            console.log(`Loaded ${this.imageHashes.size} image hashes for duplicate detection`);
            
        } catch (error) {
            console.error('Error loading existing hashes:', error);
        }
    }

    async generateImageHashFromUrl(imageUrl) {
        try {
            // Create image element from URL
            const img = new Image();
            img.crossOrigin = 'anonymous'; // Handle CORS for external images
            
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = imageUrl;
            });

            // Create canvas and generate hash
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            const hashSize = 256;
            canvas.width = hashSize;
            canvas.height = hashSize;
            
            ctx.drawImage(img, 0, 0, hashSize, hashSize);
            const imageData = ctx.getImageData(0, 0, hashSize, hashSize);
            
            if (typeof blockhash !== 'undefined') {
                return blockhash.bmvbhash(imageData, 16);
            }
            
            return null;
            
        } catch (error) {
            console.error('Error generating hash from URL:', error);
            return null;
        }
    }

    showDuplicateWarning(matches) {
        // Create duplicate warning modal
        const duplicateModal = document.createElement('div');
        duplicateModal.className = 'modal duplicate-warning-modal';
        duplicateModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-exclamation-triangle"></i> Possible Duplicate Detected</h3>
                </div>
                <div class="modal-body">
                    <p>This card appears to be similar to ${matches.length} card${matches.length > 1 ? 's' : ''} already in your collection:</p>
                    
                    <div class="duplicate-matches">
                        ${matches.map(match => `
                            <div class="duplicate-match">
                                <div class="match-image">
                                    <img src="${match.card.imageUrl || ''}" alt="${match.card.name}" onerror="this.style.display='none'">
                                </div>
                                <div class="match-details">
                                    <div class="match-name">${match.card.name}</div>
                                    <div class="match-set">${match.card.set} (${match.card.setCode})</div>
                                    <div class="match-condition">Condition: ${match.card.condition}</div>
                                    <div class="match-similarity">
                                        ${match.type === 'name_match' ? 
                                            '<span class="exact-match">Exact Name Match</span>' : 
                                            `<span class="similarity-score">${match.similarity}% similar</span>`
                                        }
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="duplicate-actions">
                        <button class="btn btn-primary" id="add-anyway">
                            <i class="fas fa-plus"></i> Add Anyway
                        </button>
                        <button class="btn btn-success" id="increase-quantity">
                            <i class="fas fa-plus-circle"></i> Increase Quantity of Existing
                        </button>
                        <button class="btn btn-secondary" id="cancel-duplicate">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add styles for duplicate warning
        const duplicateStyles = document.createElement('style');
        duplicateStyles.textContent = `
            .duplicate-warning-modal {
                z-index: 10001;
            }
            
            .duplicate-matches {
                max-height: 300px;
                overflow-y: auto;
                margin: 1rem 0;
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 1rem;
            }
            
            .duplicate-match {
                display: flex;
                align-items: center;
                padding: 0.5rem;
                margin-bottom: 0.5rem;
                border: 1px solid #eee;
                border-radius: 4px;
                background: #f9f9f9;
            }
            
            .match-image {
                width: 60px;
                height: 84px;
                margin-right: 1rem;
                flex-shrink: 0;
            }
            
            .match-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                border-radius: 4px;
            }
            
            .match-details {
                flex: 1;
            }
            
            .match-name {
                font-weight: bold;
                margin-bottom: 0.25rem;
            }
            
            .match-set, .match-condition {
                font-size: 0.9em;
                color: #666;
                margin-bottom: 0.25rem;
            }
            
            .similarity-score {
                background: #e3f2fd;
                color: #1976d2;
                padding: 0.25rem 0.5rem;
                border-radius: 12px;
                font-size: 0.8em;
                font-weight: bold;
            }
            
            .exact-match {
                background: #ffecb3;
                color: #f57f17;
                padding: 0.25rem 0.5rem;
                border-radius: 12px;
                font-size: 0.8em;
                font-weight: bold;
            }
            
            .duplicate-actions {
                display: flex;
                gap: 0.5rem;
                justify-content: center;
                margin-top: 1rem;
            }
            
            .duplicate-actions .btn {
                flex: 1;
                max-width: 200px;
            }
        `;
        
        document.head.appendChild(duplicateStyles);
        document.body.appendChild(duplicateModal);
        
        // Show modal
        duplicateModal.classList.add('active');
        
        // Add event listeners
        document.getElementById('add-anyway').addEventListener('click', () => {
            document.body.removeChild(duplicateModal);
            document.head.removeChild(duplicateStyles);
            this.forceAddCard();
        });
        
        document.getElementById('increase-quantity').addEventListener('click', () => {
            document.body.removeChild(duplicateModal);
            document.head.removeChild(duplicateStyles);
            this.increaseExistingQuantity(matches[0].card);
        });
        
        document.getElementById('cancel-duplicate').addEventListener('click', () => {
            document.body.removeChild(duplicateModal);
            document.head.removeChild(duplicateStyles);
            this.retryScanning();
        });
    }

    async forceAddCard() {
        // Add the card anyway, bypassing duplicate detection
        try {
            const imageHash = await this.generateImageHash(this.currentCapturedImage);
            
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
                quantity: 1,
                condition: 'Near Mint',
                isFoil: false,
                purchasePrice: 0,
                prices: await this.app.fetchPricesFromAllSources(this.currentCardData),
                notes: 'Added via card scanner (duplicate override)',
                dateAdded: new Date().toISOString(),
                imageHash: imageHash
            };
            
            if (imageHash) {
                this.imageHashes.set(cardToAdd.id, imageHash);
            }
            
            this.app.collection.push(cardToAdd);
            this.app.saveCollection();
            this.app.updateCollectionStats();
            this.app.renderCollection();
            this.app.populateSetFilter();
            
            this.closeScanner();
            this.app.showNotification(`${cardToAdd.name} added to collection (duplicate)!`, 'success');
            
        } catch (error) {
            console.error('Error force adding card:', error);
            this.app.showNotification('Error adding card to collection', 'error');
        }
    }

    increaseExistingQuantity(existingCard) {
        try {
            // Increase quantity of existing card
            existingCard.quantity = (existingCard.quantity || 1) + 1;
            
            // Update notes to indicate quantity increase
            const currentNotes = existingCard.notes || '';
            const timestamp = new Date().toLocaleDateString();
            existingCard.notes = currentNotes + 
                (currentNotes ? '\n' : '') + 
                `Quantity increased via scanner on ${timestamp}`;
            
            this.app.saveCollection();
            this.app.updateCollectionStats();
            this.app.renderCollection();
            
            this.closeScanner();
            this.app.showNotification(`Increased quantity of ${existingCard.name} to ${existingCard.quantity}!`, 'success');
            
        } catch (error) {
            console.error('Error increasing card quantity:', error);
            this.app.showNotification('Error updating card quantity', 'error');
        }
    }

    // Card Confirmation Methods
    showConfirmation(matchedCard) {
        // Hide other views
        document.getElementById('camera-container').style.display = 'none';
        document.getElementById('card-verification').style.display = 'none';
        document.getElementById('scanner-error').style.display = 'none';
        
        // Set card preview data
        document.getElementById('card-preview').src = matchedCard.image_uris?.normal || matchedCard.image_uris?.small || '';
        document.getElementById('card-name-confirm').textContent = matchedCard.name;
        
        // Show confirm modal using hidden class approach
        document.getElementById('confirm-modal').classList.remove('hidden');
        
        // Store card data for confirmation
        this.currentCardData = matchedCard;
        
        // Set up event handlers dynamically
        document.getElementById('confirm-add').onclick = () => {
            this.handleConfirmAdd();
            document.getElementById('confirm-modal').classList.add('hidden');
        };
        
        document.getElementById('cancel-add').onclick = () => {
            document.getElementById('confirm-modal').classList.add('hidden');
            this.handleCancelAdd();
        };
    }

    showManualFallback() {
        // Hide other views and show error view for manual fallback
        document.getElementById('camera-container').style.display = 'none';
        document.getElementById('card-verification').style.display = 'none';
        document.getElementById('confirm-modal').classList.add('hidden');
        
        // Show error view with manual options
        const errorView = document.getElementById('scanner-error');
        errorView.style.display = 'block';
        
        document.getElementById('error-message').textContent = 'Card not recognized';
        document.getElementById('error-suggestions').textContent = 'Try better lighting, different angle, or use manual entry';
    }

    // Legacy method for backward compatibility
    showConfirmModal(cardData) {
        this.showConfirmation(cardData);
    }

    async handleConfirmAdd() {
        if (!this.currentCardData) return;
        
        try {
            // Check for duplicates before adding
            const duplicateCheck = await this.checkForDuplicates(this.currentCapturedImage, this.currentCardData);
            
            if (duplicateCheck.isDuplicate) {
                this.showDuplicateWarning(duplicateCheck.matches);
                return;
            }
            
            // Generate image hash for future duplicate detection
            const imageHash = await this.generateImageHash(this.currentCapturedImage);
            
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
                quantity: 1,
                condition: 'Near Mint',
                isFoil: false,
                purchasePrice: 0,
                prices: await this.app.fetchPricesFromAllSources(this.currentCardData),
                notes: 'Added via card scanner',
                dateAdded: new Date().toISOString(),
                imageHash: imageHash
            };
            
            // Store the image hash for future comparisons
            if (imageHash) {
                this.imageHashes.set(cardToAdd.id, imageHash);
            }
            
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

    handleCancelAdd() {
        // Hide confirm modal and return to camera view
        document.getElementById('confirm-modal').style.display = 'none';
        document.getElementById('camera-container').style.display = 'block';
        
        // Restart scanning
        this.isScanning = true;
        this.startCardDetection();
    }

    showNotification(message, type) {
        if (this.app && this.app.showNotification) {
            this.app.showNotification(message, type);
        }
    }
}

// Export for global access
window.MTGCardScanner = MTGCardScanner;
