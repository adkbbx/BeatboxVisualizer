/**
 * SustainedSoundDetector handles detection of sustained sounds over time
 */
class SustainedSoundDetector {
    constructor() {
        // Configuration
        this.sustainedSoundDuration = 400; // Minimum duration in milliseconds
        this.sustainedSoundThreshold = 0.12; // Minimum volume for sustained sound
        this.loudThreshold = 0.4; // Maximum volume for sustained sound (above this is "loud")
        
        // State tracking
        this.sustainedSoundStart = 0;
        this.isSustained = false;
        this.activeSustainedSounds = new Map();
        this.currentSustainedId = null;
        this.isProcessingSustained = false;
    }
    
    /**
     * Process volume data to detect sustained sounds
     */
    processSustainedSound(volumeLevel, callback, endCallback) {
        // Only process if volume is in the sustained range
        if (volumeLevel < this.sustainedSoundThreshold || volumeLevel >= this.loudThreshold) {
            if (this.isSustained) {
                this.endAllSustainedSounds(endCallback);
                this.isSustained = false;
            }
            return null;
        }
        
        // Prevent multiple sustained events in quick succession
        if (this.isProcessingSustained) return null;
        
        // Start tracking a new sustained sound
        if (!this.isSustained) {
            this.sustainedSoundStart = Date.now();
            this.isSustained = true;
            return null;
        } 
        // Check if we've reached the duration threshold
        else if (this.currentSustainedId === null && 
                Date.now() - this.sustainedSoundStart > this.sustainedSoundDuration) {
            
            const duration = Date.now() - this.sustainedSoundStart;
            
            // Prevent race conditions
            this.isProcessingSustained = true;
            
            // Call callback if defined
            if (callback) {
                const sustainedId = callback(volumeLevel, duration);
                
                // Track this sustained sound if we got a valid ID
                if (sustainedId) {
                    this.currentSustainedId = sustainedId;
                    this.activeSustainedSounds.set(sustainedId, {
                        startTime: Date.now(),
                        lastUpdateTime: Date.now(),
                        volume: volumeLevel
                    });
                }
            }
            
            // Reset processing flag
            setTimeout(() => {
                this.isProcessingSustained = false;
            }, 100);
            
            return this.currentSustainedId;
        } 
        // Update existing sustained sound
        else if (this.currentSustainedId && this.activeSustainedSounds.has(this.currentSustainedId)) {
            const soundData = this.activeSustainedSounds.get(this.currentSustainedId);
            soundData.lastUpdateTime = Date.now();
            soundData.volume = volumeLevel;
            return this.currentSustainedId;
        }
        
        return null;
    }
    
    /**
     * End all active sustained sounds
     */
    endAllSustainedSounds(callback) {
        this.activeSustainedSounds.forEach((soundData, id) => {
            if (callback) {
                callback(id);
            }
        });
        
        this.activeSustainedSounds.clear();
        this.currentSustainedId = null;
    }
    
    /**
     * Reset state when loud sound is detected
     */
    resetForLoudSound(callback) {
        if (this.isSustained) {
            this.endAllSustainedSounds(callback);
            this.isSustained = false;
        }
    }
    
    /**
     * Update settings
     */
    updateSettings(settings) {
        if (settings.sustainedSoundDuration !== undefined) {
            this.sustainedSoundDuration = settings.sustainedSoundDuration;
        }
        
        if (settings.sustainedSoundThreshold !== undefined) {
            this.sustainedSoundThreshold = settings.sustainedSoundThreshold;
        }
        
        if (settings.loudThreshold !== undefined) {
            this.loudThreshold = settings.loudThreshold;
        }
    }
}

export default SustainedSoundDetector;