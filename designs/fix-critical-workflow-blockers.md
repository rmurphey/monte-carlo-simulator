# Fix Critical Workflow Blockers - Technical Design

## Design Overview

This design addresses the most critical user adoption blockers in the Monte Carlo simulation framework by fixing broken core workflows. The implementation prioritizes immediate user impact over architectural perfection.

**Design Principles:**
- **Minimal disruption** - Enhance existing code rather than rewrite
- **Backward compatibility** - Preserve all current working functionality
- **Progressive enhancement** - Each phase adds value independently
- **User-first** - Optimize for discoverability and workflow clarity

## Technical Architecture

### Current State Analysis

#### Broken Component #1: SimulationRegistry.findSimulations()
```typescript
// src/framework/SimulationRegistry.ts (Current Implementation)
async findSimulations(directory: string = './simulations'): Promise<SimulationInfo[]> {
  // PROBLEM: Hard-coded to './simulations' but examples are in 'examples/simulations'
  const files = await fs.readdir(directory);
  // Returns empty array when ./simulations doesn't exist
}
```

#### Broken Component #2: Interactive Creation  
```typescript
// src/cli/commands/create.ts (Current Implementation)
async createInteractive(): Promise<void> {
  const responses = await inquirer.prompt([...]); // PROBLEM: Likely async/signal handling issue
  // Exits immediately without showing prompts
}
```

### Target Architecture

#### Enhanced Discovery System
```typescript
// src/framework/discovery/SimulationDiscovery.ts (New)
export interface DiscoveryConfig {
  searchPaths: string[];              // Multiple directory search
  recursive: boolean;                 // Subdirectory scanning
  includeMetadata: boolean;          // Rich simulation info
  validationLevel: 'none' | 'basic' | 'full';
}

export interface SimulationMetadata {
  id: string;                        // Unique identifier
  name: string;                      // Display name
  description: string;               // User description
  category: string;                  // Business category
  tags: string[];                    // Searchable tags
  filePath: string;                  // File system location
  parameters: ParameterInfo[];       // Available parameters
  lastModified: Date;               // File timestamp
  validation: ValidationResult;      // Schema validation status
}

export class SimulationDiscovery {
  private config: DiscoveryConfig;
  
  constructor(config?: Partial<DiscoveryConfig>) {
    this.config = {
      searchPaths: [
        'examples/simulations',        // Framework examples (NEW)
        'simulations',                 // User simulations (existing)
        '.',                           // Current directory (fallback)
      ],
      recursive: true,
      includeMetadata: true,
      validationLevel: 'basic',
      ...config
    };
  }
  
  async discover(): Promise<SimulationMetadata[]> {
    const results: SimulationMetadata[] = [];
    
    for (const searchPath of this.config.searchPaths) {
      if (await this.pathExists(searchPath)) {
        const simulations = await this.scanDirectory(searchPath);
        results.push(...simulations);
      }
    }
    
    return this.deduplicateAndSort(results);
  }
  
  private async scanDirectory(directory: string): Promise<SimulationMetadata[]> {
    const files = await this.findYamlFiles(directory);
    const metadata: SimulationMetadata[] = [];
    
    for (const filePath of files) {
      try {
        const meta = await this.extractMetadata(filePath);
        if (meta) metadata.push(meta);
      } catch (error) {
        // Log but continue - don't fail entire discovery for one bad file
        console.warn(`Skipping invalid simulation: ${filePath}`);
      }
    }
    
    return metadata;
  }
  
  private async extractMetadata(filePath: string): Promise<SimulationMetadata | null> {
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = yaml.parse(content);
    
    // Quick validation check
    if (!parsed.name || !parsed.description) {
      return null; // Skip invalid files
    }
    
    return {
      id: this.generateId(filePath),
      name: parsed.name,
      description: parsed.description,
      category: parsed.category || 'General',
      tags: parsed.tags || [],
      filePath,
      parameters: this.extractParameterInfo(parsed.parameters || []),
      lastModified: await this.getFileModTime(filePath),
      validation: await this.validateSimulation(parsed)
    };
  }
  
  // Search and filtering capabilities
  async search(query: string): Promise<SimulationMetadata[]> {
    const all = await this.discover();
    return all.filter(sim => 
      sim.name.toLowerCase().includes(query.toLowerCase()) ||
      sim.description.toLowerCase().includes(query.toLowerCase()) ||
      sim.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }
  
  async filterByCategory(category: string): Promise<SimulationMetadata[]> {
    const all = await this.discover();
    return all.filter(sim => sim.category === category);
  }
}
```

#### Enhanced List Command
```typescript
// src/cli/commands/list.ts (Enhanced)
import { SimulationDiscovery } from '../framework/discovery/SimulationDiscovery.js';
import chalk from 'chalk';

export class ListCommand {
  private discovery: SimulationDiscovery;
  
  constructor() {
    this.discovery = new SimulationDiscovery();
  }
  
  async execute(options: ListOptions): Promise<void> {
    try {
      console.log(chalk.cyan('🔍 Discovering available simulations...\n'));
      
      let simulations = await this.discovery.discover();
      
      if (simulations.length === 0) {
        this.showEmptyResults();
        return;
      }
      
      // Apply filters
      if (options.category) {
        simulations = simulations.filter(s => s.category === options.category);
      }
      
      if (options.search) {
        simulations = await this.discovery.search(options.search);
      }
      
      // Display results
      this.displaySimulations(simulations, options);
      this.showUsageHints(simulations);
      
    } catch (error) {
      console.error(chalk.red('❌ Error discovering simulations:'), error.message);
      this.showTroubleshootingHelp();
    }
  }
  
  private displaySimulations(simulations: SimulationMetadata[], options: ListOptions): void {
    if (options.format === 'detailed') {
      this.displayDetailed(simulations);
    } else {
      this.displayCompact(simulations);
    }
  }
  
  private displayCompact(simulations: SimulationMetadata[]): void {
    console.log(chalk.green(`📊 Found ${simulations.length} simulations:\n`));
    
    const grouped = this.groupByCategory(simulations);
    
    for (const [category, sims] of Object.entries(grouped)) {
      console.log(chalk.yellow.bold(`${category}:`));
      for (const sim of sims) {
        const status = sim.validation.valid ? '✅' : '⚠️';
        console.log(`  ${status} ${chalk.cyan(sim.id)} - ${sim.description}`);
      }
      console.log();
    }
  }
  
  private displayDetailed(simulations: SimulationMetadata[]): void {
    for (const sim of simulations) {
      console.log(chalk.cyan.bold(`📋 ${sim.name}`));
      console.log(`   ID: ${sim.id}`);
      console.log(`   Description: ${sim.description}`);
      console.log(`   Category: ${sim.category}`);
      console.log(`   Parameters: ${sim.parameters.length}`);
      console.log(`   Tags: ${sim.tags.join(', ') || 'None'}`);
      console.log(`   File: ${sim.filePath}`);
      console.log(`   Status: ${sim.validation.valid ? '✅ Valid' : '⚠️ Issues'}`);
      console.log();
    }
  }
  
  private showUsageHints(simulations: SimulationMetadata[]): void {
    if (simulations.length === 0) return;
    
    const first = simulations[0];
    
    console.log(chalk.gray('💡 Usage hints:'));
    console.log(chalk.gray(`   Run example: npm run cli run ${first.id}`));
    console.log(chalk.gray(`   View parameters: npm run cli run ${first.id} --list-params`));
    console.log(chalk.gray(`   Create custom: npm run cli create --interactive`));
    console.log(chalk.gray(`   Get help: npm run cli --help`));
    console.log();
  }
  
  private showEmptyResults(): void {
    console.log(chalk.yellow('⚠️  No simulations found.'));
    console.log('\n' + chalk.gray('Troubleshooting:'));
    console.log(chalk.gray('  1. Check that examples/simulations/ directory exists'));
    console.log(chalk.gray('  2. Verify YAML files have valid simulation structure'));
    console.log(chalk.gray('  3. Run: npm run cli validate <file> to check specific files'));
    console.log(chalk.gray('  4. Create your first simulation: npm run cli create --interactive'));
  }
}

interface ListOptions {
  category?: string;
  search?: string;
  format: 'compact' | 'detailed';
  includePath?: boolean;
  showInvalid?: boolean;
}
```

#### Fixed Interactive Creation
```typescript
// src/cli/commands/create.ts (Fixed)
import inquirer from 'inquirer';
import { SimulationDiscovery } from '../framework/discovery/SimulationDiscovery.js';

export class CreateCommand {
  private discovery: SimulationDiscovery;
  
  constructor() {
    this.discovery = new SimulationDiscovery();
  }
  
  async executeInteractive(): Promise<void> {
    try {
      console.log(chalk.cyan.bold('🎯 Interactive Simulation Creator\n'));
      
      // Step 1: Choose creation method
      const method = await this.promptCreationMethod();
      
      if (method === 'template') {
        await this.createFromTemplate();
      } else {
        await this.createFromScratch();
      }
      
    } catch (error) {
      // CRITICAL: Proper error handling for user interruption
      if (error.message === 'User force closed the prompt with 0 null') {
        console.log(chalk.yellow('\n👋 Creation cancelled by user.'));
        process.exit(0);
      } else {
        console.error(chalk.red('\n❌ Creation failed:'), error.message);
        process.exit(1);
      }
    }
  }
  
  private async promptCreationMethod(): Promise<'template' | 'scratch'> {
    // FIX: Robust prompt handling with proper signal management
    const answer = await inquirer.prompt([{
      type: 'list',
      name: 'method',
      message: 'How would you like to create your simulation?',
      choices: [
        {
          name: '📋 Copy and modify existing example (Recommended)',
          value: 'template'
        },
        {
          name: '✨ Create from scratch (Advanced)',
          value: 'scratch'
        }
      ]
    }]);
    
    return answer.method;
  }
  
  private async createFromTemplate(): Promise<void> {
    // Discover available templates
    const simulations = await this.discovery.discover();
    
    if (simulations.length === 0) {
      console.log(chalk.red('❌ No example simulations found to use as templates.'));
      console.log(chalk.gray('   Try creating from scratch instead.'));
      return;
    }
    
    // Let user choose template
    const templateChoice = await inquirer.prompt([{
      type: 'list',
      name: 'template',
      message: 'Choose a template to start from:',
      choices: simulations.map(sim => ({
        name: `${sim.name} - ${sim.description}`,
        value: sim.filePath
      }))
    }]);
    
    // Get customization details
    const customization = await this.promptCustomization();
    
    // Generate new simulation
    const newSimulation = await this.generateFromTemplate(
      templateChoice.template, 
      customization
    );
    
    // Save and validate
    await this.saveAndValidate(newSimulation);
    
    // Offer to run immediately
    await this.offerTestRun(newSimulation.filePath);
  }
  
  private async promptCustomization(): Promise<CustomizationConfig> {
    const config = await inquirer.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Simulation name:',
        validate: (input) => input.trim().length > 0 || 'Name is required'
      },
      {
        type: 'input', 
        name: 'description',
        message: 'Description:',
        validate: (input) => input.trim().length >= 10 || 'Description must be at least 10 characters'
      },
      {
        type: 'input',
        name: 'filename',
        message: 'Filename (without extension):',
        default: (answers) => answers.name.toLowerCase().replace(/\s+/g, '-'),
        validate: (input) => /^[a-z0-9-]+$/.test(input) || 'Filename must be lowercase letters, numbers, and dashes only'
      },
      {
        type: 'list',
        name: 'category',
        message: 'Category:',
        choices: ['Business', 'Technology', 'Finance', 'Operations', 'Strategy', 'Other']
      }
    ]);
    
    return config;
  }
  
  // CRITICAL: Process signal handling to prevent crashes
  private setupSignalHandlers(): void {
    process.on('SIGINT', () => {
      console.log(chalk.yellow('\n👋 Creation cancelled by user.'));
      process.exit(0);
    });
    
    process.on('SIGTERM', () => {
      console.log(chalk.yellow('\n👋 Creation cancelled.'));
      process.exit(0);
    });
  }
}

interface CustomizationConfig {
  name: string;
  description: string; 
  filename: string;
  category: string;
}
```

## Implementation Plan

### Phase 1: Discovery Fix (Day 1 - 4 hours)

#### Morning Implementation (2 hours)
```bash
# File changes required:
src/framework/discovery/SimulationDiscovery.ts    # NEW - Core discovery logic
src/framework/discovery/index.ts                  # NEW - Export discovery classes
src/cli/commands/list.ts                          # MODIFY - Use new discovery system
src/framework/SimulationRegistry.ts               # MODIFY - Integrate discovery
```

**Implementation Steps:**
1. **Create SimulationDiscovery class** (45 minutes)
   - Multi-path directory scanning
   - YAML metadata extraction
   - Validation integration
   
2. **Enhance list command** (45 minutes)
   - Rich output formatting
   - Category grouping
   - Usage hints display
   
3. **Integration testing** (30 minutes)
   - Verify all 8 examples discovered
   - Test with missing directories
   - Validate output formatting

#### Afternoon Enhancement (2 hours)
```typescript
// Advanced features for better UX
class ListCommand {
  // Add search functionality
  async search(query: string): Promise<void> {
    const results = await this.discovery.search(query);
    this.displayResults(results);
  }
  
  // Add filtering by category
  async filterCategory(category: string): Promise<void> {
    const results = await this.discovery.filterByCategory(category);  
    this.displayResults(results);
  }
  
  // Add detailed view
  async showDetailed(): Promise<void> {
    const sims = await this.discovery.discover();
    this.displayDetailed(sims);
  }
}
```

**CLI Integration:**
```bash
# Enhanced list command options
npm run cli list                    # Basic listing
npm run cli list --category Business  # Filter by category  
npm run cli list --search "roi"       # Search by keyword
npm run cli list --detailed           # Show full metadata
npm run cli list --show-invalid       # Include invalid simulations
```

### Phase 2: Interactive Creation Fix (Day 2-3 - 8 hours)

#### Root Cause Investigation (Day 2 Morning - 2 hours)
```bash
# Debug current interactive creation failure
1. Add extensive logging to identify crash point
2. Test prompt handling in isolation  
3. Check async/await and signal handling
4. Validate inquirer.js configuration
```

**Likely Issues & Fixes:**
```typescript
// Issue 1: Unhandled Promise Rejection
async executeInteractive(): Promise<void> {
  try {
    // BEFORE: No error handling
    const responses = await inquirer.prompt([...]);
    
    // AFTER: Comprehensive error handling  
    const responses = await inquirer.prompt([...]);
  } catch (error) {
    this.handlePromptError(error); // NEW
  }
}

// Issue 2: Signal Handling
constructor() {
  this.setupSignalHandlers(); // NEW - Handle Ctrl+C gracefully
}

// Issue 3: Process Exit Handling  
private handlePromptError(error: any): void {
  if (error.message.includes('User force closed')) {
    console.log('Creation cancelled by user.');
    process.exit(0); // Clean exit, not crash
  }
  throw error;
}
```

#### Enhanced Creation Workflow (Day 2 Afternoon + Day 3 - 6 hours)
```typescript
// Template-based creation workflow
class TemplateCreator {
  async createFromTemplate(templatePath: string, config: CustomizationConfig): Promise<SimulationConfig> {
    // 1. Load template YAML
    const template = await this.loadTemplate(templatePath);
    
    // 2. Apply customizations
    const customized = {
      ...template,
      name: config.name,
      description: config.description,
      category: config.category,
      version: '1.0.0',
      tags: this.generateTags(config)
    };
    
    // 3. Parameter customization (optional)
    if (config.customizeParameters) {
      customized.parameters = await this.promptParameterCustomization(template.parameters);
    }
    
    return customized;
  }
  
  // Interactive parameter customization
  async promptParameterCustomization(parameters: Parameter[]): Promise<Parameter[]> {
    const customized = [...parameters];
    
    for (let i = 0; i < customized.length; i++) {
      const param = customized[i];
      const shouldCustomize = await inquirer.prompt([{
        type: 'confirm',
        name: 'customize',
        message: `Customize parameter "${param.label}"? (current default: ${param.default})`
      }]);
      
      if (shouldCustomize.customize) {
        const newValues = await this.promptParameterValues(param);
        customized[i] = { ...param, ...newValues };
      }
    }
    
    return customized;
  }
}
```

### Phase 3: Documentation Alignment (Day 4 - 2 hours)

#### NPX Reality Check (30 minutes)
```bash
# Test current NPX functionality
npx github:rmurphey/monte-carlo-simulator run examples/simulations/simple-roi-analysis.yaml

# Determine actual status:
# Option A: NPX works -> Document properly  
# Option B: NPX broken -> Remove claims and fix README
```

#### README.md Updates (90 minutes)
```markdown
# BEFORE (Misleading)
## ⚡ TL;DR - Quick Start
**Want to analyze a business decision right now?**

```bash
# Option 1: Instant NPX (Zero Setup) ⚡
npx github:rmurphey/monte-carlo-simulator run examples/simulations/simple-roi-analysis.yaml
```

# AFTER (Truthful and Clear)
## ⚡ TL;DR - Quick Start
**Want to analyze a business decision right now?**

```bash
# Clone and run (5 minutes setup)
git clone https://github.com/rmurphey/monte-carlo-simulator
cd monte-carlo-simulator && npm install && npm run build

# Discover available simulations
npm run cli list

# Run your first analysis  
npm run cli run simple-roi-analysis
```

### 🔍 **Discover Available Simulations** ✨
```bash
# See all available simulations with descriptions
npm run cli list

# Filter by category
npm run cli list --category Business

# Search for specific topics
npm run cli list --search "roi"

# Detailed information
npm run cli list --detailed
```
```

### Phase 4: Workflow Enhancement (Day 5 - 4 hours)

#### Enhanced Help System
```typescript
// src/cli/help/WorkflowGuide.ts (NEW)
export class WorkflowGuide {
  static getDiscoveryHelp(): string {
    return `
${chalk.cyan.bold('🔍 Discovery Workflow')}

1. ${chalk.green('List simulations')}: npm run cli list
2. ${chalk.green('Pick one')}: Find interesting simulation from list  
3. ${chalk.green('Run it')}: npm run cli run <simulation-name>
4. ${chalk.green('Explore parameters')}: npm run cli run <simulation-name> --list-params
5. ${chalk.green('Customize')}: npm run cli run <simulation-name> --set param=value

${chalk.gray('Example flow:')}
${chalk.gray('  npm run cli list                    # Find "simple-roi-analysis"')}
${chalk.gray('  npm run cli run simple-roi-analysis # Run with defaults')}
${chalk.gray('  npm run cli run simple-roi-analysis --set investment=100000')}
`;
  }
  
  static getCreationHelp(): string {
    return `
${chalk.cyan.bold('✨ Creation Workflow')}

1. ${chalk.green('Start interactive')}: npm run cli create --interactive
2. ${chalk.green('Choose template')}: Pick existing example to modify
3. ${chalk.green('Customize')}: Set name, description, parameters  
4. ${chalk.green('Save & validate')}: Creates new YAML file
5. ${chalk.green('Test run')}: Immediately test your new simulation

${chalk.gray('Or copy manually:')}
${chalk.gray('  cp examples/simulations/simple-roi-analysis.yaml my-analysis.yaml')}
${chalk.gray('  # Edit my-analysis.yaml')}
${chalk.gray('  npm run cli validate my-analysis.yaml')}
${chalk.gray('  npm run cli run my-analysis.yaml')}
`;
  }
}
```

#### Command Chaining Hints
```typescript
// Enhanced CLI output with workflow suggestions
class CommandHints {
  static showAfterList(simulations: SimulationMetadata[]): void {
    if (simulations.length > 0) {
      const first = simulations[0];
      console.log(chalk.gray('\n💡 Next steps:'));
      console.log(chalk.gray(`   Try it: npm run cli run ${first.id}`));
      console.log(chalk.gray(`   Customize: npm run cli run ${first.id} --set param=value`));
      console.log(chalk.gray(`   Create new: npm run cli create --interactive`));
    }
  }
  
  static showAfterRun(simulationId: string): void {
    console.log(chalk.gray('\n💡 What\'s next?'));
    console.log(chalk.gray(`   Parameters: npm run cli run ${simulationId} --list-params`));
    console.log(chalk.gray(`   Customize: npm run cli run ${simulationId} --set param=newvalue`));
    console.log(chalk.gray(`   Create similar: npm run cli create --interactive`));
    console.log(chalk.gray(`   More simulations: npm run cli list`));
  }
}
```

## Testing Strategy

### Unit Tests
```typescript
// tests/discovery/SimulationDiscovery.test.ts
describe('SimulationDiscovery', () => {
  let discovery: SimulationDiscovery;
  let testDir: string;
  
  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sim-test-'));
    discovery = new SimulationDiscovery({
      searchPaths: [testDir]
    });
  });
  
  afterEach(async () => {
    await fs.rm(testDir, { recursive: true });
  });
  
  it('should discover YAML files in search paths', async () => {
    // Create test simulation
    await fs.writeFile(
      path.join(testDir, 'test-sim.yaml'),
      yaml.stringify({
        name: 'Test Simulation',
        description: 'Test simulation for unit testing',
        parameters: [],
        simulation: { logic: 'return {result: 1};' }
      })
    );
    
    const results = await discovery.discover();
    
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe('Test Simulation');
    expect(results[0].filePath).toContain('test-sim.yaml');
  });
  
  it('should handle missing directories gracefully', async () => {
    discovery = new SimulationDiscovery({
      searchPaths: ['/nonexistent/path']
    });
    
    const results = await discovery.discover();
    expect(results).toEqual([]);
  });
  
  it('should extract parameter information', async () => {
    // Create simulation with parameters
    const simWithParams = {
      name: 'Param Test',
      description: 'Test parameter extraction',
      parameters: [
        { key: 'investment', label: 'Investment Amount', type: 'number', default: 50000 },
        { key: 'rate', label: 'Interest Rate', type: 'number', default: 0.05 }
      ],
      simulation: { logic: 'return {result: investment * rate};' }
    };
    
    await fs.writeFile(
      path.join(testDir, 'param-test.yaml'),
      yaml.stringify(simWithParams)
    );
    
    const results = await discovery.discover();
    
    expect(results[0].parameters).toHaveLength(2);
    expect(results[0].parameters[0].key).toBe('investment');
    expect(results[0].parameters[1].key).toBe('rate');
  });
  
  it('should search by name and description', async () => {
    // Create multiple simulations
    await fs.writeFile(path.join(testDir, 'roi-sim.yaml'), yaml.stringify({
      name: 'ROI Analysis',
      description: 'Return on investment calculation',
      parameters: [],
      simulation: { logic: 'return {result: 1};' }
    }));
    
    await fs.writeFile(path.join(testDir, 'market-sim.yaml'), yaml.stringify({
      name: 'Market Analysis', 
      description: 'Market penetration modeling',
      parameters: [],
      simulation: { logic: 'return {result: 1};' }
    }));
    
    const roiResults = await discovery.search('roi');
    const marketResults = await discovery.search('market');
    
    expect(roiResults).toHaveLength(1);
    expect(roiResults[0].name).toBe('ROI Analysis');
    
    expect(marketResults).toHaveLength(1);
    expect(marketResults[0].name).toBe('Market Analysis');
  });
});
```

### Integration Tests  
```typescript
// tests/integration/workflow.test.ts
describe('User Workflow Integration', () => {
  it('should complete discovery → execution workflow', async () => {
    // Test the complete user journey
    const discovery = new SimulationDiscovery();
    
    // 1. User runs list command
    const simulations = await discovery.discover();
    expect(simulations.length).toBeGreaterThan(0);
    
    // 2. User picks first simulation
    const firstSim = simulations[0];
    
    // 3. User runs the simulation
    const result = await runSimulation(firstSim.filePath);
    expect(result.success).toBe(true);
  });
  
  it('should handle creation → validation → execution workflow', async () => {
    // Test interactive creation flow
    const creator = new CreateCommand();
    
    // Mock user input for creation
    const mockResponses = {
      method: 'template',
      template: 'examples/simulations/simple-roi-analysis.yaml',
      name: 'Test Custom Simulation',
      description: 'Created during integration testing',
      filename: 'test-custom'
    };
    
    // Create simulation
    const newSim = await creator.createFromTemplate(mockResponses);
    
    // Validate it works
    expect(newSim.name).toBe('Test Custom Simulation');
    
    // Run it
    const result = await runSimulation(newSim.filePath);
    expect(result.success).toBe(true);
  });
});
```

### End-to-End Tests
```bash
#!/bin/bash
# tests/e2e/user-workflows.sh

echo "🧪 Testing complete user workflows..."

# Test 1: Discovery workflow
echo "1️⃣ Testing discovery workflow"
output=$(npm run cli list 2>&1)
if [[ $output == *"Found"* ]]; then
  echo "✅ List command shows simulations"
else
  echo "❌ List command failed: $output"
  exit 1
fi

# Test 2: Execution workflow  
echo "2️⃣ Testing execution workflow"
output=$(npm run cli run simple-roi-analysis 2>&1)
if [[ $output == *"Results"* ]]; then
  echo "✅ Simulation execution works"
else
  echo "❌ Simulation execution failed: $output"
  exit 1
fi

# Test 3: Interactive creation (mock input)
echo "3️⃣ Testing interactive creation"
# Would use expect or similar for interactive testing

echo "✅ All workflow tests passed"
```

## Risk Mitigation

### Technical Risks

#### Risk: Discovery changes break existing workflows
**Mitigation Strategy:**
```typescript
// Maintain backward compatibility
class SimulationRegistry {
  // KEEP existing method for compatibility
  async findSimulations(directory?: string): Promise<SimulationInfo[]> {
    const discovery = new SimulationDiscovery({
      searchPaths: directory ? [directory] : undefined
    });
    
    const metadata = await discovery.discover();
    return metadata.map(m => this.convertToLegacyFormat(m));
  }
  
  // NEW enhanced discovery
  getDiscovery(): SimulationDiscovery {
    return new SimulationDiscovery();
  }
}
```

#### Risk: Interactive creation still crashes after fix
**Mitigation Strategy:**
```typescript
// Fallback creation methods
class CreateCommand {
  async executeInteractive(): Promise<void> {
    try {
      await this.fullInteractiveFlow();
    } catch (error) {
      console.log('Interactive mode failed, trying simple mode...');
      await this.simpleCreationFlow(); // Fallback
    }
  }
  
  // Simple creation without complex prompts
  private async simpleCreationFlow(): Promise<void> {
    // Basic name/description only, minimal interaction
  }
}
```

### User Experience Risks

#### Risk: Too many discovery options confuse users
**Mitigation Strategy:**
- Default to simple compact view
- Progressive disclosure (basic → detailed → advanced)
- Clear help text for each option

#### Risk: Performance issues with large simulation sets
**Mitigation Strategy:**
```typescript
class SimulationDiscovery {
  async discover(): Promise<SimulationMetadata[]> {
    // Lazy loading and caching
    if (this.cache.isValid()) {
      return this.cache.get();
    }
    
    const results = await this.scanWithTimeout();
    this.cache.set(results);
    return results;
  }
  
  private async scanWithTimeout(): Promise<SimulationMetadata[]> {
    // Add 10-second timeout to prevent hanging
    return Promise.race([
      this.actualScan(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Discovery timeout')), 10000)
      )
    ]);
  }
}
```

## Success Metrics

### Immediate Impact Metrics (Week 1)
- [ ] **Discovery Success**: `npm run cli list` returns >0 simulations (currently returns 0)
- [ ] **Creation Success**: Interactive creation completes without crashing (currently crashes immediately)  
- [ ] **Documentation Accuracy**: All README examples work as documented (currently many fail)
- [ ] **User Journey Time**: Discovery → execution in <5 minutes (currently impossible due to broken discovery)

### User Experience Metrics (Week 2-4)  
- [ ] **First Success Time**: New user completes first simulation run within 10 minutes
- [ ] **Creation Adoption**: >50% of users try interactive creation (vs 0% currently due to crashes)
- [ ] **Discovery Usage**: Users can find relevant simulations without filesystem exploration
- [ ] **Workflow Clarity**: Users understand next steps after each command

### Technical Quality Metrics
- [ ] **Test Coverage**: All critical path workflows covered by automated tests
- [ ] **Performance**: Discovery completes in <3 seconds even with 20+ simulations  
- [ ] **Reliability**: Interactive creation succeeds >95% of attempts (vs 0% currently)
- [ ] **Backward Compatibility**: All existing functionality continues working

## Deployment Plan

### Pre-Deployment Validation
```bash
# Comprehensive validation before release
npm run test:unit                    # All unit tests pass
npm run test:integration            # Integration tests pass  
npm run test:e2e                    # End-to-end workflow tests
npm run test:docs                   # All documented examples work
npm run lint                        # Code quality check
npm run build                       # Successful build
```

### Phased Rollout
1. **Phase 1 (Day 1)**: Discovery fix only - validate list command works
2. **Phase 2 (Day 2-3)**: Interactive creation fix - validate creation workflow  
3. **Phase 3 (Day 4)**: Documentation updates - ensure all examples work
4. **Phase 4 (Day 5)**: Workflow enhancements - full user experience polish

### Rollback Plan
```bash
# If critical issues found, quick rollback capability
git tag before-workflow-fixes                    # Tag current state
# Deploy changes...
# If problems:
git reset --hard before-workflow-fixes           # Quick rollback
npm run build && npm test                        # Validate rollback works
```

## Next Steps

1. **Start with Phase 1** - Discovery fix has highest impact, lowest risk
2. **Validate immediately** - Test list command shows existing examples  
3. **Get user feedback** - Confirm improved discovery meets user needs
4. **Proceed incrementally** - Each phase adds value independently
5. **Monitor metrics** - Track user success rates and workflow completion times

This design addresses the foundational user experience blockers that currently prevent framework adoption. Once these core workflows function properly, advanced features like export capabilities become valuable additions rather than solutions to non-existent user bases.

The implementation prioritizes immediate user impact while maintaining architectural quality and backward compatibility. Each phase delivers measurable user value and can be deployed independently.