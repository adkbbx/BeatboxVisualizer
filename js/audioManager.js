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
        this.sensitivity = 2.0;
        this.quietThreshold = 0.04;
        this.loudThreshold = 0.3;
        this.suddenSoundThreshold = 0.1;
        this.sustainedSoundDuration = 250;
        this.noiseFloor = 0.02;
        
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
            this.audioContext = new AudioContext();
            
            // Resume audio context if suspended
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            // Get microphone access
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
            
            console.log('Audio analyzer setup complete');
            return true;
        } catch (error) {
            console.error('Error initializing audio:', error);
            return false;
        }
    }
    
    /**
     * Start audio analysis
     */
    start() {
        if (!this.audioContext || !this.analyser) {
            console.error('AudioManager is not initialized');
            return false;
        }
        
        // Ensure audio context is running
        if (this.audioContext.state !== 'running') {
            this.audioContext.resume();
        }
        
        this.isActive = true;
        this.analyzeAudio();
        return true;
    }
    
    /**
     * Stop audio analysis
     */
    stop() {
        this.isActive = false;
        return true;
    }
    
    /**
     * Main audio analysis loop
     */
    analyzeAudio() {
        if (!this.isActive) return;
        
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
        
        // Log volume occasionally
        if (this.debug && Math.random() < 0.01) {
            console.log(`Raw volume: ${rawVolumeLevel.toFixed(4)} Adjusted volume: ${this.volumeLevel.toFixed(4)} Noise floor: ${this.noiseFloor}`);
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
                if (this.debug) {
                    console.log(`SUDDEN sound detected, delta: ${volumeDelta.toFixed(4)} level: ${this.volumeLevel.toFixed(4)}`);
                }
                
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
        if (this.volumeLevel < 0.1 || this.volumeLevel >= this.loudThreshold) {
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
            
            if (this.debug) {
                console.log(`SUSTAINED sound detected, duration: ${duration} level: ${this.volumeLevel.toFixed(4)}`);
            }
            
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
                    
                    if (this.debug) {
                        console.log(`New sustained sound tracked with ID: ${sustainedId}`);
                    }
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
            if (this.debug) {
                console.log(`Sustained sound ended, id: ${id}`);
            }
            
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
}

export default AudioManager; 