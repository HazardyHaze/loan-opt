#!/bin/bash
set -e

echo "Building Loan Scholar Opt Frontend..."
cd frontend
npm install
npm run build
echo "Frontend build complete!"
