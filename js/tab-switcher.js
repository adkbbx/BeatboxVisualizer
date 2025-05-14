/* Fix for the tab switcher */
// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get the tab buttons
    const tabButtons = document.querySelectorAll('.uploader-tab-button');
    
    // Add click listeners to each button
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get the tab name
            const tabName = this.getAttribute('data-uploader-tab');
            
            if (!tabName) {
                return;
            }
            
            // Remove active class from all buttons
            tabButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get all tab panes
            const tabPanes = document.querySelectorAll('.uploader-tab-pane');
            
            // Hide all tab panes
            tabPanes.forEach(pane => {
                pane.classList.remove('active');
            });
            
            // Show the selected tab pane
            const selectedPane = document.getElementById(tabName + '-tab');
            if (selectedPane) {
                selectedPane.classList.add('active');
            } else {
            }
        });
    });
});