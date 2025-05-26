/**
 * Factory class to create firework objects
 */
import Firework from './Firework.js';

class FireworkFactory {
    constructor(colorManager, canvasWidth, canvasHeight, fireworkSettings = null) {
        this.colorManager = colorManager;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.launchHeightFactor = fireworkSettings?.launchHeightFactor || 60; // How high fireworks go
        this.gravity = fireworkSettings?.gravity || 0.035; // Store gravity for physics calculations
        this.fireworkSize = fireworkSettings?.fireworkSize || 1.0; // Store firework size setting
        this.randomSize = fireworkSettings?.randomSize || false; // Whether to use random sizes
        this.randomSizeMin = fireworkSettings?.randomSizeMin || 0.5; // Minimum random size
        this.randomSizeMax = fireworkSettings?.randomSizeMax || 2.0; // Maximum random size
        
        // NEW: Launch position settings
        this.launchSpread = fireworkSettings?.launchSpread || 20; // 0-100%
        this.launchSpreadMode = fireworkSettings?.launchSpreadMode || 'range';
        
        // NEW: Launch angle settings  
        this.launchAngleCenter = fireworkSettings?.launchAngleCenter || 90; // degrees
        this.launchAngleSpread = fireworkSettings?.launchAngleSpread || 30; // degrees
        this.launchAngleMode = fireworkSettings?.launchAngleMode || 'range';
        this.launchAngleFixed = fireworkSettings?.launchAngleFixed || 90; // degrees
        
        // Legacy support for min/max (calculated from center+spread)
        this.launchAngleMin = fireworkSettings?.launchAngleMin || 60;
        this.launchAngleMax = fireworkSettings?.launchAngleMax || 120;
        
        // Random launch power settings
        this.randomLaunchPower = fireworkSettings?.randomLaunchPower !== undefined ? fireworkSettings.randomLaunchPower : true; // Whether to use random launch power
        this.randomLaunchPowerMin = fireworkSettings?.randomLaunchPowerMin || 30; // Minimum random launch power
        this.randomLaunchPowerMax = fireworkSettings?.randomLaunchPowerMax || 90; // Maximum random launch power
    }
    
    /**
     * NEW: Calculate launch position based on spread settings
     */
    calculateLaunchPosition() {
        const centerX = this.canvasWidth / 2;
        
        switch (this.launchSpreadMode) {
            case 'center':
                return centerX;
                
            case 'random':
                // Random across entire screen width
                return Math.random() * this.canvasWidth;
                
            case 'range':
            default:
                // Range from center based on spread percentage
                const maxSpread = (this.canvasWidth * this.launchSpread / 100) / 2;
                const offset = (Math.random() - 0.5) * 2 * maxSpread;
                return Math.max(0, Math.min(this.canvasWidth, centerX + offset));
        }
    }
    
    /**
     * NEW: Calculate launch angle based on angle settings
     */
    calculateLaunchAngle() {


        switch (this.launchAngleMode) {
            case 'fixed':
                return this.launchAngleFixed;
                
            case 'random':
                // Random angle between 45-135 degrees (more reasonable range)
                return 45 + Math.random() * 90;
                
            case 'range':
            default:
                // Use center+spread system for more intuitive control
                const centerAngle = this.launchAngleCenter || 90;
                const spread = this.launchAngleSpread || 30;
                
                // Calculate random angle within spread around center
                const minAngle = Math.max(45, centerAngle - spread);
                const maxAngle = Math.min(135, centerAngle + spread);
                
                return minAngle + Math.random() * (maxAngle - minAngle);
        }
    }
    
    
    /**
     * Calculate size for a firework (random or fixed)
     * @returns {number} - The size to use for this firework
     */
    calculateFireworkSize() {
        if (this.randomSize) {
            // Generate random size between min and max
            return this.randomSizeMin + Math.random() * (this.randomSizeMax - this.randomSizeMin);
        }
        return this.fireworkSize;
    }
    
    /**
     * Calculate launch power for a firework (random or fixed)
     * @returns {number} - The launch power to use for this firework
     */
    calculateLaunchPower() {
        if (this.randomLaunchPower) {
            // Generate random launch power between min and max
            return this.randomLaunchPowerMin + Math.random() * (this.randomLaunchPowerMax - this.randomLaunchPowerMin);
        }
        return this.launchHeightFactor;
    }
    
    /**
     * ENHANCED: Create firework with angle-based velocity calculation
     * @param {number} startX - Starting X position
     * @param {number} startY - Starting Y position
     * @param {number} targetX - Target X position
     * @param {number} targetY - Target Y position
     * @param {string} color - Firework color (optional)
     * @param {number} launchAngle - Launch angle in radians (optional)
     * @returns {Firework} - The created firework
     */
    createFirework(startX, startY, targetX, targetY, color, launchAngle) {
        // Calculate velocity components based on launch angle and target
        const heightDifference = startY - targetY;
        
        // IMPROVED: Better velocity scaling that's more proportional
        // Use a minimum base velocity plus power scaling for better control
        const minVelocityMultiplier = 0.3; // Minimum velocity at power 10
        const maxVelocityMultiplier = 1.0; // Maximum velocity at power 100
        
        const normalizedPower = (this.launchHeightFactor - 10) / 90; // 0 to 1
        const velocityMultiplier = minVelocityMultiplier + normalizedPower * (maxVelocityMultiplier - minVelocityMultiplier);
        
        const baseVelocityMagnitude = Math.sqrt(Math.abs(heightDifference) * 0.10 * velocityMultiplier); // Added Math.abs to ensure positive
        const velocityVariation = 0.9 + (Math.random() * 0.2);
        const finalVelocityMagnitude = baseVelocityMagnitude * velocityVariation;
        
        // If we have a launch angle, use it directly
        if (launchAngle !== undefined) {
            const velocityObj = {
                x: finalVelocityMagnitude * Math.cos(launchAngle),
                y: -finalVelocityMagnitude * Math.sin(launchAngle)
            };
            
            // Reasonable velocity ranges that respect the launch power setting
            velocityObj.x = Math.max(-8, Math.min(8, velocityObj.x));  // Allow wider X range
            velocityObj.y = Math.min(-0.5, velocityObj.y); // Ensure upward motion (negative Y)
            
            const fireworkColor = color || this.colorManager.getRandomColor();
            const fireworkSize = this.calculateFireworkSize();
            
            return new Firework(startX, startY, targetX, targetY, fireworkColor, velocityObj, fireworkSize);
        }
        
        // Fallback to original calculation if no angle provided
        const horizontalDistance = targetX - startX;
        const horizontalVelocity = horizontalDistance * 0.02;
        const velocityObj = {
            x: Math.max(-2, Math.min(2, horizontalVelocity)),
            y: -finalVelocityMagnitude
        };
        
        const fireworkColor = color || this.colorManager.getRandomColor();
        const fireworkSize = this.calculateFireworkSize();
        
        return new Firework(startX, startY, targetX, targetY, fireworkColor, velocityObj, fireworkSize);
    }
    
    /**
     * ENHANCED: Calculate launch parameters with new position and angle controls
     * @param {number} duration - Duration of the sustained sound in milliseconds
     * @returns {Object} - Launch parameters including angle
     */
    calculateLaunchParameters(duration = 250) {
        // Calculate launch position
        const startX = this.calculateLaunchPosition();
        const startY = this.canvasHeight;
        
        // Calculate launch angle ONCE and reuse it
        const launchAngleDegrees = this.calculateLaunchAngle();
        const launchAngleRadians = (launchAngleDegrees * Math.PI) / 180;
        
        // ENHANCED: Use random or fixed launch power
        const currentLaunchPower = this.calculateLaunchPower();
        
        // FIXED: Launch power now directly corresponds to viewport height percentage
        // Power 10 = firework reaches 10% of screen height from bottom
        // Power 50 = firework reaches 50% of screen height from bottom  
        // Power 100 = firework reaches 90% of screen height from bottom (cap for safety)
        const clampedFactor = Math.max(10, Math.min(100, currentLaunchPower));
        
        // Convert power to height percentage (with 90% max for safety)
        const heightPercentage = Math.min(clampedFactor, 90) / 100;
        
        // Calculate target Y position from bottom of screen
        const targetHeightFromBottom = this.canvasHeight * heightPercentage;
        const finalTargetY = this.canvasHeight - targetHeightFromBottom;
        
        // Apply duration bonus (small bonus for sustained sounds)
        const normalizedDuration = Math.min(duration / 1500, 1);
        const durationBonus = normalizedDuration * 0.1 * this.canvasHeight; // Max 10% bonus
        const adjustedTargetY = Math.max(5, finalTargetY - durationBonus);
        
        // Calculate distance to travel to reach target height
        const heightDistance = startY - adjustedTargetY;
        
        // Calculate target X position based on angle and height
        // For angles: 90° = straight up, <90° = right, >90° = left
        const horizontalDistance = heightDistance * Math.tan(Math.PI/2 - launchAngleRadians);
        const targetX = startX + horizontalDistance;
        
        return { 
            startX, 
            startY, 
            targetX: Math.max(0, Math.min(this.canvasWidth, targetX)), 
            targetY: adjustedTargetY,
            launchAngle: launchAngleRadians
        };
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
     * ENHANCED: Update factory settings with new launch controls
     * @param {Object} settings - New settings to apply
     */
    updateSettings(settings) {
        // Existing settings
        if (settings.launchHeightFactor !== undefined) this.launchHeightFactor = settings.launchHeightFactor;
        if (settings.gravity !== undefined) this.gravity = settings.gravity;
        if (settings.fireworkSize !== undefined) this.fireworkSize = settings.fireworkSize;
        if (settings.randomSize !== undefined) this.randomSize = settings.randomSize;
        if (settings.randomSizeMin !== undefined) this.randomSizeMin = settings.randomSizeMin;
        if (settings.randomSizeMax !== undefined) this.randomSizeMax = settings.randomSizeMax;
        
        // NEW: Launch position settings
        if (settings.launchSpread !== undefined) this.launchSpread = settings.launchSpread;
        if (settings.launchSpreadMode !== undefined) this.launchSpreadMode = settings.launchSpreadMode;
        
        // NEW: Launch angle settings
        if (settings.launchAngleCenter !== undefined) this.launchAngleCenter = settings.launchAngleCenter;
        if (settings.launchAngleSpread !== undefined) this.launchAngleSpread = settings.launchAngleSpread;
        if (settings.launchAngleMode !== undefined) this.launchAngleMode = settings.launchAngleMode;
        if (settings.launchAngleFixed !== undefined) this.launchAngleFixed = settings.launchAngleFixed;
        
        // Legacy support for min/max settings
        if (settings.launchAngleMin !== undefined) this.launchAngleMin = settings.launchAngleMin;
        if (settings.launchAngleMax !== undefined) this.launchAngleMax = settings.launchAngleMax;
        
        // Random launch power settings
        if (settings.randomLaunchPower !== undefined) this.randomLaunchPower = settings.randomLaunchPower;
        if (settings.randomLaunchPowerMin !== undefined) this.randomLaunchPowerMin = settings.randomLaunchPowerMin;
        if (settings.randomLaunchPowerMax !== undefined) this.randomLaunchPowerMax = settings.randomLaunchPowerMax;
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