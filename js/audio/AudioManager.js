/**
 * AudioManager handles microphone access and real-time audio analysis
 * Refactored to use separate modules for audio analysis and sustained sound detection
 */
import AudioAnalyzer from './AudioAnalyzer.js';
import SustainedSoundDetector from './SustainedSoundDetector.js';
import SoundEffects from '../SoundEffects.js';

class AudioManager {
    constructor(initialSettings = null) {
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
        
        // Create helper modules (will be initialized later)
        this.audioAnalyzer = null;
        this.sustainedSoundDetector = new SustainedSoundDetector();
        this.initialAudioSettings = initialSettings;
        
        // Create sound effects instance
        this.soundEffects = new SoundEffects();
        
        // Added property for loudSound cooldown
        this.lastLoudSoundTime = 0;
        this.loudSoundCooldown = 750; // Milliseconds
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
                
                // Initialize audio analyzer with stored initial settings
                this.audioAnalyzer = new AudioAnalyzer(
                    this.audioContext,
                    this.analyser,
                    this.dataArray,
                    this.initialAudioSettings
                );
                
                // Update the sustained sound detector with the loud threshold from analyzer
                this.sustainedSoundDetector.updateSettings({
                    loudThreshold: this.audioAnalyzer.loudThreshold
                });
            }
            
            // Initialize sound effects
            await this.soundEffects.initialize();
            
            return true;
        } catch (error) {
            return false;
        }
    }
    
    /**
     * Start audio analysis
     */
    start() {
        if (!this.audioContext || !this.analyser) {
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
                this.audioContext.resume();
            }
            
            this.isActive = true;
            this.analyzeAudio();
            return true;
        } else {
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
        if (!this.audioContext || !this.analyser || !this.dataArray || !this.audioAnalyzer) {
            this.isActive = false;
            return;
        }
        
        // Get audio analysis results
        const analysisResult = this.audioAnalyzer.analyze();
        const { volume, category, delta } = analysisResult;
        
        // Handle different volume categories
        if (category === 'loud') {
            // Reset sustained state for loud sounds
            this.sustainedSoundDetector.resetForLoudSound(this.sustainedSoundEndCallback);
            
            // Add cooldown check for loud sound callbacks
            const now = Date.now();
            const timeSinceLastLoudSound = now - this.lastLoudSoundTime;
            
            // Only trigger the loudSound callback if enough time has passed
            if (timeSinceLastLoudSound > this.loudSoundCooldown) {
                this.lastLoudSoundTime = now;
                
                // Call volume callback for loud sounds (with cooldown)
                if (this.volumeCallback) {
                    this.volumeCallback(volume, category);
                }
            }
        } else if (volume > this.audioAnalyzer.noiseFloor && category !== 'loud') {
            // Detect sudden sounds
            if (this.audioAnalyzer.isSuddenSound(volume, delta) && this.suddenSoundCallback) {
                this.suddenSoundCallback(volume);
            }
            
            // Process sustained sound
            this.sustainedSoundDetector.processSustainedSound(
                volume,
                this.sustainedSoundCallback,
                this.sustainedSoundEndCallback
            );
            
            // Call volume callback
            if (this.volumeCallback) {
                this.volumeCallback(volume, category);
            }
        } else if (category !== 'loud') {
            // Volume too low, reset sustained state
            this.sustainedSoundDetector.resetForLoudSound(this.sustainedSoundEndCallback);
            
            // Call volume callback
            if (this.volumeCallback) {
                this.volumeCallback(volume, category);
            }
        }
        
        // Continue loop
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
     * Set callback for when sustained sounds end
     */
    onSustainedSoundEnd(callback) {
        this.sustainedSoundEndCallback = callback;
    }
    
    /**
     * Update audio settings
     */
    updateSettings(settings) {
        // Store settings for later use if audioAnalyzer isn't initialized yet
        if (settings) {
            this.initialAudioSettings = { ...this.initialAudioSettings, ...settings };
        }
        
        // Only update audioAnalyzer if it exists (microphone has been started)
        if (this.audioAnalyzer) {
            this.audioAnalyzer.updateSettings(settings);
            
            // Update sustained sound detector with the same settings
            if (this.sustainedSoundDetector) {
                this.sustainedSoundDetector.updateSettings({
                    loudThreshold: settings.loudThreshold || this.audioAnalyzer.loudThreshold
                });
            }
        }
        
        // Update sound effects volume if provided
        if (this.soundEffects && settings && typeof settings.volume !== 'undefined') {
            this.soundEffects.setVolume(settings.volume);
        }
    }
    
    /**
     * Get current noiseFloor value
     */
    get noiseFloor() {
        return this.audioAnalyzer ? this.audioAnalyzer.noiseFloor : 0.04;
    }
}

export default AudioManager;