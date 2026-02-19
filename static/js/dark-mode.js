/* static/js/dark-mode.js */

// 1. IMMEDIATE THEME SYNC (Prevents the white flash)
(function() {
    try {
        // We check what the user picked last time, or default to 'dark'
        const savedTheme = localStorage.getItem("theme") || "dark"; 
        document.documentElement.setAttribute("data-bs-theme", savedTheme);
    } catch (e) { 
        console.warn("Storage access denied."); 
    }
})();

// 2. BUTTON LOGIC (Runs after the page loads)
document.addEventListener("DOMContentLoaded", () => {
    // This looks for your <button id="push">
    const themeBtn = document.getElementById("push");
    
    if (themeBtn) {
        console.log("Dark Mode Button Found!");

        themeBtn.addEventListener("click", function() {
            // Check what the current theme is on the <html> tag
            const currentTheme = document.documentElement.getAttribute("data-bs-theme");
            
            // Flip the switch
            const newTheme = (currentTheme === "dark") ? "light" : "dark";
            
            // Apply it to the website
            document.documentElement.setAttribute("data-bs-theme", newTheme);
            
            // Save it so it stays that way on the next page load
            localStorage.setItem("theme", newTheme);
            
            console.log("Theme is now:", newTheme);
        });
    } else {
        // If you see this in the F12 console, the ID in HTML is wrong!
        console.error("Error: Could not find button with id='push'");
    }
});