/**
 * 🌍 I18nManager - Internationalization Manager for Vibecoding Fireworks App
 * 
 * Handles language detection, translation loading, DOM updates, and persistence.
 * Supports: English (en), Japanese (ja), Chinese Simplified (zh-cn), Chinese Traditional (zh-tw)
 */
class I18nManager {
    constructor() {
        this.currentLanguage = 'en';
        this.defaultLanguage = 'en';
        this.translations = {};
        this.callbacks = new Set();
        this.supportedLanguages = ['en', 'ja', 'zh-cn', 'zh-tw'];
        this.initialized = false;
        
        // Language display names for UI
        this.languageNames = {
            'en': 'English',
            'ja': '日本語',
            'zh-cn': '简体中文',
            'zh-tw': '繁體中文'
        };
    }

    /**
     * Initialize the translation system
     * @param {string} language - Language code to initialize with
     */
    async init(language = null) {
        try {
            // Detect language preference
            const detectedLanguage = language || this.detectLanguage();
            
            // Load translation files
            await this.loadTranslations(detectedLanguage);
            
            // Apply translations to DOM
            this.applyTranslations();
            
            this.initialized = true;
            console.log(`🌍 I18n initialized with language: ${this.currentLanguage}`);
            
            // Notify callbacks
            this.notifyCallbacks();
            
        } catch (error) {
            console.error('🚨 I18n initialization failed:', error);
            // Fallback to English if initialization fails
            if (this.currentLanguage !== this.defaultLanguage) {
                await this.loadTranslations(this.defaultLanguage);
                this.applyTranslations();
            }
        }
    }

    /**
     * Detect user's preferred language
     * Priority: localStorage > browser language > default
     */
    detectLanguage() {
        // 1. Check localStorage
        const savedLanguage = localStorage.getItem('vibecoding_language');
        if (savedLanguage && this.supportedLanguages.includes(savedLanguage)) {
            return savedLanguage;
        }

        // 2. Check browser language
        const browserLang = navigator.language || navigator.userLanguage;
        
        // Handle browser language variants
        if (browserLang.startsWith('ja')) return 'ja';
        if (browserLang.startsWith('zh')) {
            // Distinguish between simplified and traditional Chinese
            if (browserLang === 'zh-CN' || browserLang === 'zh-Hans') return 'zh-cn';
            if (browserLang === 'zh-TW' || browserLang === 'zh-Hant') return 'zh-tw';
            return 'zh-cn'; // Default to simplified
        }
        
        // 3. Default to English
        return this.defaultLanguage;
    }

    /**
     * Load translation files for specified language
     * @param {string} language - Language code to load
     */
    async loadTranslations(language) {
        if (!this.supportedLanguages.includes(language)) {
            console.warn(`🚨 Unsupported language: ${language}, falling back to ${this.defaultLanguage}`);
            language = this.defaultLanguage;
        }

        try {
            // Dynamic import of translation file (relative to current directory)
            const module = await import(`./${language}.js`);
            this.translations = module.translations || module.default;
            this.currentLanguage = language;
            
            // Save to localStorage
            localStorage.setItem('vibecoding_language', language);
            
        } catch (error) {
            console.error(`🚨 Failed to load translations for ${language}:`, error);
            
            // Fallback to English if not already trying English
            if (language !== this.defaultLanguage) {
                console.log(`🔄 Falling back to ${this.defaultLanguage}`);
                const fallbackModule = await import(`./${this.defaultLanguage}.js`);
                this.translations = fallbackModule.translations || fallbackModule.default;
                this.currentLanguage = this.defaultLanguage;
            } else {
                throw error;
            }
        }
    }

    /**
     * Get translated text for a key
     * @param {string} key - Translation key in dot notation (e.g., 'ui.buttons.start')
     * @param {object} params - Parameters for interpolation
     * @returns {string} - Translated text or key if not found
     */
    t(key, params = {}) {
        if (!this.translations) {
            console.warn('🚨 Translations not loaded, returning key:', key);
            return key;
        }

        // Navigate through nested object using dot notation
        const keys = key.split('.');
        let value = this.translations;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                console.warn(`🚨 Translation key not found: ${key}`);
                return key; // Return the key if translation not found
            }
        }

        // Handle string interpolation
        if (typeof value === 'string' && Object.keys(params).length > 0) {
            return this.interpolate(value, params);
        }

        return value || key;
    }

    /**
     * Interpolate parameters into translated strings
     * @param {string} text - Text with placeholders like {{value}}
     * @param {object} params - Parameters to interpolate
     * @returns {string} - Interpolated text
     */
    interpolate(text, params) {
        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }

    /**
     * Switch to a different language
     * @param {string} language - Language code to switch to
     */
    async switchLanguage(language) {
        if (language === this.currentLanguage) {
            return; // Already using this language
        }

        try {
            await this.loadTranslations(language);
            this.applyTranslations();
            this.notifyCallbacks();
            
            console.log(`🌍 Language switched to: ${language}`);
            
        } catch (error) {
            console.error(`🚨 Failed to switch language to ${language}:`, error);
        }
    }

    /**
     * Apply translations to all elements with data-i18n attributes
     */
    applyTranslations() {
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const params = this.getElementParams(element);
            const translation = this.t(key, params);
            
            // Update element content
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                // For input elements, update placeholder or value
                if (element.hasAttribute('placeholder')) {
                    element.placeholder = translation;
                } else {
                    element.value = translation;
                }
            } else {
                // Special handling for elements that contain numeric value spans
                const valueSpan = element.querySelector('span[id$="Value"]');
                if (valueSpan) {
                    // Preserve the numeric value span while updating the label text
                    const existingValue = valueSpan.textContent;
                    const existingId = valueSpan.id;
                    element.textContent = translation + ': ';
                    
                    // Re-create and append the value span
                    const newValueSpan = document.createElement('span');
                    newValueSpan.id = existingId;
                    newValueSpan.textContent = existingValue;
                    element.appendChild(newValueSpan);
                } else {
                    element.textContent = translation;
                }
            }
        });
        
        // After applying translations, trigger settings UI refresh to restore numeric values
        this.refreshSettingsUI();
    }

    /**
     * Refresh settings UI values after translations are applied
     */
    refreshSettingsUI() {
        // Give the DOM a moment to update, then refresh settings
        setTimeout(() => {
            // Check if settings controller exists and call updateUIFromSettings
            if (window.uiController && window.uiController.settingsController && 
                typeof window.uiController.settingsController.updateUIFromSettings === 'function') {
                console.log('🔄 Refreshing settings UI values after translation');
                window.uiController.settingsController.updateUIFromSettings();
            }
        }, 10);
    }

    /**
     * Extract parameters from element's data attributes for interpolation
     * @param {Element} element - DOM element to extract params from
     * @returns {object} - Parameters object
     */
    getElementParams(element) {
        const params = {};
        const attributes = element.attributes;
        
        for (let i = 0; i < attributes.length; i++) {
            const attr = attributes[i];
            if (attr.name.startsWith('data-i18n-')) {
                const paramName = attr.name.replace('data-i18n-', '');
                params[paramName] = attr.value;
            }
        }
        
        return params;
    }

    /**
     * Register a callback to be notified when language changes
     * @param {function} callback - Function to call when language changes
     */
    onLanguageChange(callback) {
        this.callbacks.add(callback);
    }

    /**
     * Unregister a language change callback
     * @param {function} callback - Function to remove from callbacks
     */
    offLanguageChange(callback) {
        this.callbacks.delete(callback);
    }

    /**
     * Notify all registered callbacks of language change
     */
    notifyCallbacks() {
        this.callbacks.forEach(callback => {
            try {
                callback(this.currentLanguage);
            } catch (error) {
                console.error('🚨 Error in language change callback:', error);
            }
        });
    }

    /**
     * Get current language code
     * @returns {string} - Current language code
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Get list of supported languages
     * @returns {array} - Array of supported language codes
     */
    getSupportedLanguages() {
        return [...this.supportedLanguages];
    }

    /**
     * Get display name for a language code
     * @param {string} language - Language code
     * @returns {string} - Display name for the language
     */
    getLanguageName(language) {
        return this.languageNames[language] || language;
    }

    /**
     * Check if a language is supported
     * @param {string} language - Language code to check
     * @returns {boolean} - True if language is supported
     */
    isLanguageSupported(language) {
        return this.supportedLanguages.includes(language);
    }

    /**
     * Force refresh all translations (useful after dynamic content changes)
     */
    refresh() {
        if (this.initialized) {
            this.applyTranslations();
            this.notifyCallbacks();
        }
    }
}

// Create global instance
window.i18n = new I18nManager();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.i18n.init();
    });
} else {
    // DOM is already ready
    window.i18n.init();
}

export default I18nManager; 