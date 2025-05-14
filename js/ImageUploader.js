// ImageUploader.js
import { ImageProcessor } from './ImageProcessor.js';

export class ImageUploader {
    constructor(containerId, onImageProcessed) {
        this.container = document.getElementById(containerId);
        this.onImageProcessed = onImageProcessed;
        this.imageProcessor = new ImageProcessor();
        this.setupUI();
    }

    setupUI() {
        this.container.innerHTML = `
            <div class="image-upload-container">
                <div class="upload-area" id="dropZone">
                    <input type="file" id="fileInput" accept="image/*" multiple style="display: none;">
                    <div class="upload-content">
                        <p>Drag and drop custom images here</p>
                        <p>or</p>
                        <button id="selectFiles">Select Files</button>
                        <p class="file-types">Supported: JPG, PNG, GIF (max 5MB)</p>
                    </div>
                </div>
                <div class="preview-container" id="previewContainer"></div>
            </div>
        `;

        this.setupEventListeners();
    }

    setupEventListeners() {
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');
        const selectButton = document.getElementById('selectFiles');

        // Drag and drop events
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('dragover');
        });

        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('dragover');
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            this.handleFiles(e.dataTransfer.files);
        });

        // Click to select files
        selectButton.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files);
        });
    }

    async handleFiles(files) {
        for (const file of files) {
            try {
                this.imageProcessor.validateImage(file);
                const processedImage = await this.imageProcessor.processImage(file);
                
                // The dominant color is now attached to the canvas by the ImageProcessor
                const dominantColor = processedImage.dominantColor;
                
                // Generate a unique ID for this image
                const imageId = `image_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
                
                // Add preview with the ID and dominant color
                this.addPreview(processedImage, dominantColor, imageId);
                
                // Process the image with the same ID
                this.onImageProcessed(processedImage, imageId);
            } catch (error) {
                this.showError(error.message);
            }
        }
    }

    addPreview(canvas, dominantColor, imageId) {
        const previewContainer = document.getElementById('previewContainer');
        const preview = document.createElement('div');
        preview.className = 'image-preview';
        
        // Store the imageId as a data attribute for reference
        preview.dataset.imageId = imageId;
        
        // Convert canvas to image for preview
        const img = document.createElement('img');
        img.src = canvas.toDataURL('image/png');
        
        // Create a color swatch to show the extracted dominant color
        const colorSwatch = document.createElement('div');
        colorSwatch.className = 'color-swatch';
        colorSwatch.style.backgroundColor = dominantColor ? dominantColor.hex : '#cccccc';
        
        const removeButton = document.createElement('button');
        removeButton.textContent = '×';
        removeButton.className = 'remove-preview';
        removeButton.onclick = () => {
            preview.remove();
            // Remove from ImageManager when image is removed
            if (window.imageSystem) {
                window.imageSystem.imageManager.removeProcessedImage(imageId);
            }
        };
        
        preview.appendChild(img);
        preview.appendChild(colorSwatch); // Append swatch directly
        preview.appendChild(removeButton);
        previewContainer.appendChild(preview);
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        this.container.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }
}