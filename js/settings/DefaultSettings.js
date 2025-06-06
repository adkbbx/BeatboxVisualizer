/**
 * Centralized default settings for the entire application
 * This ensures consistency across all settings systems
 */

export const DEFAULT_SETTINGS = {
  // Audio settings (stored in 'vibecoding-settings')
  audio: {
    sensitivity: 1.5,
    quietThreshold: 0.06,
    loudThreshold: 0.18, // Lowered for better bubble sensitivity
    suddenThreshold: 0.12, // Slightly lowered for quicker response
    testSoundEnabled: true,
    testSoundVolume: 0.3
  },

  // Animation settings (stored in 'vibecoding-animation-settings')
  fireworks: {
    gravity: 0.035,
    maxFireworks: 20,
    launchHeightFactor: 60,
    randomLaunchPower: true,
    randomLaunchPowerMin: 30,
    randomLaunchPowerMax: 90,
    smokeTrailIntensity: 0.3,
    fireworkSize: 1.0,
    randomSize: false,
    randomSizeMin: 0.5,
    randomSizeMax: 2.0,
    launchSpread: 20,
    launchSpreadMode: 'range',
    launchAngleMin: 60,
    launchAngleMax: 120,
    launchAngleMode: 'range',
    launchAngleFixed: 90
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
    useMultiColor: false
  },

  effects: {
    backgroundRemovalEnabled: true,
    imageRotation: false,
    imageGravity: 1.0,
    glowEnabled: true,
    fadeResistance: 0.92
  },

  // Background settings (handled separately in main.js)
  background: {
    opacity: 0.8,
    transitionTime: 2,
    displayTime: 5,
    videoLoop: true,
    videoVolume: 0.0 // Keep videos muted by default to avoid audio conflicts
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

export default DEFAULT_SETTINGS; 