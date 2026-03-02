// title_fix.js - Protective Bubble Version
(function() {
    const siteTitle = "Audrius Morkūnas | Portfolio";
    
    const applyTitle = () => {
        if (document.title !== siteTitle) {
            document.title = siteTitle;
        }
    };

    // Run immediately
    applyTitle();

    // Run when the page is fully loaded
    window.addEventListener('load', applyTitle);

    // Prevent URL flashes during transitions
    window.addEventListener('beforeunload', () => {
        document.title = siteTitle;
    });
})();