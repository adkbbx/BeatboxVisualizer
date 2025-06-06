/**
 * ClearManager - Stamages and backgrounds
 * No dependencies on preset discovery or manifest systemsndalone system for clearing all i
 */
export class ClearManager {
    constructor() {
        this.isClearing = false;
    }

    async clearAllImages() {
        if (this.isClearing) {
            return;
        }

        this.isClearing = true;

        try {
            // Clear firework/flower images
            await this.clearFireworkImages();
            
            // Clear background/sky images
            await this.clearBackgroundImages();
            
            // Clear any preview containers
            this.clearPreviewContainers();
            
            return { 
                success: true, 
                message: window.i18n ? window.i18n.t('success.files.cleared') : 'All images cleared successfully' 
            };
            
        } catch (error) {
            return { 
                success: false, 
                message: window.i18n ? 
                    window.i18n.t('errors.generic.unknown') + `: ${error.message}` : 
                    `Clear failed: ${error.message}` 
            };
        } finally {
            this.isClearing = false;
        }
    }

    async clearFireworkImages() {
        // Clear main image system
        if (window.imageSystem) {
            if (typeof window.imageSystem.clearImages === 'function') {
                window.imageSystem.clearImages();
            }
            
            // Clear image manager if it exists
            if (window.imageSystem.imageManager) {
                if (window.imageSystem.imageManager.processedImages) {
                    window.imageSystem.imageManager.processedImages.clear();
                }
                if (window.imageSystem.imageManager.images) {
                    window.imageSystem.imageManager.images = [];
                }
            }
            
            // Clear any other image arrays
            if (window.imageSystem.images) {
                window.imageSystem.images = [];
            }
        }
    }

    async clearBackgroundImages() {
        // Method 1: Clear via backgroundSystem
        if (window.backgroundSystem) {
            // Clear background manager
            if (window.backgroundSystem.backgroundManager) {
                this.clearBackgroundManager(window.backgroundSystem.backgroundManager);
            }
            
            // Clear background arrays
            if (window.backgroundSystem.backgrounds) {
                window.backgroundSystem.backgrounds = [];
            }
        }
        
        // Method 2: Direct canvas clearing
        this.clearBackgroundCanvas();
    }

    clearBackgroundManager(backgroundManager) {
        // Use the new clearBackgroundMedia method if available
        if (typeof backgroundManager.clearBackgroundMedia === 'function') {
            backgroundManager.clearBackgroundMedia();
        } else if (typeof backgroundManager.clearBackgroundImages === 'function') {
            // Fallback to old method for compatibility
            backgroundManager.clearBackgroundImages();
        } else {
            // Manual cleanup for older versions
            this.manualBackgroundCleanup(backgroundManager);
        }
    }

    manualBackgroundCleanup(backgroundManager) {
        // Clear media arrays (new structure)
        if (backgroundManager.backgroundMedia) {
            // Stop all videos before clearing
            backgroundManager.backgroundMedia.forEach(mediaItem => {
                if (mediaItem.type === 'video' && mediaItem.element) {
                    const video = mediaItem.element;
                    video.pause();
                    if (mediaItem.url) {
                        URL.revokeObjectURL(mediaItem.url);
                    }
                }
            });
            backgroundManager.backgroundMedia = [];
        }
        
        // Clear legacy images array
        if (backgroundManager.backgroundImages) {
            backgroundManager.backgroundImages = [];
        }
        
        // Reset state
        backgroundManager.currentIndex = 0;
        backgroundManager.nextIndex = 0;
        backgroundManager.isTransitioning = false;
        backgroundManager.transitionProgress = 0;
        backgroundManager.timeSinceLastTransition = 0;
        backgroundManager.currentVideo = null;
        backgroundManager.nextVideo = null;
        
        // Stop animation
        backgroundManager.isActive = false;
        if (backgroundManager.animationFrameId) {
            cancelAnimationFrame(backgroundManager.animationFrameId);
            backgroundManager.animationFrameId = null;
        }
        
        // Clear canvas
        if (backgroundManager.canvas && backgroundManager.ctx) {
            const canvas = backgroundManager.canvas;
            const ctx = backgroundManager.ctx;
            
            // Ensure proper canvas size
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            
            // Clear and fill with black
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = backgroundManager.defaultBackground || '#000000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    clearBackgroundCanvas() {
        // Find background canvas by ID
        const backgroundCanvas = document.getElementById('backgroundCanvas');
        if (backgroundCanvas) {
            const ctx = backgroundCanvas.getContext('2d');
            if (ctx) {
                // Ensure proper size
                backgroundCanvas.width = window.innerWidth;
                backgroundCanvas.height = window.innerHeight;
                
                // Clear and fill black
                ctx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
            }
        }
    }

    clearPreviewContainers() {
        // Clear firework preview
        const previewContainer = document.getElementById('previewContainer');
        if (previewContainer) {
            previewContainer.innerHTML = '';
        }
        
        // Clear background preview
        const bgPreviewContainer = document.getElementById('bgPreviewContainer');
        if (bgPreviewContainer) {
            bgPreviewContainer.innerHTML = '';
        }
    }

    // Utility method to show user feedback
    showClearMessage(message, type = 'success') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `clear-message clear-message-${type}`;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
            color: white;
            padding: 15px 20px;
            border-radius: 5px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        `;
        
        // Check if message is a translation key or direct text
        if (window.i18n && message.includes('.')) {
            // Assume it's a translation key if it contains dots
            messageDiv.textContent = window.i18n.t(message) || message;
        } else {
            messageDiv.textContent = message;
        }
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 3000);
    }
}

// Create global instance
if (typeof window !== 'undefined') {
    window.clearManager = new ClearManager();
}

export default ClearManager;
