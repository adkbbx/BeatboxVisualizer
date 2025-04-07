/**
 * SettingsManager handles settings-related functionality
 */
class SettingsManager {
    constructor(audioManager) {
        this.audioManager = audioManager;
        
        // Local cache of settings to handle before AudioAnalyzer is initialized
        this.settingsCache = {
            sensitivity: 1.5,
            quietThreshold: 0.06,
            loudThreshold: 0.4,
            suddenSoundThreshold: 0.15
        };
        
        // Try to load settings from localStorage
        this.loadSettingsFromStorage();
    }
    
    /**
     * Load settings from localStorage if available
     */
    loadSettingsFromStorage() {
        try {
            const savedSettings = localStorage.getItem('vibecoding-settings');
            if (savedSettings) {
                const parsedSettings = JSON.parse(savedSettings);
                this.settingsCache = { ...this.settingsCache, ...parsedSettings };
                
                // Apply these settings to AudioManager if it's initialized
                if (this.audioManager && this.audioManager.audioAnalyzer) {
                    this.audioManager.updateSettings(this.settingsCache);
                }
                
                console.log('Loaded settings from storage:', this.settingsCache);
            }
        } catch (error) {
            console.error('[SettingsManager] Error loading settings from storage:', error);
        }
    }
    
    /**
     * Save current settings to localStorage
     */
    saveSettingsToStorage() {
        try {
            // Get current settings
            const currentSettings = this.getCurrentSettings();
            
            // Save to localStorage
            localStorage.setItem('vibecoding-settings', JSON.stringify(currentSettings));
            
            console.log('Saved settings to storage:', currentSettings);
        } catch (error) {
            console.error('[SettingsManager] Error saving settings to storage:', error);
        }
    }
    
    /**
     * Get current settings from AudioAnalyzer or local cache
     */
    getCurrentSettings() {
        // If AudioAnalyzer is available, get settings from there
        if (this.audioManager && this.audioManager.audioAnalyzer) {
            return this.audioManager.audioAnalyzer.getSettings();
        }
        
        // Otherwise return cached settings
        return this.settingsCache;
    }

    /**
     * Connect setting sliders between old and new panels
     */
    connectSettingSliders() {
        const pairs = [
            ['newSensitivitySlider', 'sensitivitySlider'],
            ['newThresholdLow', 'thresholdLow'],
            ['newThresholdHigh', 'thresholdHigh'],
            ['newSuddenThreshold', 'suddenThreshold']
        ];
        
        // First, load settings from storage or AudioAnalyzer and update all sliders
        const currentSettings = this.getCurrentSettings();
        
        // Update input values to match current settings
        pairs.forEach(([newId, oldId]) => {
            const newSlider = document.getElementById(newId);
            const oldSlider = document.getElementById(oldId);
            
            if (newSlider && oldSlider) {
                // Set new slider values
                if (newId === 'newSensitivitySlider') newSlider.value = currentSettings.sensitivity;
                if (newId === 'newThresholdLow') newSlider.value = currentSettings.quietThreshold;
                if (newId === 'newThresholdHigh') newSlider.value = currentSettings.loudThreshold;
                if (newId === 'newSuddenThreshold') newSlider.value = currentSettings.suddenSoundThreshold;
                
                // Match old sliders to new values
                oldSlider.value = newSlider.value;
                
                // Sync changes from new to old AND directly update settings
                newSlider.addEventListener('input', () => {
                    oldSlider.value = newSlider.value;
                    this.updateAudioSettings();
                });
                
                // Also sync changes from old to new and update settings
                oldSlider.addEventListener('input', () => {
                    newSlider.value = oldSlider.value;
                    this.updateAudioSettings();
                });
            }
        });
        
        // Connect close button
        const newCloseButton = document.getElementById('newCloseSettings');
        if (newCloseButton) {
            newCloseButton.addEventListener('click', () => {
                const panel = document.getElementById('newSettingsPanel');
                if (panel) {
                    panel.style.display = 'none';
                }
                
                // Make sure we save settings when panel is closed
                this.saveSettingsToStorage();
            });
        }
    }

    /**
     * Update audio settings from sliders
     */
    updateAudioSettings() {
        try {
            // Get values from NEW sliders (more reliable)
            const sensitivitySlider = document.getElementById('newSensitivitySlider');
            const thresholdLowSlider = document.getElementById('newThresholdLow');
            const thresholdHighSlider = document.getElementById('newThresholdHigh');
            const suddenThresholdSlider = document.getElementById('newSuddenThreshold');
            
            // Fallback to old sliders if new ones aren't available
            const sensitivity = parseFloat(sensitivitySlider?.value || document.getElementById('sensitivitySlider')?.value || 1.5);
            const quietThreshold = parseFloat(thresholdLowSlider?.value || document.getElementById('thresholdLow')?.value || 0.06);
            const loudThreshold = parseFloat(thresholdHighSlider?.value || document.getElementById('thresholdHigh')?.value || 0.4);
            const suddenThreshold = parseFloat(suddenThresholdSlider?.value || document.getElementById('suddenThreshold')?.value || 0.15);
            
            // Update settings cache
            this.settingsCache = {
                sensitivity,
                quietThreshold,
                loudThreshold,
                suddenSoundThreshold: suddenThreshold
            };
            
            // Update settings in AudioManager if available
            if (this.audioManager) {
                this.audioManager.updateSettings(this.settingsCache);
            }
            
            // Save to localStorage for persistence
            this.saveSettingsToStorage();
            
            // Show confirmation
            this.showSettingsConfirmation();
        } catch (error) {
            console.error('[SettingsManager] Error updating settings:', error);
        }
    }
    
    /**
     * Show a brief visual confirmation that settings were updated
     */
    showSettingsConfirmation() {
        // Create a small notification
        const notification = document.createElement('div');
        notification.textContent = 'Settings updated';
        notification.style.position = 'fixed';
        notification.style.bottom = '20px';
        notification.style.right = '20px';
        notification.style.backgroundColor = 'rgba(46, 204, 113, 0.8)';
        notification.style.color = 'white';
        notification.style.padding = '10px 15px';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '9999';
        notification.style.fontWeight = 'bold';
        notification.style.fontSize = '14px';
        notification.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
        notification.style.transition = 'opacity 0.3s ease';
        
        document.body.appendChild(notification);
        
        // Fade out and remove after 2 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    /**
     * Update new sliders with values from AudioManager/AudioAnalyzer
     */
    updateNewSlidersFromAudioManager() {
        // Get current settings
        const currentSettings = this.getCurrentSettings();
        
        // Get the sliders
        const newSensitivitySlider = document.getElementById('newSensitivitySlider');
        const newThresholdLowSlider = document.getElementById('newThresholdLow');
        const newThresholdHighSlider = document.getElementById('newThresholdHigh');
        const newSuddenThresholdSlider = document.getElementById('newSuddenThreshold');
        
        // Update values if sliders exist
        if (newSensitivitySlider) {
            newSensitivitySlider.value = currentSettings.sensitivity;
        }
        
        if (newThresholdLowSlider) {
            newThresholdLowSlider.value = currentSettings.quietThreshold;
        }
        
        if (newThresholdHighSlider) {
            newThresholdHighSlider.value = currentSettings.loudThreshold;
        }
        
        if (newSuddenThresholdSlider) {
            newSuddenThresholdSlider.value = currentSettings.suddenSoundThreshold;
        }
        
        // Also update old sliders for consistency
        const sensitivitySlider = document.getElementById('sensitivitySlider');
        const thresholdLowSlider = document.getElementById('thresholdLow');
        const thresholdHighSlider = document.getElementById('thresholdHigh');
        const suddenThresholdSlider = document.getElementById('suddenThreshold');
        
        if (sensitivitySlider) sensitivitySlider.value = currentSettings.sensitivity;
        if (thresholdLowSlider) thresholdLowSlider.value = currentSettings.quietThreshold;
        if (thresholdHighSlider) thresholdHighSlider.value = currentSettings.loudThreshold;
        if (suddenThresholdSlider) suddenThresholdSlider.value = currentSettings.suddenSoundThreshold;
    }
}

export default SettingsManager;