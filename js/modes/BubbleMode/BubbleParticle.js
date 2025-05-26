import Particle from '../FireworkMode/Particle.js';

/**
 * Represents a water droplet particle created when a bubble pops
 * Extends the base Particle class with bubble-specific behavior
 */
class BubbleParticle extends Particle {
    constructor(x, y, color, velocity, angle, size = null) {
        super(x, y, color, velocity, angle, size);
        
        // Bubble particle specific properties
        this.isDroplet = true;
        this.gravity = 0.08; // Stronger gravity for water droplets
        this.bounce = 0.3; // Bounce factor when hitting ground
        this.hasHitGround = false;
        this.splashRadius = 0;
        this.maxSplashRadius = this.size * 2;
        this.dropletShape = Math.random() > 0.5 ? 'round' : 'teardrop';
        
        // Reduce initial velocity for more realistic droplet behavior
        this.velocity *= 0.7;
        
        // Shorter lifespan for droplets
        this.setLifespan(0.8);
        
        // Make droplets more translucent
        this.alpha = 0.8;
    }
    
    /**
     * Update bubble particle with water droplet physics
     * @param {number} deltaTime - Time since last update
     * @param {number} fadeResistance - How quickly the particle fades
     * @returns {boolean} - Whether the particle is dead
     */
    update(deltaTime, fadeResistance) {
        // Update position
        this.x += Math.cos(this.angle) * this.velocity;
        this.y += Math.sin(this.angle) * this.velocity;
        
        // Apply stronger gravity for droplets
        this.velocity *= 0.96; // Air resistance
        
        // Add gravity effect to angle (droplets fall down)
        const gravityEffect = this.gravity * (deltaTime / 16); // Normalize for frame rate
        this.angle += gravityEffect * 0.1; // Slight curve in trajectory
        
        // Direct downward gravity
        this.y += gravityEffect * 3;
        
        // Check for ground collision (bottom of canvas)
        const canvas = document.getElementById('animationCanvas');
        if (canvas && this.y >= canvas.height - 10 && !this.hasHitGround) {
            this.handleGroundCollision();
        }
        
        // Update splash effect if droplet has hit ground
        if (this.hasHitGround) {
            this.updateSplash();
        }
        
        // Calculate life reduction based on lifespan
        const lifeReduction = (deltaTime / 1000) / this.lifespan;
        
        // Update life with custom lifespan
        this.life -= lifeReduction;
        this.alpha = this.life * fadeResistance * 0.8; // More transparent than regular particles
        
        // Update fade color
        this.updateFadeColor();
        
        // Return true if particle is dead
        return this.life <= 0 || this.alpha < 0.01;
    }
    
    /**
     * Handle collision with ground
     */
    handleGroundCollision() {
        this.hasHitGround = true;
        this.velocity *= this.bounce; // Reduce velocity on bounce
        this.splashRadius = 1; // Start splash effect
        
        // Slight random spread on ground impact
        this.x += (Math.random() - 0.5) * 10;
    }
    
    /**
     * Update splash effect animation
     */
    updateSplash() {
        if (this.splashRadius < this.maxSplashRadius) {
            this.splashRadius += 0.5;
        }
    }
    
    /**
     * Draw the bubble particle as a water droplet
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     */
    draw(ctx) {
        if (this.alpha <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.alpha;
        
        // Use fade color if available, otherwise use original color
        const drawColor = this.fadeColor || this.color;
        
        if (this.hasHitGround && this.splashRadius > 0) {
            // Draw splash effect
            this.drawSplash(ctx, drawColor);
        } else {
            // Draw droplet
            this.drawDroplet(ctx, drawColor);
        }
        
        ctx.restore();
    }
    
    /**
     * Draw the water droplet
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} color - Color to draw with
     */
    drawDroplet(ctx, color) {
        ctx.fillStyle = color;
        
        if (this.dropletShape === 'teardrop') {
            // Draw teardrop shape
            ctx.beginPath();
            ctx.arc(this.x, this.y + this.size * 0.3, this.size * 0.7, 0, Math.PI * 2);
            ctx.fill();
            
            // Add teardrop tail
            ctx.beginPath();
            ctx.moveTo(this.x, this.y - this.size);
            ctx.quadraticCurveTo(this.x - this.size * 0.3, this.y, this.x, this.y + this.size * 0.3);
            ctx.quadraticCurveTo(this.x + this.size * 0.3, this.y, this.x, this.y - this.size);
            ctx.fill();
        } else {
            // Draw round droplet
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Add highlight
            ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha * 0.5})`;
            ctx.beginPath();
            ctx.arc(this.x - this.size * 0.3, this.y - this.size * 0.3, this.size * 0.3, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    /**
     * Draw splash effect when droplet hits ground
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {string} color - Color to draw with
     */
    drawSplash(ctx, color) {
        // Draw expanding circle for splash
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.splashRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw small droplets around splash
        const dropletCount = 6;
        for (let i = 0; i < dropletCount; i++) {
            const angle = (i / dropletCount) * Math.PI * 2;
            const dropletX = this.x + Math.cos(angle) * this.splashRadius * 0.8;
            const dropletY = this.y + Math.sin(angle) * this.splashRadius * 0.8;
            
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(dropletX, dropletY, 1, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    /**
     * Create multiple bubble particles for a bubble pop effect
     * @param {number} x - X position of bubble pop
     * @param {number} y - Y position of bubble pop
     * @param {string} color - Color of the bubble
     * @param {number} size - Size of the original bubble
     * @returns {Array<BubbleParticle>} - Array of bubble particles
     */
    static createBubblePopEffect(x, y, color, size = 1.0) {
        const particles = [];
        const particleCount = 8 + Math.floor(Math.random() * 6); // 8-13 droplets
        
        for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
            const velocity = 2 + Math.random() * 3; // Random velocity
            const particleSize = (1 + Math.random() * 2) * size;
            
            const particle = new BubbleParticle(x, y, color, velocity, angle, particleSize);
            particles.push(particle);
        }
        
        return particles;
    }
}

export default BubbleParticle; 