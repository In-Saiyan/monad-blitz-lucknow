@echo off
setlocal enabledelayedexpansion

REM CTNFT Project Startup Script (Windows)
REM Usage: start.bat [options]
REM Options:
REM   --clean-modules    Remove node_modules and reinstall dependencies
REM   --clean-db         Reset database (WARNING: This will delete all data)
REM   --help            Show this help message

set "CLEAN_MODULES=false"
set "CLEAN_DB=false"

REM Parse command line arguments
:parse
if "%~1"=="--clean-modules" (
    set "CLEAN_MODULES=true"
    shift
    goto parse
)
if "%~1"=="--clean-db" (
    set "CLEAN_DB=true"
    shift
    goto parse
)
if "%~1"=="--help" (
    echo CTNFT Project Startup Script
    echo.
    echo Usage: start.bat [options]
    echo.
    echo Options:
    echo   --clean-modules    Remove node_modules and reinstall dependencies
    echo   --clean-db         Reset database (WARNING: This will delete all data)
    echo   --help            Show this help message
    echo.
    echo Examples:
    echo   start.bat                    # Standard startup
    echo   start.bat --clean-modules    # Clean install and start
    echo   start.bat --clean-db         # Reset database and start
    echo   start.bat --clean-modules --clean-db  # Full clean and start
    exit /b 0
)
if not "%~1"=="" (
    echo Unknown option: %~1
    echo Use --help for usage information
    exit /b 1
)

echo 🚀 CTNFT Project Startup Script
echo ==================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ package.json not found. Please run this script from the project root directory.
    exit /b 1
)

REM Clean node_modules if requested
if "%CLEAN_MODULES%"=="true" (
    echo 📋 Cleaning node_modules and package-lock.json
    if exist "node_modules" (
        rmdir /s /q "node_modules"
        echo ✅ Removed node_modules
    )
    if exist "package-lock.json" (
        del "package-lock.json"
        echo ✅ Removed package-lock.json
    )
    if exist "yarn.lock" (
        del "yarn.lock"
        echo ✅ Removed yarn.lock
    )
)

REM Clear Next.js cache
echo 📋 Clearing Next.js cache
if exist ".next" (
    rmdir /s /q ".next"
    echo ✅ Cleared .next cache
)

REM Clear other common caches
if exist ".turbo" (
    rmdir /s /q ".turbo"
    echo ✅ Cleared .turbo cache
)

if exist "out" (
    rmdir /s /q "out"
    echo ✅ Cleared out directory
)

REM Install dependencies
echo 📋 Installing dependencies
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    exit /b 1
)
echo ✅ Dependencies installed

REM Generate Prisma client
echo 📋 Generating Prisma client
npx prisma generate
if %errorlevel% neq 0 (
    echo ❌ Failed to generate Prisma client
    exit /b 1
)
echo ✅ Prisma client generated

REM Handle database operations
if "%CLEAN_DB%"=="true" (
    echo ⚠️ Database reset requested - This will delete ALL data!
    set /p confirm="Are you sure you want to reset the database? (y/N): "
    if /i "!confirm!"=="y" (
        echo 📋 Resetting database
        
        REM Remove existing database file if using SQLite
        if exist "prisma\dev.db" (
            del "prisma\dev.db"
            echo ✅ Removed existing database file
        )
        
        REM Reset database
        npx prisma migrate reset --force
        if %errorlevel% neq 0 (
            echo ❌ Failed to reset database
            exit /b 1
        )
        echo ✅ Database reset complete
    ) else (
        echo ⚠️ Database reset cancelled
    )
) else (
    echo 📋 Applying database migrations
    npx prisma db push
    if %errorlevel% neq 0 (
        echo ❌ Failed to apply database migrations
        exit /b 1
    )
    echo ✅ Database migrations applied
)

REM Check if .env file exists
echo 📋 Checking environment configuration
if not exist ".env" if not exist ".env.local" (
    echo ⚠️ No .env or .env.local file found
    echo Creating .env.local with default values...
    
    (
        echo # Database
        echo DATABASE_URL="file:./dev.db"
        echo.
        echo # NextAuth.js
        echo NEXTAUTH_URL="http://localhost:3000"
        echo NEXTAUTH_SECRET="your-nextauth-secret-here"
        echo.
        echo # Optional: Add your environment variables here
    ) > .env.local
    
    echo ✅ Created .env.local with default values
    echo ⚠️ Please update .env.local with your actual configuration
) else (
    echo ✅ Environment file found
)

REM Start the development server
echo 📋 Starting development server
echo 🎉 Setup complete! Starting the development server...
echo 💡 The application will be available at:
echo    • http://localhost:3000 (or next available port)
echo 💡 To stop the server, press Ctrl+C
echo.

REM Start the server
npm run dev
