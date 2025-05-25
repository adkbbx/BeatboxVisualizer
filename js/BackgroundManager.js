/**
 * BackgroundManager handles multiple background images with smooth transitions
 * Now uses dedicated backgroundCanvas for proper layering
 */
class BackgroundManager {
    constructor() {
        this.canvas = document.getElementById('backgroundCanvas');
        if (!this.canvas) {
            console.error('Background canvas not found!');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.backgroundImages = [];
        this.currentIndex = 0;
        this.nextIndex = 0;
        this.transitionProgress = 0;
        this.transitionDuration = 2000; // transition duration in ms
        this.displayDuration = 5000; // how long to display each image (ms)
        this.lastUpdateTime = 0;
        this.lastDrawTime = 0; // Add frame rate limiting
        this.isTransitioning = false;
        this.isActive = false;
        this.opacity = 0.8; // background opacity (increased for better visibility)
        this.animationFrameId = null; // To store the requestAnimationFrame ID
        this.timeSinceLastTransition = 0; // Time accumulator for displayDuration
        
        // Default background color if no images
        this.defaultBackground = '#000000';
        this.backgroundImages = [];
        this.currentIndex = 0;
        this.nextIndex = 0;
        this.transitionProgress = 0;
        this.transitionDuration = 2000; // transition duration in ms
        this.displayDuration = 5000; // how long to display each image (ms)
        this.lastUpdateTime = 0;
        this.lastDrawTime = 0; // Add frame rate limiting
        this.isTransitioning = false;
        this.isActive = false;
        this.opacity = 0.8; // background opacity (increased for better visibility)
        this.animationFrameId = null; // To store the requestAnimationFrame ID
        this.timeSinceLastTransition = 0; // Time accumulator for displayDuration
        
        // Default background color if no images
        this.defaultBackground = '#000000';
    }
    
    /**
     * Add a new background image
     * @param {HTMLImageElement} image - The image to add
     */
    addBackgroundImage(image) {
        this.backgroundImages.push(image);
        
        // Start the background cycle if it's the first image and not already active
        if (this.backgroundImages.length > 0 && !this.isActive) { // Ensure it starts if images exist
            this.startIndependentLoop(); // Changed from this.start()
        }
        
        return this.backgroundImages.length - 1; // return the index of the added image
    }
    
    /**
     * Remove a background image by index
     * @param {number} index - The index of the image to remove
     */
    removeBackgroundImage(index) {
        if (index >= 0 && index < this.backgroundImages.length) {
            this.backgroundImages.splice(index, 1);
            // Reset current index if needed
            if (this.currentIndex >= this.backgroundImages.length) {
                this.currentIndex = 0;
            }
            
            // Stop if no images left
            if (this.backgroundImages.length === 0) {
                this.stop();
            }
        }
    }
    
    /**
     * Clear all background images
     */
    clearBackgroundImages() {
        this.backgroundImages = [];
        this.stop();
    }
    
    /**
     * Initializes active state and last update time.
     * Called by startIndependentLoop or when restarting.
     */
    _initializeActivity() {
        if (this.backgroundImages.length > 0) {
            this.isActive = true;
            this.lastUpdateTime = performance.now();
            this.timeSinceLastTransition = 0; // Reset when activity (re)starts
            // Reset transition state if we are restarting after a stop
            // or if it's the very first image being added.
            if (this.backgroundImages.length === 1) {
                this.currentIndex = 0;
                this.nextIndex = 0;
                this.isTransitioning = false;
                this.transitionProgress = 0;
            }
        } else {
            this.isActive = false; // Should not be active if no images
        }
    }
    
    /**
     * Start the independent background update and draw loop.
     */
    startIndependentLoop() {
        if (this.isActive && this.animationFrameId) {
            // Already running
            return;
        }
        this._initializeActivity(); // Set active state and timers

        if (!this.isActive) { // Don't start if no images
            return;
        }

        const loop = (timestamp) => {
            if (!this.isActive) {
                this.animationFrameId = null;
                return; // Stop the loop if not active
            }
            
            // Limit to 30 FPS for background to reduce glitching
            const now = performance.now();
            if (!this.lastDrawTime) this.lastDrawTime = now;
            if (now - this.lastDrawTime < 33) { // ~30 FPS
                this.animationFrameId = requestAnimationFrame(loop);
                return;
            }
            this.lastDrawTime = now;
            
            this.update(timestamp);
            this.draw();
            this.animationFrameId = requestAnimationFrame(loop);
        };
        this.animationFrameId = requestAnimationFrame(loop);
    }
    
    /**
     * Stop the background cycle and its independent loop.
     */
    stop() {
        this.isActive = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        // Optionally, clear the canvas or draw default background when stopped
        // For now, we'll let the last drawn frame persist until a new image or setting changes it.
        // If needed, could add: this.draw(); // to draw default if all images removed
    }
    
    /**
     * Update the background state
     * @param {number} timestamp - Current animation timestamp
     */
    update(timestamp) {
        if (!this.isActive || this.backgroundImages.length === 0) {
            return;
        }
        
        // Ensure lastUpdateTime is valid if update is called before loop properly starts or after a long pause
        if (this.lastUpdateTime === 0) { 
            this.lastUpdateTime = timestamp;
        }

        const deltaTime = timestamp - this.lastUpdateTime;
        this.lastUpdateTime = timestamp;
        
        if (this.isTransitioning) {
            // Update transition progress
            this.transitionProgress += deltaTime / this.transitionDuration;
            
            // Check if transition is complete
            if (this.transitionProgress >= 1) {
                this.transitionProgress = 0;
                this.isTransitioning = false;
                this.currentIndex = this.nextIndex;
                this.timeSinceLastTransition = 0; // Reset after transition completes
            }
        } else {
            this.timeSinceLastTransition += deltaTime;
            // Check if it's time to start a new transition
            if (this.backgroundImages.length > 1 && this.timeSinceLastTransition >= this.displayDuration) {
                this.startTransition();
            }
        }
    }
    
    /**
     * Draw the current background
     */
    draw() {
        if (!this.canvas || !this.ctx) {
            return;
        }
        
        // Clear the canvas first to prevent glitching
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.backgroundImages.length === 0) {
            // Draw default black background
            this.ctx.fillStyle = this.defaultBackground;
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            return;
        }
        
        // Save context state
        this.ctx.save();
        
        // Set global alpha for background
        this.ctx.globalAlpha = this.opacity;
        
        // Set global alpha for background
        this.ctx.globalAlpha = this.opacity;
        
        if (this.isTransitioning && this.backgroundImages.length > 1) {
            // Draw current image
            this.drawImage(this.backgroundImages[this.currentIndex], 1 - this.transitionProgress);
            
            // Draw next image with transition opacity
            this.drawImage(this.backgroundImages[this.nextIndex], this.transitionProgress);
        } else {
            // Draw only the current image
            this.drawImage(this.backgroundImages[this.currentIndex], 1);
        }
        
        // Restore context state
        this.ctx.restore();
    }
    
    /**
     * Draw a single background image with specified opacity
     * @param {HTMLImageElement} image - The image to draw
     * @param {number} opacity - The opacity to use (0-1)
     */
    drawImage(image, opacity) {
        // Skip if image not loaded
        if (!image.complete) {
            return;
        }
        
        this.ctx.globalAlpha = this.opacity * opacity;
        
        // Calculate dimensions to cover the canvas while maintaining aspect ratio
        const canvasRatio = this.canvas.width / this.canvas.height;
        const imageRatio = image.width / image.height;
        
        let drawWidth, drawHeight, offsetX, offsetY;
        
        if (imageRatio > canvasRatio) {
            // Image is wider than canvas (relative to height)
            drawHeight = this.canvas.height;
            drawWidth = drawHeight * imageRatio;
            offsetX = (this.canvas.width - drawWidth) / 2;
            offsetY = 0;
        } else {
            // Image is taller than canvas (relative to width)
            drawWidth = this.canvas.width;
            drawHeight = drawWidth / imageRatio;
            offsetX = 0;
            offsetY = (this.canvas.height - drawHeight) / 2;
        }
        
        // Draw the image
        this.ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
    }
    
    /**
     * Start a transition to the next image
     */
    startTransition() {
        if (this.backgroundImages.length < 2) return;
        
        this.isTransitioning = true;
        this.transitionProgress = 0;
        this.timeSinceLastTransition = 0; // Reset when a new transition starts
        
        // Calculate next image index
        this.nextIndex = (this.currentIndex + 1) % this.backgroundImages.length;
    }
    
    /**
     * Update settings
     * @param {Object} settings - The settings to update
     */
    updateSettings(settings) {
        if (settings.opacity !== undefined) {
            this.opacity = Math.max(0, Math.min(1, settings.opacity));
        }
        
        if (settings.transitionDuration !== undefined) {
            this.transitionDuration = settings.transitionDuration;
        }
        
        if (settings.displayDuration !== undefined) {
            this.displayDuration = settings.displayDuration;
        }
    }
}

export default BackgroundManager;