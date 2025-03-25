/**
 * UIController handles user interface elements and interactions
 */
class UIController {
    constructor(audioManager, animationController) {
        this.audioManager = audioManager;
        this.animationController = animationController;
        
        // UI elements
        this.startButton = document.getElementById('startMicrophone');
        this.stopButton = document.getElementById('stopMicrophone');
        this.toggleSettingsButton = document.getElementById('toggleSettings');
        this.closeSettingsButton = document.getElementById('closeSettings');
        this.settingsPanel = document.getElementById('settingsPanel');
        this.volumeLevel = document.getElementById('volumeLevel');
        this.audioStatus = document.getElementById('audioStatus');
        this.micDetection = document.getElementById('micDetection');
        
        // Settings elements
        this.sensitivitySlider = document.getElementById('sensitivitySlider');
        this.thresholdLowSlider = document.getElementById('thresholdLow');
        this.thresholdHighSlider = document.getElementById('thresholdHigh');
        this.suddenThresholdSlider = document.getElementById('suddenThreshold');
        
        // Microphone detection timers
        this.loudIndicatorTimer = null;
        this.suddenIndicatorTimer = null;
        this.sustainedIndicatorTimer = null;
        
        // Animation state tracking
        this.fireworksActive = false;
        this.activeSustainedSounds = 0;
        
        // Initialize UI
        this.initializeEventListeners();
    }
    
    /**
     * Initialize all event listeners
     */
    initializeEventListeners() {
        // Microphone control buttons
        this.startButton.addEventListener('click', () => this.startMicrophone());
        this.stopButton.addEventListener('click', () => this.stopMicrophone());
        
        // Settings panel toggle
        this.toggleSettingsButton.addEventListener('click', () => this.toggleSettings());
        this.closeSettingsButton.addEventListener('click', () => this.closeSettings());
        
        // Settings change events
        this.sensitivitySlider.addEventListener('input', () => this.updateAudioSettings());
        this.thresholdLowSlider.addEventListener('input', () => this.updateAudioSettings());
        this.thresholdHighSlider.addEventListener('input', () => this.updateAudioSettings());
        this.suddenThresholdSlider.addEventListener('input', () => this.updateAudioSettings());
    }
    
    /**
     * Start microphone and animation
     */
    async startMicrophone() {
        // Initialize audio manager
        const success = await this.audioManager.initialize();
        
        if (success) {
            // Set up audio callbacks
            this.audioManager.onVolumeChange((volume, category) => {
                this.updateVolumeUI(volume);
                
                // Only process audio for meaningful volume levels
                if (volume < this.audioManager.noiseFloor) {
                    // Volume too low, don't process audio events
                    return;
                }
                
                // For loud sounds, burst all fireworks if any exist
                if (category === 'loud') {
                    if (this.animationController.fireworks.length > 0) {
                        this.showLoudDetection(`LOUD sound detected, level: ${volume.toFixed(4)} - BURSTING ALL fireworks!`);
                    } else {
                        this.showLoudDetection(`LOUD sound detected, level: ${volume.toFixed(4)} - No fireworks to burst`);
                    }
                    this.animationController.applyVolume(volume, category);
                }
            });
            
            // We're no longer using sudden sounds to trigger animations
            this.audioManager.onSuddenSound((volume) => {
                // Log but don't trigger animation
                if (volume > 0.1) {
                    console.log(`Sudden sound detected (${volume.toFixed(4)}) - animation disabled`);
                }
            });
            
            this.audioManager.onSustainedSound((volume, duration) => {
                // Only respond to significant volume (greater than 0.1) and duration over 250ms
                if (volume < 0.1) return null;
                
                // Debug logging to help diagnose issues
                console.log('UIController: Sustained sound detected', {volume, duration});
                
                this.showSustainedDetection(`SUSTAINED sound detected, duration: ${duration} level: ${volume.toFixed(4)}`);
                
                // Launch a new firework and get its ID
                const fireworkId = this.animationController.applySustainedSound(volume, duration);
                
                // Only increment active count if we actually created a firework
                if (fireworkId) {
                    this.activeSustainedSounds++;
                    this.fireworksActive = true;
                    console.log('UIController: New firework launched, ID:', fireworkId);
                }
                
                return fireworkId;
            });
            
            this.audioManager.onSustainedSoundEnd((id) => {
                // Handle the end of a sustained sound
                console.log('UIController: Sustained sound ended, ID:', id);
                this.showSustainedDetection(`Sustained sound ended - firework falling`);
                
                // Deactivate the firework but don't make it fall
                this.animationController.deactivateFirework(id);
                this.activeSustainedSounds--;
                
                if (this.activeSustainedSounds <= 0) {
                    this.activeSustainedSounds = 0;
                    this.fireworksActive = false;
                }
            });
            
            // Start audio and animation
            this.audioManager.start();
            this.animationController.start();
            
            // Update UI
            this.startButton.disabled = true;
            this.stopButton.disabled = false;
            this.audioStatus.textContent = 'Audio status: active';
        } else {
            this.audioStatus.textContent = 'Error: Microphone access denied';
        }
    }
    
    /**
     * Stop microphone and animation
     */
    stopMicrophone() {
        this.audioManager.stop();
        this.animationController.stop();
        this.fireworksActive = false;
        this.activeSustainedSounds = 0;
        
        // Update UI
        this.startButton.disabled = false;
        this.stopButton.disabled = true;
        this.audioStatus.textContent = 'Audio status: inactive';
        this.updateVolumeUI(0);
        this.micDetection.textContent = 'No sound detected';
        this.micDetection.className = 'mic-detection';
    }
    
    /**
     * Update volume level UI
     */
    updateVolumeUI(volume) {
        // Update volume meter
        const levelBar = this.volumeLevel.querySelector('.level-bar');
        levelBar.style.width = `${volume * 100}%`;
        
        // Change color based on volume level
        if (volume <= this.audioManager.quietThreshold) {
            levelBar.style.backgroundColor = '#2ecc71'; // Green
        } else if (volume >= this.audioManager.loudThreshold) {
            levelBar.style.backgroundColor = '#e74c3c'; // Red
        } else {
            levelBar.style.backgroundColor = '#3498db'; // Blue
        }
    }
    
    /**
     * Show sustained sound detection in the mic test indicator
     */
    showSustainedDetection(message = "SUSTAINED sound detected!") {
        clearTimeout(this.sustainedIndicatorTimer);
        
        this.micDetection.textContent = message;
        this.micDetection.className = 'mic-detection detected-sustained';
        
        this.sustainedIndicatorTimer = setTimeout(() => {
            this.micDetection.textContent = this.fireworksActive ? 
                'Continue making sounds to launch more fireworks. LOUD sound will burst all.' : 
                'Make SUSTAINED sound to launch fireworks';
            this.micDetection.className = 'mic-detection';
        }, 2000);
    }
    
    /**
     * Show loud sound detection in the mic test indicator
     */
    showLoudDetection(message = "LOUD sound detected!") {
        clearTimeout(this.loudIndicatorTimer);
        
        this.micDetection.textContent = message;
        this.micDetection.className = 'mic-detection detected-loud';
        
        this.loudIndicatorTimer = setTimeout(() => {
            this.micDetection.textContent = this.fireworksActive ? 
                'Continue making sounds to launch more fireworks. LOUD sound will burst all.' : 
                'Make SUSTAINED sound to launch fireworks';
            this.micDetection.className = 'mic-detection';
        }, 2000);
    }
    
    /**
     * Show sudden sound detection in the mic test indicator
     */
    showSuddenDetection(message = "SUDDEN sound detected!") {
        clearTimeout(this.suddenIndicatorTimer);
        
        this.micDetection.textContent = message;
        this.micDetection.className = 'mic-detection detected-sudden';
        
        this.suddenIndicatorTimer = setTimeout(() => {
            this.micDetection.textContent = this.fireworksActive ? 
                'Continue making sounds to launch more fireworks. LOUD sound will burst all.' : 
                'Make SUSTAINED sound to launch fireworks';
            this.micDetection.className = 'mic-detection';
        }, 2000);
    }
    
    /**
     * Toggle settings panel
     */
    toggleSettings() {
        this.settingsPanel.classList.toggle('hidden');
    }
    
    /**
     * Close settings panel
     */
    closeSettings() {
        this.settingsPanel.classList.add('hidden');
    }
    
    /**
     * Update audio settings
     */
    updateAudioSettings() {
        const sensitivity = parseFloat(this.sensitivitySlider.value);
        const quietThreshold = parseFloat(this.thresholdLowSlider.value);
        const loudThreshold = parseFloat(this.thresholdHighSlider.value);
        const suddenThreshold = parseFloat(this.suddenThresholdSlider.value);
        
        this.audioManager.updateSettings({
            sensitivity,
            quietThreshold,
            loudThreshold,
            suddenSoundThreshold: suddenThreshold
        });
    }
}

export default UIController;