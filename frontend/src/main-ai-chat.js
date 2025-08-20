// Main entry point for AI Chat
import './styles/ai-chat.css';
import './styles/additional.css';
import SimpleHannahChat from './components/ai-chat-simple.js';

// Initialize the app when DOM is ready
function initApp() {
    console.log('💬 Hannah AI Assistant starting...');
    
    // Initialize the chat system
    window.hannahChat = new SimpleHannahChat();
    
    console.log('✅ Hannah AI Assistant ready!');
}

// Start the app
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}