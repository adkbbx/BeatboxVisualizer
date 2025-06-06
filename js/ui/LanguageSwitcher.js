/**
 * Language Switcher UI Controller
 * Handles the language dropdown interface and connects to the i18n system
 */

class LanguageSwitcher {
    constructor() {
        this.button = null;
        this.menu = null;
        this.currentLanguage = 'en';
        this.isOpen = false;
        
        // Language configuration with display names and flags
        this.languages = {
            'en': { flag: '🇺🇸', name: 'English', nativeName: 'English' },
            'ja': { flag: '🇯🇵', name: 'Japanese', nativeName: '日本語' },
            'zh-cn': { flag: '🇨🇳', name: 'Chinese Simplified', nativeName: '简体中文' },
            'zh-tw': { flag: '🇹🇼', name: 'Chinese Traditional', nativeName: '繁體中文' }
        };

        this.init();
    }

    init() {
        // Wait for DOM and i18n system to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeUI());
        } else {
            this.initializeUI();
        }
    }

    initializeUI() {
        this.button = document.getElementById('languageSwitcherButton');
        this.menu = document.getElementById('languageDropdownMenu');

        if (!this.button || !this.menu) {
            console.warn('Language switcher elements not found');
            return;
        }

        // Wait for i18n system to be ready
        if (window.i18n && window.i18n.initialized) {
            this.currentLanguage = window.i18n.getCurrentLanguage();
            this.updateButtonDisplay();
            this.updateActiveOption();
        } else {
            // Wait for i18n system to initialize
            const checkI18n = () => {
                if (window.i18n && window.i18n.initialized) {
                    this.currentLanguage = window.i18n.getCurrentLanguage();
                    this.updateButtonDisplay();
                    this.updateActiveOption();
                } else {
                    // Keep checking until i18n is ready
                    setTimeout(checkI18n, 100);
                }
            };
            checkI18n();
        }

        this.attachEventListeners();
    }

    attachEventListeners() {
        // Button click to toggle dropdown
        this.button.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        // Language option clicks
        this.menu.addEventListener('click', (e) => {
            const option = e.target.closest('.language-option');
            if (option) {
                const selectedLanguage = option.dataset.language;
                if (selectedLanguage && selectedLanguage !== this.currentLanguage) {
                    this.selectLanguage(selectedLanguage);
                }
                this.closeDropdown();
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.button.contains(e.target) && !this.menu.contains(e.target)) {
                this.closeDropdown();
            }
        });

        // Close dropdown on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeDropdown();
                this.button.focus();
            }
        });

        // Keyboard navigation for accessibility
        this.menu.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                this.navigateOptions(e.key === 'ArrowDown' ? 1 : -1);
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const focused = this.menu.querySelector('.language-option:focus');
                if (focused) {
                    focused.click();
                }
            }
        });

        // Listen for i18n language changes from other sources
        if (window.i18n && typeof window.i18n.onLanguageChange === 'function') {
            window.i18n.onLanguageChange((newLanguage) => {
                if (newLanguage !== this.currentLanguage) {
                    this.currentLanguage = newLanguage;
                    this.updateButtonDisplay();
                    this.updateActiveOption();
                }
            });
        } else {
            // If i18n system isn't ready yet, try again later
            const registerCallback = () => {
                if (window.i18n && typeof window.i18n.onLanguageChange === 'function') {
                    window.i18n.onLanguageChange((newLanguage) => {
                        if (newLanguage !== this.currentLanguage) {
                            this.currentLanguage = newLanguage;
                            this.updateButtonDisplay();
                            this.updateActiveOption();
                        }
                    });
                } else {
                    setTimeout(registerCallback, 100);
                }
            };
            registerCallback();
        }
    }

    toggleDropdown() {
        if (this.isOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }

    openDropdown() {
        this.isOpen = true;
        this.menu.classList.add('open');
        this.button.setAttribute('aria-expanded', 'true');
        
        // Focus first option for keyboard navigation
        const firstOption = this.menu.querySelector('.language-option');
        if (firstOption) {
            firstOption.setAttribute('tabindex', '0');
            firstOption.focus();
        }
    }

    closeDropdown() {
        this.isOpen = false;
        this.menu.classList.remove('open');
        this.button.setAttribute('aria-expanded', 'false');
        
        // Remove tabindex from options
        this.menu.querySelectorAll('.language-option').forEach(option => {
            option.removeAttribute('tabindex');
        });
    }

    selectLanguage(languageCode) {
        if (!this.languages[languageCode]) {
            console.warn('Unknown language code:', languageCode);
            return;
        }
        
        // Update internal state
        this.currentLanguage = languageCode;
        
        // Switch language in i18n system
        if (window.i18n) {
            window.i18n.switchLanguage(languageCode).then(() => {
                // Force a DOM refresh to ensure all translations are updated
                setTimeout(() => {
                    window.i18n.refresh();
                }, 100);
            }).catch(error => {
                console.error('Error switching language:', error);
            });
        } else {
            console.warn('i18n system not available');
        }

        // Update UI
        this.updateButtonDisplay();
        this.updateActiveOption();
        
        // Close dropdown
        this.closeDropdown();
    }

    updateButtonDisplay() {
        if (!this.button || !this.languages[this.currentLanguage]) {
            return;
        }

        const language = this.languages[this.currentLanguage];
        const iconElement = this.button.querySelector('.language-icon');
        const textElement = this.button.querySelector('.current-language-text');

        if (iconElement) {
            iconElement.textContent = language.flag;
        }

        if (textElement) {
            // Use translation if available, otherwise fallback to native name
            if (window.i18n) {
                textElement.textContent = window.i18n.t('ui.language.selector') || 'Language';
            } else {
                textElement.textContent = 'Language';
            }
        }

        // Update button title for accessibility
        this.button.title = `Current language: ${language.nativeName}. Click to change language.`;
    }

    updateActiveOption() {
        if (!this.menu) return;

        // Remove active class from all options
        this.menu.querySelectorAll('.language-option').forEach(option => {
            option.classList.remove('active');
        });

        // Add active class to current language option
        const activeOption = this.menu.querySelector(`[data-language="${this.currentLanguage}"]`);
        if (activeOption) {
            activeOption.classList.add('active');
        }
    }

    navigateOptions(direction) {
        const options = Array.from(this.menu.querySelectorAll('.language-option'));
        const currentIndex = options.findIndex(option => option === document.activeElement);
        
        let nextIndex = currentIndex + direction;
        if (nextIndex < 0) nextIndex = options.length - 1;
        if (nextIndex >= options.length) nextIndex = 0;
        
        if (options[nextIndex]) {
            options.forEach(option => option.setAttribute('tabindex', '-1'));
            options[nextIndex].setAttribute('tabindex', '0');
            options[nextIndex].focus();
        }
    }

    // Public methods for external control
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    setLanguage(languageCode) {
        if (this.languages[languageCode]) {
            this.selectLanguage(languageCode);
        }
    }

    getSupportedLanguages() {
        return Object.keys(this.languages);
    }
}

// Initialize language switcher when DOM is ready
let languageSwitcher = null;

function initializeLanguageSwitcher() {
    if (!languageSwitcher) {
        languageSwitcher = new LanguageSwitcher();
        
        // Make it globally accessible for debugging
        window.languageSwitcher = languageSwitcher;
    }
}

// Auto-initialize
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLanguageSwitcher);
} else {
    initializeLanguageSwitcher();
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LanguageSwitcher;
} 