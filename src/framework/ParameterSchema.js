export class ParameterSchema {
    constructor(definitions) {
        this.definitions = new Map();
        this.groups = [];
        for (const def of definitions) {
            this.definitions.set(def.key, def);
        }
    }
    addGroup(group) {
        // Validate that all parameters in the group exist
        for (const paramKey of group.parameters) {
            if (!this.definitions.has(paramKey)) {
                throw new Error(`Parameter '${paramKey}' in group '${group.name}' does not exist`);
            }
        }
        this.groups.push(group);
    }
    getGroups() {
        return [...this.groups];
    }
    getDefinitions() {
        return Array.from(this.definitions.values());
    }
    getDefinition(key) {
        return this.definitions.get(key);
    }
    validateParameter(key, value) {
        const def = this.definitions.get(key);
        if (!def) {
            return {
                isValid: false,
                errors: [`Unknown parameter: ${key}`]
            };
        }
        const errors = [];
        // Check for required parameters
        if (value === undefined || value === null) {
            errors.push(`Parameter '${def.label}' is required`);
            return { isValid: false, errors };
        }
        // Type-specific validation
        switch (def.type) {
            case 'number': {
                const numValue = Number(value);
                if (isNaN(numValue)) {
                    errors.push(`Parameter '${def.label}' must be a number`);
                }
                else {
                    if (def.min !== undefined && numValue < def.min) {
                        errors.push(`Parameter '${def.label}' must be >= ${def.min}`);
                    }
                    if (def.max !== undefined && numValue > def.max) {
                        errors.push(`Parameter '${def.label}' must be <= ${def.max}`);
                    }
                    if (def.step !== undefined && def.min !== undefined) {
                        const steps = Math.round((numValue - def.min) / def.step);
                        const expectedValue = def.min + (steps * def.step);
                        if (Math.abs(numValue - expectedValue) > 0.0001) {
                            errors.push(`Parameter '${def.label}' must be in steps of ${def.step}`);
                        }
                    }
                }
                break;
            }
            case 'boolean':
                if (typeof value !== 'boolean') {
                    errors.push(`Parameter '${def.label}' must be a boolean`);
                }
                break;
            case 'select':
                if (!def.options) {
                    errors.push(`Parameter '${def.label}' has no options defined`);
                }
                else if (!def.options.includes(String(value))) {
                    errors.push(`Parameter '${def.label}' must be one of: ${def.options.join(', ')}`);
                }
                break;
            default:
                errors.push(`Unknown parameter type: ${def.type}`);
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    validateParameters(parameters) {
        const allErrors = [];
        // Validate each provided parameter
        for (const [key, value] of Object.entries(parameters)) {
            const result = this.validateParameter(key, value);
            allErrors.push(...result.errors);
        }
        // Check for missing required parameters
        for (const def of this.definitions.values()) {
            if (!(def.key in parameters)) {
                allErrors.push(`Missing required parameter: ${def.label}`);
            }
        }
        return {
            isValid: allErrors.length === 0,
            errors: allErrors
        };
    }
    getDefaultParameters() {
        const defaults = {};
        for (const def of this.definitions.values()) {
            defaults[def.key] = def.defaultValue;
        }
        return defaults;
    }
    coerceParameters(parameters) {
        const coerced = {};
        for (const [key, value] of Object.entries(parameters)) {
            const def = this.definitions.get(key);
            if (!def) {
                coerced[key] = value;
                continue;
            }
            switch (def.type) {
                case 'number':
                    coerced[key] = Number(value);
                    break;
                case 'boolean':
                    coerced[key] = Boolean(value);
                    break;
                case 'select':
                    coerced[key] = String(value);
                    break;
                default:
                    coerced[key] = value;
            }
        }
        return coerced;
    }
    generateUISchema() {
        const groupedParams = new Set();
        const groups = this.groups.map(group => ({
            name: group.name,
            description: group.description,
            fields: group.parameters.map(paramKey => {
                groupedParams.add(paramKey);
                const def = this.definitions.get(paramKey);
                return this.definitionToUIField(def);
            })
        }));
        const ungrouped = Array.from(this.definitions.values())
            .filter(def => !groupedParams.has(def.key))
            .map(def => this.definitionToUIField(def));
        return { groups, ungrouped };
    }
    definitionToUIField(def) {
        const constraints = {};
        if (def.min !== undefined)
            constraints.min = def.min;
        if (def.max !== undefined)
            constraints.max = def.max;
        if (def.step !== undefined)
            constraints.step = def.step;
        return {
            key: def.key,
            label: def.label,
            type: def.type,
            defaultValue: def.defaultValue,
            constraints: Object.keys(constraints).length > 0 ? constraints : undefined,
            options: def.options,
            description: def.description
        };
    }
}
//# sourceMappingURL=ParameterSchema.js.map