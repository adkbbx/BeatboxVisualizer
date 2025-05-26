import BubbleFactory from './BubbleFactory.js';
import BubbleParticle from './BubbleParticle.js';
import TestBubbleManager from './TestBubbleManager.js';

/**
 * Manages bubble effects and animations
 */
class BubbleManager {
    constructor(ctx, colorManager, particleManager, initialBubbleSettings = null) {
        this.ctx = ctx;
        this.colorManager = colorManager;
        this.particleManager = particleManager;
        this.bubbles = [];
        this.launchingBubble = false;
        this.popInProgress = false;
        this.timeNextPopIsAllowed = 0;
        
        // Sequential popping system (like fireworks)
        this.sequentialPopInProgress = false;
        this.timeNextSequentialPopAllowed = 0;
        this.timeNextLoudSoundTriggerAllowed = 0;
        
        // Initialize test bubble manager
        this.testBubbleManager = null;
        
        // Default settings for bubbles
        const defaultSettings = {
            gravity: 0.015, // Reduced gravity for bubbles
            maxBubbles: 15, // Fewer bubbles than fireworks
            riseSpeed: 2.0,
            riseSpeedVariation: 0.5,
            bubbleSize: 1.0,
            randomSize: false,
            randomSizeMin: 0.5,
            randomSizeMax: 2.0,
            sequentialPopDelay: 300,
            sequentialPopExplosionDelay: 400, // Delay between sequential pops (like fireworks)
            loudSoundTriggerCooldown: 250, // Cooldown for loud sound triggers
            
            // Launch settings (mirroring firework structure)
            launchSpread: 30,
            launchSpreadMode: 'range',
            
            // Cluster settings
            bubbleClusterSize: 3,
            clusterSpread: 20,
            
            // Rise speed settings
            randomRiseSpeed: false,
            randomRiseSpeedMin: 1.0,
            randomRiseSpeedMax: 4.0,
            
            // Pop height settings (NEW: Random Pop Height feature)
            autoPopHeight: 0.2, // Height percentage where bubbles auto-pop
            randomPopHeight: false,
            randomPopHeightMin: 0.15, // 15% from top
            randomPopHeightMax: 0.40, // 40% from top
            
            // Physics settings
            wobbleIntensity: 1.0,
            buoyancy: 0.98,
            
            // Legacy settings for compatibility
            popSensitivity: 0.8 // How easily bubbles pop
        };

        this.settings = { ...defaultSettings, ...initialBubbleSettings };
        
        // Initialize factory
        this.bubbleFactory = new BubbleFactory(
            colorManager,
            ctx.canvas.width,
            ctx.canvas.height,
            this.settings
        );
        
        // Initialize test bubble manager after we have access to sound effects
        this.initializeTestBubbleManager();
    }
    
    /**
     * Initialize test bubble manager with sound effects
     */
    initializeTestBubbleManager() {
        // Get sound effects from global audio manager
        const soundEffects = window.audioManager?.soundEffects;
        if (soundEffects) {
            this.testBubbleManager = new TestBubbleManager(this, soundEffects);
        } else if (window.audioManager) {
            // Create test bubble manager without sound effects for now
            // It will be updated later when audio is initialized
            this.testBubbleManager = new TestBubbleManager(this, null);
        } else {
            // Retry after a short delay if audio manager isn't ready yet
            setTimeout(() => {
                this.initializeTestBubbleManager();
            }, 500);
        }
    }
    
    /**
     * Update sound effects reference (called when audio manager is initialized)
     */
    updateSoundEffects() {
        const soundEffects = window.audioManager?.soundEffects;
        if (soundEffects) {
            if (this.testBubbleManager) {
                this.testBubbleManager.updateSoundEffects(soundEffects);
                this.testBubbleManager.setSoundEnabled(true);
            } else {
                // Re-initialize test bubble manager if it doesn't exist
                this.initializeTestBubbleManager();
            }
        }
    }

    /**
     * Update bubble settings
     */
    updateSettings(newSettings) {
        // Update settings object
        if (newSettings.gravity !== undefined) this.settings.gravity = newSettings.gravity;
        if (newSettings.maxBubbles !== undefined) this.settings.maxBubbles = newSettings.maxBubbles;
        if (newSettings.riseSpeed !== undefined) this.settings.riseSpeed = newSettings.riseSpeed;
        if (newSettings.riseSpeedVariation !== undefined) this.settings.riseSpeedVariation = newSettings.riseSpeedVariation;
        if (newSettings.bubbleSize !== undefined) this.settings.bubbleSize = newSettings.bubbleSize;
        if (newSettings.randomSize !== undefined) this.settings.randomSize = newSettings.randomSize;
        if (newSettings.randomSizeMin !== undefined) this.settings.randomSizeMin = newSettings.randomSizeMin;
        if (newSettings.randomSizeMax !== undefined) this.settings.randomSizeMax = newSettings.randomSizeMax;
        
        // Launch settings
        if (newSettings.launchSpread !== undefined) this.settings.launchSpread = newSettings.launchSpread;
        if (newSettings.launchSpreadMode !== undefined) this.settings.launchSpreadMode = newSettings.launchSpreadMode;
        
        // Cluster settings
        if (newSettings.bubbleClusterSize !== undefined) this.settings.bubbleClusterSize = newSettings.bubbleClusterSize;
        if (newSettings.clusterSpread !== undefined) this.settings.clusterSpread = newSettings.clusterSpread;
        
        // Rise speed settings
        if (newSettings.randomRiseSpeed !== undefined) this.settings.randomRiseSpeed = newSettings.randomRiseSpeed;
        if (newSettings.randomRiseSpeedMin !== undefined) this.settings.randomRiseSpeedMin = newSettings.randomRiseSpeedMin;
        if (newSettings.randomRiseSpeedMax !== undefined) this.settings.randomRiseSpeedMax = newSettings.randomRiseSpeedMax;
        
        // Pop height settings (NEW: Random Pop Height feature)
        if (newSettings.autoPopHeight !== undefined) this.settings.autoPopHeight = newSettings.autoPopHeight;
        if (newSettings.randomPopHeight !== undefined) this.settings.randomPopHeight = newSettings.randomPopHeight;
        if (newSettings.randomPopHeightMin !== undefined) this.settings.randomPopHeightMin = newSettings.randomPopHeightMin;
        if (newSettings.randomPopHeightMax !== undefined) this.settings.randomPopHeightMax = newSettings.randomPopHeightMax;
        
        // Physics settings
        if (newSettings.wobbleIntensity !== undefined) this.settings.wobbleIntensity = newSettings.wobbleIntensity;
        if (newSettings.buoyancy !== undefined) this.settings.buoyancy = newSettings.buoyancy;
        
        // Legacy settings
        if (newSettings.popSensitivity !== undefined) this.settings.popSensitivity = newSettings.popSensitivity;
        
        // Update factory settings
        if (this.bubbleFactory && this.bubbleFactory.updateSettings) {
            this.bubbleFactory.updateSettings(newSettings);
        }
    }

    /**
     * Launch new bubbles
     * @param {number} duration - Duration of the sustained sound in milliseconds
     */
    launchBubble(duration = 250) {
        if (this.launchingBubble) return;
        
        this.launchingBubble = true;
        
        // Clean up old popped bubbles
        this.cleanupOldBubbles();
        
        // Generate unique cluster ID for this group
        const clusterId = `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create a cluster of bubbles with the cluster ID
        const newBubbles = this.bubbleFactory.createBubbleCluster(duration, clusterId);
        
        // Mark the newest bubbles
        newBubbles.forEach(bubble => {
            bubble.isNewest = true;
        });
        
        // Remove the newest flag from all other bubbles
        this.bubbles.forEach(b => b.isNewest = false);
        
        // Add to array
        this.bubbles.push(...newBubbles);
        
        setTimeout(() => {
            this.launchingBubble = false;
        }, 100);
    }
    
    /**
     * Clean up old popped bubbles to prevent array growth
     */
    cleanupOldBubbles() {
        const maxBubbles = this.settings.maxBubbles;
        
        if (this.bubbles.length > maxBubbles) {
            // First remove any fully faded popped bubbles
            const fadedCount = this.bubbles.filter(b => b.exploded && b.alpha <= 0.1).length;
            
            if (fadedCount > 0) {
                // Remove fully faded bubbles
                this.bubbles = this.bubbles.filter(b => !(b.exploded && b.alpha <= 0.1));
            } else if (this.bubbles.length > maxBubbles) {
                // Remove oldest popped bubbles first
                const poppedBubbles = this.bubbles.filter(b => b.exploded);
                
                if (poppedBubbles.length > 0) {
                    // Sort by id (oldest first)
                    poppedBubbles.sort((a, b) => a.id - b.id);
                    const oldestId = poppedBubbles[0].id;
                    this.bubbles = this.bubbles.filter(b => b.id !== oldestId);
                }
            }
        }
    }

    /**
     * Update all bubbles
     */
    updateBubbles(deltaTime) {
        // Track clusters that should pop
        const clustersToPopIds = new Set();
        
        // 1. Update positions and check for pop conditions
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const bubble = this.bubbles[i];
            if (!bubble.exploded) {
                const hasReachedPeak = bubble.update(this.settings.gravity);
                
                // Check for auto-pop at certain height
                let shouldAutoPop = false;
                
                // Check test bubble auto-pop condition first
                if (this.testBubbleManager && this.testBubbleManager.checkAutoPopCondition(bubble)) {
                    shouldAutoPop = true;
                } else {
                    // Regular auto-pop logic - only for bubbles that have had time to rise
                    // Use individual bubble's auto-pop height if available, otherwise use global setting
                    const bubbleAutoPopHeight = bubble.autoPopHeight || this.settings.autoPopHeight;
                    const autoPopY = this.ctx.canvas.height * bubbleAutoPopHeight;
                    if (bubble.y <= autoPopY && !bubble.hasReachedTarget && !bubble.markedForExplosion && bubble.age > 60) {
                        shouldAutoPop = true;
                    }
                }
                
                // If this bubble should pop, mark its entire cluster for popping
                if (shouldAutoPop && bubble.clusterId) {
                    clustersToPopIds.add(bubble.clusterId);
                }
                
                // Check for automatic cleanup of very old bubbles
                if (bubble.age > 800) { // Bubbles live a bit longer than fireworks
                    this.bubbles.splice(i, 1);
                    continue;
                }
                
                // Check if bubble went off screen (cleanup)
                if (bubble.y < -100 || 
                    bubble.x < -50 || 
                    bubble.x > this.ctx.canvas.width + 50 ||
                    bubble.y > this.ctx.canvas.height + 100) {
                    this.bubbles.splice(i, 1);
                    continue;
                }
            }
        }

        // 2. Pop entire clusters that reached the pop condition
        if (clustersToPopIds.size > 0) {
            for (const clusterId of clustersToPopIds) {
                this.popBubbleCluster(clusterId);
            }
        }

        // 3. Handle sequential pops for bubbles triggered by LOUD SOUNDS
        if (this.popInProgress && Date.now() >= this.timeNextPopIsAllowed) {
            this.popInProgress = false;
        }

        // 3.5. Handle sequential popping for bubbles marked by loud sounds (like fireworks)
        if (this.sequentialPopInProgress && Date.now() >= this.timeNextSequentialPopAllowed) {
            this.sequentialPopInProgress = false;
        }

        if (!this.sequentialPopInProgress) {
            // Only pop bubbles that were MARKED FOR POPPING by loud sounds
            for (let i = 0; i < this.bubbles.length; i++) { // Iterate in launch order (oldest first)
                const bubble = this.bubbles[i];
                if (bubble.markedForPop && !bubble.exploded) {
                    // Pop the individual bubble with sound and image effects
                    this.popBubble(bubble, true, true);
                    bubble.exploded = true;
                    bubble.markedForPop = false; // Clear the mark
                    this.sequentialPopInProgress = true;
                    this.timeNextSequentialPopAllowed = Date.now() + (this.settings.sequentialPopExplosionDelay || 400);
                    break; // Only one pop per frame for sequential effect
                }
            }
        }

        // 4. Update exploded bubbles (fade them out)
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const bubble = this.bubbles[i];
            if (bubble.exploded) {
                const isFullyFaded = bubble.updateAfterExplosion(deltaTime);
                if (isFullyFaded) {
                    this.bubbles.splice(i, 1);
                }
            }
        }
    }

    /**
     * Pop a specific bubble and create droplet particles
     * @param {Bubble} bubble - The bubble to pop
     * @param {boolean} playSound - Whether to play pop sound (default: false for cluster pops)
     * @param {boolean} createImage - Whether to create image effect (default: true)
     */
    popBubble(bubble, playSound = false, createImage = true) {
        if (!bubble || bubble.exploded) return;

        // Create bubble pop particle effect
        const popParticles = BubbleParticle.createBubblePopEffect(
            bubble.x, 
            bubble.y, 
            bubble.color, 
            bubble.size
        );
        
        // Add particles to particle manager
        if (this.particleManager && this.particleManager.addParticles) {
            this.particleManager.addParticles(popParticles);
        } else if (this.particleManager && this.particleManager.particles) {
            // Fallback: add directly to particles array
            this.particleManager.particles.push(...popParticles);
        }

        // Handle image explosion effect if images are available and requested
        if (createImage) {
            const imageSystem = (window.animationController && window.animationController.imageSystem) || window.imageSystem;
            
            if (imageSystem && imageSystem.imageManager && 
                imageSystem.imageManager.processedImages.size > 0) {
                
                try {
                    // Create image effect at bubble pop location and get the actual color used
                    // Pass null as color to let the image system use its dominant color
                    const actualImageColor = imageSystem.handleFireworkExplosion(
                        bubble.x,
                        bubble.y,
                        null, // Let image system choose dominant color
                        false, // Don't force firework color
                        bubble.selectedCustomImageId,
                        bubble.size || 1.0
                    );
                    
                    // Update bubble color to match the image color
                    if (actualImageColor) {
                        bubble.selectedImageColor = actualImageColor;
                        bubble.color = actualImageColor;
                    }
                } catch (error) {
                    console.warn('[BubbleManager] Image explosion failed:', error);
                }
            }
        }

        // Mark bubble as exploded
        bubble.exploded = true;
        bubble.alpha = 0.3; // Quick fade
        
        // Play pop sound only if requested and microphone is not active (to prevent audio feedback)
        if (playSound && window.audioManager && window.audioManager.soundEffects) {
            // Don't play sounds when microphone is active to prevent audio feedback
            const microphoneActive = window.audioManager.isActive;
            if (!microphoneActive) {
                window.audioManager.soundEffects.playBubblePopSound();
            }
        }
    }

    /**
     * Pop all bubbles in a cluster together
     * @param {string} clusterId - The ID of the cluster to pop
     */
    popBubbleCluster(clusterId) {
        if (!clusterId) return;

        // Find all bubbles in this cluster
        const clusterBubbles = this.bubbles.filter(bubble => 
            bubble.clusterId === clusterId && !bubble.exploded
        );

        if (clusterBubbles.length === 0) return;

        // Calculate the center point of the cluster for convergence
        let centerX = 0;
        let centerY = 0;
        clusterBubbles.forEach(bubble => {
            centerX += bubble.x;
            centerY += bubble.y;
        });
        centerX /= clusterBubbles.length;
        centerY /= clusterBubbles.length;

        // Start the convergence animation
        this.startClusterConvergence(clusterBubbles, centerX, centerY);
    }

    /**
     * Start the convergence animation for a cluster of bubbles
     * @param {Array} clusterBubbles - Bubbles in the cluster
     * @param {number} centerX - Center X coordinate
     * @param {number} centerY - Center Y coordinate
     */
    startClusterConvergence(clusterBubbles, centerX, centerY) {
        // Mark bubbles as converging
        clusterBubbles.forEach(bubble => {
            bubble.isConverging = true;
            bubble.convergenceTarget = { x: centerX, y: centerY };
            bubble.convergenceStartTime = Date.now();
            bubble.hasReachedConvergenceTarget = false;
        });

        // Set up the convergence completion check
        const convergenceCheckInterval = setInterval(() => {
            // Check if all bubbles have reached the convergence target
            const allReachedTarget = clusterBubbles.every(bubble => 
                bubble.exploded || bubble.hasReachedConvergenceTarget
            );
            
            // Also check for timeout (max 1 second to match faster convergence)
            const timeElapsed = Date.now() - clusterBubbles[0].convergenceStartTime;
            const timeoutReached = timeElapsed >= 1000;
            
            // Check if any bubbles have been manually exploded
            const anyExploded = clusterBubbles.some(bubble => bubble.exploded);

            if (allReachedTarget || timeoutReached || anyExploded) {
                clearInterval(convergenceCheckInterval);
                this.completeClusterConvergence(clusterBubbles, centerX, centerY);
            }
        }, 50); // Check every 50ms for smoother timing
    }

    /**
     * Complete the cluster convergence and create the explosion effect
     * @param {Array} clusterBubbles - Bubbles in the cluster
     * @param {number} centerX - Center X coordinate
     * @param {number} centerY - Center Y coordinate
     */
    completeClusterConvergence(clusterBubbles, centerX, centerY) {
        // First, create the image effect and get the dominant color
        let dominantColor = null;
        const imageSystem = (window.animationController && window.animationController.imageSystem) || window.imageSystem;
        
        if (imageSystem && imageSystem.imageManager && 
            imageSystem.imageManager.processedImages.size > 0 && clusterBubbles.length > 0) {
            
            try {
                // Use the first bubble's properties for the image
                const firstBubble = clusterBubbles[0];
                
                // Create image effect and get the actual dominant color used
                dominantColor = imageSystem.handleFireworkExplosion(
                    centerX,
                    centerY,
                    null, // Let image system choose dominant color
                    false, // Don't force color
                    firstBubble.selectedCustomImageId,
                    firstBubble.size || 1.0
                );
            } catch (error) {
                console.warn('[BubbleManager] Cluster image explosion failed:', error);
            }
        }

        // Now pop all bubbles in the cluster using the dominant color
        clusterBubbles.forEach(bubble => {
            if (bubble.exploded) return; // Skip already exploded bubbles
            
            // Update bubble color to dominant color if available
            if (dominantColor) {
                bubble.selectedImageColor = dominantColor;
                bubble.color = dominantColor;
            }
            
            // Create particle effects for each bubble using the updated color
            // Use the center point for all particles to create a unified explosion
            const popParticles = BubbleParticle.createBubblePopEffect(
                centerX, 
                centerY, 
                bubble.color, // Now uses the dominant color
                bubble.size
            );
            
            // Add particles to particle manager
            if (this.particleManager && this.particleManager.addParticles) {
                this.particleManager.addParticles(popParticles);
            } else if (this.particleManager && this.particleManager.particles) {
                this.particleManager.particles.push(...popParticles);
            }
            
            bubble.exploded = true;
            bubble.alpha = 0.3;
            bubble.isConverging = false; // Stop convergence animation
            
            // Clean up test bubble tracking if applicable
            if (this.testBubbleManager && bubble.isTestBubble) {
                this.testBubbleManager.cleanupTestBubble(bubble.id);
            }
        });

        // Play a single pop sound for the entire cluster (only if microphone is not active)
        if (window.audioManager && window.audioManager.soundEffects) {
            // Don't play sounds when microphone is active to prevent audio feedback
            const microphoneActive = window.audioManager.isActive;
            if (!microphoneActive) {
                window.audioManager.soundEffects.playBubblePopSound();
            }
        }
    }

    /**
     * Draw all bubbles
     */
    drawBubbles() {
        // Draw all bubbles (including exploded ones that are still fading)
        this.bubbles.forEach(bubble => {
            if (!bubble.exploded || bubble.alpha > 0) {
                bubble.draw(this.ctx, this.colorManager);
            }
        });
    }

    /**
     * Launch a test bubble
     */
    async launchTestBubble() {
        if (this.testBubbleManager) {
            await this.testBubbleManager.launchTestBubble();
        } else {
            // Try to initialize test bubble manager one more time
            this.initializeTestBubbleManager();
            
            // Fallback to simple test bubble if test manager not ready
            const testClusterId = `test_cluster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const testBubble = this.bubbleFactory.createSingleBubble(250);
            testBubble.isNewest = true;
            testBubble.clusterId = testClusterId;
            
            // Remove newest flag from other bubbles
            this.bubbles.forEach(b => b.isNewest = false);
            
            // Add to bubbles array
            this.bubbles.push(testBubble);
            
            // Play launch sound if available and microphone is not active (to prevent audio feedback)
            const microphoneActive = window.audioManager?.isActive;
            if (window.audioManager && window.audioManager.soundEffects && !microphoneActive) {
                await window.audioManager.soundEffects.playBubbleLaunchSound();
            }
        }
    }

    /**
     * Mark the oldest active bubble for popping (called when loud sound is detected)
     * This follows the same pattern as fireworks for sequential order-based popping
     */
    popAllBubbles() {
        if (Date.now() < this.timeNextLoudSoundTriggerAllowed) {
            return; // Cooldown active for this action, ignore rapid calls
        }

        // Find the oldest unexploded bubble that hasn't been marked yet
        for (let i = 0; i < this.bubbles.length; i++) { // Iterate from oldest to newest
            const bubble = this.bubbles[i];
            if (!bubble.exploded && !bubble.markedForPop) {
                // Force stop any ongoing convergence animation for this bubble
                if (bubble.isConverging) {
                    bubble.isConverging = false;
                    bubble.hasReachedConvergenceTarget = true;
                }
                
                bubble.markedForPop = true; // Mark for sequential popping
                
                // Update timestamp for the next allowed trigger for this specific action
                this.timeNextLoudSoundTriggerAllowed = Date.now() + (this.settings.loudSoundTriggerCooldown || 250);

                // If a sequential pop was in progress but its cooldown has passed,
                // reset the flag to allow the main loop to potentially start this pop sooner.
                if (this.sequentialPopInProgress && Date.now() >= this.timeNextSequentialPopAllowed) {
                    this.sequentialPopInProgress = false;
                }
                break; // Important: Only mark one bubble per loud sound
            }
        }
    }

    /**
     * Update canvas dimensions
     * @param {number} width - New canvas width
     * @param {number} height - New canvas height
     */
    updateCanvasDimensions(width, height) {
        if (this.bubbleFactory && this.bubbleFactory.updateCanvasDimensions) {
            this.bubbleFactory.updateCanvasDimensions(width, height);
        }
    }

    /**
     * Get the number of active (unpopped) bubbles
     * @returns {number} Number of active bubbles
     */
    getActiveBubbleCount() {
        return this.bubbles.filter(bubble => !bubble.exploded).length;
    }

    /**
     * Clear all bubbles
     */
    clearAllBubbles() {
        this.bubbles = [];
    }
}

export default BubbleManager; 