// MealPlanSwitcher.js - Component for switching between multiple meal plans
// Supports both individual users and practitioners managing client plans

class MealPlanSwitcher {
    constructor() {
        this.currentPlan = null;
        this.availablePlans = [];
        this.userRole = null;
        this.selectedClient = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadAvailablePlans();
    }

    async loadAvailablePlans() {
        try {
            // Determine user role and load appropriate plans
            const user = await this.getCurrentUser();
            this.userRole = user.role;

            if (this.userRole === 'practitioner' && this.selectedClient) {
                // Load client's plans
                this.availablePlans = await this.fetchClientPlans(this.selectedClient);
            } else {
                // Load user's own plans
                this.availablePlans = await this.fetchUserPlans(user.id);
            }

            this.renderPlanSwitcher();
            this.loadActivePlan();
        } catch (error) {
            console.error('Error loading plans:', error);
        }
    }

    renderPlanSwitcher() {
        const container = document.getElementById('plan-switcher-container');
        if (!container) return;

        container.innerHTML = `
            <div class="plan-switcher">
                <div class="switcher-header">
                    <h3>Meal Plans</h3>
                    ${this.userRole === 'practitioner' && this.selectedClient ? `
                        <div class="client-indicator">
                            <span class="label">Client:</span>
                            <span class="client-name">${this.selectedClient.name}</span>
                        </div>
                    ` : ''}
                </div>

                <div class="plan-selector">
                    <label for="plan-dropdown">Active Plan:</label>
                    <select id="plan-dropdown" class="plan-dropdown">
                        <option value="">Select a plan...</option>
                        ${this.availablePlans.map(plan => `
                            <option value="${plan.id}" ${plan.is_active ? 'selected' : ''}>
                                ${plan.name} ${plan.is_active ? '(Active)' : ''}
                            </option>
                        `).join('')}
                    </select>
                </div>

                <div class="plan-details" id="plan-details">
                    <!-- Plan details will be loaded here -->
                </div>

                <div class="plan-actions">
                    <button class="btn-secondary" onclick="planSwitcher.viewCurrentPlan()">
                        View Plan
                    </button>
                    <button class="btn-secondary" onclick="planSwitcher.editCurrentPlan()">
                        Edit Plan
                    </button>
                    <button class="btn-primary" onclick="planSwitcher.createNewPlan()">
                        + New Plan
                    </button>
                </div>

                ${this.renderQuickStats()}
            </div>
        `;

        this.attachDropdownListener();
    }

    renderQuickStats() {
        if (!this.currentPlan) return '';

        return `
            <div class="plan-quick-stats">
                <h4>Plan Overview</h4>
                <div class="stats-row">
                    <div class="stat">
                        <span class="stat-label">Duration:</span>
                        <span class="stat-value">${this.currentPlan.duration || '--'} weeks</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Progress:</span>
                        <span class="stat-value">${this.currentPlan.progress || 0}%</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Adherence:</span>
                        <span class="stat-value">${this.currentPlan.adherence || '--'}%</span>
                    </div>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${this.currentPlan.progress || 0}%"></div>
                </div>
            </div>
        `;
    }

    renderPlanDetails(plan) {
        const detailsContainer = document.getElementById('plan-details');
        if (!detailsContainer) return;

        if (!plan) {
            detailsContainer.innerHTML = `
                <div class="no-plan-selected">
                    <p>No plan selected</p>
                </div>
            `;
            return;
        }

        detailsContainer.innerHTML = `
            <div class="plan-info">
                <div class="info-row">
                    <span class="label">Name:</span>
                    <span class="value">${plan.name}</span>
                </div>
                <div class="info-row">
                    <span class="label">Created:</span>
                    <span class="value">${new Date(plan.created_at).toLocaleDateString()}</span>
                </div>
                <div class="info-row">
                    <span class="label">Type:</span>
                    <span class="value">${plan.plan_type || 'Standard'}</span>
                </div>
                <div class="info-row">
                    <span class="label">Goal:</span>
                    <span class="value">${plan.goal || 'General wellness'}</span>
                </div>
                ${plan.description ? `
                    <div class="info-row">
                        <span class="label">Description:</span>
                        <span class="value">${plan.description}</span>
                    </div>
                ` : ''}
            </div>
        `;
    }

    attachDropdownListener() {
        const dropdown = document.getElementById('plan-dropdown');
        if (dropdown) {
            dropdown.addEventListener('change', (e) => {
                this.switchPlan(e.target.value);
            });
        }
    }

    async switchPlan(planId) {
        if (!planId) {
            this.currentPlan = null;
            this.renderPlanDetails(null);
            return;
        }

        try {
            // Find the selected plan
            const plan = this.availablePlans.find(p => p.id === planId);
            if (!plan) return;

            // Activate the plan
            await this.activatePlan(planId);

            // Update current plan
            this.currentPlan = plan;
            this.renderPlanDetails(plan);

            // Notify other components
            this.notifyPlanChange(plan);

            // Update UI
            this.showSuccessMessage('Plan switched successfully');
        } catch (error) {
            console.error('Error switching plan:', error);
            this.showErrorMessage('Failed to switch plan');
        }
    }

    async activatePlan(planId) {
        const response = await fetch(`/api/meal-plans/${planId}/activate`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error('Failed to activate plan');
        }

        // Update local state
        this.availablePlans.forEach(plan => {
            plan.is_active = plan.id === planId;
        });
    }

    loadActivePlan() {
        const activePlan = this.availablePlans.find(p => p.is_active);
        if (activePlan) {
            this.currentPlan = activePlan;
            this.renderPlanDetails(activePlan);
        }
    }

    // Plan Management Actions
    viewCurrentPlan() {
        if (!this.currentPlan) {
            this.showErrorMessage('No plan selected');
            return;
        }
        window.location.href = `/meal-planner?plan=${this.currentPlan.id}`;
    }

    editCurrentPlan() {
        if (!this.currentPlan) {
            this.showErrorMessage('No plan selected');
            return;
        }
        window.location.href = `/meal-planner?plan=${this.currentPlan.id}&mode=edit`;
    }

    createNewPlan() {
        const params = new URLSearchParams();
        if (this.userRole === 'practitioner' && this.selectedClient) {
            params.append('client', this.selectedClient.id);
        }
        window.location.href = `/meal-planner?mode=new&${params.toString()}`;
    }

    async duplicateCurrentPlan() {
        if (!this.currentPlan) {
            this.showErrorMessage('No plan selected');
            return;
        }

        try {
            const response = await fetch(`/api/meal-plans/${this.currentPlan.id}/duplicate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            if (response.ok) {
                const newPlan = await response.json();
                this.showSuccessMessage('Plan duplicated successfully');
                await this.loadAvailablePlans();
                this.switchPlan(newPlan.id);
            }
        } catch (error) {
            console.error('Error duplicating plan:', error);
            this.showErrorMessage('Failed to duplicate plan');
        }
    }

    async deleteCurrentPlan() {
        if (!this.currentPlan) {
            this.showErrorMessage('No plan selected');
            return;
        }

        if (!confirm(`Are you sure you want to delete "${this.currentPlan.name}"?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/meal-plans/${this.currentPlan.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                this.showSuccessMessage('Plan deleted successfully');
                this.currentPlan = null;
                await this.loadAvailablePlans();
            }
        } catch (error) {
            console.error('Error deleting plan:', error);
            this.showErrorMessage('Failed to delete plan');
        }
    }

    // Plan Comparison
    async comparePlans(planIds) {
        if (planIds.length < 2) {
            this.showErrorMessage('Select at least 2 plans to compare');
            return;
        }

        const comparisonData = await this.fetchPlanComparison(planIds);
        this.renderPlanComparison(comparisonData);
    }

    renderPlanComparison(data) {
        const modal = document.createElement('div');
        modal.className = 'plan-comparison-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <h2>Plan Comparison</h2>
                <table class="comparison-table">
                    <thead>
                        <tr>
                            <th>Feature</th>
                            ${data.plans.map(plan => `<th>${plan.name}</th>`).join('')}
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Duration</td>
                            ${data.plans.map(plan => `<td>${plan.duration} weeks</td>`).join('')}
                        </tr>
                        <tr>
                            <td>Calories/Day</td>
                            ${data.plans.map(plan => `<td>${plan.daily_calories || '--'}</td>`).join('')}
                        </tr>
                        <tr>
                            <td>Meals/Day</td>
                            ${data.plans.map(plan => `<td>${plan.meals_per_day || '--'}</td>`).join('')}
                        </tr>
                        <tr>
                            <td>Adherence</td>
                            ${data.plans.map(plan => `<td>${plan.adherence || '--'}%</td>`).join('')}
                        </tr>
                    </tbody>
                </table>
                <button class="btn-primary" onclick="this.parentElement.parentElement.remove()">Close</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Helper Methods
    async getCurrentUser() {
        // Mock implementation - replace with actual auth
        return {
            id: 'user-123',
            role: 'individual',
            name: 'John Doe'
        };
    }

    async fetchUserPlans(userId) {
        // Mock implementation - replace with actual API call
        return [
            {
                id: 'plan-1',
                name: 'Weight Loss Plan',
                is_active: true,
                created_at: '2025-01-01',
                duration: 8,
                progress: 25,
                adherence: 85,
                plan_type: 'Weight Loss',
                goal: 'Lose 10 pounds'
            },
            {
                id: 'plan-2',
                name: 'Maintenance Plan',
                is_active: false,
                created_at: '2024-12-15',
                duration: 12,
                progress: 100,
                adherence: 90,
                plan_type: 'Maintenance',
                goal: 'Maintain current weight'
            }
        ];
    }

    async fetchClientPlans(client) {
        // Mock implementation for practitioner viewing client plans
        return [
            {
                id: 'client-plan-1',
                name: 'NAFLD Management',
                is_active: true,
                created_at: '2025-01-10',
                duration: 16,
                progress: 10,
                adherence: 75,
                plan_type: 'Medical',
                goal: 'Manage NAFLD symptoms'
            }
        ];
    }

    async fetchPlanComparison(planIds) {
        // Mock implementation
        return {
            plans: planIds.map(id => ({
                id,
                name: `Plan ${id}`,
                duration: Math.floor(Math.random() * 12) + 4,
                daily_calories: 1800 + Math.floor(Math.random() * 400),
                meals_per_day: 3 + Math.floor(Math.random() * 2),
                adherence: 70 + Math.floor(Math.random() * 30)
            }))
        };
    }

    notifyPlanChange(plan) {
        // Dispatch custom event for other components
        window.dispatchEvent(new CustomEvent('planChanged', { 
            detail: { plan } 
        }));
    }

    showSuccessMessage(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'toast success';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    showErrorMessage(message) {
        // Create toast notification
        const toast = document.createElement('div');
        toast.className = 'toast error';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    setupEventListeners() {
        // Listen for client selection changes (for practitioners)
        window.addEventListener('clientSelected', (e) => {
            this.selectedClient = e.detail.client;
            this.loadAvailablePlans();
        });

        // Listen for plan updates
        window.addEventListener('planUpdated', () => {
            this.loadAvailablePlans();
        });
    }
}

// Initialize and export
const planSwitcher = new MealPlanSwitcher();
export default planSwitcher;