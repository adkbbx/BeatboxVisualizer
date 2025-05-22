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
        this.explosionInProgress = false;
        this.timeNextExplosionIsAllowed = 0;
        this.timeNextLoudSoundTriggerAllowed = 0;
        
        // Default settings, can be overridden by initialFireworkSettings
        const defaultSettings = {
            gravity: 0.02,
            maxFireworks: 20,
            launchHeightFactor: 0.05,
            smokeTrailIntensity: 0.3,
            fireworkSize: 1.0,
            sequentialExplosionDelay: 500,
            loudSoundTriggerCooldown: 250
        };

        this.settings = { ...defaultSettings, ...initialFireworkSettings };
        console.log('[FireworkManager] Initialized with settings:', this.settings);
        
        // Initialize factory
        this.fireworkFactory = new FireworkFactory(
            colorManager,
            ctx.canvas.width,
            ctx.canvas.height,
            this.settings
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
        if (newSettings.fireworkSize !== undefined) this.settings.fireworkSize = newSettings.fireworkSize;
        if (newSettings.smokeTrailIntensity !== undefined) {
            this.settings.smokeTrailIntensity = newSettings.smokeTrailIntensity;
            // Update smoke trail effect intensity
            if (this.smokeTrailEffect) {
                this.smokeTrailEffect.updateOpacity(this.settings.smokeTrailIntensity);
            }
        }
        
        // Update factory settings
        if (this.fireworkFactory && this.fireworkFactory.updateSettings) {
            this.fireworkFactory.updateSettings(newSettings);
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
        console.log('[FireworkManager] Active fireworks count:', this.fireworks.length);
        
        // 1. Update positions of all unexploded fireworks using realistic physics
        for (let i = this.fireworks.length - 1; i >= 0; i--) {
            const firework = this.fireworks[i];
            if (!firework.exploded) {
                const hasReachedPeak = firework.update(this.settings.gravity);
                if (hasReachedPeak && !firework.hasReachedTarget && !firework.markedForExplosion) {
                    // Mark that it reached its peak height (natural physics)
                    firework.hasReachedTarget = true;
                    console.log('[FireworkManager] Firework reached peak height:', firework.id, 'at position', firework.y);
                }
                
                // Check for automatic cleanup of very old fireworks (reduce maxAge for faster cleanup)
                if (firework.age > 600) { // Reduced from 1000 to 600 frames (~10 seconds)
                    console.log('[FireworkManager] Auto-removing old unexploded firework:', firework.id, 'age:', firework.age);
                    this.fireworks.splice(i, 1);
                    continue;
                }
                
                // Check if firework went off screen (cleanup)
                if (firework.y > this.ctx.canvas.height + 50 || 
                    firework.x < -50 || 
                    firework.x > this.ctx.canvas.width + 50 ||
                    firework.y < -50) { // Also remove if goes too high
                    console.log('[FireworkManager] Removing off-screen firework:', firework.id, 'position:', {x: firework.x, y: firework.y});
                    this.fireworks.splice(i, 1);
                    continue;
                }
            }
        }

        // 2. Handle sequential explosions for fireworks marked by LOUD SOUNDS
        if (this.explosionInProgress && Date.now() >= this.timeNextExplosionIsAllowed) {
            this.explosionInProgress = false;
        }

        if (!this.explosionInProgress) {
            // Only explode fireworks that were MARKED FOR EXPLOSION by loud sounds
            for (let i = 0; i < this.fireworks.length; i++) { // Iterate in launch order (oldest first)
                const firework = this.fireworks[i];
                if (firework.markedForExplosion && !firework.exploded) {
                    console.log('[FireworkManager] Exploding firework marked by loud sound:', firework.id, 'at height', firework.y);
                    this.explodeFirework(firework);
                    firework.exploded = true;
                    this.explosionInProgress = true;
                    this.timeNextExplosionIsAllowed = Date.now() + (this.settings.sequentialExplosionDelay || 500);
                    break; // Only one explosion per frame for sequential effect
                }
            }
        }

        // 3. Update exploded fireworks (fading) and remove fully faded ones
        for (let i = this.fireworks.length - 1; i >= 0; i--) {
            const firework = this.fireworks[i];
            if (firework.exploded) {
                const fullyFaded = firework.updateAfterExplosion(deltaTime);
                if (fullyFaded) {
                    console.log('[FireworkManager] Removing fully faded exploded firework:', firework.id);
                    this.fireworks.splice(i, 1);
                }
            }
        }
        
        console.log('[FireworkManager] Final fireworks count after cleanup:', this.fireworks.length);
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
                    // Pass the exact custom image ID, color, and size
                    imageSystem.handleFireworkExplosion(
                        firework.x, 
                        firework.y, 
                        explosionColor, 
                        true, 
                        firework.selectedCustomImageId,
                        firework.size || this.settings.fireworkSize
                    );
                } else {
                    // No specific image ID, just use the color and size
                    imageSystem.handleFireworkExplosion(
                        firework.x, 
                        firework.y, 
                        explosionColor, 
                        true, 
                        null,
                        firework.size || this.settings.fireworkSize
                    );
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
                        firework.selectedCustomImageId,
                        firework.size || this.settings.fireworkSize
                    );
                } else {
                    window.flowerSystem.handleFireworkExplosion(
                        firework.x, 
                        firework.y, 
                        explosionColor, 
                        true, 
                        null,
                        firework.size || this.settings.fireworkSize
                    );
                }
            } catch (error) {
            }
        }
        
        // Create the particle explosion with firework velocity for realistic smoke and size
        this.particleManager.createExplosion(
            firework.x, 
            firework.y, 
            explosionColor, 
            firework.velocity, 
            firework.size || this.settings.fireworkSize
        );
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
     * Mark the oldest active firework for explosion (called when loud sound is detected)
     */
    explodeAllFireworks() {
        if (Date.now() < this.timeNextLoudSoundTriggerAllowed) {
            console.log('[FireworkManager] Loud sound cooldown active, ignoring');
            return; // Cooldown active for this action, ignore rapid calls
        }

        // Find the oldest unexploded firework that hasn't been marked yet
        for (let i = 0; i < this.fireworks.length; i++) { // Iterate from oldest to newest
            const firework = this.fireworks[i];
            if (!firework.exploded && !firework.markedForExplosion) {
                console.log('[FireworkManager] Marking oldest firework for explosion:', firework.id);
                firework.markedForExplosion = true; // Mark for sequential explosion
                
                // Update timestamp for the next allowed trigger for this specific action
                this.timeNextLoudSoundTriggerAllowed = Date.now() + (this.settings.loudSoundTriggerCooldown || 250);

                // If an explosion was in progress but its general explosion cooldown has passed,
                // reset the flag to allow the main loop to potentially start this explosion sooner.
                if (this.explosionInProgress && Date.now() >= this.timeNextExplosionIsAllowed) {
                    this.explosionInProgress = false;
                }
                break; // Important: Only mark one firework per loud sound
            }
        }
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