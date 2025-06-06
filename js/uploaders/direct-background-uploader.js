// direct-background-uploader.js
import BackgroundManager from '../managers/BackgroundManager.js';

export class DirectBackgroundUploader {
    constructor() {
        // Create background manager - now uses its own background canvas
        this.backgroundManager = new BackgroundManager();
        
        if (!this.backgroundManager.canvas) {
            return;
        }
        
        this.backgrounds = [];
        this.maxFileSize = 100 * 1024 * 1024; // 100MB max for videos
        this.supportedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        this.supportedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
        
        // Give DOM time to fully load
        setTimeout(() => {
            // Initialize upload event handlers
            this.initializeEventListeners();
            
            // Apply initial background settings
            this.updateBackgroundSettings();
        }, 200);
    }

    initializeEventListeners() {
        // Setup dropzone event listeners
        const dropZone = document.getElementById('bgDropZone');
        const fileInput = document.getElementById('bgFileInput');
        const selectButton = document.getElementById('selectBgFiles');
        
        if (!dropZone || !fileInput || !selectButton) {
            console.warn('DirectBackgroundUploader: Required elements not found', {
                dropZone: !!dropZone,
                fileInput: !!fileInput,
                selectButton: !!selectButton
            });
            return;
        }

        // Update file input to accept videos and images
        fileInput.setAttribute('accept', [...this.supportedImageTypes, ...this.supportedVideoTypes].join(','));

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
    
    /**
     * Determine the media type based on file type
     * @param {File} file - The file to check
     * @returns {string} - 'image', 'video', 'gif', or null if not supported
     */
    getMediaType(file) {
        if (file.type === 'image/gif') {
            return 'gif';
        } else if (this.supportedImageTypes.includes(file.type)) {
            return 'image';
        } else if (this.supportedVideoTypes.includes(file.type)) {
            return 'video';
        }
        return null;
    }
    
    /**
     * Validate file size and type
     * @param {File} file - The file to validate
     * @returns {Object} - {valid: boolean, error: string}
     */
    validateFile(file) {
        const mediaType = this.getMediaType(file);
        
        if (!mediaType) {
            return {
                valid: false,
                error: `Unsupported file type: ${file.type}. Supported types: Images (JPG, PNG, GIF, WebP) and Videos (MP4, WebM, OGG)`
            };
        }
        
        if (file.size > this.maxFileSize) {
            const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
            const maxSizeMB = (this.maxFileSize / (1024 * 1024)).toFixed(0);
            return {
                valid: false,
                error: `File too large: ${sizeMB}MB. Maximum size: ${maxSizeMB}MB`
            };
        }
        
        return { valid: true, error: null };
    }
    
    handleFiles(files) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            
            // Validate file
            const validation = this.validateFile(file);
            if (!validation.valid) {
                this.showError(`${file.name}: ${validation.error}`);
                continue;
            }
            
            const mediaType = this.getMediaType(file);
            
            if (mediaType === 'video') {
                this.handleVideoFile(file);
            } else {
                this.handleImageFile(file, mediaType);
            }
        }
    }
    
    /**
     * Handle image/GIF files
     * @param {File} file - The image file
     * @param {string} mediaType - 'image' or 'gif'
     */
    handleImageFile(file, mediaType) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            
            img.onload = () => {
                // Add to backgrounds array
                const index = this.backgrounds.length;
                const backgroundItem = {
                    id: `bg_${Date.now()}_${index}`,
                    element: img,
                    filename: file.name,
                    type: mediaType,
                    size: file.size
                };
                
                this.backgrounds.push(backgroundItem);
                
                // Add preview
                this.addPreview(backgroundItem);
                
                // Add to background manager
                if (mediaType === 'gif') {
                    this.backgroundManager.addBackgroundGIF(img, { filename: file.name });
                } else {
                    this.backgroundManager.addBackgroundMedia(img, 'image', { filename: file.name });
                }
            };
            
            img.onerror = () => {
                this.showError(`Failed to load image: ${file.name}`);
            };
            
            img.src = e.target.result;
        };
        
        reader.onerror = () => {
            this.showError(`Failed to read file: ${file.name}`);
        };
        
        reader.readAsDataURL(file);
    }
    
    /**
     * Handle video files
     * @param {File} file - The video file
     */
    handleVideoFile(file) {
        const video = document.createElement('video');
        
        // CRITICAL: Configure video for autoplay compatibility
        video.muted = true; // Must be muted for autoplay
        video.autoplay = true; // Enable autoplay
        video.playsInline = true; // Required for iOS autoplay
        video.preload = 'metadata';
        video.crossOrigin = 'anonymous';
        
        // Set attributes as HTML attributes too (some browsers prefer this)
        video.setAttribute('muted', '');
        video.setAttribute('autoplay', '');
        video.setAttribute('playsinline', '');
        
        const url = URL.createObjectURL(file);
        
        const videoLoadPromise = new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Video load timeout'));
            }, 10000); // 10 second timeout
            
            video.addEventListener('loadedmetadata', () => {
                clearTimeout(timeout);
                resolve();
            });
            
            video.addEventListener('canplay', () => {
                clearTimeout(timeout);
                resolve();
            });
            
            video.addEventListener('error', (e) => {
                clearTimeout(timeout);
                console.error(`Video load error: ${file.name}`, e);
                reject(e);
            });
        });
        
        // Set the source - this should trigger autoplay if properly configured
        video.src = url;
        
        videoLoadPromise.then(() => {
            // Create background item
            const index = this.backgrounds.length;
            const backgroundItem = {
                id: `bg_${Date.now()}_${index}`,
                element: video,
                filename: file.name,
                type: 'video',
                size: file.size,
                duration: video.duration || 0,
                url: url // Keep reference to URL for cleanup
            };
            
            this.backgrounds.push(backgroundItem);
            
            // Add preview first
            this.addPreview(backgroundItem);
            
            // Add to background manager - this should trigger autoplay
            const mediaIndex = this.backgroundManager.addBackgroundMedia(video, 'video', { 
                filename: file.name, 
                duration: video.duration || 0
            });
            
            // Start background manager if not already active
            if (!this.backgroundManager.isActive && this.backgroundManager.backgroundMedia.length > 0) {
                this.backgroundManager.startIndependentLoop();
            }
            
        }).catch((error) => {
            this.showError(`Failed to load video: ${file.name} - ${error.message}`);
            URL.revokeObjectURL(url);
        });
    }
    
    /**
     * Add preview for media items
     * @param {Object} backgroundItem - The background item to preview
     */
    addPreview(backgroundItem) {
        const container = document.getElementById('bgPreviewContainer');
        if (!container) {
            return;
        }
        
        const previewDiv = document.createElement('div');
        previewDiv.className = `background-preview ${backgroundItem.type}-preview`;
        previewDiv.dataset.id = backgroundItem.id;
        previewDiv.style.position = 'relative';
        
        if (backgroundItem.type === 'video') {
            this.createVideoPreview(previewDiv, backgroundItem);
        } else {
            this.createImagePreview(previewDiv, backgroundItem);
        }
        
        // Create an unmissable delete button
        const removeButton = document.createElement('button');
        removeButton.innerHTML = '&#10005;'; // X symbol
        removeButton.className = 'remove-background';
        removeButton.title = `Remove ${backgroundItem.filename}`;
        
        removeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeBackground(backgroundItem.id, previewDiv);
        });
        
        previewDiv.appendChild(removeButton);
        container.appendChild(previewDiv);
    }
    
    /**
     * Create preview for image/GIF
     * @param {HTMLElement} previewDiv - The preview container
     * @param {Object} backgroundItem - The background item
     */
    createImagePreview(previewDiv, backgroundItem) {
        const img = document.createElement('img');
        img.src = backgroundItem.element.src;
        img.alt = backgroundItem.filename;
        
        const info = document.createElement('div');
        info.className = 'media-info';
        info.innerHTML = `
            <div class="filename">${this.truncateFilename(backgroundItem.filename)}</div>
            <div class="media-details">
                ${backgroundItem.type.toUpperCase()} • ${this.formatFileSize(backgroundItem.size)}
            </div>
        `;
        
        previewDiv.appendChild(img);
        previewDiv.appendChild(info);
    }
    
    /**
     * Create preview for video
     * @param {HTMLElement} previewDiv - The preview container
     * @param {Object} backgroundItem - The background item
     */
    createVideoPreview(previewDiv, backgroundItem) {
        const video = document.createElement('video');
        video.src = backgroundItem.element.src;
        video.muted = true;
        video.currentTime = 1; // Show frame at 1 second
        
        const playIcon = document.createElement('div');
        playIcon.className = 'play-icon';
        playIcon.innerHTML = '▶';
        
        const info = document.createElement('div');
        info.className = 'media-info';
        info.innerHTML = `
            <div class="filename">${this.truncateFilename(backgroundItem.filename)}</div>
            <div class="media-details">
                VIDEO • ${this.formatDuration(backgroundItem.duration)} • ${this.formatFileSize(backgroundItem.size)}
            </div>
        `;
        
        // Add click handler to preview video
        previewDiv.addEventListener('click', (e) => {
            if (e.target !== previewDiv.querySelector('.remove-background')) {
                this.previewVideo(backgroundItem);
            }
        });
        
        previewDiv.appendChild(video);
        previewDiv.appendChild(playIcon);
        previewDiv.appendChild(info);
    }
    
    /**
     * Remove a background item
     * @param {string} id - The ID of the background to remove
     * @param {HTMLElement} previewDiv - The preview element to remove
     */
    removeBackground(id, previewDiv) {
        // Find index by ID
        const index = this.backgrounds.findIndex(bg => bg.id === id);
        
        if (index !== -1) {
            const removedBg = this.backgrounds.splice(index, 1)[0];
            
            // Clean up URL if it's a video
            if (removedBg.type === 'video' && removedBg.url) {
                URL.revokeObjectURL(removedBg.url);
            }
            
            // Remove from UI
            previewDiv.remove();
            
            // Remove from background manager
            this.backgroundManager.removeBackgroundMedia(index);
        }
    }
    
    /**
     * Preview a video in a modal or overlay
     * @param {Object} backgroundItem - The video background item
     */
    previewVideo(backgroundItem) {
        // Create a simple modal for video preview
        const modal = document.createElement('div');
        modal.className = 'video-preview-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        const video = document.createElement('video');
        video.src = backgroundItem.element.src;
        video.controls = true;
        video.autoplay = true;
        video.muted = true;
        video.style.maxWidth = '90%';
        video.style.maxHeight = '90%';
        
        const closeButton = document.createElement('button');
        closeButton.innerHTML = '✕';
        closeButton.style.cssText = `
            position: absolute;
            top: 20px;
            right: 30px;
            background: rgba(255,255,255,0.8);
            border: none;
            font-size: 24px;
            padding: 10px;
            cursor: pointer;
            border-radius: 50%;
        `;
        
        closeButton.addEventListener('click', () => {
            video.pause();
            document.body.removeChild(modal);
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                video.pause();
                document.body.removeChild(modal);
            }
        });
        
        modal.appendChild(video);
        modal.appendChild(closeButton);
        document.body.appendChild(modal);
    }
    
    /**
     * Show error message to user
     * @param {string} message - The error message
     */
    showError(message) {
        console.error('Background Upload Error:', message);
        
        // Create a temporary error display
        const errorDiv = document.createElement('div');
        errorDiv.className = 'upload-error';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4444;
            color: white;
            padding: 10px 15px;
            border-radius: 5px;
            z-index: 1000;
            max-width: 300px;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        // Remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }
    
    /**
     * Format file size for display
     * @param {number} bytes - File size in bytes
     * @returns {string} - Formatted size string
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    /**
     * Format video duration for display
     * @param {number} seconds - Duration in seconds
     * @returns {string} - Formatted duration string
     */
    formatDuration(seconds) {
        if (isNaN(seconds)) return '0:00';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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
            displayDuration: parseFloat(document.getElementById('bgDisplayTime').value || 5) * 1000, // convert to ms
            videoVolume: 0, // Always keep videos muted to avoid conflicts
            videoLoop: document.getElementById('videoLoop')?.checked ?? true,
            videoFullDuration: document.getElementById('videoFullDuration')?.checked ?? true
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
