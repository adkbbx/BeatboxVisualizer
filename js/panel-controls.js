export function initializePanelControls() {
    const toggleButton = document.getElementById('togglePanels');
    const appContainer = document.querySelector('.app-container');
    let panelsVisible = true;

    function togglePanels() {
        panelsVisible = !panelsVisible;
        appContainer.classList.toggle('hidden-panels', !panelsVisible);
        // Update both icon and text
        toggleButton.innerHTML = panelsVisible ? 
            '<span class="icon">👁️</span><span class="text">Hide</span>' : 
            '<span class="icon">👁️‍🗨️</span><span class="text">Show</span>';
    }

    // Button click handler
    toggleButton.addEventListener('click', togglePanels);

    // Keyboard shortcut handler
    document.addEventListener('keydown', (event) => {
        if (event.key.toLowerCase() === 'h' && 
            !event.ctrlKey && 
            !event.altKey && 
            !event.metaKey && 
            document.activeElement.tagName !== 'INPUT') {
            togglePanels();
        }
    });
} 