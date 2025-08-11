/**
 * Utility for resolving package-relative paths in both development and NPX contexts
 *
 * When running locally: paths resolve relative to project root
 * When running via NPX: paths resolve relative to installed package location
 */
export declare class PackagePathResolver {
    private packageRoot;
    constructor();
    private findPackageRoot;
    /**
     * Get the absolute path to examples/simulations directory
     */
    getExamplesPath(): string;
    /**
     * Get multiple search paths for simulations, in priority order
     */
    getSimulationSearchPaths(): string[];
    /**
     * Check if we're running in NPX context vs local development
     */
    isNPXContext(): boolean;
    /**
     * Resolve a simulation path that works in both contexts
     */
    resolveSimulationPath(simulationId: string): Promise<string | null>;
}
export declare const packagePaths: PackagePathResolver;
