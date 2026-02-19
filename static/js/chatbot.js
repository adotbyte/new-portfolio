/* static/js/chatbot.js */

document.addEventListener("DOMContentLoaded", () => {
    console.log("Chat System: Initializing...");
    
    // --- 1. ELEMENT SELECTION ---
    const chatWin = document.getElementById('chatWindow');
    const chatBody = document.getElementById('chatBody');
    const userInput = document.getElementById('userInput');
    
    const chatBubble = document.getElementById('chatBubble'); 
    const closeBtn = document.getElementById('closeChatBtn');
    const minimizeBtn = document.getElementById('minimizeChatBtn');
    const clearBtn = document.getElementById('clearChatBtn');
    const sendBtn = document.getElementById('sendMsgBtn');

    // --- A. CROSS-TAB SYNCHRONIZATION (Chat Only) ---
    window.addEventListener('storage', (event) => {
        if (!chatWin) return;
        if (event.key === 'chat_status') {
            chatWin.style.display = event.newValue === 'open' ? 'flex' : 'none';
        }
        if (event.key === 'chat_cleared' && chatBody) {
            chatBody.innerHTML = '<div class="msg ai-msg">History cleared!</div>';
        }
    });

    // --- B. INITIAL STATE RECOVERY ---
    if (chatWin) {
        const currentStatus = localStorage.getItem('chat_status');
        chatWin.style.display = (currentStatus === 'open') ? 'flex' : 'none';

        if (localStorage.getItem('chat_minimized') === 'true') {
            chatWin.classList.add('minimized');
        }
    }

    const scrollToBottom = () => { 
        if (chatBody) {
            chatBody.scrollTop = chatBody.scrollHeight;
        }
    };
    
    scrollToBottom();

    // --- C. CORE ACTIONS ---
    const toggleChat = () => {
        if (!chatWin) return;
        const isHidden = window.getComputedStyle(chatWin).display === 'none';
        const newState = isHidden ? 'flex' : 'none';
        
        chatWin.style.display = newState;
        localStorage.setItem('chat_status', isHidden ? 'open' : 'closed');
        
        if (isHidden && userInput) {
            userInput.focus();
            scrollToBottom();
        }
    };

    const minimizeChat = () => {
        if (chatWin) {
            chatWin.classList.toggle('minimized');
            localStorage.setItem('chat_minimized', chatWin.classList.contains('minimized'));
        }
    };

    const clearChat = async () => {
        if (!confirm("Clear your conversation history?")) return;
        try {
            const response = await fetch('/chat/clear/', {
                method: 'POST',
                headers: { 
                    "X-CSRFToken": getCookie('csrftoken'),
                    "Content-Type": "application/json"
                },
                credentials: 'same-origin',
            });
            if (response.ok && chatBody) {
                chatBody.innerHTML = '<div class="msg ai-msg">History cleared!</div>';
                localStorage.setItem('chat_cleared', Date.now());
            }
        } catch (err) {
            console.error("Clear chat failed:", err);
        }
    };

    const sendMessage = async () => {
        if (!userInput) return;
        const text = userInput.value.trim();
        if (!text) return;

        appendMsg(text, 'user-msg', null, "You:");
        userInput.value = '';
        const tempId = "typing-" + Date.now();
        appendMsg("...", 'ai-msg', tempId, "AdotByte:");

        try {                
            const response = await fetch('/chat_with_gemini/api/', {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json", 
                    "X-CSRFToken": getCookie('csrftoken') 
                },
                credentials: 'same-origin',
                body: JSON.stringify({ message: text })
            });

            const data = await response.json();
            const bubbleDiv = document.getElementById(tempId);
            if (!bubbleDiv) return;
            
            const contentSpan = bubbleDiv.querySelector('.msg-content');
            
            if (data.text) {
                if (typeof marked !== 'undefined') {
                    contentSpan.innerHTML = marked.parse(data.text);
                } else {
                    contentSpan.innerText = data.text;
                }
            } else {
                contentSpan.innerText = data.error || "AdotByte is unavailable.";
            }
            scrollToBottom();
        } catch (error) {
            const bubbleDiv = document.getElementById(tempId);
            if(bubbleDiv) {
                const span = bubbleDiv.querySelector('.msg-content');
                if (span) span.innerText = "AI Connection Error.";
            }
        }
    };

    // --- D. ATTACH LISTENERS ---
    if (chatBubble) chatBubble.addEventListener('click', toggleChat);
    if (closeBtn) closeBtn.addEventListener('click', toggleChat);
    if (minimizeBtn) minimizeBtn.addEventListener('click', minimizeChat);
    if (clearBtn) clearBtn.addEventListener('click', clearChat);
    if (sendBtn) sendBtn.addEventListener('click', sendMessage);
    
    if (userInput) {
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // --- E. HELPERS ---
    function appendMsg(content, className, id = null, label = "") {
        if (!chatBody) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = `msg ${className}`;
        if (id) msgDiv.id = id;
        msgDiv.innerHTML = `<b>${label}</b> <span class="msg-content"></span>`;
        msgDiv.querySelector('.msg-content').innerText = content;
        chatBody.appendChild(msgDiv);
        scrollToBottom();
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
});


//-- Gemini overload notice ---

async function callGemini(userInput) {
    try {
        const response = await fetch('chat_with_gemini/api/', {
            method: 'POST',
            // ... headers and body ...
        });

        // 429 means "Rate Limit Exceeded", 503 means "Overloaded"
        if (response.status === 429 || response.status === 503) {
            throw new Error('Gemini_Overload');
        }

        const data = await response.json();
        // ... display response ...

    } catch (error) {
        let errorMessage;
        
        if (error.message === 'Gemini_Overload') {
            // Pick a random Gemini joke
            errorMessage = geminiOverloadJokes[Math.floor(Math.random() * geminiOverloadJokes.length)];
        } else {
            errorMessage = "The server is taking a nap. Apparently, '24/7' was just a suggestion.";
        }

        displayBotMessage(errorMessage);
    }
}

// Inside your chatbot.js function that handles messages
function displayMessage(role, message) {
    const chatBody = document.getElementById('chatBody');
    
    // 1. Convert Markdown to HTML
    const rawHtml = marked.parse(message);
    
    // 2. Sanitize the HTML to remove <script>, <onerror>, etc.
    const cleanHtml = DOMPurify.sanitize(rawHtml);
    
    // 3. Inject into the DOM safely
    const messageDiv = document.createElement('div');
    messageDiv.className = `msg ${role}-msg`;
    messageDiv.innerHTML = `<b>${role === 'user' ? 'You' : 'AdotByte'}:</b> <span class="msg-content">${cleanHtml}</span>`;
    
    chatBody.appendChild(messageDiv);
}