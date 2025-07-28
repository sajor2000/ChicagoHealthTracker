# Chicago Health Data Platform

## Overview

This is a sophisticated geospatial health analytics platform that transforms Chicago public health data into accessible visual insights. The application provides interactive mapping of 8 major health conditions across Chicago using three geographic visualization levels: Census Tracts, Community Areas, and Alderman Wards. Built with authentic 2020 Census data integration covering 1,972 census tracts, the platform focuses on health equity and disparity visualization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for responsive styling with dark/light mode support
- **Mapbox GL JS** for interactive geospatial visualization
- **Radix UI** components for accessible UI elements
- **React Query (TanStack)** for data fetching and caching

### Backend Architecture
- **Express.js** API server with TypeScript
- **Drizzle ORM** for type-safe database operations
- **PostgreSQL** for data persistence and spatial queries
- RESTful API design with comprehensive error handling
- Session management with connect-pg-simple

### Data Storage Solutions
- **PostgreSQL database** with normalized schema for census tract data
- **GeoJSON files** for geographic boundaries stored in server/data/
- **Drizzle schema** defining census tracts, race, ethnicity, housing, and age demographics
- In-memory caching for frequently accessed geographic data

## Key Components

### Geographic Data Management
- **Census Tracts**: 1,972 detailed geographic units with authentic 2020 Census boundaries
- **Community Areas**: 77 traditional Chicago neighborhoods 
- **Alderman Wards**: 50 political districts with current boundaries
- Boundary extension utilities to handle Lake Michigan shoreline gaps

### Health Data Integration
- **8 Tracked Conditions**: Diabetes, Hypertension, Asthma, Obesity, Heart Disease, Stroke, COPD, Mental Health
- **ICD-10 Code Mapping**: Proper medical coding for each condition
- **Dual Visualization Modes**: Both raw counts and population-adjusted rates per 1,000 residents
- Epidemiologically sound disease prevalence generation based on national CDC data

### Interactive Mapping System
- **Mapbox GL JS** integration with custom layer management
- **Dynamic color scaling** that adjusts based on data distribution for each disease
- **Enhanced disparity visualization** with proper north side (green) to south/west (red) patterns
- Real-time layer switching between geographic views and health conditions

## Data Flow

1. **Data Loading**: Server loads GeoJSON boundaries and demographic data on startup
2. **API Endpoints**: Express routes serve processed data as GeoJSON FeatureCollections
3. **Client Requests**: React components fetch data via API endpoints
4. **Map Rendering**: Mapbox processes GeoJSON and applies dynamic styling
5. **User Interaction**: UI controls trigger new API requests and map layer updates

### Key API Endpoints
- `/api/health-check` - Server health monitoring
- `/api/chicago-areas/census` - Census tract level data
- `/api/chicago-areas/community` - Community area aggregated data  
- `/api/chicago-areas/wards` - Ward level aggregated data
- `/api/debug/status` - Data loading status and diagnostics

## External Dependencies

### Map Services
- **Mapbox GL JS** (v2.15.0) for interactive mapping
- Mapbox access token required for map tiles and styling

### Data Sources
- **US Census Bureau API** integration for authentic demographic data
- **Chicago Data Portal** for municipal boundary data
- Local GeoJSON files for geographic boundaries

### Development Tools
- **Drizzle Kit** for database schema management and migrations
- **ESBuild** for server-side bundling in production
- **Node.js 20+** runtime requirement

## Deployment Strategy

### Production Configuration
- **Environment Variables**: DATABASE_URL, MAPBOX_ACCESS_TOKEN, SESSION_SECRET
- **Build Process**: Vite builds client, ESBuild bundles server
- **Database Setup**: PostgreSQL with Drizzle schema initialization
- **Asset Serving**: Static files served from dist/public

### Replit Deployment (Recommended)
- Pre-configured with .replit and replit.nix files
- Automatic HTTPS and custom domain support
- Secrets management through Replit environment
- One-click deployment from GitHub integration

### Alternative Deployments
- **Docker support** with multi-stage builds
- **Manual server deployment** with Node.js and PostgreSQL
- **CI/CD pipeline** configured via GitHub Actions

### Performance Considerations
- **Data caching** in memory for frequently accessed geographic data
- **Optimized GeoJSON** with simplified geometries for faster rendering
- **Lazy loading** of map layers to improve initial load times
- **Database indexing** on GEOID fields for fast spatial queries

The application is production-ready with comprehensive error handling, health check endpoints, and extensive validation throughout the data pipeline.