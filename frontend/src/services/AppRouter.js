// AppRouter.js - Main routing configuration for Hannah Health
// Handles navigation between dashboard, meal planner, and other views

class AppRouter {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;
        this.userRole = null;
        this.init();
    }

    init() {
        this.setupRoutes();
        this.setupEventListeners();
        this.loadInitialRoute();
    }

    setupRoutes() {
        // Define application routes
        this.routes.set('/', {
            component: 'Dashboard',
            requiresAuth: true,
            title: 'Dashboard - Hannah Health'
        });

        this.routes.set('/dashboard', {
            component: 'Dashboard',
            requiresAuth: true,
            title: 'Dashboard - Hannah Health'
        });

        this.routes.set('/meal-planner', {
            component: 'MealPlanner',
            requiresAuth: true,
            title: 'Meal Planner - Hannah Health'
        });

        this.routes.set('/clients', {
            component: 'ClientManager',
            requiresAuth: true,
            requiresRole: 'practitioner',
            title: 'Clients - Hannah Health'
        });

        this.routes.set('/client-profile', {
            component: 'ClientProfile',
            requiresAuth: true,
            requiresRole: 'practitioner',
            title: 'Client Profile - Hannah Health'
        });

        this.routes.set('/templates', {
            component: 'TemplateManager',
            requiresAuth: true,
            requiresRole: 'practitioner',
            title: 'Templates - Hannah Health'
        });

        this.routes.set('/recipes', {
            component: 'RecipeManager',
            requiresAuth: true,
            title: 'Recipes - Hannah Health'
        });

        this.routes.set('/shopping-list', {
            component: 'ShoppingList',
            requiresAuth: true,
            title: 'Shopping List - Hannah Health'
        });

        this.routes.set('/favorites', {
            component: 'FavoritesManager',
            requiresAuth: true,
            title: 'Favorites - Hannah Health'
        });

        this.routes.set('/progress', {
            component: 'ProgressTracker',
            requiresAuth: true,
            title: 'Progress - Hannah Health'
        });

        this.routes.set('/reports', {
            component: 'ReportsManager',
            requiresAuth: true,
            requiresRole: 'practitioner',
            title: 'Reports - Hannah Health'
        });

        this.routes.set('/settings', {
            component: 'Settings',
            requiresAuth: true,
            title: 'Settings - Hannah Health'
        });

        this.routes.set('/login', {
            component: 'Login',
            requiresAuth: false,
            title: 'Login - Hannah Health'
        });

        this.routes.set('/signup', {
            component: 'Signup',
            requiresAuth: false,
            title: 'Sign Up - Hannah Health'
        });

        this.routes.set('/onboarding', {
            component: 'Onboarding',
            requiresAuth: true,
            title: 'Welcome - Hannah Health'
        });
    }

    async navigate(path, params = {}) {
        // Parse path and query parameters
        const [pathname, queryString] = path.split('?');
        const route = this.routes.get(pathname);

        if (!route) {
            console.error(`Route not found: ${pathname}`);
            this.navigate404();
            return;
        }

        // Check authentication
        if (route.requiresAuth && !await this.isAuthenticated()) {
            this.navigateToLogin();
            return;
        }

        // Check role requirements
        if (route.requiresRole && !await this.hasRole(route.requiresRole)) {
            this.navigateUnauthorized();
            return;
        }

        // Update browser history
        const url = new URL(window.location);
        url.pathname = pathname;
        if (queryString) {
            url.search = queryString;
        }
        window.history.pushState({ path, params }, '', url);

        // Load the component
        await this.loadComponent(route.component, params);

        // Update page title
        document.title = route.title;

        // Update current route
        this.currentRoute = pathname;

        // Update navigation UI
        this.updateNavigation(pathname);
    }

    async loadComponent(componentName, params) {
        const container = document.getElementById('app-container') || document.body;

        // Show loading state
        this.showLoading();

        try {
            // Dynamic component loading based on name
            switch (componentName) {
                case 'Dashboard':
                    await this.loadDashboard(container, params);
                    break;
                case 'MealPlanner':
                    await this.loadMealPlanner(container, params);
                    break;
                case 'ClientManager':
                    await this.loadClientManager(container, params);
                    break;
                case 'ClientProfile':
                    await this.loadClientProfile(container, params);
                    break;
                case 'TemplateManager':
                    await this.loadTemplateManager(container, params);
                    break;
                case 'Login':
                    await this.loadLogin(container, params);
                    break;
                case 'Signup':
                    await this.loadSignup(container, params);
                    break;
                case 'Onboarding':
                    await this.loadOnboarding(container, params);
                    break;
                default:
                    await this.loadDefaultComponent(container, componentName, params);
            }
        } catch (error) {
            console.error(`Error loading component ${componentName}:`, error);
            this.showError('Failed to load page');
        } finally {
            this.hideLoading();
        }
    }

    // Component Loaders
    async loadDashboard(container, params) {
        const { default: Dashboard } = await import('../components/Dashboard.js');
        const dashboard = new Dashboard();
        container.innerHTML = '';
        container.appendChild(dashboard.render());
    }

    async loadMealPlanner(container, params) {
        // Check for plan or client parameters
        const urlParams = new URLSearchParams(window.location.search);
        const planId = urlParams.get('plan');
        const clientId = urlParams.get('client');
        const mode = urlParams.get('mode');

        if (mode === 'new') {
            // Load plan creation interface
            await this.loadPlanCreator(container, { clientId });
        } else if (planId) {
            // Load specific plan
            await this.loadPlanEditor(container, { planId, mode });
        } else {
            // Load default meal planner
            const { default: MealPlanner } = await import('../components/MealPlanner.js');
            const planner = new MealPlanner({ clientId });
            container.innerHTML = '';
            container.appendChild(planner.render());
        }
    }

    async loadClientManager(container, params) {
        const { default: ClientManager } = await import('../components/ClientManager.js');
        const manager = new ClientManager();
        container.innerHTML = '';
        container.appendChild(manager.render());
    }

    async loadClientProfile(container, params) {
        const urlParams = new URLSearchParams(window.location.search);
        const clientId = urlParams.get('id');
        
        if (!clientId) {
            this.navigate('/clients');
            return;
        }

        const { default: ClientProfile } = await import('../components/ClientProfile.js');
        const profile = new ClientProfile(clientId);
        container.innerHTML = '';
        container.appendChild(profile.render());
    }

    async loadTemplateManager(container, params) {
        const { default: TemplateManager } = await import('../components/TemplateManager.js');
        const manager = new TemplateManager();
        container.innerHTML = '';
        container.appendChild(manager.render());
    }

    async loadLogin(container, params) {
        const { default: Login } = await import('../components/Login.js');
        const login = new Login();
        container.innerHTML = '';
        container.appendChild(login.render());
    }

    async loadSignup(container, params) {
        const { default: Signup } = await import('../components/Signup.js');
        const signup = new Signup();
        container.innerHTML = '';
        container.appendChild(signup.render());
    }

    async loadOnboarding(container, params) {
        const { default: Onboarding } = await import('../components/Onboarding.js');
        const onboarding = new Onboarding();
        container.innerHTML = '';
        container.appendChild(onboarding.render());
    }

    async loadDefaultComponent(container, componentName, params) {
        // Generic component loader
        try {
            const { default: Component } = await import(`../components/${componentName}.js`);
            const instance = new Component(params);
            container.innerHTML = '';
            if (instance.render) {
                container.appendChild(instance.render());
            }
        } catch (error) {
            console.error(`Component ${componentName} not found:`, error);
            this.navigate404();
        }
    }

    // Helper Methods
    async loadPlanCreator(container, params) {
        const { default: PlanCreator } = await import('../components/PlanCreator.js');
        const creator = new PlanCreator(params);
        container.innerHTML = '';
        container.appendChild(creator.render());
    }

    async loadPlanEditor(container, params) {
        const { default: PlanEditor } = await import('../components/PlanEditor.js');
        const editor = new PlanEditor(params);
        container.innerHTML = '';
        container.appendChild(editor.render());
    }

    // Navigation Helpers
    navigate404() {
        const container = document.getElementById('app-container') || document.body;
        container.innerHTML = `
            <div class="error-page">
                <h1>404</h1>
                <p>Page not found</p>
                <a href="/" class="btn-primary">Go to Dashboard</a>
            </div>
        `;
    }

    navigateUnauthorized() {
        const container = document.getElementById('app-container') || document.body;
        container.innerHTML = `
            <div class="error-page">
                <h1>Unauthorized</h1>
                <p>You don't have permission to access this page</p>
                <a href="/" class="btn-primary">Go to Dashboard</a>
            </div>
        `;
    }

    navigateToLogin() {
        this.navigate('/login');
    }

    updateNavigation(currentPath) {
        // Update active nav links
        document.querySelectorAll('.nav-menu a').forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPath) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Authentication & Authorization
    async isAuthenticated() {
        // Check if user is logged in
        // This would connect to your auth service
        try {
            const response = await fetch('/api/auth/check');
            return response.ok;
        } catch {
            return false;
        }
    }

    async hasRole(requiredRole) {
        // Check if user has required role
        try {
            const response = await fetch('/api/auth/user');
            if (response.ok) {
                const user = await response.json();
                return user.role === requiredRole;
            }
            return false;
        } catch {
            return false;
        }
    }

    // Loading States
    showLoading() {
        const loader = document.createElement('div');
        loader.id = 'route-loader';
        loader.className = 'route-loader';
        loader.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(loader);
    }

    hideLoading() {
        const loader = document.getElementById('route-loader');
        if (loader) {
            loader.remove();
        }
    }

    showError(message) {
        const toast = document.createElement('div');
        toast.className = 'toast error';
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // Event Listeners
    setupEventListeners() {
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.path) {
                this.navigate(event.state.path, event.state.params);
            }
        });

        // Handle link clicks
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a[data-route]');
            if (link) {
                event.preventDefault();
                const route = link.getAttribute('data-route');
                this.navigate(route);
            }
        });

        // Handle programmatic navigation
        window.addEventListener('navigate', (event) => {
            if (event.detail && event.detail.path) {
                this.navigate(event.detail.path, event.detail.params);
            }
        });
    }

    loadInitialRoute() {
        // Load route based on current URL
        const path = window.location.pathname;
        const params = Object.fromEntries(new URLSearchParams(window.location.search));
        this.navigate(path, params);
    }

    // Public API
    go(path, params = {}) {
        this.navigate(path, params);
    }

    back() {
        window.history.back();
    }

    forward() {
        window.history.forward();
    }

    reload() {
        this.navigate(this.currentRoute);
    }
}

// Create singleton instance
const router = new AppRouter();

// Export for use in other modules
export default router;