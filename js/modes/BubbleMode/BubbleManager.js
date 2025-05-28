import BubbleFactory from './BubbleFactory.js';
import BubbleParticle from './BubbleParticle.js';
import TestBubbleManager from './TestBubbleManager.js';
import { DEFAULT_SETTINGS } from '../../settings/DefaultSettings.js';

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
        
        // Store settings using default bubble settings
        this.settings = { ...DEFAULT_SETTINGS.bubbles, ...initialBubbleSettings };
        
        // Initialize bubble factory with settings
        this.bubbleFactory = new BubbleFactory(
            this.colorManager,
            this.ctx.canvas.width,
            this.ctx.canvas.height,
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
     * @param {Object} newSettings - New settings to apply
     */
    updateSettings(newSettings) {
        // Merge new settings with existing ones
        this.settings = { ...this.settings, ...newSettings };
        
        // Update bubble factory settings
        if (this.bubbleFactory) {
            this.bubbleFactory.updateSettings(this.settings);
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
        
        // Check test bubble auto-pop condition once per frame
        if (this.testBubbleManager) {
            this.testBubbleManager.checkAutoPopCondition();
        }
        
        // 1. Update positions and check for pop conditions
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const bubble = this.bubbles[i];
            if (!bubble.exploded) {
                const hasReachedPeak = bubble.update(this.settings.gravity);
                
                // Regular bubbles should NOT auto-pop - they should float away naturally
                // Only test bubbles auto-pop at specific heights
                
                // Check for automatic cleanup of very old bubbles
                if (bubble.age > 800) { // Bubbles live a bit longer than fireworks
                    this.bubbles.splice(i, 1);
                    continue;
                }
                
                // Check if bubble went off screen (cleanup) - more generous bounds for natural floating
                if (bubble.y < -150 || // Allow bubbles to float higher off-screen
                    bubble.x < -100 || 
                    bubble.x > this.ctx.canvas.width + 100 ||
                    bubble.y > this.ctx.canvas.height + 100) {
                    this.bubbles.splice(i, 1);
                    continue;
                }
            }
        }

        // 2. Pop entire clusters that reached the pop condition (only test bubbles now)
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
            // Check for bubbles marked for cluster popping by loud sounds
            const clustersToPopByLoudSound = new Set();
            
            for (let i = 0; i < this.bubbles.length; i++) { // Iterate in launch order (oldest first)
                const bubble = this.bubbles[i];
                if (bubble.markedForClusterPop && !bubble.exploded && bubble.clusterId) {
                    clustersToPopByLoudSound.add(bubble.clusterId);
                    break; // Only process one cluster per frame for sequential effect
                }
            }

            // Pop the first cluster found
            if (clustersToPopByLoudSound.size > 0) {
                const clusterIdToPop = Array.from(clustersToPopByLoudSound)[0];
                
                // Clear the markedForClusterPop flag for all bubbles in this cluster
                this.bubbles.forEach(bubble => {
                    if (bubble.clusterId === clusterIdToPop) {
                        bubble.markedForClusterPop = false;
                    }
                });
                
                // Pop the entire cluster (this will create only one image)
                this.popBubbleCluster(clusterIdToPop);
                
                this.sequentialPopInProgress = true;
                this.timeNextSequentialPopAllowed = Date.now() + (this.settings.sequentialPopExplosionDelay || 400);
            }

            // Fallback: Handle any remaining individual bubbles marked for popping (legacy behavior)
            if (clustersToPopByLoudSound.size === 0) {
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
     * Pop all bubbles in a cluster together (updated for single bubble with visual cluster)
     * @param {string} clusterId - The ID of the cluster to pop
     */
    popBubbleCluster(clusterId) {
        if (!clusterId) return;

        // Find the single bubble with this cluster ID (new system)
        const bubble = this.bubbles.find(b => b.clusterId === clusterId && !b.exploded);

        if (bubble) {
            // Pop the bubble immediately - no convergence animation needed
            this.popBubble(bubble, false, true);
            bubble.exploded = true;
            
            // Clean up test bubble tracking if applicable
            if (this.testBubbleManager && bubble.isTestBubble) {
                this.testBubbleManager.cleanupTestBubble(bubble.id);
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
            
            // Play launch sound if available (test bubbles always play sound since they're manually triggered)
            if (window.audioManager && window.audioManager.soundEffects) {
                await window.audioManager.soundEffects.playBubbleLaunchSound();
            }
        }
    }

    /**
     * Mark the oldest active cluster for popping (called when loud sound is detected)
     * This will pop entire clusters to ensure only one image per cluster
     */
    popAllBubbles() {
        if (Date.now() < this.timeNextLoudSoundTriggerAllowed) {
            return; // Cooldown active for this action, ignore rapid calls
        }

        // Find the oldest unexploded bubble that hasn't been marked yet and is still in a reasonable position
        let oldestBubble = null;
        for (let i = 0; i < this.bubbles.length; i++) { // Iterate from oldest to newest
            const bubble = this.bubbles[i];
            
            // Skip bubbles that are exploded, already marked, or too high up (likely floating off-screen)
            if (bubble.exploded || bubble.markedForPop || bubble.markedForClusterPop) {
                continue;
            }
            
            // Skip bubbles that are too high up (likely floating off-screen and should be ignored)
            const topThreshold = this.ctx.canvas.height * 0.1; // Top 10% of screen
            if (bubble.y < topThreshold) {
                continue;
            }
            
            oldestBubble = bubble;
            break; // Found the oldest available bubble
        }

        if (oldestBubble && oldestBubble.clusterId) {
            // Find all bubbles in the same cluster as the oldest bubble
            const clusterBubbles = this.bubbles.filter(bubble => 
                bubble.clusterId === oldestBubble.clusterId && 
                !bubble.exploded && 
                !bubble.markedForPop && 
                !bubble.markedForClusterPop
            );

            if (clusterBubbles.length > 0) {
                // Mark all bubbles in this cluster for cluster popping
                clusterBubbles.forEach(bubble => {
                    bubble.markedForClusterPop = true;
                });

                // Update timestamp for the next allowed trigger for this specific action
                this.timeNextLoudSoundTriggerAllowed = Date.now() + (this.settings.loudSoundTriggerCooldown || 250);
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

    /**
     * Pop a test bubble cluster immediately (simplified for single bubble with cluster appearance)
     * @param {string} clusterId - ID of the cluster to pop
     */
    popTestBubbleClusterImmediately(clusterId) {
        // Find the single bubble with this cluster ID
        const bubble = this.bubbles.find(b => b.clusterId === clusterId && !b.exploded);
        
        if (bubble) {
            // Pop the bubble immediately - no cluster convergence needed
            this.popBubble(bubble, false, true);
            bubble.exploded = true;
            
            // Clean up test bubble tracking
            if (this.testBubbleManager && bubble.isTestBubble) {
                this.testBubbleManager.cleanupTestBubble(bubble.id);
            }
        }
    }
}

export default BubbleManager; 