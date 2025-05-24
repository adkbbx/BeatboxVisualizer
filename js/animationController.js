import ParticleManager from './particles/ParticleManager.js';
import FireworkManager from './fireworks/FireworkManager.js';
import BackgroundManager from './BackgroundManager.js';

/**
 * Main animation controller that coordinates all animation components
 */
class AnimationController {
  constructor(canvasId, colorManagerInstance, initialSettings = {}) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.isActive = false;
    this.lastTime = 0;
    this.fireworks = []; // Track active fireworks
    
    // Set up for double-buffer technique
    this.copyCanvas = null;
    this.copyCtx = null;
    
    // Default animation settings, merge with provided initial settings
    const defaultAnimSettings = { globalSpeed: 1.0 };
    const currentAnimationSettings = { ...defaultAnimSettings, ...(initialSettings.animation || {}) };
    this.globalSpeed = currentAnimationSettings.globalSpeed;

    // Initialize managers with their respective initial settings
    this.colorManager = colorManagerInstance;
    // Pass particle and effect settings combined to ParticleManager
    const particleAndEffectSettings = { ...(initialSettings.particles || {}), ...(initialSettings.effects || {}) };
    this.particleManager = new ParticleManager(this.ctx, this.colorManager, particleAndEffectSettings);
    this.fireworkManager = new FireworkManager(this.ctx, this.colorManager, this.particleManager, initialSettings.fireworks || {});
    this.backgroundManager = new BackgroundManager(this.canvas, this.ctx);
    // Note: BackgroundManager settings are handled differently due to window.backgroundSystem

    // Resize handling
    this.resizeHandler = this.handleResize.bind(this);
    window.addEventListener("resize", this.resizeHandler);
    this.handleResize();
    
    // Initial clear of the canvas with plain black
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  /**
   * Update animation settings
   */
  updateSettings(settings) {
    // Update global animation speed if provided
    if (settings.globalSpeed !== undefined) {
      this.globalSpeed = settings.globalSpeed;
    }
    
    // Forward settings to managers
    if (settings.fireworks && this.fireworkManager) {
      this.fireworkManager.updateSettings(settings.fireworks);
    }
    
    if (settings.particles && this.particleManager) {
      this.particleManager.updateSettings(settings.particles);
    }
    
    // Update background settings if provided
    if (settings.background && this.backgroundManager) {
      this.backgroundManager.updateSettings(settings.background);
    }
  }
  
  /**
   * Handle window resize
   */
  handleResize() {
    // Resize main canvas
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    // Resize copy canvas if it exists
    if (this.copyCanvas) {
      this.copyCanvas.width = this.canvas.width;
      this.copyCanvas.height = this.canvas.height;
      
      // Refill with black
      this.copyCtx.fillStyle = 'black';
      this.copyCtx.fillRect(0, 0, this.copyCanvas.width, this.copyCanvas.height);
    }
    
    // Update firework manager with new dimensions if available
    if (this.fireworkManager && this.fireworkManager.updateCanvasDimensions) {
      this.fireworkManager.updateCanvasDimensions(this.canvas.width, this.canvas.height);
    }
  }

  /**
   * Add a background image
   */
  addBackgroundImage(image) {
    if (this.backgroundManager) {
      return this.backgroundManager.addBackgroundImage(image);
    }
    return -1;
  }
  
  /**
   * Remove a background image
   */
  removeBackgroundImage(index) {
    if (this.backgroundManager) {
      this.backgroundManager.removeBackgroundImage(index);
    }
  }
  
  /**
   * Clear all background images
   */
  clearBackgroundImages() {
    if (this.backgroundManager) {
      this.backgroundManager.clearBackgroundImages();
    }
  }

  /**
   * Start the animation
   */
  start() {
    if (!this.isActive) {
      this.isActive = true;
      this.lastTime = performance.now();

      requestAnimationFrame(this.animate.bind(this));
    }
  }

  /**
   * Stop the animation
   */
  stop() {
    this.isActive = false;

    // Stop background manager
    if (this.backgroundManager && typeof this.backgroundManager.stop === 'function') {
      this.backgroundManager.stop();
    }
  }
  
  /**
   * Pause the animation temporarily
   * Will maintain the current visual state
   */
  pause() {
    this.isActive = false;
  }
  
  /**
   * Resume the animation after pause
   */
  resume() {
    if (!this.isActive) {
      this.isActive = true;
      this.lastTime = performance.now();

      // Restart background manager's independent loop
      if (this.backgroundManager && typeof this.backgroundManager.startIndependentLoop === 'function') {
        this.backgroundManager.startIndependentLoop();
      }

      requestAnimationFrame(this.animate.bind(this));
    }
  }

  /**
   * Main animation loop
   */
  animate(timestamp) {
    if (!this.isActive) {
      return;
    }

    try {
      // Calculate delta time and adjust by global speed
      const rawDeltaTime = timestamp - this.lastTime || 16;
      const deltaTime = rawDeltaTime * this.globalSpeed;
      this.lastTime = timestamp;

      // Initialize copy canvas if needed
      if (!this.copyCanvas) {
        this.copyCanvas = document.createElement('canvas');
        this.copyCanvas.width = this.canvas.width;
        this.copyCanvas.height = this.canvas.height;
        this.copyCtx = this.copyCanvas.getContext('2d');
        
        this.copyCtx.fillStyle = 'black';
        this.copyCtx.fillRect(0, 0, this.copyCanvas.width, this.copyCanvas.height);
      }
      
      // Step 1: Save the current canvas state to our copy canvas
      this.copyCtx.globalAlpha = 1.0;
      this.copyCtx.clearRect(0, 0, this.copyCanvas.width, this.copyCanvas.height);
      this.copyCtx.drawImage(this.canvas, 0, 0);
      
      // Step 2: Clear the main canvas completely
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#000000';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Step 4: Draw the previous frame back with reduced alpha for trails
      this.ctx.globalAlpha = 0.80; // Keep 80% of previous frame for trails
      this.ctx.drawImage(this.copyCanvas, 0, 0);
      this.ctx.globalAlpha = 1.0; // Reset alpha for drawing new elements

      // Update all components with adjusted deltaTime
      this.fireworkManager.updateFireworks(deltaTime);
      this.particleManager.updateParticles(deltaTime);
      
      // Reset context settings
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.shadowBlur = 0;
      this.ctx.globalAlpha = 1.0;
      
      // Draw scene components
      this.particleManager.drawParticles();
      this.fireworkManager.drawFireworks();

      // Update and render custom images
      if (window.imageSystem) {
        window.imageSystem.update();
      } else if (window.flowerSystem) {
        window.flowerSystem.update();
      }

      // Continue animation loop
      requestAnimationFrame(this.animate.bind(this));
    } catch (error) {
      // Try to recover
      if (this.isActive) {
        requestAnimationFrame(this.animate.bind(this));
      }
    }
  }

  /**
   * Launch a new firework
   */
  launchFirework() {
    this.fireworkManager.launchFirework();
  }

  /**
   * Explode all active fireworks
   */
  explodeAllFireworks() {
    this.fireworkManager.explodeAllFireworks();
  }

  /**
   * Clean up resources
   */
  destroy() {
    window.removeEventListener("resize", this.resizeHandler);
    this.stop();
  }

  /**
   * Apply a sustained sound effect
   * @param {number} volume - The volume level of the sustained sound
   * @param {number} duration - The duration of the sustained sound
   * @returns {string} - A unique ID for the firework
   */
  applySustainedSound(volume, duration) {
    // Launch a new firework with duration
    this.fireworkManager.launchFirework(duration);
    
    // Generate a unique ID for this firework
    const fireworkId = `firework_${Date.now()}`;
    
    // Store the firework reference
    this.fireworks.push({
      id: fireworkId,
      volume: volume,
      duration: duration
    });
    
    return fireworkId;
  }

  /**
   * Deactivate a specific firework
   * @param {string} fireworkId - The ID of the firework to deactivate
   */
  deactivateFirework(fireworkId) {
    // Find and remove the firework from tracking
    const index = this.fireworks.findIndex(f => f.id === fireworkId);
    if (index !== -1) {
      this.fireworks.splice(index, 1);
    }
  }

  /**
   * Apply volume-based effects
   * @param {number} volume - The current volume level
   * @param {string} category - The volume category ('quiet', 'normal', 'loud')
   */
  applyVolume(volume, category) {
    if (category === 'loud') {
      // For loud sounds, explode all active fireworks
      this.fireworkManager.explodeAllFireworks();
    }
  }
}

export default AnimationController;