// PresetUI.js - Manual preset discovery interface
import { PresetManager } from '../managers/PresetManager.js';
import ClearManager from '../managers/ClearManager.js';

export class PresetUI {
    constructor() {
        this.presetManager = null;
        this.isInitialized = false;
        this.hasDiscovered = false;
    }

    async initialize() {
        if (this.isInitialized) return;
        
        await this.waitForPresetManager();
        this.setupEventListeners();
        this.showEmptyState();
        this.isInitialized = true;
    }

    async waitForPresetManager() {
        return new Promise((resolve) => {
            const checkManager = () => {
                if (window.presetManager) {
                    this.presetManager = window.presetManager;
                    resolve();
                } else {
                    setTimeout(checkManager, 100);
                }
            };
            checkManager();
        });
    }

    setupEventListeners() {
        const discoverBtn = document.getElementById('discoverPresets');
        if (discoverBtn) {
            discoverBtn.addEventListener('click', () => this.handleDiscoverPresets());
        }

        const loadExternalBtn = document.getElementById('loadExternalPreset');
        if (loadExternalBtn) {
            loadExternalBtn.addEventListener('click', () => this.handleLoadExternalPreset());
        }

        const clearAllBtn = document.getElementById('clearAllImages');
        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => this.handleClearAllImages());
        }
    }

    showEmptyState() {
        const emptyState = document.getElementById('presetEmptyState');
        const presetsSection = document.getElementById('defaultPresetsSection');
        
        if (emptyState) emptyState.style.display = 'flex';
        if (presetsSection) presetsSection.style.display = 'none';
    }

    hideEmptyState() {
        const emptyState = document.getElementById('presetEmptyState');
        const presetsSection = document.getElementById('defaultPresetsSection');
        
        if (emptyState) emptyState.style.display = 'none';
        if (presetsSection) presetsSection.style.display = 'block';
    }

    async handleDiscoverPresets() {
        const discoverBtn = document.getElementById('discoverPresets');
        if (discoverBtn) {
            discoverBtn.disabled = true;
            discoverBtn.textContent = '🔍 Discovering...';
        }

        try {
            // Ensure PresetManager is initialized and load presets
            await this.presetManager.initialize();
            
            // Get the discovered presets from PresetManager
            const discoveredPresets = this.presetManager.defaultPresets;
            
            if (discoveredPresets.size > 0) {
                this.hideEmptyState();
                this.renderDiscoveredPresets(discoveredPresets);
                this.hasDiscovered = true;
                
                const count = discoveredPresets.size;
                this.showMessage(`Discovered ${count} preset${count === 1 ? '' : 's'}!`, 'success');
            } else {
                this.showMessage('No presets found in /presets/ folder', 'info');
            }

        } catch (error) {
            this.showMessage('Failed to discover presets', 'error');
        } finally {
            if (discoverBtn) {
                discoverBtn.disabled = false;
                discoverBtn.textContent = this.hasDiscovered ? '🔄 Re-discover Presets' : '🔍 Discover Presets';
            }
        }
    }

    renderDiscoveredPresets(discoveredPresets) {
        const container = document.getElementById('defaultPresetsContainer');
        if (!container) return;

        container.innerHTML = '';

        discoveredPresets.forEach((preset) => {
            const presetCard = this.createPresetCard(preset);
            container.appendChild(presetCard);
        });
    }

    createPresetCard(preset) {
        const card = document.createElement('div');
        card.className = 'preset-card';
        card.dataset.presetId = preset.id;
        
        // Determine the preset source label and CSS class based on preset type
        const isExternal = preset.type === 'external';
        const sourceLabel = isExternal ? 'External' : 'Discovered';
        const sourceClass = isExternal ? 'external' : 'default';
        
        card.innerHTML = `
            <div class="preset-header">
                <h5>${preset.name}</h5>
                <span class="preset-source ${sourceClass}">${sourceLabel}</span>
            </div>
            <div class="preset-stats">
                <span class="stat">🌸 ${preset.flowerCount} flowers</span>
                <span class="stat">☁️ ${preset.skyCount} skies</span>
            </div>
            <div class="preset-actions-buttons">
                <button class="load-preset-btn">Load</button>
                <button class="preview-preset-btn">Preview</button>
            </div>
            <div class="preset-preview" style="display: none;"></div>
        `;
        
        const loadBtn = card.querySelector('.load-preset-btn');
        const previewBtn = card.querySelector('.preview-preset-btn');
        
        loadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleLoadPreset(preset);
        });
        
        previewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.handleTogglePreview(card, preset);
        });
        
        return card;
    }

    async handleLoadPreset(preset) {
        const card = document.querySelector(`[data-preset-id="${preset.id}"]`);
        const loadBtn = card?.querySelector('.load-preset-btn');
        
        if (loadBtn) {
            loadBtn.disabled = true;
            loadBtn.textContent = 'Loading...';
        }

        try {
            // Ensure PresetManager is initialized
            await this.presetManager.initialize();
            
            // Load the preset - let applyPreset auto-detect the type
            await this.presetManager.applyPreset(preset.id);
            
            this.showMessage(`Successfully loaded "${preset.name}"!`, 'success');
        } catch (error) {
            this.showMessage(`Failed to load "${preset.name}": ${error.message}`, 'error');
        } finally {
            if (loadBtn) {
                loadBtn.disabled = false;
                loadBtn.textContent = 'Load';
            }
        }
    }

    handleTogglePreview(cardElement, preset) {
        const previewDiv = cardElement.querySelector('.preset-preview');
        const previewBtn = cardElement.querySelector('.preview-preset-btn');
        
        if (previewDiv.style.display === 'none') {
            previewDiv.style.display = 'block';
            previewBtn.textContent = 'Hide';
            this.loadPresetPreview(previewDiv, preset);
        } else {
            previewDiv.style.display = 'none';
            previewBtn.textContent = 'Preview';
        }
    }

    loadPresetPreview(previewContainer, preset) {
        previewContainer.innerHTML = '<div class="preview-loading">Loading preview...</div>';
        
        try {
            const previews = [];
            const previewCount = 3;
            
            const flowerPreviews = preset.flowers.slice(0, previewCount);
            const skyPreviews = preset.skies.slice(0, previewCount);
            
            flowerPreviews.forEach(flower => {
                const imageName = typeof flower === 'string' ? flower : flower.name;
                const imagePath = `./presets/${preset.id}/flowers/${imageName}`;
                previews.push({ type: 'flower', url: imagePath, name: imageName });
            });
            
            skyPreviews.forEach(sky => {
                const imageName = typeof sky === 'string' ? sky : sky.name;
                const imagePath = `./presets/${preset.id}/skies/${imageName}`;
                previews.push({ type: 'sky', url: imagePath, name: imageName });
            });
            
            if (previews.length > 0) {
                previewContainer.innerHTML = `
                    <div class="preview-thumbnails">
                        ${previews.map(preview => `
                            <div class="preview-thumbnail">
                                <img src="${preview.url}" alt="${preview.name}" />
                                <span class="preview-type">${preview.type === 'flower' ? '🌸' : '☁️'}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
            } else {
                previewContainer.innerHTML = '<div class="preview-error">No preview available</div>';
            }
            
        } catch (error) {
            previewContainer.innerHTML = '<div class="preview-error">Failed to load preview</div>';
        }
    }

    async handleLoadExternalPreset() {
        const loadBtn = document.getElementById('loadExternalPreset');
        if (loadBtn) {
            loadBtn.disabled = true;
            loadBtn.textContent = '📁 Opening...';
        }

        try {
            await this.presetManager.loadExternalPreset();
        } catch (error) {
            if (!error.message.includes('File System Access API not supported')) {
                this.showMessage('Failed to load external preset', 'error');
            }
        } finally {
            if (loadBtn) {
                loadBtn.disabled = false;
                loadBtn.textContent = '📁 Load Preset Folder';
            }
        }
    }

    async handleClearAllImages() {
        const clearBtn = document.getElementById('clearAllImages');
        if (clearBtn) {
            clearBtn.disabled = true;
            clearBtn.textContent = '🗑️ Clearing...';
        }

        try {
            // Use standalone ClearManager instead of PresetManager
            if (window.clearManager) {
                const result = await window.clearManager.clearAllImages();
                
                if (result.success) {
                    this.showMessage(result.message, 'success');
                    // Also show visual feedback
                    window.clearManager.showClearMessage(result.message, 'success');
                } else {
                    this.showMessage(result.message, 'error');
                    window.clearManager.showClearMessage(result.message, 'error');
                }
            } else {
                // Fallback to PresetManager if ClearManager not available
                if (this.presetManager) {
                    await this.presetManager.clearAllImages();
                    this.showMessage('All images cleared', 'success');
                } else {
                    throw new Error('No clearing system available');
                }
            }
        } catch (error) {
            this.showMessage('Failed to clear images', 'error');
        } finally {
            if (clearBtn) {
                clearBtn.disabled = false;
                clearBtn.textContent = '🗑️ Clear All';
            }
        }
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

// Initialize when preset tab is clicked
document.addEventListener('DOMContentLoaded', () => {
    const presetTabButton = document.querySelector('[data-uploader-tab="presets"]');
    if (presetTabButton) {
        presetTabButton.addEventListener('click', async () => {
            if (!window.presetUI) {
                window.presetUI = new PresetUI();
                await window.presetUI.initialize();
            }
        });
    }
});