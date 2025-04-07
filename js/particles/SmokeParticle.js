/**
 * Represents a smoke particle
 */
class SmokeParticle {
    constructor(x, y, color, smokeSize) {
        this.x = x;
        this.y = y;
        this.color = this.getRGBFromColor(color);
        this.velocity = Math.random() * 0.5 + 0.2; // Slower movement for smoke
        this.angle = Math.random() * Math.PI * 2; // Random direction
        this.alpha = Math.random() * 0.2 + 0.1; // Start with low opacity
        this.size = Math.random() * smokeSize + 10; // Varying sizes
        this.maxSize = Math.random() * smokeSize * 2 + smokeSize; // Target size for growth
        this.growFactor = Math.random() * 0.03 + 0.01; // How fast the smoke grows
        this.fadeSpeed = Math.random() * 0.01 + 0.005; // How fast the smoke fades
        this.rotation = Math.random() * Math.PI * 2; // Random rotation
        this.rotationSpeed = (Math.random() - 0.5) * 0.02; // Rotation speed
    }
    
    /**
     * Extract RGB values from a color string
     */
    getRGBFromColor(color) {
        // If it's a hex color, convert to RGB
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            // Return a slightly darker smoke color (reduce brightness by 20%)
            return {
                r: Math.floor(r * 0.8),
                g: Math.floor(g * 0.8),
                b: Math.floor(b * 0.8),
            };
        }
        
        // If it's already RGB or another format, return as is
        return color;
    }
    
    /**
     * Update smoke particle
     * @param {number} deltaTime - Time since last update
     * @param {number} smokeRiseSpeed - How fast smoke rises
     * @returns {boolean} - Whether particle is dead
     */
    update(deltaTime, smokeRiseSpeed) {
        // Move smoke with a natural rising effect
        this.x += Math.cos(this.angle) * this.velocity + (Math.random() - 0.5) * 0.2; // Add subtle drift
        this.y += Math.sin(this.angle) * this.velocity - smokeRiseSpeed; // Upward drift
        
        // Grow and fade the smoke
        this.size = Math.min(this.maxSize, this.size + this.growFactor * this.maxSize);
        this.alpha -= this.fadeSpeed;
        this.rotation += this.rotationSpeed;
        
        // Return true if particle is dead
        return this.alpha <= 0.01;
    }
    
    /**
     * Draw smoke particle
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} smokeOpacity - Overall smoke opacity
     */
    draw(ctx, smokeOpacity) {
        const r = this.color.r;
        const g = this.color.g;
        const b = this.color.b;
        
        // More subtle coloring
        const brightenedR = Math.min(255, r + 15);
        const brightenedG = Math.min(255, g + 15);
        const brightenedB = Math.min(255, b + 15);
        
        const color = `rgba(${brightenedR}, ${brightenedG}, ${brightenedB}, ${this.alpha * smokeOpacity})`;
        
        // Draw the smoke
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Use radial gradient for more realistic but subtle smoke
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, `rgba(${r+15}, ${g+15}, ${b+15}, ${this.alpha * 0.8})`); // Subtler center
        gradient.addColorStop(0.5, color); // Original color in middle
        gradient.addColorStop(0.8, `rgba(${r}, ${g}, ${b}, ${this.alpha * 0.2})`); // Faster fade
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 1; // We handle transparency in the gradient
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
    
    /**
     * Check if smoke particle is dead
     * @returns {boolean} - Whether particle is dead
     */
    isDead() {
        return this.alpha <= 0.01;
    }
}

export default SmokeParticle;