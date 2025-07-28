# replit.md

## Overview

This is a personal portfolio website for Tanay, a Full Stack Machine Learning Engineer. The application is built as a modern single-page application with a React frontend and Express.js backend, featuring a typewriter animation, halftone hero section, and professional portfolio presentation.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and building
- **Routing**: Wouter for lightweight client-side routing
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack React Query for server state management
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Session Management**: Connect-pg-simple for PostgreSQL session storage
- **Development**: Hot reloading with Vite integration

## Key Components

### Frontend Components
- **HalftoneHero**: Main hero section with halftone background effect and profile display
- **Typewriter**: Animated typewriter effect for greeting messages
- **AboutSection**: Portfolio about section with intersection observer animations
- **UI Components**: Comprehensive Shadcn/ui component library including buttons, cards, forms, dialogs, etc.

### Backend Components
- **Routes**: Express.js route handlers (currently minimal setup)
- **Storage**: Abstract storage interface with in-memory implementation (ready for database integration)
- **Vite Integration**: Development server setup with HMR support

### Database Schema
- **Users Table**: Basic user management with id, username, and password fields
- **Drizzle ORM**: Type-safe database operations with schema validation

## Data Flow

1. **Client Requests**: React application handles routing and UI state
2. **API Communication**: TanStack React Query manages server communication
3. **Backend Processing**: Express.js handles API requests and business logic
4. **Database Operations**: Drizzle ORM provides type-safe database interactions
5. **Session Management**: PostgreSQL-backed session storage for user authentication

## External Dependencies

### Frontend Dependencies
- **UI Libraries**: Radix UI primitives, Lucide React icons
- **Animation**: Custom CSS animations and transitions
- **Utilities**: clsx for conditional classes, date-fns for date handling
- **Development**: Replit-specific plugins for development environment

### Backend Dependencies
- **Database**: @neondatabase/serverless for serverless PostgreSQL connection
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Session**: connect-pg-simple for session management
- **Development**: tsx for TypeScript execution, esbuild for production builds

### Fonts and Assets
- **Typography**: Courier Prime font from Google Fonts for coding aesthetic
- **Images**: Placeholder profile image from Unsplash
- **Icons**: Lucide React icon library

## Deployment Strategy

### Build Process
1. **Frontend Build**: Vite builds React application to `dist/public`
2. **Backend Build**: esbuild bundles server code to `dist/index.js`
3. **Database**: Drizzle migrations deployed to PostgreSQL database

### Environment Configuration
- **Development**: Local development with hot reloading via Vite
- **Production**: Node.js server serving static files and API routes
- **Database**: PostgreSQL connection via DATABASE_URL environment variable

### Scripts
- `npm run dev`: Development server with hot reloading
- `npm run build`: Production build for both frontend and backend
- `npm run start`: Production server startup
- `npm run db:push`: Deploy database schema changes

The application is structured as a monorepo with shared TypeScript types and schemas, making it easy to maintain consistency between frontend and backend while supporting rapid development and deployment.