/**
 * Lightweight smoke trail effects for fireworks
 */
class SmokeTrailEffect {
    constructor(ctx) {
        this.ctx = ctx;
        
        // Simplified smoke trail settings for better performance
        this.settings = {
            enabled: true,
            frequency: 0.6,              // Reduced frequency
            minSize: 1.5,
            maxSize: 4,
            opacity: 0.25,
            fadeSpeed: 0.03,
            colorDarkening: 0.6,
            brightening: 10
        };
    }

    /**
     * Create simple smoke trail behind a firework
     */
    createSmokeTrail(firework) {
        // Use intensity to control frequency and opacity
        const adjustedFrequency = this.settings.frequency * this.settings.opacity;
        
        if (!this.settings.enabled || this.settings.opacity <= 0 || Math.random() > adjustedFrequency) return;
        
        // Simple trail calculation
        const trailLength = 2 + Math.random() * 3;
        const trailX = firework.x - firework.velocity.x * trailLength;
        const trailY = firework.y - firework.velocity.y * trailLength;
        
        // Add minimal randomness
        const offsetX = (Math.random() - 0.5) * 3;
        const offsetY = (Math.random() - 0.5) * 3;
        
        // Simple color parsing
        let r = 100, g = 95, b = 90;
        if (firework.color.startsWith('#')) {
            r = parseInt(firework.color.slice(1, 3), 16);
            g = parseInt(firework.color.slice(3, 5), 16);
            b = parseInt(firework.color.slice(5, 7), 16);
        }
        
        // Apply simple color adjustment
        r = Math.min(255, Math.floor(r * this.settings.colorDarkening) + this.settings.brightening);
        g = Math.min(255, Math.floor(g * this.settings.colorDarkening) + this.settings.brightening);
        b = Math.min(255, Math.floor(b * this.settings.colorDarkening) + this.settings.brightening + 5);
        
        // Scale size based on intensity
        const baseRadius = this.settings.minSize + Math.random() * (this.settings.maxSize - this.settings.minSize);
        const radius = baseRadius * (0.5 + this.settings.opacity * 0.5); // Scale from 50% to 100% based on intensity
        
        // Simple gradient with intensity-adjusted opacity
        const gradient = this.ctx.createRadialGradient(
            trailX + offsetX, trailY + offsetY, 0,
            trailX + offsetX, trailY + offsetY, radius
        );
        
        const finalOpacity = this.settings.opacity * 0.8; // Use intensity directly for opacity
        gradient.addColorStop(0, `rgba(${r + 10}, ${g + 5}, ${b}, ${finalOpacity})`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${finalOpacity * 0.6})`);
        gradient.addColorStop(1, `rgba(${r - 10}, ${g - 10}, ${b - 10}, 0)`);
        
        // Draw simple smoke particle
        this.ctx.save();
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(trailX + offsetX, trailY + offsetY, radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }
    
    /**
     * Update smoke trail settings
     */
    updateSettings(settings) {
        Object.assign(this.settings, settings);
    }
    
    /**
     * Update only the opacity setting
     */
    updateOpacity(opacity) {
        this.settings.opacity = opacity;
    }
}

export default SmokeTrailEffect;