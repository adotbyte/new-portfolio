/* static/js/chatbot.js */

document.addEventListener("DOMContentLoaded", () => {
    const chatBody = document.getElementById('chatBody');
    const userInput = document.getElementById('userInput');

    // --- 1. THE RECOVERY LOGIC ---
    const loadHistory = () => {
        const saved = localStorage.getItem('adotbyte_history');
        if (saved && chatBody) {
            chatBody.innerHTML = saved;
            // Timeout ensures we scroll after the browser finishes rendering the HTML
            setTimeout(() => { chatBody.scrollTop = chatBody.scrollHeight; }, 100);
        }
    };

    const saveHistory = () => {
        if (chatBody) {
            localStorage.setItem('adotbyte_history', chatBody.innerHTML);
        }
    };

    loadHistory();

    // --- 2. THE SEND LOGIC (Updated for Streaming) ---
    
    const sendMessage = async () => {
        const text = userInput.value.trim();
        if (!text) return;

        appendMsg(text, 'user-msg', null, "You:");
        userInput.value = '';
        saveHistory(); 

        const tempId = "typing-" + Date.now();
        const aiBubble = appendMsg("...", 'ai-msg', tempId, "AdotByte:");
        const contentSpan = aiBubble.querySelector('.msg-content');

        try {
            const response = await fetch('/chat_with_gemini/api/', {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json", 
                    "X-CSRFToken": getCookie('csrftoken') 
                },
                body: JSON.stringify({ message: text })
            });

            const data = await response.json();

            if (data.text) {
                // The text is already formatted as HTML from the backend
                contentSpan.innerHTML = data.text;
                aiBubble.removeAttribute('id');
                saveHistory();
            } else {
                throw new Error(data.error || "Unknown error");
            }

        } catch (e) {
            console.error("AI Error:", e);
            contentSpan.innerText = "AI Connection Error. Please try again.";
        }
    };

    // --- 3. THE HELPER ---
    function appendMsg(content, className, id = null, label = "") {
        if (!chatBody) return null;
        const msgDiv = document.createElement('div');
        msgDiv.className = `msg ${className}`;
        if (id) msgDiv.id = id;
        
        msgDiv.innerHTML = `<b>${label}</b> <span class="msg-content"></span>`;
        // Use innerText for content initially for safety
        msgDiv.querySelector('.msg-content').innerText = content;
        
        chatBody.appendChild(msgDiv);
        chatBody.scrollTop = chatBody.scrollHeight;
        return msgDiv;
    }

    // CSRF Helper for Django
    function getCookie(name) {
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

    // Event Listeners
    document.getElementById('sendBtn')?.addEventListener('click', sendMessage);
    userInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent line breaks in single-line inputs
            sendMessage();
        }
    });
});