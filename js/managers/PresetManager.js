// PresetManager.js - Self-contained preset management
export class PresetManager {
    constructor() {
        this.defaultPresets = new Map();
        this.externalPresets = new Map();
        this.currentPreset = null;
        this.isInitialized = false;
        this.loadingProgress = {
            current: 0,
            total: 0,
            isLoading: false
        };
    }

    async initialize() {
        if (this.isInitialized) return;
        
        await this.loadDefaultPresets();
        this.isInitialized = true;
    }

    async loadDefaultPresets() {
        const discoveredFolders = await this.discoverPresetFolders();
        
        if (discoveredFolders.length === 0) {
            return;
        }
        
        // Check each discovered folder for valid preset structure
        for (const folderName of discoveredFolders) {
            try {
                const preset = await this.createPresetFromFolder(folderName);
                
                if (preset && preset.totalCount > 0) {
                    this.defaultPresets.set(folderName, {
                        ...preset,
                        type: 'default'
                    });
                }
            } catch (error) {
                // Silently skip folders that can't be processed
            }
        }
    }

    async discoverPresetFolders() {
        const folders = [];
        
        try {
            const response = await fetch('./presets/', { method: 'GET' });
            if (response.ok) {
                const html = await response.text();
                
                // Try multiple patterns for different server directory listing formats
                const patterns = [
                    /href="([^"]+)\/"/g,                    // Standard: href="folder/"
                    /href="([^"]+)"/g,                      // Alternative: href="folder"
                    /href="\/[^"]*\/([^"\/]+)\/"/g,        // Full path: href="/path/folder/"
                    /<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/g  // Extract from link text
                ];
                
                let foundFolders = [];
                
                for (const pattern of patterns) {
                    const matches = [...html.matchAll(pattern)];
                    
                    if (matches.length > 0) {
                        const candidates = matches
                            .map(match => {
                                // For the link text pattern, use the second capture group, otherwise use first
                                let folderName = match[1];
                                if (pattern.source.includes('link text') && match[2]) {
                                    folderName = match[2].trim();
                                }
                                
                                // Clean up folder name
                                folderName = folderName.replace(/\/$/, ''); // Remove trailing slash
                                folderName = folderName.split('/').pop(); // Get just the folder name, not full path
                                return folderName;
                            })
                            .filter(name => 
                                name && 
                                name.length > 0 &&
                                !name.startsWith('.') && 
                                !name.startsWith('..') && 
                                name !== 'presets' &&
                                name !== 'parent' &&
                                name !== 'Parent Directory' &&
                                !name.includes('?') &&
                                !name.includes('index.') &&
                                !name.includes('.html')
                            );
                        
                        foundFolders.push(...candidates);
                    }
                }
                
                // Remove duplicates
                foundFolders = [...new Set(foundFolders)];
                folders.push(...foundFolders);
                
                // Also try to extract from common directory listing text patterns
                if (foundFolders.length === 0) {
                    const textMatches = html.match(/>\s*([a-zA-Z0-9\-_\s]+)\s*\//g);
                    if (textMatches) {
                        const textFolders = textMatches
                            .map(match => match.replace(/>\s*([a-zA-Z0-9\-_\s]+)\s*\//, '$1').trim())
                            .filter(name => 
                                name && 
                                name.length > 0 &&
                                !name.toLowerCase().includes('parent') &&
                                !name.includes('.')
                            );
                        folders.push(...textFolders);
                    }
                }
            }
        } catch (error) {
            // Silently handle directory listing failures
        }
        
        return [...new Set(folders)]; // Remove duplicates
    }

    async createPresetFromFolder(folderName) {
        // Discover what images are actually in the folders
        const flowers = await this.discoverImagesInFolder(folderName, 'flowers');
        const skies = await this.discoverImagesInFolder(folderName, 'skies');
        
        const totalCount = flowers.length + skies.length;
        if (totalCount === 0) {
            return null;
        }

        const preset = {
            id: folderName,
            name: folderName,
            description: `${totalCount} images (${flowers.length} fireworks, ${skies.length} backgrounds)`,
            flowers,
            skies,
            flowerCount: flowers.length,
            skyCount: skies.length,
            totalCount,
            type: 'default'
        };
        
        return preset;
    }

    async discoverImagesInFolder(folderName, subfolder) {
        const images = [];
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'JPG', 'JPEG', 'PNG', 'GIF', 'WEBP'];
        
        try {
            const response = await fetch(`./presets/${folderName}/${subfolder}/`);
            if (response.ok) {
                const html = await response.text();
                
                // Parse HTML for image file links
                const fileMatches = html.match(/href="([^"]+)"/g);
                if (fileMatches) {
                    const imageFiles = fileMatches
                        .map(match => match.replace(/href="([^"]+)"/, '$1'))
                        .filter(filename => {
                            if (!filename || filename.startsWith('.') || filename.endsWith('/')) {
                                return false;
                            }
                            const extension = filename.split('.').pop()?.toLowerCase();
                            return extension && imageExtensions.includes(extension.toLowerCase());
                        })
                        .map(filename => {
                            // Extract just the filename from the path
                            // Handle cases where href contains full path like "/presets/folder/subfolder/image.png"
                            return filename.split('/').pop();
                        });
                    
                    images.push(...imageFiles);
                }
            }
        } catch (error) {
            // Silently handle directory listing failures
        }
        
        return images;
    }

    async checkFolderExists(folderName) {
        try {
            // Check if either flowers or skies folder exists
            const flowersResponse = await fetch(`./presets/${folderName}/flowers/`, { method: 'HEAD' });
            const skiesResponse = await fetch(`./presets/${folderName}/skies/`, { method: 'HEAD' });
            
            // Folder exists if either subfolder is accessible (200 or 403 for forbidden but existing)
            const flowersExists = flowersResponse.status === 200 || flowersResponse.status === 403;
            const skiesExists = skiesResponse.status === 200 || skiesResponse.status === 403;
            
            return flowersExists || skiesExists;
        } catch (error) {
            return false;
        }
    }

    async loadExternalPreset() {
        try {
            if (!window.showDirectoryPicker) {
                throw new Error('File System Access API not supported');
            }

            const directoryHandle = await window.showDirectoryPicker({
                mode: 'read'
            });

            const preset = await this.validateAndProcessExternalPreset(directoryHandle);
            
            if (preset) {
                this.externalPresets.set(preset.id, preset);
                this.renderExternalPreset(preset);
                return preset;
            } else {
                throw new Error('Invalid preset structure - no flowers or skies folders found');
            }

        } catch (error) {
            if (error.message.includes('File System Access API not supported')) {
                return await this.loadExternalPresetFallback();
            } else {
                this.showError(error.message);
                return null;
            }
        }
    }

    async loadExternalPresetFallback() {
        return new Promise((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.webkitdirectory = true;
            input.multiple = true;
            input.style.display = 'none';
            
            input.onchange = async (e) => {
                try {
                    const files = Array.from(e.target.files);
                    const preset = await this.processFileListAsPreset(files);
                    
                    if (preset) {
                        this.externalPresets.set(preset.id, preset);
                        this.renderExternalPreset(preset);
                        this.showSuccess(`External preset "${preset.name}" loaded successfully!`);
                        resolve(preset);
                    } else {
                        this.showError('Invalid folder structure - please select a folder containing "flowers" and/or "skies" subfolders');
                        resolve(null);
                    }
                } catch (error) {
                    this.showError(error.message);
                    resolve(null);
                } finally {
                    input.remove();
                }
            };
            
            input.oncancel = () => {
                input.remove();
                resolve(null);
            };
            
            document.body.appendChild(input);
            input.click();
        });
    }

    async applyPreset(presetId, presetType = null, options = {}) {
        const { clearExisting = true } = options;
        
        try {
            let preset = null;
            let actualPresetType = presetType;
            
            // If presetType is not specified, try to find the preset in both collections
            if (!actualPresetType) {
                if (this.defaultPresets.has(presetId)) {
                    preset = this.defaultPresets.get(presetId);
                    actualPresetType = 'default';
                } else if (this.externalPresets.has(presetId)) {
                    preset = this.externalPresets.get(presetId);
                    actualPresetType = 'external';
                }
            } else {
                // Use the specified preset type
                preset = actualPresetType === 'default' 
                    ? this.defaultPresets.get(presetId)
                    : this.externalPresets.get(presetId);
            }
            
            if (!preset) {
                throw new Error(`Preset "${presetId}" not found`);
            }

            if (clearExisting) {
                await this.clearAllImages();
            }

            const results = { flowersLoaded: 0, skiesLoaded: 0, errors: [] };
            
            if (preset.flowers && preset.flowers.length > 0) {
                const flowerResults = await this.loadPresetImages(preset, 'flowers');
                results.flowersLoaded = flowerResults.loaded;
                results.errors.push(...flowerResults.errors);
            }
            
            if (preset.skies && preset.skies.length > 0) {
                const skyResults = await this.loadPresetImages(preset, 'skies');
                results.skiesLoaded = skyResults.loaded;
                results.errors.push(...skyResults.errors);
            }
            
            this.currentPreset = preset;
            this.showSuccess(`Loaded preset "${preset.name}": ${results.flowersLoaded} firework images, ${results.skiesLoaded} background images`);
            
            return results;
            
        } catch (error) {
            this.showError(`Failed to load preset: ${error.message}`);
            throw error;
        }
    }

    async loadPresetImages(preset, imageType) {
        const images = preset[imageType] || [];
        const results = { loaded: 0, errors: [] };
        
        for (let i = 0; i < images.length; i++) {
            const imageData = images[i];
            
            try {
                if (preset.type === 'default') {
                    await this.loadDefaultPresetImage(preset, imageType, imageData);
                } else {
                    await this.loadExternalPresetImage(imageData, imageType);
                }
                
                results.loaded++;
                
            } catch (error) {
                const errorMsg = `Failed to load ${imageData}: ${error.message}`;
                results.errors.push(errorMsg);
            }
        }
        
        return results;
    }

    async loadDefaultPresetImage(preset, imageType, imageName) {
        const imagePath = `./presets/${preset.id}/${imageType}/${imageName}`;
        
        try {
            const response = await fetch(imagePath);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const blob = await response.blob();
            const file = new File([blob], imageName, { type: blob.type });
            
            if (imageType === 'flowers' && window.imageSystem) {
                await window.imageSystem.handleFiles([file]);
            } else if (imageType === 'skies' && window.backgroundSystem) {
                await window.backgroundSystem.handleFiles([file]);
            } else {
                throw new Error(`No handler available for imageType: ${imageType}`);
            }
            
        } catch (error) {
            throw new Error(`Failed to fetch ${imagePath}: ${error.message}`);
        }
    }

    async loadExternalPresetImage(imageData, imageType) {
        let file;
        
        if (imageData.handle) {
            const fileHandle = imageData.handle;
            file = await fileHandle.getFile();
        } else if (imageData instanceof File) {
            file = imageData;
        } else {
            throw new Error('Invalid image data format');
        }
        
        if (imageType === 'flowers' && window.imageSystem) {
            await window.imageSystem.handleFiles([file]);
        } else if (imageType === 'skies' && window.backgroundSystem) {
            await window.backgroundSystem.handleFiles([file]);
        }
    }

    async validateAndProcessExternalPreset(directoryHandle) {
        const presetName = directoryHandle.name;
        let flowersFolder = null;
        let skiesFolder = null;
        
        for await (const [name, handle] of directoryHandle.entries()) {
            if (handle.kind === 'directory') {
                const lowerName = name.toLowerCase();
                if (lowerName === 'flowers' || lowerName === 'flower') {
                    flowersFolder = handle;
                } else if (lowerName === 'skies' || lowerName === 'sky' || lowerName === 'backgrounds') {
                    skiesFolder = handle;
                }
            }
        }
        
        if (!flowersFolder && !skiesFolder) {
            return null;
        }
        
        const flowers = flowersFolder ? await this.getImageFilesFromDirectory(flowersFolder) : [];
        const skies = skiesFolder ? await this.getImageFilesFromDirectory(skiesFolder) : [];
        
        const totalCount = flowers.length + skies.length;
        if (totalCount === 0) {
            return null;
        }
        
        const presetId = `external_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        
        return {
            id: presetId,
            name: presetName,
            description: `External preset loaded from ${presetName}`,
            type: 'external',
            flowers,
            skies,
            flowerCount: flowers.length,
            skyCount: skies.length,
            totalCount,
            directoryHandle
        };
    }

    async getImageFilesFromDirectory(directoryHandle) {
        const imageFiles = [];
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        
        for await (const [name, fileHandle] of directoryHandle.entries()) {
            if (fileHandle.kind === 'file') {
                const extension = name.toLowerCase().substring(name.lastIndexOf('.'));
                if (imageExtensions.includes(extension)) {
                    imageFiles.push({
                        name,
                        handle: fileHandle
                    });
                }
            }
        }
        
        return imageFiles;
    }

    async processFileListAsPreset(files) {
        const folderStructure = {};
        
        files.forEach(file => {
            const pathParts = file.webkitRelativePath.split('/');
            if (pathParts.length >= 2) {
                const folderName = pathParts[pathParts.length - 2].toLowerCase();
                if (!folderStructure[folderName]) {
                    folderStructure[folderName] = [];
                }
                folderStructure[folderName].push(file);
            }
        });
        
        const flowers = folderStructure['flowers'] || folderStructure['flower'] || [];
        const skies = folderStructure['skies'] || folderStructure['sky'] || folderStructure['backgrounds'] || [];
        
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        const validFlowers = flowers.filter(file => {
            const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
            return imageExtensions.includes(ext);
        });
        
        const validSkies = skies.filter(file => {
            const ext = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
            return imageExtensions.includes(ext);
        });
        
        const totalCount = validFlowers.length + validSkies.length;
        if (totalCount === 0) {
            return null;
        }
        
        const firstFile = files[0];
        const pathParts = firstFile.webkitRelativePath.split('/');
        const presetName = pathParts[0] || 'External Preset';
        
        const presetId = `external_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
        
        return {
            id: presetId,
            name: presetName,
            description: `External preset loaded from ${presetName}`,
            type: 'external',
            flowers: validFlowers,
            skies: validSkies,
            flowerCount: validFlowers.length,
            skyCount: validSkies.length,
            totalCount
        };
    }

    async clearAllImages() {
        if (window.imageSystem) {
            window.imageSystem.clearImages();
            const previewContainer = document.getElementById('previewContainer');
            if (previewContainer) {
                previewContainer.innerHTML = '';
            }
            if (window.imageSystem.imageManager) {
                window.imageSystem.imageManager.processedImages.clear();
            }
        }
        
        if (window.backgroundSystem) {
            if (window.backgroundSystem.backgroundManager) {
                window.backgroundSystem.backgroundManager.clearBackgroundImages();
            }
            const bgPreviewContainer = document.getElementById('bgPreviewContainer');
            if (bgPreviewContainer) {
                bgPreviewContainer.innerHTML = '';
            }
            window.backgroundSystem.backgrounds = [];
        }
    }

    renderExternalPreset(preset) {
        const container = document.getElementById('externalPresetsContainer');
        const section = document.getElementById('externalPresetsSection');
        
        if (!container || !section) {
            return;
        }
        
        section.style.display = 'block';
        
        if (window.presetUI) {
            const presetCard = window.presetUI.createPresetCard(preset);
            container.appendChild(presetCard);
        } else {
            const card = document.createElement('div');
            card.className = 'preset-card';
            card.innerHTML = `
                <div class="preset-header">
                    <h5>${preset.name}</h5>
                    <span class="preset-source external">External</span>
                </div>
                <div class="preset-stats">
                    <span class="stat">🌸 ${preset.flowerCount} flowers</span>
                    <span class="stat">☁️ ${preset.skyCount} skies</span>
                </div>
            `;
            container.appendChild(card);
        }
    }

    showSuccess(message) {
        this.showMessage(message, 'success');
    }

    showError(message) {
        this.showMessage(message, 'error');
    }

    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `preset-message preset-message-${type}`;
        messageDiv.textContent = message;
        
        const container = document.querySelector('.preset-container') || document.body;
        container.appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (!window.presetManager) {
        window.presetManager = new PresetManager();
    }
});