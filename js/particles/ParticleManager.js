/**
 * Manages particle effects and animations
 * Refactored to use separate Particle and SmokeParticle classes
 */
import Particle from './Particle.js';
import SmokeParticle from './SmokeParticle.js';

class ParticleManager {
  constructor(ctx, colorManager, initialParticleAndEffectSettings = null) {
    this.ctx = ctx;
    this.colorManager = colorManager;
    this.particles = [];
    this.smokeParticles = [];
    
    // Default settings, to be merged with initial settings
    this.settings = {
      particleCount: 120,
      particleLifespan: 1.2,
      fadeResistance: 0.92,
      glowEffect: false,
      // trailLength and shimmerEffect are no longer used but might be in old saved settings
      // They will be deleted by updateSettings if present in initialParticleAndEffectSettings
      useMultiColor: true,
      smokeEnabled: true,
      smokeOpacity: 0.3,
      smokeSize: 25,
      smokeLifespan: 2.5,
      smokeCount: 15,
      smokeSpread: 0.7,
      smokeRiseSpeed: 0.12
    };

    if (initialParticleAndEffectSettings) {
        console.log('[ParticleManager] Initializing with settings:', initialParticleAndEffectSettings);
        this.updateSettings(initialParticleAndEffectSettings); // Use existing updateSettings to apply and map
    } else {
        console.log('[ParticleManager] Initializing with default settings only.');
    }
  }

  /**
   * Create an explosion of particles
   */
  createExplosion(x, y, fireworkColor) {
    const particles = [];
    const explosionTime = Date.now(); // Timestamp for this explosion
    
    // Determine the single color for this explosion if not using multicolor
    // If fireworkColor is provided, use it; otherwise, pick a random one for the whole explosion.
    const singleExplosionColor = fireworkColor || this.colorManager.getRandomColor();
    
    for (let i = 0; i < this.settings.particleCount; i++) {
      const angle = (Math.PI * 2 * i) / this.settings.particleCount;
      const velocity = Math.random() * 2 + 3;
      
      let particleColorToUse;
      if (this.settings.useMultiColor) {
        particleColorToUse = this.colorManager.getRandomColor(); // Each particle gets a new random color
      } else {
        particleColorToUse = singleExplosionColor; // All particles in this explosion use the same color
      }
      
      // Create new particle
      const particle = new Particle(x, y, particleColorToUse, velocity, angle);
      particle.setLifespan(this.settings.particleLifespan); // Apply lifespan from settings
      particle.setExplosionId(explosionTime);
      particles.push(particle);
    }
    
    // Add new particles at the beginning so they render on top (newest first)
    this.particles.unshift(...particles);
    
    // Add smoke effect if enabled
    if (this.settings.smokeEnabled) {
      // Smoke effect should generally match the explosion's dominant color if not multicolor,
      // or a representative color if multicolor (e.g., the first particle's color or a new random one).
      // For simplicity, let's use singleExplosionColor for smoke as well.
      this.createSmokeEffect(x, y, singleExplosionColor);
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
      
      if (this.settings.glowEffect) {
          const fadeProgress = 1 - particle.life;
          // Only apply glow in the first half of the particle's life
          if (fadeProgress < 0.5) {
              const glowIntensity = Math.max(0, 2 - (fadeProgress * 4));
              this.ctx.shadowColor = color;
              this.ctx.shadowBlur = glowIntensity;
          } else {
              this.ctx.shadowBlur = 0;
          }
      } else {
          this.ctx.shadowBlur = 0; // Ensure no glow if effect is disabled
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
    // Map new setting keys to internal settings (these are typically from UI controls)
    if (newSettings.count !== undefined) this.settings.particleCount = newSettings.count;
    if (newSettings.lifespan !== undefined) this.settings.particleLifespan = newSettings.lifespan;
    // minSize and maxSize are not directly in this.settings but used by Particle.js, passed via createExplosion logic
    // For consistency, if they are passed, we can store them if needed elsewhere, or ensure Particle.js gets them.
    // SettingsController maps particleMinSize/particleMaxSize to minSize/maxSize for updateParticleSettings
    // So, newSettings here might have minSize/maxSize.
    if (newSettings.minSize !== undefined) this.settings.minSize = newSettings.minSize; // Add if not present
    if (newSettings.maxSize !== undefined) this.settings.maxSize = newSettings.maxSize; // Add if not present
    
    if (newSettings.useMultiColor !== undefined) this.settings.useMultiColor = newSettings.useMultiColor;
    if (newSettings.glowEnabled !== undefined) this.settings.glowEffect = newSettings.glowEnabled;
    if (newSettings.fadeResistance !== undefined) this.settings.fadeResistance = newSettings.fadeResistance;
    
    // Merge any other settings (like smoke settings if they were part of newSettings)
    // and also ensures the initial defaults for smoke etc. are preserved if not in newSettings.
    this.settings = { ...this.settings, ...newSettings }; 

    // Remove shimmerEffect and trailLength specifically if they were part of newSettings, as they are no longer used.
    // This also cleans them up if they were loaded from old saved settings.
    delete this.settings.shimmerEffect; 
    delete this.settings.trailLength;
    console.log('[ParticleManager] Settings updated to:', this.settings);
  }
}

export default ParticleManager;