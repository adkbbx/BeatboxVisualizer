/**
 * Manages firework effects and animations
 * Refactored to use separate modules for firework creation and management
 */
import SmokeTrailEffect from '../SmokeTrailEffect.js';
import FireworkFactory from './FireworkFactory.js';

class FireworkManager {
    constructor(ctx, colorManager, particleManager, initialFireworkSettings = null) {
        this.ctx = ctx;
        this.colorManager = colorManager;
        this.particleManager = particleManager;
        this.fireworks = [];
        this.launchingFirework = false;
        
        // Default settings, can be overridden by initialFireworkSettings
        const defaultSettings = {
            gravity: 0.02,
            maxFireworks: 20,
            launchHeightFactor: 0.05,
            smokeTrailIntensity: 0.3
        };

        this.settings = { ...defaultSettings, ...initialFireworkSettings };
        console.log('[FireworkManager] Initialized with settings:', this.settings);
        
        // Initialize factory
        this.fireworkFactory = new FireworkFactory(
            colorManager,
            ctx.canvas.width,
            ctx.canvas.height
        );
        
        // Initialize smoke trail effect
        this.smokeTrailEffect = new SmokeTrailEffect(ctx);
        // Apply initial smokeTrailIntensity to the effect
        if (this.settings.smokeTrailIntensity !== undefined && this.smokeTrailEffect) {
            this.smokeTrailEffect.updateOpacity(this.settings.smokeTrailIntensity);
        }
    }
    
    /**
     * Update firework settings
     */
    updateSettings(newSettings) {
        // Update settings object
        if (newSettings.gravity !== undefined) this.settings.gravity = newSettings.gravity;
        if (newSettings.maxFireworks !== undefined) this.settings.maxFireworks = newSettings.maxFireworks;
        if (newSettings.launchHeightFactor !== undefined) this.settings.launchHeightFactor = newSettings.launchHeightFactor;
        if (newSettings.smokeTrailIntensity !== undefined) {
            this.settings.smokeTrailIntensity = newSettings.smokeTrailIntensity;
            // Update smoke trail effect intensity
            if (this.smokeTrailEffect) {
                this.smokeTrailEffect.updateOpacity(this.settings.smokeTrailIntensity);
            }
        }
    }

    /**
     * Launch a new firework
     * @param {number} duration - Duration of the sustained sound in milliseconds
     */
    launchFirework(duration = 250) {
        if (this.launchingFirework) return;
        
        this.launchingFirework = true;
        
        // Clean up old exploded fireworks
        this.cleanupOldFireworks();
        
        // Get launch parameters
        const params = this.fireworkFactory.calculateLaunchParameters(duration);
        
        // Get a color and image ID from the image system
        const { fireworkColor, selectedCustomImageId } = this.fireworkFactory.getFireworkColor();
        
        // Create the firework
        const firework = this.fireworkFactory.createFirework(
            params.startX, params.startY,
            params.targetX, params.targetY,
            fireworkColor
        );
        
        // Set additional properties
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
     * Clean up old exploded fireworks to prevent array growth
     */
    cleanupOldFireworks() {
        const maxFireworks = this.settings.maxFireworks;
        
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
                // Update firework position using current gravity setting
                const reachedTarget = firework.update(this.settings.gravity);
                
                // Check if firework reached target
                if (reachedTarget) {
                    this.explodeFirework(firework);
                    firework.exploded = true;
                }
            } else {
                // Fade out exploded fireworks
                const fullyFaded = firework.updateAfterExplosion(deltaTime);
                if (fullyFaded) {
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
                
                // Draw the firework
                firework.draw(this.ctx, this.colorManager);
                
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
    
    /**
     * Handle canvas resize
     */
    updateCanvasDimensions(width, height) {
        if (this.fireworkFactory) {
            this.fireworkFactory.updateCanvasDimensions(width, height);
        }
    }
}

export default FireworkManager;