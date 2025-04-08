/**
 * Represents a single particle in an explosion
 */
class Particle {
    constructor(x, y, color, velocity, angle, size = null) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.velocity = velocity;
        this.angle = angle;
        this.alpha = 1;
        this.size = size || (Math.random() * 3 + 2);
        this.life = 1;
        this.originalColor = color;
        this.creationTime = Date.now();
        this.explosionId = null;
        this.fadeColor = null;
        this.lifespan = 1.2; // Default lifespan in seconds
    }
    
    /**
     * Set custom lifespan for this particle
     * @param {number} seconds - Lifespan in seconds
     */
    setLifespan(seconds) {
        this.lifespan = seconds;
    }
    
    /**
     * Update particle position and properties
     * @param {number} deltaTime - Time since last update
     * @param {number} fadeResistance - How quickly the particle fades (higher = slower fade)
     * @returns {boolean} - Whether the particle is dead
     */
    update(deltaTime, fadeResistance) {
        // Update position
        this.x += Math.cos(this.angle) * this.velocity;
        this.y += Math.sin(this.angle) * this.velocity;
        
        // Apply gravity
        this.velocity *= 0.98;
        
        // Calculate life reduction based on lifespan
        const lifeReduction = (deltaTime / 1000) / this.lifespan;
        
        // Update life with custom lifespan
        this.life -= lifeReduction;
        this.alpha = this.life * fadeResistance;
        
        // Update fade color
        this.updateFadeColor();
        
        // Return true if particle is dead
        return this.life <= 0 || this.alpha < 0.01;
    }
    
    /**
     * Update the fade color based on particle life
     */
    updateFadeColor() {
        // Gradually fade the color to transparent as particles age
        if (this.originalColor && typeof this.originalColor === 'string' && this.originalColor.startsWith('#')) {
            // Calculate how faded the particle is (0 = fresh, 1 = completely faded)
            const fadeProgress = 1 - this.life;
            
            // Extract original RGB components
            const r = parseInt(this.originalColor.slice(1, 3), 16);
            const g = parseInt(this.originalColor.slice(3, 5), 16);
            const b = parseInt(this.originalColor.slice(5, 7), 16);
            
            // Simple, clean fade-out effect - maintain original color but reduce opacity
            // This creates a more natural-looking fade without the awkward white transition
            this.fadeColor = `rgba(${r}, ${g}, ${b}, ${this.alpha})`;
        }
    }
    
    /**
     * Set the explosion ID for this particle
     * @param {number} id - Explosion ID
     */
    setExplosionId(id) {
        this.explosionId = id;
    }
    
    /**
     * Check if particle is dead
     * @returns {boolean} - Whether the particle is dead
     */
    isDead() {
        return this.life <= 0 || this.alpha < 0.01;
    }
}

export default Particle;