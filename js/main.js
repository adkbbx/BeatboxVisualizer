import AudioManager from './audio/AudioManager.js';
import AnimationController from './animationController.js';
import UIController from './uiController.js';
import initializePanelControls from './panel-controls.js';
import AnimationSettingsManager from './settings/AnimationSettingsManager.js';
import ColorManager from './ColorManager.js';

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
    
    // Initialize Settings Manager to load settings first
    const initialColorSettings = settingsManager.getSettings('colors');

    // Create Color Manager with initial settings
    const colorManager = new ColorManager(initialColorSettings);
    
    // Get other initial settings for AnimationController and its sub-managers
    const initialAnimationSettings = settingsManager.getSettings('animation');
    const initialFireworkSettings = settingsManager.getSettings('fireworks');
    const initialParticleSettings = settingsManager.getSettings('particles');
    const initialEffectSettings = settingsManager.getSettings('effects');
    // Background settings are handled by UIController/BackgroundUploader for now

    const allInitialAnimCtrlSettings = {
        animation: initialAnimationSettings,
        fireworks: initialFireworkSettings,
        particles: initialParticleSettings,
        effects: initialEffectSettings
    };

    // Create animation controller and pass the pre-configured ColorManager and other initial settings
    const animationController = new AnimationController('animationCanvas', colorManager, allInitialAnimCtrlSettings);
    
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

    // Setup test sound settings
    const testSoundEnabledToggle = document.getElementById('testSoundEnabled');
    const testSoundVolumeSlider = document.getElementById('testSoundVolume');
    const testSoundVolumeValue = document.getElementById('testSoundVolumeValue');

    if (testSoundEnabledToggle) {
        // Default to enabled
        testSoundEnabledToggle.checked = true;
        
        // Store the setting
        testSoundEnabledToggle.addEventListener('change', () => {
            const enabled = testSoundEnabledToggle.checked;
            localStorage.setItem('testSoundEnabled', enabled);
            
            // Update the test firework manager if available
            if (animationController.fireworkManager && 
                animationController.fireworkManager.testFireworkManager) {
                animationController.fireworkManager.testFireworkManager.setSoundEnabled(enabled);
            }
        });
        
        // Load saved setting
        const savedSoundSetting = localStorage.getItem('testSoundEnabled');
        if (savedSoundSetting !== null) {
            testSoundEnabledToggle.checked = savedSoundSetting === 'true';
        }
    }

    if (testSoundVolumeSlider && testSoundVolumeValue) {
        testSoundVolumeSlider.addEventListener('input', () => {
            const volume = parseFloat(testSoundVolumeSlider.value);
            testSoundVolumeValue.textContent = volume.toFixed(2);
            localStorage.setItem('testSoundVolume', volume);
            
            // Update the test firework manager if available
            if (animationController.fireworkManager && 
                animationController.fireworkManager.testFireworkManager) {
                animationController.fireworkManager.testFireworkManager.setSoundVolume(volume);
            }
        });
        
        // Load saved volume
        const savedVolume = localStorage.getItem('testSoundVolume');
        if (savedVolume !== null) {
            testSoundVolumeSlider.value = savedVolume;
            testSoundVolumeValue.textContent = parseFloat(savedVolume).toFixed(2);
        }
    }

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
});

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