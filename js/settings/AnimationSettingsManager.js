/**
 * Manages animation settings for the application
 * Handles saving/loading settings from localStorage
 */
class AnimationSettingsManager {
  constructor() {
    // Default settings
    this.settings = {
      fireworks: {
        gravity: 0.02,
        maxFireworks: 20,
        launchHeightFactor: 0.15,
        smokeTrailIntensity: 0.3
      },
      particles: {
        count: 120,
        lifespan: 1.2,
        minSize: 2,
        maxSize: 5,
        useMultiColor: true
      },
      effects: {
        glowEnabled: true,
        shimmerEnabled: true,
        fadeResistance: 0.92,
        trailEffect: 0.8
      },
      animation: {
        globalSpeed: 1.0
      },
      colors: {
        theme: 'Vivid',
        customColors: [],
        intensity: 1.0
      }
    };
    
    // Load saved settings
    this.loadSettings();
  }
  
  // Get settings for a specific category
  getSettings(category) {
    return { ...this.settings[category] };
  }
  
  // Update settings
  updateSettings(category, newSettings) {
    this.settings[category] = { ...this.settings[category], ...newSettings };
    this.saveSettings();
    return this.settings[category];
  }
  
  // Save settings to localStorage
  saveSettings() {
    try {
      localStorage.setItem('vibecoding-animation-settings', JSON.stringify(this.settings));
    } catch (error) {
    }
  }
  
  // Load settings from localStorage
  loadSettings() {
    try {
      const savedSettings = localStorage.getItem('vibecoding-animation-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        // Deep merge to preserve defaults for any missing properties
        this.settings = this.deepMerge(this.settings, parsed);
      }
    } catch (error) {
    }
  }
  
  // Helper for deep merging objects
  deepMerge(target, source) {
    const output = { ...target };
    
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (isObject(source[key]) && isObject(target[key])) {
          output[key] = this.deepMerge(target[key], source[key]);
        } else {
          output[key] = source[key];
        }
      }
    }
    
    return output;
    
    function isObject(item) {
      return item && typeof item === 'object' && !Array.isArray(item);
    }
  }
}

export default AnimationSettingsManager;