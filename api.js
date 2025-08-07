// Frontend API helper functions
class API {
    constructor() {
        this.baseURL = 'http://localhost:3000/api';
        this.token = localStorage.getItem('authToken');
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('authToken', token);
    }

    clearToken() {
        this.token = null;
        localStorage.removeItem('authToken');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Auth methods
    async login(email, password) {
        const data = await this.request('/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        if (data.token) {
            this.setToken(data.token);
        }
        
        return data;
    }

    logout() {
        this.clearToken();
    }

    // News methods
    async getNews() {
        return this.request('/news');
    }

    async createNews(article) {
        return this.request('/news', {
            method: 'POST',
            body: JSON.stringify(article)
        });
    }

    async updateNews(id, article) {
        return this.request(`/news/${id}`, {
            method: 'PUT',
            body: JSON.stringify(article)
        });
    }

    async deleteNews(id) {
        return this.request(`/news/${id}`, {
            method: 'DELETE'
        });
    }

    // Events methods
    async getEvents() {
        return this.request('/events');
    }

    async createEvent(event) {
        return this.request('/events', {
            method: 'POST',
            body: JSON.stringify(event)
        });
    }

    async deleteEvent(id) {
        return this.request(`/events/${id}`, {
            method: 'DELETE'
        });
    }

    // Users methods
    async getUsers() {
        return this.request('/users');
    }

    async createUser(user) {
        return this.request('/users', {
            method: 'POST',
            body: JSON.stringify(user)
        });
    }

    async deleteUser(id) {
        return this.request(`/users/${id}`, {
            method: 'DELETE'
        });
    }

    // Settings methods
    async getSettings() {
        return this.request('/settings');
    }

    async updateSettings(settings) {
        return this.request('/settings', {
            method: 'PUT',
            body: JSON.stringify(settings)
        });
    }

    // Dashboard methods
    async getDashboardStats() {
        return this.request('/dashboard/stats');
    }
}

// Create global API instance
const api = new API();