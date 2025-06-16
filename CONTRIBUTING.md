# Contributing to Chicago Health Data Platform

Thank you for your interest in contributing to the Chicago Health Data Platform! This guide will help you get started.

## Code of Conduct

This project adheres to a code of conduct that promotes a welcoming and inclusive environment for all contributors.

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL
- Git
- Basic knowledge of React, TypeScript, and Express.js

### Development Setup

1. Fork the repository
2. Clone your fork:
```bash
git clone https://github.com/yourusername/chicago-health-data-platform.git
cd chicago-health-data-platform
```

3. Install dependencies:
```bash
npm install
```

4. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

5. Initialize the database:
```bash
npm run db:push
```

6. Start development server:
```bash
npm run dev
```

## Project Structure

```
├── client/src/           # React frontend
│   ├── components/       # Reusable UI components
│   ├── pages/           # Route components
│   ├── lib/             # Utilities and helpers
│   └── hooks/           # Custom hooks
├── server/              # Express backend
│   ├── data/            # Geographic data files
│   ├── routes.ts        # API route definitions
│   └── storage.ts       # Database operations
├── shared/              # Shared types and schemas
│   └── schema.ts        # Database schema and types
└── scripts/             # Testing and validation scripts
```

## Development Guidelines

### Code Style

- Use TypeScript for all new code
- Follow existing code formatting (Prettier configured)
- Use meaningful variable and function names
- Add JSDoc comments for complex functions

### Frontend Development

- Use React functional components with hooks
- Implement proper error boundaries
- Follow responsive design principles
- Use Tailwind CSS for styling
- Implement proper loading states

### Backend Development

- Use Express.js with TypeScript
- Implement proper error handling
- Use Drizzle ORM for database operations
- Validate input with Zod schemas
- Follow RESTful API conventions

### Database Changes

1. Update `shared/schema.ts` with new schema definitions
2. Use `npm run db:push` to apply changes
3. Test thoroughly in development
4. Document any breaking changes

## Testing

### Running Tests

```bash
# Run validation tests
node deployment-validation.js

# Run specific test suites
node production-readiness-test.js
node epidemiological-bounds-validation.js
```

### Adding Tests

- Create test files in the root directory with descriptive names
- Use the existing testing patterns for API validation
- Test both success and error scenarios
- Include edge cases and boundary conditions

## Adding New Features

### Health Conditions

To add a new health condition:

1. Update `shared/schema.ts`:
```typescript
// Add new fields to census tract schema
newConditionCount: integer('new_condition_count').default(0),
newConditionRate: real('new_condition_rate').default(0),
```

2. Update data generation in `server/chicago-data-loader.ts`
3. Add UI controls in `client/src/components/MapContainer.tsx`
4. Update color scaling and visualization logic

### Geographic Views

To add a new geographic aggregation level:

1. Add boundary data file to `server/data/`
2. Update data loading logic in `server/chicago-data-loader.ts`
3. Add API endpoint in `server/routes.ts`
4. Update frontend controls and mapping

## Pull Request Process

1. Create a feature branch from `main`:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes following the guidelines above
3. Test thoroughly:
```bash
npm run check  # Type checking
npm run build  # Build verification
```

4. Commit with descriptive messages:
```bash
git commit -m "Add new health condition visualization for mental health"
```

5. Push to your fork:
```bash
git push origin feature/your-feature-name
```

6. Create a pull request with:
   - Clear description of changes
   - Screenshots for UI changes
   - Test results
   - Breaking changes (if any)

### Pull Request Review

- All PRs require review before merging
- Address feedback promptly
- Keep PRs focused and atomic
- Update documentation as needed

## Data Integrity Requirements

- All health data must use authentic sources
- Census data must align with official Census Bureau formats
- Geographic boundaries must use official municipal data
- No synthetic or mock data in production code

## Performance Considerations

- Optimize database queries for large datasets
- Implement proper caching strategies
- Consider map rendering performance with large feature sets
- Test with production-scale data

## Documentation

- Update README.md for new features
- Add JSDoc comments for complex functions
- Update API documentation for new endpoints
- Include migration guides for breaking changes

## Getting Help

- Check existing issues and discussions
- Create detailed issue reports with reproduction steps
- Join our community discussions
- Ask questions in pull request comments

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Annual contributor acknowledgments

Thank you for contributing to better health data visualization for Chicago communities!