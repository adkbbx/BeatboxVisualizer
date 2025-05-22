/**
 * Simplified smoke particle for better performance
 */
class SmokeParticle {
    constructor(x, y, color, smokeSize, initialVelocity = { x: 0, y: 0 }) {
        this.x = x;
        this.y = y;
        
        // Simplified physics properties
        this.velocity = {
            x: initialVelocity.x + (Math.random() - 0.5) * 0.5,
            y: initialVelocity.y + (Math.random() - 0.5) * 0.5
        };
        
        this.buoyancy = 0.02 + Math.random() * 0.01;
        this.drag = 0.98;
        
        // Visual properties
        this.color = this.getRGBFromColor(color);
        this.size = Math.random() * smokeSize * 0.4 + smokeSize * 0.2;
        this.maxSize = smokeSize * (1 + Math.random());
        
        // Simplified lifecycle
        this.alpha = 0.3 + Math.random() * 0.3;
        this.maxAlpha = this.alpha;
        this.age = 0;
        this.maxAge = 60 + Math.random() * 60; // Shorter life for performance
        
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
    }
    
    /**
     * Simplified color extraction
     */
    getRGBFromColor(color) {
        if (color.startsWith('#')) {
            const r = parseInt(color.slice(1, 3), 16);
            const g = parseInt(color.slice(3, 5), 16);
            const b = parseInt(color.slice(5, 7), 16);
            
            return {
                r: Math.floor(r * 0.6 + 40),
                g: Math.floor(g * 0.6 + 35),
                b: Math.floor(b * 0.6 + 30)
            };
        }
        
        return { r: 100, g: 100, b: 100 };
    }
    
    /**
     * Simplified update with basic physics
     */
    update(deltaTime, smokeRiseSpeed) {
        this.age++;
        const ageRatio = this.age / this.maxAge;
        
        // Simple physics
        this.velocity.y -= this.buoyancy;
        this.velocity.x *= this.drag;
        this.velocity.y *= this.drag;
        this.velocity.y -= smokeRiseSpeed;
        
        // Minimal turbulence
        this.velocity.x += (Math.random() - 0.5) * 0.05;
        this.velocity.y += (Math.random() - 0.5) * 0.05;
        
        // Update position
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        
        // Simple visual updates
        this.size = Math.min(this.maxSize, this.size * 1.01);
        this.alpha = this.maxAlpha * (1 - ageRatio);
        this.rotation += this.rotationSpeed;
        
        return this.age >= this.maxAge || this.alpha <= 0.01;
    }
    
    /**
     * Simplified drawing
     */
    draw(ctx, smokeOpacity) {
        if (this.alpha <= 0) return;
        
        const { r, g, b } = this.color;
        const finalOpacity = this.alpha * smokeOpacity;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        // Simple gradient
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size);
        gradient.addColorStop(0, `rgba(${r + 15}, ${g + 10}, ${b + 5}, ${finalOpacity * 0.8})`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${finalOpacity * 0.5})`);
        gradient.addColorStop(1, `rgba(${r - 10}, ${g - 10}, ${b - 10}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
    
    /**
     * Check if particle is dead
     */
    isDead() {
        return this.age >= this.maxAge || this.alpha <= 0.01;
    }
}

export default SmokeParticle;