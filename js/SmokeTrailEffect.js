/**
 * Handles smoke trail effects for fireworks
 */
class SmokeTrailEffect {
    constructor(ctx) {
        this.ctx = ctx;
        
        // Smoke trail settings
        this.settings = {
            enabled: true,          // Enable/disable smoke trail
            frequency: 0.5,         // Moderate smoke generation frequency (0-1)
            minSize: 1.5,           // Smaller minimum smoke particle size
            maxSize: 4,             // Smaller maximum smoke particle size
            opacity: 0.25,          // Lower base opacity for smoke
            fadeSpeed: 0.04,        // Faster fading for subtlety
            colorDarkening: 0.6,    // Slightly darker smoke
            brightening: 10         // Minimal color brightening
        };
    }

    /**
     * Create a smoke trail behind a firework
     */
    createSmokeTrail(firework) {
        // Skip if smoke trails are disabled or outside frequency range
        if (!this.settings.enabled || Math.random() > this.settings.frequency) return;
        
        // Calculate trail position
        const trailLength = 2 + Math.random() * 3;
        const trailX = firework.x - firework.velocity.x * trailLength;
        const trailY = firework.y - firework.velocity.y * trailLength;
        
        // Add natural randomness based on velocity
        const speedFactor = Math.sqrt(
            firework.velocity.x * firework.velocity.x + 
            firework.velocity.y * firework.velocity.y
        ) / 3;
        const offsetX = (Math.random() - 0.5) * 2 * speedFactor;
        const offsetY = (Math.random() - 0.5) * 2 * speedFactor;
        
        // Parse firework color
        let r = 0, g = 0, b = 0;
        if (firework.color.startsWith('#')) {
            r = parseInt(firework.color.slice(1, 3), 16);
            g = parseInt(firework.color.slice(3, 5), 16);
            b = parseInt(firework.color.slice(5, 7), 16);
        } else {
            r = g = b = 150; // Default gray
        }
        
        // Adjust smoke color
        r = Math.min(255, Math.floor(r * this.settings.colorDarkening) + this.settings.brightening);
        g = Math.min(255, Math.floor(g * this.settings.colorDarkening) + this.settings.brightening);
        b = Math.min(255, Math.floor(b * this.settings.colorDarkening) + this.settings.brightening + 20);
        
        // Set opacity and calculate size
        const smokeOpacity = this.settings.opacity * (0.8 + Math.random() * 0.2);
        const smokeColor = `rgba(${r}, ${g}, ${b}, ${smokeOpacity})`;
        const radius = this.settings.minSize + 
            Math.random() * (this.settings.maxSize - this.settings.minSize);
        
        // Create radial gradient
        const gradient = this.ctx.createRadialGradient(
            trailX + offsetX, trailY + offsetY, 0,
            trailX + offsetX, trailY + offsetY, radius
        );
        
        // Set gradient stops
        gradient.addColorStop(0, `rgba(${Math.min(255, r+10)}, ${Math.min(255, g+10)}, ${Math.min(255, b+10)}, ${smokeOpacity * 0.9})`);
        gradient.addColorStop(0.3, smokeColor);
        gradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${smokeOpacity * 0.4})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
        
        // Draw smoke particle
        this.ctx.beginPath();
        this.ctx.fillStyle = gradient;
        this.ctx.arc(trailX + offsetX, trailY + offsetY, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    /**
     * Update smoke trail settings
     */
    updateSettings(settings) {
        Object.assign(this.settings, settings);
    }
}

export default SmokeTrailEffect;