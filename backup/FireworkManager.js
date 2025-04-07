/**
 * Manages firework effects and animations
 */
import SmokeTrailEffect from './SmokeTrailEffect.js';

class FireworkManager {
  constructor(ctx, colorManager, particleManager) {
    this.ctx = ctx;
    this.colorManager = colorManager;
    this.particleManager = particleManager;
    this.fireworks = [];
    this.launchingFirework = false;
    this.gravity = 0.02;
    
    // Initialize smoke trail effect
    this.smokeTrailEffect = new SmokeTrailEffect(ctx);
  }

  /**
   * Create a new firework
   */
  createFirework(startX, startY, targetX, targetY, color) {
    // Calculate angle between start and target
    const angle = Math.atan2(targetY - startY, targetX - startX);
    
    // Limit the angle to be more vertical (between -45 and 45 degrees for straighter paths)
    const maxAngle = Math.PI / 2;
    const clampedAngle = Math.max(-maxAngle, Math.min(maxAngle, angle));
    
    // Calculate distance to target
    const distance = Math.hypot(targetX - startX, targetY - startY);
    
    // Increase base velocity and adjust scaling for higher launches
    const baseVelocity = 3; 
    const velocity = baseVelocity * Math.sqrt(distance / 300);
    
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
    const minHeight = this.ctx.canvas.height * 0.2; // Lower starting point
    const maxHeight = this.ctx.canvas.height * 0.05; // Target closer to top (5% from top)
    const heightRange = minHeight - maxHeight;
    
    // Normalize duration and calculate target height
    const normalizedDuration = Math.min(duration / 1500, 1);
    const targetY = minHeight - (heightRange * normalizedDuration);
    
    // Set X positions
    const centerX = this.ctx.canvas.width / 2;
    const spread = this.ctx.canvas.width * 0.2;
    const startX = centerX + (Math.random() - 0.5) * spread;
    const targetX = centerX + (Math.random() - 0.5) * spread;
    const startY = this.ctx.canvas.height;
    
    // Clean up old exploded fireworks
    this.cleanupOldFireworks();
    
    // Get a color and image ID from the image system
    const { fireworkColor, selectedCustomImageId } = this.getFireworkColor();
    
    // Create and add the new firework with the selected color
    const firework = this.createFirework(startX, startY, targetX, targetY, fireworkColor);
    firework.isNewest = true;
    firework.selectedImageColor = fireworkColor;
    firework.selectedCustomImageId = selectedCustomImageId;
    
    // Remove the newest flag from all other fireworks
    this.fireworks.forEach(f => f.isNewest = false);
    
    // Add to array
    this.fireworks.push(firework);
    
    setTimeout(() => {
      this.launchingFirework = false;
    }, 100);
  }
  
  /**
   * Get a color for the firework, using custom images if available
   */
  getFireworkColor() {
    let fireworkColor = null;
    let selectedCustomImageId = null;
    
    // Try to get a color from the image system
    if (window.imageSystem && window.imageSystem.imageManager) {
      try {
        const randomImage = window.imageSystem.imageManager.getRandomImage();
        
        if (randomImage && randomImage.dominantColor && randomImage.dominantColor.hex) {
          fireworkColor = randomImage.dominantColor.hex;
          selectedCustomImageId = randomImage.id;
          
          // Validate hex color format
          if (!/^#[0-9A-F]{6}$/i.test(fireworkColor)) {
            fireworkColor = this.colorManager.getRandomColor();
            selectedCustomImageId = null;
          }
        } else {
          fireworkColor = this.colorManager.getRandomColor();
        }
      } catch (error) {
        fireworkColor = this.colorManager.getRandomColor();
      }
    } else {
      fireworkColor = this.colorManager.getRandomColor();
    }
    
    return { fireworkColor, selectedCustomImageId };
  }
  
  /**
   * Clean up old exploded fireworks to prevent array growth
   */
  cleanupOldFireworks() {
    const maxFireworks = 20;
    
    if (this.fireworks.length > maxFireworks) {
      // First remove any fully faded exploded fireworks
      const fadedCount = this.fireworks.filter(f => f.exploded && f.alpha <= 0.1).length;
      
      if (fadedCount > 0) {
        // Remove fully faded fireworks
        this.fireworks = this.fireworks.filter(f => !(f.exploded && f.alpha <= 0.1));
      } else if (this.fireworks.length > maxFireworks) {
        // Remove oldest exploded fireworks first
        const explodedFireworks = this.fireworks.filter(f => f.exploded);
        
        if (explodedFireworks.length > 0) {
          // Sort by id (oldest first)
          explodedFireworks.sort((a, b) => a.id - b.id);
          const oldestId = explodedFireworks[0].id;
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
        // Fade out exploded fireworks
        firework.alpha -= deltaTime * 0.003;
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
    const imageSystem = window.imageSystem;
    let explosionColor = firework.selectedImageColor || firework.color;
    
    if (imageSystem) {
      try {
        if (firework.selectedCustomImageId) {
          // Pass the exact custom image ID and color
          imageSystem.handleFireworkExplosion(
            firework.x, 
            firework.y, 
            explosionColor, 
            true, 
            firework.selectedCustomImageId
          );
        } else {
          // No specific image ID, just use the color
          imageSystem.handleFireworkExplosion(firework.x, firework.y, explosionColor, true);
        }
      } catch (error) {
        console.error('Error creating image explosion:', error);
      }
    } else if (window.flowerSystem && window.flowerSystem.flowerManager) {
      // Fallback to legacy flower system
      try {
        if (firework.selectedCustomImageId) {
          window.flowerSystem.handleFireworkExplosion(
            firework.x, 
            firework.y, 
            explosionColor, 
            true, 
            firework.selectedCustomImageId
          );
        } else {
          window.flowerSystem.handleFireworkExplosion(firework.x, firework.y, explosionColor, true);
        }
      } catch (error) {
        console.error('Error creating flower explosion:', error);
      }
    }
    
    // Create the particle explosion
    this.particleManager.createExplosion(firework.x, firework.y, explosionColor);
  }

  /**
   * Draw all fireworks, starting from the end of the array to draw newest last (on top)
   */
  drawFireworks() {
    // Draw from end to beginning to ensure newest fireworks appear on top
    for (let i = this.fireworks.length - 1; i >= 0; i--) {
      const firework = this.fireworks[i];
      
      if (!firework.exploded) {
        // Set blend mode based on firework age
        if (i > this.fireworks.length - 4) {
          this.ctx.globalCompositeOperation = 'lighter';
        } else {
          this.ctx.globalCompositeOperation = 'source-over';
        }
        
        const color = this.colorManager.getColorWithAlpha(firework.color, firework.alpha);
        
        this.ctx.save();
        
        // Add glow
        this.ctx.shadowColor = color;
        this.ctx.shadowBlur = 5;
        
        // Draw the main firework body
        this.ctx.beginPath();
        this.ctx.arc(firework.x, firework.y, 2.5, 0, Math.PI * 2);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        
        // Calculate trail length
        const trailLength = Math.sqrt(
          firework.velocity.x * firework.velocity.x + 
          firework.velocity.y * firework.velocity.y
        ) * 4.0;
        
        // Create gradient trail
        const gradient = this.ctx.createLinearGradient(
          firework.x, firework.y,
          firework.x - firework.velocity.x * trailLength,
          firework.y - firework.velocity.y * trailLength
        );
        
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        
        // Draw the trail
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
        this.smokeTrailEffect.createSmokeTrail(firework);
      }
    }
    
    // Reset composite operation
    this.ctx.globalCompositeOperation = 'source-over';
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