/**
 * Represents a single firework
 */
class Firework {
    constructor(x, y, targetX, targetY, color, velocity) {
        this.id = Date.now();
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.color = color;
        this.velocity = velocity;
        this.exploded = false;
        this.alpha = 1;
        this.isNewest = false;
        this.selectedImageColor = color;
        this.selectedCustomImageId = null;
    }
    
    /**
     * Update firework position and state
     * @param {number} gravity - Gravity effect to apply
     * @returns {boolean} - Whether the firework has reached its target
     */
    update(gravity) {
        // Update position
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.velocity.y += gravity;
        
        // Check if firework reached target
        const distanceToTarget = Math.hypot(
            this.targetX - this.x,
            this.targetY - this.y
        );
        
        // Return true if reached target
        return distanceToTarget < 5;
    }
    
    /**
     * Update the firework after explosion
     * @param {number} deltaTime - Time since last update
     * @returns {boolean} - Whether the firework is fully faded
     */
    updateAfterExplosion(deltaTime) {
        this.alpha -= deltaTime * 0.003;
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
        ctx.arc(this.x, this.y, 2.5, 0, Math.PI * 2);
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
        ctx.lineWidth = 2;
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
}

export default Firework;