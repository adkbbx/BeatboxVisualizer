/**
 * Controls the settings panel UI and connects it to the application components
 */
import SettingsTabs from './SettingsTabs.js';
import AnimationSettingsManager from './AnimationSettingsManager.js';
import { DEFAULT_SETTINGS } from './DefaultSettings.js';

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
      this.updateAudioSettings({ sensitivity: value });
    });
    
    this.setupRangeControl('thresholdLow', 'thresholdLowValue', value => {
      this.updateAudioSettings({ quietThreshold: value });
    });
    
    this.setupRangeControl('thresholdHigh', 'thresholdHighValue', value => {
      this.updateAudioSettings({ loudThreshold: value });
    });
    
    this.setupRangeControl('suddenThreshold', 'suddenThresholdValue', value => {
      this.updateAudioSettings({ suddenThreshold: value });
    });
    
    // Test sound settings (now handled by SettingsController)
    this.setupToggleControl('testSoundEnabled', value => {
      this.updateAudioSettings({ testSoundEnabled: value });
      // Update test firework manager
      if (this.animationController?.fireworkManager?.testFireworkManager) {
        this.animationController.fireworkManager.testFireworkManager.setSoundEnabled(value);
      }
      // Update test bubble manager
      if (this.animationController?.bubbleManager?.testBubbleManager) {
        this.animationController.bubbleManager.testBubbleManager.setSoundEnabled(value);
      }
    });
    
    this.setupRangeControl('testSoundVolume', 'testSoundVolumeValue', value => {
      this.updateAudioSettings({ testSoundVolume: value });
      // Update test firework manager
      if (this.animationController?.fireworkManager?.testFireworkManager) {
        this.animationController.fireworkManager.testFireworkManager.setSoundVolume(value);
      }
      // Update test bubble manager
      if (this.animationController?.bubbleManager?.testBubbleManager) {
        this.animationController.bubbleManager.testBubbleManager.setSoundVolume(value);
      }
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
    
    // Random launch power toggle
    this.setupToggleControl('randomLaunchPower', isChecked => {
      this.updateFireworkSettings({ randomLaunchPower: isChecked });
      // Show/hide random launch power range controls
      const rangeControls = document.getElementById('randomLaunchPowerRange');
      const maxRangeControls = document.getElementById('randomLaunchPowerMaxSetting');
      if (rangeControls && maxRangeControls) {
        rangeControls.style.display = isChecked ? 'block' : 'none';
        maxRangeControls.style.display = isChecked ? 'block' : 'none';
      }
    });
    
    // Random launch power range controls
    this.setupRangeControl('randomLaunchPowerMin', 'randomLaunchPowerMinValue', value => {
      this.updateFireworkSettings({ randomLaunchPowerMin: value });
    });
    
    this.setupRangeControl('randomLaunchPowerMax', 'randomLaunchPowerMaxValue', value => {
      this.updateFireworkSettings({ randomLaunchPowerMax: value });
    });
    
    this.setupRangeControl('smokeTrailIntensity', 'smokeTrailValue', value => {
      this.updateFireworkSettings({ smokeTrailIntensity: value });
    });
    
    this.setupRangeControl('fireworkSize', 'fireworkSizeValue', value => {
      this.updateFireworkSettings({ fireworkSize: value });
    });
    
    // Random firework size toggle
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
    
    // Random firework size range controls
    this.setupRangeControl('randomSizeMin', 'randomSizeMinValue', value => {
      this.updateFireworkSettings({ randomSizeMin: value });
    });
    
    this.setupRangeControl('randomSizeMax', 'randomSizeMaxValue', value => {
      this.updateFireworkSettings({ randomSizeMax: value });
    });

    // Bubble settings
    this.setupRangeControl('bubbleSize', 'bubbleSizeValue', value => {
      this.updateBubbleSettings({ bubbleSize: parseFloat(value) });
    });

    this.setupRangeControl('bubbleClusterSize', 'bubbleClusterSizeValue', value => {
      this.updateBubbleSettings({ bubbleClusterSize: parseInt(value) });
    });

    // Random bubble cluster size toggle
    this.setupToggleControl('randomBubbleClusterSize', isChecked => {
      this.updateBubbleSettings({ randomClusterSize: isChecked });
      // Show/hide random cluster size range controls
      const rangeControls = document.getElementById('randomClusterSizeRange');
      const maxRangeControls = document.getElementById('randomClusterSizeMaxSetting');
      if (rangeControls && maxRangeControls) {
        rangeControls.style.display = isChecked ? 'block' : 'none';
        maxRangeControls.style.display = isChecked ? 'block' : 'none';
      }
    });

    // Random cluster size range controls
    this.setupRangeControl('randomClusterSizeMin', 'randomClusterSizeMinValue', value => {
      this.updateBubbleSettings({ randomClusterSizeMin: parseInt(value) });
    });

    this.setupRangeControl('randomClusterSizeMax', 'randomClusterSizeMaxValue', value => {
      this.updateBubbleSettings({ randomClusterSizeMax: parseInt(value) });
    });

    this.setupRangeControl('bubbleLaunchSpread', 'bubbleLaunchSpreadValue', value => {
      this.updateBubbleSettings({ launchSpread: parseInt(value) });
    });

    this.setupRangeControl('bubbleRiseSpeed', 'bubbleRiseSpeedValue', value => {
      this.updateBubbleSettings({ riseSpeed: parseFloat(value) });
    });

    this.setupRangeControl('bubbleAutoPopHeight', 'bubbleAutoPopHeightValue', value => {
      // Convert from inverted percentage (10-100) to normalized value (0.1-1.0)
      // Higher slider value = higher in sky = higher normalized value
      this.updateBubbleSettings({ autoPopHeight: parseFloat(value) / 100 });
    });

    this.setupRangeControl('maxBubbles', 'maxBubblesValue', value => {
      this.updateBubbleSettings({ maxBubbles: parseInt(value) });
    });

    this.setupRangeControl('bubbleGravity', 'bubbleGravityValue', value => {
      this.updateBubbleSettings({ gravity: parseFloat(value) });
    });

    this.setupRangeControl('bubbleClusterSpread', 'bubbleClusterSpreadValue', value => {
      this.updateBubbleSettings({ clusterSpread: parseInt(value) });
    });

    this.setupRangeControl('randomRiseSpeedMin', 'randomRiseSpeedMinValue', value => {
      this.updateBubbleSettings({ randomRiseSpeedMin: parseFloat(value) });
    });

    this.setupRangeControl('randomRiseSpeedMax', 'randomRiseSpeedMaxValue', value => {
      this.updateBubbleSettings({ randomRiseSpeedMax: parseFloat(value) });
    });

    this.setupRangeControl('randomPopHeightMin', 'randomPopHeightMinValue', value => {
      // Convert from inverted percentage (10-100) to normalized value (0.1-1.0)
      // Higher slider value = higher in sky = higher normalized value
      this.updateBubbleSettings({ randomPopHeightMin: parseFloat(value) / 100 });
    });

    this.setupRangeControl('randomPopHeightMax', 'randomPopHeightMaxValue', value => {
      // Convert from inverted percentage (10-100) to normalized value (0.1-1.0)
      // Higher slider value = higher in sky = higher normalized value
      this.updateBubbleSettings({ randomPopHeightMax: parseFloat(value) / 100 });
    });

    this.setupRangeControl('bubbleWobble', 'bubbleWobbleValue', value => {
      this.updateBubbleSettings({ wobbleIntensity: parseFloat(value) });
    });

    this.setupRangeControl('bubbleBuoyancy', 'bubbleBuoyancyValue', value => {
      this.updateBubbleSettings({ buoyancy: parseFloat(value) });
    });

    // Random bubble size toggle
    this.setupToggleControl('randomBubbleSize', isChecked => {
      this.updateBubbleSettings({ randomSize: isChecked });
      // Show/hide random bubble size range controls
      const rangeControls = document.getElementById('randomBubbleSizeRange');
      const maxRangeControls = document.getElementById('randomBubbleSizeMaxSetting');
      if (rangeControls && maxRangeControls) {
        rangeControls.style.display = isChecked ? 'block' : 'none';
        maxRangeControls.style.display = isChecked ? 'block' : 'none';
      }
    });

    // Random bubble size range controls
    this.setupRangeControl('randomBubbleSizeMin', 'randomBubbleSizeMinValue', value => {
      this.updateBubbleSettings({ randomSizeMin: parseFloat(value) });
    });

    this.setupRangeControl('randomBubbleSizeMax', 'randomBubbleSizeMaxValue', value => {
      this.updateBubbleSettings({ randomSizeMax: parseFloat(value) });
    });

    // Random bubble rise speed toggle
    this.setupToggleControl('randomBubbleRiseSpeed', isChecked => {
      this.updateBubbleSettings({ randomRiseSpeed: isChecked });
      // Show/hide random rise speed range controls
      const rangeControls = document.getElementById('randomRiseSpeedRange');
      const maxRangeControls = document.getElementById('randomRiseSpeedMaxSetting');
      if (rangeControls && maxRangeControls) {
        rangeControls.style.display = isChecked ? 'block' : 'none';
        maxRangeControls.style.display = isChecked ? 'block' : 'none';
      }
    });

    // Random bubble pop height toggle
    this.setupToggleControl('randomBubblePopHeight', isChecked => {
      this.updateBubbleSettings({ randomPopHeight: isChecked });
      // Show/hide random pop height range controls
      const rangeControls = document.getElementById('randomPopHeightRange');
      const maxRangeControls = document.getElementById('randomPopHeightMaxSetting');
      if (rangeControls && maxRangeControls) {
        rangeControls.style.display = isChecked ? 'block' : 'none';
        maxRangeControls.style.display = isChecked ? 'block' : 'none';
      }
    });

    // Bubble launch spread mode
    const bubbleLaunchSpreadModeSelect = document.getElementById('bubbleLaunchSpreadMode');
    if (bubbleLaunchSpreadModeSelect) {
      bubbleLaunchSpreadModeSelect.addEventListener('change', () => {
        this.updateBubbleSettings({ launchSpreadMode: bubbleLaunchSpreadModeSelect.value });
      });
    }
    
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
    
    this.setupRangeControl('fadeResistance', 'fadeResistanceValue', value => {
      this.updateEffectSettings({ fadeResistance: value });
    });
    
    this.setupRangeControl('imageGravity', 'imageGravityValue', value => {
      this.updateEffectSettings({ imageGravity: value });
      // Also update global variable for CustomImage
      window.imageGravityMultiplier = value;
    });
    
    // Background settings
    this.setupRangeControl('bgOpacity', 'bgOpacityValue', value => {
      this.updateBackgroundSettings({ opacity: value });
    });
    
    this.setupRangeControl('bgTransitionTime', 'bgTransitionValue', value => {
      this.updateBackgroundSettings({ transitionTime: value });
    });
    
    this.setupRangeControl('bgDisplayTime', 'bgDisplayValue', value => {
      this.updateBackgroundSettings({ displayTime: value });
    });
    
    // Video-specific settings
    this.setupToggleControl('videoLoop', value => {
      this.updateBackgroundSettings({ videoLoop: value });
    });
    
    this.setupRangeControl('videoVolume', 'videoVolumeValue', value => {
      this.updateBackgroundSettings({ videoVolume: value });
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
  
  // Update audio settings (handles both audio analysis and test sound settings)
  updateAudioSettings(settings) {
    // Update AudioManager for audio analysis settings
    if (this.audioManager && (settings.sensitivity !== undefined || settings.quietThreshold !== undefined || 
        settings.loudThreshold !== undefined || settings.suddenThreshold !== undefined)) {
      this.audioManager.updateSettings(settings);
    }
    
    // Update UI controls immediately
    if (settings.sensitivity !== undefined) {
      this.updateRangeControl('sensitivitySlider', 'sensitivityValue', settings.sensitivity);
    }
    if (settings.quietThreshold !== undefined) {
      this.updateRangeControl('thresholdLow', 'thresholdLowValue', settings.quietThreshold);
    }
    if (settings.loudThreshold !== undefined) {
      this.updateRangeControl('thresholdHigh', 'thresholdHighValue', settings.loudThreshold);
    }
    if (settings.suddenThreshold !== undefined) {
      this.updateRangeControl('suddenThreshold', 'suddenThresholdValue', settings.suddenThreshold);
    }
    if (settings.testSoundEnabled !== undefined) {
      this.updateToggleControl('testSoundEnabled', settings.testSoundEnabled);
    }
    if (settings.testSoundVolume !== undefined) {
      this.updateRangeControl('testSoundVolume', 'testSoundVolumeValue', settings.testSoundVolume);
    }
    
    // Save audio settings to localStorage for persistence
    try {
      let savedAudioSettings = {};
      const existingSettings = localStorage.getItem('vibecoding-settings');
      if (existingSettings) {
        savedAudioSettings = JSON.parse(existingSettings);
      }
      
      const updatedAudioSettings = { ...savedAudioSettings, ...settings };
      localStorage.setItem('vibecoding-settings', JSON.stringify(updatedAudioSettings));
    } catch (error) {
      console.error('[SettingsController] Failed to save audio settings:', error);
    }
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
  
  // Update settings in BubbleManager
  updateBubbleSettings(settings) {
    // Save to settings manager
    this.settingsManager.updateSettings('bubbles', settings);
    
    // Update BubbleManager
    if (this.animationController && this.animationController.bubbleManager) {
      this.animationController.bubbleManager.updateSettings(settings);
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
  
  // Update background settings
  updateBackgroundSettings(settings) {
    // Update UI controls immediately
    if (settings.opacity !== undefined) {
      this.updateRangeControl('bgOpacity', 'bgOpacityValue', settings.opacity);
      // Update background manager
      if (window.backgroundSystem && window.backgroundSystem.backgroundManager) {
        window.backgroundSystem.backgroundManager.updateSettings({ opacity: settings.opacity });
      }
    }
    if (settings.transitionTime !== undefined) {
      this.updateRangeControl('bgTransitionTime', 'bgTransitionValue', settings.transitionTime);
      // Update background manager (convert to milliseconds)
      if (window.backgroundSystem && window.backgroundSystem.backgroundManager) {
        window.backgroundSystem.backgroundManager.updateSettings({ transitionDuration: settings.transitionTime * 1000 });
      }
    }
    if (settings.displayTime !== undefined) {
      this.updateRangeControl('bgDisplayTime', 'bgDisplayValue', settings.displayTime);
      // Update background manager (convert to milliseconds)
      if (window.backgroundSystem && window.backgroundSystem.backgroundManager) {
        window.backgroundSystem.backgroundManager.updateSettings({ displayDuration: settings.displayTime * 1000 });
      }
    }
    if (settings.videoLoop !== undefined) {
      this.updateToggleControl('videoLoop', settings.videoLoop);
      // Update background manager
      if (window.backgroundSystem && window.backgroundSystem.backgroundManager) {
        window.backgroundSystem.backgroundManager.updateSettings({ videoLoop: settings.videoLoop });
      }
    }
    if (settings.videoVolume !== undefined) {
      this.updateRangeControl('videoVolume', 'videoVolumeValue', settings.videoVolume);
      // Update background manager
      if (window.backgroundSystem && window.backgroundSystem.backgroundManager) {
        window.backgroundSystem.backgroundManager.updateSettings({ videoVolume: settings.videoVolume });
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

    switch(activeTab) {
      case 'audio':
        this.updateAudioSettings(DEFAULT_SETTINGS.audio);
        break;
      case 'fireworks':
        this.updateFireworkSettings(DEFAULT_SETTINGS.fireworks);
        
        // Also reset Launch Controls Manager if it exists
        if (window.launchControlsManager) {
          window.launchControlsManager.applyPreset('classic');
          
          const presetSelect = document.getElementById('launchPreset');
          if (presetSelect) {
            presetSelect.value = 'classic';
            const presetDescription = document.getElementById('presetDescription');
            if (presetDescription) {
              presetDescription.textContent = window.launchControlsManager.presets['classic'].description;
            }
          }
        }
        break;
      case 'bubbles':
        this.updateBubbleSettings(DEFAULT_SETTINGS.bubbles);
        break;
      case 'effects':
        // Effects tab contains particle settings and other effects
        this.updateParticleSettings(DEFAULT_SETTINGS.particles);
        this.updateEffectSettings(DEFAULT_SETTINGS.effects);
        break;
      case 'colors':
        this.updateColorSettings(DEFAULT_SETTINGS.colors);
        break;
      case 'images':
        this.updateEffectSettings(DEFAULT_SETTINGS.effects);
        this.updateBackgroundSettings(DEFAULT_SETTINGS.background);
        // Reset video settings to defaults
        this.updateBackgroundSettings({ 
          videoLoop: true, 
          videoVolume: 0 
        });
        break;
    }

    // Update UI to reflect default settings
    this.updateUIFromSettings();
  }
  
  // Update UI controls to reflect current settings
  updateUIFromSettings() {
    // Get all settings from AnimationSettingsManager
    const fireworkSettings = this.settingsManager.getSettings('fireworks');
    const bubbleSettings = this.settingsManager.getSettings('bubbles');
    const particleSettings = this.settingsManager.getSettings('particles');
    const effectSettings = this.settingsManager.getSettings('effects');
    const animationSettings = this.settingsManager.getSettings('animation');
    const colorSettings = this.settingsManager.getSettings('colors');
    
    // Load audio settings from localStorage (separate storage)
    let audioSettings = { ...DEFAULT_SETTINGS.audio };
    
    try {
      const savedAudioSettings = localStorage.getItem('vibecoding-settings');
      if (savedAudioSettings) {
        const parsedAudioSettings = JSON.parse(savedAudioSettings);
        audioSettings = { ...audioSettings, ...parsedAudioSettings };
      }
    } catch (error) {
      console.error('[SettingsController] Failed to load audio settings:', error);
    }

    // Update ColorManager instance with all loaded color settings
    if (this.colorManager) {
        this.colorManager.setTheme(colorSettings.theme);
        this.colorManager.setIntensity(colorSettings.intensity);
        if (colorSettings.customColors && Array.isArray(colorSettings.customColors)) {
            this.colorManager.setCustomColors(colorSettings.customColors);
        }
    }

    // Update audio range controls
    this.updateRangeControl('sensitivitySlider', 'sensitivityValue', audioSettings.sensitivity);
    this.updateRangeControl('thresholdLow', 'thresholdLowValue', audioSettings.quietThreshold);
    this.updateRangeControl('thresholdHigh', 'thresholdHighValue', audioSettings.loudThreshold);
    this.updateRangeControl('suddenThreshold', 'suddenThresholdValue', audioSettings.suddenThreshold);
    this.updateRangeControl('testSoundVolume', 'testSoundVolumeValue', audioSettings.testSoundVolume);

    // Update other range controls
    this.updateRangeControl('fireworkGravity', 'gravityValue', fireworkSettings.gravity);
    this.updateRangeControl('maxFireworks', 'maxFireworksValue', fireworkSettings.maxFireworks);
    this.updateRangeControl('launchHeight', 'launchHeightValue', fireworkSettings.launchHeightFactor);
    this.updateRangeControl('smokeTrailIntensity', 'smokeTrailValue', fireworkSettings.smokeTrailIntensity);
    this.updateRangeControl('fireworkSize', 'fireworkSizeValue', fireworkSettings.fireworkSize);
    this.updateRangeControl('randomSizeMin', 'randomSizeMinValue', fireworkSettings.randomSizeMin);
    this.updateRangeControl('randomSizeMax', 'randomSizeMaxValue', fireworkSettings.randomSizeMax);
    this.updateRangeControl('randomLaunchPowerMin', 'randomLaunchPowerMinValue', fireworkSettings.randomLaunchPowerMin);
    this.updateRangeControl('randomLaunchPowerMax', 'randomLaunchPowerMaxValue', fireworkSettings.randomLaunchPowerMax);
    
    // Update bubble range controls
    this.updateRangeControl('bubbleSize', 'bubbleSizeValue', bubbleSettings.bubbleSize);
    this.updateRangeControl('bubbleClusterSize', 'bubbleClusterSizeValue', bubbleSettings.bubbleClusterSize);
    this.updateRangeControl('randomClusterSizeMin', 'randomClusterSizeMinValue', bubbleSettings.randomClusterSizeMin);
    this.updateRangeControl('randomClusterSizeMax', 'randomClusterSizeMaxValue', bubbleSettings.randomClusterSizeMax);
    this.updateRangeControl('bubbleLaunchSpread', 'bubbleLaunchSpreadValue', bubbleSettings.launchSpread);
    this.updateRangeControl('bubbleRiseSpeed', 'bubbleRiseSpeedValue', bubbleSettings.riseSpeed);
    this.updateRangeControl('bubbleAutoPopHeight', 'bubbleAutoPopHeightValue', Math.round(bubbleSettings.autoPopHeight * 100));
    this.updateRangeControl('maxBubbles', 'maxBubblesValue', bubbleSettings.maxBubbles);
    this.updateRangeControl('bubbleGravity', 'bubbleGravityValue', bubbleSettings.gravity);
    this.updateRangeControl('bubbleClusterSpread', 'bubbleClusterSpreadValue', bubbleSettings.clusterSpread);
    this.updateRangeControl('randomRiseSpeedMin', 'randomRiseSpeedMinValue', bubbleSettings.randomRiseSpeedMin);
    this.updateRangeControl('randomRiseSpeedMax', 'randomRiseSpeedMaxValue', bubbleSettings.randomRiseSpeedMax);
    this.updateRangeControl('randomPopHeightMin', 'randomPopHeightMinValue', Math.round(bubbleSettings.randomPopHeightMin * 100));
    this.updateRangeControl('randomPopHeightMax', 'randomPopHeightMaxValue', Math.round(bubbleSettings.randomPopHeightMax * 100));
    this.updateRangeControl('randomBubbleSizeMin', 'randomBubbleSizeMinValue', bubbleSettings.randomSizeMin);
    this.updateRangeControl('randomBubbleSizeMax', 'randomBubbleSizeMaxValue', bubbleSettings.randomSizeMax);
    this.updateRangeControl('bubbleWobble', 'bubbleWobbleValue', bubbleSettings.wobbleIntensity);
    this.updateRangeControl('bubbleBuoyancy', 'bubbleBuoyancyValue', bubbleSettings.buoyancy);
    
    this.updateRangeControl('particleCount', 'particleCountValue', particleSettings.count);
    this.updateRangeControl('particleLifespan', 'particleLifespanValue', particleSettings.lifespan * 60);
    this.updateRangeControl('particleMinSize', 'particleMinSizeValue', particleSettings.minSize);
    this.updateRangeControl('particleMaxSize', 'particleMaxSizeValue', particleSettings.maxSize);
    
    this.updateRangeControl('fadeResistance', 'fadeResistanceValue', effectSettings.fadeResistance);
    this.updateRangeControl('imageGravity', 'imageGravityValue', effectSettings.imageGravity);
    this.updateRangeControl('testSoundVolume', 'testSoundVolumeValue', effectSettings.testSoundVolume);
    this.updateRangeControl('globalSpeed', 'globalSpeedValue', animationSettings.globalSpeed);
    
    // Update background controls with defaults
    this.updateRangeControl('bgOpacity', 'bgOpacityValue', DEFAULT_SETTINGS.background.opacity);
    this.updateRangeControl('bgTransitionTime', 'bgTransitionValue', DEFAULT_SETTINGS.background.transitionTime);
    this.updateRangeControl('bgDisplayTime', 'bgDisplayValue', DEFAULT_SETTINGS.background.displayTime);
    
    // Update video controls with defaults
    this.updateToggleControl('videoLoop', true); // Default to loop enabled
    this.updateRangeControl('videoVolume', 'videoVolumeValue', 0); // Default to muted
    
    this.updateRangeControl('colorIntensity', 'colorIntensityValue', colorSettings.intensity);
    
    // Update toggle controls
    this.updateToggleControl('backgroundRemovalEnabled', effectSettings.backgroundRemovalEnabled);
    this.updateToggleControl('imageRotation', effectSettings.imageRotation);
    this.updateToggleControl('testSoundEnabled', audioSettings.testSoundEnabled);
    this.updateToggleControl('useMultiColor', particleSettings.useMultiColor);
    this.updateToggleControl('glowEffect', effectSettings.glowEnabled);
    this.updateToggleControl('randomFireworkSize', fireworkSettings.randomSize);
    this.updateToggleControl('randomLaunchPower', fireworkSettings.randomLaunchPower);
    
    // Update bubble toggle controls
    this.updateToggleControl('randomBubbleSize', bubbleSettings.randomSize);
    this.updateToggleControl('randomBubbleClusterSize', bubbleSettings.randomClusterSize);
    this.updateToggleControl('randomBubbleRiseSpeed', bubbleSettings.randomRiseSpeed);
    this.updateToggleControl('randomBubblePopHeight', bubbleSettings.randomPopHeight);
    
    // Show/hide random size range controls based on toggle state
    const rangeControls = document.getElementById('randomSizeRange');
    const maxRangeControls = document.getElementById('randomSizeMaxSetting');
    if (rangeControls && maxRangeControls) {
      rangeControls.style.display = fireworkSettings.randomSize ? 'block' : 'none';
      maxRangeControls.style.display = fireworkSettings.randomSize ? 'block' : 'none';
    }
    
    // Show/hide random launch power range controls based on toggle state
    const launchPowerRangeControls = document.getElementById('randomLaunchPowerRange');
    const launchPowerMaxRangeControls = document.getElementById('randomLaunchPowerMaxSetting');
    if (launchPowerRangeControls && launchPowerMaxRangeControls) {
      launchPowerRangeControls.style.display = fireworkSettings.randomLaunchPower ? 'block' : 'none';
      launchPowerMaxRangeControls.style.display = fireworkSettings.randomLaunchPower ? 'block' : 'none';
    }
    
    // Show/hide bubble random size range controls based on toggle state
    const bubbleSizeRangeControls = document.getElementById('randomBubbleSizeRange');
    const bubbleSizeMaxRangeControls = document.getElementById('randomBubbleSizeMaxSetting');
    if (bubbleSizeRangeControls && bubbleSizeMaxRangeControls) {
      bubbleSizeRangeControls.style.display = bubbleSettings.randomSize ? 'block' : 'none';
      bubbleSizeMaxRangeControls.style.display = bubbleSettings.randomSize ? 'block' : 'none';
    }
    
    // Show/hide bubble random cluster size range controls based on toggle state
    const bubbleClusterSizeRangeControls = document.getElementById('randomClusterSizeRange');
    const bubbleClusterSizeMaxRangeControls = document.getElementById('randomClusterSizeMaxSetting');
    if (bubbleClusterSizeRangeControls && bubbleClusterSizeMaxRangeControls) {
      bubbleClusterSizeRangeControls.style.display = bubbleSettings.randomClusterSize ? 'block' : 'none';
      bubbleClusterSizeMaxRangeControls.style.display = bubbleSettings.randomClusterSize ? 'block' : 'none';
    }
    
    // Show/hide bubble random rise speed range controls based on toggle state
    const bubbleRiseSpeedRangeControls = document.getElementById('randomRiseSpeedRange');
    const bubbleRiseSpeedMaxRangeControls = document.getElementById('randomRiseSpeedMaxSetting');
    if (bubbleRiseSpeedRangeControls && bubbleRiseSpeedMaxRangeControls) {
      bubbleRiseSpeedRangeControls.style.display = bubbleSettings.randomRiseSpeed ? 'block' : 'none';
      bubbleRiseSpeedMaxRangeControls.style.display = bubbleSettings.randomRiseSpeed ? 'block' : 'none';
    }
    
    // Show/hide bubble random pop height range controls based on toggle state
    const bubblePopHeightRangeControls = document.getElementById('randomPopHeightRange');
    const bubblePopHeightMaxRangeControls = document.getElementById('randomPopHeightMaxSetting');
    if (bubblePopHeightRangeControls && bubblePopHeightMaxRangeControls) {
      bubblePopHeightRangeControls.style.display = bubbleSettings.randomPopHeight ? 'block' : 'none';
      bubblePopHeightMaxRangeControls.style.display = bubbleSettings.randomPopHeight ? 'block' : 'none';
    }
    
    // Update select controls
    this.updateSelectControl('colorTheme', colorSettings.theme);
    
    // Update bubble select controls
    this.updateSelectControl('bubbleLaunchSpreadMode', bubbleSettings.launchSpreadMode);
    
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
    
    // Check for valid numeric value
    if (value === undefined || value === null || isNaN(value)) {
      console.warn(`[SettingsController] Invalid value for ${inputId}:`, value);
      return;
    }
    
    if (input) {
      input.value = value;
    }
    
    if (valueDisplay) {
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