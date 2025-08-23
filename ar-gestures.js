// === MTG Collection Tracker - AR Gesture Recognition System ===
// Arcane Lens - Touch and Gesture Handling for AR Interactions

class ARGestureHandler {
    constructor(arPreview) {
        this.arPreview = arPreview;
        this.isEnabled = false;
        this.touchStartTime = 0;
        this.touchStartPos = { x: 0, y: 0 };
        this.lastTouchPos = { x: 0, y: 0 };
        this.touchCount = 0;
        this.longPressTimer = null;
        this.longPressThreshold = 500; // ms
        this.swipeThreshold = 50; // pixels
        this.tapThreshold = 10; // pixels
        this.pinchStartDistance = 0;
        this.currentScale = 1;
        this.isLongPressing = false;
        this.isPinching = false;
        this.isSwiping = false;
        
        // Gesture state tracking
        this.gestureState = {
            type: null, // 'tap', 'longpress', 'swipe', 'pinch'
            startTime: 0,
            startPosition: { x: 0, y: 0 },
            currentPosition: { x: 0, y: 0 },
            distance: 0,
            direction: null,
            scale: 1,
            velocity: 0
        };
        
        // Active touches for multi-touch gestures
        this.activeTouches = new Map();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        console.log('AR Gesture Handler initialized');
    }

    enable() {
        this.isEnabled = true;
        console.log('AR gestures enabled');
    }

    disable() {
        this.isEnabled = false;
        this.resetGestureState();
        console.log('AR gestures disabled');
    }

    setupEventListeners() {
        // Touch events for mobile
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: false });
        document.addEventListener('touchcancel', (e) => this.handleTouchCancel(e), { passive: false });
        
        // Mouse events for desktop testing
        document.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        
        // Prevent context menu on long press
        document.addEventListener('contextmenu', (e) => {
            if (this.isEnabled && this.arPreview.isARActive) {
                e.preventDefault();
            }
        });
        
        // Prevent default touch behaviors during AR
        document.addEventListener('touchstart', (e) => {
            if (this.isEnabled && this.arPreview.isARActive) {
                e.preventDefault();
            }
        }, { passive: false });
    }

    // === TOUCH EVENT HANDLERS ===
    handleTouchStart(e) {
        if (!this.isEnabled || !this.arPreview.isARActive) return;
        
        e.preventDefault();
        
        const touches = Array.from(e.touches);
        this.touchCount = touches.length;
        
        // Store all active touches
        touches.forEach(touch => {
            this.activeTouches.set(touch.identifier, {
                id: touch.identifier,
                startX: touch.clientX,
                startY: touch.clientY,
                currentX: touch.clientX,
                currentY: touch.clientY,
                startTime: Date.now()
            });
        });
        
        if (this.touchCount === 1) {
            this.handleSingleTouchStart(touches[0]);
        } else if (this.touchCount === 2) {
            this.handlePinchStart(touches);
        }
    }

    handleTouchMove(e) {
        if (!this.isEnabled || !this.arPreview.isARActive) return;
        
        e.preventDefault();
        
        const touches = Array.from(e.touches);
        
        // Update active touches
        touches.forEach(touch => {
            if (this.activeTouches.has(touch.identifier)) {
                const activeTouch = this.activeTouches.get(touch.identifier);
                activeTouch.currentX = touch.clientX;
                activeTouch.currentY = touch.clientY;
            }
        });
        
        if (this.touchCount === 1) {
            this.handleSingleTouchMove(touches[0]);
        } else if (this.touchCount === 2) {
            this.handlePinchMove(touches);
        }
    }

    handleTouchEnd(e) {
        if (!this.isEnabled || !this.arPreview.isARActive) return;
        
        e.preventDefault();
        
        const changedTouches = Array.from(e.changedTouches);
        
        // Remove ended touches
        changedTouches.forEach(touch => {
            this.activeTouches.delete(touch.identifier);
        });
        
        this.touchCount = e.touches.length;
        
        if (this.touchCount === 0) {
            this.handleAllTouchesEnd();
        } else if (this.touchCount === 1 && this.isPinching) {
            // Transition from pinch to single touch
            this.handlePinchEnd();
            const remainingTouch = Array.from(e.touches)[0];
            this.handleSingleTouchStart(remainingTouch);
        }
    }

    handleTouchCancel(e) {
        if (!this.isEnabled || !this.arPreview.isARActive) return;
        
        this.resetGestureState();
        this.activeTouches.clear();
        this.touchCount = 0;
    }

    // === SINGLE TOUCH GESTURES ===
    handleSingleTouchStart(touch) {
        this.touchStartTime = Date.now();
        this.touchStartPos = { x: touch.clientX, y: touch.clientY };
        this.lastTouchPos = { x: touch.clientX, y: touch.clientY };
        
        this.gestureState = {
            type: null,
            startTime: this.touchStartTime,
            startPosition: { ...this.touchStartPos },
            currentPosition: { ...this.touchStartPos },
            distance: 0,
            direction: null,
            scale: 1,
            velocity: 0
        };
        
        // Start long press timer
        this.longPressTimer = setTimeout(() => {
            if (!this.isSwiping && this.touchCount === 1) {
                this.handleLongPress();
            }
        }, this.longPressThreshold);
    }

    handleSingleTouchMove(touch) {
        if (this.isPinching) return;
        
        this.lastTouchPos = { x: touch.clientX, y: touch.clientY };
        this.gestureState.currentPosition = { ...this.lastTouchPos };
        
        const deltaX = touch.clientX - this.touchStartPos.x;
        const deltaY = touch.clientY - this.touchStartPos.y;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        this.gestureState.distance = distance;
        
        // Check if movement exceeds swipe threshold
        if (distance > this.swipeThreshold && !this.isLongPressing) {
            if (!this.isSwiping) {
                this.handleSwipeStart(deltaX, deltaY);
            } else {
                this.handleSwipeMove(deltaX, deltaY);
            }
        }
    }

    handleAllTouchesEnd() {
        const touchDuration = Date.now() - this.touchStartTime;
        const distance = this.gestureState.distance;
        
        // Clear long press timer
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
        
        // Determine gesture type
        if (this.isLongPressing) {
            this.handleLongPressEnd();
        } else if (this.isSwiping) {
            this.handleSwipeEnd();
        } else if (distance < this.tapThreshold && touchDuration < 300) {
            this.handleTap();
        }
        
        this.resetGestureState();
    }

    // === PINCH GESTURES ===
    handlePinchStart(touches) {
        if (touches.length !== 2) return;
        
        const touch1 = touches[0];
        const touch2 = touches[1];
        
        const deltaX = touch2.clientX - touch1.clientX;
        const deltaY = touch2.clientY - touch1.clientY;
        this.pinchStartDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        this.isPinching = true;
        this.currentScale = 1;
        
        // Clear any single touch timers
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
        
        this.gestureState.type = 'pinch';
        this.gestureState.startTime = Date.now();
        
        console.log('Pinch gesture started');
        this.showGestureHint('Pinch to zoom', touch1.clientX, touch1.clientY);
    }

    handlePinchMove(touches) {
        if (!this.isPinching || touches.length !== 2) return;
        
        const touch1 = touches[0];
        const touch2 = touches[1];
        
        const deltaX = touch2.clientX - touch1.clientX;
        const deltaY = touch2.clientY - touch1.clientY;
        const currentDistance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        const scale = currentDistance / this.pinchStartDistance;
        this.currentScale = scale;
        this.gestureState.scale = scale;
        
        // Apply pinch zoom to AR scene
        this.applyPinchZoom(scale);
    }

    handlePinchEnd() {
        if (!this.isPinching) return;
        
        console.log('Pinch gesture ended, final scale:', this.currentScale);
        
        // Finalize zoom level
        this.finalizePinchZoom(this.currentScale);
        
        this.isPinching = false;
        this.pinchStartDistance = 0;
        this.currentScale = 1;
    }

    // === GESTURE ACTIONS ===
    handleTap() {
        console.log('Tap gesture detected');
        
        const tapPosition = this.gestureState.startPosition;
        const targetCard = this.getCardAtPosition(tapPosition.x, tapPosition.y);
        
        if (targetCard) {
            this.flipCard(targetCard);
            this.showGestureHint('Card flipped!', tapPosition.x, tapPosition.y);
            
            // Haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate(50);
            }
        } else {
            this.showGestureHint('Tap a card to flip it', tapPosition.x, tapPosition.y);
        }
    }

    handleLongPress() {
        console.log('Long press gesture detected');
        
        this.isLongPressing = true;
        const pressPosition = this.gestureState.startPosition;
        const targetCard = this.getCardAtPosition(pressPosition.x, pressPosition.y);
        
        if (targetCard) {
            this.showCardDetails(targetCard);
            this.showGestureHint('Card details shown', pressPosition.x, pressPosition.y);
            
            // Stronger haptic feedback for long press
            if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100]);
            }
        } else {
            this.showGestureHint('Hold on a card for details', pressPosition.x, pressPosition.y);
        }
    }

    handleLongPressEnd() {
        console.log('Long press ended');
        this.isLongPressing = false;
    }

    handleSwipeStart(deltaX, deltaY) {
        console.log('Swipe gesture started');
        
        this.isSwiping = true;
        
        // Determine swipe direction
        const direction = this.getSwipeDirection(deltaX, deltaY);
        this.gestureState.direction = direction;
        this.gestureState.type = 'swipe';
        
        // Clear long press timer
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
        
        this.showGestureHint(`Swiping ${direction}`, this.lastTouchPos.x, this.lastTouchPos.y);
    }

    handleSwipeMove(deltaX, deltaY) {
        // Update swipe direction if it changes significantly
        const direction = this.getSwipeDirection(deltaX, deltaY);
        this.gestureState.direction = direction;
        
        // Calculate velocity
        const timeDelta = Date.now() - this.gestureState.startTime;
        const distance = this.gestureState.distance;
        this.gestureState.velocity = distance / timeDelta;
    }

    handleSwipeEnd() {
        console.log('Swipe gesture ended:', this.gestureState.direction, 'velocity:', this.gestureState.velocity);
        
        const direction = this.gestureState.direction;
        const velocity = this.gestureState.velocity;
        
        // Only process swipe if it has sufficient velocity
        if (velocity > 0.3) { // pixels per ms
            this.navigateCards(direction);
            this.showGestureHint(`Navigated ${direction}`, this.lastTouchPos.x, this.lastTouchPos.y);
            
            // Haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate(75);
            }
        }
        
        this.isSwiping = false;
    }

    // === MOUSE EVENT HANDLERS (for desktop testing) ===
    handleMouseDown(e) {
        if (!this.isEnabled || !this.arPreview.isARActive) return;
        
        // Simulate touch start
        const simulatedTouch = {
            identifier: 0,
            clientX: e.clientX,
            clientY: e.clientY
        };
        
        this.handleSingleTouchStart(simulatedTouch);
    }

    handleMouseMove(e) {
        if (!this.isEnabled || !this.arPreview.isARActive) return;
        if (!this.touchStartTime) return; // No active mouse down
        
        // Simulate touch move
        const simulatedTouch = {
            identifier: 0,
            clientX: e.clientX,
            clientY: e.clientY
        };
        
        this.handleSingleTouchMove(simulatedTouch);
    }

    handleMouseUp(e) {
        if (!this.isEnabled || !this.arPreview.isARActive) return;
        if (!this.touchStartTime) return; // No active mouse down
        
        this.handleAllTouchesEnd();
    }

    // === UTILITY METHODS ===
    getSwipeDirection(deltaX, deltaY) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);
        
        if (absX > absY) {
            return deltaX > 0 ? 'right' : 'left';
        } else {
            return deltaY > 0 ? 'down' : 'up';
        }
    }

    getCardAtPosition(x, y) {
        // This would use raycasting in a real 3D implementation
        // For now, we'll simulate by checking if position is over any AR cards
        
        if (!this.arPreview.arCards || this.arPreview.arCards.length === 0) {
            return null;
        }
        
        // Simple simulation - return first card if touch is in center area
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const threshold = 150;
        
        if (Math.abs(x - centerX) < threshold && Math.abs(y - centerY) < threshold) {
            return this.arPreview.arCards[0];
        }
        
        return null;
    }

    flipCard(cardModel) {
        if (cardModel && cardModel.userData && cardModel.userData.interactions) {
            cardModel.userData.interactions.onTap();
        }
    }

    showCardDetails(cardModel) {
        if (cardModel && cardModel.userData && cardModel.userData.interactions) {
            cardModel.userData.interactions.onLongPress();
        }
    }

    navigateCards(direction) {
        // Implement card navigation based on direction
        console.log('Navigating cards:', direction);
        
        if (this.arPreview.arCards && this.arPreview.arCards.length > 1) {
            // Simple navigation - rotate through cards
            const currentIndex = this.arPreview.currentCardIndex || 0;
            let newIndex;
            
            switch (direction) {
                case 'left':
                case 'up':
                    newIndex = (currentIndex - 1 + this.arPreview.arCards.length) % this.arPreview.arCards.length;
                    break;
                case 'right':
                case 'down':
                    newIndex = (currentIndex + 1) % this.arPreview.arCards.length;
                    break;
                default:
                    return;
            }
            
            this.arPreview.currentCardIndex = newIndex;
            this.highlightCard(this.arPreview.arCards[newIndex]);
        }
    }

    applyPinchZoom(scale) {
        // Apply zoom to AR camera or scene
        if (this.arPreview.camera) {
            // Clamp scale to reasonable limits
            const clampedScale = Math.max(0.5, Math.min(3.0, scale));
            
            // Apply zoom by adjusting camera position or FOV
            const baseFOV = 75;
            const newFOV = baseFOV / clampedScale;
            this.arPreview.camera.fov = Math.max(10, Math.min(120, newFOV));
            this.arPreview.camera.updateProjectionMatrix();
            
            console.log('Applied pinch zoom:', clampedScale, 'FOV:', newFOV);
        }
    }

    finalizePinchZoom(finalScale) {
        // Finalize zoom level with smooth transition
        console.log('Finalizing zoom at scale:', finalScale);
        
        // Could add smooth transition back to neutral zoom if desired
        if (finalScale < 0.8 || finalScale > 2.0) {
            this.smoothZoomTo(1.0, 300); // Return to normal zoom
        }
    }

    smoothZoomTo(targetScale, duration) {
        if (!this.arPreview.camera) return;
        
        const startFOV = this.arPreview.camera.fov;
        const targetFOV = 75 / targetScale;
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 0.5 - 0.5 * Math.cos(progress * Math.PI);
            
            const currentFOV = startFOV + (targetFOV - startFOV) * easeProgress;
            this.arPreview.camera.fov = currentFOV;
            this.arPreview.camera.updateProjectionMatrix();
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    highlightCard(cardModel) {
        // Remove highlight from all cards
        this.arPreview.arCards.forEach(card => {
            if (card.userData.highlight) {
                card.remove(card.userData.highlight);
                card.userData.highlight = null;
            }
        });
        
        // Add highlight to selected card
        if (cardModel) {
            try {
                const highlightGeometry = new THREE.BoxGeometry(0.44, 0.6, 0.006);
                const highlightMaterial = new THREE.MeshBasicMaterial({
                    color: 0xFFD700,
                    transparent: true,
                    opacity: 0.3,
                    side: THREE.BackSide
                });
                
                const highlight = new THREE.Mesh(highlightGeometry, highlightMaterial);
                cardModel.add(highlight);
                cardModel.userData.highlight = highlight;
                
                console.log('Card highlighted');
            } catch (error) {
                console.warn('Could not create card highlight:', error);
            }
        }
    }

    showGestureHint(message, x, y) {
        // Remove existing hints
        const existingHints = document.querySelectorAll('.ar-gesture-hint');
        existingHints.forEach(hint => hint.remove());
        
        // Create new hint
        const hint = document.createElement('div');
        hint.className = 'ar-gesture-hint';
        hint.textContent = message;
        hint.style.left = `${x}px`;
        hint.style.top = `${y - 60}px`;
        
        document.body.appendChild(hint);
        
        // Auto-remove after 2 seconds
        setTimeout(() => {
            if (hint.parentNode) {
                hint.remove();
            }
        }, 2000);
    }

    resetGestureState() {
        this.touchStartTime = 0;
        this.touchStartPos = { x: 0, y: 0 };
        this.lastTouchPos = { x: 0, y: 0 };
        this.touchCount = 0;
        this.isLongPressing = false;
        this.isPinching = false;
        this.isSwiping = false;
        this.pinchStartDistance = 0;
        this.currentScale = 1;
        
        if (this.longPressTimer) {
            clearTimeout(this.longPressTimer);
            this.longPressTimer = null;
        }
        
        this.gestureState = {
            type: null,
            startTime: 0,
            startPosition: { x: 0, y: 0 },
            currentPosition: { x: 0, y: 0 },
            distance: 0,
            direction: null,
            scale: 1,
            velocity: 0
        };
        
        this.activeTouches.clear();
    }

    // === PUBLIC API ===
    getCurrentGesture() {
        return { ...this.gestureState };
    }

    isGestureActive() {
        return this.gestureState.type !== null;
    }

    setGestureSensitivity(sensitivity) {
        // Adjust thresholds based on sensitivity (0.5 - 2.0)
        const baseLongPress = 500;
        const baseSwipe = 50;
        const baseTap = 10;
        
        this.longPressThreshold = baseLongPress / sensitivity;
        this.swipeThreshold = baseSwipe / sensitivity;
        this.tapThreshold = baseTap * sensitivity;
        
        console.log('Gesture sensitivity updated:', sensitivity);
    }
}

// Export for global access
window.ARGestureHandler = ARGestureHandler;
