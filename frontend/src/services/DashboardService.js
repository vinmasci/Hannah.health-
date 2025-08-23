// DashboardService.js - Backend service for dashboard data management
// Handles user roles, meal plans, and practitioner-client relationships

class DashboardService {
    constructor() {
        this.supabaseUrl = process.env.SUPABASE_URL || '';
        this.supabaseKey = process.env.SUPABASE_ANON_KEY || '';
        this.currentUser = null;
    }

    // User Authentication & Profile
    async getCurrentUser() {
        try {
            // Get current authenticated user from Supabase
            const user = await this.getAuthUser();
            if (user) {
                // Fetch extended profile with role information
                const profile = await this.fetchUserProfile(user.id);
                this.currentUser = { ...user, ...profile };
                return this.currentUser;
            }
            return null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    async fetchUserProfile(userId) {
        // Fetch user profile from profiles table
        const response = await fetch(`/api/users/${userId}/profile`);
        if (response.ok) {
            return await response.json();
        }
        throw new Error('Failed to fetch user profile');
    }

    async updateUserRole(userId, role) {
        // Update user role (requires admin permission)
        const response = await fetch(`/api/users/${userId}/role`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role })
        });
        return response.ok;
    }

    // Meal Plans Management
    async getUserMealPlans(userId) {
        try {
            const response = await fetch(`/api/meal-plans/user/${userId}`);
            if (response.ok) {
                const plans = await response.json();
                return this.enrichMealPlans(plans);
            }
            return [];
        } catch (error) {
            console.error('Error fetching meal plans:', error);
            return [];
        }
    }

    async createMealPlan(planData) {
        const response = await fetch('/api/meal-plans', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(planData)
        });
        
        if (response.ok) {
            return await response.json();
        }
        throw new Error('Failed to create meal plan');
    }

    async updateMealPlan(planId, updates) {
        const response = await fetch(`/api/meal-plans/${planId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        
        return response.ok;
    }

    async deleteMealPlan(planId) {
        const response = await fetch(`/api/meal-plans/${planId}`, {
            method: 'DELETE'
        });
        
        return response.ok;
    }

    async activateMealPlan(planId, userId) {
        // Deactivate all other plans first
        await this.deactivateAllPlans(userId);
        
        // Activate selected plan
        return await this.updateMealPlan(planId, { is_active: true });
    }

    async deactivateAllPlans(userId) {
        const response = await fetch(`/api/meal-plans/user/${userId}/deactivate`, {
            method: 'PUT'
        });
        return response.ok;
    }

    async duplicateMealPlan(planId) {
        const response = await fetch(`/api/meal-plans/${planId}/duplicate`, {
            method: 'POST'
        });
        
        if (response.ok) {
            return await response.json();
        }
        throw new Error('Failed to duplicate meal plan');
    }

    // Practitioner Features
    async getPractitionerClients(practitionerId) {
        try {
            const response = await fetch(`/api/practitioners/${practitionerId}/clients`);
            if (response.ok) {
                return await response.json();
            }
            return [];
        } catch (error) {
            console.error('Error fetching clients:', error);
            return [];
        }
    }

    async addClient(practitionerId, clientData) {
        const response = await fetch(`/api/practitioners/${practitionerId}/clients`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(clientData)
        });
        
        if (response.ok) {
            return await response.json();
        }
        throw new Error('Failed to add client');
    }

    async updateClient(clientId, updates) {
        const response = await fetch(`/api/clients/${clientId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        
        return response.ok;
    }

    async getClientMealPlans(clientId) {
        const response = await fetch(`/api/clients/${clientId}/meal-plans`);
        if (response.ok) {
            return await response.json();
        }
        return [];
    }

    async createClientMealPlan(clientId, planData) {
        const response = await fetch(`/api/clients/${clientId}/meal-plans`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(planData)
        });
        
        if (response.ok) {
            return await response.json();
        }
        throw new Error('Failed to create client meal plan');
    }

    async shareTemplateWithClient(templateId, clientId) {
        const response = await fetch(`/api/templates/${templateId}/share`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientId })
        });
        
        return response.ok;
    }

    // Statistics & Analytics
    async getUserStatistics(userId) {
        const response = await fetch(`/api/users/${userId}/statistics`);
        if (response.ok) {
            return await response.json();
        }
        return this.getDefaultStatistics();
    }

    async getPractitionerStatistics(practitionerId) {
        const response = await fetch(`/api/practitioners/${practitionerId}/statistics`);
        if (response.ok) {
            return await response.json();
        }
        return this.getDefaultPractitionerStatistics();
    }

    async getClientAdherence(clientId, dateRange) {
        const params = new URLSearchParams({
            startDate: dateRange.start,
            endDate: dateRange.end
        });
        
        const response = await fetch(`/api/clients/${clientId}/adherence?${params}`);
        if (response.ok) {
            return await response.json();
        }
        return { adherence: 0 };
    }

    async getClientAlerts(practitionerId) {
        const response = await fetch(`/api/practitioners/${practitionerId}/alerts`);
        if (response.ok) {
            return await response.json();
        }
        return [];
    }

    // Activity & Progress
    async getRecentActivity(userId) {
        const response = await fetch(`/api/users/${userId}/activity`);
        if (response.ok) {
            return await response.json();
        }
        return [];
    }

    async logActivity(userId, activity) {
        const response = await fetch(`/api/users/${userId}/activity`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(activity)
        });
        
        return response.ok;
    }

    // Templates Management
    async getPractitionerTemplates(practitionerId) {
        const response = await fetch(`/api/practitioners/${practitionerId}/templates`);
        if (response.ok) {
            return await response.json();
        }
        return [];
    }

    async createTemplate(templateData) {
        const response = await fetch('/api/templates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(templateData)
        });
        
        if (response.ok) {
            return await response.json();
        }
        throw new Error('Failed to create template');
    }

    async applyTemplateToClient(templateId, clientId, customizations = {}) {
        const response = await fetch(`/api/templates/${templateId}/apply`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ clientId, customizations })
        });
        
        if (response.ok) {
            return await response.json();
        }
        throw new Error('Failed to apply template');
    }

    // Helper Methods
    enrichMealPlans(plans) {
        // Add calculated properties to meal plans
        return plans.map(plan => ({
            ...plan,
            duration: this.calculatePlanDuration(plan),
            completionRate: this.calculateCompletionRate(plan),
            nextMeal: this.getNextScheduledMeal(plan)
        }));
    }

    calculatePlanDuration(plan) {
        if (!plan.start_date || !plan.end_date) return 'Ongoing';
        const start = new Date(plan.start_date);
        const end = new Date(plan.end_date);
        const weeks = Math.ceil((end - start) / (7 * 24 * 60 * 60 * 1000));
        return weeks;
    }

    calculateCompletionRate(plan) {
        // Calculate how many meals have been logged vs planned
        if (!plan.meals_planned || !plan.meals_logged) return 0;
        return Math.round((plan.meals_logged / plan.meals_planned) * 100);
    }

    getNextScheduledMeal(plan) {
        // Get the next upcoming meal from the plan
        if (!plan.next_meal) return null;
        return {
            type: plan.next_meal.type,
            time: plan.next_meal.time,
            items: plan.next_meal.items
        };
    }

    getDefaultStatistics() {
        return {
            activePlans: 0,
            weekAdherence: 0,
            favoritesCount: 0,
            streakDays: 0,
            totalMealsPlanned: 0,
            totalMealsLogged: 0
        };
    }

    getDefaultPractitionerStatistics() {
        return {
            activeClients: 0,
            totalPlans: 0,
            weekAppointments: 0,
            avgAdherence: 0,
            totalClients: 0,
            activePlans: 0
        };
    }

    // Mock auth function - replace with actual Supabase auth
    async getAuthUser() {
        // This would be replaced with actual Supabase auth call
        return {
            id: 'user-123',
            email: 'user@example.com'
        };
    }

    // Search functionality
    async searchClients(practitionerId, searchTerm) {
        const params = new URLSearchParams({ q: searchTerm });
        const response = await fetch(`/api/practitioners/${practitionerId}/clients/search?${params}`);
        
        if (response.ok) {
            return await response.json();
        }
        return [];
    }

    async searchMealPlans(userId, searchTerm) {
        const params = new URLSearchParams({ q: searchTerm });
        const response = await fetch(`/api/meal-plans/search?${params}`);
        
        if (response.ok) {
            return await response.json();
        }
        return [];
    }

    // Notifications
    async getNotifications(userId) {
        const response = await fetch(`/api/users/${userId}/notifications`);
        if (response.ok) {
            return await response.json();
        }
        return [];
    }

    async markNotificationRead(notificationId) {
        const response = await fetch(`/api/notifications/${notificationId}/read`, {
            method: 'PUT'
        });
        return response.ok;
    }

    // Export functionality
    async exportMealPlan(planId, format = 'pdf') {
        const response = await fetch(`/api/meal-plans/${planId}/export?format=${format}`);
        if (response.ok) {
            return await response.blob();
        }
        throw new Error('Failed to export meal plan');
    }

    async exportClientReport(clientId, dateRange, format = 'pdf') {
        const params = new URLSearchParams({
            startDate: dateRange.start,
            endDate: dateRange.end,
            format
        });
        
        const response = await fetch(`/api/clients/${clientId}/report?${params}`);
        if (response.ok) {
            return await response.blob();
        }
        throw new Error('Failed to export client report');
    }
}

// Create singleton instance
const dashboardService = new DashboardService();

export default dashboardService;