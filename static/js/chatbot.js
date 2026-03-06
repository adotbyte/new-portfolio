/* static/js/chatbot.js */
(function() {
    document.addEventListener("DOMContentLoaded", () => {
        const chatWindow = document.getElementById('chatWindow');
        const chatBody = document.getElementById('chatBody');
        const userInput = document.getElementById('userInput');
        const modal = document.getElementById('customModal');

        // --- NEW: INITIAL STATE CHECK ---
        // Check if the chat was open before the page reloaded
        const chatState = localStorage.getItem('adotbyte_chat_open');
        if (chatState === 'true') {
            chatWindow.style.display = 'flex';
        } else {
            chatWindow.style.display = 'none';
        }

        // --- 1. TOGGLE LOGIC (UPDATED TO SAVE STATE) ---
        document.addEventListener('click', (e) => {
            const bubble = e.target.closest('#chatBubble');
            const closeBtn = e.target.closest('#closeChatBtn');
            const minimizeBtn = e.target.closest('#minimizeChatBtn');

            if (bubble) {
                const isHidden = window.getComputedStyle(chatWindow).display === 'none';
                if (isHidden) {
                    chatWindow.style.display = 'flex';
                    localStorage.setItem('adotbyte_chat_open', 'true'); // SAVE STATE
                    userInput.focus();
                    chatBody.scrollTop = chatBody.scrollHeight;
                } else {
                    chatWindow.style.display = 'none';
                    localStorage.setItem('adotbyte_chat_open', 'false'); // SAVE STATE
                }
            }
            if (closeBtn || minimizeBtn) {
                chatWindow.style.display = 'none';
                localStorage.setItem('adotbyte_chat_open', 'false'); // SAVE STATE
            }
        });

        // --- 2. RECOVERY LOGIC ---
        const loadHistory = () => {
            const saved = localStorage.getItem('adotbyte_history');
            if (saved && chatBody && chatBody.children.length <= 1) {
                chatBody.innerHTML = saved;
                setTimeout(() => { chatBody.scrollTop = chatBody.scrollHeight; }, 100);
            }
        };

        const saveHistory = () => {
            if (chatBody) localStorage.setItem('adotbyte_history', chatBody.innerHTML);
        };

        loadHistory();

        // --- 3. THE SEND LOGIC ---
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
                    contentSpan.innerHTML = data.text;
                    aiBubble.removeAttribute('id');
                    saveHistory();
                } else {
                    throw new Error(data.error || "Unknown error");
                }
            } catch (e) {
                contentSpan.innerText = "AI Connection Error.";
            }
        };

        // --- 4. HELPERS ---
        function appendMsg(content, className, id = null, label = "") {
            if (!chatBody) return null;
            const msgDiv = document.createElement('div');
            msgDiv.className = `msg ${className}`;
            if (id) msgDiv.id = id;
            msgDiv.innerHTML = `<b>${label}</b> <span class="msg-content"></span>`;
            msgDiv.querySelector('.msg-content').innerText = content;
            chatBody.appendChild(msgDiv);
            chatBody.scrollTop = chatBody.scrollHeight;
            return msgDiv;
        }

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

        // --- 5. MODAL & DELETE LOGIC (FIXED) ---
        const clearBtn = document.getElementById('clearChatBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', (e) => {
                e.stopPropagation(); 
                if (modal) modal.style.display = 'flex';
            });
        }

        document.getElementById('cancelReset')?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (modal) modal.style.display = 'none';
        });

        document.getElementById('confirmReset')?.addEventListener('click', async (e) => {
            e.stopPropagation();

            try {
                const response = await fetch('/chat/clear/', { 
                    method: "POST",
                    headers: { 
                        "X-CSRFToken": getCookie('csrftoken') 
                    }
                });

                if (response.ok) {
                    localStorage.removeItem('adotbyte_history');

                    if (chatBody) {
                        chatBody.innerHTML = '<div class="msg ai-msg"><b>AdotByte:</b> <span class="msg-content">History cleared!</span></div>';
                    }
                    
                    if (userInput) {
                        userInput.value = '';
                        userInput.focus();
                    }
                } else {
                    alert("Server failed to clear history.");
                }
            } catch (err) {
                console.error("Cleanup error:", err);
            } finally {
                if (modal) modal.style.display = 'none';
            }
        });

        // --- 6. GLOBAL LISTENERS ---
        document.getElementById('sendMsgBtn')?.addEventListener('click', (e) => {
            sendMessage();
        });

        userInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
})();

// --- Notification dot ---

document.addEventListener("DOMContentLoaded", function() {
    // 1. Wait 3 seconds after the page loads
    setTimeout(() => {
        const chatWindow = document.querySelector('.chat-window');
        const notification = document.getElementById('chatNotification');

        // 2. Only show notification if the chat isn't already open
        if (chatWindow.style.display !== 'flex') {
            notification.innerHTML = "1"; // Putting text inside triggers :not(:empty)
            
            // Optional: Log a greeting to the console or prep the first AI message
            console.log("Chatbot: 'Hey! Need some help? I'm right here.'");
        }
    }, 3000); 

    // 3. Clear the notification when the bubble is clicked
    document.getElementById('chatBubble').addEventListener('click', () => {
        const notification = document.getElementById('chatNotification');
        notification.innerHTML = ""; // Hides it
    });
});

// Simple battery saver: Pause animations when tab is hidden
document.addEventListener("visibilitychange", () => {
    const dot = document.getElementById('chatNotification');
    if (document.hidden) {
        dot.style.animationPlayState = 'paused';
    } else {
        dot.style.animationPlayState = 'running';
    }
});


