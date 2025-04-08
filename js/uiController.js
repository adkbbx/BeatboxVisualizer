/**
 * UIController coordinates all UI components and interactions
 * Fixed version with proper separation of concerns
 */
import UIEventHandlers from './UIEventHandlers.js';
import SoundVisualization from './SoundVisualization.js';
import SettingsManager from './SettingsManager.js';
import SettingsController from './settings/SettingsController.js';

class UIController {
    constructor(audioManager, animationController) {
        this.audioManager = audioManager;
        this.animationController = animationController;
        
        // UI elements
        this.startButton = document.getElementById('startMicrophone');
        this.settingsButton = document.getElementById('toggleSettings');
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
        
        // Animation state tracking
        this.fireworksActive = false;
        this.activeSustainedSounds = 0;
        
        // Reference to color manager
        this.colorManager = animationController.colorManager;
        
        // Initialize settings controller
        this.settingsController = null;
        
        // Initialize component modules
        this.soundVisualization = new SoundVisualization(this.volumeLevel, this.micDetection, this.audioManager);
        this.settingsManager = new SettingsManager(this.audioManager);
        this.eventHandlers = new UIEventHandlers(this);
        
        // Methods from SettingsManager that need to be accessible in UIController
        this.connectSettingSliders = this.settingsManager.connectSettingSliders.bind(this.settingsManager);
        this.updateAudioSettings = this.settingsManager.updateAudioSettings.bind(this.settingsManager);
        this.updateNewSlidersFromAudioManager = this.settingsManager.updateNewSlidersFromAudioManager.bind(this.settingsManager);
        
        // Set up methods from SoundVisualization
        this.updateVolumeUI = this.soundVisualization.updateVolumeUI.bind(this.soundVisualization);
        this.updateMicrophoneState = this.soundVisualization.updateMicrophoneState.bind(this.soundVisualization);
        
        // Initialize settings panel controls
        this.initializeSettingsPanelControls();
    }
    
    /**
     * Initialize all event listeners
     */
    initializeEventListeners() {
        // This is now handled by the UIEventHandlers class
        // Left here for backward compatibility
    }
    
    /**
     * Initialize settings panel controls
     */
    initializeSettingsPanelControls() {
        const toggleSettingsButton = document.getElementById('toggleSettings');
        const closeSettingsButton = document.getElementById('newCloseSettings');
        const settingsPanel = document.getElementById('newSettingsPanel');
        
        if (toggleSettingsButton && settingsPanel) {
            toggleSettingsButton.addEventListener('click', () => {
                settingsPanel.style.display = 'block';
                
                // Initialize settings controller if not already done
                if (!this.settingsController) {
                    this.settingsController = new SettingsController(
                        'newSettingsPanel',
                        this.animationController,
                        this.audioManager,
                        this.colorManager
                    );
                }
            });
        }
        
        if (closeSettingsButton) {
            closeSettingsButton.addEventListener('click', () => {
                if (settingsPanel) {
                    settingsPanel.style.display = 'none';
                }
            });
        }
    }
    
    /**
     * Start microphone and animation
     */
    async startMicrophone() {
        try {
            // Initialize audio manager
            const success = await this.audioManager.initialize();
        
            if (success) {
                // Set up audio callbacks
                this.audioManager.onVolumeChange((volume, category) => {
                    this.updateVolumeUI(volume);
                    
                    // Skip if volume too low
                    if (volume < this.audioManager.noiseFloor) {
                        return;
                    }
                    
                    // For loud sounds, burst all fireworks
                    if (category === 'loud') {
                        this.soundVisualization.showLoudDetection(`LOUD sound detected - bursting fireworks!`, this.fireworksActive);
                        this.animationController.applyVolume(volume, category);
                    }
                });
                
                // Set up sustained sound detection for launching fireworks
                this.audioManager.onSustainedSound((volume, duration) => {
                    // Only respond to significant volume
                    if (volume < 0.1) return null;
                    
                    this.soundVisualization.showSustainedDetection(`SUSTAINED sound detected`, this.fireworksActive);
                    
                    // Launch a new firework and get its ID
                    const fireworkId = this.animationController.applySustainedSound(volume, duration);
                    
                    if (fireworkId) {
                        this.activeSustainedSounds++;
                        this.fireworksActive = true;
                    }
                    
                    return fireworkId;
                });
                
                this.audioManager.onSustainedSoundEnd((id) => {
                    this.soundVisualization.showSustainedDetection(`Sustained sound ended`, this.fireworksActive);
                    
                    // Deactivate the firework
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
                this.startButton.disabled = false;
                this.audioStatus.textContent = 'Microphone Active';
                this.audioStatus.className = 'active';
                this.audioStatus.parentElement.classList.add('active');
                this.updateMicrophoneState(true);
            } else {
                this.audioStatus.textContent = 'Microphone Access Denied';
                this.audioStatus.className = 'inactive';
                this.audioStatus.parentElement.classList.add('inactive');
                this.updateMicrophoneState(false);
            }
        } catch (error) {
            console.error('[UIController] Error starting microphone:', error);
            
            this.audioStatus.textContent = 'Microphone Error';
            this.audioStatus.className = 'inactive';
            this.audioStatus.parentElement.classList.add('inactive');
            this.updateMicrophoneState(false);
        }
    }
    
    /**
     * Stop microphone and animation
     */
    stopMicrophone(resetState = true) {
        try {
            // Stop audio and animation
            if (this.audioManager) {
                this.audioManager.stop();
            }
            
            if (this.animationController) {
                this.animationController.stop();
            }
            
            // Reset state
            this.fireworksActive = false;
            this.activeSustainedSounds = 0;
            
            if (resetState) {
                this.startButton.classList.remove('active');
                this.startButton.querySelector('.text').textContent = 'Start';
                const audioStatus = document.getElementById('audioStatus');
                audioStatus.textContent = 'Audio status: inactive';
                audioStatus.className = 'inactive';
            }
            
            // Update UI elements
            this.startButton.disabled = false;
            this.audioStatus.textContent = 'Microphone Inactive';
            this.audioStatus.className = 'inactive';
            this.audioStatus.parentElement.classList.add('inactive');
            this.updateVolumeUI(0);
            this.micDetection.textContent = 'Microphone inactive - no sound detected';
            this.micDetection.className = 'mic-detection';
            this.updateMicrophoneState(false);
            
        } catch (error) {
            console.error('[UIController] Error stopping microphone:', error);
            
            // Try to reset UI state even if there was an error
            this.startButton.disabled = false;
            this.audioStatus.textContent = 'Microphone Error';
            this.audioStatus.className = 'inactive';
            this.updateMicrophoneState(false);
        }
    }
    
    /**
     * Show sustained sound detection in the mic test indicator
     * Kept for backward compatibility
     */
    showSustainedDetection(message) {
        this.soundVisualization.showSustainedDetection(message, this.fireworksActive);
    }
    
    /**
     * Show loud sound detection in the mic test indicator
     * Kept for backward compatibility
     */
    showLoudDetection(message) {
        this.soundVisualization.showLoudDetection(message, this.fireworksActive);
    }
}

export default UIController;