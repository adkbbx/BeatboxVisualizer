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
    // Always return the flower's color for the firework to use
    handleFireworkExplosion(x, y, color, useFireworkColor = false) {
        this.explosionCount++;
        console.log(`Creating flower explosion #${this.explosionCount} at (${x}, ${y})`);
        
        // If we're not forcing the firework color, let the flower image determine the color
        let flowerColor;
        
        if (useFireworkColor) {
            // Use the firework's color for the flower
            flowerColor = this.flowerManager.createFlowerExplosion(x, y, null, color);
            console.log(`Using firework color for explosion: ${color}`);
        } else {
            // Let the flower's natural color be used
            flowerColor = this.flowerManager.createFlowerExplosion(x, y, null, null);
            console.log(`Using flower's natural color for explosion: ${flowerColor}`);
            
            // Important: Return the flower's color for the firework to use
            // This ensures the firework explosion matches the flower color
            color = flowerColor;
        }
        
        // Log explosion stats with color information
        console.debug('Explosion stats:', {
            totalExplosions: this.explosionCount,
            position: {x: x.toFixed(1), y: y.toFixed(1)},
            finalColor: color,
            colorSource: useFireworkColor ? 'firework' : 'flower',
            canvasSize: {
                width: this.canvas.width,
                height: this.canvas.height
            },
            activeFragments: this.flowerManager.flowers.length
        });

        // Return the color that should be used for the firework particles
        return color;
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