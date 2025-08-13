"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.packagePaths = exports.PackagePathResolver = void 0;
const path_1 = require("path");
const promises_1 = require("fs/promises");
/**
 * Utility for resolving package-relative paths in both development and NPX contexts
 *
 * When running locally: paths resolve relative to project root
 * When running via NPX: paths resolve relative to installed package location
 */
class PackagePathResolver {
    packageRoot;
    constructor() {
        // Find the package root by walking up from this file's location
        this.packageRoot = this.findPackageRoot();
    }
    findPackageRoot() {
        // Start from the compiled CLI location: dist/cli/utils/package-paths.js
        // Need to go up to find package.json: ../../../package.json
        let currentDir = (0, path_1.dirname)((0, path_1.dirname)(__dirname)); // Go up from dist/cli/utils to dist/
        // Try to find package.json by walking up directories
        const possibleRoots = [
            (0, path_1.dirname)(currentDir), // dist/../ (normal case)
            (0, path_1.dirname)((0, path_1.dirname)(currentDir)), // dist/../../ (nested case)
            process.cwd(), // Current working directory (development)
        ];
        for (const root of possibleRoots) {
            // Note: We can't use require() here as it might not exist at runtime
            // But we can assume if we're running, package.json exists somewhere
            return root;
        }
        // Fallback to current working directory
        return process.cwd();
    }
    /**
     * Get the absolute path to examples/simulations directory
     */
    getExamplesPath() {
        return (0, path_1.join)(this.packageRoot, 'examples', 'simulations');
    }
    /**
     * Get multiple search paths for simulations, in priority order
     */
    getSimulationSearchPaths() {
        return [
            // 1. Package examples (works in both NPX and local)
            this.getExamplesPath(),
            // 2. Current directory simulations (user workspace)
            (0, path_1.join)(process.cwd(), 'simulations'),
            // 3. Current directory scenarios (alternative location)
            (0, path_1.join)(process.cwd(), 'scenarios'),
        ];
    }
    /**
     * Check if we're running in NPX context vs local development
     */
    isNPXContext() {
        // NPX typically puts packages in temp directories or global npm cache
        const packagePath = this.packageRoot;
        return packagePath.includes('_npx') ||
            packagePath.includes('.npm') ||
            packagePath.includes('node_modules');
    }
    /**
     * Resolve a simulation path that works in both contexts
     */
    async resolveSimulationPath(simulationId) {
        const searchPaths = this.getSimulationSearchPaths();
        for (const basePath of searchPaths) {
            const possiblePaths = [
                // Direct YAML file
                (0, path_1.join)(basePath, `${simulationId}.yaml`),
                (0, path_1.join)(basePath, `${simulationId}.yml`),
                // Directory-based structure
                (0, path_1.join)(basePath, simulationId, `${simulationId}.yaml`),
                (0, path_1.join)(basePath, simulationId, `${simulationId}.yml`),
                (0, path_1.join)(basePath, simulationId, 'index.yaml'),
                (0, path_1.join)(basePath, simulationId, 'index.yml'),
            ];
            for (const path of possiblePaths) {
                try {
                    await (0, promises_1.access)(path);
                    return path;
                }
                catch {
                    continue;
                }
            }
        }
        return null;
    }
}
exports.PackagePathResolver = PackagePathResolver;
// Export singleton instance
exports.packagePaths = new PackagePathResolver();
//# sourceMappingURL=package-paths.js.map