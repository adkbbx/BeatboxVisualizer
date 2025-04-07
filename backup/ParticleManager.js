/**
 * Manages particle effects and animations
 */
class ParticleManager {
  constructor(ctx, colorManager) {
    this.ctx = ctx;
    this.colorManager = colorManager;
    this.particles = [];
    this.smokeParticles = []; // Add array for smoke particles
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
      creationTime: Date.now(), // Add timestamp for sorting
    };
  }

  /**
   * Create a new smoke particle
   */
  createSmokeParticle(x, y, color) {
    const velocity = Math.random() * 0.5 + 0.2; // Slower movement for smoke
    const angle = Math.random() * Math.PI * 2; // Random direction
    
    // Use a darker, more transparent version of the original color
    const rgbColor = this.getRGBFromColor(color);
    
    return {
      x,
      y,
      color: rgbColor,
      velocity,
      angle,
      alpha: Math.random() * 0.2 + 0.1, // Start with low opacity
      size: Math.random() * this.settings.smokeSize + 10, // Varying sizes
      maxSize: Math.random() * this.settings.smokeSize * 2 + this.settings.smokeSize, // Target size for growth
      life: 1,
      growFactor: Math.random() * 0.03 + 0.01, // How fast the smoke grows
      fadeSpeed: Math.random() * 0.01 + 0.005, // How fast the smoke fades
      rotation: Math.random() * Math.PI * 2, // Random rotation
      rotationSpeed: (Math.random() - 0.5) * 0.02, // Rotation speed
    };
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
      
      // Create particle with the explosion timestamp
      const particle = this.createParticle(x, y, particleColor, velocity, angle);
      particle.explosionId = explosionTime; // Group particles by explosion
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
      
      this.smokeParticles.push(
        this.createSmokeParticle(x + offsetX, y + offsetY, color)
      );
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
      
      // Update position
      particle.x += Math.cos(particle.angle) * particle.velocity;
      particle.y += Math.sin(particle.angle) * particle.velocity;
      
      // Apply gravity
      particle.velocity *= 0.98;
      
      // Update life with moderate fading speed
      particle.life -= deltaTime * 0.0018; // Balanced fade speed
      particle.alpha = particle.life * this.settings.fadeResistance;
      
      // Gradually fade the color to transparent as particles age
      if (particle.originalColor && typeof particle.originalColor === 'string' && particle.originalColor.startsWith('#')) {
        // Calculate how faded the particle is (0 = fresh, 1 = completely faded)
        const fadeProgress = 1 - particle.life;
        
        // Extract original RGB components
        const r = parseInt(particle.originalColor.slice(1, 3), 16);
        const g = parseInt(particle.originalColor.slice(3, 5), 16);
        const b = parseInt(particle.originalColor.slice(5, 7), 16);
        
        // Simple, clean fade-out effect - maintain original color but reduce opacity
        // This creates a more natural-looking fade without the awkward white transition
        particle.fadeColor = `rgba(${r}, ${g}, ${b}, ${particle.alpha})`;
      }
      
      // Remove dead particles immediately when they reach very low life/alpha values
      // This prevents barely visible particles from lingering
      if (particle.life <= 0 || particle.alpha < 0.01) {
        this.particles.splice(i, 1);
      }
    }
    
    // Update smoke particles
    for (let i = this.smokeParticles.length - 1; i >= 0; i--) {
      const smoke = this.smokeParticles[i];
      
      // Move smoke with a natural rising effect
      smoke.x += Math.cos(smoke.angle) * smoke.velocity + (Math.random() - 0.5) * 0.2; // Add subtle drift
      smoke.y += Math.sin(smoke.angle) * smoke.velocity - this.settings.smokeRiseSpeed; // Upward drift
      
      // Grow and fade the smoke
      smoke.size = Math.min(smoke.maxSize, smoke.size + smoke.growFactor * smoke.maxSize);
      smoke.alpha -= smoke.fadeSpeed;
      smoke.rotation += smoke.rotationSpeed;
      
      // Remove faded smoke more aggressively to prevent lingering trails
      if (smoke.alpha <= 0.01) {
        this.smokeParticles.splice(i, 1);
      }
    }
  }

  /**
   * Draw all particles
   */
  /**
   * Sort particles to ensure newer ones are drawn on top
   */
  sortParticlesByExplosion() {
    // Sort by explosion ID (timestamp), placing newer ones first
    this.particles.sort((a, b) => {
      return b.creationTime - a.creationTime;
    });
  }

  drawParticles() {
    // Sort particles before drawing to ensure newest appear on top
    this.sortParticlesByExplosion();
    
    // Draw smoke particles first (behind regular particles)
    this.ctx.save();
    
    // Use standard composite operation for more subtle smoke
    this.ctx.globalCompositeOperation = 'source-over';
    
    this.smokeParticles.forEach(smoke => {
      // Prepare smoke color with enhanced visibility
      const r = smoke.color.r;
      const g = smoke.color.g;
      const b = smoke.color.b;
      
      // More subtle coloring
      const brightenedR = Math.min(255, r + 15);
      const brightenedG = Math.min(255, g + 15);
      const brightenedB = Math.min(255, b + 15);
      
      const color = `rgba(${brightenedR}, ${brightenedG}, ${brightenedB}, ${smoke.alpha * this.settings.smokeOpacity})`;
      
      // Draw the smoke
      this.ctx.save();
      this.ctx.translate(smoke.x, smoke.y);
      this.ctx.rotate(smoke.rotation);
      
      // Use radial gradient for more realistic but subtle smoke
      const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, smoke.size);
      gradient.addColorStop(0, `rgba(${r+15}, ${g+15}, ${b+15}, ${smoke.alpha * 0.8})`); // Subtler center
      gradient.addColorStop(0.5, color); // Original color in middle
      gradient.addColorStop(0.8, `rgba(${r}, ${g}, ${b}, ${smoke.alpha * 0.2})`); // Faster fade
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
      
      this.ctx.fillStyle = gradient;
      this.ctx.globalAlpha = 1; // We handle transparency in the gradient
      this.ctx.beginPath();
      this.ctx.arc(0, 0, smoke.size, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
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
}

export default ParticleManager; 