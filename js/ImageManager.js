// ImageManager.js
import { CustomImage } from './CustomImage.js';

export class ImageManager {
    constructor() {
        console.log('Initializing ImageManager...');
        this.images = [];
        this.processedImages = new Map();
        this.maxImages = 50; // Reduced since we're using single images
        this.explosionCount = 0;
        this.lastStatsTime = Date.now();
        this.lastFrameTime = Date.now();
        this.stats = {
            updateTime: 0,
            images: 0,
            removed: 0,
            total: {
                created: 0,
                removed: 0
            }
        };
    }

    // Store processed custom images
    addProcessedImage(id, image) {
        // Validate id
        if (!id) {
            console.error('Attempted to add image with invalid ID');
            return;
        }
        
        // Extract dominant color
        let dominantColor = image.dominantColor || null;
        
        // Deep clone the color to prevent reference issues
        const storedColor = dominantColor ? {
            rgb: { ...dominantColor.rgb },
            hex: dominantColor.hex
        } : null;
        
        // Store image and color
        this.processedImages.set(id, {
            image: image,
            dominantColor: storedColor
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
            return null;
        }
        
        // Get a random image ID
        const randomIndex = Math.floor(Math.random() * imageIds.length);
        const randomId = imageIds[randomIndex];
        const imageData = this.processedImages.get(randomId);
        
        // Verify we have valid image data
        if (!imageData || !imageData.image) {
            return null;
        }
        
        return {
            id: randomId,
            image: imageData.image,
            dominantColor: imageData.dominantColor
        };
    }

    // Create an image explosion effect with optional color
    createImageExplosion(x, y, imageId = null, forcedColor = null) {
        // Determine which image to use
        let imageData;
        let selectedImageId;
        let selectedColor = forcedColor;
        
        if (imageId && this.processedImages.has(imageId)) {
            // Use the specified image
            imageData = this.processedImages.get(imageId);
            selectedImageId = imageId;
            
            // Use image's color if no forced color
            if (!forcedColor && imageData.dominantColor) {
                selectedColor = imageData.dominantColor.hex;
            }
        } else {
            // Use a random image
            const randomImageData = this.getRandomImage();
            if (!randomImageData) {
                return forcedColor || null;
            }
            
            imageData = this.processedImages.get(randomImageData.id);
            selectedImageId = randomImageData.id;
            
            // Use random image's color if no forced color
            if (!forcedColor && randomImageData.dominantColor) {
                selectedColor = randomImageData.dominantColor.hex;
            }
        }

        this.explosionCount++;

        // Remove old images if we're at the limit
        if (this.images.length >= this.maxImages) {
            this.images.shift();
            this.stats.total.removed++;
        }

        // Create new image explosion with the color
        const customImage = new CustomImage(x, y, imageData.image, selectedColor);
        this.images.push(customImage);
        this.stats.total.created++;
        
        // Return the color that was used
        return selectedColor || customImage.dominantColor.hex;
    }

    // Update all images
    update(currentTime) {
        // Update all images
        this.images.forEach(image => image.update());
        
        // Remove dead images
        const initialCount = this.images.length;
        this.images = this.images.filter(image => !image.isDead());
        const removedCount = initialCount - this.images.length;
        
        // Update stats
        this.stats.images = this.images.length;
        this.stats.removed = removedCount;
        this.stats.total.removed += removedCount;
        
        // Reset removed count periodically
        const now = Date.now();
        if (now - this.lastStatsTime >= 1000) {
            this.lastStatsTime = now;
            this.stats.removed = 0;
        }
        this.lastFrameTime = now;
    }

    // Render all images
    render(ctx) {
        if (this.images.length === 0) return;
        
        ctx.save();
        ctx.globalCompositeOperation = 'source-over';
        
        // Render all images
        this.images.forEach(image => image.render(ctx));
        
        ctx.restore();
    }

    // Clear all images
    clear() {
        const clearedCount = this.images.length;
        this.stats.total.removed += clearedCount;
        console.log('Clearing images:', {
            clearedCount,
            totalStats: {
                blooms: this.explosionCount,
                created: this.stats.total.created,
                removed: this.stats.total.removed
            }
        });
        this.images = [];
    }
} 