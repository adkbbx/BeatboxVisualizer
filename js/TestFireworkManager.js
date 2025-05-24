/**
 * TestFireworkManager handles test button fireworks that auto-explode at target
 */
import SoundEffects from './SoundEffects.js';

class TestFireworkManager {
    constructor(fireworkManager) {
        this.fireworkManager = fireworkManager;
        this.testFireworks = new Set(); // Track test fireworks by ID
        this.soundEffects = new SoundEffects();
        this.soundEnabled = true; // Can be toggled
    }

    /**
     * Launch a test firework that will auto-explode at its target height
     */
    async launchTestFirework() {
        // Prevent launching if already at max capacity
        if (this.fireworkManager.fireworks.length >= this.fireworkManager.settings.maxFireworks) {
            return;
        }

        // Clean up old fireworks first
        this.fireworkManager.cleanupOldFireworks();

        // Use firework factory to calculate launch parameters with medium duration
        const duration = 500; // Medium duration for consistent height
        const params = this.fireworkManager.fireworkFactory.calculateLaunchParameters(duration);
        
        // Get color and image
        const { fireworkColor, selectedCustomImageId } = this.fireworkManager.fireworkFactory.getFireworkColor();
        
        // Create the firework
        const firework = this.fireworkManager.fireworkFactory.createFirework(
            params.startX, params.startY,
            params.targetX, params.targetY,
            fireworkColor
        );
        
        // Set properties
        firework.isNewest = true;
        firework.selectedImageColor = fireworkColor;
        firework.selectedCustomImageId = selectedCustomImageId;
        firework.isTestFirework = true; // Mark as test firework
        
        // Add to tracking
        this.testFireworks.add(firework.id);
        
        // Add to fireworks array
        this.fireworkManager.fireworks.push(firework);
        
        // Play launch sound if enabled
        if (this.soundEnabled && this.soundEffects) {
            await this.soundEffects.playLaunchSound();
        }
        
    }

    /**
     * Check if a firework should auto-explode (called during update loop)
     * @param {Firework} firework - The firework to check
     * @returns {boolean} - Whether the firework should explode
     */
    shouldAutoExplode(firework) {
        // Only auto-explode test fireworks
        if (!firework.isTestFirework || !this.testFireworks.has(firework.id)) {
            return false;
        }

        // Check if firework has reached its peak (when velocity.y becomes positive)
        // This is when the firework starts falling
        return firework.velocity.y >= 0;
    }

    /**
     * Clean up test firework tracking after explosion
     * @param {string} fireworkId - The ID of the exploded firework
     */
    async cleanupTestFirework(fireworkId) {
        if (this.testFireworks.has(fireworkId)) {
            this.testFireworks.delete(fireworkId);
            
            // Play burst sound if this was a test firework
            if (this.soundEnabled && this.soundEffects) {
                await this.soundEffects.playBurstSound();
            }
        }
    }

    /**
     * Clear all test firework tracking
     */
    clearAllTracking() {
        this.testFireworks.clear();
    }

    /**
     * Toggle sound effects on/off
     */
    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
    }

    /**
     * Set volume for sound effects (0-1)
     */
    setSoundVolume(volume) {
        if (this.soundEffects) {
            this.soundEffects.setVolume(volume);
        }
    }
}

export default TestFireworkManager;
