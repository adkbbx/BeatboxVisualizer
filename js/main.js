import AudioManager from './audio/AudioManager.js';
import AnimationController from './animationController.js';
import UIController from './ui/uiController.js';
import initializePanelControls from './ui/panel-controls.js';
import AnimationSettingsManager from './settings/AnimationSettingsManager.js';
import ColorManager from './managers/ColorManager.js';
import LaunchControlsManager from './managers/LaunchControlsManager.js';
import ModeManager from './modes/ModeManager.js';

/**
 * Set up global drag and drop prevention to avoid opening images in new windows
 * This is especially important when hosting on servers like FileZilla
 */
function setupGlobalDragPrevention() {
    // Prevent default drag and drop behavior globally to avoid opening images in new windows
    // This is especially important when hosting on servers like FileZilla
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        document.addEventListener(eventName, (e) => {
            // Check if the event target or any parent is within an upload zone
            const uploadZones = document.querySelectorAll('#dropZone, #bgDropZone');
            let isInUploadZone = false;
            
            // Check if the target or any of its parents is an upload zone
            let currentElement = e.target;
            while (currentElement && currentElement !== document) {
                uploadZones.forEach(zone => {
                    if (zone && (currentElement === zone || zone.contains(currentElement))) {
                        isInUploadZone = true;
                    }
                });
                if (isInUploadZone) break;
                currentElement = currentElement.parentElement;
            }
            
            // If not in an upload zone, prevent the default behavior
            if (!isInUploadZone) {
                e.preventDefault();
                e.stopPropagation();
            }
        }, false);
    });

    // Additional specific prevention for drop events on the document body
    document.body.addEventListener('drop', (e) => {
        // Check if this is not within an upload zone
        const uploadZones = document.querySelectorAll('#dropZone, #bgDropZone');
        let isInUploadZone = false;
        
        uploadZones.forEach(zone => {
            if (zone && zone.contains(e.target)) {
                isInUploadZone = true;
            }
        });
        
        if (!isInUploadZone) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }, false);
}

/**
 * Main application entry point
 */
document.addEventListener('DOMContentLoaded', () => {

    // Immediately hide custom colors section to prevent flash of visible content
    const customColorsSection = document.getElementById('customColorsSetting');
    if (customColorsSection) {
        customColorsSection.classList.remove('custom-colors-visible');
    }

    // Create audio manager instance
    const settingsManager = new AnimationSettingsManager();
    const initialAudioSettings = settingsManager.getSettings('audio');
    const audioManager = new AudioManager(initialAudioSettings);
    
    // Make audio manager globally accessible
    window.audioManager = audioManager;
    
    // Initialize Settings Manager to load settings first
    const initialColorSettings = settingsManager.getSettings('colors');

    // Create Color Manager with initial settings
    const colorManager = new ColorManager(initialColorSettings);
    
    // Get other initial settings for AnimationController and its sub-managers
    const initialAnimationSettings = settingsManager.getSettings('animation');
    const initialFireworkSettings = settingsManager.getSettings('fireworks');
    const initialBubbleSettings = settingsManager.getSettings('bubbles');
    const initialParticleSettings = settingsManager.getSettings('particles');
    const initialEffectSettings = settingsManager.getSettings('effects');
    // Background settings are handled by UIController/BackgroundUploader for now

    const allInitialAnimCtrlSettings = {
        animation: initialAnimationSettings,
        fireworks: initialFireworkSettings,
        bubbles: initialBubbleSettings,
        particles: initialParticleSettings,
        effects: initialEffectSettings
    };

    // Create animation controller and pass the pre-configured ColorManager and other initial settings
    const animationController = new AnimationController('animationCanvas', colorManager, allInitialAnimCtrlSettings);
    
    // Make animation controller globally accessible for Launch Controls
    window.animationController = animationController;
    
    // Set canvas to full window size
    const canvas = document.getElementById('animationCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Handle window resizing
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    
    // Create UI controller and connect components
    const uiController = new UIController(audioManager, animationController);
    
    // Make UI controller globally accessible
    window.uiController = uiController;
    
    // Create and initialize mode manager
    const modeManager = new ModeManager(animationController);
    
    // Make mode manager globally accessible
    window.modeManager = modeManager;
    
    // Initialize mode-aware UI on page load
    setTimeout(() => {
        modeManager.updateModeUI(modeManager.getCurrentMode());
    }, 100);
    
    // Initialize Launch Controls after animation controller is ready
    setTimeout(() => {
        const launchSpreadElement = document.getElementById('launchSpread');
        
        if (launchSpreadElement && window.animationController?.fireworkManager) {
            try {
                window.launchControlsManager = new LaunchControlsManager();
            } catch (error) {
                console.error('❌ Failed to initialize Launch Controls Manager:', error);
            }
        }
    }, 1000);
    
    // Connect the direct uploaders to the animation controller
    window.addEventListener('directUploadersInitialized', () => {
        // Connect the image system explosion handler to the animation controller
        if (window.imageSystem && animationController.fireworkManager) {
            // Store the image system reference in the animation controller
            animationController.imageSystem = window.imageSystem;
            
            // Override the explosion handler in FireworkManager to use our image system
            const originalExplodeFirework = animationController.fireworkManager.explodeFirework;
            animationController.fireworkManager.explodeFirework = (firework) => {
                // Create the particle explosion
                originalExplodeFirework.call(animationController.fireworkManager, firework);
                
                // Then create the image effect if we have uploaded images
                if (animationController.imageSystem && animationController.imageSystem.imageManager.processedImages.size > 0) {
                    // Clear any existing images at this position first
                    const existingImages = animationController.imageSystem.imageManager.images;
                    const x = firework.x;
                    const y = firework.y;
                    const tolerance = 5; // pixels
                    
                    // Remove any images that are too close to the new explosion
                    existingImages.forEach((img, index) => {
                        if (Math.abs(img.x - x) < tolerance && Math.abs(img.y - y) < tolerance) {
                            existingImages.splice(index, 1);
                        }
                    });
                    
                    // Create the new image explosion
                    animationController.imageSystem.handleFireworkExplosion(
                        firework.x,
                        firework.y,
                        firework.selectedImageColor,
                        true,
                        firework.selectedCustomImageId,
                        firework.size || 1.0
                    );
                }
            };
        }
        
        // Connect the background system to the animation controller
        if (window.backgroundSystem && window.backgroundSystem.backgroundManager) {
            // Save reference to background manager in animation controller
            animationController.backgroundManager = window.backgroundSystem.backgroundManager;
            // Start its independent loop now that it's initialized
            if (typeof animationController.backgroundManager.startIndependentLoop === 'function') {
                animationController.backgroundManager.startIndependentLoop();
            } else {
            }
        }

        // Now that uploaders are initialized, set up global drag prevention
        // This ensures the upload zones exist when we check for them
        setupGlobalDragPrevention();
    });
    
    // Display browser compatibility warning if necessary
    checkBrowserCompatibility();

    // Initialize panel controls and pass the uiController instance
    initializePanelControls(uiController);
    
    // Load CSS for new settings panel
    loadSettingsPanelStyles();
    
    // Initialize uploader tabs
    initializeUploaderTabs();

    // Setup rotation toggle default state and listener
    const imageRotationToggle = document.getElementById('imageRotation');
    if (imageRotationToggle) {
        // Default to disabled
        imageRotationToggle.checked = false;
        
        // Store the setting in localStorage
        imageRotationToggle.addEventListener('change', () => {
            localStorage.setItem('imageRotationEnabled', imageRotationToggle.checked);
        });
        
        // Load saved setting
        const savedRotationSetting = localStorage.getItem('imageRotationEnabled');
        if (savedRotationSetting !== null) {
            imageRotationToggle.checked = savedRotationSetting === 'true';
        }
    }

    // Setup image gravity control
    const imageGravitySlider = document.getElementById('imageGravity');
    const imageGravityValue = document.getElementById('imageGravityValue');
    if (imageGravitySlider && imageGravityValue) {
        // Set default value
        imageGravitySlider.value = '1.0';
        imageGravityValue.textContent = '1.0';
        
        // Store gravity multiplier globally for CustomImage to access
        window.imageGravityMultiplier = 1.0;
        
        imageGravitySlider.addEventListener('input', () => {
            const gravityValue = parseFloat(imageGravitySlider.value);
            imageGravityValue.textContent = gravityValue.toFixed(1);
            window.imageGravityMultiplier = gravityValue;
            localStorage.setItem('imageGravityMultiplier', gravityValue);
        });
        
        // Load saved setting
        const savedGravity = localStorage.getItem('imageGravityMultiplier');
        if (savedGravity !== null) {
            const gravity = parseFloat(savedGravity);
            imageGravitySlider.value = gravity;
            imageGravityValue.textContent = gravity.toFixed(1);
            window.imageGravityMultiplier = gravity;
        }
    }

    // Test sound settings are now handled by SettingsController

    // Setup listeners for background settings in the settings panel
    const bgOpacitySlider = document.getElementById('bgOpacity');
    const bgOpacityValue = document.getElementById('bgOpacityValue');
    const bgTransitionTimeSlider = document.getElementById('bgTransitionTime');
    const bgTransitionValue = document.getElementById('bgTransitionValue');
    const bgDisplayTimeSlider = document.getElementById('bgDisplayTime');
    const bgDisplayValue = document.getElementById('bgDisplayValue');

    if (bgOpacitySlider && bgOpacityValue) {
        // Initialize slider position to match the actual value
        bgOpacitySlider.value = '0.8';
        bgOpacityValue.textContent = '0.8';
        
        bgOpacitySlider.addEventListener('input', () => {
            bgOpacityValue.textContent = bgOpacitySlider.value;
            if (window.backgroundSystem && window.backgroundSystem.backgroundManager) {
                window.backgroundSystem.backgroundManager.updateSettings({ opacity: parseFloat(bgOpacitySlider.value) });
            }
        });
    }

    if (bgTransitionTimeSlider && bgTransitionValue) {
        // Initialize slider position to match the actual value
        bgTransitionTimeSlider.value = '2';
        bgTransitionValue.textContent = '2';
        
        bgTransitionTimeSlider.addEventListener('input', () => {
            bgTransitionValue.textContent = bgTransitionTimeSlider.value;
            if (window.backgroundSystem && window.backgroundSystem.backgroundManager) {
                // Convert seconds to milliseconds for BackgroundManager
                window.backgroundSystem.backgroundManager.updateSettings({ transitionDuration: parseFloat(bgTransitionTimeSlider.value) * 1000 });
            }
        });
    }

    if (bgDisplayTimeSlider && bgDisplayValue) {
        // Initialize slider position to match the actual value
        bgDisplayTimeSlider.value = '5';
        bgDisplayValue.textContent = '5';
        
        bgDisplayTimeSlider.addEventListener('input', () => {
            bgDisplayValue.textContent = bgDisplayTimeSlider.value;
            if (window.backgroundSystem && window.backgroundSystem.backgroundManager) {
                // Convert seconds to milliseconds for BackgroundManager
                window.backgroundSystem.backgroundManager.updateSettings({ displayDuration: parseFloat(bgDisplayTimeSlider.value) * 1000 });
            }
        });
    }

    // Setup bubble settings handlers
    // setupBubbleSettings();
});

/**
 * Setup bubble settings event handlers
 */
function setupBubbleSettings() {
    // Bubble size settings
    const bubbleSizeSlider = document.getElementById('bubbleSize');
    const bubbleSizeValue = document.getElementById('bubbleSizeValue');
    if (bubbleSizeSlider && bubbleSizeValue) {
        bubbleSizeSlider.addEventListener('input', () => {
            bubbleSizeValue.textContent = bubbleSizeSlider.value;
            updateBubbleManagerSettings({ bubbleSize: parseFloat(bubbleSizeSlider.value) });
        });
    }

    // Random bubble size toggle
    const randomBubbleSizeToggle = document.getElementById('randomBubbleSize');
    const randomBubbleSizeRange = document.getElementById('randomBubbleSizeRange');
    const randomBubbleSizeMaxSetting = document.getElementById('randomBubbleSizeMaxSetting');
    
    if (randomBubbleSizeToggle && randomBubbleSizeRange && randomBubbleSizeMaxSetting) {
        randomBubbleSizeToggle.addEventListener('change', () => {
            const isEnabled = randomBubbleSizeToggle.checked;
            randomBubbleSizeRange.style.display = isEnabled ? 'block' : 'none';
            randomBubbleSizeMaxSetting.style.display = isEnabled ? 'block' : 'none';
            updateBubbleManagerSettings({ randomSize: isEnabled });
        });
    }

    // Random bubble size min/max
    const randomBubbleSizeMin = document.getElementById('randomBubbleSizeMin');
    const randomBubbleSizeMinValue = document.getElementById('randomBubbleSizeMinValue');
    if (randomBubbleSizeMin && randomBubbleSizeMinValue) {
        randomBubbleSizeMin.addEventListener('input', () => {
            randomBubbleSizeMinValue.textContent = randomBubbleSizeMin.value;
            updateBubbleManagerSettings({ randomSizeMin: parseFloat(randomBubbleSizeMin.value) });
        });
    }

    const randomBubbleSizeMax = document.getElementById('randomBubbleSizeMax');
    const randomBubbleSizeMaxValue = document.getElementById('randomBubbleSizeMaxValue');
    if (randomBubbleSizeMax && randomBubbleSizeMaxValue) {
        randomBubbleSizeMax.addEventListener('input', () => {
            randomBubbleSizeMaxValue.textContent = randomBubbleSizeMax.value;
            updateBubbleManagerSettings({ randomSizeMax: parseFloat(randomBubbleSizeMax.value) });
        });
    }

    // Bubble cluster size
    const bubbleClusterSizeSlider = document.getElementById('bubbleClusterSize');
    const bubbleClusterSizeValue = document.getElementById('bubbleClusterSizeValue');
    if (bubbleClusterSizeSlider && bubbleClusterSizeValue) {
        bubbleClusterSizeSlider.addEventListener('input', () => {
            bubbleClusterSizeValue.textContent = bubbleClusterSizeSlider.value;
            updateBubbleManagerSettings({ bubbleClusterSize: parseInt(bubbleClusterSizeSlider.value) });
        });
    }

    // Bubble launch spread
    const bubbleLaunchSpreadSlider = document.getElementById('bubbleLaunchSpread');
    const bubbleLaunchSpreadValue = document.getElementById('bubbleLaunchSpreadValue');
    if (bubbleLaunchSpreadSlider && bubbleLaunchSpreadValue) {
        bubbleLaunchSpreadSlider.addEventListener('input', () => {
            bubbleLaunchSpreadValue.textContent = bubbleLaunchSpreadSlider.value;
            updateBubbleManagerSettings({ launchSpread: parseInt(bubbleLaunchSpreadSlider.value) });
        });
    }

    // Bubble rise speed
    const bubbleRiseSpeedSlider = document.getElementById('bubbleRiseSpeed');
    const bubbleRiseSpeedValue = document.getElementById('bubbleRiseSpeedValue');
    if (bubbleRiseSpeedSlider && bubbleRiseSpeedValue) {
        bubbleRiseSpeedSlider.addEventListener('input', () => {
            bubbleRiseSpeedValue.textContent = bubbleRiseSpeedSlider.value;
            updateBubbleManagerSettings({ riseSpeed: parseFloat(bubbleRiseSpeedSlider.value) });
        });
    }

    // Bubble auto-pop height
    const bubbleAutoPopHeightSlider = document.getElementById('bubbleAutoPopHeight');
    const bubbleAutoPopHeightValue = document.getElementById('bubbleAutoPopHeightValue');
    if (bubbleAutoPopHeightSlider && bubbleAutoPopHeightValue) {
        // Initialize with current slider value on page load
        const initialValue = parseFloat(bubbleAutoPopHeightSlider.value) / 100;
        updateBubbleManagerSettings({ autoPopHeight: initialValue });
        
        bubbleAutoPopHeightSlider.addEventListener('input', () => {
            bubbleAutoPopHeightValue.textContent = bubbleAutoPopHeightSlider.value;
            updateBubbleManagerSettings({ autoPopHeight: parseFloat(bubbleAutoPopHeightSlider.value) / 100 });
        });
    }

    // Max bubbles
    const maxBubblesSlider = document.getElementById('maxBubbles');
    const maxBubblesValue = document.getElementById('maxBubblesValue');
    if (maxBubblesSlider && maxBubblesValue) {
        maxBubblesSlider.addEventListener('input', () => {
            maxBubblesValue.textContent = maxBubblesSlider.value;
            updateBubbleManagerSettings({ maxBubbles: parseInt(maxBubblesSlider.value) });
        });
    }

    // Bubble gravity
    const bubbleGravitySlider = document.getElementById('bubbleGravity');
    const bubbleGravityValue = document.getElementById('bubbleGravityValue');
    if (bubbleGravitySlider && bubbleGravityValue) {
        bubbleGravitySlider.addEventListener('input', () => {
            bubbleGravityValue.textContent = bubbleGravitySlider.value;
            updateBubbleManagerSettings({ gravity: parseFloat(bubbleGravitySlider.value) });
        });
    }

    // Launch spread mode
    const bubbleLaunchSpreadModeSelect = document.getElementById('bubbleLaunchSpreadMode');
    if (bubbleLaunchSpreadModeSelect) {
        bubbleLaunchSpreadModeSelect.addEventListener('change', () => {
            updateBubbleManagerSettings({ launchSpreadMode: bubbleLaunchSpreadModeSelect.value });
        });
    }

    // Cluster spread
    const bubbleClusterSpreadSlider = document.getElementById('bubbleClusterSpread');
    const bubbleClusterSpreadValue = document.getElementById('bubbleClusterSpreadValue');
    if (bubbleClusterSpreadSlider && bubbleClusterSpreadValue) {
        bubbleClusterSpreadSlider.addEventListener('input', () => {
            bubbleClusterSpreadValue.textContent = bubbleClusterSpreadSlider.value;
            updateBubbleManagerSettings({ clusterSpread: parseInt(bubbleClusterSpreadSlider.value) });
        });
    }

    // Random rise speed toggle
    const randomBubbleRiseSpeedToggle = document.getElementById('randomBubbleRiseSpeed');
    const randomRiseSpeedRange = document.getElementById('randomRiseSpeedRange');
    const randomRiseSpeedMaxSetting = document.getElementById('randomRiseSpeedMaxSetting');
    
    if (randomBubbleRiseSpeedToggle && randomRiseSpeedRange && randomRiseSpeedMaxSetting) {
        randomBubbleRiseSpeedToggle.addEventListener('change', () => {
            const isEnabled = randomBubbleRiseSpeedToggle.checked;
            randomRiseSpeedRange.style.display = isEnabled ? 'block' : 'none';
            randomRiseSpeedMaxSetting.style.display = isEnabled ? 'block' : 'none';
            updateBubbleManagerSettings({ randomRiseSpeed: isEnabled });
        });
    }

    // Random rise speed min/max
    const randomRiseSpeedMin = document.getElementById('randomRiseSpeedMin');
    const randomRiseSpeedMinValue = document.getElementById('randomRiseSpeedMinValue');
    if (randomRiseSpeedMin && randomRiseSpeedMinValue) {
        randomRiseSpeedMin.addEventListener('input', () => {
            randomRiseSpeedMinValue.textContent = randomRiseSpeedMin.value;
            updateBubbleManagerSettings({ randomRiseSpeedMin: parseFloat(randomRiseSpeedMin.value) });
        });
    }

    const randomRiseSpeedMax = document.getElementById('randomRiseSpeedMax');
    const randomRiseSpeedMaxValue = document.getElementById('randomRiseSpeedMaxValue');
    if (randomRiseSpeedMax && randomRiseSpeedMaxValue) {
        randomRiseSpeedMax.addEventListener('input', () => {
            randomRiseSpeedMaxValue.textContent = randomRiseSpeedMax.value;
            updateBubbleManagerSettings({ randomRiseSpeedMax: parseFloat(randomRiseSpeedMax.value) });
        });
    }

    // Random pop height toggle (NEW FEATURE)
    const randomBubblePopHeightToggle = document.getElementById('randomBubblePopHeight');
    const randomPopHeightRange = document.getElementById('randomPopHeightRange');
    const randomPopHeightMaxSetting = document.getElementById('randomPopHeightMaxSetting');
    
    if (randomBubblePopHeightToggle && randomPopHeightRange && randomPopHeightMaxSetting) {
        randomBubblePopHeightToggle.addEventListener('change', () => {
            const isEnabled = randomBubblePopHeightToggle.checked;
            randomPopHeightRange.style.display = isEnabled ? 'block' : 'none';
            randomPopHeightMaxSetting.style.display = isEnabled ? 'block' : 'none';
            updateBubbleManagerSettings({ randomPopHeight: isEnabled });
        });
    }

    // Random pop height min/max (NEW FEATURE)
    const randomPopHeightMin = document.getElementById('randomPopHeightMin');
    const randomPopHeightMinValue = document.getElementById('randomPopHeightMinValue');
    if (randomPopHeightMin && randomPopHeightMinValue) {
        // Initialize with current slider value on page load
        const initialMinValue = parseFloat(randomPopHeightMin.value) / 100;
        updateBubbleManagerSettings({ randomPopHeightMin: initialMinValue });
        
        randomPopHeightMin.addEventListener('input', () => {
            randomPopHeightMinValue.textContent = randomPopHeightMin.value;
            updateBubbleManagerSettings({ randomPopHeightMin: parseFloat(randomPopHeightMin.value) / 100 });
        });
    }

    const randomPopHeightMax = document.getElementById('randomPopHeightMax');
    const randomPopHeightMaxValue = document.getElementById('randomPopHeightMaxValue');
    if (randomPopHeightMax && randomPopHeightMaxValue) {
        // Initialize with current slider value on page load
        const initialMaxValue = parseFloat(randomPopHeightMax.value) / 100;
        updateBubbleManagerSettings({ randomPopHeightMax: initialMaxValue });
        
        randomPopHeightMax.addEventListener('input', () => {
            randomPopHeightMaxValue.textContent = randomPopHeightMax.value;
            updateBubbleManagerSettings({ randomPopHeightMax: parseFloat(randomPopHeightMax.value) / 100 });
        });
    }

    // Wobble intensity
    const bubbleWobbleSlider = document.getElementById('bubbleWobble');
    const bubbleWobbleValue = document.getElementById('bubbleWobbleValue');
    if (bubbleWobbleSlider && bubbleWobbleValue) {
        bubbleWobbleSlider.addEventListener('input', () => {
            bubbleWobbleValue.textContent = bubbleWobbleSlider.value;
            updateBubbleManagerSettings({ wobbleIntensity: parseFloat(bubbleWobbleSlider.value) });
        });
    }

    // Buoyancy
    const bubbleBuoyancySlider = document.getElementById('bubbleBuoyancy');
    const bubbleBuoyancyValue = document.getElementById('bubbleBuoyancyValue');
    if (bubbleBuoyancySlider && bubbleBuoyancyValue) {
        bubbleBuoyancySlider.addEventListener('input', () => {
            bubbleBuoyancyValue.textContent = bubbleBuoyancySlider.value;
            updateBubbleManagerSettings({ buoyancy: parseFloat(bubbleBuoyancySlider.value) });
        });
    }

    // Bubble presets
    const bubblePresetSelect = document.getElementById('bubblePreset');
    const bubblePresetDescription = document.getElementById('bubblePresetDescription');
    if (bubblePresetSelect && bubblePresetDescription) {
        bubblePresetSelect.addEventListener('change', () => {
            const preset = bubblePresetSelect.value;
            if (preset) {
                applyBubblePreset(preset);
                updateBubblePresetDescription(preset, bubblePresetDescription);
            }
        });
    }
}

/**
 * Update bubble manager settings
 * @param {Object} settings - Settings to update
 */
function updateBubbleManagerSettings(settings) {
    if (window.animationController && window.animationController.bubbleManager) {
        window.animationController.bubbleManager.updateSettings(settings);
    }
}

/**
 * Apply bubble preset settings
 * @param {string} preset - Preset name
 */
function applyBubblePreset(preset) {
    const presets = {
        gentle: {
            bubbleClusterSize: 2,
            riseSpeed: 1.5,
            launchSpread: 20,
            launchSpreadMode: 'range',
            clusterSpread: 15,
            randomRiseSpeed: false,
            randomPopHeight: false,
            autoPopHeight: 0.25
        },
        celebration: {
            bubbleClusterSize: 6,
            riseSpeed: 3.5,
            launchSpread: 60,
            launchSpreadMode: 'range',
            clusterSpread: 40,
            randomRiseSpeed: true,
            randomRiseSpeedMin: 2.0,
            randomRiseSpeedMax: 4.5,
            randomPopHeight: true,
            randomPopHeightMin: 0.15,
            randomPopHeightMax: 0.35
        },
        fountain: {
            bubbleClusterSize: 5,
            riseSpeed: 2.5,
            launchSpread: 15,
            launchSpreadMode: 'center',
            clusterSpread: 25,
            randomRiseSpeed: true,
            randomRiseSpeedMin: 1.5,
            randomRiseSpeedMax: 3.5,
            randomPopHeight: false,
            autoPopHeight: 0.20
        },
        stream: {
            bubbleClusterSize: 1,
            riseSpeed: 2.0,
            launchSpread: 5,
            launchSpreadMode: 'center',
            clusterSpread: 5,
            randomRiseSpeed: false,
            randomPopHeight: false,
            autoPopHeight: 0.15
        },
        minimal: {
            bubbleClusterSize: 0,
            riseSpeed: 1.8,
            launchSpread: 10,
            launchSpreadMode: 'center',
            clusterSpread: 0,
            randomRiseSpeed: false,
            randomPopHeight: false,
            autoPopHeight: 0.20
        },
        chaos: {
            bubbleClusterSize: 8,
            riseSpeed: 3.0,
            launchSpread: 100,
            launchSpreadMode: 'random',
            clusterSpread: 80,
            randomRiseSpeed: true,
            randomRiseSpeedMin: 0.5,
            randomRiseSpeedMax: 5.0,
            randomPopHeight: true,
            randomPopHeightMin: 0.10,
            randomPopHeightMax: 0.45
        },
        peaceful: {
            bubbleClusterSize: 2,
            riseSpeed: 1.0,
            launchSpread: 40,
            launchSpreadMode: 'range',
            clusterSpread: 30,
            randomRiseSpeed: true,
            randomRiseSpeedMin: 0.8,
            randomRiseSpeedMax: 1.5,
            randomPopHeight: true,
            randomPopHeightMin: 0.20,
            randomPopHeightMax: 0.40
        },
        party: {
            bubbleClusterSize: 7,
            riseSpeed: 4.0,
            launchSpread: 80,
            launchSpreadMode: 'random',
            clusterSpread: 50,
            randomRiseSpeed: true,
            randomRiseSpeedMin: 3.0,
            randomRiseSpeedMax: 5.0,
            randomPopHeight: true,
            randomPopHeightMin: 0.10,
            randomPopHeightMax: 0.30
        }
    };

    const settings = presets[preset];
    if (settings) {
        // Apply the preset settings
        updateBubbleManagerSettings(settings);
        
        // Update UI elements to reflect the new settings
        updateBubbleUIFromSettings(settings);
    }
}

/**
 * Update bubble preset description
 * @param {string} preset - Preset name
 * @param {HTMLElement} descriptionElement - Description element
 */
function updateBubblePresetDescription(preset, descriptionElement) {
    const descriptions = {
        gentle: "Small clusters of bubbles that rise slowly and pop at moderate heights",
        celebration: "Large clusters with varied speeds and random pop heights for festive effects",
        fountain: "Bubbles launch from center like a fountain with varied rise speeds",
        stream: "Single bubbles in a steady stream rising from the center",
        minimal: "Clean single bubbles without foam clusters - pure and simple",
        chaos: "Random everything - clusters, positions, speeds, and pop heights",
        peaceful: "Slow, spread-out bubbles with gentle random variations",
        party: "Fast, energetic bubbles launching everywhere with quick pops"
    };

    if (descriptions[preset]) {
        descriptionElement.textContent = descriptions[preset];
    }
}

/**
 * Update bubble UI elements from settings
 * @param {Object} settings - Settings object
 */
function updateBubbleUIFromSettings(settings) {
    // Update cluster size
    if (settings.bubbleClusterSize !== undefined) {
        const slider = document.getElementById('bubbleClusterSize');
        const value = document.getElementById('bubbleClusterSizeValue');
        if (slider && value) {
            slider.value = settings.bubbleClusterSize;
            value.textContent = settings.bubbleClusterSize;
        }
    }

    // Update rise speed
    if (settings.riseSpeed !== undefined) {
        const slider = document.getElementById('bubbleRiseSpeed');
        const value = document.getElementById('bubbleRiseSpeedValue');
        if (slider && value) {
            slider.value = settings.riseSpeed;
            value.textContent = settings.riseSpeed;
        }
    }

    // Update launch spread
    if (settings.launchSpread !== undefined) {
        const slider = document.getElementById('bubbleLaunchSpread');
        const value = document.getElementById('bubbleLaunchSpreadValue');
        if (slider && value) {
            slider.value = settings.launchSpread;
            value.textContent = settings.launchSpread;
        }
    }

    // Update launch spread mode
    if (settings.launchSpreadMode !== undefined) {
        const select = document.getElementById('bubbleLaunchSpreadMode');
        if (select) {
            select.value = settings.launchSpreadMode;
        }
    }

    // Update cluster spread
    if (settings.clusterSpread !== undefined) {
        const slider = document.getElementById('bubbleClusterSpread');
        const value = document.getElementById('bubbleClusterSpreadValue');
        if (slider && value) {
            slider.value = settings.clusterSpread;
            value.textContent = settings.clusterSpread;
        }
    }

    // Update random rise speed toggle and values
    if (settings.randomRiseSpeed !== undefined) {
        const toggle = document.getElementById('randomBubbleRiseSpeed');
        const range = document.getElementById('randomRiseSpeedRange');
        const maxSetting = document.getElementById('randomRiseSpeedMaxSetting');
        
        if (toggle) {
            toggle.checked = settings.randomRiseSpeed;
            if (range && maxSetting) {
                range.style.display = settings.randomRiseSpeed ? 'block' : 'none';
                maxSetting.style.display = settings.randomRiseSpeed ? 'block' : 'none';
            }
        }
    }

    // Update random rise speed min/max
    if (settings.randomRiseSpeedMin !== undefined) {
        const slider = document.getElementById('randomRiseSpeedMin');
        const value = document.getElementById('randomRiseSpeedMinValue');
        if (slider && value) {
            slider.value = settings.randomRiseSpeedMin;
            value.textContent = settings.randomRiseSpeedMin;
        }
    }

    if (settings.randomRiseSpeedMax !== undefined) {
        const slider = document.getElementById('randomRiseSpeedMax');
        const value = document.getElementById('randomRiseSpeedMaxValue');
        if (slider && value) {
            slider.value = settings.randomRiseSpeedMax;
            value.textContent = settings.randomRiseSpeedMax;
        }
    }

    // Update random pop height toggle and values
    if (settings.randomPopHeight !== undefined) {
        const toggle = document.getElementById('randomBubblePopHeight');
        const range = document.getElementById('randomPopHeightRange');
        const maxSetting = document.getElementById('randomPopHeightMaxSetting');
        
        if (toggle) {
            toggle.checked = settings.randomPopHeight;
            if (range && maxSetting) {
                range.style.display = settings.randomPopHeight ? 'block' : 'none';
                maxSetting.style.display = settings.randomPopHeight ? 'block' : 'none';
            }
        }
    }

    // Update random pop height min/max
    if (settings.randomPopHeightMin !== undefined) {
        const slider = document.getElementById('randomPopHeightMin');
        const value = document.getElementById('randomPopHeightMinValue');
        if (slider && value) {
            const percentage = Math.round(settings.randomPopHeightMin * 100);
            slider.value = percentage;
            value.textContent = percentage;
        }
    }

    if (settings.randomPopHeightMax !== undefined) {
        const slider = document.getElementById('randomPopHeightMax');
        const value = document.getElementById('randomPopHeightMaxValue');
        if (slider && value) {
            const percentage = Math.round(settings.randomPopHeightMax * 100);
            slider.value = percentage;
            value.textContent = percentage;
        }
    }

    // Update auto-pop height
    if (settings.autoPopHeight !== undefined) {
        const slider = document.getElementById('bubbleAutoPopHeight');
        const value = document.getElementById('bubbleAutoPopHeightValue');
        if (slider && value) {
            const percentage = Math.round(settings.autoPopHeight * 100);
            slider.value = percentage;
            value.textContent = percentage;
        }
    }
}

/**
 * Check if the browser supports the required APIs
 */
function checkBrowserCompatibility() {
    const warnings = [];
    
    // Check for AudioContext support
    if (!window.AudioContext && !window.webkitAudioContext) {
        warnings.push('Web Audio API is not supported in your browser.');
    }
    
    // Check for getUserMedia support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        warnings.push('Media Devices API is not supported in your browser.');
    }
    
    // Check for Canvas support
    const canvas = document.createElement('canvas');
    if (!canvas.getContext || !canvas.getContext('2d')) {
        warnings.push('Canvas is not supported in your browser.');
    }
    
    // Display warnings if any
    if (warnings.length > 0) {
        const warningElement = document.createElement('div');
        warningElement.className = 'browser-warning';
        warningElement.innerHTML = `
            <h3>Browser Compatibility Warning</h3>
            <p>The following features are not supported in your browser:</p>
            <ul>${warnings.map(warning => `<li>${warning}</li>`).join('')}</ul>
            <p>Please try using a modern browser like Chrome, Firefox, Safari, or Edge.</p>
        `;
        
        document.body.insertBefore(warningElement, document.body.firstChild);
    }
}

/**
 * Load the settings panel CSS
 */
function loadSettingsPanelStyles() {
    const cssPath = 'css/settings.css';
    if (!document.querySelector(`link[href="${cssPath}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssPath;
        document.head.appendChild(link);
    }
}

/**
 * Initialize the uploader tabs
 */
function initializeUploaderTabs() {
    const tabButtons = document.querySelectorAll('.uploader-tab-button');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get the tab to activate
            const tabName = this.getAttribute('data-uploader-tab');
            
            // Deactivate all tabs
            document.querySelectorAll('.uploader-tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            
            document.querySelectorAll('.uploader-tab-pane').forEach(pane => {
                pane.classList.remove('active');
            });
            
            // Activate the selected tab
            this.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
}