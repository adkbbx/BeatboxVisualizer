/**
 * Handles tab switching functionality for the settings panel
 */
class SettingsTabs {
  constructor(tabsContainerId) {
    this.container = document.getElementById(tabsContainerId);
    this.tabs = this.container.querySelectorAll('.tab-button');
    this.panes = this.container.querySelectorAll('.tab-pane');
    this.activeTab = null;
    
    this.initTabs();
  }
  
  initTabs() {
    // Set up click handlers
    this.tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        this.activateTab(tab.dataset.tab);
      });
    });
    
    // Activate first tab by default
    if (this.tabs.length > 0) {
      // Try to get previously active tab
      const savedTab = localStorage.getItem('vibecoding-active-settings-tab');
      if (savedTab && this.container.querySelector(`.tab-button[data-tab="${savedTab}"]`)) {
        this.activateTab(savedTab);
      } else {
        this.activateTab(this.tabs[0].dataset.tab);
      }
    }
  }
  
  activateTab(tabId) {
    // Update active tab
    this.activeTab = tabId;
    
    // Update tab buttons
    this.tabs.forEach(tab => {
      if (tab.dataset.tab === tabId) {
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
      } else {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
      }
    });
    
    // Update tab panes
    this.panes.forEach(pane => {
      if (pane.id === `${tabId}-tab`) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });
    
    // Save active tab
    localStorage.setItem('vibecoding-active-settings-tab', tabId);
  }
}

export default SettingsTabs;