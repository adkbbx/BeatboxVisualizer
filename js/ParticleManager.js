/**
 * Manages particle effects and animations
 */
class ParticleManager {
  constructor(ctx, colorManager) {
    this.ctx = ctx;
    this.colorManager = colorManager;
    this.particles = [];
    this.settings = {
      particleCount: 120,
      particleLifespan: 1.2,
      fadeResistance: 0.95,
      glowEffect: true,
      trailLength: 2.5,
      shimmerEffect: true,
      useMultiColor: true,
    };
  }

  /**
   * Create a new particle
   */
  createParticle(x, y, color, velocity, angle) {
    return {
      x,
      y,
      color,
      velocity,
      angle,
      alpha: 1,
      size: Math.random() * 3 + 2,
      life: 1,
      originalColor: color,
    };
  }

  /**
   * Create an explosion of particles
   */
  createExplosion(x, y, color) {
    const particles = [];
    const baseColor = color || this.colorManager.getRandomColor();
    
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
      
      particles.push(this.createParticle(x, y, particleColor, velocity, angle));
    }
    
    this.particles.push(...particles);
  }

  /**
   * Update all particles
   */
  updateParticles(deltaTime) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      // Update position
      particle.x += Math.cos(particle.angle) * particle.velocity;
      particle.y += Math.sin(particle.angle) * particle.velocity;
      
      // Apply gravity
      particle.velocity *= 0.98;
      
      // Update life and alpha
      particle.life -= deltaTime * 0.001;
      particle.alpha = particle.life * this.settings.fadeResistance;
      
      // Remove dead particles
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  /**
   * Draw all particles
   */
  drawParticles() {
    this.particles.forEach(particle => {
      const color = this.colorManager.getColorWithAlpha(particle.color, particle.alpha);
      
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = color;
      this.ctx.fill();
      
      if (this.settings.glowEffect) {
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 10;
      }
    });
  }
}

export default ParticleManager; 