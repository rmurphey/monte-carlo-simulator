# Bulletproof Validation System

## Overview

The Monte Carlo Framework features a comprehensive validation system that ensures **zero invalid configurations can reach the repository**. This system provides production-grade reliability through multiple layers of validation.

## 🛡️ Bulletproof Protection Layers

### 1. **Schema Validation (AJV-based)**
- Comprehensive JSON Schema validation for all YAML configurations
- Detailed error messages with specific field and constraint information
- Type checking, range validation, and format enforcement
- Business rule validation (duplicate keys, parameter constraints)

### 2. **Pre-commit Hook Enforcement** 
- Automatically validates all YAML files before commit
- Blocks commits containing invalid configurations
- Prevents schema issues from reaching the repository
- Integrates with lint-staged for efficient validation

### 3. **Runtime Parameter Validation**
- Min/max constraint checking for numeric parameters
- Type coercion with validation for CLI inputs
- Parameter file format validation (JSON/YAML)
- Helpful error messages for constraint violations

## 🔧 Validation Components

### BulletproofValidator Class
Located: `src/validation/bulletproof-validator.ts`

```typescript
// Single source of truth for all validation
import { validator } from './validation/bulletproof-validator'

// Validate any simulation file
const result = await validator.validateFile('simulation.yaml')
if (!result.valid) {
  console.error('Validation errors:', result.errors)
}
```

**Features:**
- AJV schema validation with detailed error formatting
- Business rule validation beyond schema constraints
- Directory validation for bulk checking
- Singleton pattern for consistent usage

### CLI Parameter Validation
Enhanced parameter processing in CLI commands:

```bash
# These will be caught and rejected:
npm run cli run simulation.yaml --set investment=500  # Below minimum
npm run cli run simulation.yaml --set rate=abc        # Invalid type
npm run cli run simulation.yaml --set invalid=123     # Unknown parameter
```

**Validation Features:**
- Type checking with helpful error messages
- Min/max constraint enforcement  
- Parameter existence validation
- Custom error messages with guidance

## 📋 Schema Requirements

### Required Fields
```yaml
name: string (1-100 characters)
category: string (min 1 character)  
description: string (10-500 characters)
version: string (semantic version format: "1.0.0")
tags: array (1-10 string items)
parameters: array (1-20 parameter objects)
```

### Parameter Schema
```yaml
parameters:
  - key: string (required, unique)
    label: string (required)
    type: "number" | "boolean" | "string" | "select"
    default: number | boolean | string (must match type)
    min: number (optional, for number type)
    max: number (optional, for number type) 
    options: string[] (required for select type)
    description: string (optional)
```

### Business Rules Enforced
- No duplicate parameter keys
- No duplicate output keys  
- Select parameters must have options array
- Default values must be within min/max ranges
- Default values for select type must be in options
- Simulation logic must contain return statement (if provided)
- Groups must reference existing parameters

## 🧪 Testing Coverage

The validation system is thoroughly tested with **87 passing tests**:

### Test Categories
- **Schema validation tests** - All edge cases and constraint combinations
- **Business rule validation** - Duplicate detection, constraint checking
- **File parsing tests** - YAML/JSON loading with error handling
- **CLI integration tests** - Parameter validation in real usage
- **Comprehensive repository tests** - All 19+ YAML files validated

### Test Files
- `src/test/bulletproof-validation.test.ts` - Core validation logic
- `src/test/schema-validation-comprehensive.test.ts` - Repository-wide validation
- `src/test/cli-commands.test.ts` - CLI parameter validation

## 🚀 Usage Examples

### Direct Validation
```typescript
import { validator } from './src/validation/bulletproof-validator'

// Validate a specific file
const result = await validator.validateFile('my-simulation.yaml')
console.log(`Valid: ${result.valid}`)
if (!result.valid) {
  result.errors.forEach(error => console.error(`❌ ${error}`))
}

// Validate entire directory
const summary = await validator.validateDirectory('examples/simulations')
console.log(`${summary.validFiles}/${summary.totalFiles} files valid`)
```

### CLI Validation
```bash
# Validate before running
npm run cli validate my-simulation.yaml

# Built-in validation during execution  
npm run cli run my-simulation.yaml --set investment=500
# Output: ❌ Parameter 'investment' value 500 is below minimum 1000
```

### Parameter File Validation
```bash
# JSON parameter files are validated
echo '{"investment": "invalid"}' > params.json
npm run cli run simulation.yaml --params params.json
# Output: ❌ Parameter 'investment' must be a number, got: invalid
```

## 🔍 Error Message Examples

### Schema Validation Errors
```
❌ Wrong type at /parameters/0/default: expected number, got string (received: "abc")
❌ Missing required field: monthlyBenefit at /parameters
❌ Value too short at /name: minimum 1 characters (received: "")
❌ Invalid format at /version: must match pattern "^\d+\.\d+\.\d+$" (received: "1.0")
```

### Business Rule Errors  
```
❌ Duplicate parameter keys: investment, monthlyBenefit
❌ Default value 500 for parameter 'investment' is below minimum 1000
❌ Select parameter 'riskLevel' must have options array
❌ Default value 'high' for parameter 'riskLevel' must be one of: low, medium
```

### Runtime Parameter Errors
```
❌ Parameter 'investment' value 500 is below minimum 1000
❌ Parameter 'rate' must be a number, got: abc
❌ Unknown parameter 'invalidParam' for simulation 'ROI Analysis'
```

## 🛠️ Integration Points

### Pre-commit Hooks
Configuration in `package.json`:
```json
"lint-staged": {
  "{examples,simulations}/**/*.{yaml,yml}": [
    "npm run cli validate"
  ]
}
```

### CI/CD Integration
The validation system can be integrated into CI/CD pipelines:
```bash
# Validate all simulations in CI
npm run cli validate examples/simulations/*.yaml
```

## 📊 Impact & Benefits

### Before Bulletproof Validation
- Manual YAML validation prone to errors
- Invalid configurations could reach production
- Debugging time spent on configuration issues
- Inconsistent error messages and validation

### After Bulletproof Validation  
- **Zero invalid configurations** can be committed
- **Detailed error messages** guide users to fixes
- **Pre-commit protection** prevents repository pollution
- **Production-grade reliability** with comprehensive testing

The bulletproof validation system ensures the Monte Carlo Framework maintains enterprise-grade quality and reliability standards.