/**
 * BackgroundUploader handles the UI for uploading and managing background images
 */
class BackgroundUploader {
    constructor(containerId, onBackgroundAdded, onBackgroundRemoved) {
        this.container = document.getElementById(containerId);
        this.onBackgroundAdded = onBackgroundAdded || function() {};
        this.onBackgroundRemoved = onBackgroundRemoved || function() {};
        this.onSettingsChanged = null; // Will be set from UIController
        this.backgrounds = [];
        this.setupUI();
    }
    
    /**
     * Set up the uploader UI
     */
    setupUI() {
        this.container.innerHTML = `
            <div class="background-upload-container">
                <h3>Background Images</h3>
                <div class="upload-area" id="bgDropZone">
                    <input type="file" id="bgFileInput" accept="image/*" multiple style="display: none;">
                    <div class="upload-content">
                        <p>Drag and drop background images here</p>
                        <p>or</p>
                        <button id="selectBgFiles" class="button">Select Files</button>
                        <p class="file-types">Supported: JPG, PNG, GIF</p>
                    </div>
                </div>
                
                <div class="background-preview-container" id="bgPreviewContainer"></div>
            </div>
        `;
        
        this.setupEventListeners();
    }
    
    /**
     * Set up event listeners for the UI
     */
    setupEventListeners() {
        const dropZone = document.getElementById('bgDropZone');
        const fileInput = document.getElementById('bgFileInput');
        const selectButton = document.getElementById('selectBgFiles');
        
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
    
    /**
     * Handle file uploads
     */
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
                    
                    // Notify parent component
                    this.onBackgroundAdded(img);
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
    
    /**
     * Add a preview for a background image
     */
    addPreview(background) {
        const container = document.getElementById('bgPreviewContainer');
        
        const previewDiv = document.createElement('div');
        previewDiv.className = 'background-preview';
        previewDiv.dataset.id = background.id;
        
        const img = document.createElement('img');
        img.src = background.image.src;
        img.alt = background.filename;
        
        const removeButton = document.createElement('button');
        removeButton.className = 'remove-background';
        removeButton.textContent = '×';
        removeButton.title = 'Remove background';
        
        removeButton.addEventListener('click', () => {
            // Find index by ID
            const index = this.backgrounds.findIndex(bg => bg.id === background.id);
            
            if (index !== -1) {
                // Remove from array
                const removedBg = this.backgrounds.splice(index, 1)[0];
                
                // Remove from UI
                previewDiv.remove();
                
                // Notify parent
                this.onBackgroundRemoved(index);
            }
        });
        
        previewDiv.appendChild(img);
        // previewDiv.appendChild(name); // Removed to hide file name
        previewDiv.appendChild(removeButton);
        
        container.appendChild(previewDiv);
    }
    
    /**
     * Truncate filename to a reasonable length
     */
    truncateFilename(filename) {
        if (filename.length > 20) {
            return filename.substring(0, 10) + '...' + filename.substring(filename.length - 7);
        }
        return filename;
    }
    
    /**
     * Get current background settings
     */
    getSettings() {
        return {
            opacity: parseFloat(document.getElementById('bgOpacity').value),
            transitionDuration: parseFloat(document.getElementById('bgTransitionTime').value) * 1000, // convert to ms
            displayDuration: parseFloat(document.getElementById('bgDisplayTime').value) * 1000 // convert to ms
        };
    }
    
    /**
     * Handle settings changes
     */
    handleSettingsChanged() {
        // Get current settings
        const settings = this.getSettings();
        
        // Notify parent that settings changed
        if (this.onSettingsChanged) {
            this.onSettingsChanged(settings);
        }
    }
}

export default BackgroundUploader;