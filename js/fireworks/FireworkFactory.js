/**
 * Factory class to create firework objects
 */
import Firework from './Firework.js';

class FireworkFactory {
    constructor(colorManager, canvasWidth, canvasHeight, fireworkSettings = null) {
        this.colorManager = colorManager;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.launchHeightFactor = fireworkSettings?.launchHeightFactor || 0.15; // How high fireworks go
        this.gravity = fireworkSettings?.gravity || 0.02; // Store gravity for physics calculations
    }
    
    /**
     * Create a new firework
     * @param {number} startX - Starting X position
     * @param {number} startY - Starting Y position
     * @param {number} targetX - Target X position
     * @param {number} targetY - Target Y position
     * @param {string} color - Firework color (optional)
     * @returns {Firework} - The created firework
     */
    createFirework(startX, startY, targetX, targetY, color) {
        // Simplified physics calculation for better first-launch performance
        const heightDifference = startY - targetY;
        
        // Simple velocity calculation without complex physics
        const baseVelocity = Math.sqrt(heightDifference * 0.1);
        const velocityVariation = 0.9 + (Math.random() * 0.2); // 90-110% variation
        const finalVerticalVelocity = -baseVelocity * velocityVariation;
        
        // Simple horizontal velocity
        const horizontalDistance = targetX - startX;
        const horizontalVelocity = horizontalDistance * 0.02;
        
        const velocityObj = {
            x: Math.max(-2, Math.min(2, horizontalVelocity)), // Clamp horizontal velocity
            y: finalVerticalVelocity
        };
        
        // Get color if not provided
        const fireworkColor = color || this.colorManager.getRandomColor();
        
        // Create and return the firework
        return new Firework(startX, startY, targetX, targetY, fireworkColor, velocityObj);
    }
    
    /**
     * Calculate launch parameters for a firework based on duration
     * @param {number} duration - Duration of the sustained sound in milliseconds
     * @returns {Object} - Launch parameters
     */
    calculateLaunchParameters(duration = 250) {
        // Calculate target height based on duration and launch height factor
        const startHeight = this.canvasHeight; // Start from bottom
        
        // Clamp launchHeightFactor to reasonable range (10 to 100)
        const clampedFactor = Math.max(10, Math.min(100, this.launchHeightFactor));
        
        // Map factor 10-100 to height range 80%-5% from top
        // Factor 10 = 80% from top (lower)
        // Factor 50 = 42.5% from top (middle) 
        // Factor 100 = 5% from top (very high)
        const minHeightPercent = 0.05; // 5% from top (highest)
        const maxHeightPercent = 0.80; // 80% from top (lowest)
        
        // Linear interpolation between min and max
        const heightFromTop = maxHeightPercent - ((clampedFactor - 10) / (100 - 10)) * (maxHeightPercent - minHeightPercent);
        const targetY = this.canvasHeight * heightFromTop;
        
        // Normalize duration and adjust height based on sustained sound duration
        const normalizedDuration = Math.min(duration / 1500, 1);
        const durationBonus = normalizedDuration * 0.15; // Up to 15% closer to top for long sounds
        const finalTargetY = Math.max(5, targetY - (this.canvasHeight * durationBonus)); // Move closer to top
        
        console.log('[FireworkFactory] Launch params:', {
            canvasHeight: this.canvasHeight,
            launchHeightFactor: this.launchHeightFactor,
            clampedFactor,
            heightFromTop,
            targetY,
            finalTargetY,
            duration,
            normalizedDuration,
            durationBonus,
            heightPercentageFromTop: (finalTargetY / this.canvasHeight) * 100,
            heightPercentageFromBottom: (1 - finalTargetY / this.canvasHeight) * 100
        });
        
        // Set X positions
        const centerX = this.canvasWidth / 2;
        const spread = this.canvasWidth * 0.2;
        const startX = centerX + (Math.random() - 0.5) * spread;
        const targetX = centerX + (Math.random() - 0.5) * spread;
        const startY = this.canvasHeight;
        
        return { startX, startY, targetX, targetY: finalTargetY };
    }
    
    /**
     * Get a color for the firework, using custom images if available
     * @returns {Object} - Firework color information
     */
    getFireworkColor() {
        let fireworkColor = null;
        let selectedCustomImageId = null;
        
        // Try to get a color from the image system
        if (window.imageSystem && window.imageSystem.imageManager) {
            try {
                const randomImage = window.imageSystem.imageManager.getRandomImage();
                
                if (randomImage && randomImage.dominantColor && randomImage.dominantColor.hex) {
                    fireworkColor = randomImage.dominantColor.hex;
                    selectedCustomImageId = randomImage.id;
                    
                    // Validate hex color format
                    if (!/^#[0-9A-F]{6}$/i.test(fireworkColor)) {
                        fireworkColor = this.colorManager.getRandomColor();
                        selectedCustomImageId = null;
                    }
                } else {
                    fireworkColor = this.colorManager.getRandomColor();
                }
            } catch (error) {
                fireworkColor = this.colorManager.getRandomColor();
            }
        } else {
            fireworkColor = this.colorManager.getRandomColor();
        }
        
        return { fireworkColor, selectedCustomImageId };
    }
    
    /**
     * Update factory settings
     * @param {Object} settings - New settings to apply
     */
    updateSettings(settings) {
        if (settings.launchHeightFactor !== undefined) {
            console.log('[FireworkFactory] Updating launchHeightFactor from', this.launchHeightFactor, 'to', settings.launchHeightFactor);
            this.launchHeightFactor = settings.launchHeightFactor;
        }
        if (settings.gravity !== undefined) {
            console.log('[FireworkFactory] Updating gravity from', this.gravity, 'to', settings.gravity);
            this.gravity = settings.gravity;
        }
    }
    
    /**
     * Update canvas dimensions
     * @param {number} width - New canvas width
     * @param {number} height - New canvas height
     */
    updateCanvasDimensions(width, height) {
        this.canvasWidth = width;
        this.canvasHeight = height;
    }
}

export default FireworkFactory;