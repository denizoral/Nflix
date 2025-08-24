# DotByte - Video Streaming Platform

## Overview

DotByte is a modern video streaming platform built with a full-stack architecture. The application provides movie streaming capabilities with an admin dashboard for content management, file uploads, and download management. It features a Netflix-style user interface with custom themes and a comprehensive backend API for movie management and analytics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Components**: Radix UI with shadcn/ui component library for consistent design
- **Styling**: Tailwind CSS with custom CSS variables for theming support
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Theme System**: Custom theme context supporting multiple themes (dark, material, matrix, flat)

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured route handling
- **File Handling**: Multer for video file uploads with size and type validation
- **Storage Interface**: Abstracted storage layer with in-memory implementation (easily replaceable with database)
- **Development**: Vite integration for hot module replacement in development

### Data Storage Solutions
- **Database ORM**: Drizzle ORM configured for PostgreSQL
- **Schema Design**: 
  - Users table with admin role support
  - Movies table with metadata (title, description, file paths, views, ratings)
  - Analytics table for tracking user viewing behavior
  - Downloads table for managing external content downloads
- **File Storage**: Local file system with configurable movie directory
- **Session Management**: Express sessions with PostgreSQL store support

### Authentication and Authorization
- **User System**: Basic user authentication with admin role differentiation
- **Session Management**: Server-side sessions with PostgreSQL backing
- **Admin Protection**: Route-level protection for administrative functions

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Neon database connector for PostgreSQL
- **drizzle-orm** and **drizzle-kit**: Database ORM and migration toolkit
- **@tanstack/react-query**: Server state management and caching
- **express**: Web framework for the backend API
- **multer**: File upload middleware for video processing

### UI and Styling Dependencies
- **@radix-ui/***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant styling
- **lucide-react**: Icon library for consistent iconography

### Development and Build Tools
- **vite**: Fast build tool and development server
- **typescript**: Type safety across the entire stack
- **esbuild**: Fast JavaScript bundler for production builds
- **tsx**: TypeScript execution for development

### Third-party Services
- **Replit Integration**: Custom plugins for Replit development environment
- **Google Fonts**: External font loading for typography
- **Unsplash**: Placeholder images for movie thumbnails and backgrounds

The architecture emphasizes modularity, type safety, and developer experience while maintaining the flexibility to scale from the current in-memory storage to a full database implementation.