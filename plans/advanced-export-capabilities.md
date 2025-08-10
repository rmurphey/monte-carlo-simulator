# Advanced Export Capabilities Plan

## Strategic Context

### Problem Statement
Currently, Monte Carlo simulation results are only displayed in the terminal as formatted text. Business users need structured data formats for:
- Spreadsheet analysis and visualization
- Integration with BI tools and dashboards  
- Programmatic consumption by other systems
- Report generation and stakeholder presentations

### Business Value
- **Executive Reporting**: Structured data enables executive dashboard integration
- **Data Analysis**: CSV exports allow detailed analysis in Excel/Google Sheets
- **System Integration**: JSON exports enable programmatic consumption by other tools
- **Agent Capabilities**: AI agents can chain simulations with data processing workflows

## User Stories

### Business Users
- **US1**: As a business analyst, I want to export simulation results to CSV so I can analyze them in Excel
- **US2**: As a CTO, I want JSON exports so I can integrate Monte Carlo analysis into our BI dashboard
- **US3**: As a consultant, I want formatted data exports so I can include them in client presentations

### AI Agents  
- **US4**: As an AI agent, I want structured JSON output so I can chain multiple simulations programmatically
- **US5**: As an AI agent, I want to generate formatted reports combining multiple simulation runs
- **US6**: As an AI agent, I want to feed simulation results into other analysis tools

### Developers
- **US7**: As a developer, I want multiple export formats so I can integrate simulations into various workflows
- **US8**: As a developer, I want programmatic access to raw simulation data for custom analysis

## Technical Requirements

### CLI Interface Design
```bash
# Basic export options
npm run cli run simulation.yaml --format json
npm run cli run simulation.yaml --format csv
npm run cli run simulation.yaml --format json --output results.json
npm run cli run simulation.yaml --format csv --output analysis.csv

# Advanced options
npm run cli run simulation.yaml --format json --pretty
npm run cli run simulation.yaml --format csv --include-raw-data
npm run cli run simulation.yaml --format json | jq '.results[].roi.mean'
```

### Output Format Specifications

#### JSON Export Structure
```json
{
  "simulation": {
    "name": "AI Tool Investment Analysis",
    "version": "1.0.0", 
    "timestamp": "2025-08-09T23:45:12.345Z",
    "parameters": {
      "initialInvestment": 50000,
      "monthlyBenefit": 8000,
      "adoptionRate": 0.8
    }
  },
  "execution": {
    "iterations": 1000,
    "duration": "1.24s",
    "seed": 12345
  },
  "results": {
    "roi": {
      "mean": 240.5,
      "stddev": 45.2,
      "min": 120.0,
      "max": 380.0,
      "p10": 185.2,
      "p50": 238.1,
      "p90": 305.8
    },
    "annualBenefit": {
      "mean": 96000,
      "stddev": 18000,
      "min": 48000,
      "max": 152000,
      "p10": 74000,
      "p50": 95000,
      "p90": 122000
    }
  },
  "rawData": [
    {"iteration": 1, "roi": 245.2, "annualBenefit": 98000},
    {"iteration": 2, "roi": 220.1, "annualBenefit": 88000}
  ]
}
```

#### CSV Export Structure  
```csv
metric,mean,stddev,min,max,p10,p50,p90
roi,240.5,45.2,120.0,380.0,185.2,238.1,305.8
annualBenefit,96000,18000,48000,152000,74000,95000,122000
```

#### Raw Data CSV (with --include-raw-data)
```csv
iteration,roi,annualBenefit,paybackPeriod
1,245.2,98000,7.2
2,220.1,88000,8.1
3,268.5,107000,6.8
```

## Implementation Architecture

### Component Structure
```
src/
├── framework/
│   ├── exporters/
│   │   ├── BaseExporter.ts          # Abstract exporter interface
│   │   ├── JsonExporter.ts          # JSON format implementation
│   │   ├── CsvExporter.ts           # CSV format implementation
│   │   └── index.ts                 # Exporter factory
│   └── results/
│       ├── SimulationResult.ts      # Enhanced result structure
│       └── ResultFormatter.ts       # Format conversion utilities
├── cli/
│   ├── commands/
│   │   └── run.ts                   # Enhanced with export options
│   └── options/
│       └── export-options.ts        # CLI export flag definitions
└── test/
    ├── exporters/                   # Export format tests
    └── integration/                 # End-to-end export tests
```

### Key Classes

#### BaseExporter Interface
```typescript
export interface ExportOptions {
  format: 'json' | 'csv';
  outputFile?: string;
  pretty?: boolean;
  includeRawData?: boolean;
  includeMeta?: boolean;
}

export abstract class BaseExporter {
  abstract export(result: SimulationResult, options: ExportOptions): Promise<string>;
  abstract getFileExtension(): string;
  abstract getContentType(): string;
}
```

#### Enhanced SimulationResult
```typescript
export interface SimulationResult {
  simulation: {
    name: string;
    version: string;
    timestamp: Date;
    parameters: Record<string, any>;
  };
  execution: {
    iterations: number;
    duration: string;
    seed?: number;
  };
  results: Record<string, StatisticalSummary>;
  rawData?: Array<Record<string, number>>;
}

export interface StatisticalSummary {
  mean: number;
  stddev: number;
  min: number;
  max: number;
  p10: number;
  p50: number;
  p90: number;
}
```

## Development Phases

### Phase 1: Core Export Infrastructure (Day 1)
- [ ] Create BaseExporter interface and factory
- [ ] Enhance SimulationResult with metadata
- [ ] Add CLI export options parsing
- [ ] Implement basic JSON exporter
- [ ] Add unit tests for core components

### Phase 2: CSV Export Implementation (Day 2)  
- [ ] Implement CsvExporter with statistical summary
- [ ] Add raw data CSV export option
- [ ] Handle CSV formatting edge cases
- [ ] Add CSV-specific tests
- [ ] Validate Excel/Google Sheets compatibility

### Phase 3: CLI Integration (Day 3)
- [ ] Integrate exporters with run command
- [ ] Add file output capability
- [ ] Implement stdout vs file output logic
- [ ] Add progress indicators for large exports
- [ ] Update CLI help documentation

### Phase 4: Testing & Documentation (Day 4)
- [ ] Comprehensive integration testing
- [ ] Update README with export examples
- [ ] Add export examples to docs/CLI_REFERENCE.md
- [ ] Test with all existing simulation examples
- [ ] Validate documentation examples work

## Testing Strategy

### Unit Tests
```typescript
describe('JsonExporter', () => {
  it('should export statistical summary correctly', () => {
    const result = createMockResult();
    const exported = jsonExporter.export(result, {format: 'json'});
    expect(exported).toMatchSnapshot();
  });
  
  it('should include raw data when requested', () => {
    const result = createMockResult();
    const exported = jsonExporter.export(result, {
      format: 'json', 
      includeRawData: true
    });
    expect(JSON.parse(exported).rawData).toBeDefined();
  });
});
```

### Integration Tests
```bash
# Test all export formats with real simulations
npm run test:exports

# Validate CSV imports into Excel
npm run test:csv-compatibility

# Test large dataset exports
npm run test:export-performance
```

## Performance Considerations

### Memory Usage
- **Raw data export**: Optional to prevent memory issues with large iterations
- **Streaming output**: For very large datasets (>10,000 iterations)
- **Compression**: Consider gzip option for large JSON exports

### File Handling
- **Atomic writes**: Ensure complete files or no files
- **Path validation**: Secure file path handling
- **Overwrite protection**: Warn before overwriting existing files

## Agent Experience Enhancements

### Programmatic Usage Patterns
```bash
# Agent workflow: Generate and analyze
npm run cli run simulation.yaml --format json --output analysis.json
npm run cli run scenario-a.yaml --format json | jq '.results.roi.mean' > roi-a.txt
npm run cli run scenario-b.yaml --format json | jq '.results.roi.mean' > roi-b.txt

# Agent workflow: Batch analysis
for sim in simulations/*.yaml; do
  npm run cli run "$sim" --format csv --output "results/$(basename "$sim" .yaml).csv"
done

# Agent workflow: Combined reporting
npm run cli run conservative.yaml --format json > conservative.json
npm run cli run aggressive.yaml --format json > aggressive.json
node scripts/compare-scenarios.js conservative.json aggressive.json
```

### AI-Friendly Features
- **Consistent JSON structure**: Same schema across all simulations
- **Metadata inclusion**: Full context for agents to understand results
- **Error handling**: Clear error messages for invalid export options
- **Documentation**: Agent-focused examples in docs/AGENT.md

## Success Criteria

### Functional Requirements
- [ ] JSON export includes all statistical summaries
- [ ] CSV export opens correctly in Excel and Google Sheets
- [ ] File output saves to specified paths safely
- [ ] Raw data export includes all iteration results
- [ ] Export works with all existing simulation examples

### Performance Requirements
- [ ] Export adds <10% overhead to simulation runtime
- [ ] Large exports (5000+ iterations) complete in <30 seconds
- [ ] Memory usage stays reasonable for raw data exports
- [ ] File I/O operations are atomic and safe

### User Experience Requirements
- [ ] Clear CLI help shows export options
- [ ] Intuitive flag names (--format, --output)
- [ ] Helpful error messages for invalid options
- [ ] Progress indication for large exports

### Agent Experience Requirements
- [ ] Consistent JSON schema across simulations
- [ ] Programmatic access to all result components
- [ ] Pipeline-friendly output formats
- [ ] Complete metadata for result interpretation

## Documentation Updates

### README.md Additions
```bash
## Exporting Results

### JSON Export
npm run cli run simulation.yaml --format json --output results.json

### CSV Export for Excel Analysis
npm run cli run simulation.yaml --format csv --output analysis.csv

### Programmatic Usage
npm run cli run simulation.yaml --format json | jq '.results.roi.mean'
```

### docs/CLI_REFERENCE.md
- Complete export option documentation
- Export format specifications  
- Integration examples with external tools
- Troubleshooting common export issues

### docs/AGENT.md
- Agent-specific export patterns
- Programmatic result consumption
- Multi-simulation analysis workflows
- JSON schema documentation

## Risk Mitigation

### Technical Risks
- **Large memory usage**: Mitigated by optional raw data export
- **File permission issues**: Mitigated by path validation and error handling
- **Format compatibility**: Mitigated by thorough testing with Excel/Sheets

### Business Risks
- **Feature creep**: Mitigated by focused scope on JSON/CSV only
- **Breaking changes**: Mitigated by additive-only CLI changes
- **User confusion**: Mitigated by clear documentation and examples

## Next Steps

1. **Create detailed design document** in designs/advanced-export-capabilities.md
2. **Implement Phase 1** (core infrastructure) 
3. **Test with existing simulations** to ensure compatibility
4. **Update documentation** with export examples
5. **Validate with business users** for format requirements

This export capability will significantly enhance the framework's business value while maintaining the agent-friendly approach that makes the system easy to use programmatically.