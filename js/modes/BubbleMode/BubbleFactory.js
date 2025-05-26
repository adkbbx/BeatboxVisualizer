import Bubble from './Bubble.js';

/**
 * Factory for creating bubbles with appropriate physics and positioning
 */
class BubbleFactory {
    constructor(colorManager, canvasWidth, canvasHeight, bubbleSettings = {}) {
        this.colorManager = colorManager;
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        
        // Default bubble settings
        this.bubbleSize = bubbleSettings.bubbleSize || 1.0;
        this.randomSize = bubbleSettings.randomSize || false;
        this.randomSizeMin = bubbleSettings.randomSizeMin || 0.5;
        this.randomSizeMax = bubbleSettings.randomSizeMax || 2.0;
        this.launchSpread = bubbleSettings.launchSpread || 30;
        this.launchSpreadMode = bubbleSettings.launchSpreadMode || 'range';
        this.riseSpeed = bubbleSettings.riseSpeed || 2.0;
        this.riseSpeedVariation = bubbleSettings.riseSpeedVariation || 0.5;
        
        // Rise speed randomization
        this.randomRiseSpeed = bubbleSettings.randomRiseSpeed || false;
        this.randomRiseSpeedMin = bubbleSettings.randomRiseSpeedMin || 1.0;
        this.randomRiseSpeedMax = bubbleSettings.randomRiseSpeedMax || 4.0;
        
        // Pop height randomization (NEW feature)
        this.autoPopHeight = bubbleSettings.autoPopHeight || 0.2;
        this.randomPopHeight = bubbleSettings.randomPopHeight || false;
        this.randomPopHeightMin = bubbleSettings.randomPopHeightMin || 0.15;
        this.randomPopHeightMax = bubbleSettings.randomPopHeightMax || 0.40;
        
        // Physics settings
        this.wobbleIntensity = bubbleSettings.wobbleIntensity || 1.0;
        this.buoyancy = bubbleSettings.buoyancy || 0.98;
        
        // Bubble-specific settings
        this.bubbleClusterSize = bubbleSettings.bubbleClusterSize || 3; // Number of bubbles per launch
        this.clusterSpread = bubbleSettings.clusterSpread || 20; // Spread of bubble cluster
    }
    
    /**
     * Update factory settings
     * @param {Object} newSettings - New settings to apply
     */
    updateSettings(newSettings) {
        if (newSettings.bubbleSize !== undefined) this.bubbleSize = newSettings.bubbleSize;
        if (newSettings.randomSize !== undefined) this.randomSize = newSettings.randomSize;
        if (newSettings.randomSizeMin !== undefined) this.randomSizeMin = newSettings.randomSizeMin;
        if (newSettings.randomSizeMax !== undefined) this.randomSizeMax = newSettings.randomSizeMax;
        if (newSettings.launchSpread !== undefined) this.launchSpread = newSettings.launchSpread;
        if (newSettings.launchSpreadMode !== undefined) this.launchSpreadMode = newSettings.launchSpreadMode;
        if (newSettings.riseSpeed !== undefined) this.riseSpeed = newSettings.riseSpeed;
        if (newSettings.riseSpeedVariation !== undefined) this.riseSpeedVariation = newSettings.riseSpeedVariation;
        if (newSettings.bubbleClusterSize !== undefined) this.bubbleClusterSize = newSettings.bubbleClusterSize;
        if (newSettings.clusterSpread !== undefined) this.clusterSpread = newSettings.clusterSpread;
        
        // Rise speed randomization
        if (newSettings.randomRiseSpeed !== undefined) this.randomRiseSpeed = newSettings.randomRiseSpeed;
        if (newSettings.randomRiseSpeedMin !== undefined) this.randomRiseSpeedMin = newSettings.randomRiseSpeedMin;
        if (newSettings.randomRiseSpeedMax !== undefined) this.randomRiseSpeedMax = newSettings.randomRiseSpeedMax;
        
        // Pop height randomization (NEW feature)
        if (newSettings.autoPopHeight !== undefined) this.autoPopHeight = newSettings.autoPopHeight;
        if (newSettings.randomPopHeight !== undefined) this.randomPopHeight = newSettings.randomPopHeight;
        if (newSettings.randomPopHeightMin !== undefined) this.randomPopHeightMin = newSettings.randomPopHeightMin;
        if (newSettings.randomPopHeightMax !== undefined) this.randomPopHeightMax = newSettings.randomPopHeightMax;
        
        // Physics settings
        if (newSettings.wobbleIntensity !== undefined) this.wobbleIntensity = newSettings.wobbleIntensity;
        if (newSettings.buoyancy !== undefined) this.buoyancy = newSettings.buoyancy;
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
    
    /**
     * Calculate launch parameters for bubbles
     * @param {number} duration - Duration of the sustained sound
     * @returns {Object} Launch parameters
     */
    calculateLaunchParameters(duration = 250) {
        // Calculate launch position based on spread mode
        let startX;
        const centerX = this.canvasWidth / 2;
        
        switch (this.launchSpreadMode) {
            case 'center':
                startX = centerX;
                break;
            case 'random':
                startX = Math.random() * this.canvasWidth;
                break;
            case 'range':
            default:
                const spreadRange = (this.launchSpread / 100) * this.canvasWidth;
                startX = centerX + (Math.random() - 0.5) * spreadRange;
                break;
        }
        
        // Bubbles start from the bottom of the screen
        const startY = this.canvasHeight + 20; // Start slightly below screen
        
        // Calculate target position (bubbles rise to top)
        const targetX = startX + (Math.random() - 0.5) * 50; // Slight horizontal drift
        const targetY = -50; // Rise above screen
        
        return {
            startX,
            startY,
            targetX,
            targetY
        };
    }
    
    /**
     * Get bubble color and image information
     * @returns {Object} Color and image data
     */
    getBubbleColor() {
        let bubbleColor = null;
        let selectedCustomImageId = null;
        
        // Try to get a color from the image system (same as firework system)
        const imageSystem = (window.animationController && window.animationController.imageSystem) || window.imageSystem;
        
        if (imageSystem && imageSystem.imageManager) {
            try {
                const randomImage = imageSystem.imageManager.getRandomImage();
                
                if (randomImage && randomImage.dominantColor && randomImage.dominantColor.hex) {
                    bubbleColor = randomImage.dominantColor.hex;
                    selectedCustomImageId = randomImage.id;
                    
                    // Validate hex color format
                    if (!/^#[0-9A-F]{6}$/i.test(bubbleColor)) {
                        bubbleColor = this.colorManager.getRandomColor();
                        selectedCustomImageId = null;
                    }
                } else {
                    bubbleColor = this.colorManager.getRandomColor();
                }
            } catch (error) {
                bubbleColor = this.colorManager.getRandomColor();
            }
        } else {
            bubbleColor = this.colorManager.getRandomColor();
        }
        
        return {
            bubbleColor,
            selectedCustomImageId
        };
    }
    
    /**
     * Create a single bubble
     * @param {number} startX - Starting X position
     * @param {number} startY - Starting Y position
     * @param {number} targetX - Target X position
     * @param {number} targetY - Target Y position
     * @param {string} color - Bubble color
     * @returns {Bubble} Created bubble
     */
    createBubble(startX, startY, targetX, targetY, color) {
        // Calculate velocity for bubble rise
        let baseSpeed;
        if (this.randomRiseSpeed) {
            // Use random rise speed within specified range
            baseSpeed = this.randomRiseSpeedMin + Math.random() * (this.randomRiseSpeedMax - this.randomRiseSpeedMin);
        } else {
            // Use base speed with variation
            baseSpeed = this.riseSpeed + (Math.random() - 0.5) * this.riseSpeedVariation;
        }
        
        const velocity = {
            x: (targetX - startX) * 0.001, // Very slow horizontal drift
            y: -baseSpeed // Negative for upward movement
        };
        
        // Determine bubble size
        let size = this.bubbleSize;
        if (this.randomSize) {
            size = this.randomSizeMin + Math.random() * (this.randomSizeMax - this.randomSizeMin);
        }
        
        // Determine auto-pop height (NEW: Random Pop Height feature)
        let autoPopHeight = this.autoPopHeight;
        if (this.randomPopHeight) {
            autoPopHeight = this.randomPopHeightMin + Math.random() * (this.randomPopHeightMax - this.randomPopHeightMin);
        }
        
        // Create the bubble
        const bubble = new Bubble(startX, startY, targetX, targetY, color, velocity, size);
        
        // Set the custom auto-pop height for this bubble
        bubble.autoPopHeight = autoPopHeight;
        
        return bubble;
    }
    
    /**
     * Create a cluster of bubbles
     * @param {number} duration - Duration of the sustained sound
     * @param {string} clusterId - Optional cluster ID to assign to all bubbles
     * @returns {Array<Bubble>} Array of created bubbles
     */
    createBubbleCluster(duration = 250, clusterId = null) {
        const bubbles = [];
        const baseParams = this.calculateLaunchParameters(duration);
        const { bubbleColor, selectedCustomImageId } = this.getBubbleColor();
        
        // Generate cluster ID if not provided
        const finalClusterId = clusterId || `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create multiple bubbles in a cluster
        for (let i = 0; i < this.bubbleClusterSize; i++) {
            // Add some variation to each bubble's position
            const offsetX = (Math.random() - 0.5) * this.clusterSpread;
            const offsetY = Math.random() * 20; // Slight vertical offset
            
            const startX = baseParams.startX + offsetX;
            const startY = baseParams.startY + offsetY;
            const targetX = baseParams.targetX + offsetX;
            const targetY = baseParams.targetY;
            
            const bubble = this.createBubble(startX, startY, targetX, targetY, bubbleColor);
            
            // Set additional properties
            bubble.selectedImageColor = bubbleColor;
            bubble.selectedCustomImageId = selectedCustomImageId;
            bubble.clusterId = finalClusterId; // Assign cluster ID
            
            bubbles.push(bubble);
        }
        
        return bubbles;
    }
    
    /**
     * Create a single bubble (for test purposes)
     * @param {number} duration - Duration of the sustained sound
     * @returns {Bubble} Created bubble
     */
    createSingleBubble(duration = 250) {
        const params = this.calculateLaunchParameters(duration);
        const { bubbleColor, selectedCustomImageId } = this.getBubbleColor();
        
        const bubble = this.createBubble(
            params.startX,
            params.startY,
            params.targetX,
            params.targetY,
            bubbleColor
        );
        
        // Set additional properties
        bubble.selectedImageColor = bubbleColor;
        bubble.selectedCustomImageId = selectedCustomImageId;
        
        return bubble;
    }
}

export default BubbleFactory; 