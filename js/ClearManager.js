/**
 * ClearManager - Standalone system for clearing all images and backgrounds
 * No dependencies on preset discovery or manifest systems
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
            
            return { success: true, message: 'All images cleared successfully' };
            
        } catch (error) {
            return { success: false, message: `Clear failed: ${error.message}` };
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
        // Clear images array
        backgroundManager.backgroundImages = [];
        
        // Reset state
        backgroundManager.currentIndex = 0;
        backgroundManager.nextIndex = 0;
        backgroundManager.isTransitioning = false;
        backgroundManager.transitionProgress = 0;
        backgroundManager.timeSinceLastTransition = 0;
        
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
        messageDiv.textContent = message;
        
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
