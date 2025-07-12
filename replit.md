# VentriLinks - Biotech Startup Capital Matchmaking Platform

## Overview

VentriLinks is a full-stack web application designed to connect early-stage biotech startups with venture capital investors through AI-powered matching. The platform serves as a modern landing page showcasing the service while providing functional waitlist signup capabilities for early access.

## System Architecture

The application follows a monorepo structure with clear separation between client, server, and shared components:

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: TailwindCSS with shadcn/ui component library
- **UI Components**: Radix UI primitives for accessibility and consistency
- **State Management**: TanStack Query for server state and form handling
- **Routing**: Wouter for lightweight client-side routing
- **Animations**: Framer Motion for smooth interactions

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ESM modules
- **Database**: PostgreSQL with Drizzle ORM
- **Cloud Database**: Neon Database (serverless PostgreSQL)
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **API Design**: RESTful endpoints with JSON responses

### Data Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema**: Shared TypeScript schemas using Drizzle-Zod integration
- **Migrations**: Automated database migrations via Drizzle Kit
- **Validation**: Zod schemas for runtime type validation

## Key Components

### Landing Page Sections
1. **Hero Section**: Compelling headline with call-to-action for early access
2. **How It Works**: Three-step process visualization with icons and animations
3. **Features**: Value proposition cards highlighting the AI-powered platform benefits
4. **Testimonials**: Social proof from founders and investors
5. **Waitlist**: Email signup form with real-time validation and confirmation
6. **Navigation**: Fixed header with smooth scrolling to sections

### API Endpoints
- `POST /api/waitlist`: Add email to waitlist with duplicate prevention
- `GET /api/waitlist/count`: Retrieve current waitlist subscriber count

### Database Schema
- **users**: Basic user management structure (prepared for future authentication)
- **waitlist_signups**: Email collection with timestamps for early access program

## Data Flow

1. **User Interaction**: Visitors interact with the landing page and submit emails
2. **Form Validation**: Client-side validation using React Hook Form and Zod schemas
3. **API Request**: TanStack Query handles API calls with optimistic updates
4. **Server Processing**: Express routes validate data and interact with database
5. **Database Operations**: Drizzle ORM manages PostgreSQL operations
6. **Response Handling**: Client updates UI with success/error states and toast notifications

## External Dependencies

### Core Dependencies
- **Database**: Neon Database (PostgreSQL-compatible serverless database)
- **UI Library**: shadcn/ui with Radix UI primitives
- **Styling**: TailwindCSS for utility-first styling
- **Validation**: Zod for schema validation
- **Animations**: Framer Motion for enhanced user experience

### Development Tools
- **TypeScript**: Full type safety across the stack
- **Vite**: Modern build tooling with hot module replacement
- **ESBuild**: Fast bundling for production server builds
- **Drizzle Kit**: Database schema management and migrations

## Deployment Strategy

### Development Environment
- **Dev Server**: Vite development server with Express API proxy
- **Database**: Neon Database with connection pooling
- **Hot Reloading**: Full-stack hot reload for rapid development

### Production Build
- **Client**: Vite builds optimized static assets to `dist/public`
- **Server**: ESBuild bundles Express server to `dist/index.js`
- **Environment**: Node.js production environment with PostgreSQL connection
- **Static Serving**: Express serves built client assets in production

### Database Management
- **Schema Deployment**: `drizzle-kit push` for schema synchronization
- **Connection**: Environment-based DATABASE_URL configuration
- **Migrations**: Tracked in `./migrations` directory

## Changelog

```
Changelog:
- July 04, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```