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
    
    // Ensure custom colors visibility is set correctly after DOM is ready
    setTimeout(() => {
      const colorSettings = this.settingsManager.getSettings('colors');
      this.updateCustomColorsSectionVisibility(colorSettings.theme);
    }, 100);
  }
  
  // Initialize all event listeners for settings controls
  initializeEventListeners() {
    // Audio settings
    this.setupRangeControl('sensitivitySlider', 'sensitivityValue', value => {
      this.audioManager.updateSettings({ sensitivity: value });
    });
    
    this.setupRangeControl('thresholdLow', 'thresholdLowValue', value => {
      this.audioManager.updateSettings({ quietThreshold: value });
    });
    
    this.setupRangeControl('thresholdHigh', 'thresholdHighValue', value => {
      this.audioManager.updateSettings({ loudThreshold: value });
    });
    
    this.setupRangeControl('suddenThreshold', 'suddenThresholdValue', value => {
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
    
    this.setupRangeControl('fireworkSize', 'fireworkSizeValue', value => {
      this.updateFireworkSettings({ fireworkSize: value });
    });
    
    // Random size toggle
    this.setupToggleControl('randomFireworkSize', isChecked => {
      this.updateFireworkSettings({ randomSize: isChecked });
      // Show/hide random size range controls
      const rangeControls = document.getElementById('randomSizeRange');
      const maxRangeControls = document.getElementById('randomSizeMaxSetting');
      if (rangeControls && maxRangeControls) {
        rangeControls.style.display = isChecked ? 'block' : 'none';
        maxRangeControls.style.display = isChecked ? 'block' : 'none';
      }
    });
    
    // Random size range controls
    this.setupRangeControl('randomSizeMin', 'randomSizeMinValue', value => {
      this.updateFireworkSettings({ randomSizeMin: value });
    });
    
    this.setupRangeControl('randomSizeMax', 'randomSizeMaxValue', value => {
      this.updateFireworkSettings({ randomSizeMax: value });
    });
    
    // Particle settings
    this.setupRangeControl('particleCount', 'particleCountValue', value => {
      this.updateParticleSettings({ count: value });
    });
    
    this.setupRangeControl('particleLifespan', 'particleLifespanValue', value => {
      // Convert frames to seconds (assuming 60 FPS)
      this.updateParticleSettings({ lifespan: value / 60 });
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
    this.setupToggleControl('backgroundRemovalEnabled', value => {
      this.updateEffectSettings({ backgroundRemovalEnabled: value });
    });
    
    this.setupToggleControl('imageRotation', value => {
      this.updateEffectSettings({ imageRotation: value });
    });
    
    this.setupToggleControl('glowEffect', value => {
      this.updateEffectSettings({ glowEnabled: value });
    });
    
    this.setupToggleControl('testSoundEnabled', value => {
      this.updateEffectSettings({ testSoundEnabled: value });
    });
    
    this.setupRangeControl('fadeResistance', 'fadeResistanceValue', value => {
      this.updateEffectSettings({ fadeResistance: value });
    });
    
    this.setupRangeControl('imageGravity', 'imageGravityValue', value => {
      this.updateEffectSettings({ imageGravity: value });
    });
    
    this.setupRangeControl('testSoundVolume', 'testSoundVolumeValue', value => {
      this.updateEffectSettings({ testSoundVolume: value });
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
        this.updateCustomColorsSectionVisibility(theme);
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
    const closeButton = document.getElementById('closeSettings');
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
      if (settings.customColors !== undefined) {
        this.colorManager.setCustomColors(settings.customColors);
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
        
        // Apply direct styles with !important-like approach for guaranteed visibility
        swatchContainer.style.cssText = `
          position: relative !important;
          display: inline-block !important;
          width: 35px !important;
          height: 35px !important;
          margin: 5px !important;
          border-radius: 4px !important;
          border: 2px solid white !important;
          box-shadow: 0 0 6px rgba(0, 0, 0, 0.5) !important;
          cursor: pointer !important;
          opacity: 1 !important;
          overflow: visible !important;
          visibility: visible !important;
          background-color: ${color} !important;
        `;
        
        swatchContainer.title = color;
        
        // Add hex value as data attribute for tooltip
        swatchContainer.dataset.color = color;
        
        // Create remove button with improved styling
        const removeBtn = document.createElement('button');
        removeBtn.innerHTML = '✖'; // Heavy multiplication X (was &times;)
        removeBtn.title = 'Remove color';
        removeBtn.setAttribute('aria-label', `Remove ${color} from palette`);
        
        // Apply direct styles to the button for guaranteed visibility
        removeBtn.style.cssText = `
          position: absolute !important;
          top: -5px !important; 
          right: -5px !important; 
          width: 20px !important; /* Exact match with height */
          height: 20px !important;
          min-width: 20px !important; /* Force minimum width */
          max-width: 20px !important; /* Force maximum width */
          background-color: rgba(45, 45, 45, 0.9) !important;  /* Darker, more solid background */
          color: #ffffff !important;                         /* Pure white 'x' */
          border-radius: 999px !important; /* Use a large value to ensure roundness */
          border: 1px solid rgba(80, 80, 80, 0.9) !important; /* Slightly more defined border */
          font-size: 10px !important;
          line-height: 1 !important; /* Reset line height */
          padding: 0 !important;
          margin: 0 !important; /* Reset margins */
          text-align: center !important;
          cursor: pointer !important;
          z-index: 1000 !important;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          overflow: hidden !important; /* Prevent content from breaking circular shape */
          box-sizing: border-box !important; /* Include border in dimensions */
        `;
        
        // Add click event to remove color
        removeBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          this.removeCustomColor(color);
        });
        
        // Also allow clicking the swatch itself to remove
        swatchContainer.addEventListener('click', () => {
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
    
    // Update ColorManager instance with all loaded color settings
    if (this.colorManager) {
        this.colorManager.setTheme(colorSettings.theme);
        this.colorManager.setIntensity(colorSettings.intensity);
        if (colorSettings.customColors && Array.isArray(colorSettings.customColors)) {
            this.colorManager.setCustomColors(colorSettings.customColors);
        }
    }

    // Update range controls
    this.updateRangeControl('fireworkGravity', 'gravityValue', fireworkSettings.gravity);
    this.updateRangeControl('maxFireworks', 'maxFireworksValue', fireworkSettings.maxFireworks);
    this.updateRangeControl('launchHeight', 'launchHeightValue', fireworkSettings.launchHeightFactor);
    this.updateRangeControl('smokeTrailIntensity', 'smokeTrailValue', fireworkSettings.smokeTrailIntensity);
    this.updateRangeControl('fireworkSize', 'fireworkSizeValue', fireworkSettings.fireworkSize);
    this.updateRangeControl('randomSizeMin', 'randomSizeMinValue', fireworkSettings.randomSizeMin);
    this.updateRangeControl('randomSizeMax', 'randomSizeMaxValue', fireworkSettings.randomSizeMax);
    
    this.updateRangeControl('particleCount', 'particleCountValue', particleSettings.count);
    this.updateRangeControl('particleLifespan', 'particleLifespanValue', particleSettings.lifespan * 60);
    this.updateRangeControl('particleMinSize', 'particleMinSizeValue', particleSettings.minSize);
    this.updateRangeControl('particleMaxSize', 'particleMaxSizeValue', particleSettings.maxSize);
    
    this.updateRangeControl('fadeResistance', 'fadeResistanceValue', effectSettings.fadeResistance);
    this.updateRangeControl('imageGravity', 'imageGravityValue', effectSettings.imageGravity);
    this.updateRangeControl('testSoundVolume', 'testSoundVolumeValue', effectSettings.testSoundVolume);
    this.updateRangeControl('globalSpeed', 'globalSpeedValue', animationSettings.globalSpeed);
    
    this.updateRangeControl('colorIntensity', 'colorIntensityValue', colorSettings.intensity);
    
    // Update toggle controls
    this.updateToggleControl('backgroundRemovalEnabled', effectSettings.backgroundRemovalEnabled);
    this.updateToggleControl('imageRotation', effectSettings.imageRotation);
    this.updateToggleControl('testSoundEnabled', effectSettings.testSoundEnabled);
    this.updateToggleControl('useMultiColor', particleSettings.useMultiColor);
    this.updateToggleControl('glowEffect', effectSettings.glowEnabled);
    this.updateToggleControl('randomFireworkSize', fireworkSettings.randomSize);
    
    // Show/hide random size range controls based on toggle state
    const rangeControls = document.getElementById('randomSizeRange');
    const maxRangeControls = document.getElementById('randomSizeMaxSetting');
    if (rangeControls && maxRangeControls) {
      rangeControls.style.display = fireworkSettings.randomSize ? 'block' : 'none';
      maxRangeControls.style.display = fireworkSettings.randomSize ? 'block' : 'none';
    }
    
    // Update select controls
    this.updateSelectControl('colorTheme', colorSettings.theme);
    
    // Update custom colors UI
    this.updateCustomColorsUI();
    
    // Ensure custom colors section visibility is set correctly
    this.updateCustomColorsSectionVisibility(colorSettings.theme);
  }
  
  /**
   * Update the visibility of the custom colors section based on theme
   * @param {string} theme - The current color theme
   */
  updateCustomColorsSectionVisibility(theme) {
    const customColorsSection = document.getElementById('customColorsSetting');
    if (customColorsSection) {
      if (theme === 'Custom') {
        customColorsSection.classList.add('custom-colors-visible');
      } else {
        customColorsSection.classList.remove('custom-colors-visible');
      }
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