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
        this.testFireworksButton = document.getElementById('testFireworks');
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
        this.testFireworksButton.addEventListener('click', () => this.testFireworks());
        
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
     * Test fireworks animation
     */
    testFireworks() {
        // Make sure animation controller is active
        if (!this.animationController.isActive) {
            this.animationController.start();
        }
        
        // Launch multiple fireworks
        this.animationController.launchMultipleFireworks(5);
        console.log('Test fireworks launched');
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
                this.animationController.applyVolume(volume, category);
                
                // Update mic test indicator for loud sounds
                if (category === 'loud') {
                    this.showLoudDetection();
                }
            });
            
            this.audioManager.onSuddenSound((volume) => {
                this.animationController.applySuddenSound(volume);
                this.showSuddenDetection();
            });
            
            this.audioManager.onSustainedSound((volume, duration) => {
                this.animationController.applySustainedSound(volume, duration);
                this.showSustainedDetection();
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
     * Show loud sound detection in the mic test indicator
     */
    showLoudDetection() {
        clearTimeout(this.loudIndicatorTimer);
        
        this.micDetection.textContent = 'LOUD sound detected!';
        this.micDetection.className = 'mic-detection detected-loud';
        
        this.loudIndicatorTimer = setTimeout(() => {
            this.micDetection.textContent = 'No sound detected';
            this.micDetection.className = 'mic-detection';
        }, 1500);
    }
    
    /**
     * Show sudden sound detection in the mic test indicator
     */
    showSuddenDetection() {
        clearTimeout(this.suddenIndicatorTimer);
        
        this.micDetection.textContent = 'SUDDEN sound detected!';
        this.micDetection.className = 'mic-detection detected-sudden';
        
        this.suddenIndicatorTimer = setTimeout(() => {
            this.micDetection.textContent = 'No sound detected';
            this.micDetection.className = 'mic-detection';
        }, 1500);
    }
    
    /**
     * Show sustained sound detection in the mic test indicator
     */
    showSustainedDetection() {
        clearTimeout(this.sustainedIndicatorTimer);
        
        this.micDetection.textContent = 'SUSTAINED sound detected!';
        this.micDetection.className = 'mic-detection detected-sustained';
        
        this.sustainedIndicatorTimer = setTimeout(() => {
            this.micDetection.textContent = 'No sound detected';
            this.micDetection.className = 'mic-detection';
        }, 1500);
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