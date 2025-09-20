# PLACIFY Frontend

A modern job portal application built with React, Vite, and Tailwind CSS.

## Tech Stack
- React 18
- Vite
- Tailwind CSS
- React Router DOM
- Axios

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Deployment

This application can be deployed to various platforms:

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set the root directory to `frontend`
3. Vercel will automatically detect the Vite framework
4. Set the build command to `npm run build`
5. Set the output directory to `dist`

### Environment Variables
No environment variables are required for the frontend. All configuration is handled through the Vite proxy in development and direct API calls in production.

## Project Structure
```
src/
├── components/     # Reusable UI components
├── layouts/        # Page layouts
├── pages/          # Page components
├── routes/         # Routing configuration
├── services/       # API service layer
├── utils/          # Utility functions
├── App.jsx         # Main App component
├── main.jsx        # Entry point
└── index.css       # Global styles
```