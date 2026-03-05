// static/js/copy-button.js (or code-actions.js)
document.addEventListener('DOMContentLoaded', function() {
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const dockerCode = document.getElementById('dockerCode');

    if (!dockerCode) return;

    // --- Copy Logic ---
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(dockerCode.innerText).then(() => {
                const original = copyBtn.innerHTML;
                copyBtn.innerHTML = '<i class="bi bi-check2"></i> Copied!';
                copyBtn.classList.replace('btn-outline-light', 'btn-success');
                setTimeout(() => {
                    copyBtn.innerHTML = original;
                    copyBtn.classList.replace('btn-success', 'btn-outline-light');
                }, 2000);
            });
        });
    }

    // --- Download Logic ---
    if (downloadBtn) {
        downloadBtn.addEventListener('click', () => {
            const blob = new Blob([dockerCode.innerText], { type: 'text/yaml' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            
            a.href = url;
            a.download = 'docker-compose.yml'; // The filename the user will get
            document.body.appendChild(a);
            a.click();
            
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            // Subtle feedback
            downloadBtn.classList.replace('btn-outline-info', 'btn-info');
            setTimeout(() => downloadBtn.classList.replace('btn-info', 'btn-outline-info'), 1000);
        });
    }
});