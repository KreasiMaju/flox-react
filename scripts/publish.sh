#!/bin/bash

# 🚀 Flox Publish Script
# Script untuk publish Flox ke NPM registry

echo "🚀 Flox Publish Script"
echo "======================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json tidak ditemukan!"
    exit 1
fi

# Check if package.json has the right name
if ! grep -q '"name": "@flox/react"' package.json; then
    echo "❌ Error: Package name harus '@flox/react'!"
    exit 1
fi

# Check if logged in to npm
if ! npm whoami > /dev/null 2>&1; then
    echo "❌ Error: Belum login ke NPM!"
    echo "Jalankan: npm login"
    exit 1
fi

# Build the library
echo "📦 Building library..."
npm run build:lib

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "❌ Error: dist folder tidak ditemukan!"
    exit 1
fi

# Check dist contents
echo "📁 Checking dist contents..."
ls -la dist/

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo "📋 Current version: $CURRENT_VERSION"

# Ask for confirmation
read -p "Apakah kamu yakin ingin publish version $CURRENT_VERSION? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Publish dibatalkan"
    exit 1
fi

# Publish to npm
echo "🚀 Publishing to NPM..."
npm publish --access public

if [ $? -eq 0 ]; then
    echo "✅ Flox berhasil dipublish ke NPM!"
    echo "📦 Package: @flox/react@$CURRENT_VERSION"
    echo "🌐 URL: https://www.npmjs.com/package/@flox/react"
else
    echo "❌ Gagal publish ke NPM"
    exit 1
fi

echo ""
echo "🎉 Publish selesai!"
echo ""
echo "📋 Langkah selanjutnya:"
echo "  1. Update dokumentasi dengan version baru"
echo "  2. Create git tag: git tag v$CURRENT_VERSION"
echo "  3. Push tag: git push origin v$CURRENT_VERSION"
echo "  4. Update GitHub releases"
echo ""
echo "Happy publishing! 🚀" 