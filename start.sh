#!/bin/bash

# CTNFT Project Startup Script
# Usage: ./start.sh [options]
# Options:
#   --clean-modules    Remove node_modules and reinstall dependencies
#   --clean-db         Reset database (WARNING: This will delete all data)
#   --help            Show this help message

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default options
CLEAN_MODULES=false
CLEAN_DB=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --clean-modules)
      CLEAN_MODULES=true
      shift
      ;;
    --clean-db)
      CLEAN_DB=true
      shift
      ;;
    --help)
      echo "CTNFT Project Startup Script"
      echo ""
      echo "Usage: ./start.sh [options]"
      echo ""
      echo "Options:"
      echo "  --clean-modules    Remove node_modules and reinstall dependencies"
      echo "  --clean-db         Reset database (WARNING: This will delete all data)"
      echo "  --help            Show this help message"
      echo ""
      echo "Examples:"
      echo "  ./start.sh                    # Standard startup"
      echo "  ./start.sh --clean-modules    # Clean install and start"
      echo "  ./start.sh --clean-db         # Reset database and start"
      echo "  ./start.sh --clean-modules --clean-db  # Full clean and start"
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}🚀 CTNFT Project Startup Script${NC}"
echo "=================================="

# Function to print step
print_step() {
  echo -e "\n${BLUE}📋 $1${NC}"
}

# Function to print success
print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

# Function to print warning
print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to print error
print_error() {
  echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  print_error "package.json not found. Please run this script from the project root directory."
  exit 1
fi

# Clean node_modules if requested
if [ "$CLEAN_MODULES" = true ]; then
  print_step "Cleaning node_modules and package-lock.json"
  if [ -d "node_modules" ]; then
    rm -rf node_modules
    print_success "Removed node_modules"
  fi
  if [ -f "package-lock.json" ]; then
    rm -f package-lock.json
    print_success "Removed package-lock.json"
  fi
  if [ -f "yarn.lock" ]; then
    rm -f yarn.lock
    print_success "Removed yarn.lock"
  fi
fi

# Clear Next.js cache
print_step "Clearing Next.js cache"
if [ -d ".next" ]; then
  rm -rf .next
  print_success "Cleared .next cache"
fi

# Clear other common caches
if [ -d ".turbo" ]; then
  rm -rf .turbo
  print_success "Cleared .turbo cache"
fi

if [ -d "out" ]; then
  rm -rf out
  print_success "Cleared out directory"
fi

# Install dependencies
print_step "Installing dependencies"
if command -v yarn &> /dev/null && [ -f "yarn.lock" ] && [ "$CLEAN_MODULES" = false ]; then
  yarn install
  print_success "Dependencies installed with yarn"
else
  npm install
  print_success "Dependencies installed with npm"
fi

# Generate Prisma client
print_step "Generating Prisma client"
npx prisma generate
print_success "Prisma client generated"

# Handle database operations
if [ "$CLEAN_DB" = true ]; then
  print_warning "Database reset requested - This will delete ALL data!"
  read -p "Are you sure you want to reset the database? (y/N): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_step "Resetting database"
    
    # Remove existing database file if using SQLite
    if [ -f "prisma/dev.db" ]; then
      rm -f prisma/dev.db
      print_success "Removed existing database file"
    fi
    
    # Reset database
    npx prisma migrate reset --force
    print_success "Database reset complete"
  else
    print_warning "Database reset cancelled"
  fi
else
  print_step "Applying database migrations"
  npx prisma db push
  print_success "Database migrations applied"
fi

# Check if .env file exists
print_step "Checking environment configuration"
if [ ! -f ".env" ] && [ ! -f ".env.local" ]; then
  print_warning "No .env or .env.local file found"
  echo "Creating .env.local with default values..."
  
  cat > .env.local << EOL
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here"

# Optional: Add your environment variables here
EOL
  
  print_success "Created .env.local with default values"
  print_warning "Please update .env.local with your actual configuration"
else
  print_success "Environment file found"
fi

# Final checks
print_step "Running final checks"

# Check if all required dependencies are installed
if ! npm list @prisma/client > /dev/null 2>&1; then
  print_error "Prisma client not found. Please check your installation."
  exit 1
fi

if ! npm list next > /dev/null 2>&1; then
  print_error "Next.js not found. Please check your installation."
  exit 1
fi

print_success "All checks passed"

# Start the development server
print_step "Starting development server"
echo -e "${GREEN}🎉 Setup complete! Starting the development server...${NC}"
echo -e "${BLUE}💡 The application will be available at:${NC}"
echo -e "   • http://localhost:3000 (or next available port)"
echo -e "${BLUE}💡 To stop the server, press Ctrl+C${NC}"
echo ""

# Start the server
npm run dev
