/**
 * Controls the settings panel UI and connects it to the application components
 */
import SettingsTabs from './SettingsTabs.js';
import AnimationSettingsManager from './AnimationSettingsManager.js';

class SettingsController {
  constructor(panelId, animationController, audioManager, colorManager) {
    this.panel = document.getElementById(panelId);
    this.animationController = animationController;
    this.audioManager = audioManager;
    this.colorManager = colorManager;
    
    // Initialize settings manager
    this.settingsManager = new AnimationSettingsManager();
    
    // Initialize tab system
    this.tabs = new SettingsTabs(panelId);
    
    // Set up event handlers for all settings
    this.initializeEventListeners();
    
    // Initialize slider values from stored settings
    this.updateUIFromSettings();
  }
  
  // Initialize all event listeners for settings controls
  initializeEventListeners() {
    // Audio settings (these might already exist in the current implementation)
    this.setupRangeControl('newSensitivitySlider', 'sensitivityValue', value => {
      this.audioManager.updateSettings({ sensitivity: value });
    });
    
    // Add the other existing audio settings
    this.setupRangeControl('newThresholdLow', 'thresholdLowValue', value => {
      this.audioManager.updateSettings({ quietThreshold: value });
    });
    
    this.setupRangeControl('newThresholdHigh', 'thresholdHighValue', value => {
      this.audioManager.updateSettings({ loudThreshold: value });
    });
    
    this.setupRangeControl('newSuddenThreshold', 'suddenThresholdValue', value => {
      this.audioManager.updateSettings({ suddenThreshold: value });
    });
    
    // Firework settings
    this.setupRangeControl('fireworkGravity', 'gravityValue', value => {
      this.updateFireworkSettings({ gravity: value });
    });
    
    this.setupRangeControl('maxFireworks', 'maxFireworksValue', value => {
      this.updateFireworkSettings({ maxFireworks: value });
    });
    
    this.setupRangeControl('launchHeight', 'launchHeightValue', value => {
      this.updateFireworkSettings({ launchHeightFactor: value });
    });
    
    this.setupRangeControl('smokeTrailIntensity', 'smokeTrailValue', value => {
      this.updateFireworkSettings({ smokeTrailIntensity: value });
    });
    
    // Particle settings
    this.setupRangeControl('particleCount', 'particleCountValue', value => {
      this.updateParticleSettings({ count: value });
    });
    
    this.setupRangeControl('particleLifespan', 'particleLifespanValue', value => {
      this.updateParticleSettings({ lifespan: value });
    });
    
    this.setupRangeControl('particleMinSize', 'particleMinSizeValue', value => {
      this.updateParticleSettings({ minSize: value });
    });
    
    this.setupRangeControl('particleMaxSize', 'particleMaxSizeValue', value => {
      this.updateParticleSettings({ maxSize: value });
    });
    
    // Toggle for multicolor particles
    this.setupToggleControl('useMultiColor', value => {
      this.updateParticleSettings({ useMultiColor: value });
    });
    
    // Effect settings
    this.setupToggleControl('glowEffect', value => {
      this.updateEffectSettings({ glowEnabled: value });
    });
    
    this.setupToggleControl('shimmerEffect', value => {
      this.updateEffectSettings({ shimmerEnabled: value });
    });
    
    this.setupRangeControl('fadeResistance', 'fadeResistanceValue', value => {
      this.updateEffectSettings({ fadeResistance: value });
    });
    
    this.setupRangeControl('trailEffect', 'trailEffectValue', value => {
      this.updateEffectSettings({ trailEffect: value });
    });
    
    this.setupRangeControl('globalSpeed', 'globalSpeedValue', value => {
      this.updateAnimationSettings({ globalSpeed: value });
    });
    
    // Color settings
    const colorThemeSelect = document.getElementById('colorTheme');
    if (colorThemeSelect) {
      colorThemeSelect.addEventListener('change', e => {
        const theme = e.target.value;
        this.updateColorSettings({ theme });
        
        // Toggle visibility of custom colors section
        const customColorsSection = document.getElementById('customColorsSetting');
        if (customColorsSection) {
          customColorsSection.style.display = theme === 'Custom' ? 'block' : 'none';
        }
      });
    }
    
    this.setupRangeControl('colorIntensity', 'colorIntensityValue', value => {
      this.updateColorSettings({ intensity: value });
    });
    
    // Custom color management
    const addColorButton = document.getElementById('addColor');
    if (addColorButton) {
      addColorButton.addEventListener('click', () => {
        const colorPicker = document.getElementById('colorPicker');
        if (colorPicker) {
          const color = colorPicker.value;
          this.addCustomColor(color);
        }
      });
    }
    
    // Reset button for current tab
    const resetButton = document.getElementById('resetSettings');
    if (resetButton) {
      resetButton.addEventListener('click', () => {
        this.resetCurrentTabSettings();
      });
    }
    
    // Close button
    const closeButton = document.getElementById('newCloseSettings');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.panel.style.display = 'none';
      });
    }
  }
  
  // Helper for setting up range control event listeners
  setupRangeControl(inputId, valueId, callback) {
    const input = document.getElementById(inputId);
    const valueDisplay = document.getElementById(valueId);
    
    if (!input || !valueDisplay) {
      console.warn(`Could not find range control: ${inputId} or value display: ${valueId}`);
      return;
    }
    
    // Update value display when slider changes
    input.addEventListener('input', () => {
      const value = parseFloat(input.value);
      valueDisplay.textContent = value;
      callback(value);
    });
  }
  
  // Helper for setting up toggle control event listeners
  setupToggleControl(inputId, callback) {
    const input = document.getElementById(inputId);
    
    if (!input) {
      console.warn(`Could not find toggle control: ${inputId}`);
      return;
    }
    
    input.addEventListener('change', () => {
      callback(input.checked);
    });
  }
  
  // Update settings in FireworkManager
  updateFireworkSettings(settings) {
    // Save to settings manager
    this.settingsManager.updateSettings('fireworks', settings);
    
    // Update FireworkManager
    if (this.animationController && this.animationController.fireworkManager) {
      this.animationController.fireworkManager.updateSettings(settings);
    }
    
    // Check for performance issues
    this.monitorPerformanceSettings();
  }
  
  // Update settings in ParticleManager
  updateParticleSettings(settings) {
    // Save to settings manager
    this.settingsManager.updateSettings('particles', settings);
    
    // Update ParticleManager
    if (this.animationController && this.animationController.particleManager) {
      this.animationController.particleManager.updateSettings(settings);
    }
    
    // Check for performance issues
    this.monitorPerformanceSettings();
  }
  
  // Update effect settings
  updateEffectSettings(settings) {
    // Save to settings manager
    this.settingsManager.updateSettings('effects', settings);
    
    // Update ParticleManager with effect settings
    if (this.animationController && this.animationController.particleManager) {
      this.animationController.particleManager.updateSettings(settings);
    }
    
    // Check for performance issues
    this.monitorPerformanceSettings();
  }
  
  // Update animation settings
  updateAnimationSettings(settings) {
    // Save to settings manager
    this.settingsManager.updateSettings('animation', settings);
    
    // Update AnimationController
    if (this.animationController) {
      this.animationController.updateSettings({
        globalSpeed: settings.globalSpeed
      });
    }
  }
  
  // Update color settings
  updateColorSettings(settings) {
    // Save to settings manager
    this.settingsManager.updateSettings('colors', settings);
    
    // Update ColorManager
    if (this.colorManager) {
      if (settings.theme !== undefined) {
        this.colorManager.setTheme(settings.theme);
      }
      
      if (settings.intensity !== undefined) {
        this.colorManager.setIntensity(settings.intensity);
      }
    }
  }
  
  // Add a custom color to the palette
  addCustomColor(color) {
    // Add to settings
    const colorSettings = this.settingsManager.getSettings('colors');
    if (!colorSettings.customColors.includes(color)) {
      const updatedColors = [...colorSettings.customColors, color];
      this.updateColorSettings({ customColors: updatedColors });
      
      // Update ColorManager
      if (this.colorManager) {
        this.colorManager.addCustomColor(color);
      }
      
      // Update UI
      this.updateCustomColorsUI();
    }
  }
  
  // Remove a custom color from the palette
  removeCustomColor(color) {
    // Remove from settings
    const colorSettings = this.settingsManager.getSettings('colors');
    const updatedColors = colorSettings.customColors.filter(c => c !== color);
    this.updateColorSettings({ customColors: updatedColors });
    
    // Update ColorManager
    if (this.colorManager) {
      this.colorManager.removeCustomColor(color);
    }
    
    // Update UI
    this.updateCustomColorsUI();
  }
  
  // Update the custom colors UI
  updateCustomColorsUI() {
    const container = document.getElementById('customColorsList');
    if (!container) return;
    
    // Clear existing swatches
    container.innerHTML = '';
    
    // Add color swatches
    const colorSettings = this.settingsManager.getSettings('colors');
    
    if (colorSettings.customColors.length === 0) {
      // Show empty state message
      container.innerHTML = '<div class="empty-colors-message">No custom colors added yet.</div>';
    } else {
      // Add color swatches
      colorSettings.customColors.forEach(color => {
        // Create container div for better positioning
        const swatchContainer = document.createElement('div');
        swatchContainer.className = 'color-swatch';
        swatchContainer.style.backgroundColor = color;
        swatchContainer.title = color;
        
        // Add hex value as data attribute
        swatchContainer.dataset.color = color;
        
        // Create remove button with correct positioning
        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '&times;'; // × character
        removeBtn.title = 'Remove color';
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.removeCustomColor(color);
        });
        
        // Append button to swatch
        swatchContainer.appendChild(removeBtn);
        
        // Append swatch to container
        container.appendChild(swatchContainer);
      });
    }
  }
  
  // Reset settings for the current active tab
  resetCurrentTabSettings() {
    const activeTab = this.tabs.activeTab;
    
    // Get default settings from settings manager
    const defaultSettings = new AnimationSettingsManager().settings;
    
    switch(activeTab) {
      case 'audio':
        // Reset audio settings
        const audioDefaults = {
          sensitivity: 1.5,
          quietThreshold: 0.06,
          loudThreshold: 0.4,
          suddenThreshold: 0.15
        };
        this.audioManager.updateSettings(audioDefaults);
        break;
      case 'fireworks':
        this.updateFireworkSettings(defaultSettings.fireworks);
        break;
      case 'particles':
        this.updateParticleSettings(defaultSettings.particles);
        break;
      case 'effects':
        this.updateEffectSettings(defaultSettings.effects);
        break;
      case 'colors':
        this.updateColorSettings(defaultSettings.colors);
        break;
    }
    
    // Update UI to reflect default settings
    this.updateUIFromSettings();
  }
  
  // Update UI controls to reflect current settings
  updateUIFromSettings() {
    // Get all settings
    const fireworkSettings = this.settingsManager.getSettings('fireworks');
    const particleSettings = this.settingsManager.getSettings('particles');
    const effectSettings = this.settingsManager.getSettings('effects');
    const animationSettings = this.settingsManager.getSettings('animation');
    const colorSettings = this.settingsManager.getSettings('colors');
    
    // Update range controls
    this.updateRangeControl('fireworkGravity', 'gravityValue', fireworkSettings.gravity);
    this.updateRangeControl('maxFireworks', 'maxFireworksValue', fireworkSettings.maxFireworks);
    this.updateRangeControl('launchHeight', 'launchHeightValue', fireworkSettings.launchHeightFactor);
    this.updateRangeControl('smokeTrailIntensity', 'smokeTrailValue', fireworkSettings.smokeTrailIntensity);
    
    this.updateRangeControl('particleCount', 'particleCountValue', particleSettings.count);
    this.updateRangeControl('particleLifespan', 'particleLifespanValue', particleSettings.lifespan);
    this.updateRangeControl('particleMinSize', 'particleMinSizeValue', particleSettings.minSize);
    this.updateRangeControl('particleMaxSize', 'particleMaxSizeValue', particleSettings.maxSize);
    
    this.updateRangeControl('fadeResistance', 'fadeResistanceValue', effectSettings.fadeResistance);
    this.updateRangeControl('trailEffect', 'trailEffectValue', effectSettings.trailEffect);
    this.updateRangeControl('globalSpeed', 'globalSpeedValue', animationSettings.globalSpeed);
    
    this.updateRangeControl('colorIntensity', 'colorIntensityValue', colorSettings.intensity);
    
    // Update toggle controls
    this.updateToggleControl('useMultiColor', particleSettings.useMultiColor);
    this.updateToggleControl('glowEffect', effectSettings.glowEnabled);
    this.updateToggleControl('shimmerEffect', effectSettings.shimmerEnabled);
    
    // Update select controls
    this.updateSelectControl('colorTheme', colorSettings.theme);
    
    // Update custom colors UI
    this.updateCustomColorsUI();
    
    // Show/hide custom colors section based on theme
    const customColorsSection = document.getElementById('customColorsSetting');
    if (customColorsSection) {
      customColorsSection.style.display = colorSettings.theme === 'Custom' ? 'block' : 'none';
    }
  }
  
  // Helper for updating range control values
  updateRangeControl(inputId, valueId, value) {
    const input = document.getElementById(inputId);
    const valueDisplay = document.getElementById(valueId);
    
    if (input && value !== undefined) {
      input.value = value;
    }
    
    if (valueDisplay && value !== undefined) {
      valueDisplay.textContent = value;
    }
  }
  
  // Helper for updating toggle control values
  updateToggleControl(inputId, value) {
    const input = document.getElementById(inputId);
    
    if (input && value !== undefined) {
      input.checked = value;
    }
  }
  
  // Helper for updating select control values
  updateSelectControl(inputId, value) {
    const input = document.getElementById(inputId);
    
    if (input && value !== undefined) {
      input.value = value;
    }
  }

  // Monitor for performance-intensive settings
  monitorPerformanceSettings() {
    // Get current settings
    const particleSettings = this.settingsManager.getSettings('particles');
    const effectSettings = this.settingsManager.getSettings('effects');
    const fireworkSettings = this.settingsManager.getSettings('fireworks');
    
    // Check for potentially performance-heavy combinations
    const isHeavyParticles = particleSettings.count > 200;
    const isHeavyEffects = effectSettings.glowEnabled && effectSettings.fadeResistance > 0.95;
    const isHeavyFireworks = fireworkSettings.maxFireworks > 30;
    
    // Show warning if needed
    if (isHeavyParticles || isHeavyEffects || isHeavyFireworks) {
      this.showPerformanceWarning();
    } else {
      this.hidePerformanceWarning();
    }
  }

  // Show performance warning
  showPerformanceWarning() {
    let warningEl = document.getElementById('performanceWarning');
    
    if (!warningEl) {
      warningEl = document.createElement('div');
      warningEl.id = 'performanceWarning';
      warningEl.className = 'performance-warning';
      warningEl.textContent = 'Current settings may impact performance on slower devices. Consider reducing Particle Count, disabling Glow Effect, or lowering Maximum Fireworks.';
      
      // Insert at top of active tab
      const activeTab = document.querySelector('.tab-pane.active');
      if (activeTab) {
        activeTab.insertBefore(warningEl, activeTab.firstChild);
      }
    }
  }

  // Hide performance warning
  hidePerformanceWarning() {
    const warningEl = document.getElementById('performanceWarning');
    if (warningEl) {
      warningEl.remove();
    }
  }
}

export default SettingsController;