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
        const audioStatus = document.getElementById('audioStatus');

        // Set up start/stop button
        if (this.uiController.startButton) {
            this.uiController.startButton.addEventListener('click', () => {
                if (!this.uiController.startButton.classList.contains('active')) {
                    // Start microphone
                    this.uiController.startButton.classList.add('active');
                    this.uiController.startButton.querySelector('.text').textContent = 'Stop';
                    audioStatus.textContent = 'Audio status: active';
                    audioStatus.className = 'active';
                    this.uiController.startMicrophone();
                } else {
                    // Stop microphone
                    this.uiController.startButton.classList.remove('active');
                    this.uiController.startButton.querySelector('.text').textContent = 'Start';
                    audioStatus.textContent = 'Audio status: inactive';
                    audioStatus.className = 'inactive';
                    this.uiController.stopMicrophone();
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