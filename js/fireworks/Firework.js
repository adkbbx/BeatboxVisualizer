/**
 * Represents a single firework
 */
class Firework {
    constructor(x, y, targetX, targetY, color, velocity, size) {
        // Handle default parameter manually for better compatibility
        if (size === undefined) size = 1.0;
        
        this.id = Date.now() + Math.random(); // More unique ID
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.color = color;
        this.velocity = velocity;
        this.size = size; // Size multiplier for the firework
        this.exploded = false;
        this.alpha = 1;
        this.isNewest = false;
        this.selectedImageColor = color;
        this.selectedCustomImageId = null;
        this.hasReachedTarget = false;
        this.markedForExplosion = false;
        this.age = 0; // Track how long the firework has existed
        this.maxAge = 1000; // Auto-cleanup after 1000 frames (~16 seconds)
    }
    
    /**
     * Update firework position and state using realistic physics
     * @param {number} gravity - Gravity effect to apply
     * @returns {boolean} - Whether the firework has reached its peak height
     */
    update(gravity) {
        // Age the firework
        this.age++;
        
        // Update position based on velocity
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        
        // Apply gravity to vertical velocity
        this.velocity.y += gravity;
        
        // Check if firework has reached its peak (when vertical velocity becomes positive)
        // This is more realistic than checking distance to a target point
        const hasReachedPeak = this.velocity.y >= 0;
        
        // Optional: Add air resistance for more realism
        this.velocity.x *= 0.999; // Very slight horizontal drag
        
        return hasReachedPeak;
    }
    
    /**
     * Update the firework after explosion
     * @param {number} deltaTime - Time since last update
     * @returns {boolean} - Whether the firework is fully faded
     */
    updateAfterExplosion(deltaTime) {
        // Much faster fade for immediate cleanup (fade in ~25 frames = 0.4 seconds)
        this.alpha -= 0.04; 
        return this.alpha <= 0;
    }
    
    /**
     * Draw the firework
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {ColorManager} colorManager - Color manager instance
     */
    draw(ctx, colorManager) {
        const color = colorManager.getColorWithAlpha(this.color, this.alpha);
        
        ctx.save();
        
        // Add glow
        ctx.shadowColor = color;
        ctx.shadowBlur = 5;
        
        // Draw the main firework body
        ctx.beginPath();
        ctx.arc(this.x, this.y, 2.5 * this.size, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        
        // Calculate trail length
        const trailLength = Math.sqrt(
            this.velocity.x * this.velocity.x + 
            this.velocity.y * this.velocity.y
        ) * 4.0;
        
        // Create gradient trail
        const gradient = ctx.createLinearGradient(
            this.x, this.y,
            this.x - this.velocity.x * trailLength,
            this.y - this.velocity.y * trailLength
        );
        
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        
        // Draw the trail
        ctx.beginPath();
        ctx.lineWidth = 2 * this.size;
        ctx.strokeStyle = gradient;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(
            this.x - this.velocity.x * trailLength,
            this.y - this.velocity.y * trailLength
        );
        ctx.stroke();
        
        ctx.restore();
    }
    
    /**
     * Set a custom image ID for this firework
     * @param {string} imageId - ID of the custom image
     */
    setCustomImageId(imageId) {
        this.selectedCustomImageId = imageId;
    }
    
    /**
     * Check if this firework should be automatically cleaned up
     * @returns {boolean} - Whether firework is too old
     */
    isExpired() {
        return this.age >= this.maxAge;
    }
}

export default Firework;