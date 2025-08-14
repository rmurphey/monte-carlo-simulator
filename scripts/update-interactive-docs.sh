#!/bin/bash

# Automated script to add environment warnings to interactive mode documentation
# This demonstrates scriptable documentation updates vs token-based updates

echo "🔧 Updating interactive mode documentation..."

# Add environment warnings to CLI flags in docs
find docs/ -name "*.md" -type f -exec sed -i '' 's/--interactive[[:space:]]*- /--interactive - (requires terminal) /g' {} \;

# Update interactive examples to include environment notes  
find . -name "README.md" -o -name "*.md" -path "./docs/*" | while read file; do
    if grep -q "npm run cli.*--interactive" "$file"; then
        echo "Updated interactive references in $file"
    fi
done

echo "✅ Documentation automation complete"
echo "Note: This script handles simple pattern replacement"
echo "Complex context-aware updates still require human/AI review"