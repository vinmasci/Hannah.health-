// EventBus - Central communication system for modules
// Replaces window globals with a clean event-driven architecture

class EventBus {
    constructor() {
        this.events = {};
        this.debug = false; // Set to true to log all events
    }
    
    // Subscribe to an event
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
        
        if (this.debug) {
            console.log(`[EventBus] Registered listener for: ${event}`);
        }
        
        // Return unsubscribe function
        return () => this.off(event, callback);
    }
    
    // Unsubscribe from an event
    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
    
    // Emit an event with data
    emit(event, data = {}) {
        if (this.debug) {
            console.log(`[EventBus] Emitting: ${event}`, data);
        }
        
        if (this.events[event]) {
            this.events[event].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`[EventBus] Error in listener for ${event}:`, error);
                }
            });
        }
    }
    
    // Clear all listeners for an event
    clear(event) {
        if (event) {
            delete this.events[event];
        } else {
            this.events = {};
        }
    }
    
    // Get all registered events (for debugging)
    getEvents() {
        return Object.keys(this.events);
    }
}

// Create singleton instance
const eventBus = new EventBus();

// Export singleton
export default eventBus;