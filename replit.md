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
- **File Upload System**: Multer-based API endpoints for project media uploads (icons, screenshots) with validation and cleanup.
- **Admin Panel**: Comprehensive `/admin` route with CRUD operations for project management, secured by Replit Auth and admin role.

### System Design
- **Monorepo Structure**: Shared TypeScript types and schemas for frontend and backend consistency.
- **Data Flow**: Client (React) -> API (React Query) -> Backend (Express.js) -> Database (Drizzle ORM).
- **Project Showcase**: Raycast-inspired design with dynamic scroll masking, individual project pages, filtering by technology and status, and different view modes.
- **Timeline Section**: Horizontal scrolling timeline for work experience, highlighting current position with dynamic centering and visual indicators.

## External Dependencies

### Frontend Dependencies
- **UI Libraries**: Radix UI primitives, Lucide React icons
- **Utilities**: clsx, date-fns

### Backend Dependencies
- **Database**: `@neondatabase/serverless`, Drizzle ORM (PostgreSQL dialect)
- **Session**: `connect-pg-simple`
- **Development**: `tsx`, `esbuild`

### Fonts and Assets
- **Typography**: Courier Prime (Google Fonts)
- **Icons**: Lucide React icon library