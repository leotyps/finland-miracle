// theme.js

// Function to set initial theme
function initializeTheme() {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme');
    const html = document.documentElement;
    
    if (savedTheme) {
        // If theme was previously saved, use that
        html.classList.remove('light', 'dark');
        html.classList.add(savedTheme);
    } else {
        // If no saved theme, default to light mode
        html.classList.remove('dark');
        html.classList.add('light');
        localStorage.setItem('theme', 'light');
    }
}

// Function to update UI elements
function updateThemeUI() {
    const isDark = document.documentElement.classList.contains('dark');
    const lightIcon = document.querySelector('.light-icon');
    const darkIcon = document.querySelector('.dark-icon');
    const themeText = document.querySelector('.theme-text');
    
    if (lightIcon && darkIcon && themeText) {
        if (isDark) {
            lightIcon.classList.add('hidden');
            darkIcon.classList.remove('hidden');
            themeText.textContent = 'Dark';
        } else {
            lightIcon.classList.remove('hidden');
            darkIcon.classList.add('hidden');
            themeText.textContent = 'Light';
        }
    }
}

// Function to handle theme toggle
function handleThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const html = document.documentElement;
            const isDark = html.classList.toggle('dark');
            html.classList.toggle('light');
            
            // Save to localStorage
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            
            // Update UI
            updateThemeUI();
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    updateThemeUI();
    handleThemeToggle();
});