/**
 * Manages particle effects and animations
 * Refactored to use separate Particle and SmokeParticle classes
 */
import Particle from './Particle.js';
import SmokeParticle from './SmokeParticle.js';

class ParticleManager {
  constructor(ctx, colorManager) {
    this.ctx = ctx;
    this.colorManager = colorManager;
    this.particles = [];
    this.smokeParticles = [];
    this.settings = {
      particleCount: 120,
      particleLifespan: 1.2,
      fadeResistance: 0.92, // Adjusted for a smoother fade
      glowEffect: false, // Disable default glow effect to reduce brightness
      trailLength: 2.5,
      shimmerEffect: true,
      useMultiColor: true,
      // Smoke effect settings
      smokeEnabled: true,
      smokeOpacity: 0.3,          // More subtle opacity
      smokeSize: 25,              // Smaller smoke puffs
      smokeLifespan: 2.5,         // Shorter lifespan
      smokeCount: 15,             // Fewer smoke particles
      smokeSpread: 0.7,           // Less spread
      smokeRiseSpeed: 0.12        // Slightly faster rise
    };
  }

  /**
   * Create an explosion of particles
   */
  createExplosion(x, y, color) {
    const particles = [];
    const baseColor = color || this.colorManager.getRandomColor();
    const explosionTime = Date.now(); // Timestamp for this explosion
    
    // Log color information for debugging
    console.debug('Creating particle explosion:', {
      position: { x, y },
      providedColor: color,
      baseColor,
      useMultiColor: this.settings.useMultiColor && !color, // Only use multicolor if no specific color provided
      particleCount: this.settings.particleCount
    });
    
    for (let i = 0; i < this.settings.particleCount; i++) {
      const angle = (Math.PI * 2 * i) / this.settings.particleCount;
      const velocity = Math.random() * 2 + 3;
      
      // If a color is provided, always use it. Otherwise, use multicolor if enabled
      const particleColor = color || (this.settings.useMultiColor ? 
        this.colorManager.getRandomColor() : baseColor);
      
      // Create new particle
      const particle = new Particle(x, y, particleColor, velocity, angle);
      particle.setExplosionId(explosionTime);
      particles.push(particle);
    }
    
    // Add new particles at the beginning so they render on top (newest first)
    this.particles.unshift(...particles);
    
    // Add smoke effect if enabled
    if (this.settings.smokeEnabled) {
      this.createSmokeEffect(x, y, baseColor);
    }
  }
  
  /**
   * Create a smoke effect at the explosion point
   */
  createSmokeEffect(x, y, color) {
    // Create multiple smoke particles with various directions
    for (let i = 0; i < this.settings.smokeCount; i++) {
      // Add some randomness to the position to make smoke appear more natural
      const offsetX = (Math.random() - 0.5) * 20;
      const offsetY = (Math.random() - 0.5) * 20;
      
      // Create and add smoke particle
      const smokeParticle = new SmokeParticle(
        x + offsetX, 
        y + offsetY, 
        color,
        this.settings.smokeSize
      );
      
      this.smokeParticles.push(smokeParticle);
    }
    
    console.debug('Added smoke effect:', {
      position: { x, y },
      smokeParticles: this.smokeParticles.length
    });
  }

  /**
   * Update all particles
   */
  updateParticles(deltaTime) {
    // Update regular particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Update particle and check if it's dead
      const isDead = particle.update(deltaTime, this.settings.fadeResistance);
      
      // Remove dead particles
      if (isDead) {
        this.particles.splice(i, 1);
      }
    }
    
    // Update smoke particles
    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const smoke = this.smokeParticles[i];
      
      // Update smoke and check if it's dead
      const isDead = smoke.update(deltaTime, this.settings.smokeRiseSpeed);
      
      // Remove dead smoke
      if (isDead) {
        this.smokeParticles.splice(i, 1);
      }
    }
  }

  /**
   * Sort particles to ensure newer ones are drawn on top
   */
  sortParticlesByExplosion() {
    // Sort by explosion ID (timestamp), placing newer ones first
    this.particles.sort((a, b) => {
      return b.creationTime - a.creationTime;
    });
  }

  /**
   * Draw all particles
   */
  drawParticles() {
    // Sort particles before drawing to ensure newest appear on top
    this.sortParticlesByExplosion();
    
    // Draw smoke particles first (behind regular particles)
    this.ctx.save();
    
    // Use standard composite operation for more subtle smoke
    this.ctx.globalCompositeOperation = 'source-over';
    
    // Draw each smoke particle
    this.smokeParticles.forEach(smoke => {
      smoke.draw(this.ctx, this.settings.smokeOpacity);
    });
    
    this.ctx.restore();
    
    // Use a blending mode that helps newer particles stand out
    this.ctx.globalCompositeOperation = 'lighter';
    
    // Draw regular particles with fading colors - in reverse order to ensure newest on top
    this.particles.forEach(particle => {
      // Use the pre-calculated fade color if available, otherwise use the default
      const color = particle.fadeColor || this.colorManager.getColorWithAlpha(particle.color, particle.alpha);
      
      // Subtle glow effect that fades naturally with particle life
      const fadeProgress = 1 - particle.life;
      
      // Only apply glow in the first half of the particle's life
      if (fadeProgress < 0.5) {
        const glowIntensity = Math.max(0, 2 - (fadeProgress * 4));
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = glowIntensity;
      } else {
        this.ctx.shadowBlur = 0;
      }
      
      // More natural alpha scaling that fades out completely
      this.ctx.globalAlpha = Math.min(0.75, particle.alpha);
      
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = color;
      this.ctx.fill();
      
      // Reset shadow for next particle
      this.ctx.shadowBlur = 0;
    });
    
    // Reset composite operation
    this.ctx.globalCompositeOperation = 'source-over';
  }
  
  /**
   * Update settings
   * @param {Object} newSettings - New settings to apply
   */
  updateSettings(newSettings) {
    // Deep merge settings
    this.settings = { ...this.settings, ...newSettings };
  }
}

export default ParticleManager;