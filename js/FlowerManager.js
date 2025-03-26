// FlowerManager.js
import { Flower } from './Flower.js';

export class FlowerManager {
    constructor() {
        console.log('Initializing FlowerManager...');
        this.flowers = [];
        this.processedImages = new Map();
        this.maxFlowers = 50; // Reduced since we're using single flowers
        this.explosionCount = 0;
        this.lastStatsTime = Date.now();
        this.lastFrameTime = Date.now();
        this.stats = {
            updateTime: 0,
            flowers: 0,
            removed: 0,
            total: {
                created: 0,
                removed: 0
            }
        };
    }

    // Store processed flower images
    addProcessedImage(id, image) {
        console.log(`Adding processed image with ID: ${id}`);
        this.processedImages.set(id, image);
        console.debug('Available flower images:', {
            count: this.processedImages.size,
            ids: Array.from(this.processedImages.keys())
        });
    }

    // Remove a processed image
    removeProcessedImage(id) {
        console.log(`Removing processed image with ID: ${id}`);
        const removed = this.processedImages.delete(id);
        console.debug('Image removal result:', {
            imageId: id,
            success: removed,
            remainingCount: this.processedImages.size,
            remainingIds: Array.from(this.processedImages.keys())
        });
        return removed;
    }

    // Get a random image from the processed images
    getRandomImage() {
        const imageIds = Array.from(this.processedImages.keys());
        if (imageIds.length === 0) {
            console.warn('No processed images available for flower effect');
            return null;
        }
        const randomIndex = Math.floor(Math.random() * imageIds.length);
        const randomId = imageIds[randomIndex];
        console.debug('Selected random flower image:', {
            selectedId: randomId,
            totalImages: imageIds.length
        });
        return {
            id: randomId,
            image: this.processedImages.get(randomId)
        };
    }

    // Create a blooming flower effect
    createFlowerExplosion(x, y, imageId = null) {
        // If no specific imageId is provided or the image doesn't exist, use a random one
        let image;
        let selectedImageId;
        
        if (imageId && this.processedImages.has(imageId)) {
            image = this.processedImages.get(imageId);
            selectedImageId = imageId;
            console.debug('Using specified flower image:', { imageId });
        } else {
            const randomImage = this.getRandomImage();
            if (!randomImage) {
                console.debug('No flower images available, explosion will use default colors');
                return null;
            }
            image = randomImage.image;
            selectedImageId = randomImage.id;
            console.debug('Using random flower image:', { imageId: selectedImageId });
        }

        this.explosionCount++;
        const startTime = Date.now();
        console.log(`Creating flower bloom #${this.explosionCount} at (${x}, ${y}) using image: ${selectedImageId}`);

        // Remove old flowers if we're at the limit
        if (this.flowers.length >= this.maxFlowers) {
            const removeCount = 1;
            const removedFlower = this.flowers.shift();
            this.stats.total.removed++;
            console.debug(`Removed old flower to make space:`, {
                position: {x: removedFlower.x.toFixed(0), y: removedFlower.y.toFixed(0)},
                age: (Date.now() - removedFlower.startTime) + 'ms'
            });
        }

        // Create new blooming flower
        const flower = new Flower(x, y, image);
        this.flowers.push(flower);
        this.stats.total.created++;

        const createTime = Date.now() - startTime;
        console.debug('Flower bloom created:', {
            bloomNumber: this.explosionCount,
            imageId: selectedImageId,
            dominantColor: flower.dominantColor,
            createTime: createTime.toFixed(2) + 'ms',
            stats: {
                active: this.flowers.length,
                total: this.stats.total
            }
        });

        // Return just the hex color string instead of the color object
        return flower.dominantColor.hex;
    }

    // Update all flowers
    update(currentTime) {
        const startTime = Date.now();
        
        // Update all flowers
        this.flowers.forEach(flower => flower.update());
        
        // Remove dead flowers
        const initialCount = this.flowers.length;
        this.flowers = this.flowers.filter(flower => !flower.isDead());
        const removedCount = initialCount - this.flowers.length;
        
        // Update performance stats
        const endTime = Date.now();
        this.stats.updateTime = endTime - startTime;
        this.stats.flowers = this.flowers.length;
        this.stats.removed = removedCount;
        this.stats.total.removed += removedCount;
        
        // Log performance stats every second
        const now = Date.now();
        if (now - this.lastStatsTime >= 1000) {
            console.debug('FlowerManager performance:', {
                fps: Math.round(1000 / (now - this.lastFrameTime)),
                updateTime: this.stats.updateTime.toFixed(2) + 'ms',
                activeFlowers: this.stats.flowers,
                removed: this.stats.removed,
                total: this.stats.total
            });
            this.lastStatsTime = now;
            this.stats.removed = 0;
        }
        this.lastFrameTime = now;
    }

    // Render all flowers
    render(ctx) {
        if (this.flowers.length === 0) return;

        const startTime = Date.now();
        
        ctx.save();
        // Enable blending for glow effects
        ctx.globalCompositeOperation = 'lighter';
        
        // Render all flowers
        this.flowers.forEach(flower => flower.render(ctx));
        
        ctx.restore();

        const renderTime = Date.now() - startTime;
        if (renderTime > 16) {
            console.warn('Slow flower render:', {
                time: renderTime.toFixed(2) + 'ms',
                flowerCount: this.flowers.length
            });
        }
    }

    // Clear all flowers
    clear() {
        const clearedCount = this.flowers.length;
        this.stats.total.removed += clearedCount;
        console.log('Clearing flowers:', {
            clearedCount,
            totalStats: {
                blooms: this.explosionCount,
                created: this.stats.total.created,
                removed: this.stats.total.removed
            }
        });
        this.flowers = [];
    }
} 