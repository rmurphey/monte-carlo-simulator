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

# /hygiene command context
hygiene_context() {
    echo "=== PROJECT STATUS ==="
    git status --porcelain
    
    echo -e "\n=== ESLINT STATUS ==="
    npm run lint 2>&1 | tail -3 || echo "ESLint check failed"
    
    echo -e "\n=== TEST STATUS ==="
    npm run test 2>&1 | tail -5 || echo "Tests failed"
    
    echo -e "\n=== TYPECHECK STATUS ==="
    npm run typecheck 2>&1 | tail -3 || echo "TypeScript check failed"
    
    echo -e "\n=== RECENT COMMITS ==="
    git log --oneline -5
}

# /push command context 
push_context() {
    echo "=== BRANCH STATUS ==="
    git status --branch --porcelain
    
    echo -e "\n=== UNPUSHED COMMITS ==="
    git log @{u}..HEAD --oneline 2>/dev/null || echo "No upstream branch or no unpushed commits"
    
    echo -e "\n=== REMOTE TRACKING ==="
    git branch -vv
    
    echo -e "\n=== VALIDATION CHECKS ==="
    npm run validate:repo-clean 2>/dev/null && echo "✅ Repository clean" || echo "❌ Repository has changes"
    npm run validate:dist-current 2>/dev/null && echo "✅ Dist current" || echo "❌ Dist needs rebuild"
    npm run test:docs 2>&1 | tail -3 || echo "Documentation tests status unknown"
}

# /build command context
build_context() {
    echo "=== PROJECT STATUS ==="
    git status --porcelain
    
    echo -e "\n=== BUILD STATUS ==="
    npm run typecheck 2>&1 | tail -3 || echo "TypeScript check failed"
    
    echo -e "\n=== DIST DIRECTORY ==="
    ls -la dist/ 2>/dev/null || echo "No dist directory"
    
    echo -e "\n=== PACKAGE STATUS ==="
    npm run validate:dist-current 2>/dev/null && echo "✅ Dist current" || echo "❌ Dist needs rebuild"
    
    echo -e "\n=== TEST STATUS ==="
    npm run test 2>&1 | tail -3 || echo "Tests failed"
}

# /simple-test-case command context
simple_test_case_context() {
    echo "=== DEBUGGING CONTEXT ==="
    git status --porcelain
    
    echo -e "\n=== RECENT TEST FILES ==="
    find src/test -name "*.test.ts" -type f | head -5
    
    echo -e "\n=== CURRENT WORKING DIRECTORY ==="
    pwd
    
    echo -e "\n=== DEBUGGING GUIDELINES REMINDER ==="
    echo "✅ Create minimal test case to isolate the issue"
    echo "✅ Test fix inline before modifying source code"  
    echo "✅ Use working equivalent as reference pattern"
    echo "❌ Don't add debug code that won't execute"
    echo "❌ Don't assume caching or compilation issues"
    
    echo -e "\n=== FAILING TESTS ==="
    npm run test 2>&1 | grep -A 3 -B 1 "FAIL\|✕" | head -10 || echo "No current test failures"
}

# /read-the-whole-error command context
read_the_whole_error_context() {
    echo "=== ERROR ANALYSIS CONTEXT ==="
    git status --porcelain
    
    echo -e "\n=== RECENT ERROR PATTERNS ==="
    echo "❌ Common assumption traps:"
    echo "  • 'Must be caching' → Clear caches without evidence"
    echo "  • 'Must be compilation' → Remove .js files randomly"
    echo "  • 'Must be types' → Focus on TypeScript definitions"
    echo "  • 'Must be property access' → Try def.prop, def['prop'], etc."
    
    echo -e "\n✅ Error analysis checklist:"
    echo "  1. Read the COMPLETE error message"
    echo "  2. Identify the actual failing line/method"
    echo "  3. Check if error is in code path you expect"
    echo "  4. Compare with working equivalent functionality"
    echo "  5. Test assumptions with minimal reproduction"
    
    echo -e "\n=== RECENT COMMITS ==="
    git log --oneline -3
}

# /find-working-equivalent command context
find_working_equivalent_context() {
    echo "=== WORKING EQUIVALENT SEARCH ==="
    git status --porcelain
    
    echo -e "\n=== COMPARISON-DRIVEN DEBUGGING CHECKLIST ==="
    echo "1. ✅ Identify broken functionality"
    echo "2. ✅ Find similar working code in same class/module"
    echo "3. ✅ Compare approaches side-by-side"
    echo "4. ✅ Copy working pattern to broken location"
    echo "5. ✅ Test once to verify fix"
    
    echo -e "\n=== CODEBASE STRUCTURE ==="
    echo "Framework core: src/framework/"
    echo "CLI commands: src/cli/"
    echo "Test patterns: src/test/"
    echo "Web components: src/web/"
    
    echo -e "\n=== RECENT SUCCESSFUL PATTERNS ==="
    grep -r "getDefinitions\|Array\.from" src/ --include="*.ts" | head -3 || echo "No recent patterns found"
    
    echo -e "\n=== ANTI-PATTERN REMINDER ==="
    echo "❌ Don't debug mysteries when working solutions exist"
    echo "❌ Don't rewrite methods, just change data source"
    echo "❌ Don't add new methods, just fix existing ones"
}

# /minimal-change-test command context
minimal_change_test_context() {
    echo "=== MINIMAL CHANGE TESTING ==="
    git status --porcelain
    
    echo -e "\n=== INLINE TESTING PATTERN ==="
    echo "// Test your fix in the test file first:"
    echo "it('should work', () => {"
    echo "  const instance = new YourClass(data)"
    echo "  "
    echo "  // Test fix inline before changing source"
    echo "  const fixedResult = useWorkingPattern(instance)"
    echo "  expect(fixedResult).toEqual(expected)"
    echo "  "
    echo "  // Then modify actual source method"
    echo "})"
    
    echo -e "\n=== MINIMAL CHANGE PRINCIPLES ==="
    echo "✅ Change only what's necessary"
    echo "✅ Use proven patterns from working code"
    echo "✅ Test inline before modifying source"
    echo "✅ Verify fix with single test run"
    echo "❌ Don't rewrite entire methods"
    echo "❌ Don't add complex debugging logic"
    
    echo -e "\n=== CURRENT TEST STATUS ==="
    npm run test 2>&1 | tail -5 || echo "Tests failed"
}

# /stop-and-reassess command context
stop_and_reassess_context() {
    echo "=== DEBUGGING CIRCUIT BREAKER ==="
    echo "🚨 STOP: Expensive debugging loop detected"
    echo ""
    echo "=== 5-MINUTE RULE ASSESSMENT ==="
    echo "If you've been debugging for >5 minutes without progress:"
    echo ""
    echo "❌ STOP these expensive patterns:"
    echo "  • Adding debug code that doesn't execute"
    echo "  • Trying multiple variations of same approach"
    echo "  • Clearing caches repeatedly"
    echo "  • Making assumptions without evidence"
    echo "  • Restarting processes 'just in case'"
    echo ""
    echo "✅ START efficient debugging:"
    echo "  1. Find working equivalent functionality"
    echo "  2. Compare working vs broken approaches"
    echo "  3. Test fix inline in test file first"
    echo "  4. Use minimal change with proven pattern"
    echo "  5. Verify with single test run"
    echo ""
    echo "=== EMERGENCY CHECKLIST ==="
    echo "1. ⏹️  STOP current approach"
    echo "2. 🔍 FIND working equivalent"
    echo "3. 📋 COMPARE working vs broken"
    echo "4. 🧪 TEST fix inline first"
    echo "5. ✅ IMPLEMENT minimal change"
    
    echo -e "\n=== TOKEN EFFICIENCY TARGET ==="
    echo "• Time to fix: < 5 minutes"
    echo "• Token cost: < 1,000 tokens"
    echo "• Approach changes: < 2"
    echo "• Debug iterations: < 3"
    
    echo -e "\n=== CURRENT PROJECT STATUS ==="
    git status --porcelain
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
    "hygiene")
        hygiene_context
        ;;
    "push")
        push_context
        ;;
    "build")
        build_context
        ;;
    "simple-test-case")
        simple_test_case_context
        ;;
    "read-the-whole-error")
        read_the_whole_error_context
        ;;
    "find-working-equivalent")
        find_working_equivalent_context
        ;;
    "minimal-change-test")
        minimal_change_test_context
        ;;
    "stop-and-reassess")
        stop_and_reassess_context
        ;;
    *)
        echo "Usage: $0 {docs|todo|archive|commit|next|hygiene|push|build|simple-test-case|read-the-whole-error|find-working-equivalent|minimal-change-test|stop-and-reassess}"
        echo "Provides context for Claude commands to save tokens"
        echo "Debugging commands: simple-test-case, read-the-whole-error, find-working-equivalent, minimal-change-test, stop-and-reassess"
        exit 1
        ;;
esac