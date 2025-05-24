/**
 * AudioAnalyzer handles real-time audio analysis
 */
class AudioAnalyzer {
    constructor(audioContext, analyser, dataArray, initialSettings = null) {
        this.audioContext = audioContext;
        this.analyser = analyser;
        this.dataArray = dataArray;
        
        // Configuration - Default values if not overridden by initialSettings
        this._sensitivity = 1.5;
        this._quietThreshold = 0.06;
        this._loudThreshold = 0.4;
        this._suddenSoundThreshold = 0.15;
        this._noiseFloor = 0.04; // Remains a default, not typically in settings panel

        if (initialSettings) {
            if (initialSettings.sensitivity !== undefined) this._sensitivity = initialSettings.sensitivity;
            if (initialSettings.quietThreshold !== undefined) this._quietThreshold = initialSettings.quietThreshold;
            if (initialSettings.loudThreshold !== undefined) this._loudThreshold = initialSettings.loudThreshold;
            if (initialSettings.suddenSoundThreshold !== undefined) this._suddenSoundThreshold = initialSettings.suddenSoundThreshold;
        }
        
        // State tracking
        this.volumeLevel = 0;
        this.lastVolume = 0;
    }
    
    /**
     * Load settings from localStorage if available
     */
    loadSettingsFromStorage() {
        try {
            const savedSettings = localStorage.getItem('vibecoding-settings');
            if (savedSettings) {
                const parsedSettings = JSON.parse(savedSettings);
                
                // Apply saved settings
                if (parsedSettings.sensitivity !== undefined) this._sensitivity = parsedSettings.sensitivity;
                if (parsedSettings.quietThreshold !== undefined) this._quietThreshold = parsedSettings.quietThreshold;
                if (parsedSettings.loudThreshold !== undefined) this._loudThreshold = parsedSettings.loudThreshold;
                if (parsedSettings.suddenSoundThreshold !== undefined) this._suddenSoundThreshold = parsedSettings.suddenSoundThreshold;
            }
        } catch (error) {
        }
    }
    
    // Getters for settings
    get sensitivity() { return this._sensitivity; }
    get quietThreshold() { return this._quietThreshold; }
    get loudThreshold() { return this._loudThreshold; }
    get suddenSoundThreshold() { return this._suddenSoundThreshold; }
    get noiseFloor() { return this._noiseFloor; }
    
    // Setters for settings
    set sensitivity(value) { 
        this._sensitivity = Math.max(0, Math.min(3, value));
    }
    
    set quietThreshold(value) {
        this._quietThreshold = Math.max(0, Math.min(value, this._loudThreshold * 0.9));
    }
    
    set loudThreshold(value) {
        this._loudThreshold = Math.max(this._quietThreshold * 1.1, Math.min(1, value));
    }
    
    set suddenSoundThreshold(value) {
        this._suddenSoundThreshold = Math.max(0.05, Math.min(0.5, value));
    }
    
    /**
     * Analyze audio data and calculate volume levels
     */
    analyze() {
        if (!this.analyser || !this.dataArray) {
            return { volume: 0, category: 'quiet', delta: 0 };
        }
        
        // Get audio data
        this.analyser.getByteFrequencyData(this.dataArray);
        
        // Calculate volume level
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
        }
        
        // Normalize and apply sensitivity
        let rawVolumeLevel = sum / (this.dataArray.length * 255);
        this.volumeLevel = Math.min(1, rawVolumeLevel * this._sensitivity);
        
        // Apply noise floor
        if (this.volumeLevel < this._noiseFloor) {
            this.volumeLevel = 0;
        }
        
        // Calculate volume delta (for sudden sound detection)
        const volumeDelta = this.volumeLevel - this.lastVolume;
        
        // Determine volume category
        let volumeCategory = 'normal';
        if (this.volumeLevel <= this._quietThreshold) {
            volumeCategory = 'quiet';
        } else if (this.volumeLevel >= this._loudThreshold) {
            volumeCategory = 'loud';
        }
        
        // Save current volume for next comparison
        this.lastVolume = this.volumeLevel;
        
        // Return analysis results
        return {
            volume: this.volumeLevel,
            category: volumeCategory,
            delta: volumeDelta
        };
    }
    
    /**
     * Check if current sound is a sudden sound
     */
    isSuddenSound(volumeLevel, volumeDelta) {
        return volumeLevel > this._quietThreshold && volumeDelta > this._suddenSoundThreshold;
    }
    
    /**
     * Update analyzer settings
     */
    updateSettings(settings) {
        // Update individual settings if provided
        if (settings.sensitivity !== undefined) {
            this.sensitivity = settings.sensitivity;
        }
        
        if (settings.quietThreshold !== undefined) {
            this.quietThreshold = settings.quietThreshold;
        }
        
        if (settings.loudThreshold !== undefined) {
            this.loudThreshold = settings.loudThreshold;
        }
        
        if (settings.suddenSoundThreshold !== undefined) {
            this.suddenSoundThreshold = settings.suddenSoundThreshold;
        }
    }
    
    /**
     * Get current settings
     */
    getSettings() {
        return {
            sensitivity: this._sensitivity,
            quietThreshold: this._quietThreshold,
            loudThreshold: this._loudThreshold,
            suddenSoundThreshold: this._suddenSoundThreshold,
            noiseFloor: this._noiseFloor
        };
    }
}

export default AudioAnalyzer;