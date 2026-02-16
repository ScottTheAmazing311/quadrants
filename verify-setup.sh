#!/bin/bash

echo "🔍 Quadrants Setup Verification"
echo "================================"
echo ""

# Check Node.js
echo "✓ Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "  Node.js: $NODE_VERSION"
else
    echo "  ❌ Node.js not found. Please install Node.js 18+"
    exit 1
fi

# Check npm
echo "✓ Checking npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "  npm: $NPM_VERSION"
else
    echo "  ❌ npm not found"
    exit 1
fi

# Check if node_modules exists
echo "✓ Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "  Dependencies installed ✓"
else
    echo "  ❌ Dependencies not installed. Run: npm install"
    exit 1
fi

# Check for .env.local
echo "✓ Checking environment configuration..."
if [ -f ".env.local" ]; then
    if grep -q "placeholder" .env.local; then
        echo "  ⚠️  .env.local exists but uses placeholder values"
        echo "     Update with real Supabase credentials"
    else
        echo "  Environment configured ✓"
    fi
else
    echo "  ⚠️  .env.local not found"
    echo "     Copy .env.local.example and add your Supabase credentials"
fi

# Check key directories
echo "✓ Checking project structure..."
REQUIRED_DIRS=("app" "components" "lib" "types" "supabase")
for dir in "${REQUIRED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "  $dir/ ✓"
    else
        echo "  ❌ $dir/ missing"
        exit 1
    fi
done

# Check key files
echo "✓ Checking SQL migrations..."
if [ -f "supabase/schema.sql" ] && [ -f "supabase/seed.sql" ]; then
    echo "  schema.sql ✓"
    echo "  seed.sql ✓"
else
    echo "  ❌ SQL files missing"
    exit 1
fi

# Count components
echo "✓ Checking components..."
COMPONENT_COUNT=$(find components -name "*.tsx" 2>/dev/null | wc -l)
echo "  Found $COMPONENT_COUNT components"

# Count pages
echo "✓ Checking pages..."
PAGE_COUNT=$(find app -name "page.tsx" 2>/dev/null | wc -l)
echo "  Found $PAGE_COUNT pages"

echo ""
echo "================================"
echo "✅ Setup verification complete!"
echo ""
echo "Next steps:"
echo "1. Set up Supabase (see DEPLOYMENT.md)"
echo "2. Update .env.local with real credentials"
echo "3. Run: npm run dev"
echo "4. Open: http://localhost:3000"
echo ""
