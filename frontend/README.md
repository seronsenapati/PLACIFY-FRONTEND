# PLACIFY - Your Career, Our Mission.

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue)](https://placify-app.vercel.app/)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5-green)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-blue)](https://tailwindcss.com/)

A modern, responsive job portal application built with React, Vite, and Tailwind CSS. PLACIFY connects students with career opportunities and provides recruiters with tools to manage job postings and applications.

## 🌐 Live Demo

Check out the live application at: [https://placify-app.vercel.app/](https://placify-app.vercel.app/)

## 🚀 Features

### For Students
- Browse and search job listings
- Apply to jobs with a single click
- Save favorite jobs for later
- Track application status in real-time
- Manage personal profile and resume
- Receive notifications about application updates

### For Recruiters
- Create and manage job postings
- Review and manage applications
- Company profile management
- Track job performance metrics
- Receive application notifications

### For Admins
- Platform oversight and management
- User and content moderation
- System analytics and reporting

## 🛠️ Tech Stack

- **Frontend Framework**: [React 18](https://reactjs.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Routing**: [React Router DOM](https://reactrouter.com/)
- **HTTP Client**: [Axios](https://axios-http.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Deployment**: [Vercel](https://vercel.com/)

## 📁 Project Structure

```
src/
├── components/        # Reusable UI components
├── layouts/           # Page layouts (Dashboard, Public)
├── pages/             # Page components organized by user role
│   ├── admin/         # Admin-specific pages
│   ├── recruiter/     # Recruiter-specific pages
│   ├── student/       # Student-specific pages
│   └── shared/        # Public pages (Landing, Login, etc.)
├── routes/            # Routing configuration
├── services/          # API service layer
├── utils/             # Utility functions
├── App.jsx            # Main App component
├── main.jsx           # Entry point
└── index.css          # Global styles
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install
```

### Development

```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173` by default.

### Build for Production

```bash
# Create a production build
npm run build
```

### Preview Production Build

```bash
# Preview the production build locally
npm run preview
```

## ☁️ Deployment

### Vercel (Recommended)

This application is configured for deployment to Vercel:

1. Connect your GitHub repository to Vercel
2. Set the root directory to `frontend`
3. Vercel will automatically detect the Vite framework
4. Set the build command to `npm run build`
5. Set the output directory to `dist`

### Environment Variables

No environment variables are required for the frontend. All configuration is handled through the Vite proxy in development and direct API calls in production.

## 🔐 Authentication

The application implements role-based authentication with three user types:
- **Student**: Access to job listings, applications, and profile management
- **Recruiter**: Access to job management, application review, and company profile
- **Admin**: Platform administration and user management

Authentication state is managed through localStorage with JWT tokens.

## 📱 Responsive Design

The application features a fully responsive design that works seamlessly across:
- Desktop computers
- Tablets
- Mobile devices

## 📄 License

This project is proprietary and all rights are reserved. See the [LICENSE](LICENSE) file for details.

---

© 2025 Seron Senapati. All rights reserved.