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
        this.volumeCallback = null;
        this.suddenSoundCallback = null;
        this.sustainedSoundCallback = null;
        
        // Configuration - Adjusted for better sensitivity
        this.sensitivity = 1.5;         // Increased from 1 to 1.5
        this.quietThreshold = 0.05;     // Lowered from 0.1 to 0.05
        this.loudThreshold = 0.4;       // Lowered from 0.7 to 0.4
        this.suddenSoundThreshold = 0.15; // Lowered from 0.3 to 0.15
        this.sustainedSoundDuration = 300; // Decreased from 500 to 300 ms
        
        // State variables
        this.volumeLevel = 0;
        this.lastVolume = 0;
        this.sustainedSoundStart = 0;
        this.isSustained = false;
        
        // Debug mode
        this.debug = true;
    }
    
    /**
     * Initializes Web Audio API and requests microphone access
     */
    async initialize() {
        try {
            // Create audio context
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            console.log('AudioContext created successfully');
            
            // Resume audio context (needed in modern browsers)
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
                console.log('AudioContext resumed from suspended state');
            }
            
            // Get microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            console.log('Microphone access granted');
            
            // Create microphone source
            this.microphone = this.audioContext.createMediaStreamSource(stream);
            
            // Create analyser node
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 1024;
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
            
            // Connect microphone to analyser
            this.microphone.connect(this.analyser);
            console.log('Audio analyzer setup complete');
            
            return true;
        } catch (error) {
            console.error('Error initializing audio:', error);
            return false;
        }
    }
    
    /**
     * Starts audio analysis
     */
    start() {
        if (!this.audioContext || !this.analyser) {
            console.error('AudioManager is not initialized');
            return false;
        }
        
        // Make sure the audio context is running
        if (this.audioContext.state !== 'running') {
            this.audioContext.resume().then(() => {
                console.log('AudioContext resumed on start');
            });
        }
        
        this.isActive = true;
        console.log('Audio analysis started');
        this.analyzeAudio();
        return true;
    }
    
    /**
     * Stops audio analysis
     */
    stop() {
        this.isActive = false;
        console.log('Audio analysis stopped');
        return true;
    }
    
    /**
     * Main audio analysis loop
     */
    analyzeAudio() {
        if (!this.isActive) return;
        
        // Get audio data
        this.analyser.getByteFrequencyData(this.dataArray);
        
        // Calculate volume level (average amplitude)
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            sum += this.dataArray[i];
        }
        
        // Normalize to 0-1 range
        this.volumeLevel = sum / (this.dataArray.length * 255);
        
        // Apply sensitivity
        this.volumeLevel *= this.sensitivity;
        if (this.volumeLevel > 1) this.volumeLevel = 1;
        
        // Log volume level occasionally for debugging
        if (this.debug && Math.random() < 0.01) {
            console.log('Current volume level:', this.volumeLevel);
        }
        
        // Determine volume category
        let volumeCategory = 'normal';
        if (this.volumeLevel <= this.quietThreshold) {
            volumeCategory = 'quiet';
        } else if (this.volumeLevel >= this.loudThreshold) {
            volumeCategory = 'loud';
            if (this.debug) {
                console.log('LOUD sound detected, level:', this.volumeLevel);
            }
        }
        
        // Detect sudden sounds (significant jump in volume)
        const volumeDelta = this.volumeLevel - this.lastVolume;
        if (volumeDelta > this.suddenSoundThreshold) {
            if (this.debug) {
                console.log('SUDDEN sound detected, delta:', volumeDelta, 'level:', this.volumeLevel);
            }
            if (this.suddenSoundCallback) {
                this.suddenSoundCallback(this.volumeLevel);
            }
        }
        
        // Detect sustained sounds
        if (this.volumeLevel > this.quietThreshold) {
            if (!this.isSustained) {
                this.sustainedSoundStart = Date.now();
                this.isSustained = true;
            } else if (Date.now() - this.sustainedSoundStart > this.sustainedSoundDuration) {
                const duration = Date.now() - this.sustainedSoundStart;
                if (this.debug) {
                    console.log('SUSTAINED sound detected, duration:', duration, 'level:', this.volumeLevel);
                }
                if (this.sustainedSoundCallback) {
                    this.sustainedSoundCallback(this.volumeLevel, duration);
                }
            }
        } else {
            this.isSustained = false;
        }
        
        // Call volume callback
        if (this.volumeCallback) {
            this.volumeCallback(this.volumeLevel, volumeCategory);
        }
        
        // Save current volume for next iteration
        this.lastVolume = this.volumeLevel;
        
        // Continue analysis loop
        requestAnimationFrame(() => this.analyzeAudio());
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
     * Update audio settings
     */
    updateSettings(settings) {
        if (settings.sensitivity !== undefined) {
            this.sensitivity = settings.sensitivity;
            console.log('Sensitivity updated to:', this.sensitivity);
        }
        
        if (settings.quietThreshold !== undefined) {
            this.quietThreshold = settings.quietThreshold;
            console.log('Quiet threshold updated to:', this.quietThreshold);
        }
        
        if (settings.loudThreshold !== undefined) {
            this.loudThreshold = settings.loudThreshold;
            console.log('Loud threshold updated to:', this.loudThreshold);
        }
        
        if (settings.suddenSoundThreshold !== undefined) {
            this.suddenSoundThreshold = settings.suddenSoundThreshold;
            console.log('Sudden sound threshold updated to:', this.suddenSoundThreshold);
        }
    }
} 