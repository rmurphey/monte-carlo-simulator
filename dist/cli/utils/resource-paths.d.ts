/**
 * Get resource paths for templates, examples, and other bundled resources.
 * Works in both development and NPX installation contexts.
 */
export declare function getResourcePaths(): {
    templates: string;
    examples: string;
    docs: string;
    schemas: string;
};
/**
 * Get the package root directory
 */
export declare function getPackageRoot(): string;
/**
 * Resolve a resource file path, checking multiple possible locations
 * @param filename - File to find (e.g., 'simple-roi-analysis.yaml')
 * @param category - Category of resource ('templates', 'examples', 'docs')
 */
export declare function resolveResourceFile(filename: string, category: 'templates' | 'examples' | 'docs'): string | null;
/**
 * List available resources in a category
 */
export declare function listResourceFiles(category: 'templates' | 'examples' | 'docs'): string[];
