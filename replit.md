# replit.md

## Overview

This is a personal portfolio website for Tanay, a Full Stack Machine Learning Engineer. The application is a modern single-page application with a React frontend and Express.js backend, featuring a typewriter animation, halftone hero section, professional portfolio presentation, and an advanced projects showcase section with a Raycast-inspired design. The project aims to dynamically load data from a PostgreSQL database while maintaining a high-fidelity UI.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: Wouter
- **UI Components**: Shadcn/ui and Radix UI
- **Styling**: Tailwind CSS with custom CSS variables
- **State Management**: TanStack React Query
- **Form Handling**: React Hook Form with Zod validation
- **Key Components**: HalftoneHero, Typewriter, AboutSection (with intersection observer animations and TL;DR toggle), ProjectsSection (with dynamic scroll masking, project cards, hover animations, scroll controls), WebGL background animations, responsive design.

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM, hosted on Neon Database
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **Authentication**: Internal authentication system with username/password login, bcrypt password hashing, Express sessions, and role-based admin access control. Replaces external Replit OAuth for enhanced security.
- **File Upload System**: Multer-based API endpoints for project media uploads (icons, hero images, screenshots) with Replit Object Storage for persistent image storage across deployments.
- **Admin Panel**: Comprehensive `/admin` route with CRUD operations for project management, secured by Replit Auth and admin role.

### System Design
- **Monorepo Structure**: Shared TypeScript types and schemas for frontend and backend consistency.
- **Data Flow**: Client (React) -> API (React Query) -> Backend (Express.js) -> Database (Drizzle ORM).
- **Project Showcase**: Raycast-inspired design with dynamic scroll masking, individual project pages, filtering by technology and status, and different view modes.
- **Timeline Section**: Horizontal scrolling timeline for work experience, highlighting current position with dynamic centering and visual indicators.

## Deployment Configuration

### Production Build Process
- **Build Command**: `npm run build` - Creates optimized production build in `dist/` directory
- **Start Command**: `npm start` - Runs production server with static file serving
- **Build Output**: 
  - Frontend assets: `dist/public/` (served by Express in production)
  - Backend bundle: `dist/index.js` (ES module format)

### Deployment Fix Required
The `.replit` file needs manual adjustment for successful deployment:

**Current Issue**: Main run command uses development mode
```
run = "npm run dev"  # ← This causes deployment failure
```

**Required Fix**: Change to production mode
```
run = "npm start"    # ← Change this manually in .replit file
```

**Note**: The deployment section already has correct configuration:
- `build = "npm run build"`
- `run = "npm start"`

But the main `run` command needs to match for deployment success.

### Port Configuration
- Development: Port 5000 (Express + Vite dev server)
- Production: Port 5000 (Express serving static files)
- Environment: `PORT=5000` (required for Replit hosting)

## External Dependencies

### Frontend Dependencies
- **UI Libraries**: Radix UI primitives, Lucide React icons
- **Utilities**: clsx, date-fns

### Backend Dependencies
- **Database**: `@neondatabase/serverless`, Drizzle ORM (PostgreSQL dialect)
- **Session**: `connect-pg-simple`
- **File Storage**: `@replit/object-storage` for persistent image storage
- **Development**: `tsx`, `esbuild`

## Recent Changes

### Image Storage Migration (August 2025)
**Issue**: Images were being lost during redeployments because they were stored in the local filesystem's `uploads/` directory, which gets rebuilt on each deployment.

**Solution**: Migrated to Replit Object Storage for persistent image storage:
- **Backend Changes**:
  - Added `server/objectStorage.ts` with Object Storage client and utility functions
  - Updated Multer configuration to use memory storage instead of disk storage
  - Modified all upload routes (`/upload-icon`, `/upload-hero`, `/upload-screenshots`) to use Object Storage
  - Updated deletion routes to remove files from Object Storage
  - Added `/api/files/:filename` route to serve images from Object Storage
- **Storage Cost**: $0.03/GiB/month + $0.10/GiB data transfer + request fees
- **Benefits**: Images now persist across all deployments and redeploys

### Fonts and Assets
- **Typography**: Courier Prime (Google Fonts)
- **Icons**: Lucide React icon library