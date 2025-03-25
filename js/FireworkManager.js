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
    
    const firework = this.createFirework(startX, startY, targetX, targetY);
    this.fireworks.push(firework);
    
    setTimeout(() => {
      this.launchingFirework = false;
    }, 100);
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
        // Fade out exploded fireworks
        firework.alpha -= deltaTime * 0.001;
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
    this.particleManager.createExplosion(firework.x, firework.y, firework.color);
  }

  /**
   * Draw all fireworks
   */
  drawFireworks() {
    this.fireworks.forEach(firework => {
      if (!firework.exploded) {
        const color = this.colorManager.getColorWithAlpha(firework.color, firework.alpha);
        
        this.ctx.beginPath();
        this.ctx.arc(firework.x, firework.y, 2, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        
        // Draw trail
        this.ctx.beginPath();
        this.ctx.moveTo(firework.x, firework.y);
        this.ctx.lineTo(
          firework.x - firework.velocity.x * 2,
          firework.y - firework.velocity.y * 2
        );
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
      }
    });
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