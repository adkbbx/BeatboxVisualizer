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
        // Validate id to prevent undefined
        if (!id) {
            console.error('Attempted to add image with invalid ID');
            return;
        }
        
        console.log(`Adding processed image with ID: ${id}`);
        
        // Extract and store the dominant color if available on the image
        let dominantColor = null;
        if (image.dominantColor) {
            dominantColor = image.dominantColor;
            console.log(`Stored dominant color for image ${id}: ${dominantColor.hex}`);
        } else {
            console.warn(`No dominant color found for image ${id}`);
        }
        
        // Deep clone the dominant color to prevent reference issues
        const storedColor = dominantColor ? {
            rgb: { ...dominantColor.rgb },
            hex: dominantColor.hex
        } : null;
        
        // Store both the image and its dominant color
        this.processedImages.set(id, {
            image: image,
            dominantColor: storedColor
        });
        
        console.debug('Current flower images:', {
            totalImages: this.processedImages.size,
            imageIDs: Array.from(this.processedImages.keys())
        });
    }

    // Remove a processed image
    removeProcessedImage(id) {
        console.log(`Removing processed image with ID: ${id}`);
        const removed = this.processedImages.delete(id);
        // Debug log for image removal removed to reduce console noise
        return removed;
    }

    // Get a random image from the processed images
    getRandomImage() {
        const imageIds = Array.from(this.processedImages.keys());
        if (imageIds.length === 0) {
            console.warn('No processed images available for flower effect');
            return null;
        }
        
        // Get a random image ID
        const randomIndex = Math.floor(Math.random() * imageIds.length);
        const randomId = imageIds[randomIndex];
        const imageData = this.processedImages.get(randomId);
        
        // Verify we have valid image data
        if (!imageData || !imageData.image) {
            console.error('Invalid image data found in flower manager:', { imageId: randomId });
            return null;
        }
        
        // Log image selection and color info
        const colorInfo = imageData.dominantColor 
            ? `${imageData.dominantColor.hex} - RGB(${imageData.dominantColor.rgb.r},${imageData.dominantColor.rgb.g},${imageData.dominantColor.rgb.b})`
            : 'None';
            
        console.log(`Selected flower image: ${randomId} with color: ${colorInfo}`);
        
        return {
            id: randomId,
            image: imageData.image,
            dominantColor: imageData.dominantColor
        };
    }

    // Create a blooming flower effect
    // Added forcedColor parameter to allow forcing a specific color
    createFlowerExplosion(x, y, imageId = null, forcedColor = null) {
        // If no specific imageId is provided or the image doesn't exist, use a random one
        let imageData;
        let selectedImageId;
        let selectedColor = forcedColor;
        
        if (imageId && this.processedImages.has(imageId)) {
            imageData = this.processedImages.get(imageId);
            selectedImageId = imageId;
            
            // If we're not forcing a color but the image has a dominant color, use that
            if (!forcedColor && imageData.dominantColor) {
                selectedColor = imageData.dominantColor.hex;
                console.debug(`Using dominant color from image ${imageId}: ${selectedColor}`);
            }
        } else {
            const randomImageData = this.getRandomImage();
            if (!randomImageData) {
                console.debug('No flower images available, explosion will use default colors');
                return forcedColor || null;
            }
            
            imageData = this.processedImages.get(randomImageData.id);
            selectedImageId = randomImageData.id;
            
            // If we're not forcing a color but the random image has a dominant color, use that
            if (!forcedColor && randomImageData.dominantColor) {
                selectedColor = randomImageData.dominantColor.hex;
                console.debug(`Using dominant color from random image: ${selectedColor}`);
            }
        }

        this.explosionCount++;
        const startTime = Date.now();
        console.log(`Creating flower bloom #${this.explosionCount} at (${x}, ${y}) using image: ${selectedImageId}`);
        
        // Log color information
        console.log(`Color for flower #${this.explosionCount}: ${selectedColor || 'extracting from image'}`);

        // Remove old flowers if we're at the limit
        if (this.flowers.length >= this.maxFlowers) {
            const removeCount = 1;
            const removedFlower = this.flowers.shift();
            this.stats.total.removed++;
        }

        // Create new blooming flower with optional color
        const flower = new Flower(x, y, imageData.image, selectedColor);
        this.flowers.push(flower);
        this.stats.total.created++;

        const createTime = Date.now() - startTime;
        
        // Return the color that was actually used
        const usedColor = selectedColor || flower.dominantColor.hex;
        console.debug(`Flower bloom #${this.explosionCount} using color: ${usedColor}`);
        
        return usedColor;
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
        
        // Performance stats logging every second removed to reduce console noise
        const now = Date.now();
        if (now - this.lastStatsTime >= 1000) {
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
        ctx.globalCompositeOperation = 'source-over'; // Changed from 'lighter' to prevent brightness accumulation
        
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