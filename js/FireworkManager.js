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
    this.gravity = 0.08;
  }

  /**
   * Create a new firework
   */
  createFirework(startX, startY, targetX, targetY, color) {
    const angle = Math.atan2(targetY - startY, targetX - startX);
    const velocity = 8;
    
    return {
      id: Date.now(),
      x: startX,
      y: startY,
      targetX,
      targetY,
      color: color || this.colorManager.getRandomColor(),
      velocity: {
        x: Math.cos(angle) * velocity,
        y: Math.sin(angle) * velocity
      },
      exploded: false,
      alpha: 1
    };
  }

  /**
   * Launch a new firework
   */
  launchFirework() {
    if (this.launchingFirework) return;
    
    this.launchingFirework = true;
    
    const startX = Math.random() * this.ctx.canvas.width;
    const startY = this.ctx.canvas.height;
    const targetX = Math.random() * this.ctx.canvas.width;
    const targetY = this.ctx.canvas.height * 0.3 + Math.random() * this.ctx.canvas.height * 0.2;
    
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