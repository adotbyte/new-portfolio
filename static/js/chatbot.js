/* static/js/chatbot.js */
(function() {
    document.addEventListener("DOMContentLoaded", () => {
        const chatWindow = document.getElementById('chatWindow');
        const chatBody = document.getElementById('chatBody');
        const userInput = document.getElementById('userInput');
        const modal = document.getElementById('customModal');
        const notification = document.getElementById('chatNotification');
        const chatBubble = document.getElementById('chatBubble');
        const WELCOME_TEXT = "Ask me anything about my projects!";

        // --- 1. FORMATTING ENGINE ---
        const parseMarkdown = (text) => {
            return text
                .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
                .replace(/`(.*?)`/g, '<code>$1</code>')
                .replace(/\n/g, '<br>');
        };

        // --- 2. MESSAGE APPENDER ---
        function appendMsg(content, className, id = null, label = "") {
            if (!chatBody || !content) return null;
            const msgDiv = document.createElement('div');
            msgDiv.className = `msg ${className}`;
            if (id) msgDiv.id = id;

            const typingHtml = `<div class="typing-dots"><span></span><span></span><span></span></div>`;
            msgDiv.innerHTML = `<b>${label}</b> <span class="msg-content"></span>`;
            const contentSpan = msgDiv.querySelector('.msg-content');

            if (content === "TYPING_ANIMATION") {
                contentSpan.innerHTML = typingHtml;
            } else {
                contentSpan.innerHTML = parseMarkdown(content);
            }

            chatBody.appendChild(msgDiv);
            chatBody.scrollTop = chatBody.scrollHeight;
            return msgDiv;
        }

        // --- 3. RECOVERY & STATE ---
        const saveHistory = () => {
            if (chatBody) localStorage.setItem('adotbyte_history', chatBody.innerHTML);
        };

        const loadHistory = () => {
            const saved = localStorage.getItem('adotbyte_history');
            chatBody.innerHTML = '';
            appendMsg(WELCOME_TEXT, 'ai-msg', null, "AdotByte:");

            if (saved) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = saved;
                const messages = tempDiv.querySelectorAll('.msg');
                
                messages.forEach(msg => {
                    const content = msg.querySelector('.msg-content')?.innerText || "";
                    const isUser = msg.classList.contains('user-msg');
                    if (content.includes(WELCOME_TEXT) || content.trim() === "") return; 

                    if (isUser) {
                        appendMsg(content, 'user-msg', null, "You:");
                    } else {
                        appendMsg(content, 'ai-msg', null, "AdotByte:");
                    }
                });
            }
            saveHistory();
        };

        // --- 4. TOGGLE & NOTIFICATIONS ---
        const toggleChat = () => {
            const isHidden = window.getComputedStyle(chatWindow).display === 'none';
            
            if (isHidden) {
                chatWindow.style.display = 'flex';
                localStorage.setItem('adotbyte_chat_open', 'true');
                if (notification) notification.innerHTML = ""; 
                userInput.focus();
                chatBody.scrollTop = chatBody.scrollHeight;
            } else {
                chatWindow.style.display = 'none';
                localStorage.setItem('adotbyte_chat_open', 'false');
            }
        };

        chatBubble?.addEventListener('click', toggleChat);
        document.getElementById('closeChatBtn')?.addEventListener('click', toggleChat);
        document.getElementById('minimizeChatBtn')?.addEventListener('click', toggleChat);

        if (localStorage.getItem('adotbyte_chat_open') === 'true') {
            chatWindow.style.display = 'flex';
        } else {
            chatWindow.style.display = 'none';
        }

        setTimeout(() => {
            if (window.getComputedStyle(chatWindow).display === 'none' && notification) {
                notification.innerHTML = "1";
            }
        }, 3000);

        // --- 5. TRASH / RESET LOGIC ---
        // Open modal
        document.getElementById('clearChatBtn')?.addEventListener('click', () => {
            if (modal) modal.style.display = 'flex';
        });

        // Cancel modal
        document.getElementById('cancelReset')?.addEventListener('click', () => {
            if (modal) modal.style.display = 'none';
        });

        // Confirm reset
        document.getElementById('confirmReset')?.addEventListener('click', async () => {
            try {
                const response = await fetch('/chat/clear/', { 
                    method: "POST", 
                    headers: { "X-CSRFToken": getCookie('csrftoken') } 
                });

                if (response.ok) {
                    localStorage.removeItem('adotbyte_history');
                    chatBody.innerHTML = '';

                    // Immediate feedback
                    appendMsg("Chat history has been successfully deleted.", 'ai-msg', null, "System:");

                    setTimeout(() => {
                        chatBody.innerHTML = ''; 
                        appendMsg(WELCOME_TEXT, 'ai-msg', null, "AdotByte:");
                        saveHistory();
                    }, 2000);
                }
            } catch (error) {
                console.error("Failed to clear chat:", error);
            }
            if (modal) modal.style.display = 'none';
        });

        // --- 6. SEND LOGIC ---
        const sendMessage = async () => {
            const text = userInput.value.trim();
            if (!text) return;

            appendMsg(text, 'user-msg', null, "You:");
            userInput.value = '';
            saveHistory(); 

            const tempId = "typing-" + Date.now();
            const aiBubble = appendMsg("TYPING_ANIMATION", 'ai-msg', tempId, "AdotByte:");
            const contentSpan = aiBubble.querySelector('.msg-content');

            try {
                const response = await fetch('/chat_with_gemini/api/', {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "X-CSRFToken": getCookie('csrftoken') },
                    body: JSON.stringify({ message: text })
                });

                const data = await response.json();
                if (data.text) {
                    contentSpan.innerHTML = parseMarkdown(data.text);
                    aiBubble.removeAttribute('id');
                    saveHistory();
                }
            } catch (e) {
                contentSpan.innerText = "Connection Error.";
            }
        };

        // --- 7. HELPERS ---
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

        // Init
        loadHistory();
        document.getElementById('sendMsgBtn')?.addEventListener('click', sendMessage);
        userInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });
    });
})();