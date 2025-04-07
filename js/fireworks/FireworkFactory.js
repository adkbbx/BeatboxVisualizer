/**
 * Factory class to create firework objects
 */
import Firework from './Firework.js';

class FireworkFactory {
    constructor(colorManager, canvasWidth, canvasHeight) {
        this.colorManager = colorManager;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
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
        // Calculate angle between start and target
        const angle = Math.atan2(targetY - startY, targetX - startX);
        
        // Limit the angle to be more vertical (between -45 and 45 degrees for straighter paths)
        const maxAngle = Math.PI / 2;
        const clampedAngle = Math.max(-maxAngle, Math.min(maxAngle, angle));
        
        // Calculate distance to target
        const distance = Math.hypot(targetX - startX, targetY - startY);
        
        // Increase base velocity and adjust scaling for higher launches
        const baseVelocity = 3; 
        const velocity = baseVelocity * Math.sqrt(distance / 300);
        
        // Set velocity components
        const velocityObj = {
            x: Math.cos(clampedAngle) * velocity,
            y: Math.sin(clampedAngle) * velocity
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
        // Calculate target height based on duration
        const minHeight = this.canvasHeight * 0.2; // Lower starting point
        const maxHeight = this.canvasHeight * 0.05; // Target closer to top (5% from top)
        const heightRange = minHeight - maxHeight;
        
        // Normalize duration and calculate target height
        const normalizedDuration = Math.min(duration / 1500, 1);
        const targetY = minHeight - (heightRange * normalizedDuration);
        
        // Set X positions
        const centerX = this.canvasWidth / 2;
        const spread = this.canvasWidth * 0.2;
        const startX = centerX + (Math.random() - 0.5) * spread;
        const targetX = centerX + (Math.random() - 0.5) * spread;
        const startY = this.canvasHeight;
        
        return { startX, startY, targetX, targetY };
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