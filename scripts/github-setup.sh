#!/bin/bash

# GitHub Repository Setup Script for Chicago Health Data Platform
# This script helps set up the repository on GitHub with proper configuration

set -e

echo "🚀 Setting up Chicago Health Data Platform for GitHub..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Check if GitHub CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) is not installed"
    echo "Please install it from: https://cli.github.com/"
    echo "Or manually create the repository on GitHub"
    exit 1
fi

# Set up .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "📝 Creating .gitignore file..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*

# Production builds
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Database
*.db
*.sqlite
*.sqlite3

# IDE files
.vscode/
.idea/

# OS files
.DS_Store
Thumbs.db

# Logs
logs
*.log

# Replit specific
.replit
replit.nix
.config/
.upm/
EOF
    echo "✅ .gitignore created"
fi

# Add all files to git
echo "📦 Adding files to Git..."
git add .

# Check if there are any changes to commit
if git diff --staged --quiet; then
    echo "✅ No changes to commit"
else
    echo "💾 Committing initial files..."
    git commit -m "Initial commit: Chicago Health Data Platform

- Added comprehensive React/TypeScript health mapping application
- Integrated authentic 2020 Census data for Chicago
- Implemented 8 health condition visualizations
- Added three geographic view levels (census tracts, community areas, wards)
- Included production-ready deployment configuration
- Added comprehensive documentation and GitHub workflows"
    echo "✅ Initial commit created"
fi

# Get repository name
REPO_NAME=${1:-"chicago-health-data-platform"}

# Create GitHub repository
echo "🌐 Creating GitHub repository: $REPO_NAME"
if gh repo create "$REPO_NAME" --public --description "A sophisticated geospatial health analytics platform that transforms complex Chicago public health data into accessible, engaging visual insights for community-level understanding." --clone=false; then
    echo "✅ GitHub repository created successfully"
else
    echo "⚠️  Repository might already exist or there was an error"
fi

# Add remote origin
echo "🔗 Adding remote origin..."
git remote remove origin 2>/dev/null || true
git remote add origin "https://github.com/$(gh api user --jq .login)/$REPO_NAME.git"

# Push to GitHub
echo "📤 Pushing to GitHub..."
git branch -M main
if git push -u origin main; then
    echo "✅ Successfully pushed to GitHub"
else
    echo "❌ Failed to push to GitHub"
    exit 1
fi

# Set up repository settings
echo "⚙️  Configuring repository settings..."

# Enable GitHub Pages (if desired)
# gh repo edit --enable-pages --pages-source-branch main --pages-source-path /

# Set repository topics
gh repo edit --add-topic healthcare
gh repo edit --add-topic mapping
gh repo edit --add-topic chicago
gh repo edit --add-topic geospatial
gh repo edit --add-topic public-health
gh repo edit --add-topic react
gh repo edit --add-topic typescript
gh repo edit --add-topic data-visualization

echo "🏷️  Repository topics added"

# Create initial release
echo "🎁 Creating initial release..."
if gh release create v1.0.0 --title "Initial Release - Chicago Health Data Platform v1.0.0" --notes "First production release of the Chicago Health Data Platform featuring comprehensive health condition mapping across Chicago's census tracts, community areas, and alderman wards.

## Features
- Interactive mapping of 8 major health conditions
- Authentic 2020 Census data integration
- Three geographic visualization levels
- Production-ready deployment configuration
- Comprehensive API and documentation

## Health Conditions
- Diabetes, Hypertension, Asthma, Obesity
- Heart Disease, Stroke, COPD, Mental Health

## Quick Start
1. Clone the repository
2. Install dependencies: \`npm install\`
3. Set up environment variables
4. Run: \`npm run dev\`

See README.md for detailed setup instructions."; then
    echo "✅ Initial release created"
else
    echo "⚠️  Could not create release (this is optional)"
fi

echo ""
echo "🎉 GitHub setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Visit your repository: https://github.com/$(gh api user --jq .login)/$REPO_NAME"
echo "2. Configure repository secrets for CI/CD:"
echo "   - MAPBOX_ACCESS_TOKEN: Your Mapbox API token"
echo "   - DATABASE_URL: PostgreSQL connection string"
echo "3. Set up deployment (see DEPLOYMENT.md for options)"
echo "4. Invite collaborators if needed"
echo ""
echo "🚀 Your Chicago Health Data Platform is now ready for the world!"