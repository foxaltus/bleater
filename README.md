# Bleater

A Twitter-like microblogging application where users can scream angry messages, like posts, and argue with other users. Built with React, TypeScript, and Supabase.

![Bleater Logo](/public/logo.png)

## Features

- User authentication (sign up, sign in, sign out)
- Create and view posts
- Like/unlike posts
- Optimistic UI updates for a smooth user experience
- User profiles
- Responsive design

## Architecture

### Frontend

- **React 18.3** with TypeScript for the UI
- **Vite** for fast development and optimized builds
- **React Query (TanStack Query)** for data fetching, caching, and state management
- **CSS modules** for component styling

### Backend

- **Supabase** for backend services:
  - Authentication & User Management
  - PostgreSQL Database
  - Row-level Security Policies

### Database Schema

- **post**: Stores user posts with message content and creation timestamp
- **profiles**: Contains user profile information
- **likes**: Junction table to track post likes by users

## Getting Started

### Prerequisites

- Node.js (v16 or newer)
- pnpm (preferred) or npm

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/bleater.git
   cd bleater
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Create a `.env.local` file in the root directory with your Supabase credentials:

   ```
   VITE_SUPABASE_URL=https://xwpazbmcghdjsygjluqs.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3cGF6Ym1jZ2hkanN5Z2psdXFzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4Mzg1OTcsImV4cCI6MjA2NjQxNDU5N30.5BYCp5TB4haOzin3bwJXS6xzx3WzqR-t1qrqtvWrRM8
   ```

### Running the App

1. Start the development server:

   ```bash
   pnpm dev
   ```

2. Open your browser and navigate to:
   ```
   http://localhost:5173
   ```

### Building for Production

```bash
pnpm build
```

The build output will be in the `dist` directory.

## Deployment

You can deploy the application to any static hosting service like Vercel, Netlify, or GitHub Pages.

Example deployment with Vercel:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel
```

## License

MIT
