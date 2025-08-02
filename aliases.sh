#!/bin/bash

# Quick aliases for CTNFT project startup
# Source this file or add these to your .bashrc/.zshrc

# Navigate to project directory (update this path as needed)
PROJECT_DIR="/home/user/Code/bp"

# Aliases for quick access
alias ctnft-start="cd $PROJECT_DIR && ./start.sh"
alias ctnft-clean="cd $PROJECT_DIR && ./start.sh --clean-modules"
alias ctnft-reset="cd $PROJECT_DIR && ./start.sh --clean-db"
alias ctnft-fresh="cd $PROJECT_DIR && ./start.sh --clean-modules --clean-db"
alias ctnft-dev="cd $PROJECT_DIR && npm run dev"
alias ctnft-build="cd $PROJECT_DIR && npm run build"

# NPM script aliases
alias ctnft-setup="cd $PROJECT_DIR && npm run setup"
alias ctnft-setup-clean="cd $PROJECT_DIR && npm run setup:clean"
alias ctnft-setup-db="cd $PROJECT_DIR && npm run setup:db"

echo "CTNFT aliases loaded!"
echo "Available commands:"
echo "  ctnft-start      # Standard startup"
echo "  ctnft-clean      # Clean node_modules and start"
echo "  ctnft-reset      # Reset database and start"
echo "  ctnft-fresh      # Full clean and start"
echo "  ctnft-dev        # Just start dev server"
echo "  ctnft-build      # Build for production"
echo "  ctnft-setup      # Setup without starting"
echo "  ctnft-setup-clean # Clean setup"
echo "  ctnft-setup-db   # Clean setup with DB reset"
