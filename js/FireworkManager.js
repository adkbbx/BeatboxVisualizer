/**
 * Manages firework effects and animations
 */
class FireworkManager {
  constructor(ctx, colorManager, particleManager) {
    this.ctx = ctx;
    this.colorManager = colorManager;
    this.particleManager = particleManager;
    this.fireworks = [];
    this.launchingFirework = false;
    this.gravity = 0.02;
    
    // Add smoke trail settings
    this.smokeTrailSettings = {
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
   * Create a new firework
   */
  createFirework(startX, startY, targetX, targetY, color) {
    // Calculate angle between start and target
    const angle = Math.atan2(targetY - startY, targetX - startX);
    
    // Limit the angle to be more vertical (between -45 and 45 degrees for straighter paths)
    const maxAngle = Math.PI / 2; // reduced from
    const clampedAngle = Math.max(-maxAngle, Math.min(maxAngle, angle));
    
    // Calculate distance to target
    const distance = Math.hypot(targetX - startX, targetY - startY);
    
    // Increase base velocity and adjust scaling for higher launches
    const baseVelocity = 3; 
    const velocity = baseVelocity * Math.sqrt(distance / 300); // Use square root for better scaling
    
    return {
      id: Date.now(),
      x: startX,
      y: startY,
      targetX,
      targetY,
      color: color || this.colorManager.getRandomColor(),
      velocity: {
        x: Math.cos(clampedAngle) * velocity,
        y: Math.sin(clampedAngle) * velocity
      },
      exploded: false,
      alpha: 1
    };
  }

  /**
   * Launch a new firework
   * @param {number} duration - Duration of the sustained sound in milliseconds
   */
  launchFirework(duration = 250) {
    if (this.launchingFirework) return;
    
    this.launchingFirework = true;
    
    // Calculate target height based on duration
    // Use more extreme height values
    const minHeight = this.ctx.canvas.height * 0.2; // Lower starting point
    const maxHeight = this.ctx.canvas.height * 0.05; // Target closer to top (5% from top)
    const heightRange = minHeight - maxHeight; // Note: minHeight is now larger than maxHeight
    
    // Normalize duration to a value between 0 and 1
    // Reduce max duration for faster height scaling
    const normalizedDuration = Math.min(duration / 1500, 1);
    
    // Calculate target height based on normalized duration
    const targetY = minHeight - (heightRange * normalizedDuration);
    
    // Randomize start and target X positions
    // Keep more centered for straighter paths
    const centerX = this.ctx.canvas.width / 2;
    const spread = this.ctx.canvas.width * 0.2; // Reduced spread to 20%
    const startX = centerX + (Math.random() - 0.5) * spread;
    const targetX = centerX + (Math.random() - 0.5) * spread;
    const startY = this.ctx.canvas.height;
    
    // Clean up old exploded fireworks
    this.cleanupOldFireworks();
    
    // Create and add the new firework
    const firework = this.createFirework(startX, startY, targetX, targetY);
    firework.isNewest = true; // Flag this as the newest firework
    
    // Remove the newest flag from all other fireworks
    this.fireworks.forEach(f => f.isNewest = false);
    
    // Add to end of array so it's drawn last
    this.fireworks.push(firework);
    
    // Log the current array size
    console.log(`Launched new firework. Total fireworks: ${this.fireworks.length}`);
    
    setTimeout(() => {
      this.launchingFirework = false;
    }, 100);
  }
  
  /**
   * Clean up old exploded fireworks to prevent array growth
   */
  cleanupOldFireworks() {
    // Keep a maximum number of fireworks to prevent performance issues
    const maxFireworks = 20;
    
    if (this.fireworks.length > maxFireworks) {
      // First remove any fully faded exploded fireworks
      const fadedCount = this.fireworks.filter(f => f.exploded && f.alpha <= 0.1).length;
      
      if (fadedCount > 0) {
        // Remove fully faded fireworks
        this.fireworks = this.fireworks.filter(f => !(f.exploded && f.alpha <= 0.1));
      } else if (this.fireworks.length > maxFireworks) {
        // If we still have too many, remove oldest exploded ones first
        const explodedFireworks = this.fireworks.filter(f => f.exploded);
        
        if (explodedFireworks.length > 0) {
          // Sort exploded fireworks by id (oldest first)
          explodedFireworks.sort((a, b) => a.id - b.id);
          
          // Get ID of oldest one to remove
          const oldestId = explodedFireworks[0].id;
          
          // Remove it
          this.fireworks = this.fireworks.filter(f => f.id !== oldestId);
        }
      }
    }
  }

  /**
   * Update all fireworks
   */
  updateFireworks(deltaTime) {
    for (let i = this.fireworks.length - 1; i >= 0; i--) {
      const firework = this.fireworks[i];
      
      if (!firework.exploded) {
        // Update position
        firework.x += firework.velocity.x;
        firework.y += firework.velocity.y;
        firework.velocity.y += this.gravity;
        
        // Check if firework reached target
        const distanceToTarget = Math.hypot(
          firework.targetX - firework.x,
          firework.targetY - firework.y
        );
        
        // Only explode when reaching target
        if (distanceToTarget < 5) {
          this.explodeFirework(firework);
          firework.exploded = true;
        }
      } else {
        // Fade out exploded fireworks faster
        firework.alpha -= deltaTime * 0.003; // 3x faster fading
        if (firework.alpha <= 0) {
          this.fireworks.splice(i, 1);
        }
      }
    }
  }

  /**
   * Explode a firework
   */
  explodeFirework(firework) {
    // Get flower system reference when needed
    const flowerSystem = window.flowerSystem;
    // Initialize with the firework's color, but we'll prefer the flower's color
    let explosionColor = firework.color;
    
    if (flowerSystem) {
      console.log('Spawning flowers at firework explosion:', {
        position: { x: firework.x, y: firework.y },
        initialColor: explosionColor
      });
      
      // Pass the firework's color but let the flower system return its dominant color
      // This is important: we're getting back the color from the flower
      const flowerColor = flowerSystem.handleFireworkExplosion(firework.x, firework.y, explosionColor, false);
      
      if (flowerColor) {
        // Use the flower's color for the explosion instead of the firework's color
        explosionColor = flowerColor;
        console.log(`Updated explosion color to match flower: ${explosionColor}`);
      }
    } else {
      console.warn('Flower system not available for firework explosion');
    }
    
    // Create the explosion with the (potentially updated) color
    console.debug('Creating firework explosion:', {
      position: { x: firework.x, y: firework.y },
      finalColor: explosionColor
    });
    
    this.particleManager.createExplosion(firework.x, firework.y, explosionColor);
  }

  /**
   * Sort fireworks by creation time (newest first)
   */
  sortFireworksByAge() {
    // Sort fireworks so newest ones appear on top
    this.fireworks.sort((a, b) => {
      // If one is exploded and the other isn't, put non-exploded on top
      if (a.exploded !== b.exploded) {
        return a.exploded ? 1 : -1;
      }
      // Otherwise sort by id (which is a timestamp), newest first
      return b.id - a.id;
    });
  }

  /**
   * Draw all fireworks, starting from the end of the array to draw newest last (on top)
   */
  drawFireworks() {
    // Force drawing from the end of the array to the beginning
    // This ensures newest fireworks (added last) are drawn on top
    for (let i = this.fireworks.length - 1; i >= 0; i--) {
      const firework = this.fireworks[i];
      
      if (!firework.exploded) {
        // Set a higher z-index for newest fireworks with compositeOperation
        if (i > this.fireworks.length - 4) {
          // Use a blend mode that ensures visibility for newest fireworks
          this.ctx.globalCompositeOperation = 'lighter';
        } else {
          this.ctx.globalCompositeOperation = 'source-over';
        }
        
        const color = this.colorManager.getColorWithAlpha(firework.color, firework.alpha);
        
        // Draw a proper streak/trail for the firework instead of just a ball
        this.ctx.save();
        
        // Add glow for better visibility
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 5;
        
        // Draw the main firework body
        this.ctx.beginPath();
        this.ctx.arc(firework.x, firework.y, 2.5, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        
        // Draw a more pronounced manual trail for rising fireworks
        const trailLength = Math.sqrt(
          firework.velocity.x * firework.velocity.x + 
          firework.velocity.y * firework.velocity.y
        ) * 4.0; // Longer trail for better visibility
        
        // Start with bright color
        const gradient = this.ctx.createLinearGradient(
          firework.x, firework.y,
          firework.x - firework.velocity.x * trailLength,
          firework.y - firework.velocity.y * trailLength
        );
        
        // Create a gradient that fades out
        gradient.addColorStop(0, color); // Full color at the firework position
        gradient.addColorStop(1, 'rgba(0,0,0,0)'); // Transparent at the trail end
        
        this.ctx.beginPath();
        this.ctx.lineWidth = 2;
        this.ctx.strokeStyle = gradient;
        this.ctx.moveTo(firework.x, firework.y);
        this.ctx.lineTo(
          firework.x - firework.velocity.x * trailLength,
          firework.y - firework.velocity.y * trailLength
        );
        this.ctx.stroke();
        
        this.ctx.restore();
        
        // Add smoke trail effect
        this.createSmokeTrail(firework);
      }
    }
    
    // Reset composite operation
    this.ctx.globalCompositeOperation = 'source-over';
  }
  
  /**
   * Create a smoke trail behind a firework
   */
  createSmokeTrail(firework) {
    // Skip if smoke trails are disabled
    if (!this.smokeTrailSettings.enabled) return;
    
    // Only create smoke based on frequency setting
    if (Math.random() > this.smokeTrailSettings.frequency) return;
    
    // Calculate position behind the firework
    const trailLength = 2 + Math.random() * 3;
    const trailX = firework.x - firework.velocity.x * trailLength;
    const trailY = firework.y - firework.velocity.y * trailLength;
    
    // Add randomness to position (based on velocity for more natural effect)
    const speedFactor = Math.sqrt(
      firework.velocity.x * firework.velocity.x + 
      firework.velocity.y * firework.velocity.y
    ) / 3;
    const offsetX = (Math.random() - 0.5) * 2 * speedFactor;
    const offsetY = (Math.random() - 0.5) * 2 * speedFactor;
    
    // Get a slightly darker shade of the firework color
    let r = 0, g = 0, b = 0;
    if (firework.color.startsWith('#')) {
      r = parseInt(firework.color.slice(1, 3), 16);
      g = parseInt(firework.color.slice(3, 5), 16);
      b = parseInt(firework.color.slice(5, 7), 16);
    } else {
      // Default color if we can't parse
      r = 150;
      g = 150;
      b = 150;
    }
    
    // Make the smoke darker than the firework based on settings
    r = Math.floor(r * this.smokeTrailSettings.colorDarkening);
    g = Math.floor(g * this.smokeTrailSettings.colorDarkening);
    b = Math.floor(b * this.smokeTrailSettings.colorDarkening);
    
    // Add slight blueish/grayish tint to the smoke
    b = Math.min(255, b + 20);
    
    // Brighten the colors slightly to make smoke more visible
    r = Math.min(255, r + this.smokeTrailSettings.brightening);
    g = Math.min(255, g + this.smokeTrailSettings.brightening);
    b = Math.min(255, b + this.smokeTrailSettings.brightening);
    
    // Set the smoke color with higher opacity
    const smokeOpacity = this.smokeTrailSettings.opacity * (0.8 + Math.random() * 0.2);
    const smokeColor = `rgba(${r}, ${g}, ${b}, ${smokeOpacity})`;
    
    // Calculate smoke particle size - larger for more visibility
    const radius = this.smokeTrailSettings.minSize + 
      Math.random() * (this.smokeTrailSettings.maxSize - this.smokeTrailSettings.minSize);
    
    // Draw smoother smoke effect with a more pronounced radial gradient
    const gradient = this.ctx.createRadialGradient(
      trailX + offsetX, trailY + offsetY, 0,
      trailX + offsetX, trailY + offsetY, radius
    );
    
    // More subtle gradient
    gradient.addColorStop(0, `rgba(${Math.min(255, r+10)}, ${Math.min(255, g+10)}, ${Math.min(255, b+10)}, ${smokeOpacity * 0.9})`);
    gradient.addColorStop(0.3, smokeColor);
    gradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${smokeOpacity * 0.4})`);
    gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
    
    this.ctx.beginPath();
    this.ctx.fillStyle = gradient;
    this.ctx.arc(trailX + offsetX, trailY + offsetY, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  /**
   * Explode all active fireworks (called when loud sound is detected)
   */
  explodeAllFireworks() {
    this.fireworks.forEach(firework => {
      if (!firework.exploded) {
        this.explodeFirework(firework);
        firework.exploded = true;
      }
    });
  }
}

export default FireworkManager; 