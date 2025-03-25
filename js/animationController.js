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

    // Initialize managers
    this.colorManager = new ColorManager();
    this.particleManager = new ParticleManager(this.ctx, this.colorManager);
    this.fireworkManager = new FireworkManager(this.ctx, this.colorManager, this.particleManager);

    // Resize handling
    this.resizeHandler = this.handleResize.bind(this);
    window.addEventListener("resize", this.resizeHandler);
    this.handleResize();

    console.log("Enhanced animation controller initialized");
  }

  /**
   * Starts the animation loop
   */
  start() {
    this.isActive = true;
    console.log("Animation started");
    this.animate(0);
    return true;
  }

  /**
   * Stops the animation loop
   */
  stop() {
    this.isActive = false;
    console.log("Animation stopped");
    return true;
  }

  /**
   * Main animation loop
   */
  animate(timestamp) {
    if (!this.isActive) return;

    // Calculate delta time
    const deltaTime = timestamp - this.lastTime || 16;
    this.lastTime = timestamp;

    // Clear canvas with improved fade effect
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Update and draw all components
    this.fireworkManager.updateFireworks(deltaTime);
    this.particleManager.updateParticles(deltaTime);
    
    this.fireworkManager.drawFireworks();
    this.particleManager.drawParticles();

    // Continue animation loop
    requestAnimationFrame(this.animate.bind(this));
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
   * Handle canvas resize
   */
  handleResize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
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
    // Launch a new firework
    this.fireworkManager.launchFirework();
    
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
