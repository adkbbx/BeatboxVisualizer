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
            console.log('[AudioManager] Starting initialization...');
            console.log('[AudioManager] Current state:', {
                contextExists: !!this.audioContext,
                microphoneExists: !!this.microphone,
                analyserExists: !!this.analyser,
                isActive: this.isActive
            });
            
            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            
            // Check if we already have an audio context
            if (this.audioContext) {
                console.log('[AudioManager] Audio context already exists, state:', this.audioContext.state);
                if (this.audioContext.state === 'suspended') {
                    console.log('[AudioManager] Resuming existing audio context...');
                    await this.audioContext.resume();
                    console.log('[AudioManager] Audio context resumed, new state:', this.audioContext.state);
                }
            } else {
                console.log('[AudioManager] Creating new AudioContext...');
                this.audioContext = new AudioContext();
                console.log('[AudioManager] New AudioContext created, state:', this.audioContext.state);
                
                // Resume audio context if suspended
                if (this.audioContext.state === 'suspended') {
                    console.log('[AudioManager] Resuming new audio context...');
                    await this.audioContext.resume();
                    console.log('[AudioManager] Audio context resumed, new state:', this.audioContext.state);
                }
            }
            
            // Only request microphone access if we don't already have it
            if (!this.microphone) {
                console.log('[AudioManager] Requesting microphone access...');
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    }
                });
                console.log('[AudioManager] Microphone access granted');
                
                // Create audio processing chain
                console.log('[AudioManager] Creating audio processing chain...');
                this.microphone = this.audioContext.createMediaStreamSource(stream);
                this.analyser = this.audioContext.createAnalyser();
                this.analyser.fftSize = 1024;
                this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
                this.microphone.connect(this.analyser);
                console.log('[AudioManager] Audio processing chain created, analyzer bin count:', this.analyser.frequencyBinCount);
            } else {
                console.log('[AudioManager] Reusing existing microphone and analyzer');
            }
            
            console.log('[AudioManager] Initialization complete, resources ready');
            return true;
        } catch (error) {
            console.error('[AudioManager] Error initializing audio:', error);
            console.error('[AudioManager] Stack trace:', error.stack);
            return false;
        }
    }
    
    /**
     * Start audio analysis
     */
    start() {
        console.log('[AudioManager] Starting audio analysis...');
        
        if (!this.audioContext || !this.analyser) {
            console.error('[AudioManager] Cannot start - not initialized', {
                contextExists: !!this.audioContext,
                analyserExists: !!this.analyser
            });
            return false;
        }
        
        // Ensure audio context is running
        if (this.audioContext.state !== 'running') {
            console.log('[AudioManager] Audio context not running, resuming...');
            this.audioContext.resume()
                .then(() => console.log('[AudioManager] Audio context resumed successfully'))
                .catch(err => console.error('[AudioManager] Error resuming audio context:', err));
        }
        
        this.isActive = true;
        console.log('[AudioManager] Audio processing active, starting analyze loop');
        this.analyzeAudio();
        return true;
    }
    
    /**
     * Stop audio analysis completely
     */
    stop() {
        console.log('[AudioManager] Stopping audio analysis completely');
        console.log('[AudioManager] Current state before stopping:', {
            contextExists: !!this.audioContext,
            contextState: this.audioContext ? this.audioContext.state : 'none',
            microphoneExists: !!this.microphone,
            analyserExists: !!this.analyser,
            isActive: this.isActive
        });
        
        this.isActive = false;
        
        // Log that we've stopped but retained resources
        console.log('[AudioManager] Audio analysis stopped, resources retained for future use');
        return true;
    }
    
    /**
     * Pause audio analysis without clearing resources
     * This is used for temporary pauses like when opening settings
     */
    pause() {
        console.log('[AudioManager] Pausing audio analysis temporarily');
        console.log('[AudioManager] Current state before pausing:', {
            contextExists: !!this.audioContext,
            contextState: this.audioContext ? this.audioContext.state : 'none',
            microphoneExists: !!this.microphone,
            analyserExists: !!this.analyser,
            isActive: this.isActive
        });
        
        this.isActive = false;
        console.log('[AudioManager] Audio analysis paused, resources maintained');
        return true;
    }
    
    /**
     * Resume audio analysis after pause
     * This is used to resume after temporary pauses
     */
    resume() {
        console.log('[AudioManager] Attempting to resume audio analysis');
        console.log('[AudioManager] Current state before resuming:', {
            contextExists: !!this.audioContext,
            contextState: this.audioContext ? this.audioContext.state : 'none',
            microphoneExists: !!this.microphone,
            analyserExists: !!this.analyser,
            isActive: this.isActive
        });
        
        // Only resume if we have an initialized context
        if (this.audioContext && this.analyser) {
            // Make sure audio context is running
            if (this.audioContext.state !== 'running') {
                console.log('[AudioManager] Audio context not running, resuming...');
                this.audioContext.resume()
                    .then(() => console.log('[AudioManager] Audio context resumed successfully'))
                    .catch(err => console.error('[AudioManager] Error resuming audio context:', err));
            }
            
            this.isActive = true;
            console.log('[AudioManager] Audio analysis resumed, restarting analyze loop');
            this.analyzeAudio();
            return true;
        } else {
            console.error('[AudioManager] Cannot resume - missing required resources', {
                contextExists: !!this.audioContext,
                analyserExists: !!this.analyser
            });
            return false;
        }
    }
    
    /**
     * Main audio analysis loop
     */
    analyzeAudio() {
        if (!this.isActive) {
            console.log('[AudioManager] Analyze loop exiting - audio processing not active');
            return;
        }
        
        // Check if we still have all required resources
        if (!this.audioContext || !this.analyser || !this.dataArray) {
            console.error('[AudioManager] Analyze loop error - missing required resources', {
                contextExists: !!this.audioContext,
                analyserExists: !!this.analyser,
                dataArrayExists: !!this.dataArray
            });
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
        // Increased minimum volume to require more intentional sounds
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
        // Log the settings we're updating
        console.log('[AudioManager] Updating settings:', settings);
        
        const oldSettings = {
            sensitivity: this.sensitivity,
            quietThreshold: this.quietThreshold,
            loudThreshold: this.loudThreshold,
            suddenSoundThreshold: this.suddenSoundThreshold
        };
        
        // Update individual settings if provided
        if (settings.sensitivity !== undefined) {
            // Validate sensible range
            if (settings.sensitivity >= 0 && settings.sensitivity <= 3) {
                this.sensitivity = settings.sensitivity;
            } else {
                console.warn('[AudioManager] Sensitivity out of range, clamping:', settings.sensitivity);
                this.sensitivity = Math.max(0, Math.min(3, settings.sensitivity));
            }
        }
        
        if (settings.quietThreshold !== undefined) {
            // Validate sensible range and ensure it's less than loud threshold
            const validatedQuietThreshold = Math.max(0, Math.min(
                settings.quietThreshold, 
                this.loudThreshold * 0.9 // Keep it below loud threshold
            ));
            
            if (validatedQuietThreshold !== settings.quietThreshold) {
                console.warn('[AudioManager] Quiet threshold adjusted to remain below loud threshold');
            }
            
            this.quietThreshold = validatedQuietThreshold;
        }
        
        if (settings.loudThreshold !== undefined) {
            // Validate sensible range and ensure it's greater than quiet threshold
            const validatedLoudThreshold = Math.max(
                this.quietThreshold * 1.1, // Keep it above quiet threshold
                Math.min(1, settings.loudThreshold)
            );
            
            if (validatedLoudThreshold !== settings.loudThreshold) {
                console.warn('[AudioManager] Loud threshold adjusted to remain above quiet threshold');
            }
            
            this.loudThreshold = validatedLoudThreshold;
        }
        
        if (settings.suddenSoundThreshold !== undefined) {
            // Validate sensible range
            if (settings.suddenSoundThreshold >= 0.05 && settings.suddenSoundThreshold <= 0.5) {
                this.suddenSoundThreshold = settings.suddenSoundThreshold;
            } else {
                console.warn('[AudioManager] Sudden sound threshold out of range, clamping:', settings.suddenSoundThreshold);
                this.suddenSoundThreshold = Math.max(0.05, Math.min(0.5, settings.suddenSoundThreshold));
            }
        }
        
        // Log the changes that were made
        const newSettings = {
            sensitivity: this.sensitivity,
            quietThreshold: this.quietThreshold,
            loudThreshold: this.loudThreshold,
            suddenSoundThreshold: this.suddenSoundThreshold
        };
        
        // Log which values actually changed
        const changedSettings = {};
        let hasChanges = false;
        
        Object.keys(newSettings).forEach(key => {
            if (newSettings[key] !== oldSettings[key]) {
                changedSettings[key] = {
                    from: oldSettings[key],
                    to: newSettings[key]
                };
                hasChanges = true;
            }
        });
        
        if (hasChanges) {
            console.log('[AudioManager] Settings updated:', changedSettings);
        } else {
            console.log('[AudioManager] No settings were changed');
        }
    }
}

export default AudioManager;