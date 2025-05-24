/**
 * UIController coordinates all UI components and interactions
 * Updated with background image management
 */
import UIEventHandlers from './UIEventHandlers.js';
import SoundVisualization from './SoundVisualization.js';
import SettingsManager from './SettingsManager.js';
import SettingsController from './settings/SettingsController.js';
// BackgroundUploader import removed - using direct implementation

class UIController {
    constructor(audioManager, animationController) {
        this.audioManager = audioManager;
        this.animationController = animationController;
        
        // UI elements
        this.startButton = document.getElementById('startMicrophone');
        this.settingsButton = document.getElementById('toggleSettings');
        this.settingsPanel = document.getElementById('settingsPanel');
        this.volumeLevel = document.getElementById('volumeLevel');
        this.audioStatus = document.getElementById('audioStatus');
        this.micDetection = document.getElementById('micDetection');
        this.togglePanelsButton = document.getElementById('togglePanels');
        
        // Create background uploader container if it doesn't exist
        this.createBackgroundUploaderContainer();
        
        // Animation state tracking
        this.fireworksActive = false;
        this.activeSustainedSounds = 0;
        this.isSettingsPanelOpen = false; // Track settings panel state
        this.boundHandleOutsideSettingsClick = this.handleOutsideSettingsClick.bind(this); // Bound listener
        
        // Reference to color manager
        this.colorManager = animationController.colorManager;
        
        // Initialize settings controller
        this.settingsController = null;
        
        // Initialize background uploader
        this.initializeBackgroundUploader();
        
        // Initialize component modules
        this.soundVisualization = new SoundVisualization(this.volumeLevel, this.micDetection, this.audioManager);
        this.settingsManager = new SettingsManager(this.audioManager);
        this.eventHandlers = new UIEventHandlers(this);
        
        // Methods from SettingsManager that need to be accessible in UIController
        this.connectSettingSliders = this.settingsManager.connectSettingSliders.bind(this.settingsManager);
        this.updateAudioSettings = this.settingsManager.updateAudioSettings.bind(this.settingsManager);
        this.updateSlidersFromAudioManager = this.settingsManager.updateSlidersFromAudioManager.bind(this.settingsManager);
        
        // Set up methods from SoundVisualization
        this.updateVolumeUI = this.soundVisualization.updateVolumeUI.bind(this.soundVisualization);
        this.updateMicrophoneState = this.soundVisualization.updateMicrophoneState.bind(this.soundVisualization);
        
        // Initialize settings panel controls
        this.initializeSettingsPanelControls();
        
        // Initialize panel toggle button - This is now primarily handled by js/panel-controls.js
        // this.initializePanelToggle(); 
    }
    
    /**
     * Check for the background uploader container
     */
    createBackgroundUploaderContainer() {
        // In the tabbed interface, the container should already exist
        // This method is kept for compatibility but now just verifies
        const bgUploaderContainer = document.getElementById('backgroundUploader');
        
        if (!bgUploaderContainer) {
        }
    }
    
    /**
     * Initialize the background uploader - disabled in favor of direct implementation
     */
    initializeBackgroundUploader() {
        // Skip initialization since we're using direct implementation in HTML
    }
    
    /**
     * Initialize panel toggle button
     */
    initializePanelToggle() {
        if (this.togglePanelsButton) {
            this.togglePanelsButton.addEventListener('click', () => {
                // This logic is now primarily in js/panel-controls.js
                // Kept for reference or if specific UIController actions are needed later
                /*
                const uploaderTabsContainer = document.querySelector('.uploader-tabs-container');
                const audioVisualizer = document.querySelector('.audio-visualizer');
                
                // Toggle visibility of panels
                const isPanelsVisible = 
                    uploaderTabsContainer && getComputedStyle(uploaderTabsContainer).display !== 'none' ||
                    audioVisualizer && getComputedStyle(audioVisualizer).display !== 'none';
                
                // Toggle panels visibility
                if (uploaderTabsContainer) uploaderTabsContainer.style.display = isPanelsVisible ? 'none' : 'block';
                if (audioVisualizer) audioVisualizer.style.display = isPanelsVisible ? 'none' : 'block';
                
                // Update button text
                const buttonText = this.togglePanelsButton.querySelector('.text');
                if (buttonText) {
                    buttonText.textContent = isPanelsVisible ? 'Show' : 'Hide';
                }
                */
            });
        }
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
        if (this.settingsButton && this.settingsPanel) {
            this.settingsButton.addEventListener('click', () => {
                if (this.isSettingsPanelOpen) {
                    this.closeSettingsPanel();
                } else {
                    this.openSettingsPanel();
                }
            });
        }

        const closeSettingsButton = document.getElementById('closeSettings');
        if (closeSettingsButton) {
            closeSettingsButton.addEventListener('click', () => {
                this.closeSettingsPanel();
            });
        }
    }

    openSettingsPanel() {
        if (!this.settingsPanel || this.isSettingsPanelOpen) return; // Prevent re-opening or if no panel

        this.settingsPanel.style.display = 'block';
        this.settingsPanel.classList.remove('is-hidden');
        this.isSettingsPanelOpen = true;
        if(this.settingsButton) this.settingsButton.innerHTML = '<span class="icon">⚙️</span><span class="text">Close Settings</span>'; 

        if (!this.settingsController) {
            this.settingsController = new SettingsController(
                'settingsPanel',
                this.animationController,
                this.audioManager,
                this.colorManager
            );
        }
        // Add event listener for outside click, use a delay to prevent immediate closing due to the click that opened it
        setTimeout(() => {
            document.addEventListener('mousedown', this.boundHandleOutsideSettingsClick);
        }, 0);
    }

    closeSettingsPanel() {
        if (!this.settingsPanel || !this.isSettingsPanelOpen) return; // Prevent re-closing or if no panel

        this.settingsPanel.style.display = 'none';
        this.isSettingsPanelOpen = false;
        if(this.settingsButton) this.settingsButton.innerHTML = '<span class="icon">⚙️</span><span class="text">Settings</span>';

        if (this.settingsManager) {
            this.settingsManager.saveSettingsToStorage();
        }
        // Remove event listener for outside click
        document.removeEventListener('mousedown', this.boundHandleOutsideSettingsClick);
    }

    handleOutsideSettingsClick(event) {
        if (!this.settingsPanel.contains(event.target) && 
            event.target !== this.settingsButton && 
            !this.settingsButton.contains(event.target)) {
            this.closeSettingsPanel();
        }
    }

    notifySettingsPanelClosed() {
        // Called by panel-controls.js if it hides the settings panel
        if (this.isSettingsPanelOpen) { // Only act if UIController thought it was open
            this.closeSettingsPanel();
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
                    
                    // Debug logging for audio levels
                    
                    // For loud sounds, burst all fireworks
                    if (category === 'loud') {
                        this.animationController.applyVolume(volume, category);
                    }
                });
                
                // Set up sustained sound detection for launching fireworks
                this.audioManager.onSustainedSound((volume, duration) => {
                    // Only respond to significant volume
                    if (volume < 0.05) return null;
                    
                    // Launch a new firework and get its ID
                    const fireworkId = this.animationController.applySustainedSound(volume, duration);
                    
                    if (fireworkId) {
                        this.activeSustainedSounds++;
                        this.fireworksActive = true;
                    }
                    
                    return fireworkId;
                });
                
                this.audioManager.onSustainedSoundEnd((id) => {
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
            this.updateMicrophoneState(false);
        } catch (error) {
            console.error('[UIController] Error stopping microphone:', error);
        }
    }
    
    /**
     * Launch a test firework
     */
    async launchTestFirework() {
        // Ensure animation is running
        if (!this.animationController.isActive) {
            this.animationController.start();
        }
        
        // Launch test firework through firework manager
        if (this.animationController.fireworkManager) {
            await this.animationController.fireworkManager.launchTestFirework();
        } else {
            console.error('[UIController] FireworkManager not available');
        }
    }
}

export default UIController;