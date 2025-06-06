// ImageProcessor.js
import BackgroundRemover from './BackgroundRemover.js';
import ColorExtractor from './ColorExtractor.js';

class ImageProcessor {
    constructor() {
        this.maxSize = 150; // Maximum size for any dimension
        this.backgroundRemover = new BackgroundRemover();
        this.colorExtractor = new ColorExtractor();
    }

    /**
     * Process uploaded image
     */
    processImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    try {
                        // Create a temporary canvas for processing
                        const tempCanvas = document.createElement('canvas');
                        const tempCtx = tempCanvas.getContext('2d');

                        // Calculate scaled dimensions while maintaining aspect ratio
                        let width = img.width;
                        let height = img.height;
                        const aspectRatio = width / height;

                        if (width > height) {
                            width = Math.min(width, this.maxSize);
                            height = width / aspectRatio;
                        } else {
                            height = Math.min(height, this.maxSize);
                            width = height * aspectRatio;
                        }

                        // Set canvas size to scaled dimensions
                        tempCanvas.width = width;
                        tempCanvas.height = height;

                        // Draw and process the image
                        tempCtx.drawImage(img, 0, 0, width, height);
                        
                        // Check if background removal is enabled
                        let backgroundRemovalEnabled = true; // default to true
                        
                        // Try to get from DOM element first
                        const backgroundRemovalToggle = document.getElementById('backgroundRemovalEnabled');
                        if (backgroundRemovalToggle) {
                            backgroundRemovalEnabled = backgroundRemovalToggle.checked;
                        } else {
                            // Fallback to checking localStorage settings
                            try {
                                const savedSettings = localStorage.getItem('vibecoding-animation-settings');
                                if (savedSettings) {
                                    const parsed = JSON.parse(savedSettings);
                                    if (parsed.effects && parsed.effects.backgroundRemovalEnabled !== undefined) {
                                        backgroundRemovalEnabled = parsed.effects.backgroundRemovalEnabled;
                                    }
                                }
                            } catch (error) {
                                // Keep default value if parsing fails
                            }
                        }
                        
                        // Remove background only if enabled
                        if (backgroundRemovalEnabled) {
                            const imageData = tempCtx.getImageData(0, 0, width, height);
                            this.backgroundRemover.removeBackground(imageData, tempCtx);
                        }
                        
                        // Extract the dominant color
                        const dominantColor = this.colorExtractor.extractDominantColor(tempCanvas);
                        
                        // Store the dominant color with the canvas
                        tempCanvas.dominantColor = dominantColor;
                        
                        resolve(tempCanvas);
                    } catch (error) {
                        reject(error);
                    }
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    /**
     * Validate image file
     */
    validateImage(file) {
        const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!validTypes.includes(file.type)) {
            throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
        }

        if (file.size > maxSize) {
            throw new Error('File too large. Maximum size is 5MB.');
        }

        return true;
    }
}

export default ImageProcessor;