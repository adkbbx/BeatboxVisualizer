// direct-image-uploader.js
import ImageManager from '../managers/ImageManager.js';
import ImageProcessor from '../utils/ImageProcessor.js';

export class DirectImageUploader {
    constructor() {
        this.imageManager = new ImageManager();
        this.imageProcessor = new ImageProcessor();
        this.explosionCount = 0;
        
        // Give DOM time to fully load
        setTimeout(() => {
            // Initialize upload event handlers
            this.initializeEventListeners();
        }, 100);
    }

    initializeEventListeners() {
        // Setup dropzone event listeners
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const selectButton = document.getElementById('selectFiles');
        
        if (!dropZone || !fileInput || !selectButton) {
            console.warn('DirectImageUploader: Required elements not found', {
                dropZone: !!dropZone,
                fileInput: !!fileInput,
                selectButton: !!selectButton
            });
            return;
        }

        // Setup drag and drop events with better event handling
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, (e) => {
                this.preventDefaults(e);
                
                // Add visual feedback for drag events
                if (eventName === 'dragenter' || eventName === 'dragover') {
                    dropZone.classList.add('dragover');
                } else if (eventName === 'dragleave' || eventName === 'drop') {
                    dropZone.classList.remove('dragover');
                }
                
                // Handle file drop
                if (eventName === 'drop' && e.dataTransfer && e.dataTransfer.files) {
                    this.handleFiles(e.dataTransfer.files);
                }
            }, false);
        });
        
        // Handle file selection via button
        selectButton.addEventListener('click', () => {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', e => {
            if (e.target.files.length > 0) {
                this.handleFiles(e.target.files);
            }
        });
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    async handleFiles(files) {
        for (const file of files) {
            try {
                // Validate the file
                this.imageProcessor.validateImage(file);
                
                // Process the image
                const processedImage = await this.imageProcessor.processImage(file);
                
                // The dominant color is attached to the canvas by the ImageProcessor
                const dominantColor = processedImage.dominantColor;
                
                // Generate a unique ID for this image
                const imageId = `image_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
                
                // Add preview with the ID and dominant color
                this.addPreview(processedImage, dominantColor, imageId);
                
                // Add to image manager
                this.imageManager.addProcessedImage(imageId, processedImage);
            } catch (error) {
                this.showError(error.message);
            }
        }
    }

    addPreview(canvas, dominantColor, imageId) {
        const previewContainer = document.getElementById('previewContainer');
        if (!previewContainer) {
            return;
        }
        
        const preview = document.createElement('div');
        preview.className = 'image-preview';
        preview.style.position = 'relative'; // Ensure relative positioning
        
        // Store the imageId as a data attribute for reference
        preview.dataset.imageId = imageId;
        
        // Convert canvas to image for preview
        const img = document.createElement('img');
        img.src = canvas.toDataURL('image/png');
        img.style.maxWidth = '100%';
        img.style.maxHeight = '100%';
        
        // Create the color swatch div
        const colorSwatch = document.createElement('div');
        colorSwatch.className = 'color-swatch';
        // Set background color based on dominant color, fallback to a default
        colorSwatch.style.backgroundColor = dominantColor ? dominantColor.hex : '#cccccc';
        
        // Create an unmissable delete button
        const removeButton = document.createElement('button');
        removeButton.innerHTML = '&#10005;'; // X symbol
        removeButton.className = 'remove-preview';
        
        // Add click handler for removal
        removeButton.onclick = (e) => {
            e.stopPropagation(); // Prevent any parent handlers from firing
            preview.remove();
            // Remove from ImageManager when image is removed
            if (window.imageSystem) {
                window.imageSystem.imageManager.removeProcessedImage(imageId);
            }
        };
        
        // Add elements to the preview in specific order
        preview.appendChild(img);
        preview.appendChild(colorSwatch); // Add the swatch to the preview
        preview.appendChild(removeButton);
        
        // Add preview to container
        previewContainer.appendChild(preview);
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        
        // Check if message is a translation key or direct text
        if (window.i18n && message.includes('.')) {
            // Assume it's a translation key if it contains dots
            errorDiv.textContent = window.i18n.t(message) || message;
        } else {
            errorDiv.textContent = message;
        }
        
        const container = document.querySelector('.image-upload-container');
        if (container) {
            container.appendChild(errorDiv);
            
            setTimeout(() => {
                errorDiv.remove();
            }, 3000);
        }
    }

    // Handle firework explosion by creating image effect
    handleFireworkExplosion(x, y, color, useFireworkColor, customImageId, size) {
        // Handle default parameters manually for better compatibility
        if (useFireworkColor === undefined) useFireworkColor = true;
        if (customImageId === undefined) customImageId = null;
        if (size === undefined) size = 1.0;
        
        this.explosionCount++;
        
        // Use the specific custom image ID if provided
        let imageColor;
        if (customImageId) {
            imageColor = this.imageManager.createImageExplosion(x, y, customImageId, color, size);
        } else {
            // Otherwise use a random image with the provided color and size
            imageColor = this.imageManager.createImageExplosion(x, y, null, color, size);
        }
        
        // Return the color that was actually used
        return imageColor;
    }

    // Update and render images
    update() {
        const currentTime = performance.now();

        // Update image system
        this.imageManager.update(currentTime);
        this.imageManager.render(document.getElementById('animationCanvas').getContext('2d'));
    }

    // Clear all images
    clearImages() {
        this.imageManager.clear();
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Create the image system with direct uploader
    window.imageSystem = new DirectImageUploader();
    
    // For backward compatibility, also set flowerSystem reference
    if (!window.flowerSystem) {
        window.flowerSystem = window.imageSystem;
    }
    
    // Dispatch an event to signal that direct uploaders are initialized
    // We'll use this to connect to the animation controller
    if (window.backgroundSystem) {
        window.dispatchEvent(new Event('directUploadersInitialized'));
    } else {
        // If background system isn't ready yet, wait for it
        window.addEventListener('backgroundUploaderInitialized', () => {
            window.dispatchEvent(new Event('directUploadersInitialized'));
        });
    }
});