/**
 * TestBubbleManager handles test button bubbles that auto-pop at target height
 */
class TestBubbleManager {
    constructor(bubbleManager, soundEffects) {
        this.bubbleManager = bubbleManager;
        this.soundEffects = soundEffects;
        this.soundEnabled = true;
        this.soundVolume = 0.5;
        
        // Track test bubbles using Map (id -> bubble object)
        this.testBubbles = new Map();
    }

    /**
     * Update sound effects reference (called when audio manager is initialized)
     */
    updateSoundEffects(soundEffects) {
        this.soundEffects = soundEffects;
    }

    /**
     * Launch a test bubble with cluster appearance
     */
    async launchTestBubble() {
        if (!this.bubbleManager) {
            console.error('[TestBubbleManager] BubbleManager not available');
            return;
        }

        try {
            // Play launch sound if enabled (test bubbles always play sound since they're manually triggered)
            if (this.soundEnabled) {
                if (this.soundEffects) {
                    await this.soundEffects.playBubbleLaunchSound();
                } else {
                    // Try to get sound effects from global audio manager
                    const soundEffects = window.audioManager?.soundEffects;
                    if (soundEffects) {
                        this.updateSoundEffects(soundEffects);
                        await soundEffects.playBubbleLaunchSound();
                    } else {
                        console.warn('[TestBubbleManager] No sound effects available for launch sound');
                    }
                }
            }

            // Create test bubble using the new single bubble approach
            this.createTestBubble();

        } catch (error) {
            console.error('[TestBubbleManager] Error launching test bubble:', error);
        }
    }

    /**
     * Auto-pop test bubbles that haven't popped naturally (REMOVED - now purely height-based)
     */
    async autoPopTestBubbles(testBubbles) {
        // This method is no longer used - bubbles pop purely based on height
    }

    /**
     * Check if any test bubble should auto-pop based on height (simplified for single bubbles)
     */
    checkAutoPopCondition() {
        if (this.testBubbles.size === 0) {
            return; // No test bubbles to check
        }

        const canvasHeight = this.bubbleManager.ctx.canvas.height;

        // Check each test bubble individually using their individual autoPopHeight
        for (const testBubble of this.testBubbles.values()) {
            if (testBubble.exploded || testBubble.hasReachedAutoPopHeight) {
                continue;
            }

            // Use the bubble's individual autoPopHeight (which may be randomized)
            const bubbleAutoPopHeight = testBubble.autoPopHeight || this.bubbleManager.settings.autoPopHeight || 0.15;
            
            // FIXED: Invert the calculation so higher percentage = higher in sky (lower Y value)
            // 100% = top of screen (Y = 0), 10% = near bottom (Y = 90% of canvas height)
            const targetHeight = canvasHeight * (1 - bubbleAutoPopHeight);

            // Check if bubble has reached its individual target height
            if (testBubble.y <= targetHeight) {
                // Mark as reached to prevent multiple triggers
                testBubble.hasReachedAutoPopHeight = true;
                
                // Pop the bubble immediately
                this.bubbleManager.popTestBubbleClusterImmediately(testBubble.clusterId);
            }
        }
    }

    /**
     * Clean up test bubble tracking after popping
     */
    async cleanupTestBubble(bubbleId) {
        if (this.testBubbles.has(bubbleId)) {
            this.testBubbles.delete(bubbleId);
            
            // Play pop sound if this was a test bubble (test bubbles always play sound since they're manually triggered)
            if (this.soundEnabled) {
                if (this.soundEffects) {
                    try {
                        await this.soundEffects.playBubblePopSound();
                    } catch (error) {
                        console.error('[TestBubbleManager] Error playing pop sound:', error);
                    }
                } else {
                    // Try to get sound effects from global audio manager
                    const soundEffects = window.audioManager?.soundEffects;
                    if (soundEffects) {
                        this.updateSoundEffects(soundEffects);
                        try {
                            await soundEffects.playBubblePopSound();
                        } catch (error) {
                            console.error('[TestBubbleManager] Error playing pop sound:', error);
                        }
                    } else {
                        console.warn('[TestBubbleManager] No sound effects available for pop sound');
                    }
                }
            }
        }
    }

    /**
     * Clear all test bubble tracking
     */
    clearTestBubbles() {
        this.testBubbles.clear();
    }

    /**
     * Set whether test sounds are enabled
     */
    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
    }

    /**
     * Set test sound volume
     */
    setSoundVolume(volume) {
        this.soundVolume = Math.max(0, Math.min(1, volume));
    }

    /**
     * Get the number of active test bubbles
     */
    getActiveTestBubbleCount() {
        return this.testBubbles.size;
    }

    /**
     * Create a test bubble (now single bubble with cluster appearance)
     */
    createTestBubble() {
        if (!this.bubbleManager || !this.bubbleManager.bubbleFactory) {
            console.error('[TestBubbleManager] BubbleManager or BubbleFactory not available');
            return;
        }

        // Generate unique cluster ID
        const clusterId = `test_cluster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create single bubble with cluster appearance
        const bubbles = this.bubbleManager.bubbleFactory.createBubbleCluster(250, clusterId);
        
        if (bubbles && bubbles.length > 0) {
            const bubble = bubbles[0]; // Single bubble with cluster appearance
            
            // Mark as test bubble
            bubble.isTestBubble = true;
            bubble.hasReachedAutoPopHeight = false;
            
            // Determine auto-pop height for test bubbles (using settings panel values)
            let autoPopHeight = this.bubbleManager.settings.autoPopHeight || 0.15;
            
            // Apply random pop height if enabled
            if (this.bubbleManager.settings.randomPopHeight) {
                const minHeight = this.bubbleManager.settings.randomPopHeightMin || 0.1;
                const maxHeight = this.bubbleManager.settings.randomPopHeightMax || 0.4;
                autoPopHeight = minHeight + Math.random() * (maxHeight - minHeight);
            }
            
            // Set auto-pop height
            bubble.autoPopHeight = autoPopHeight;
            
            // Add to bubble manager
            this.bubbleManager.bubbles.push(bubble);
            
            // Track the test bubble
            this.testBubbles.set(bubble.id, bubble);
        }
    }
}

export default TestBubbleManager; 