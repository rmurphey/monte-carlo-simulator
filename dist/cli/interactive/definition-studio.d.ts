import { SimulationConfig } from '../config/schema';
import { BusinessTemplate } from './template-library';
export interface AgentContext {
    intent: 'roi_analysis' | 'investment_planning' | 'growth_modeling' | 'risk_assessment' | 'capacity_planning' | 'software_investment' | 'marketing_campaign' | 'team_scaling';
    businessContext: string;
    keyParameters: string[];
    expectedOutputs: string[];
    industryContext?: string;
    timeHorizon?: 'quarterly' | 'annual' | 'multi_year';
    naturalLanguageQuery?: string;
    targetAudience?: 'technical' | 'business' | 'executive';
    complexityLevel?: 'simple' | 'moderate' | 'advanced';
    priorityMetrics?: string[];
}
export interface ValidationResult {
    valid: boolean;
    errors: ValidationError[];
    warnings?: string[];
    businessInsights?: string[];
}
export interface ValidationError {
    field: string;
    message: string;
    suggestion: string;
    businessContext?: string;
    exampleValue?: any;
}
export interface WorkflowStep {
    id: string;
    title: string;
    description: string;
    validator: (_data: any, _context: WorkflowContext) => Promise<ValidationResult>;
    nextStep: (_data: any, _context: WorkflowContext) => string | null;
    canSkip?: boolean;
    businessTips?: string[];
}
export interface WorkflowContext {
    currentStep: string | null;
    completedSteps: string[];
    simulationData: Partial<SimulationConfig>;
    agentContext?: AgentContext;
    templateUsed?: BusinessTemplate;
    validationHistory: ValidationResult[];
}
export interface StudioOptions {
    interactive?: boolean;
    verbose?: boolean;
    output?: string;
    template?: string;
    agentMode?: boolean;
    quickStart?: boolean;
}
/**
 * Interactive Definition Studio - Advanced guided simulation creation
 *
 * Extends the existing config-builder with:
 * - Guided step-by-step workflow
 * - Real-time validation with business context
 * - Agent-optimized creation patterns
 * - Advanced template integration
 * - Progress tracking and navigation
 */
export declare class InteractiveDefinitionStudio {
    private configBuilder;
    private templateLibrary;
    private loader;
    private workflow;
    constructor();
    /**
     * Main entry point for interactive simulation creation
     */
    createSimulation(options?: StudioOptions): Promise<string>;
    /**
     * Quick start with business intelligence templates
     */
    quickStart(): Promise<SimulationConfig>;
    /**
     * Customize simulation from existing template
     */
    customizeFromTemplate(templateId: string): Promise<SimulationConfig>;
    /**
     * Agent-optimized creation workflow
     */
    agentOptimizedCreation(): Promise<SimulationConfig>;
    /**
     * Full guided interactive creation
     */
    guidedInteractiveCreation(): Promise<SimulationConfig>;
    /**
     * Template customization with business guidance
     */
    private customizeTemplate;
    /**
     * Gather context for agent-optimized workflows
     */
    private gatherAgentContext;
    /**
     * Suggest templates based on agent context
     */
    private suggestTemplatesForContext;
    /**
     * Customize template for agent with context
     */
    private customizeTemplateForAgent;
    /**
     * Build from scratch with agent context
     */
    private buildFromScratchWithContext;
    /**
     * Validate configuration with business context
     */
    private validateConfiguration;
    /**
     * Quick test configuration during creation
     */
    private quickTestConfiguration;
    /**
     * Save configuration to file
     */
    private saveConfiguration;
    /**
     * Generate appropriate filename for configuration
     */
    private generateFilename;
    /**
     * Display success report
     */
    private displaySuccessReport;
    private customizeBasicInfo;
    private customizeKeyParameters;
    private customizeAdvancedOptions;
    private generateSuggestion;
}
/**
 * Guided Workflow Engine for step-by-step creation
 */
export declare class GuidedWorkflow {
    private steps;
    constructor();
    executeWorkflow(startStep: string, context: WorkflowContext): Promise<SimulationConfig>;
    private executeStep;
    private initializeSteps;
}
/**
 * Simple watch-based validator for real-time feedback
 * Uses existing ConfigurationValidator + simple file watching
 */
export declare class RealTimeValidator {
    private configValidator;
    constructor();
    /**
     * Quick validation for immediate feedback
     */
    validateConfig(config: Partial<SimulationConfig>): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Quick YAML syntax check
     */
    validateYaml(yamlContent: string): {
        valid: boolean;
        error?: string;
    };
    /**
     * Preview structure without complex formatting
     */
    previewConfig(config: Partial<SimulationConfig>): string;
}
/**
 * Agent-optimized studio for context-aware simulation creation
 * Provides sophisticated intent recognition and template matching
 */
export declare class AgentOptimizedStudio {
    private templateLibrary;
    constructor();
    /**
     * Initialize template library for agent operations
     */
    initialize(): Promise<void>;
    /**
     * Parse natural language query into structured agent context
     */
    parseIntent(naturalLanguageQuery: string): Partial<AgentContext>;
    /**
     * Find best template match based on agent context with intelligent BI-aware scoring
     */
    findBestTemplate(context: AgentContext): Promise<BusinessTemplate | null>;
    /**
     * Calculate comprehensive template matching score using business intelligence metadata
     */
    private calculateTemplateScore;
    /**
     * Check if template matches the given intent
     */
    private matchesIntent;
    /**
     * Infer business model from agent context
     */
    private inferBusinessModel;
    /**
     * Calculate keyword relevance score between template and context
     */
    private calculateKeywordRelevance;
    /**
     * Generate context-aware parameter suggestions
     */
    generateParameterSuggestions(template: BusinessTemplate, context: AgentContext): Record<string, any>;
    /**
     * Validate agent context and provide structured feedback
     */
    validateContext(context: AgentContext): {
        valid: boolean;
        suggestions: string[];
        warnings: string[];
    };
}
/**
 * Agent-optimized entry point for natural language integration
 */
export declare function generateFromIntent(context: AgentContext): Promise<string>;
/**
 * Enhanced agent entry point with natural language processing
 */
export declare function generateFromNaturalLanguage(query: string, options?: {
    validate?: boolean;
}): Promise<string>;
