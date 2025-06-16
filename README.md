# Chicago Health Data Platform

A sophisticated geospatial health analytics platform that transforms complex Chicago public health data into accessible, engaging visual insights for community-level understanding.

![Chicago Health Data Platform](https://img.shields.io/badge/Status-Production%20Ready-green)
![License](https://img.shields.io/badge/License-MIT-blue)
![Node.js](https://img.shields.io/badge/Node.js-20+-brightgreen)
![React](https://img.shields.io/badge/React-18+-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-blue)

## 🌟 Features

- **Interactive Disease Mapping**: Visualize 8 major health conditions across Chicago census tracts, community areas, and alderman wards
- **Real-time Data Analysis**: Authentic 2020 Census data with health disparity patterns
- **Advanced Geospatial Visualization**: Mapbox GL JS powered interactive maps with dynamic color scaling
- **Health Equity Focus**: Designed to highlight health disparities across Chicago neighborhoods
- **Responsive Design**: Modern UI with dark/light mode support
- **Production Ready**: Comprehensive error handling and API validation

## 🏥 Health Conditions Tracked

- Diabetes (Type 2)
- Hypertension
- Asthma
- Obesity
- Heart Disease
- Stroke
- COPD
- Mental Health

## 🗺️ Geographic Coverage

- **Census Tracts**: 1,972 detailed geographic units
- **Community Areas**: 77 traditional Chicago neighborhoods
- **Alderman Wards**: 50 political districts

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- PostgreSQL database
- Mapbox account (for map tiles)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/chicago-health-data-platform.git
cd chicago-health-data-platform
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file:
```env
DATABASE_URL=your_postgresql_connection_string
MAPBOX_ACCESS_TOKEN=your_mapbox_token
NODE_ENV=development
```

5. Initialize the database:
```bash
npm run db:push
```

6. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Mapbox GL JS** for interactive mapping
- **Tailwind CSS** for styling
- **Radix UI** components
- **TanStack Query** for data fetching
- **Wouter** for routing

### Backend
- **Express.js** API server
- **Drizzle ORM** for database operations
- **PostgreSQL** for data storage
- **Authentic Census API** integration
- **Comprehensive health data modeling**

### Data Pipeline
- Real-time Census Bureau API integration
- Health disparity pattern generation
- Spatial data aggregation
- Geographic boundary processing

## 📊 API Endpoints

### Health Data
- `GET /api/chicago-areas/:view` - Get geographic health data
  - Views: `census`, `community`, `wards`
  - Returns GeoJSON with health statistics

### System
- `GET /api/health-check` - System health status
- `GET /api/status` - Detailed system information

## 🧪 Testing & Validation

The project includes comprehensive testing scripts:

```bash
# Run all validation tests
node deployment-validation.js

# Test specific components
node production-readiness-test.js
node epidemiological-bounds-validation.js
node health-disparity-validation.js
```

## 🚀 Deployment

### Replit Deployment (Recommended)
1. Import project to Replit
2. Configure environment variables in Replit Secrets
3. Click Deploy button
4. Your app will be live at `yourapp.replit.app`

### Manual Deployment
1. Build the application:
```bash
npm run build
```

2. Start production server:
```bash
npm start
```

### Docker Deployment
```bash
docker build -t chicago-health-platform .
docker run -p 5000:5000 chicago-health-platform
```

## 🛠️ Development

### Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Route pages
│   │   └── lib/           # Utilities
├── server/                # Express backend
│   ├── data/              # Geographic data files
│   ├── routes.ts          # API routes
│   └── storage.ts         # Database operations
├── shared/                # Shared types and schemas
└── scripts/               # Validation and testing
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run check` - Type checking
- `npm run db:push` - Update database schema

### Adding New Health Conditions

1. Update `shared/schema.ts` with new disease fields
2. Modify data generation in `server/chicago-data-loader.ts`
3. Update frontend UI in `client/src/components/MapContainer.tsx`
4. Run `npm run db:push` to update database

## 📈 Data Sources

- **US Census Bureau API**: Official 2020 Census demographic data
- **Chicago Data Portal**: Municipal boundary files
- **CDC Guidelines**: Health condition prevalence patterns
- **NIH Research**: Epidemiological bounds validation

## 🔒 Security

- Environment variable protection
- Input validation with Zod schemas
- CORS configuration
- Rate limiting ready
- SQL injection prevention

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Chicago Department of Public Health
- US Census Bureau
- Mapbox for mapping services
- Replit for hosting platform

## 📞 Support

For support, email support@your-domain.com or create an issue in this repository.

---

**Built with ❤️ for Chicago community health awareness**