// === MTG Collection Tracker - AR Preview System ===
// Arcane Lens - Magical AR Card Viewing Experience

class ARPreview {
    constructor(app) {
        this.app = app;
        this.isARSupported = this.checkARSupport();
        this.tutorialShownKey = 'arTutorialShown';
        this.currentSession = null;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.arCards = [];
        this.gestureHandler = null;
        this.effectsManager = null;
        
        // AR Session state
        this.isARActive = false;
        this.currentSource = null;
        this.currentData = null;
        
        this.init();
    }

    init() {
        this.createARInterface();
        this.setupEventListeners();
        
        // Initialize AR components when libraries are loaded
        if (typeof THREE !== 'undefined') {
            this.initializeARComponents();
        } else {
            this.loadARLibraries().then(() => {
                this.initializeARComponents();
            });
        }
    }

    // === AR SUPPORT CHECK ===
    checkARSupport() {
        // Check for WebXR support
        if ('xr' in navigator && navigator.xr) {
            return true;
        }
        
        // Check for ARCore support (Android)
        if (window.ARCoreSupported) {
            return true;
        }
        
        // Check for ARKit support (iOS) - heuristic detection
        if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
            // iOS 11+ likely supports ARKit
            const version = navigator.userAgent.match(/OS (\d+)_/);
            if (version && parseInt(version[1]) >= 11) {
                return true;
            }
        }
        
        return false;
    }

    // === LIBRARY LOADING ===
    async loadARLibraries() {
        try {
            // Load Three.js if not already loaded
            if (typeof THREE === 'undefined') {
                await this.loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
            }
            
            // Load WebXR polyfill
            await this.loadScript('https://cdn.jsdelivr.net/npm/webxr-polyfill@latest/build/webxr-polyfill.min.js');
            
            // Load AR.js for fallback support
            await this.loadScript('https://cdn.jsdelivr.net/npm/ar.js@2.2.2/aframe/build/aframe-ar.min.js');
            
            console.log('AR libraries loaded successfully');
        } catch (error) {
            console.error('Error loading AR libraries:', error);
            this.isARSupported = false;
        }
    }

    loadScript(src) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    // === ENTRY POINTS ===
    launchARPreview(source, data = null) {
        if (this.isARSupported) {
            this.requestCameraPermission()
                .then(() => {
                    if (!localStorage.getItem(this.tutorialShownKey)) {
                        this.showTutorialOverlay();
                        localStorage.setItem(this.tutorialShownKey, 'true');
                    }
                    this.startARSession(source, data);
                })
                .catch(() => {
                    this.showPermissionDeniedMessage();
                });
        } else {
            this.showFallbackPreview(source, data);
        }
    }

    // === CAMERA PERMISSION ===
    async requestCameraPermission() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { 
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                } 
            });
            
            // Stop the stream immediately - we just needed permission
            stream.getTracks().forEach(track => track.stop());
            
            return true;
        } catch (error) {
            console.error('Camera permission denied:', error);
            throw error;
        }
    }

    // === AR SESSION MANAGEMENT ===
    async startARSession(source, data) {
        try {
            this.currentSource = source;
            this.currentData = data;
            
            // Show AR interface
            this.showARInterface();
            
            // Initialize WebXR session
            if (navigator.xr) {
                await this.initWebXRSession();
            } else {
                // Fallback to AR.js
                await this.initARJSSession();
            }
            
            // Load content based on source
            await this.loadARContent(source, data);
            
            this.isARActive = true;
            console.log(`AR session started for: ${source}`);
            
        } catch (error) {
            console.error('Error starting AR session:', error);
            this.showARError('Failed to start AR session', error.message);
        }
    }

    async initWebXRSession() {
        try {
            // Check if immersive AR is supported
            const supported = await navigator.xr.isSessionSupported('immersive-ar');
            
            if (!supported) {
                throw new Error('Immersive AR not supported');
            }
            
            // Request AR session
            this.currentSession = await navigator.xr.requestSession('immersive-ar', {
                requiredFeatures: ['local'],
                optionalFeatures: ['dom-overlay', 'hit-test']
            });
            
            // Set up WebXR renderer
            this.renderer.xr.setSession(this.currentSession);
            
            // Handle session end
            this.currentSession.addEventListener('end', () => {
                this.endARSession();
            });
            
            console.log('WebXR session initialized');
            
        } catch (error) {
            console.error('WebXR initialization failed:', error);
            throw error;
        }
    }

    async initARJSSession() {
        try {
            // Initialize AR.js as fallback
            console.log('Initializing AR.js fallback');
            
            // Create AR.js scene
            this.initARJSScene();
            
        } catch (error) {
            console.error('AR.js initialization failed:', error);
            throw error;
        }
    }

    // === AR CONTENT LOADING ===
    async loadARContent(source, data) {
        try {
            switch (source) {
                case 'qr':
                    await this.loadQRContent(data);
                    break;
                case 'card':
                    await this.loadCardContent(data);
                    break;
                case 'deck':
                    await this.loadDeckContent(data);
                    break;
                default:
                    await this.loadDefaultContent();
            }
        } catch (error) {
            console.error('Error loading AR content:', error);
            this.showARError('Failed to load content', error.message);
        }
    }

    async loadQRContent(data) {
        console.log('Loading QR AR content:', data);
        
        if (data && data.deckData) {
            // QR code contains deck data - show deck in fan arrangement
            await this.createDeckFan(data.deckData);
        } else {
            // Generic QR content
            await this.createFloatingCard({
                name: 'QR Code Detected',
                imageUrl: '/icons/icon-192x192.png',
                type: 'QR Content'
            });
        }
    }

    async loadCardContent(data) {
        console.log('Loading card AR content:', data);
        
        if (data && data.cardData) {
            await this.createFloatingCard(data.cardData);
        } else {
            // Show a sample card
            await this.createFloatingCard({
                name: 'Sample Card',
                imageUrl: '/icons/icon-192x192.png',
                type: 'Demonstration'
            });
        }
    }

    async loadDeckContent(data) {
        console.log('Loading deck AR content:', data);
        
        if (data && data.deckData) {
            await this.createDeckFan(data.deckData);
        } else {
            // Show user's current deck or sample deck
            const currentDeck = this.app.deckBuilder ? this.app.deckBuilder.getCurrentDeck() : null;
            if (currentDeck && currentDeck.length > 0) {
                await this.createDeckFan(currentDeck);
            } else {
                await this.createSampleDeck();
            }
        }
    }

    async loadDefaultContent() {
        console.log('Loading default AR content');
        await this.createSampleDeck();
    }

    // === 3D CONTENT CREATION ===
    async createFloatingCard(cardData) {
        try {
            const cardModel = await this.createCardModel(cardData);
            
            // Position card in front of user
            cardModel.position.set(0, 0, -1.5);
            cardModel.rotation.set(0, 0, 0);
            
            // Add floating animation
            this.addFloatingAnimation(cardModel);
            
            // Add to scene
            this.scene.add(cardModel);
            this.arCards.push(cardModel);
            
            // Add interaction handlers
            this.addCardInteractions(cardModel, cardData);
            
            console.log('Floating card created:', cardData.name);
            
        } catch (error) {
            console.error('Error creating floating card:', error);
        }
    }

    async createDeckFan(deckData) {
        try {
            const cards = Array.isArray(deckData) ? deckData : deckData.cards || [];
            const fanRadius = 1.5;
            const fanAngle = Math.PI / 3; // 60 degrees
            const cardCount = Math.min(cards.length, 12); // Limit for performance
            
            for (let i = 0; i < cardCount; i++) {
                const card = cards[i];
                const cardModel = await this.createCardModel(card);
                
                // Calculate position in fan
                const angle = (fanAngle / (cardCount - 1)) * i - fanAngle / 2;
                const x = Math.sin(angle) * fanRadius;
                const z = -Math.cos(angle) * fanRadius - 1;
                const y = 0.5 + Math.sin(i * 0.5) * 0.2; // Slight height variation
                
                cardModel.position.set(x, y, z);
                cardModel.rotation.set(0, angle, 0);
                
                // Add floating animation with offset
                this.addFloatingAnimation(cardModel, i * 0.2);
                
                // Add to scene
                this.scene.add(cardModel);
                this.arCards.push(cardModel);
                
                // Add interaction handlers
                this.addCardInteractions(cardModel, card);
            }
            
            console.log(`Deck fan created with ${cardCount} cards`);
            
        } catch (error) {
            console.error('Error creating deck fan:', error);
        }
    }

    async createSampleDeck() {
        const sampleCards = [
            { name: 'Lightning Bolt', type: 'Instant', imageUrl: '/icons/icon-192x192.png' },
            { name: 'Counterspell', type: 'Instant', imageUrl: '/icons/icon-192x192.png' },
            { name: 'Dark Ritual', type: 'Instant', imageUrl: '/icons/icon-192x192.png' },
            { name: 'Giant Growth', type: 'Instant', imageUrl: '/icons/icon-192x192.png' },
            { name: 'Healing Salve', type: 'Instant', imageUrl: '/icons/icon-192x192.png' }
        ];
        
        await this.createDeckFan(sampleCards);
    }

    // === 3D MODEL CREATION ===
    async createCardModel(cardData) {
        try {
            // Create card geometry (standard MTG card proportions)
            const cardWidth = 0.4;
            const cardHeight = 0.56;
            const cardThickness = 0.002;
            
            const geometry = new THREE.BoxGeometry(cardWidth, cardHeight, cardThickness);
            
            // Load card texture
            const texture = await this.loadCardTexture(cardData);
            
            // Create materials for front and back
            const frontMaterial = new THREE.MeshLambertMaterial({ 
                map: texture,
                transparent: true
            });
            
            const backMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x8B4513,
                transparent: true
            });
            
            const sideMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x654321 
            });
            
            // Create material array for different faces
            const materials = [
                sideMaterial, // right
                sideMaterial, // left
                sideMaterial, // top
                sideMaterial, // bottom
                frontMaterial, // front
                backMaterial  // back
            ];
            
            const cardMesh = new THREE.Mesh(geometry, materials);
            
            // Add card data for interactions
            cardMesh.userData = {
                cardData: cardData,
                isFlipped: false,
                originalRotation: cardMesh.rotation.clone()
            };
            
            // Add subtle glow effect
            this.addCardGlow(cardMesh);
            
            return cardMesh;
            
        } catch (error) {
            console.error('Error creating card model:', error);
            // Return a simple colored cube as fallback
            const geometry = new THREE.BoxGeometry(0.4, 0.56, 0.002);
            const material = new THREE.MeshLambertMaterial({ color: 0x4169E1 });
            return new THREE.Mesh(geometry, material);
        }
    }

    async loadCardTexture(cardData) {
        try {
            const loader = new THREE.TextureLoader();
            
            // Use card image URL if available, otherwise use placeholder
            const imageUrl = cardData.imageUrl || cardData.image_uris?.normal || '/icons/icon-192x192.png';
            
            return new Promise((resolve, reject) => {
                loader.load(
                    imageUrl,
                    (texture) => {
                        texture.minFilter = THREE.LinearFilter;
                        texture.magFilter = THREE.LinearFilter;
                        resolve(texture);
                    },
                    undefined,
                    (error) => {
                        console.warn('Failed to load card texture, using fallback');
                        // Create a simple colored texture as fallback
                        const canvas = document.createElement('canvas');
                        canvas.width = 256;
                        canvas.height = 356;
                        const ctx = canvas.getContext('2d');
                        
                        // Create gradient background
                        const gradient = ctx.createLinearGradient(0, 0, 0, 356);
                        gradient.addColorStop(0, '#4169E1');
                        gradient.addColorStop(1, '#1E3A8A');
                        ctx.fillStyle = gradient;
                        ctx.fillRect(0, 0, 256, 356);
                        
                        // Add card name
                        ctx.fillStyle = 'white';
                        ctx.font = '16px Arial';
                        ctx.textAlign = 'center';
                        ctx.fillText(cardData.name || 'MTG Card', 128, 50);
                        
                        const texture = new THREE.CanvasTexture(canvas);
                        resolve(texture);
                    }
                );
            });
            
        } catch (error) {
            console.error('Error loading card texture:', error);
            // Return a basic texture
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 356;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#4169E1';
            ctx.fillRect(0, 0, 256, 356);
            return new THREE.CanvasTexture(canvas);
        }
    }

    // === ANIMATIONS ===
    addFloatingAnimation(cardModel, offset = 0) {
        const startTime = Date.now() + offset * 1000;
        
        const animate = () => {
            if (!this.isARActive) return;
            
            const elapsed = (Date.now() - startTime) / 1000;
            const floatY = Math.sin(elapsed * 0.5) * 0.05;
            const rotateY = Math.sin(elapsed * 0.3) * 0.02;
            
            cardModel.position.y += floatY * 0.1;
            cardModel.rotation.y += rotateY * 0.1;
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }

    addCardGlow(cardMesh) {
        try {
            // Create glow effect using a larger, transparent mesh
            const glowGeometry = new THREE.BoxGeometry(0.42, 0.58, 0.004);
            const glowMaterial = new THREE.MeshBasicMaterial({
                color: 0xFFD700,
                transparent: true,
                opacity: 0.2,
                side: THREE.BackSide
            });
            
            const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
            cardMesh.add(glowMesh);
            
        } catch (error) {
            console.warn('Could not add card glow effect:', error);
        }
    }

    // === INTERACTIONS ===
    addCardInteractions(cardModel, cardData) {
        // Store interaction data
        cardModel.userData.interactions = {
            onTap: () => this.flipCard(cardModel),
            onLongPress: () => this.showCardDetails(cardData),
            onSwipe: (direction) => this.navigateCards(direction)
        };
    }

    flipCard(cardModel) {
        try {
            const userData = cardModel.userData;
            const targetRotationY = userData.isFlipped ? 0 : Math.PI;
            
            // Animate flip
            const startRotation = cardModel.rotation.y;
            const duration = 600; // ms
            const startTime = Date.now();
            
            const animateFlip = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easeProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI);
                
                cardModel.rotation.y = startRotation + (targetRotationY - startRotation) * easeProgress;
                
                if (progress < 1) {
                    requestAnimationFrame(animateFlip);
                } else {
                    userData.isFlipped = !userData.isFlipped;
                }
            };
            
            animateFlip();
            
            // Haptic feedback if available
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
            
        } catch (error) {
            console.error('Error flipping card:', error);
        }
    }

    showCardDetails(cardData) {
        // Create floating info panel
        this.createInfoPanel(cardData);
    }

    navigateCards(direction) {
        // Implement card navigation logic
        console.log('Navigate cards:', direction);
    }

    // === TUTORIAL OVERLAY ===
    showTutorialOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'arTutorial';
        overlay.className = 'ar-tutorial-overlay';
        overlay.innerHTML = `
            <div class="scroll parchment ar-tutorial-content">
                <h2>🔮 Welcome to the Arcane Lens</h2>
                <p>Harness the power of augmented reality to summon and inspect your cards in the mystical realm.</p>
                <div class="tutorial-gestures">
                    <div class="gesture-item">
                        <div class="gesture-icon">👆</div>
                        <div class="gesture-text"><strong>Tap</strong> to flip cards and reveal their secrets</div>
                    </div>
                    <div class="gesture-item">
                        <div class="gesture-icon">👈</div>
                        <div class="gesture-text"><strong>Swipe</strong> to navigate through your collection</div>
                    </div>
                    <div class="gesture-item">
                        <div class="gesture-icon">🤏</div>
                        <div class="gesture-text"><strong>Pinch</strong> to zoom and examine card details</div>
                    </div>
                    <div class="gesture-item">
                        <div class="gesture-icon">⏰</div>
                        <div class="gesture-text"><strong>Hold</strong> to summon detailed card information</div>
                    </div>
                </div>
                <button class="btn btn-primary ar-tutorial-btn" onclick="window.arPreview.closeTutorial()">
                    ✨ Begin Summoning
                </button>
            </div>
        `;
        
        document.body.appendChild(overlay);
    }

    closeTutorial() {
        const overlay = document.getElementById('arTutorial');
        if (overlay) {
            overlay.remove();
        }
    }

    // === FALLBACK PREVIEW ===
    showFallbackPreview(source, data) {
        console.warn(`AR not supported. Showing fallback for: ${source}`);
        
        // Create 2D preview modal
        this.create2DPreview(source, data);
        
        this.app.showNotification("Your device lacks the arcane power for AR summoning. Showing 2D preview instead.", 'info');
    }

    create2DPreview(source, data) {
        const modal = document.createElement('div');
        modal.className = 'modal ar-fallback-modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🔮 Arcane Lens - 2D Preview</h3>
                    <button class="close-btn" onclick="this.closest('.modal').remove()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="fallback-content" id="fallback-content">
                        <div class="loading-spinner"></div>
                        <p>Summoning preview...</p>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Load 2D content
        this.load2DContent(source, data);
    }

    async load2DContent(source, data) {
        const container = document.getElementById('fallback-content');
        
        try {
            let content = '';
            
            switch (source) {
                case 'card':
                    content = this.create2DCard(data?.cardData);
                    break;
                case 'deck':
                    content = this.create2DDeck(data?.deckData);
                    break;
                case 'qr':
                    content = this.create2DQR(data);
                    break;
                default:
                    content = '<p>Preview not available</p>';
            }
            
            container.innerHTML = content;
            
        } catch (error) {
            console.error('Error loading 2D content:', error);
            container.innerHTML = '<p>Error loading preview</p>';
        }
    }

    create2DCard(cardData) {
        if (!cardData) return '<p>No card data available</p>';
        
        return `
            <div class="card-2d-preview">
                <img src="${cardData.imageUrl || cardData.image_uris?.normal || '/icons/icon-192x192.png'}" 
                     alt="${cardData.name}" class="card-2d-image">
                <div class="card-2d-info">
                    <h4>${cardData.name}</h4>
                    <p>${cardData.type || 'Unknown Type'}</p>
                    <p>${cardData.set || 'Unknown Set'}</p>
                </div>
            </div>
        `;
    }

    create2DDeck(deckData) {
        if (!deckData) return '<p>No deck data available</p>';
        
        const cards = Array.isArray(deckData) ? deckData : deckData.cards || [];
        
        return `
            <div class="deck-2d-preview">
                <h4>Deck Preview (${cards.length} cards)</h4>
                <div class="deck-2d-grid">
                    ${cards.slice(0, 6).map(card => `
                        <div class="deck-card-mini">
                            <img src="${card.imageUrl || '/icons/icon-192x192.png'}" alt="${card.name}">
                            <span>${card.name}</span>
                        </div>
                    `).join('')}
                    ${cards.length > 6 ? `<div class="more-cards">+${cards.length - 6} more</div>` : ''}
                </div>
            </div>
        `;
    }

    create2DQR(data) {
        return `
            <div class="qr-2d-preview">
                <h4>QR Code Content</h4>
                <p>QR code detected and processed</p>
                ${data ? `<pre>${JSON.stringify(data, null, 2)}</pre>` : ''}
            </div>
        `;
    }

    // === ERROR HANDLING ===
    showPermissionDeniedMessage() {
        this.app.showNotification("Camera access denied. The arcane lens cannot be opened without camera permissions.", 'error');
    }

    showARError(title, message) {
        this.app.showNotification(`AR Error: ${title} - ${message}`, 'error');
        this.endARSession();
    }

    // === AR INTERFACE ===
    createARInterface() {
        // AR interface will be created when needed
        this.arInterface = null;
    }

    showARInterface() {
        if (this.arInterface) {
            this.arInterface.style.display = 'block';
            return;
        }
        
        this.arInterface = document.createElement('div');
        this.arInterface.className = 'ar-interface';
        this.arInterface.innerHTML = `
            <div class="ar-controls">
                <button class="ar-control-btn" id="ar-exit-btn" title="Exit AR">
                    <i class="fas fa-times"></i>
                </button>
                <button class="ar-control-btn" id="ar-help-btn" title="Help">
                    <i class="fas fa-question"></i>
                </button>
                <button class="ar-control-btn" id="ar-settings-btn" title="Settings">
                    <i class="fas fa-cog"></i>
                </button>
            </div>
            <div class="ar-info">
                <div class="ar-status">AR Active</div>
            </div>
        `;
        
        document.body.appendChild(this.arInterface);
        
        // Add event listeners
        document.getElementById('ar-exit-btn').addEventListener('click', () => this.endARSession());
        document.getElementById('ar-help-btn').addEventListener('click', () => this.showARHelp());
        document.getElementById('ar-settings-btn').addEventListener('click', () => this.showARSettings());
    }

    hideARInterface() {
        if (this.arInterface) {
            this.arInterface.style.display = 'none';
        }
    }

    // === SESSION CLEANUP ===
    endARSession() {
        try {
            this.isARActive = false;
            
            // End WebXR session
            if (this.currentSession) {
                this.currentSession.end();
                this.currentSession = null;
            }
            
            // Clean up 3D objects
            this.arCards.forEach(card => {
                if (this.scene) {
                    this.scene.remove(card);
                }
            });
            this.arCards = [];
            
            // Hide AR interface
            this.hideARInterface();
            
            // Reset state
            this.currentSource = null;
            this.currentData = null;
            
            console.log('AR session ended');
            
        } catch (error) {
            console.error('Error ending AR session:', error);
        }
    }

    // === INITIALIZATION ===
    initializeARComponents() {
        try {
            // Initialize Three.js scene
            this.scene = new THREE.Scene();
            
            // Initialize camera
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            
            // Initialize renderer
            this.renderer = new THREE.WebGLRenderer({ 
                antialias: true, 
                alpha: true 
            });
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.xr.enabled = true;
            
            // Add lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
            this.scene.add(ambientLight);
            
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(0, 1, 1);
            this.scene.add(directionalLight);
            
            console.log('AR components initialized');
            
        } catch (error) {
            console.error('Error initializing AR components:', error);
            this.isARSupported = false;
        }
    }

    initARJSScene() {
        // AR.js fallback implementation
        console.log('AR.js scene initialized');
    }

    // === EVENT LISTENERS ===
    setupEventListeners() {
        // Global AR event listeners will be added here
        
        // Handle window resize
        window.addEventListener('resize', () => {
            if (this.camera && this.renderer) {
                this.camera.aspect = window.innerWidth / window.innerHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(window.innerWidth, window.innerHeight);
            }
        });
    }

    // === UTILITY METHODS ===
    showARHelp() {
        this.showTutorialOverlay();
    }

    showARSettings() {
        this.app.showNotification('AR settings coming soon!', 'info');
    }
}

// === GLOBAL FUNCTIONS FOR INTEGRATION ===

// Entry point functions that match your original sketch
function launchARPreview(source, data) {
    if (window.arPreview) {
        window.arPreview.launchARPreview(source, data);
    } else {
        console.error('AR Preview system not initialized');
    }
}

function showFallbackPreview(source, data) {
    if (window.arPreview) {
        window.arPreview.showFallbackPreview(source, data);
    } else {
        console.error('AR Preview system not initialized');
    }
}

function checkARSupport() {
    return window.arPreview ? window.arPreview.checkARSupport() : false;
}

function requestCameraPermission() {
    return window.arPreview ? window.arPreview.requestCameraPermission() : Promise.reject('AR Preview system not initialized');
}

// Export for global access
window.ARPreview = ARPreview;
