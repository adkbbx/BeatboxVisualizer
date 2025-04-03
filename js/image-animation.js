// image-animation.js
import { ImageManager } from './ImageManager.js';
import { ImageUploader } from './ImageUploader.js';

export class ImageAnimationSystem {
    constructor(canvasId, uploaderContainerId) {
        console.log('Initializing ImageAnimationSystem...');
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.imageManager = new ImageManager();
        this.explosionCount = 0;
        
        // Initialize uploader
        this.uploader = new ImageUploader(uploaderContainerId, (processedImage, imageId) => {
            console.log('New image processed, adding to image manager:', { imageId });
            this.imageManager.addProcessedImage(imageId, processedImage);
        });

        // Performance monitoring
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.fpsUpdateInterval = 1000; // Update FPS every second
        this.lastFpsUpdate = this.lastFrameTime;
        this.currentFps = 0;

        // Handle canvas resizing
        this.handleResize = this.handleResize.bind(this);
        window.addEventListener('resize', this.handleResize);
        this.handleResize();
    }

    handleResize() {
        // Update canvas dimensions
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        console.debug('Flower animation canvas resized:', {
            width: this.canvas.width,
            height: this.canvas.height
        });
    }

    // Update and render images
    update() {
        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;

        // Update FPS counter
        this.frameCount++;
        if (currentTime - this.lastFpsUpdate >= this.fpsUpdateInterval) {
            this.currentFps = Math.round((this.frameCount * 1000) / (currentTime - this.lastFpsUpdate));
            console.debug('Animation performance:', {
                fps: this.currentFps,
                frameTime: Math.round(deltaTime),
                activeFragments: this.imageManager.images.length,
                canvasSize: {
                    width: this.canvas.width,
                    height: this.canvas.height
                }
            });
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
        }

        // Update image system
        this.imageManager.update(currentTime);
        this.imageManager.render(this.ctx);
    }

    // Handle firework explosion by creating image effect with consistent color
    // Added customImageId parameter to use a specific custom image
    handleFireworkExplosion(x, y, color, useFireworkColor = true, customImageId = null) {
        this.explosionCount++;
        console.log(`Creating image explosion #${this.explosionCount} at (${x}, ${y}) with color: ${color}`);
        
        // Use the specific custom image ID if provided
        let imageColor;
        if (customImageId) {
            console.log(`Using specific custom image: ${customImageId}`);
            imageColor = this.imageManager.createImageExplosion(x, y, customImageId, color);
        } else {
            // Otherwise use a random image with the provided color
            imageColor = this.imageManager.createImageExplosion(x, y, null, color);
        }
        
        // Log explosion stats with color information
        console.debug('Explosion stats:', {
            totalExplosions: this.explosionCount,
            position: {x: x.toFixed(1), y: y.toFixed(1)},
            requestedColor: color,
            appliedColor: imageColor,
            specificImage: customImageId ? true : false,
            customImageId: customImageId || 'random',
            canvasSize: {
                width: this.canvas.width,
                height: this.canvas.height
            },
            activeFragments: this.imageManager.images.length
        });

        // Return the color that was actually used
        return imageColor;
    }

    // Clear all images
    clearImages() {
        console.log('Clearing image animation system:', {
            totalExplosions: this.explosionCount,
            clearedFragments: this.imageManager.images.length
        });
        this.imageManager.clear();
    }
}

// Initialize the system when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing image animation system');
    // Create the new image system
    window.imageSystem = new ImageAnimationSystem('animationCanvas', 'imageUploader');
    
    // For backward compatibility, also set flowerSystem reference
    // This helps with any code that might still be looking for flowerSystem
    if (!window.flowerSystem) {
        window.flowerSystem = window.imageSystem;
        console.log('Set backward compatibility reference: flowerSystem → imageSystem');
    }
}); 