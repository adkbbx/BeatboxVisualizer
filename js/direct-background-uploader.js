// direct-background-uploader.js
import BackgroundManager from './BackgroundManager.js';

export class DirectBackgroundUploader {
    constructor() {
        // Create background manager - now uses its own background canvas
        this.backgroundManager = new BackgroundManager();
        
        if (!this.backgroundManager.canvas) {
            return;
        }
        
        this.backgrounds = [];
        
        // Give DOM time to fully load
        setTimeout(() => {
            // Initialize upload event handlers
            this.initializeEventListeners();
        }, 200); // Wait a bit longer than the image uploader
    }

    initializeEventListeners() {
        // Setup dropzone event listeners
        const dropZone = document.getElementById('bgDropZone');
        const fileInput = document.getElementById('bgFileInput');
        const selectButton = document.getElementById('selectBgFiles');
        
        if (!dropZone || !fileInput || !selectButton) {
            return;
        }

        // Setup drag and drop events
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, this.preventDefaults.bind(this), false);
        });
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.add('dragover');
            }, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, () => {
                dropZone.classList.remove('dragover');
            }, false);
        });
        
        // Handle file drop
        dropZone.addEventListener('drop', e => {
            this.handleFiles(e.dataTransfer.files);
        }, false);
        
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
    
    handleFiles(files) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Validate file is an image
            if (!file.type.startsWith('image/')) {
                continue;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    // Add to backgrounds array
                    const index = this.backgrounds.length;
                    this.backgrounds.push({
                        id: `bg_${Date.now()}_${index}`,
                        image: img,
                        filename: file.name
                    });
                    
                    // Add preview
                    this.addPreview(this.backgrounds[index]);
                    
                    // Add to background manager
                    this.backgroundManager.addBackgroundImage(img);
                };
                
                img.onerror = () => {
                };
                
                img.src = e.target.result;
            };
            
            reader.onerror = () => {
            };
            
            reader.readAsDataURL(file);
        }
    }
    
    addPreview(background) {
        const container = document.getElementById('bgPreviewContainer');
        if (!container) {
            return;
        }
        
        const previewDiv = document.createElement('div');
        previewDiv.className = 'background-preview';
        previewDiv.dataset.id = background.id;
        previewDiv.style.position = 'relative'; // Ensure relative positioning
        
        const img = document.createElement('img');
        img.src = background.image.src;
        img.alt = background.filename;
        
        // Create an unmissable delete button
        const removeButton = document.createElement('button');
        removeButton.innerHTML = '&#10005;'; // X symbol
        removeButton.className = 'remove-background';
        
        removeButton.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent any parent handlers from firing
            
            // Find index by ID
            const index = this.backgrounds.findIndex(bg => bg.id === background.id);
            
            if (index !== -1) {
                // Remove from array
                const removedBg = this.backgrounds.splice(index, 1)[0];
                
                // Remove from UI
                previewDiv.remove();
                
                // Remove from background manager
                this.backgroundManager.removeBackgroundImage(index);
            }
        });
        
        previewDiv.appendChild(img);
        previewDiv.appendChild(removeButton);
        
        container.appendChild(previewDiv);
    }
    
    truncateFilename(filename) {
        if (filename.length > 20) {
            return filename.substring(0, 10) + '...' + filename.substring(filename.length - 7);
        }
        return filename;
    }
    
    updateBackgroundSettings() {
        const settings = {
            opacity: parseFloat(document.getElementById('bgOpacity').value || 0.5),
            transitionDuration: parseFloat(document.getElementById('bgTransitionTime').value || 2) * 1000, // convert to ms
            displayDuration: parseFloat(document.getElementById('bgDisplayTime').value || 5) * 1000 // convert to ms
        };
        
        // Update background manager with the new settings
        this.backgroundManager.updateSettings(settings);
    }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
    // Create the background system with direct uploader
    window.backgroundSystem = new DirectBackgroundUploader();
    
    // Dispatch an event to signal that background uploader is initialized
    window.dispatchEvent(new Event('backgroundUploaderInitialized'));
    
    // If image system is already initialized, dispatch the combined initialization event
    if (window.imageSystem) {
        window.dispatchEvent(new Event('directUploadersInitialized'));
    }
});