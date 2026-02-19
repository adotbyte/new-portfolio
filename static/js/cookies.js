/* --- SECURE DATA MANAGEMENT (CSP COMPLIANT) --- */

// Handle the success alert separately
if (sessionStorage.getItem('wipeSuccessFlag') === 'true') {
    window.addEventListener('load', () => {
        const alertBox = document.getElementById('wipeSuccessAlert');
        if (alertBox) {
            alertBox.classList.remove('d-none');
            setTimeout(() => {
                alertBox.classList.add('d-none');
                sessionStorage.removeItem('wipeSuccessFlag');
            }, 4000);
        }
    });
}

// Global Listener - Securely catches clicks without inline HTML code
window.addEventListener('click', function(event) {
    const btn = event.target.closest('#fullWipeBtn');
    if (!btn) return;

    event.preventDefault();

    if (confirm("Permanently delete chat history and reset theme?")) {
        // UI Feedback
        const spinner = document.getElementById('wipeSpinner');
        const text = document.getElementById('wipeText');
        btn.disabled = true;
        if (spinner) spinner.classList.remove('d-none');
        if (text) text.innerText = " Clearing...";

        // Execute logic
        performSecureWipe();
    }
});

async function performSecureWipe() {
    try {
        await fetch('/chat/clear/', {
            method: 'POST',
            headers: { 
                "X-CSRFToken": getInternalCookie('csrftoken'),
                "Content-Type": "application/json"
            }
        });

        localStorage.clear();
        sessionStorage.setItem('wipeSuccessFlag', 'true');
        window.location.reload();

    } catch (error) {
        console.error("Wipe failed:", error);
        localStorage.clear();
        window.location.reload();
    }
}

function getInternalCookie(name) {
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
}

// A safer way to ensure the page doesn't freeze after closing the modal
const myModalEl = document.getElementById('privacyModal');
if (myModalEl) {
    myModalEl.addEventListener('hidden.bs.modal', function () {
        // This runs AFTER the modal is completely gone
        // It ensures focus returns to the body safely
        document.body.focus();
        
        // Remove the backdrop manually just in case a "ghost" one stays
        const backdrop = document.querySelector('.modal-backdrop');
        if (backdrop) {
            backdrop.remove();
        }
        
        // Allow scrolling again (Bootstrap sometimes forgets this on freeze)
        document.body.style.overflow = 'auto';
        document.body.classList.remove('modal-open');
    });
}