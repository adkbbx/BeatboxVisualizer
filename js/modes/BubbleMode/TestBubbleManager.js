/**
 * TestBubbleManager handles test button bubbles that auto-pop at target height
 */
class TestBubbleManager {
    constructor(bubbleManager, soundEffects) {
        this.bubbleManager = bubbleManager;
        this.soundEffects = soundEffects;
        this.testBubbles = new Set(); // Track test bubbles by ID
        this.soundEnabled = true;
        this.soundVolume = 0.3;
    }

    /**
     * Update sound effects reference (called when audio manager is initialized)
     */
    updateSoundEffects(soundEffects) {
        this.soundEffects = soundEffects;
    }

    /**
     * Launch a test bubble that will auto-pop at its target height
     */
    async launchTestBubble() {
        if (!this.bubbleManager) {
            console.error('[TestBubbleManager] BubbleManager not available');
            return;
        }

        try {
            // Play launch sound if enabled and microphone is not active (to prevent audio feedback)
            const microphoneActive = window.audioManager?.isActive;
            if (this.soundEnabled && !microphoneActive) {
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

            // Generate unique cluster ID for test bubbles
            const testClusterId = `test_cluster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Create a test bubble cluster with the cluster ID
            const testBubbles = this.bubbleManager.bubbleFactory.createBubbleCluster(250, testClusterId);
            
            // Mark bubbles as test bubbles and set auto-pop behavior
            testBubbles.forEach(bubble => {
                bubble.isTestBubble = true; // Mark as test bubble
                bubble.autoPopHeight = 0.3; // Pop at 30% of screen height
                
                // Track this test bubble
                this.testBubbles.add(bubble.id);
            });

            // Add to bubble manager
            this.bubbleManager.bubbles.push(...testBubbles);

            // Set up auto-pop timer for test bubbles
            setTimeout(() => {
                this.autoPopTestBubbles(testBubbles);
            }, 1500); // Auto-pop after 1.5 seconds if not already popped

        } catch (error) {
            console.error('[TestBubbleManager] Error launching test bubble:', error);
        }
    }

    /**
     * Auto-pop test bubbles that haven't popped naturally
     */
    async autoPopTestBubbles(testBubbles) {
        // Find bubbles that haven't exploded yet
        const activeBubbles = testBubbles.filter(bubble => 
            !bubble.exploded && this.testBubbles.has(bubble.id)
        );
        
        if (activeBubbles.length > 0) {
            // Get the cluster ID from the first active bubble
            const clusterId = activeBubbles[0].clusterId;
            
            if (clusterId) {
                // Pop the entire cluster at once (this will create one image)
                this.bubbleManager.popBubbleCluster(clusterId);
            } else {
                // Fallback: pop individual bubbles without images
                for (const bubble of activeBubbles) {
                    this.bubbleManager.popBubble(bubble, false, false);
                    bubble.exploded = true;
                    await this.cleanupTestBubble(bubble.id);
                }
            }
        }
    }

    /**
     * Check if a bubble should auto-pop (called during bubble updates)
     */
    checkAutoPopCondition(bubble) {
        // Only auto-pop test bubbles that have existed for a while
        if (!bubble.isTestBubble || !this.testBubbles.has(bubble.id) || bubble.age < 60) {
            return false;
        }

        // Check if bubble has reached auto-pop height
        const autoPopY = this.bubbleManager.ctx.canvas.height * (bubble.autoPopHeight || 0.3);
        return bubble.y <= autoPopY;
    }

    /**
     * Clean up test bubble tracking after popping
     */
    async cleanupTestBubble(bubbleId) {
        if (this.testBubbles.has(bubbleId)) {
            this.testBubbles.delete(bubbleId);
            
            // Play pop sound if this was a test bubble and microphone is not active (to prevent audio feedback)
            const microphoneActive = window.audioManager?.isActive;
            if (this.soundEnabled && !microphoneActive) {
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
}

export default TestBubbleManager; 