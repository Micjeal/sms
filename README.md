# Bright Minds Academy Website

A complete school website with admin dashboard and backend API.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```
   Or for development:
   ```bash
   npm run dev
   ```

3. **Access the Website**
   - Website: http://localhost:3000
   - Admin Login: admin@brightminds.edu / admin123

## Features

### Frontend
- Responsive school website
- About, Academics, News pages
- Admin login system
- Admin dashboard

### Backend API
- User authentication with JWT
- News management
- Events management
- User management
- Settings management
- Dashboard statistics

## API Endpoints

### Authentication
- POST `/api/login` - User login

### News
- GET `/api/news` - Get all news
- POST `/api/news` - Create news (auth required)
- PUT `/api/news/:id` - Update news (auth required)
- DELETE `/api/news/:id` - Delete news (auth required)

### Events
- GET `/api/events` - Get all events
- POST `/api/events` - Create event (auth required)
- DELETE `/api/events/:id` - Delete event (auth required)

### Users
- GET `/api/users` - Get all users (auth required)
- POST `/api/users` - Create user (auth required)
- DELETE `/api/users/:id` - Delete user (auth required)

### Settings
- GET `/api/settings` - Get settings (auth required)
- PUT `/api/settings` - Update settings (auth required)

### Dashboard
- GET `/api/dashboard/stats` - Get dashboard statistics (auth required)