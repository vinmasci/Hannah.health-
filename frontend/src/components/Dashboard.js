// Dashboard.js - Main dashboard component for Hannah Health
// Supports both individual users and health practitioners

class Dashboard {
    constructor() {
        this.currentUser = null;
        this.userRole = null; // 'individual' or 'practitioner'
        this.selectedPlan = null;
        this.selectedClient = null;
        this.init();
    }

    init() {
        // Initialize dashboard based on user role
        this.loadUserData();
        this.setupEventListeners();
    }

    async loadUserData() {
        try {
            // Load user profile and determine role
            const userData = await this.fetchUserProfile();
            this.currentUser = userData;
            this.userRole = userData.role || 'individual';
            
            if (this.userRole === 'practitioner') {
                await this.loadPractitionerDashboard();
            } else {
                await this.loadIndividualDashboard();
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    async loadIndividualDashboard() {
        const container = document.getElementById('dashboard-container');
        container.innerHTML = this.renderIndividualDashboard();
        
        // Load user's meal plans
        const mealPlans = await this.fetchUserMealPlans();
        this.renderMealPlansList(mealPlans);
        
        // Load quick stats
        this.loadQuickStats();
    }

    async loadPractitionerDashboard() {
        const container = document.getElementById('dashboard-container');
        container.innerHTML = this.renderPractitionerDashboard();
        
        // Load practitioner's clients
        const clients = await this.fetchPractitionerClients();
        this.renderClientsList(clients);
        
        // Load practitioner stats
        this.loadPractitionerStats();
    }

    renderIndividualDashboard() {
        return `
            <div class="dashboard-wrapper">
                <header class="dashboard-header">
                    <h1>Welcome back, ${this.currentUser?.name || 'User'}</h1>
                    <div class="user-mode-badge">
                        ${this.currentUser?.mode_preference === 'ed_safe' ? 'Recovery Mode' : 'Medical Mode'}
                    </div>
                </header>

                <div class="dashboard-grid">
                    <!-- Quick Stats -->
                    <section class="dashboard-card quick-stats">
                        <h2>Your Progress</h2>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <span class="stat-label">Active Plans</span>
                                <span class="stat-value" id="active-plans-count">0</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">This Week</span>
                                <span class="stat-value" id="week-adherence">--</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Favorites</span>
                                <span class="stat-value" id="favorites-count">0</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Streak</span>
                                <span class="stat-value" id="streak-days">0 days</span>
                            </div>
                        </div>
                    </section>

                    <!-- Meal Plans Section -->
                    <section class="dashboard-card meal-plans-section">
                        <div class="card-header">
                            <h2>Your Meal Plans</h2>
                            <button class="btn-primary" onclick="dashboard.createNewPlan()">
                                + New Plan
                            </button>
                        </div>
                        <div id="meal-plans-list" class="plans-list">
                            <!-- Plans will be loaded here -->
                        </div>
                    </section>

                    <!-- Quick Actions -->
                    <section class="dashboard-card quick-actions">
                        <h2>Quick Actions</h2>
                        <div class="actions-grid">
                            <button class="action-btn" onclick="dashboard.openCurrentPlan()">
                                <span class="action-icon">📅</span>
                                <span>Today's Plan</span>
                            </button>
                            <button class="action-btn" onclick="dashboard.openShoppingList()">
                                <span class="action-icon">🛒</span>
                                <span>Shopping List</span>
                            </button>
                            <button class="action-btn" onclick="dashboard.openFavorites()">
                                <span class="action-icon">⭐</span>
                                <span>Favorites</span>
                            </button>
                            <button class="action-btn" onclick="dashboard.openProgress()">
                                <span class="action-icon">📊</span>
                                <span>Progress</span>
                            </button>
                        </div>
                    </section>

                    <!-- Recent Activity -->
                    <section class="dashboard-card recent-activity">
                        <h2>Recent Activity</h2>
                        <div id="activity-feed" class="activity-feed">
                            <!-- Activity items will be loaded here -->
                        </div>
                    </section>
                </div>
            </div>
        `;
    }

    renderPractitionerDashboard() {
        return `
            <div class="dashboard-wrapper practitioner-dashboard">
                <header class="dashboard-header">
                    <h1>Practitioner Dashboard</h1>
                    <div class="practitioner-badge">
                        ${this.currentUser?.license_type || 'Health Professional'}
                    </div>
                </header>

                <div class="dashboard-grid">
                    <!-- Practice Stats -->
                    <section class="dashboard-card practice-stats">
                        <h2>Practice Overview</h2>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <span class="stat-label">Active Clients</span>
                                <span class="stat-value" id="active-clients-count">0</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Total Plans</span>
                                <span class="stat-value" id="total-plans-count">0</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">This Week</span>
                                <span class="stat-value" id="week-appointments">0</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">Adherence</span>
                                <span class="stat-value" id="avg-adherence">--</span>
                            </div>
                        </div>
                    </section>

                    <!-- Clients Management -->
                    <section class="dashboard-card clients-section">
                        <div class="card-header">
                            <h2>Your Clients</h2>
                            <div class="header-actions">
                                <input type="search" 
                                       id="client-search" 
                                       placeholder="Search clients..."
                                       class="search-input">
                                <button class="btn-primary" onclick="dashboard.addNewClient()">
                                    + Add Client
                                </button>
                            </div>
                        </div>
                        <div id="clients-list" class="clients-list">
                            <!-- Clients will be loaded here -->
                        </div>
                    </section>

                    <!-- Quick Tools -->
                    <section class="dashboard-card practitioner-tools">
                        <h2>Tools</h2>
                        <div class="tools-grid">
                            <button class="tool-btn" onclick="dashboard.openPlanBuilder()">
                                <span class="tool-icon">🔧</span>
                                <span>Plan Builder</span>
                            </button>
                            <button class="tool-btn" onclick="dashboard.openTemplates()">
                                <span class="tool-icon">📋</span>
                                <span>Templates</span>
                            </button>
                            <button class="tool-btn" onclick="dashboard.openReports()">
                                <span class="tool-icon">📈</span>
                                <span>Reports</span>
                            </button>
                            <button class="tool-btn" onclick="dashboard.openMessages()">
                                <span class="tool-icon">💬</span>
                                <span>Messages</span>
                            </button>
                        </div>
                    </section>

                    <!-- Client Alerts -->
                    <section class="dashboard-card client-alerts">
                        <h2>Client Alerts</h2>
                        <div id="alerts-list" class="alerts-list">
                            <!-- Alerts will be loaded here -->
                        </div>
                    </section>
                </div>
            </div>
        `;
    }

    renderMealPlansList(plans) {
        const container = document.getElementById('meal-plans-list');
        
        if (!plans || plans.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No meal plans yet</p>
                    <button class="btn-link" onclick="dashboard.createNewPlan()">
                        Create your first plan
                    </button>
                </div>
            `;
            return;
        }

        const plansHTML = plans.map(plan => `
            <div class="plan-card" data-plan-id="${plan.id}">
                <div class="plan-header">
                    <h3>${plan.name}</h3>
                    <span class="plan-badge ${plan.is_active ? 'active' : ''}">
                        ${plan.is_active ? 'Active' : 'Inactive'}
                    </span>
                </div>
                <div class="plan-meta">
                    <span>Created: ${new Date(plan.created_at).toLocaleDateString()}</span>
                    <span>${plan.duration} weeks</span>
                </div>
                <div class="plan-actions">
                    <button class="btn-secondary" onclick="dashboard.viewPlan('${plan.id}')">
                        View
                    </button>
                    <button class="btn-secondary" onclick="dashboard.editPlan('${plan.id}')">
                        Edit
                    </button>
                    ${!plan.is_active ? `
                        <button class="btn-primary" onclick="dashboard.activatePlan('${plan.id}')">
                            Activate
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');

        container.innerHTML = plansHTML;
    }

    renderClientsList(clients) {
        const container = document.getElementById('clients-list');
        
        if (!clients || clients.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No clients yet</p>
                    <button class="btn-link" onclick="dashboard.addNewClient()">
                        Add your first client
                    </button>
                </div>
            `;
            return;
        }

        const clientsHTML = clients.map(client => `
            <div class="client-card" data-client-id="${client.id}">
                <div class="client-header">
                    <div class="client-avatar">
                        ${client.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="client-info">
                        <h3>${client.name}</h3>
                        <span class="client-condition">${client.primary_condition || 'General wellness'}</span>
                    </div>
                    <span class="client-status ${client.status}">
                        ${client.status}
                    </span>
                </div>
                <div class="client-stats">
                    <div class="stat">
                        <span class="label">Plans:</span>
                        <span class="value">${client.plan_count || 0}</span>
                    </div>
                    <div class="stat">
                        <span class="label">Adherence:</span>
                        <span class="value">${client.adherence || '--'}%</span>
                    </div>
                    <div class="stat">
                        <span class="label">Last Check-in:</span>
                        <span class="value">${this.formatLastCheckIn(client.last_checkin)}</span>
                    </div>
                </div>
                <div class="client-actions">
                    <button class="btn-secondary" onclick="dashboard.viewClient('${client.id}')">
                        View Profile
                    </button>
                    <button class="btn-primary" onclick="dashboard.managePlans('${client.id}')">
                        Manage Plans
                    </button>
                </div>
            </div>
        `).join('');

        container.innerHTML = clientsHTML;
    }

    // Data fetching methods
    async fetchUserProfile() {
        // This would connect to your Supabase backend
        return {
            id: 'user-123',
            name: 'John Doe',
            role: 'individual',
            mode_preference: 'medical'
        };
    }

    async fetchUserMealPlans() {
        // Fetch user's meal plans from backend
        return [];
    }

    async fetchPractitionerClients() {
        // Fetch practitioner's clients from backend
        return [];
    }

    // Action methods
    createNewPlan() {
        window.location.href = '/meal-planner?mode=new';
    }

    viewPlan(planId) {
        window.location.href = `/meal-planner?plan=${planId}`;
    }

    editPlan(planId) {
        window.location.href = `/meal-planner?plan=${planId}&mode=edit`;
    }

    activatePlan(planId) {
        // Activate the selected plan
        console.log('Activating plan:', planId);
    }

    addNewClient() {
        // Open add client modal
        console.log('Adding new client');
    }

    viewClient(clientId) {
        window.location.href = `/client-profile?id=${clientId}`;
    }

    managePlans(clientId) {
        window.location.href = `/meal-planner?client=${clientId}`;
    }

    // Utility methods
    formatLastCheckIn(date) {
        if (!date) return 'Never';
        const days = Math.floor((Date.now() - new Date(date)) / (1000 * 60 * 60 * 24));
        if (days === 0) return 'Today';
        if (days === 1) return 'Yesterday';
        return `${days} days ago`;
    }

    setupEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('client-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterClients(e.target.value);
            });
        }
    }

    filterClients(searchTerm) {
        const cards = document.querySelectorAll('.client-card');
        cards.forEach(card => {
            const name = card.querySelector('h3').textContent.toLowerCase();
            const visible = name.includes(searchTerm.toLowerCase());
            card.style.display = visible ? 'block' : 'none';
        });
    }

    // Quick stats loaders
    async loadQuickStats() {
        // Load and display user's quick stats
        const stats = await this.fetchUserStats();
        if (stats) {
            document.getElementById('active-plans-count').textContent = stats.activePlans || 0;
            document.getElementById('week-adherence').textContent = `${stats.weekAdherence || 0}%`;
            document.getElementById('favorites-count').textContent = stats.favoritesCount || 0;
            document.getElementById('streak-days').textContent = `${stats.streakDays || 0} days`;
        }
    }

    async loadPractitionerStats() {
        // Load and display practitioner's stats
        const stats = await this.fetchPractitionerStats();
        if (stats) {
            document.getElementById('active-clients-count').textContent = stats.activeClients || 0;
            document.getElementById('total-plans-count').textContent = stats.totalPlans || 0;
            document.getElementById('week-appointments').textContent = stats.weekAppointments || 0;
            document.getElementById('avg-adherence').textContent = `${stats.avgAdherence || 0}%`;
        }
    }

    async fetchUserStats() {
        // Fetch user statistics from backend
        return {
            activePlans: 2,
            weekAdherence: 85,
            favoritesCount: 12,
            streakDays: 7
        };
    }

    async fetchPractitionerStats() {
        // Fetch practitioner statistics from backend
        return {
            activeClients: 15,
            totalPlans: 42,
            weekAppointments: 8,
            avgAdherence: 78
        };
    }

    // Navigation methods
    openCurrentPlan() {
        window.location.href = '/meal-planner?date=today';
    }

    openShoppingList() {
        window.location.href = '/shopping-list';
    }

    openFavorites() {
        window.location.href = '/favorites';
    }

    openProgress() {
        window.location.href = '/progress';
    }

    openPlanBuilder() {
        window.location.href = '/plan-builder';
    }

    openTemplates() {
        window.location.href = '/templates';
    }

    openReports() {
        window.location.href = '/reports';
    }

    openMessages() {
        window.location.href = '/messages';
    }
}

// Initialize dashboard
const dashboard = new Dashboard();

export default Dashboard;