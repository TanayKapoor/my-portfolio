# Backend Documentation

This directory contains comprehensive documentation for the portfolio backend API.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Documentation Files](#documentation-files)
4. [Quick Start](#quick-start)

## Overview

The backend is built with:
- **Express.js** - Web framework
- **TypeScript** - Type-safe development
- **Drizzle ORM** - Database operations
- **Neon PostgreSQL** - Serverless database
- **Passport.js** - Authentication
- **Multer** - File uploads
- **Zod** - Schema validation

## Architecture

```
server/
├── index.ts           # Express server initialization
├── routes.ts          # API route definitions
├── auth.ts            # Authentication logic
├── storage.ts         # Database access layer
├── db.ts             # Database connection
├── objectStorage.ts   # File storage handling
├── vite.ts           # Vite dev server integration
└── seed.ts           # Database seeding
```

### Data Flow

```
Client Request
    ↓
Express Route Handler
    ↓
Authentication Middleware (if required)
    ↓
Zod Schema Validation
    ↓
Storage Layer (storage.ts)
    ↓
Drizzle ORM → PostgreSQL Database
    ↓
Response to Client
```

## Documentation Files

- **[API Routes](./api-routes.md)** - Complete API endpoint reference
- **[Authentication](./authentication.md)** - Auth system documentation
- **[Database & Storage](./database-storage.md)** - Database schema and operations
- **[File Uploads](./file-uploads.md)** - File upload system documentation

## Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)
- Environment variables configured

### Environment Variables

Create a `.env` file:

```bash
DATABASE_URL=postgresql://user:password@host/database
SESSION_SECRET=your-secret-key-here
```

### Running the Server

```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Core Concepts

### Authentication

Uses Passport.js with local strategy:
- Session-based authentication
- Bcrypt password hashing
- Admin role support
- Protected routes via middleware

### Validation

All API inputs validated using Zod schemas from `@shared/schema`:
- Type-safe data validation
- Automatic error messages
- Schema reuse across frontend/backend

### Storage Layer

Abstract interface (`IStorage`) with database implementation:
- Clean separation of concerns
- Easy to swap storage backends
- Consistent error handling
- Type-safe operations

### File Management

Supports two storage modes:
- Object storage (Replit Object Storage)
- Local filesystem (fallback)
- Image upload with validation
- Automatic content-type detection

## Security Features

- CSRF protection via session cookies
- Password hashing with bcrypt
- Role-based access control (Admin/User)
- SQL injection prevention (Drizzle ORM)
- File type validation
- File size limits (10MB)

## API Response Format

### Success Response

```json
{
  "data": { ... },
  "message": "Success message"
}
```

### Error Response

```json
{
  "error": "Error description",
  "details": [ ... ]  // Optional validation errors
}
```

## Development Tools

- **TypeScript** - Run `npm run check` for type checking
- **Drizzle Kit** - Database migrations with `npm run db:push`
- **Hot Reload** - Automatic restart on file changes
- **API Logging** - Request/response logging in development

## Related Documentation

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Express.js Guide](https://expressjs.com/)
- [Passport.js Documentation](http://www.passportjs.org/)
