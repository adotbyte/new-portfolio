/* static/js/cookies.js */

// 1. Define getCookie globally so all scripts can see it
window.getCookie = function(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
};

document.addEventListener("DOMContentLoaded", () => {
    const fullWipeBtn = document.getElementById('fullWipeBtn');
    const executeFinalWipe = document.getElementById('executeFinalWipe');
    const wipeSuccessAlert = document.getElementById('wipeSuccessAlert');
    
    // Check if Bootstrap is loaded before initializing
    if (typeof bootstrap !== 'undefined') {
        const privEl = document.getElementById('privacyModal');
        const confEl = document.getElementById('confirmFullWipeModal');
        
        const privacyModal = privEl ? new bootstrap.Modal(privEl) : null;
        const confirmModal = confEl ? new bootstrap.Modal(confEl) : null;

        fullWipeBtn?.addEventListener('click', () => {
            privacyModal?.hide(); 
            confirmModal?.show(); 
        });

        executeFinalWipe?.addEventListener('click', async () => {
            try {
                const response = await fetch('/chat/clear/', { 
                    method: "POST",
                    headers: { 
                        "X-CSRFToken": window.getCookie('csrftoken'), 
                        "Content-Type": "application/json"
                    }
                });

                const data = await response.json();

                if (data.status === "success") {
                    localStorage.clear();
                    
                    // Clear all cookies
                    document.cookie.split(";").forEach((c) => {
                        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
                    });

                    confirmModal?.hide();

                    if (wipeSuccessAlert) {
                        wipeSuccessAlert.classList.remove('d-none');
                    }
                    
                    setTimeout(() => {
                        window.location.href = "/";
                    }, 2000);
                }
            } catch (err) {
                console.error("Wipe failed:", err);
            }
        });
    } else {
        console.error("Bootstrap is not loaded! Check your base.html script order.");
    }
});







