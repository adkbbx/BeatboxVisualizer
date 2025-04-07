/**
 * AudioManager handles microphone access and real-time audio analysis
 */
class AudioManager {
    constructor() {
        this.audioContext = null;
        this.microphone = null;
        this.analyser = null;
        this.dataArray = null;
        this.isActive = false;
        
        // Callbacks
        this.volumeCallback = null;
        this.suddenSoundCallback = null;
        this.sustainedSoundCallback = null;
        this.sustainedSoundEndCallback = null;
        
        // Configuration
        this.sensitivity = 1.5; // Reduced sensitivity
        this.quietThreshold = 0.06; // Increased quiet threshold
        this.loudThreshold = 0.4; // Increased loud threshold
        this.suddenSoundThreshold = 0.15; // Increased sudden threshold
        this.sustainedSoundDuration = 400; // Longer duration required
        this.noiseFloor = 0.04; // Increased noise floor
        
        // State tracking
        this.volumeLevel = 0;
        this.lastVolume = 0;
        this.sustainedSoundStart = 0;
        this.isSustained = false;
        this.activeSustainedSounds = new Map();
        
        // Prevent multiple sustained sounds
        this.currentSustainedId = null;
        this.isProcessingSustained = false;
        
        // Debug mode
        this.debug = true;
    }
    
    /**
     * Initialize audio context and request microphone
     */
    async initialize() {
        try {
            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            
            // Check if we already have an audio context
            if (this.audioContext) {
                if (this.audioContext.state === 'suspended') {
                    await this.audioContext.resume();
                }
            } else {
                this.audioContext = new AudioContext();
                
                // Resume audio context if suspended
                if (this.audioContext.state === 'suspended') {
                    await this.audioContext.resume();
                }
            }
            
            // Only request microphone access if we don't already have it
            if (!this.microphone) {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    }
                });
                
                // Create audio processing chain
                this.microphone = this.audioContext.createMediaStreamSource(stream);
                this.analyser = this.audioContext.createAnalyser();
                this.analyser.fftSize = 1024;
                this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
                this.microphone.connect(this.analyser);
            }
            
            return true;
        } catch (error) {
            console.error('[AudioManager] Error initializing audio:', error);
            return false;
        }
    }
    
    /**
     * Start audio analysis
     */
    start() {
        if (!this.audioContext || !this.analyser) {
            console.error('[AudioManager] Cannot start - not initialized');
            return false;
        }
        
        // Ensure audio context is running
        if (this.audioContext.state !== 'running') {
            this.audioContext.resume()
                .catch(err => console.error('[AudioManager] Error resuming audio context:', err));
        }
        
        this.isActive = true;
        this.analyzeAudio();
        return true;
    }
    
    /**
     * Stop audio analysis completely
     */
    stop() {
        this.isActive = false;
        return true;
    }
    
    /**
     * Pause audio analysis without clearing resources
     */
    pause() {
        this.isActive = false;
        return true;
    }
    
    /**
     * Resume audio analysis after pause
     */
    resume() {
        // Only resume if we have an initialized context
        if (this.audioContext && this.analyser) {
            // Make sure audio context is running
            if (this.audioContext.state !== 'running') {
                this.audioContext.resume()
                    .catch(err => console.error('[AudioManager] Error resuming audio context:', err));
            }
            
            this.isActive = true;
            this.analyzeAudio();
            return true;
        } else {
            console.error('[AudioManager] Cannot resume - missing required resources');
            return false;
        }
    }
    
    /**
     * Main audio analysis loop
     */
    analyzeAudio() {
        if (!this.isActive) {
            return;
        }
        
        // Check if we still have all required resources
        if (!this.audioContext || !this.analyser || !this.dataArray) {
            console.error('[AudioManager] Missing required resources');
            this.isActive = false;
            return;
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
        this.volumeLevel = Math.min(1, rawVolumeLevel * this.sensitivity);
        
        // Apply noise floor
        if (this.volumeLevel < this.noiseFloor) {
            this.volumeLevel = 0;
        }
        
        // Determine volume category
        let volumeCategory = 'normal';
        if (this.volumeLevel <= this.quietThreshold) {
            volumeCategory = 'quiet';
        } else if (this.volumeLevel >= this.loudThreshold) {
            volumeCategory = 'loud';
            
            // Reset sustained state for loud sounds
            if (this.isSustained) {
                this.endAllSustainedSounds();
                this.isSustained = false;
            }
            
            // Call volume callback for loud sounds immediately
            if (this.volumeCallback) {
                this.volumeCallback(this.volumeLevel, volumeCategory);
            }
        }
        
        // Process other sound events if not a loud sound
        if (this.volumeLevel > this.noiseFloor && volumeCategory !== 'loud') {
            // Detect sudden sounds
            const volumeDelta = this.volumeLevel - this.lastVolume;
            if (this.volumeLevel > this.quietThreshold && volumeDelta > this.suddenSoundThreshold) {
                if (this.suddenSoundCallback) {
                    this.suddenSoundCallback(this.volumeLevel);
                }
            }
            
            // Process sustained sounds
            this.processSustainedSound();
        } else if (volumeCategory !== 'loud') {
            // Volume too low or loud sound detected
            if (this.isSustained) {
                this.endAllSustainedSounds();
                this.isSustained = false;
            }
            
            // Call volume callback for non-loud categories
            if (this.volumeCallback) {
                this.volumeCallback(this.volumeLevel, volumeCategory);
            }
        }
        
        // Save current volume
        this.lastVolume = this.volumeLevel;
        
        // Continue loop
        requestAnimationFrame(() => this.analyzeAudio());
    }
    
    /**
     * Process sustained sound detection
     */
    processSustainedSound() {
        // Only process if volume is in the sustained range
        if (this.volumeLevel < 0.12 || this.volumeLevel >= this.loudThreshold) {
            if (this.isSustained) {
                this.endAllSustainedSounds();
                this.isSustained = false;
            }
            return;
        }
        
        // Prevent multiple sustained events in quick succession
        if (this.isProcessingSustained) return;
        
        // Start tracking a new sustained sound
        if (!this.isSustained) {
            this.sustainedSoundStart = Date.now();
            this.isSustained = true;
        } 
        // Check if we've reached the duration threshold
        else if (this.currentSustainedId === null && 
                Date.now() - this.sustainedSoundStart > this.sustainedSoundDuration) {
            
            const duration = Date.now() - this.sustainedSoundStart;
            
            // Prevent race conditions
            this.isProcessingSustained = true;
            
            // Call callback if defined
            if (this.sustainedSoundCallback) {
                const sustainedId = this.sustainedSoundCallback(this.volumeLevel, duration);
                
                // Track this sustained sound if we got a valid ID
                if (sustainedId) {
                    this.currentSustainedId = sustainedId;
                    this.activeSustainedSounds.set(sustainedId, {
                        startTime: Date.now(),
                        lastUpdateTime: Date.now(),
                        volume: this.volumeLevel
                    });
                }
            }
            
            // Reset processing flag
            setTimeout(() => {
                this.isProcessingSustained = false;
            }, 100);
        } 
        // Update existing sustained sound
        else if (this.currentSustainedId && this.activeSustainedSounds.has(this.currentSustainedId)) {
            const soundData = this.activeSustainedSounds.get(this.currentSustainedId);
            soundData.lastUpdateTime = Date.now();
            soundData.volume = this.volumeLevel;
        }
    }
    
    /**
     * End all active sustained sounds
     */
    endAllSustainedSounds() {
        this.activeSustainedSounds.forEach((soundData, id) => {
            if (this.sustainedSoundEndCallback) {
                this.sustainedSoundEndCallback(id);
            }
        });
        
        this.activeSustainedSounds.clear();
        this.currentSustainedId = null;
    }
    
    /**
     * Set callback for volume changes
     */
    onVolumeChange(callback) {
        this.volumeCallback = callback;
    }
    
    /**
     * Set callback for sudden sounds
     */
    onSuddenSound(callback) {
        this.suddenSoundCallback = callback;
    }
    
    /**
     * Set callback for sustained sounds
     */
    onSustainedSound(callback) {
        this.sustainedSoundCallback = callback;
    }
    
    /**
     * Set callback for when sustained sounds end
     */
    onSustainedSoundEnd(callback) {
        this.sustainedSoundEndCallback = callback;
    }
    
    /**
     * Update audio settings
     */
    updateSettings(settings) {
        // Update individual settings if provided
        if (settings.sensitivity !== undefined) {
            // Validate sensible range
            this.sensitivity = Math.max(0, Math.min(3, settings.sensitivity));
        }
        
        if (settings.quietThreshold !== undefined) {
            // Validate sensible range and ensure it's less than loud threshold
            this.quietThreshold = Math.max(0, Math.min(
                settings.quietThreshold, 
                this.loudThreshold * 0.9 // Keep it below loud threshold
            ));
        }
        
        if (settings.loudThreshold !== undefined) {
            // Validate sensible range and ensure it's greater than quiet threshold
            this.loudThreshold = Math.max(
                this.quietThreshold * 1.1, // Keep it above quiet threshold
                Math.min(1, settings.loudThreshold)
            );
        }
        
        if (settings.suddenSoundThreshold !== undefined) {
            // Validate sensible range
            this.suddenSoundThreshold = Math.max(0.05, Math.min(0.5, settings.suddenSoundThreshold));
        }
    }
}

export default AudioManager;