# CTNFT Project Startup Guide

This document explains how to start the CTNFT project with various options for cleaning cache, dependencies, and database.

## Quick Start

### Using Startup Scripts

#### Linux/macOS
```bash
# Standard startup (recommended for daily development)
./start.sh

# Clean cache and start
./start.sh --clean-modules

# Reset database and start (⚠️ WARNING: Deletes all data)
./start.sh --clean-db

# Full clean (cache + database reset)
./start.sh --clean-modules --clean-db

# Show help
./start.sh --help
```

#### Windows
```cmd
# Standard startup
start.bat

# Clean cache and start
start.bat --clean-modules

# Reset database and start (⚠️ WARNING: Deletes all data)
start.bat --clean-db

# Full clean (cache + database reset)
start.bat --clean-modules --clean-db

# Show help
start.bat --help
```

### Using NPM Scripts

```bash
# Standard setup (install dependencies + generate Prisma + push DB)
npm run setup

# Clean everything and setup
npm run setup:clean

# Clean everything, setup, and reset database (⚠️ WARNING: Deletes all data)
npm run setup:db

# Just clean cache
npm run clean

# Clean everything including node_modules
npm run clean:all

# Database operations
npm run db:generate    # Generate Prisma client
npm run db:push        # Apply database changes
npm run db:reset       # Reset database (⚠️ WARNING: Deletes all data)
```

## What Each Option Does

### Standard Startup
- Clears Next.js cache (`.next`, `.turbo`, `out`)
- Installs dependencies (if needed)
- Generates Prisma client
- Applies database migrations
- Starts development server

### `--clean-modules` Option
- Removes `node_modules` directory
- Removes `package-lock.json` and `yarn.lock`
- Fresh install of all dependencies
- Useful when you have dependency issues

### `--clean-db` Option (⚠️ WARNING)
- **DELETES ALL DATABASE DATA**
- Removes existing database file
- Runs `prisma migrate reset --force`
- Creates fresh database with schema
- Use only when you want to start with clean data

## Environment Setup

The script will automatically create a `.env.local` file if none exists:

```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-here"
```

**Important:** Update `NEXTAUTH_SECRET` with a secure random string for production.

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   - The script will automatically use the next available port (3001, 3002, etc.)

2. **Permission denied on Linux/macOS**
   ```bash
   chmod +x start.sh
   ```

3. **Database connection issues**
   - Use `--clean-db` to reset the database
   - Check your `DATABASE_URL` in `.env` files

4. **Node modules corruption**
   - Use `--clean-modules` to reinstall dependencies

5. **Prisma client out of sync**
   ```bash
   npm run db:generate
   ```

### Manual Steps

If you prefer manual control:

```bash
# 1. Clean cache
rm -rf .next .turbo out

# 2. Install dependencies
npm install

# 3. Generate Prisma client
npx prisma generate

# 4. Apply database changes
npx prisma db push

# 5. Start development server
npm run dev
```

## Development Workflow

### Daily Development
```bash
./start.sh  # or just `npm run dev` if everything is set up
```

### When pulling new changes
```bash
./start.sh  # Handles any new dependencies or DB changes
```

### When having issues
```bash
./start.sh --clean-modules  # Clean install
```

### When schema changes (from other developers)
```bash
./start.sh --clean-db  # Reset database (⚠️ loses data)
```

### For fresh environment
```bash
./start.sh --clean-modules --clean-db  # Complete fresh start
```

## Script Features

- ✅ **Smart dependency detection** - Uses yarn if yarn.lock exists
- ✅ **Safety checks** - Confirms database reset operations
- ✅ **Colored output** - Easy to read progress indicators
- ✅ **Cross-platform** - Works on Linux, macOS, and Windows
- ✅ **Error handling** - Stops on errors with clear messages
- ✅ **Environment setup** - Creates default .env.local if missing
- ✅ **Cache cleaning** - Removes all Next.js and build caches

## Port Information

The development server will start on:
- `http://localhost:3000` (or next available port)
- The actual URL will be displayed in the terminal

## Security Notes

- The `--clean-db` option **permanently deletes all data**
- Always backup important data before using database reset options
- Update `NEXTAUTH_SECRET` in production environments
- Never commit sensitive environment variables to version control
