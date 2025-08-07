import { MonteCarloEngine } from './MonteCarloEngine';
import { SimulationMetadata } from './types';
export interface SimulationRegistryEntry {
    id: string;
    factory: () => MonteCarloEngine;
    metadata: SimulationMetadata;
    tags?: string[];
}
export interface SearchOptions {
    query?: string;
    category?: string;
    tags?: string[];
    sortBy?: 'name' | 'category' | 'version';
    sortOrder?: 'asc' | 'desc';
}
export declare class SimulationRegistry {
    private static instance;
    private simulations;
    private constructor();
    static getInstance(): SimulationRegistry;
    register(simulationFactory: () => MonteCarloEngine, tags?: string[]): void;
    getSimulation(id: string): MonteCarloEngine | null;
    getAllSimulations(): SimulationMetadata[];
    searchSimulations(options?: SearchOptions): SimulationMetadata[];
    getSimulationsByCategory(category: string): SimulationMetadata[];
    getCategories(): string[];
    getTags(): string[];
    getSimulationEntry(id: string): SimulationRegistryEntry | null;
    isRegistered(id: string): boolean;
    getSimulationCount(): number;
    unregister(id: string): boolean;
    clear(): void;
}
