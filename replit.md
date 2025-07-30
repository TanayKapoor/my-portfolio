# replit.md

## Overview

This is a personal portfolio website for Tanay, a Full Stack Machine Learning Engineer. The application is built as a modern single-page application with a React frontend and Express.js backend, featuring a typewriter animation, halftone hero section, professional portfolio presentation, and an advanced projects showcase section with Raycast-inspired design.

**Current Status**: Successfully migrated from Replit Agent to standard Replit environment with PostgreSQL database integration. The portfolio website now dynamically loads project data from the database while preserving the original Raycast-style UI design.

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
- **AboutSection**: Portfolio about section with intersection observer animations and TL;DR toggle with scroll detection
- **ProjectsSection**: Advanced projects showcase with Raycast-inspired design, dynamic scroll masking, and navigation controls
- **UI Components**: Comprehensive Shadcn/ui component library including buttons, cards, forms, dialogs, etc.

### Projects Section Features (July 29, 2025)
- **Dynamic Scroll Masking**: Intelligent blur effects that adapt to scroll position (right at start, both sides in middle, left at end)
- **Project Cards**: 6 unique project cards with color-themed backgrounds and visual representations
- **Hover Animations**: Subtle neon glow effects matching each project's color theme with optimized performance
- **Scroll Controls**: Circular navigation buttons for smooth horizontal scrolling through projects
- **Responsive Design**: Horizontal scroll layout with proper touch and mouse interactions

### TL;DR Enhancement (July 29, 2025)
- **Smart Scroll Detection**: TL;DR automatically disables when user scrolls significantly (300px threshold)
- **Accumulated Distance Tracking**: Prevents false triggers from small scrolls within sections
- **Performance Optimized**: Uses passive scroll listeners with proper cleanup

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

## Recent Changes (July 30, 2025)

### Comprehensive Projects Page Implementation
- **New Dedicated Page**: Created `/projects` route with complete project showcase and WebGL background
- **WebGL Animation**: Integrated anomality shader animation as immersive animated background
- **Advanced Filtering**: Added technology, status, and search-based filtering capabilities
- **View Modes**: Implemented grid and list view toggle for different browsing preferences
- **Navigation Enhancement**: Added "View All Projects" button from home page projects section
- **Bug Fix**: Fixed TypeError in projects section component for undefined project titles
- **Components Created**: 
  - WebGLAnimation component with React lifecycle management and mouse interaction
  - Responsive project cards with hover effects and external links
  - Advanced filter controls with dropdown selectors and search functionality

### Database Migration Complete
- **PostgreSQL Integration**: Migrated from hardcoded project data to PostgreSQL database with Drizzle ORM
- **API Endpoints**: Created Express.js API with full CRUD operations for projects (/api/projects)
- **Data Migration**: Successfully seeded database with 6 existing projects maintaining all original content
- **UI Preservation**: Maintained original Raycast-style project cards design while enabling dynamic data loading
- **Type Safety**: Updated TypeScript interfaces to match database schema with proper validation

### Admin Panel Implementation
- **Admin Interface**: Created comprehensive admin panel at `/admin` route for project management
- **Password Protection**: Secured admin panel with password authentication (password: "admin123")
- **CRUD Operations**: Full create, read, update, delete functionality for projects via web interface
- **Form Validation**: Integrated form handling with proper validation and error states
- **UI Components**: Built with Shadcn/ui components maintaining dark theme consistency
- **Real-time Updates**: Admin changes immediately reflect on main portfolio using React Query cache invalidation
- **Session Management**: Login/logout functionality with secure access control

### Technical Implementation
- Database schema includes: title, description, technologies[], features[], challenges[], results[], duration, role, status, demoUrl, githubUrl, colorTheme, order
- React Query integration for efficient API state management and caching
- Proper error handling and loading states throughout the application
- Individual project detail pages now fetch data dynamically from database
- Admin panel features tabbed interface, form validation, and immediate feedback on operations

## Previous Changes (July 29, 2025)

### Project Detail Page Implementation
- **New Page**: Created comprehensive project detail pages accessible via `/project/{id}` routes
- **Navigation**: Updated projects section cards to be clickable links to individual project pages
- **Features**: Each project detail page includes:
  - Project overview with duration, role, and status
  - Categorized technology stack badges
  - Key features with descriptive icons
  - Challenges and solutions section
  - Measurable results and achievements
  - External links to demos and source code
- **Design**: Maintained consistent dark theme with gradient borders and Framer Motion animations
- **Data**: Added complete project information for all 6 portfolio projects

### Projects Section Implementation
- Implemented horizontal scrolling project cards with Raycast-inspired dark theme
- Added dynamic masking system for scroll boundaries with intelligent blur detection
- Created 6 unique project cards with individual color theming and visual representations
- Optimized hover animations for smooth performance (removed laggy effects)
- Added circular scroll control buttons with state management for navigation

### User Experience Enhancements
- Enhanced TL;DR functionality with scroll-based auto-disable feature
- Improved spacing and alignment for "View more" section
- Implemented smooth scrolling with proper distance-based detection
- Added will-change CSS properties for better animation performance

### Technical Improvements
- Used intersection observers for scroll boundary detection
- Implemented passive scroll listeners for optimal performance  
- Added proper cleanup for event listeners and timeouts
- Optimized CSS animations with cubic-bezier easing

## Checkpoint: Projects Section Complete
All major features for the projects section have been implemented and optimized. Ready to proceed with next sections or features.

## Timeline Section Development (July 29, 2025)
- Created horizontal scrolling timeline showing work experience chronologically
- Current position (Full Stack ML Engineer) highlighted with green glow and animations
- Past experiences arranged from left (oldest) to right (current)
- Auto-centering functionality to display current position in viewport center
- Enhanced visual indicators with gradient timeline line and pulsing dots
- Responsive padding and masking for professional presentation
- Timeline dots positioned above cards without overlapping
- Timeline line design updated: solid line up to current position, then dotted line with arrow
- Only current position dot shows active green styling
- Improved scroll initialization with additional offset for perfect centering
- Timeline no longer extends to screen edge - ends with arrow after current position