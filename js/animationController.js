import ParticleManager from './modes/FireworkMode/ParticleManager.js';
import FireworkManager from './modes/FireworkMode/FireworkManager.js';
import BackgroundManager from './BackgroundManager.js';
import BubbleManager from './modes/BubbleMode/BubbleManager.js';

/**
 * Main animation controller that coordinates all animation components
 */
class AnimationController {
  constructor(canvasId, colorManagerInstance, initialSettings = {}) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.isActive = false;
    this.lastTime = 0;
    this.fireworks = [];
    
    // Mode management
    this.currentMode = 'firework'; // Default mode
    
    // Set up for double-buffer technique
    this.copyCanvas = null;
    this.copyCtx = null;
    
    // Default animation settings, merge with provided initial settings
    const defaultAnimSettings = { globalSpeed: 1.0 };
    const currentAnimationSettings = { ...defaultAnimSettings, ...(initialSettings.animation || {}) };
    this.globalSpeed = currentAnimationSettings.globalSpeed;

    // Store initial settings for later use
    this.initialSettings = initialSettings;

    // Initialize managers with their respective initial settings
    this.colorManager = colorManagerInstance;
    // Pass particle and effect settings combined to ParticleManager
    const particleAndEffectSettings = { ...(initialSettings.particles || {}), ...(initialSettings.effects || {}) };
    this.particleManager = new ParticleManager(this.ctx, this.colorManager, particleAndEffectSettings);
    this.fireworkManager = new FireworkManager(this.ctx, this.colorManager, this.particleManager, initialSettings.fireworks || {});
    this.bubbleManager = null; // Will be initialized when bubble mode is first used
    // Note: BackgroundManager is handled by DirectBackgroundUploader and connected via main.js
    this.backgroundManager = null; // Will be set by main.js after DirectBackgroundUploader initializes
    // Note: BackgroundManager settings are handled differently due to window.backgroundSystem

    // Resize handling
    this.resizeHandler = this.handleResize.bind(this);
    window.addEventListener("resize", this.resizeHandler);
    this.handleResize();
    
    // Initial clear of the canvas (transparent to show background)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  
  /**
   * Switch animation mode
   * @param {string} newMode - The mode to switch to ('firework' or 'bubble')
   */
  switchMode(newMode) {
    if (this.currentMode === newMode) return;
    
    this.currentMode = newMode;
    
    // Initialize bubble manager if switching to bubble mode and it doesn't exist
    if (newMode === 'bubble' && !this.bubbleManager) {
      this.bubbleManager = new BubbleManager(this.ctx, this.colorManager, this.particleManager, this.initialSettings?.bubbles || {});
      
      // Update sound effects if audio is ready
      if (this.audioReady && this.bubbleManager) {
        this.bubbleManager.updateSoundEffects();
      }
    }
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
    
    if (settings.bubbles && this.bubbleManager) {
      this.bubbleManager.updateSettings(settings.bubbles);
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
    // Resize main firework canvas
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    // Resize background canvas
    if (this.backgroundManager && this.backgroundManager.canvas) {
      this.backgroundManager.canvas.width = window.innerWidth;
      this.backgroundManager.canvas.height = window.innerHeight;
    }
    
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
        
        // Keep copy canvas transparent
        this.copyCtx.clearRect(0, 0, this.copyCanvas.width, this.copyCanvas.height);
      }
      
      // Step 1: Save the current canvas state to our copy canvas
      this.copyCtx.globalAlpha = 1.0;
      this.copyCtx.clearRect(0, 0, this.copyCanvas.width, this.copyCanvas.height);
      this.copyCtx.drawImage(this.canvas, 0, 0);
      
      // Step 2: Clear the main canvas completely (transparent)
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      // Step 4: Draw the previous frame back with reduced alpha for trails
      this.ctx.globalAlpha = 0.80; // Keep 80% of previous frame for trails
      this.ctx.drawImage(this.copyCanvas, 0, 0);
      this.ctx.globalAlpha = 1.0; // Reset alpha for drawing new elements

      // Update all components with adjusted deltaTime based on current mode
      if (this.currentMode === 'firework') {
        this.fireworkManager.updateFireworks(deltaTime);
      } else if (this.currentMode === 'bubble' && this.bubbleManager) {
        this.bubbleManager.updateBubbles(deltaTime);
      }
      
      this.particleManager.updateParticles(deltaTime);
      
      // Reset context settings
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.shadowBlur = 0;
      this.ctx.globalAlpha = 1.0;
      
      // Draw scene components based on current mode
      this.particleManager.drawParticles();
      
      if (this.currentMode === 'firework') {
        this.fireworkManager.drawFireworks();
      } else if (this.currentMode === 'bubble' && this.bubbleManager) {
        this.bubbleManager.drawBubbles();
      }

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
   * Launch a new animation (firework or bubble based on current mode)
   * @param {number} duration - The duration of the sustained sound, used to calculate launch parameters.
   */
  launchFirework(duration) {
    if (this.currentMode === 'firework') {
      this.fireworkManager.launchFirework(duration);
    } else if (this.currentMode === 'bubble' && this.bubbleManager) {
      this.bubbleManager.launchBubble(duration);
    }
  }

  /**
   * Explode all active animations (fireworks or bubbles based on current mode)
   */
  explodeAllFireworks() {
    if (this.currentMode === 'firework') {
      this.fireworkManager.explodeAllFireworks();
    } else if (this.currentMode === 'bubble' && this.bubbleManager) {
      this.bubbleManager.popAllBubbles();
    }
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
    // Ensure animation is running
    if (!this.isActive) {
      this.start();
    }
    
    // Launch a new animation with duration
    try {
      if (this.currentMode === 'firework') {
        this.fireworkManager.launchFirework(duration);
      } else if (this.currentMode === 'bubble' && this.bubbleManager) {
        this.bubbleManager.launchBubble(duration);
      }
    } catch (error) {
      console.error(`❌ Error launching ${this.currentMode}:`, error);
      return null;
    }
    
    // Generate a unique ID for this firework
    const fireworkId = `firework_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
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
      // For loud sounds, explode all active animations
      if (this.currentMode === 'firework') {
        this.fireworkManager.explodeAllFireworks();
      } else if (this.currentMode === 'bubble' && this.bubbleManager) {
        this.bubbleManager.popAllBubbles();
      }
    }
  }
}

export default AnimationController;