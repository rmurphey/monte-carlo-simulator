#!/bin/bash
# Command Context Scripts
# Captures repetitive bash commands used by Claude commands to save tokens

# /docs command context
docs_context() {
    echo "=== PROJECT STATUS ==="
    git status --porcelain
    
    echo -e "\n=== DOCUMENTATION FILES ==="
    find . -name "*.md" -not -path "./node_modules/*" -not -path "./.git/*" | head -10
    
    echo -e "\n=== RECENT CHANGES ==="
    git log --oneline --name-only -3 | grep "\.md$" | head -5
    
    echo -e "\n=== CURRENT README EXAMPLES ==="
    npm run test:docs --silent 2>/dev/null | tail -5 || echo "No docs tests available"
}

# /todo command context  
todo_context() {
    echo "=== PROJECT STATUS ==="
    git status --porcelain
    
    echo -e "\n=== CURRENT PRIORITIES ==="
    cat ACTIVE_WORK.md | grep -A 20 "Current Priorities" | head -25
    
    echo -e "\n=== RECENT COMPLETIONS ==="
    cat ACTIVE_WORK.md | grep -A 10 "Recently Completed" | head -15
}

# /archive command context
archive_context() {
    echo "=== PROJECT STATUS ==="
    git status --porcelain
    
    echo -e "\n=== ARCHIVE DIRECTORY ==="
    if [ -d "archive" ]; then
        ls -la archive/ | head -10
    else
        echo "No archive directory found"
    fi
    
    echo -e "\n=== COMPLETED ITEMS ==="
    cat ACTIVE_WORK.md | grep -A 30 "Recently Completed" | head -35
    
    echo -e "\n=== PLANS DIRECTORY ==="
    if [ -d "plans" ]; then
        ls -la plans/ | head -10
    else
        echo "No plans directory found"
    fi
}

# /commit command context
commit_context() {
    echo "=== PROJECT STATUS ==="
    git status --porcelain
    
    echo -e "\n=== STAGED CHANGES ==="
    git diff --cached --stat 2>/dev/null || echo "No staged changes"
    
    echo -e "\n=== RECENT COMMITS ==="
    git log --oneline -5
    
    echo -e "\n=== FILES MODIFIED ==="
    git diff --name-only HEAD 2>/dev/null || echo "No modified files"
}

# /next command context
next_context() {
    echo "=== PROJECT STATUS ==="
    git status --porcelain
    
    echo -e "\n=== CURRENT WORK PHASE ==="
    grep -A 5 "Project Status" ACTIVE_WORK.md 2>/dev/null || echo "No project status found"
    
    echo -e "\n=== IMMEDIATE PRIORITIES ==="
    grep -A 15 "Next Immediate Actions" ACTIVE_WORK.md 2>/dev/null || echo "No immediate actions found"
    
    echo -e "\n=== RECENT ACTIVITY ==="
    git log --oneline -3
}

# Main execution
case "$1" in
    "docs")
        docs_context
        ;;
    "todo") 
        todo_context
        ;;
    "archive")
        archive_context
        ;;
    "commit")
        commit_context
        ;;
    "next")
        next_context
        ;;
    *)
        echo "Usage: $0 {docs|todo|archive|commit|next}"
        echo "Provides context for Claude commands to save tokens"
        exit 1
        ;;
esac