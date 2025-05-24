/**
 * SoundEffects - Handles firework audio with support for custom sound files
 * Looks for launch.mp3 and burst.mp3 in the sounds/ directory
 * Falls back to synthesized sounds if files not found
 */
class SoundEffects {
    constructor() {
        this.audioContext = null;
        this.initialized = false;
        this.masterVolume = 0.3;
        
        // Audio buffers for sounds
        this.launchBuffer = null;
        this.burstBuffer = null;
        this.useCustomSounds = false;
    }

    /**
     * Initialize audio context and try to load custom sounds
     */
    async initialize() {
        if (this.initialized) return true;

        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            
            if (this.audioContext.state === 'suspended') {
                await this.audioContext.resume();
            }
            
            // Try to load custom sounds
            await this.loadCustomSounds();
            
            this.initialized = true;
            return true;
        } catch (error) {
            console.error('[SoundEffects] Failed to initialize:', error);
            return false;
        }
    }

    /**
     * Try to load custom sound files from sounds directory
     */
    async loadCustomSounds() {
        try {
            // Try to load launch sound
            const launchResponse = await fetch('sounds/launch.mp3');
            if (launchResponse.ok) {
                const launchData = await launchResponse.arrayBuffer();                this.launchBuffer = await this.audioContext.decodeAudioData(launchData);
            }
        } catch (error) {
            // No custom launch sound found, will use synthesized
        }

        try {
            // Try to load burst sound
            const burstResponse = await fetch('sounds/burst.mp3');
            if (burstResponse.ok) {
                const burstData = await burstResponse.arrayBuffer();
                this.burstBuffer = await this.audioContext.decodeAudioData(burstData);
            }
        } catch (error) {
            // No custom burst sound found, will use synthesized
        }

        this.useCustomSounds = !!(this.launchBuffer || this.burstBuffer);
    }

    /**
     * Play a buffer-based sound
     */
    playBuffer(buffer, volume = 1) {
        if (!buffer || !this.audioContext) return;

        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = buffer;
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        gainNode.gain.value = this.masterVolume * volume;
        
        source.start();
    }

    /**
     * Play launch sound
     */
    async playLaunchSound() {
        if (!this.initialized) {
            await this.initialize();
        }
        
        if (!this.audioContext) return;

        if (this.launchBuffer) {
            this.playBuffer(this.launchBuffer);
        } else {
            this.playSynthLaunch();
        }
    }
    /**
     * Play burst sound
     */
    async playBurstSound() {
        if (!this.initialized) {
            await this.initialize();
        }
        
        if (!this.audioContext) return;

        if (this.burstBuffer) {
            this.playBuffer(this.burstBuffer);
        } else {
            this.playSynthBurst();
        }
    }

    /**
     * Simple synthesized launch sound
     */
    playSynthLaunch() {
        const currentTime = this.audioContext.currentTime;
        const osc = this.audioContext.createOscillator();
        const gain = this.audioContext.createGain();
        
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        
        // Simple rising whistle
        osc.frequency.setValueAtTime(200, currentTime);
        osc.frequency.exponentialRampToValueAtTime(1500, currentTime + 0.6);
        
        gain.gain.setValueAtTime(0, currentTime);
        gain.gain.linearRampToValueAtTime(this.masterVolume * 0.5, currentTime + 0.1);
        gain.gain.linearRampToValueAtTime(0, currentTime + 0.6);
        
        osc.start(currentTime);
        osc.stop(currentTime + 0.6);
    }

    /**
     * Simple synthesized burst sound
     */
    playSynthBurst() {
        const currentTime = this.audioContext.currentTime;
        
        // Create noise
        const bufferSize = this.audioContext.sampleRate * 0.2;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() - 0.5) * 2;
        }
        
        const noise = this.audioContext.createBufferSource();
        const filter = this.audioContext.createBiquadFilter();
        const gain = this.audioContext.createGain();
        
        noise.buffer = buffer;
        filter.type = 'lowpass';
        filter.frequency.value = 400;
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.audioContext.destination);
        
        gain.gain.setValueAtTime(this.masterVolume, currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.2);
        
        noise.start(currentTime);
    }

    /**
     * Set master volume
     */
    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
}

export default SoundEffects;