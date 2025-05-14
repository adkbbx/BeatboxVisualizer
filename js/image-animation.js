// image-animation.js
import { ImageManager } from './ImageManager.js';
import { ImageUploader } from './ImageUploader.js';

export class ImageAnimationSystem {
    constructor(canvasId, uploaderContainerId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.imageManager = new ImageManager();
        this.explosionCount = 0;
        
        // Initialize uploader
        this.uploader = new ImageUploader(uploaderContainerId, (processedImage, imageId) => {
            this.imageManager.addProcessedImage(imageId, processedImage);
        });

        // Handle canvas resizing
        this.handleResize = this.handleResize.bind(this);
        window.addEventListener('resize', this.handleResize);
        this.handleResize();
    }

    handleResize() {
        // Update canvas dimensions
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    // Update and render images
    update() {
        const currentTime = performance.now();

        // Update image system
        this.imageManager.update(currentTime);
        this.imageManager.render(this.ctx);
    }

    // Handle firework explosion by creating image effect with consistent color
    // Added customImageId parameter to use a specific custom image
    handleFireworkExplosion(x, y, color, useFireworkColor = true, customImageId = null) {
        this.explosionCount++;
        
        // Use the specific custom image ID if provided
        let imageColor;
        if (customImageId) {
            imageColor = this.imageManager.createImageExplosion(x, y, customImageId, color);
        } else {
            // Otherwise use a random image with the provided color
            imageColor = this.imageManager.createImageExplosion(x, y, null, color);
        }
        
        // Return the color that was actually used
        return imageColor;
    }

    // Clear all images
    clearImages() {
        this.imageManager.clear();
    }
}

// Initialize the system when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create the new image system
    window.imageSystem = new ImageAnimationSystem('animationCanvas', 'imageUploader');
    
    // For backward compatibility, also set flowerSystem reference
    // This helps with any code that might still be looking for flowerSystem
    if (!window.flowerSystem) {
        window.flowerSystem = window.imageSystem;
    }
}); 