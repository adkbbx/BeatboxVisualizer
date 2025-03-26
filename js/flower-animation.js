// flower-animation.js
import { FlowerManager } from './FlowerManager.js';
import { FlowerUploader } from './FlowerUploader.js';

export class FlowerAnimationSystem {
    constructor(canvasId, uploaderContainerId) {
        console.log('Initializing FlowerAnimationSystem...');
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.flowerManager = new FlowerManager();
        this.explosionCount = 0;
        
        // Initialize uploader
        this.uploader = new FlowerUploader(uploaderContainerId, (processedImage, imageId) => {
            console.log('New image processed, adding to flower manager:', { imageId });
            this.flowerManager.addProcessedImage(imageId, processedImage);
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

    // Update and render flowers
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
                activeFragments: this.flowerManager.flowers.length,
                canvasSize: {
                    width: this.canvas.width,
                    height: this.canvas.height
                }
            });
            this.frameCount = 0;
            this.lastFpsUpdate = currentTime;
        }

        // Update flower system
        this.flowerManager.update(currentTime);
        this.flowerManager.render(this.ctx);
    }

    // Handle firework explosion by creating flower effect
    handleFireworkExplosion(x, y, color) {
        this.explosionCount++;
        console.log(`Creating flower explosion #${this.explosionCount} at (${x}, ${y})`);
        
        // Create flower explosion with random image selection and get its color
        const flowerColor = this.flowerManager.createFlowerExplosion(x, y);
        
        // Log explosion stats with color information
        console.debug('Explosion stats:', {
            totalExplosions: this.explosionCount,
            position: {x: x.toFixed(1), y: y.toFixed(1)},
            requestedColor: color,
            flowerColor: flowerColor,
            usingFlowerColor: !!flowerColor,
            canvasSize: {
                width: this.canvas.width,
                height: this.canvas.height
            },
            activeFragments: this.flowerManager.flowers.length
        });

        // Return the flower color to be used for the firework, or null to use default color
        return flowerColor;
    }

    // Clear all flowers
    clearFlowers() {
        console.log('Clearing flower animation system:', {
            totalExplosions: this.explosionCount,
            clearedFragments: this.flowerManager.flowers.length
        });
        this.flowerManager.clear();
    }
}

// Initialize the system when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing flower animation system');
    window.flowerSystem = new FlowerAnimationSystem('animationCanvas', 'flowerUploader');
}); 