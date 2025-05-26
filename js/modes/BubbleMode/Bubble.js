/**
 * Represents a single bubble with floating physics
 */
class Bubble {
    constructor(x, y, targetX, targetY, color, velocity, size) {
        // Handle default parameter manually for better compatibility
        if (size === undefined) size = 1.0;
        
        this.id = Date.now() + Math.random(); // Unique ID
        this.x = x;
        this.y = y;
        this.targetX = targetX;
        this.targetY = targetY;
        this.color = color;
        this.velocity = velocity;
        this.size = size; // Size multiplier for the bubble
        this.exploded = false;
        this.alpha = 0.7; // Bubbles are more translucent than fireworks
        this.isNewest = false;
        this.selectedImageColor = color;
        this.selectedCustomImageId = null;
        this.hasReachedTarget = false;
        this.markedForExplosion = false;
        this.markedForPop = false; // Mark for sequential popping (like fireworks)
        this.age = 0; // Track how long the bubble has existed
        this.maxAge = 1500; // Bubbles live longer than fireworks
        
        // Bubble-specific properties
        this.wobbleOffset = Math.random() * Math.PI * 2; // Random wobble phase
        this.wobbleSpeed = 0.02 + Math.random() * 0.02; // Wobble frequency
        this.wobbleAmplitude = 0.5 + Math.random() * 1.0; // Wobble intensity
        this.buoyancy = 0.98; // Resistance to gravity (bubbles float)
        this.shimmerPhase = Math.random() * Math.PI * 2; // For shimmer effect
        this.baseRadius = 8 + Math.random() * 12; // Base bubble size
        
        // Convergence animation properties
        this.isConverging = false;
        this.convergenceTarget = null;
        this.convergenceStartTime = null;
        this.hasReachedConvergenceTarget = false; // Track if bubble has reached the center
    }
    
    /**
     * Update bubble position and state with floating physics
     * @param {number} gravity - Gravity effect to apply (reduced for bubbles)
     * @returns {boolean} - Whether the bubble has reached its peak height
     */
    update(gravity) {
        // Age the bubble
        this.age++;
        
        // Always apply wobbling motion first
        this.wobbleOffset += this.wobbleSpeed;
        const wobbleX = Math.sin(this.wobbleOffset) * this.wobbleAmplitude;
        const wobbleY = Math.cos(this.wobbleOffset * 0.7) * this.wobbleAmplitude * 0.3;
        
        // Handle convergence animation if active
        if (this.isConverging && this.convergenceTarget) {
            // Calculate distance to target
            const dx = this.convergenceTarget.x - this.x;
            const dy = this.convergenceTarget.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Check if we've reached the target
            if (distance < 8) {
                this.hasReachedConvergenceTarget = true;
                // Slow down near target to avoid overshooting
                this.velocity.x *= 0.9;
                this.velocity.y *= 0.9;
            } else {
                // Calculate required velocity to reach target in remaining time
                const elapsed = Date.now() - this.convergenceStartTime;
                const convergenceDuration = 800; // 0.8 seconds total - much faster!
                const remainingTime = Math.max(convergenceDuration - elapsed, 50); // Minimum 50ms
                
                // Calculate required velocity components (in pixels per millisecond)
                const requiredVelX = dx / remainingTime;
                const requiredVelY = dy / remainingTime;
                
                // Convert to per-frame velocity (assuming 60fps = 16.67ms per frame)
                const frameVelX = requiredVelX * 16.67;
                const frameVelY = requiredVelY * 16.67;
                
                // More aggressive velocity adjustment for faster convergence
                const adjustmentFactor = 0.15; // How quickly to adjust velocity (15% per frame)
                this.velocity.x += (frameVelX - this.velocity.x) * adjustmentFactor;
                this.velocity.y += (frameVelY - this.velocity.y) * adjustmentFactor;
                
                // Maintain some natural wobble during convergence (reduced intensity)
                const wobbleIntensity = Math.max(0.3, 1 - (elapsed / convergenceDuration));
                const wobbleX = Math.sin(this.wobbleOffset) * this.wobbleAmplitude * wobbleIntensity * 0.5;
                this.velocity.x += wobbleX * 0.05;
            }
            
            // Enhanced shimmer effect during convergence
            this.shimmerPhase += 0.12;
            
            // Continue with normal physics application below (velocity will be applied)
        }
        
        // Normal bubble physics when not converging
        if (!this.hasReachedTarget) {
            // Update position with wobble
            this.x += this.velocity.x + wobbleX;
            this.y += this.velocity.y + wobbleY;
            
            // Apply reduced gravity with buoyancy
            this.velocity.y += gravity * (1 - this.buoyancy);
            
            // Add slight upward drift for floating effect
            this.velocity.y -= 0.01;
            
            // Air resistance for bubbles (more than fireworks)
            this.velocity.x *= 0.995;
            this.velocity.y *= 0.998;
        }
        
        // Check if bubble has reached its peak (when vertical velocity becomes positive)
        const hasReachedPeak = this.velocity.y >= 0;
        
        // Update shimmer effect
        this.shimmerPhase += 0.05;
        
        return hasReachedPeak;
    }
    
    /**
     * Update the bubble after popping
     * @param {number} deltaTime - Time since last update
     * @returns {boolean} - Whether the bubble is fully faded
     */
    updateAfterExplosion(deltaTime) {
        // Faster fade for bubble cleanup
        this.alpha -= 0.06; 
        return this.alpha <= 0;
    }
    
    /**
     * Draw the bubble with shimmer and transparency effects
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {ColorManager} colorManager - Color manager instance
     */
    draw(ctx, colorManager) {
        const color = colorManager.getColorWithAlpha(this.color, this.alpha);
        
        ctx.save();
        
        // Calculate bubble radius with size multiplier
        const radius = this.baseRadius * this.size;
        
        // Create radial gradient for bubble effect
        const gradient = ctx.createRadialGradient(
            this.x - radius * 0.3, this.y - radius * 0.3, 0,
            this.x, this.y, radius
        );
        
        // Parse color for gradient
        let r = 100, g = 150, b = 255; // Default blue
        if (this.color && this.color.startsWith('#')) {
            r = parseInt(this.color.slice(1, 3), 16);
            g = parseInt(this.color.slice(3, 5), 16);
            b = parseInt(this.color.slice(5, 7), 16);
        }
        
        // Create bubble gradient with shimmer
        const shimmerIntensity = 0.3 + 0.2 * Math.sin(this.shimmerPhase);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${0.4 * this.alpha})`); // Highlight
        gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${0.2 * this.alpha})`); // Main color
        gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${0.3 * this.alpha})`); // Edge
        gradient.addColorStop(1, `rgba(${Math.min(255, r + 50)}, ${Math.min(255, g + 50)}, ${Math.min(255, b + 50)}, ${0.1 * this.alpha})`); // Outer glow
        
        // Draw main bubble
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        // Add bubble outline
        ctx.beginPath();
        ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.4 * this.alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Add shimmer highlight
        const shimmerX = this.x - radius * 0.4;
        const shimmerY = this.y - radius * 0.4;
        const shimmerRadius = radius * 0.3;
        
        const shimmerGradient = ctx.createRadialGradient(
            shimmerX, shimmerY, 0,
            shimmerX, shimmerY, shimmerRadius
        );
        shimmerGradient.addColorStop(0, `rgba(255, 255, 255, ${shimmerIntensity * this.alpha})`);
        shimmerGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.beginPath();
        ctx.arc(shimmerX, shimmerY, shimmerRadius, 0, Math.PI * 2);
        ctx.fillStyle = shimmerGradient;
        ctx.fill();
        
        // Add small reflection spot
        ctx.beginPath();
        ctx.arc(this.x - radius * 0.2, this.y - radius * 0.2, radius * 0.1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${0.6 * this.alpha})`;
        ctx.fill();
        
        ctx.restore();
    }
    
    /**
     * Set a custom image ID for this bubble
     * @param {string} imageId - ID of the custom image
     */
    setCustomImageId(imageId) {
        this.selectedCustomImageId = imageId;
    }
    
    /**
     * Check if this bubble should be automatically cleaned up
     * @returns {boolean} - Whether bubble is too old
     */
    isExpired() {
        return this.age >= this.maxAge;
    }
    
    /**
     * Get the current wobble position for external calculations
     * @returns {number} - Current wobble X offset
     */
    getWobbleOffset() {
        return Math.sin(this.wobbleOffset) * this.wobbleAmplitude;
    }
}

export default Bubble; 