interface RunOptions {
    scenario?: string;
    compare?: string;
    params?: string;
    iterations?: number;
    output?: string;
    format?: 'table' | 'json' | 'csv' | 'quiet';
    verbose?: boolean;
    quiet?: boolean;
    set?: string[];
    [key: string]: any;
}
export declare function runSimulation(simulationName: string, options?: RunOptions): Promise<void>;
export {};
