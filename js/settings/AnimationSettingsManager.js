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
        launchHeightFactor: 10, // Changed from 0.15 to match HTML slider default
        randomLaunchPower: true,
        randomLaunchPowerMin: 30,
        randomLaunchPowerMax: 90,
        smokeTrailIntensity: 0.3,
        fireworkSize: 1.0,
        randomSize: false,
        randomSizeMin: 0.5,
        randomSizeMax: 2.0,
        
        // NEW: Launch Position Settings
        launchSpread: 20,           // 0-100: percentage of screen width
        launchSpreadMode: 'range',  // 'range', 'random', 'center'
        
        // NEW: Launch Angle Settings  
        launchAngleMin: 60,         // 45-165 degrees
        launchAngleMax: 120,        // 45-165 degrees
        launchAngleMode: 'range',   // 'range', 'random', 'fixed'
        launchAngleFixed: 90        // Fixed angle when mode is 'fixed'
      },
      bubbles: {
        gravity: 0.015,
        maxBubbles: 15,
        riseSpeed: 2.0,
        riseSpeedVariation: 0.5,
        bubbleSize: 1.0,
        randomSize: false,
        randomSizeMin: 0.5,
        randomSizeMax: 2.0,
        launchSpread: 30,
        launchSpreadMode: 'range',
        bubbleClusterSize: 2,
        randomClusterSize: false,
        randomClusterSizeMin: 1,
        randomClusterSizeMax: 6,
        clusterSpread: 20,
        randomRiseSpeed: false,
        randomRiseSpeedMin: 1.0,
        randomRiseSpeedMax: 4.0,
        autoPopHeight: 0.85,
        randomPopHeight: false,
        randomPopHeightMin: 0.70,
        randomPopHeightMax: 1.0,
        wobbleIntensity: 1.0,
        buoyancy: 0.98,
        sequentialPopDelay: 300,
        sequentialPopExplosionDelay: 400,
        loudSoundTriggerCooldown: 250,
        popSensitivity: 0.8
      },
      particles: {
        count: 120,
        lifespan: 1.2,
        minSize: 2,
        maxSize: 5,
        useMultiColor: true
      },
      effects: {
        backgroundRemovalEnabled: true,
        imageRotation: false,
        imageGravity: 1.0,
        glowEnabled: true,
        testSoundEnabled: true,
        testSoundVolume: 0.3,
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