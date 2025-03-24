/**
 * Main application entry point
 */
document.addEventListener('DOMContentLoaded', () => {
    console.log('Sound-Responsive Fireworks initializing...');
    
    // Create audio manager instance
    const audioManager = new AudioManager();
    
    // Create animation controller
    const animationController = new AnimationController('animationCanvas');
    
    // Create UI controller and connect components
    const uiController = new UIController(audioManager, animationController);
    
    console.log('Application initialized successfully');
    
    // Display browser compatibility warning if necessary
    checkBrowserCompatibility();
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