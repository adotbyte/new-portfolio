// Inside your external loader (e.g., main.js)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Look at the ROOT, not /static/
        navigator.serviceWorker.register("/serviceworker.js") 
            .then(reg => console.log('Service Worker Registered at Root!', reg))
            .catch(err => console.error('Registration failed:', err));
    });
}