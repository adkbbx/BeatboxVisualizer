// ImageManager.js
import { CustomImage } from '../effects/CustomImage.js';

class ImageManager {
    constructor() {
        this.images = [];
        this.processedImages = new Map();
        this.maxImages = 50; // Reduced since we're using single images
        this.explosionCount = 0;
        this.lastFrameTime = Date.now();
    }

    // Store processed custom images
    addProcessedImage(id, image) {
        // Validate id
        if (!id) {
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
        const removed = this.processedImages.delete(id);
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

    // Create an image explosion effect with optional color and size
    createImageExplosion(x, y, imageId, forcedColor, size) {
        // Handle default parameters manually for better compatibility
        if (imageId === undefined) imageId = null;
        if (forcedColor === undefined) forcedColor = null;
        if (size === undefined) size = 1.0;
        
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
        }

        // Create new image explosion with the color and size
        const customImage = new CustomImage(x, y, imageData.image, selectedColor, size);
        this.images.push(customImage);
        
        // Return the color that was used
        return selectedColor || customImage.dominantColor.hex;
    }

    // Update all images
    update(currentTime) {
        // Update all images
        this.images.forEach(image => image.update());
        
        // Remove dead images
        this.images = this.images.filter(image => !image.isDead());
        
        this.lastFrameTime = currentTime; // Use currentTime instead of Date.now()
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
        this.images = [];
    }
}

export default ImageManager;