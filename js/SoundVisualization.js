/**
 * SoundVisualization handles volume UI and sound detection indicators
 */
class SoundVisualization {
    constructor(volumeLevel, micDetection, audioManager) {
        this.volumeLevel = volumeLevel;
        this.micDetection = micDetection;
        this.audioManager = audioManager;
        
        // Timers for UI messages
        this.loudIndicatorTimer = null;
        this.sustainedIndicatorTimer = null;
        
        // Default message
        this.defaultMessage = 'Make LOUDER, SUSTAINED sound to launch fireworks';
        this.activeMessage = 'Continue making sounds to launch more fireworks. VERY LOUD sound will burst all.';
    }

    /**
     * Update volume level UI
     */
    updateVolumeUI(volume) {
        const levelBar = this.volumeLevel.querySelector('.level-bar');
        
        // Ensure volume is within bounds
        const boundedVolume = Math.max(0, Math.min(1, volume));
        
        // Reset and set transition
        levelBar.style.transition = 'none';
        void levelBar.offsetHeight; // Force reflow
        levelBar.style.transition = 'all 0.1s ease-out';
        levelBar.style.width = `${boundedVolume * 100}%`;
        
        // Apply color based on volume level
        if (volume <= this.audioManager.quietThreshold) {
            // Quiet volume - blue/green
            levelBar.style.background = 'linear-gradient(90deg, #2ecc71 0%, #3498db 100%)';
            levelBar.style.opacity = '0.7';
        } else if (volume >= this.audioManager.loudThreshold) {
            // Loud volume - red/orange
            levelBar.style.background = 'linear-gradient(90deg, #e74c3c 0%, #f39c12 100%)';
            levelBar.style.opacity = '1';
            
            // Reset after rendering the spike
            requestAnimationFrame(() => {
                levelBar.style.transition = 'all 0.3s ease-out';
                levelBar.style.width = '0%';
                levelBar.style.opacity = '0.7';
                levelBar.style.background = 'linear-gradient(90deg, #2ecc71 0%, #3498db 100%)';
            });
        } else {
            // Medium volume - blue/orange
            const normalizedVolume = (volume - this.audioManager.quietThreshold) / 
                (this.audioManager.loudThreshold - this.audioManager.quietThreshold);
            levelBar.style.background = 'linear-gradient(90deg, #3498db 0%, #f39c12 100%)';
            levelBar.style.opacity = 0.7 + (normalizedVolume * 0.3);
        }
    }
    
    /**
     * Show sustained sound detection in the mic test indicator
     */
    showSustainedDetection(message, fireworksActive) {
        clearTimeout(this.sustainedIndicatorTimer);
        
        this.micDetection.textContent = message;
        this.micDetection.className = 'mic-detection detected-sustained';
        
        this.sustainedIndicatorTimer = setTimeout(() => {
            this.micDetection.textContent = fireworksActive ? 
                this.activeMessage : this.defaultMessage;
            this.micDetection.className = 'mic-detection';
        }, 2000);
    }
    
    /**
     * Show loud sound detection in the mic test indicator
     */
    showLoudDetection(message, fireworksActive) {
        clearTimeout(this.loudIndicatorTimer);
        
        this.micDetection.textContent = message;
        this.micDetection.className = 'mic-detection detected-loud';
        
        this.loudIndicatorTimer = setTimeout(() => {
            this.micDetection.textContent = fireworksActive ? 
                this.activeMessage : this.defaultMessage;
            this.micDetection.className = 'mic-detection';
        }, 2000);
    }
    
    /**
     * Update microphone state UI
     */
    updateMicrophoneState(isActive) {
        const micButton = document.getElementById('startMicrophone');
        const audioVisualizer = document.querySelector('.audio-visualizer');
        const audioStatus = document.getElementById('audioStatus');
        
        if (isActive) {
            // Activate state
            micButton.classList.add('active');
            // First remove inactive classes
            audioVisualizer.classList.remove('inactive');
            audioVisualizer.classList.remove('mic-inactive');
            // Then add active classes
            audioVisualizer.classList.add('active');
            audioVisualizer.classList.add('mic-active');
            
            audioStatus.textContent = 'Audio status: active';
            audioStatus.classList.remove('inactive');
            audioStatus.classList.add('active');
            
            // Reset to default message
            this.micDetection.textContent = this.defaultMessage;
        } else {
            // Deactivate state
            micButton.classList.remove('active');
            // First remove active classes
            audioVisualizer.classList.remove('active');
            audioVisualizer.classList.remove('mic-active');
            // Then add inactive classes
            audioVisualizer.classList.add('inactive');
            audioVisualizer.classList.add('mic-inactive');
            
            audioStatus.textContent = 'Audio status: inactive';
            audioStatus.classList.remove('active');
            audioStatus.classList.add('inactive');
            
            // Set inactive message
            this.micDetection.textContent = 'Microphone inactive - no sound detected';
        }
    }
}

export default SoundVisualization;