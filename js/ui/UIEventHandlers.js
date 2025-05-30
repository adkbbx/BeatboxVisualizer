/**
 * UIEventHandlers handles UI-related event listeners and interactions
 */
class UIEventHandlers {
    constructor(uiController) {
        this.uiController = uiController;
        this.setupEventListeners();
    }

    /**
     * Set up all event listeners for UI elements - simplified
     */
    setupEventListeners() {
        const audioStatusDetection = document.getElementById('audioStatusDetection');

        // Set up start/stop button with improved error handling
        if (this.uiController.startButton) {
            this.uiController.startButton.addEventListener('click', async () => {
                const button = this.uiController.startButton;
                const textElement = button.querySelector('.text');
                
                // Disable button during operation to prevent double-clicks
                button.disabled = true;
                
                try {
                    if (!button.classList.contains('active')) {
                        // Starting microphone
                        textElement.textContent = window.i18n ? window.i18n.t('ui.status.starting') : 'Starting...';
                        audioStatusDetection.textContent = window.i18n ? window.i18n.t('audio.status.starting') : 'Audio status: starting...';
                        audioStatusDetection.className = 'audio-status-detection starting';
                        
                        const success = await this.uiController.startMicrophone();
                        
                        if (success !== false) {
                            // Success
                            button.classList.add('active');
                            textElement.textContent = window.i18n ? window.i18n.t('ui.buttons.stop') : 'Stop';
                            audioStatusDetection.textContent = window.i18n ? window.i18n.t('audio.status.active') : 'Audio status: active';
                            audioStatusDetection.className = 'audio-status-detection active';
                
                        } else {
                            // Failed
                            textElement.textContent = window.i18n ? window.i18n.t('ui.buttons.start') : 'Start';
                            audioStatusDetection.textContent = window.i18n ? window.i18n.t('audio.status.failed') : 'Audio status: failed to start';
                            audioStatusDetection.className = 'audio-status-detection error';
                
                            
                            // Reset error state after 3 seconds
                            setTimeout(() => {
                                if (audioStatusDetection.className === 'audio-status-detection error') {
                                    audioStatusDetection.textContent = window.i18n ? window.i18n.t('audio.status.inactive') : 'Audio status: inactive';
                                    audioStatusDetection.className = 'audio-status-detection inactive';
                                }
                            }, 3000);
                        }
                    } else {
                        // Stopping microphone
                        textElement.textContent = window.i18n ? window.i18n.t('ui.status.stopping') : 'Stopping...';
                        audioStatusDetection.textContent = window.i18n ? window.i18n.t('audio.status.stopping') : 'Audio status: stopping...';
                        audioStatusDetection.className = 'audio-status-detection stopping';
                        
                        this.uiController.stopMicrophone();
                        
                        // Update UI
                        button.classList.remove('active');
                        textElement.textContent = window.i18n ? window.i18n.t('ui.buttons.start') : 'Start';
                        audioStatusDetection.textContent = window.i18n ? window.i18n.t('audio.status.inactive') : 'Audio status: inactive';
                        audioStatusDetection.className = 'audio-status-detection inactive';
            
                    }
                } catch (error) {
                    console.error('❌ Error with microphone button:', error);
                    
                    // Reset to safe state
                    button.classList.remove('active');
                    textElement.textContent = window.i18n ? window.i18n.t('ui.buttons.start') : 'Start';
                    audioStatusDetection.textContent = window.i18n ? window.i18n.t('audio.status.error') : 'Audio status: error';
                    audioStatusDetection.className = 'audio-status-detection error';
                    
                    // Reset error state after 3 seconds
                    setTimeout(() => {
                        if (audioStatusDetection.className === 'audio-status-detection error') {
                            audioStatusDetection.textContent = window.i18n ? window.i18n.t('audio.status.inactive') : 'Audio status: inactive';
                            audioStatusDetection.className = 'audio-status-detection inactive';
                        }
                    }, 3000);
                } finally {
                    // Re-enable button
                    button.disabled = false;
                }
            });
        }

        // Set up test button
        const testButton = document.getElementById('testFirework');
        if (testButton) {
            testButton.addEventListener('click', () => {
                // Check current mode and launch appropriate test
                if (window.modeManager && window.modeManager.getCurrentMode() === 'bubble') {
                    this.uiController.launchTestBubble();
                } else {
                    this.uiController.launchTestFirework();
                }
            });
        }

        // Set up sliders
        this.setupSliders();
        
        // Load settings on initialization
        if (this.uiController.settingsManager) {
            // Update sliders from stored settings
            setTimeout(() => {
                if (this.uiController.updateSlidersFromAudioManager) {
                    this.uiController.updateSlidersFromAudioManager();
                }
            }, 500);
        }
    }

    /**
     * Set up settings button handler - simplified
     */
    setupSettingsButton() {
        // We've moved this functionality to UIController.initializeSettingsPanelControls()
        // No need to duplicate event handlers
    }

    /**
     * Set up close settings button handler - simplified
     */
    setupCloseSettingsButton() {
        // We've moved this functionality to UIController.initializeSettingsPanelControls()
        // No need to duplicate event handlers
    }

    /**
     * Set up settings sliders
     */
    setupSliders() {
        const updateSettings = () => this.uiController.updateAudioSettings();
        
        const sliders = [
            this.uiController.sensitivitySlider,
            this.uiController.thresholdLowSlider,
            this.uiController.thresholdHighSlider,
            this.uiController.suddenThresholdSlider
        ];
        
        sliders.forEach(slider => {
            if (slider) {
                slider.addEventListener('input', updateSettings);
            }
        });
    }
}

export default UIEventHandlers;