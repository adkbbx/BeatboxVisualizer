import ColorManager from './ColorManager.js';
import ParticleManager from './ParticleManager.js';
import FireworkManager from './FireworkManager.js';

/**
 * Main animation controller that coordinates all animation components
 */
class AnimationController {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.isActive = false;
    this.debug = false;
    this.lastTime = 0;
    this.fireworks = []; // Track active fireworks
    
    // Set up for double-buffer technique
    this.copyCanvas = null;
    this.copyCtx = null;

    // Initialize managers
    this.colorManager = new ColorManager();
    this.particleManager = new ParticleManager(this.ctx, this.colorManager);
    this.fireworkManager = new FireworkManager(this.ctx, this.colorManager, this.particleManager);

    // Resize handling
    this.resizeHandler = this.handleResize.bind(this);
    window.addEventListener("resize", this.resizeHandler);
    this.handleResize();
    
    // Initial clear of the canvas with plain black
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    console.log("Enhanced animation controller initialized");
  }
  
  // Removed the full clear function to prevent jarring transitions

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
  }

  /**
   * Start the animation
   */
  start() {
    console.log('[AnimationController] Starting animation...');
    
    if (!this.isActive) {
      console.log('[AnimationController] Activating animation loop');
      this.isActive = true;
      this.lastTime = performance.now();
      requestAnimationFrame(this.animate.bind(this));
      console.log('[AnimationController] Animation started successfully, frame loop initiated');
    } else {
      console.log('[AnimationController] Animation already active, no action taken');
    }
  }

  /**
   * Stop the animation
   */
  stop() {
    console.log('[AnimationController] Stopping animation...');
    console.log('[AnimationController] Current state before stopping:', {
      isActive: this.isActive,
      fireworkCount: this.fireworks.length,
      canvasDimensions: {
        width: this.canvas.width, 
        height: this.canvas.height
      }
    });
    
    this.isActive = false;
    console.log('[AnimationController] Animation stopped, frame loop will exit on next frame');
  }
  
  /**
   * Pause the animation temporarily
   * Will maintain the current visual state
   */
  pause() {
    console.log('[AnimationController] Pausing animation...');
    console.log('[AnimationController] Current state before pausing:', {
      isActive: this.isActive,
      fireworkCount: this.fireworks.length,
      canvasDimensions: {
        width: this.canvas.width, 
        height: this.canvas.height
      }
    });
    
    // Just mark as inactive but don't clear anything
    // This preserves the current visual state
    this.isActive = false;
    console.log('[AnimationController] Animation paused - current visual state preserved');
  }
  
  /**
   * Resume the animation after pause
   */
  resume() {
    console.log('[AnimationController] Resuming animation...');
    console.log('[AnimationController] Current state before resuming:', {
      isActive: this.isActive,
      fireworkCount: this.fireworks.length,
      canvasDimensions: {
        width: this.canvas.width, 
        height: this.canvas.height
      }
    });
    
    if (!this.isActive) {
      console.log('[AnimationController] Reactivating animation loop');
      this.isActive = true;
      this.lastTime = performance.now();
      requestAnimationFrame(this.animate.bind(this));
      console.log('[AnimationController] Animation resumed successfully, frame loop restarted');
    } else {
      console.log('[AnimationController] Animation already active, no action taken');
    }
  }

  /**
   * Main animation loop
   */
  animate(timestamp) {
    if (!this.isActive) {
      console.log('[AnimationController] Animation frame skipped - not active');
      return;
    }

    try {
      // Calculate delta time
      const deltaTime = timestamp - this.lastTime || 16;
      this.lastTime = timestamp;

      // Two-layer approach: Keep a copy of the previous frame and manipulate it
      
      // First, check if we have a copy canvas for our two-buffer approach
      if (!this.copyCanvas) {
        // Create a copy canvas with same dimensions for the two-buffer technique
        this.copyCanvas = document.createElement('canvas');
        this.copyCanvas.width = this.canvas.width;
        this.copyCanvas.height = this.canvas.height;
        this.copyCtx = this.copyCanvas.getContext('2d');
        
        // Fill it with black initially
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
      
      // Step 3: Draw the previous frame back with reduced alpha for trails
      this.ctx.globalAlpha = 0.80; // Keep 80% of previous frame - adjust for trail length
      this.ctx.drawImage(this.copyCanvas, 0, 0);
      this.ctx.globalAlpha = 1.0; // Reset alpha for drawing new elements

      // Update all components first
      this.fireworkManager.updateFireworks(deltaTime);
      this.particleManager.updateParticles(deltaTime);
      
      // Clear firework-specific context settings to prevent blending issues
      this.ctx.globalCompositeOperation = 'source-over';
      this.ctx.shadowBlur = 0;
      this.ctx.globalAlpha = 1.0;
      
      // Draw particles first (explosions appear behind new launches)
      this.particleManager.drawParticles();
      
      // Then draw active fireworks on top
      this.fireworkManager.drawFireworks();

      // Update and render custom images if the system exists
      if (window.imageSystem) {
        window.imageSystem.update();
      } else if (window.flowerSystem) {
        // Backward compatibility for older versions
        window.flowerSystem.update();
      }

      // Continue animation loop
      requestAnimationFrame(this.animate.bind(this));
    } catch (error) {
      console.error('[AnimationController] Error in animation frame:', error);
      console.error('[AnimationController] Stack trace:', error.stack);
      console.error('[AnimationController] State at error:', {
        isActive: this.isActive,
        lastTime: this.lastTime,
        fireworkCount: this.fireworks.length,
        canvasDimensions: {
          width: this.canvas.width, 
          height: this.canvas.height
        }
      });
      
      // Try to recover by continuing the animation loop
      if (this.isActive) {
        console.log('[AnimationController] Attempting to recover animation loop');
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
