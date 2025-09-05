// Chat UI Manager  
// Handles chat messages, typing indicators, and UI feedback

export class ChatUIManager {
    constructor() {
        this.typingTimeout = null;
    }
    
    // Add a message to the chat
    addMessage(text, sender, messagesAreaId = 'ai-chat-messages') {
        const messagesArea = document.getElementById(messagesAreaId);
        if (!messagesArea) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${sender}-message`;
        
        // Format the text
        let formattedText = text;
        
        // Convert markdown-style formatting
        formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
        formattedText = formattedText.replace(/\n/g, '<br>');
        
        // Wrap in paragraphs if not already formatted
        if (!formattedText.includes('<p>')) {
            formattedText = `<p>${formattedText}</p>`;
        }
        
        if (sender === 'hannah') {
            messageDiv.innerHTML = `
                <div class="hannah-avatar">H</div>
                <div class="message-bubble">${formattedText}</div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-bubble">${formattedText}</div>
            `;
        }
        
        messagesArea.appendChild(messageDiv);
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }
    
    // Show typing indicator
    showTypingIndicator(messagesAreaId = 'ai-chat-messages') {
        const messagesArea = document.getElementById(messagesAreaId);
        if (!messagesArea) return;
        
        const typing = document.createElement('div');
        typing.className = 'ai-message hannah-message typing-indicator';
        typing.innerHTML = `
            <div class="hannah-avatar">H</div>
            <div class="message-bubble">
                <div class="typing-dots">
                    <span></span><span></span><span></span>
                </div>
            </div>
        `;
        messagesArea.appendChild(typing);
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }
    
    // Hide typing indicator
    hideTypingIndicator(messagesAreaId = 'ai-chat-messages') {
        const typing = document.querySelector(`#${messagesAreaId} .typing-indicator`);
        if (typing) typing.remove();
    }
    
    // Show search status
    showSearchStatus(status, messagesAreaId = 'ai-chat-messages') {
        const messagesArea = document.getElementById(messagesAreaId);
        if (!messagesArea) return;
        
        const searchStatus = document.createElement('div');
        searchStatus.className = 'search-status';
        searchStatus.innerHTML = `
            <div class="search-icon">🔍</div>
            <div class="search-text">${status}</div>
        `;
        messagesArea.appendChild(searchStatus);
        messagesArea.scrollTop = messagesArea.scrollHeight;
        
        // Remove after 3 seconds
        setTimeout(() => {
            searchStatus.classList.add('fade-out');
            setTimeout(() => searchStatus.remove(), 500);
        }, 3000);
    }
    
    // Clear all messages
    clearMessages(messagesAreaId = 'ai-chat-messages') {
        const messagesArea = document.getElementById(messagesAreaId);
        if (messagesArea) {
            messagesArea.innerHTML = '';
        }
    }
    
    // Show welcome message
    showWelcomeMessage(messagesAreaId = 'ai-chat-messages') {
        const messagesArea = document.getElementById(messagesAreaId);
        if (!messagesArea) return;
        
        messagesArea.innerHTML = `
            <div class="ai-welcome-message">
                <div class="hannah-avatar">H</div>
                <div class="message-bubble">
                    <p>Hi! I'm Hannah, your AI nutritionist at Hannah.health 🌟</p>
                    <p>I can help you:</p>
                    <p>• Create personalized meal plans for your goals<br>
                    • Find and add recipes from the web<br>
                    • Track your calories and macros<br>
                    • Build healthy eating habits</p>
                    <p>Just tell me what you'd like to eat, your health goals, or ask for meal ideas - I'll add them directly to your planner!</p>
                    <p><strong>Try saying:</strong> "I want to lose weight" or "Add a healthy breakfast" or "Find me a chicken recipe"</p>
                </div>
            </div>
        `;
    }
    
    // Utility delay function
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default ChatUIManager;