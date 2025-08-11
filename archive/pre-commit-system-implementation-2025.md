# Enhanced Pre-Commit System Implementation Design

## Executive Summary

This document provides detailed implementation specifications for the 8 enhanced pre-commit validations identified in the system design. Each validation includes exact code, error handling, performance considerations, and integration patterns.

## Architecture Overview

### Current Hook Structure
```bash
.git/hooks/pre-commit (81 lines)
├── TypeScript compilation (16 lines)
├── Test suite execution (11 lines) 
├── Documentation validation (19 lines)
└── Documentation gap check (13 lines)
```

### Enhanced Hook Structure
```bash
.git/hooks/pre-commit (estimated 180 lines)
├── Phase 1: Current validations (50 lines)
├── Phase 2A: Critical validations (70 lines)
├── Phase 2B: Quality validations (45 lines)
└── Phase 2C: Advanced validations (15 lines)
```

## Phase 2A: Critical Validations Implementation

### 1. YAML Schema Validation

**Location**: Add after line 75 in current pre-commit hook
**Estimated Runtime**: 3-5 seconds

```bash
# 9. YAML Schema Validation
echo "📋 Validating YAML schema compliance..."
yaml_validation_failed=0
yaml_files=$(find examples/ templates/ simulations/ -name "*.yaml" -o -name "*.yml" 2>/dev/null | grep -v node_modules)

if [ -z "$yaml_files" ]; then
    echo "⚠️  No YAML files found to validate"
else
    yaml_count=0
    for file in $yaml_files; do
        if [ -f "$file" ]; then
            ((yaml_count++))
            if ! timeout 10s npm run cli validate "$file" >/dev/null 2>&1; then
                echo "❌ Invalid YAML schema: $file"
                echo "   Run 'npm run cli validate $file' to see detailed errors"
                yaml_validation_failed=1
            fi
        fi
    done
    
    if [ $yaml_validation_failed -eq 1 ]; then
        echo ""
        echo "💡 YAML Validation Tips:"
        echo "  • Check required fields: name, category, description, version, tags, parameters"
        echo "  • Ensure description is 10-500 characters"
        echo "  • Verify version format is 'x.y.z'"
        echo "  • Validate parameter types and defaults"
        echo ""
        exit 1
    fi
    
    echo "✅ All YAML files valid ($yaml_count files checked)"
fi
```

### 2. NPX Distribution Sync

**Location**: Add after YAML validation
**Estimated Runtime**: 5-10 seconds

```bash
# 10. NPX Distribution Sync
echo "📦 Checking NPX distribution sync..."
dist_sync_required=0

# Check if TypeScript files changed
if git diff --cached --name-only | grep -E '\.(ts|js)$' >/dev/null; then
    echo "📝 TypeScript changes detected - checking dist/ sync..."
    
    # Build silently first (we already validated compilation above)
    if npm run build >/dev/null 2>&1; then
        # Check if dist/ directory needs updates
        if ! git diff --quiet dist/ 2>/dev/null; then
            echo "⚡ Updating NPX distribution files..."
            git add dist/
            dist_sync_required=1
        fi
    else
        echo "❌ NPX distribution build failed!"
        echo "This should not happen - TypeScript compilation passed earlier"
        exit 1
    fi
fi

if [ $dist_sync_required -eq 1 ]; then
    echo "✅ NPX distribution updated and staged"
else
    echo "✅ NPX distribution is current"
fi
```

### 3. Agent API Stability Validation

**Location**: Add after NPX sync
**Estimated Runtime**: 8-12 seconds

```bash
# 11. Agent API Stability Validation
echo "🤖 Validating agent-friendly APIs..."
api_validation_failed=0

# Test core agent commands with timeout protection
agent_test_commands=(
    "npm run cli list:30"
    "npm run cli validate examples/simulations/simple-roi-analysis.yaml:15"
    "npm run cli run examples/simulations/simple-roi-analysis.yaml --iterations 10:20"
    "npm run cli studio generate 'test simulation' --test:25"
)

for cmd_with_timeout in "${agent_test_commands[@]}"; do
    IFS=':' read -r cmd timeout_sec <<< "$cmd_with_timeout"
    timeout_sec=${timeout_sec:-30}
    
    if ! timeout "${timeout_sec}s" $cmd >/dev/null 2>&1; then
        echo "❌ Agent API broken: $cmd"
        echo "   Timeout: ${timeout_sec}s"
        api_validation_failed=1
    fi
done

# Test parameter override functionality
if ! timeout 15s npm run cli run examples/simulations/simple-roi-analysis.yaml --set monthlyBenefit=1000 --iterations 10 >/dev/null 2>&1; then
    echo "❌ Parameter override API broken"
    api_validation_failed=1
fi

# Test interactive parameter discovery
if ! timeout 10s npm run cli run examples/simulations/simple-roi-analysis.yaml --list-params >/dev/null 2>&1; then
    echo "❌ Parameter discovery API broken"
    api_validation_failed=1
fi

if [ $api_validation_failed -eq 1 ]; then
    echo ""
    echo "💡 Agent API Fix Tips:"
    echo "  • Test commands manually: npm run cli --help"
    echo "  • Check CLI argument parsing in src/cli/index.ts"
    echo "  • Verify simulation loading in src/cli/commands/"
    echo "  • Run 'npm test' to check framework functionality"
    echo ""
    exit 1
fi

echo "✅ Agent APIs working correctly"
```

## Phase 2B: Quality Validations Implementation

### 4. Example File Integrity Validation

**Location**: Add as new script + hook integration
**Estimated Runtime**: 10-15 seconds

**New Script**: `scripts/test-examples.ts`
```typescript
#!/usr/bin/env tsx
/**
 * Example File Integrity Testing
 * 
 * Validates that all simulation examples actually work and produce results.
 * More comprehensive than documentation testing - validates the simulations themselves.
 */

import { readdir } from 'fs/promises'
import { execSync } from 'child_process'
import chalk from 'chalk'
import { join } from 'path'

interface ExampleTestResult {
  file: string
  success: boolean
  error?: string
  executionTime?: number
}

class ExampleIntegrityTester {
  private results: ExampleTestResult[] = []
  
  async testAllExamples(): Promise<void> {
    console.log(chalk.cyan.bold('🧪 Testing Example File Integrity\n'))
    
    const exampleDirs = ['examples/simulations', 'templates']
    const exampleFiles: string[] = []
    
    for (const dir of exampleDirs) {
      try {
        await this.collectYamlFiles(dir, exampleFiles)
      } catch (error) {
        console.log(chalk.yellow(`⚠️  Directory ${dir} not found, skipping`))
      }
    }
    
    console.log(chalk.gray(`Found ${exampleFiles.length} example files to test\n`))
    
    for (const [index, file] of exampleFiles.entries()) {
      console.log(chalk.yellow(`📝 Testing ${index + 1}/${exampleFiles.length}: ${file}`))
      await this.testExample(file)
    }
    
    this.displayResults()
  }
  
  private async collectYamlFiles(dir: string, files: string[]): Promise<void> {
    const entries = await readdir(dir, { withFileTypes: true })
    
    for (const entry of entries) {
      const fullPath = join(dir, entry.name)
      
      if (entry.isDirectory()) {
        await this.collectYamlFiles(fullPath, files)
      } else if (entry.name.endsWith('.yaml') || entry.name.endsWith('.yml')) {
        files.push(fullPath)
      }
    }
  }
  
  private async testExample(file: string): Promise<void> {
    const startTime = Date.now()
    
    try {
      // Test validation first
      execSync(`npm run cli validate "${file}"`, {
        stdio: 'pipe',
        timeout: 10000
      })
      
      // Test execution with minimal iterations for speed
      execSync(`npm run cli run "${file}" --iterations 10`, {
        stdio: 'pipe',
        timeout: 20000
      })
      
      const executionTime = Date.now() - startTime
      this.results.push({
        file,
        success: true,
        executionTime
      })
      
      console.log(chalk.green(`   ✅ Success (${executionTime}ms)`))
      
    } catch (error: any) {
      this.results.push({
        file,
        success: false,
        error: error.message
      })
      
      console.log(chalk.red('   ❌ Failed'))
      console.log(chalk.red(`   ${error.message.split('\n')[0]}`))
    }
    
    console.log() // Empty line
  }
  
  private displayResults(): void {
    const successful = this.results.filter(r => r.success)
    const failed = this.results.filter(r => !r.success)
    
    console.log(chalk.cyan.bold('📊 EXAMPLE INTEGRITY RESULTS'))
    console.log(chalk.gray('═'.repeat(50)))
    console.log(`${chalk.green('✅ Working:')} ${successful.length}`)
    console.log(`${chalk.red('❌ Broken:')} ${failed.length}`)
    console.log(`${chalk.blue('📝 Total:')} ${this.results.length}`)
    
    if (successful.length > 0) {
      const avgTime = Math.round(successful.reduce((sum, r) => sum + (r.executionTime || 0), 0) / successful.length)
      console.log(`${chalk.blue('⚡ Avg Time:')} ${avgTime}ms`)
    }
    
    if (failed.length > 0) {
      console.log(chalk.red.bold('\n🚨 BROKEN EXAMPLES:'))
      console.log(chalk.gray('─'.repeat(50)))
      
      failed.forEach((result, index) => {
        console.log(chalk.red(`${index + 1}. ${result.file}`))
        console.log(chalk.red(`   Error: ${result.error?.split('\n')[0]}`))
        console.log()
      })
      
      console.log(chalk.red.bold('💡 Fix these examples before committing!'))
      process.exit(1)
    } else {
      console.log(chalk.green.bold('\n🎉 All examples work correctly!'))
    }
  }
}

async function main() {
  try {
    const tester = new ExampleIntegrityTester()
    await tester.testAllExamples()
  } catch (error) {
    console.error(chalk.red.bold('❌ Example integrity testing failed:'), error)
    process.exit(1)
  }
}

if (require.main === module) {
  main()
}
```

**Hook Integration**:
```bash
# 12. Example File Integrity
echo "🧪 Testing example file integrity..."
if ! npm run test:examples >/dev/null 2>&1; then
  echo "❌ Example files have errors!"
  echo ""
  echo "Some example simulations are broken. Run for details:"
  echo "npm run test:examples"
  echo ""
  exit 1
fi
echo "✅ All examples work correctly"
```

**Package.json Addition**:
```json
{
  "scripts": {
    "test:examples": "tsx scripts/test-examples.ts"
  }
}
```

### 5. Business Intelligence Function Validation

**Location**: Add after example testing
**Estimated Runtime**: 3-5 seconds

```bash
# 13. Business Intelligence Function Validation
echo "💼 Testing business intelligence functions..."

# Test BI functions by creating a minimal simulation with businessContext
bi_test_file="/tmp/bi-test-$$.yaml"
cat > "$bi_test_file" << 'EOF'
name: "BI Function Test"
category: "Test"
description: "Test business intelligence functions"
version: "1.0.0"
tags: [test]
businessContext: true

parameters:
  - key: investment
    label: "Investment"
    type: number
    default: 100000
  - key: monthlyReturn
    label: "Monthly Return"
    type: number
    default: 10000

outputs:
  - key: roi
    label: "ROI"
  - key: payback
    label: "Payback Period"

simulation:
  logic: |
    const annualReturn = monthlyReturn * 12
    const roi = calculateROI(investment, annualReturn)
    const payback = calculatePaybackPeriod(investment, monthlyReturn)
    return { 
      roi: Math.round(roi * 10) / 10,
      payback: Math.round(payback * 10) / 10
    }
EOF

bi_test_failed=0
if ! timeout 15s npm run cli run "$bi_test_file" --iterations 5 >/dev/null 2>&1; then
  echo "❌ Business intelligence functions failing!"
  echo "   Core BI functions (calculateROI, calculatePaybackPeriod) not working"
  bi_test_failed=1
fi

# Clean up test file
rm -f "$bi_test_file"

if [ $bi_test_failed -eq 1 ]; then
  echo ""
  echo "💡 BI Function Fix Tips:"
  echo "  • Check src/framework/business-intelligence.ts"
  echo "  • Verify BI function imports in simulation context"
  echo "  • Test manually: npm run cli run [simulation-with-businessContext]"
  echo ""
  exit 1
fi

echo "✅ Business intelligence functions working"
```

### 6. Template System Integrity

**Location**: Add after BI validation
**Estimated Runtime**: 5-8 seconds

```bash
# 14. Template System Integrity
echo "📋 Checking template system integrity..."
template_failed=0

# Count available templates
template_count=$(find templates/ -name "*.yaml" -o -name "*.yml" 2>/dev/null | wc -l)
if [ "$template_count" -eq 0 ]; then
  echo "❌ No templates found!"
  echo "   Template system appears broken - templates/ directory empty"
  template_failed=1
else
  echo "📊 Found $template_count templates"
  
  # Test template-based generation
  test_output="/tmp/template-test-$$.yaml"
  if timeout 20s npm run cli studio generate "test template simulation" --template simple-roi-analysis -o "$test_output" >/dev/null 2>&1; then
    if [ -f "$test_output" ]; then
      # Test that generated file actually works
      if timeout 15s npm run cli run "$test_output" --iterations 5 >/dev/null 2>&1; then
        echo "✅ Template generation working"
      else
        echo "❌ Template generates invalid simulations"
        template_failed=1
      fi
      rm -f "$test_output"
    else
      echo "❌ Template generation produces no output"
      template_failed=1
    fi
  else
    echo "❌ Template-based generation failing"
    template_failed=1
  fi
fi

if [ $template_failed -eq 1 ]; then
  echo ""
  echo "💡 Template System Fix Tips:"
  echo "  • Check templates/ directory exists and has .yaml files"
  echo "  • Verify template loading in src/cli/commands/create-simulation.ts"
  echo "  • Test manually: npm run cli studio generate 'test' --template simple-roi-analysis"
  echo ""
  exit 1
fi

echo "✅ Template system working ($template_count templates)"
```

## Phase 2C: Advanced Validations Implementation

### 7. Security Validation

**Location**: Add after template validation
**Estimated Runtime**: 2-3 seconds

```bash
# 15. Security Validation
echo "🔒 Running security validation..."
security_warnings=0

# Check for common secrets patterns (non-blocking warnings)
if grep -r -E -i "(api[_-]?key|password|secret|token|auth).{0,20}[:=].{0,20}['\"][^'\"]{8,}['\"]" . \
   --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist \
   --exclude="*.md" --exclude="pre-commit" >/dev/null 2>&1; then
  echo "⚠️  Potential secrets detected in code"
  echo "   Review for hardcoded credentials"
  ((security_warnings++))
fi

# Check for security-related TODOs
if grep -r -E -i "(TODO|FIXME|XXX).*(security|auth|password|token)" . \
   --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist \
   --exclude="*.md" >/dev/null 2>&1; then
  echo "⚠️  Security-related TODOs found"
  echo "   Consider addressing before committing"
  ((security_warnings++))
fi

# Check for console.log statements that might leak info
if grep -r "console\.log" src/ --include="*.ts" --include="*.js" >/dev/null 2>&1; then
  echo "⚠️  console.log statements found in source"
  echo "   Consider using proper logging"
  ((security_warnings++))
fi

if [ $security_warnings -eq 0 ]; then
  echo "✅ Security validation passed"
else
  echo "⚠️  $security_warnings security warnings (non-blocking)"
fi
```

### 8. Performance Regression Detection

**Location**: Add after security validation
**Estimated Runtime**: 5-8 seconds

```bash
# 16. Performance Regression Detection
echo "⚡ Running performance smoke test..."
perf_start=$(date +%s)

# Test basic simulation performance
if ! timeout 25s npm run cli run examples/simulations/simple-roi-analysis.yaml --iterations 100 >/dev/null 2>&1; then
  echo "❌ Performance regression detected!"
  echo "   Basic simulation (100 iterations) took >25s or failed"
  echo "   This suggests a significant performance problem"
  exit 1
fi

perf_end=$(date +%s)
perf_duration=$((perf_end - perf_start))

if [ $perf_duration -gt 20 ]; then
  echo "⚠️  Simulation slower than expected (${perf_duration}s)"
  echo "   Consider investigating performance impact"
else
  echo "✅ Performance check passed (${perf_duration}s for 100 iterations)"
fi
```

## Integration and Error Handling

### Enhanced Hook Header
```bash
#!/bin/bash
#
# Enhanced Pre-commit Hook - Monte Carlo Framework
# Version: 2.0
#
# Comprehensive validation system ensuring:
# • Code quality and compilation
# • Documentation accuracy and examples
# • System integrity and agent compatibility
# • Security and performance standards
#

set -e  # Exit on any error

# Color output functions
print_phase() { echo -e "\n\033[1;34m$1\033[0m"; }
print_success() { echo -e "\033[0;32m✅ $1\033[0m"; }
print_warning() { echo -e "\033[0;33m⚠️  $1\033[0m"; }
print_error() { echo -e "\033[0;31m❌ $1\033[0m"; }

print_phase "🛡️  Running enhanced pre-commit validation..."
echo "Version: 2.0 (8 validation phases)"
echo ""
```

### Enhanced Summary
```bash
echo ""
print_phase "🚀 All enhanced pre-commit validation passed!"
echo "   • Code compilation ✅"
echo "   • Test suite ✅"
echo "   • Documentation examples ✅"
echo "   • Documentation gaps ✅"
echo "   • YAML schemas ✅"
echo "   • NPX distribution ✅"
echo "   • Agent APIs ✅"
echo "   • Example integrity ✅"
echo "   • Business intelligence ✅"
echo "   • Template system ✅"
echo "   • Security scan ✅"
echo "   • Performance check ✅"
echo ""
echo "Ready for commit! 🎉"
```

## Performance Optimization

### Parallel Execution Strategy
```bash
# Run independent validations in parallel where possible
{
  validate_yaml_schemas &
  validate_security &
  validate_performance &
  wait
}
```

### Timeout Management
```bash
# Consistent timeout handling
run_with_timeout() {
  local timeout_sec=$1
  local description=$2
  shift 2
  
  if timeout "${timeout_sec}s" "$@" >/dev/null 2>&1; then
    return 0
  else
    echo "❌ $description timed out (${timeout_sec}s)"
    return 1
  fi
}
```

## Testing and Validation

### Hook Testing Script
**New File**: `scripts/test-pre-commit.ts`
```typescript
#!/usr/bin/env tsx
/**
 * Pre-commit Hook Testing
 * 
 * Validates that the pre-commit hook works correctly across different scenarios
 */

import { execSync } from 'child_process'
import { writeFileSync, unlinkSync } from 'fs'

class PreCommitTester {
  async testAllScenarios(): Promise<void> {
    console.log('🧪 Testing pre-commit hook scenarios...\n')
    
    await this.testCleanCommit()
    await this.testBrokenYAML()
    await this.testBrokenExample()
    await this.testAPIBreakage()
    
    console.log('✅ All pre-commit hook tests passed!')
  }
  
  private async testCleanCommit(): Promise<void> {
    console.log('Testing clean commit scenario...')
    // Implementation for testing hook with clean state
  }
  
  private async testBrokenYAML(): Promise<void> {
    console.log('Testing broken YAML detection...')
    // Implementation for testing YAML validation
  }
  
  // Additional test methods...
}
```

## Rollback Strategy

### Hook Versioning
```bash
# Version tracking in hook
HOOK_VERSION="2.0"
echo "Pre-commit hook version: $HOOK_VERSION"

# Ability to disable phases
ENABLE_PHASE_2A=${ENABLE_PHASE_2A:-true}
ENABLE_PHASE_2B=${ENABLE_PHASE_2B:-true}
ENABLE_PHASE_2C=${ENABLE_PHASE_2C:-true}
```

### Emergency Bypass
```bash
# Emergency bypass mechanism
if [ -f ".bypass-precommit" ]; then
  echo "⚠️  PRE-COMMIT BYPASS DETECTED"
  echo "Remove .bypass-precommit file after emergency commit"
  exit 0
fi
```

## Documentation Updates

### CLAUDE.md Additions
```markdown
## Enhanced Pre-Commit Validation

The project uses comprehensive pre-commit validation with 12 validation phases:

### Phase 1 (Current)
- TypeScript compilation
- Test suite execution  
- Documentation examples
- Documentation gaps

### Phase 2A (Critical)
- YAML schema validation
- NPX distribution sync
- Agent API stability

### Phase 2B (Quality)
- Example file integrity
- Business intelligence functions
- Template system integrity

### Phase 2C (Advanced)
- Security validation
- Performance regression detection

### Bypassing Validations
For emergencies only:
```bash
touch .bypass-precommit
git commit -m "emergency: bypass pre-commit validation"
rm .bypass-precommit
```

### Testing Hook Changes
```bash
npm run test:precommit  # Test hook functionality
```
```

## Implementation Checklist

### Phase 2A (Critical - Implement First)
- [ ] Add YAML schema validation to pre-commit hook
- [ ] Add NPX distribution sync logic
- [ ] Add agent API stability tests
- [ ] Test all validations work correctly
- [ ] Update package.json with new scripts

### Phase 2B (Quality - Second Priority)  
- [ ] Create scripts/test-examples.ts
- [ ] Add example integrity validation to hook
- [ ] Add business intelligence function testing
- [ ] Add template system integrity checks
- [ ] Test example validation catches real issues

### Phase 2C (Advanced - Final Phase)
- [ ] Add security validation patterns
- [ ] Add performance regression testing  
- [ ] Create hook testing infrastructure
- [ ] Add bypass mechanisms for emergencies
- [ ] Update documentation in CLAUDE.md

### Integration Testing
- [ ] Test hook with clean commits (should pass)
- [ ] Test hook with broken YAML (should fail)
- [ ] Test hook with broken examples (should fail) 
- [ ] Test hook performance (should complete <60s)
- [ ] Test bypass mechanism works

## Success Metrics

### Quality Metrics
- **Zero broken examples** in documentation
- **100% YAML validity** in committed files
- **100% agent API compatibility** maintained
- **Current NPX distribution** always available

### Performance Metrics
- **Hook execution time**: <60 seconds total
- **Individual validation timeout**: <30 seconds
- **False positive rate**: <5%
- **Developer friction**: Minimal (clear error messages)

This implementation design provides a complete roadmap for transforming the basic pre-commit hook into a comprehensive quality assurance system that prevents all major categories of issues before they reach the repository.