// FlowerUploader.js
import { ImageProcessor } from './ImageProcessor.js';

export class FlowerUploader {
    constructor(containerId, onImageProcessed) {
        console.log('Initializing FlowerUploader...');
        this.container = document.getElementById(containerId);
        this.onImageProcessed = onImageProcessed;
        this.imageProcessor = new ImageProcessor();
        this.setupUI();
    }

    setupUI() {
        console.log('Setting up upload UI...');
        this.container.innerHTML = `
            <div class="flower-upload-container">
                <div class="upload-area" id="dropZone">
                    <input type="file" id="fileInput" accept="image/*" multiple style="display: none;">
                    <div class="upload-content">
                        <p>Drag and drop flower images here</p>
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
        console.log('Setting up event listeners...');
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
        console.log(`Processing ${files.length} files...`);
        for (const file of files) {
            try {
                this.imageProcessor.validateImage(file);
                const processedImage = await this.imageProcessor.processImage(file);
                this.addPreview(processedImage);
                this.onImageProcessed(processedImage);
            } catch (error) {
                console.error(`Error handling file ${file.name}:`, error);
                this.showError(error.message);
            }
        }
    }

    addPreview(canvas) {
        console.log('Adding image preview...');
        const previewContainer = document.getElementById('previewContainer');
        const preview = document.createElement('div');
        preview.className = 'image-preview';
        
        // Generate unique ID for this image
        const imageId = `flower_${Date.now()}`;
        
        // Convert canvas to image for preview
        const img = document.createElement('img');
        img.src = canvas.toDataURL('image/png');
        
        const removeButton = document.createElement('button');
        removeButton.textContent = '×';
        removeButton.className = 'remove-preview';
        removeButton.onclick = () => {
            preview.remove();
            // Remove from FlowerManager when image is removed
            if (window.flowerSystem) {
                window.flowerSystem.flowerManager.removeProcessedImage(imageId);
                console.log('Removed image and cleaned up resources:', { imageId });
            }
        };
        
        preview.appendChild(img);
        preview.appendChild(removeButton);
        previewContainer.appendChild(preview);
        
        // Add to FlowerManager with the same ID
        this.onImageProcessed(canvas, imageId);
        
        console.debug('Preview added:', {
            imageId,
            dimensions: {
                width: canvas.width,
                height: canvas.height
            }
        });
    }

    showError(message) {
        console.error('Showing error message:', message);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        this.container.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 3000);
    }
} 