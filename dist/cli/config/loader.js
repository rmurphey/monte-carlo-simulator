"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigurationLoader = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
const yaml = __importStar(require("js-yaml"));
const schema_1 = require("./schema");
class ConfigurationLoader {
    validator = new schema_1.ConfigurationValidator();
    loadedConfigs = new Map(); // Cache to prevent circular references
    async loadConfig(filePath) {
        try {
            // Normalize path to prevent circular reference issues
            const normalizedPath = (0, path_1.resolve)(filePath);
            // Check cache first
            if (this.loadedConfigs.has(normalizedPath)) {
                return this.loadedConfigs.get(normalizedPath);
            }
            const content = await fs_1.promises.readFile(filePath, 'utf8');
            let config = this.parseContent(content, filePath);
            // Handle base simulation inheritance
            if (config.baseSimulation) {
                config = await this.mergeWithBase(config, filePath);
            }
            const validation = this.validator.validateConfig(config);
            if (!validation.valid) {
                throw new Error(`Invalid configuration in ${filePath}:\n${validation.errors.join('\n')}`);
            }
            // Cache the resolved config
            this.loadedConfigs.set(normalizedPath, config);
            return config;
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to load configuration from ${filePath}: ${error.message}`);
            }
            throw error;
        }
    }
    async mergeWithBase(config, configPath) {
        const basePath = this.resolveBasePath(config.baseSimulation, configPath);
        const baseConfig = await this.loadConfig(basePath);
        // Create merged configuration
        const merged = {
            // Base simulation properties as defaults
            name: config.name,
            category: config.category,
            description: config.description,
            version: config.version,
            tags: config.tags,
            // Parameters: merge arrays, child overrides base
            parameters: this.mergeParameters(baseConfig.parameters, config.parameters),
            // Groups: merge arrays, child overrides base  
            groups: this.mergeGroups(baseConfig.groups, config.groups),
            // Outputs: merge arrays, child overrides base (child can add or override outputs)
            outputs: this.mergeOutputs(baseConfig.outputs || [], config.outputs || []),
            // Simulation logic: child overrides base completely
            simulation: {
                logic: config.simulation?.logic || baseConfig.simulation?.logic || ''
            }
        };
        return merged;
    }
    resolveBasePath(basePath, configPath) {
        if ((0, path_1.isAbsolute)(basePath)) {
            return basePath;
        }
        // Resolve relative to the config file's directory
        return (0, path_1.resolve)((0, path_1.dirname)(configPath), basePath);
    }
    mergeParameters(baseParams, childParams) {
        const merged = new Map();
        // Add all base parameters
        for (const param of baseParams) {
            merged.set(param.key, { ...param });
        }
        // Override with child parameters
        for (const param of childParams) {
            merged.set(param.key, { ...param });
        }
        return Array.from(merged.values());
    }
    mergeGroups(baseGroups = [], childGroups = []) {
        const merged = new Map();
        // Add all base groups
        for (const group of baseGroups) {
            merged.set(group.name, { ...group, parameters: [...group.parameters] });
        }
        // Override with child groups
        for (const group of childGroups) {
            merged.set(group.name, { ...group, parameters: [...group.parameters] });
        }
        return Array.from(merged.values());
    }
    mergeOutputs(baseOutputs, childOutputs) {
        const merged = new Map();
        // Add all base outputs
        for (const output of baseOutputs) {
            merged.set(output.key, { ...output });
        }
        // Override with child outputs
        for (const output of childOutputs) {
            merged.set(output.key, { ...output });
        }
        return Array.from(merged.values());
    }
    async loadMultipleConfigs(directory) {
        try {
            const files = await fs_1.promises.readdir(directory);
            const configFiles = files.filter(file => file.endsWith('.yaml') || file.endsWith('.yml') || file.endsWith('.json'));
            const configs = [];
            const errors = [];
            for (const file of configFiles) {
                try {
                    const config = await this.loadConfig((0, path_1.join)(directory, file));
                    configs.push(config);
                }
                catch (error) {
                    errors.push(`${file}: ${error instanceof Error ? error.message : String(error)}`);
                }
            }
            if (errors.length > 0) {
                console.warn(`⚠️  Failed to load some configurations:\n${errors.join('\n')}`);
            }
            return configs;
        }
        catch (error) {
            throw new Error(`Failed to load configurations from ${directory}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async saveConfig(filePath, config) {
        try {
            // Validate before saving
            const validation = this.validator.validateConfig(config);
            if (!validation.valid) {
                throw new Error(`Invalid configuration:\n${validation.errors.join('\n')}`);
            }
            // Ensure directory exists
            await fs_1.promises.mkdir((0, path_1.dirname)(filePath), { recursive: true });
            // Determine format from extension
            const ext = (0, path_1.extname)(filePath).toLowerCase();
            let content;
            if (ext === '.json') {
                content = JSON.stringify(config, null, 2);
            }
            else {
                // Default to YAML
                content = yaml.dump(config, {
                    indent: 2,
                    lineWidth: 100,
                    noRefs: true,
                    sortKeys: false
                });
            }
            await fs_1.promises.writeFile(filePath, content, 'utf8');
        }
        catch (error) {
            throw new Error(`Failed to save configuration to ${filePath}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    parseContent(content, filePath) {
        const ext = (0, path_1.extname)(filePath).toLowerCase();
        if (ext === '.json') {
            try {
                return JSON.parse(content);
            }
            catch (error) {
                throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
        else {
            // Assume YAML for .yaml, .yml, or any other extension
            try {
                return yaml.load(content);
            }
            catch (error) {
                throw new Error(`Invalid YAML: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    }
    async validateConfigFile(filePath) {
        try {
            await this.loadConfig(filePath);
            return { valid: true, errors: [] };
        }
        catch (error) {
            return {
                valid: false,
                errors: [error instanceof Error ? error.message : String(error)]
            };
        }
    }
    async getConfigMetadata(filePath) {
        try {
            const config = await this.loadConfig(filePath);
            return {
                name: config.name,
                category: config.category,
                version: config.version,
                parameterCount: config.parameters.length,
                outputCount: config.outputs?.length || 0
            };
        }
        catch {
            return null;
        }
    }
    generateConfigTemplate() {
        return {
            name: 'My Simulation',
            category: 'Finance',
            description: 'Description of what this simulation models',
            version: '1.0.0',
            tags: ['example', 'template'],
            parameters: [
                {
                    key: 'sampleParameter',
                    label: 'Sample Parameter',
                    type: 'number',
                    default: 100,
                    min: 0,
                    max: 1000,
                    description: 'A sample numeric parameter'
                }
            ],
            outputs: [
                {
                    key: 'result',
                    label: 'Result',
                    description: 'The simulation result'
                }
            ],
            simulation: {
                logic: `
// Your simulation logic here
const result = sampleParameter * (0.8 + Math.random() * 0.4)
return { result }
        `.trim()
            }
        };
    }
}
exports.ConfigurationLoader = ConfigurationLoader;
//# sourceMappingURL=loader.js.map