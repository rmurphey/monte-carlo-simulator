"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulationRegistry = void 0;
class SimulationRegistry {
    static instance;
    simulations = new Map();
    constructor() { }
    static getInstance() {
        if (!SimulationRegistry.instance) {
            SimulationRegistry.instance = new SimulationRegistry();
        }
        return SimulationRegistry.instance;
    }
    register(simulationFactory, tags) {
        const simulation = simulationFactory();
        const metadata = simulation.getMetadata();
        if (this.simulations.has(metadata.id)) {
            throw new Error(`Simulation with id '${metadata.id}' is already registered`);
        }
        this.simulations.set(metadata.id, {
            id: metadata.id,
            factory: simulationFactory,
            metadata,
            tags
        });
    }
    getSimulation(id) {
        const entry = this.simulations.get(id);
        return entry ? entry.factory() : null;
    }
    getAllSimulations() {
        return Array.from(this.simulations.values())
            .map(entry => entry.metadata)
            .sort((a, b) => a.name.localeCompare(b.name));
    }
    searchSimulations(options = {}) {
        let results = Array.from(this.simulations.values());
        // Filter by query (search in name and description)
        if (options.query) {
            const query = options.query.toLowerCase();
            results = results.filter(entry => entry.metadata.name.toLowerCase().includes(query) ||
                entry.metadata.description.toLowerCase().includes(query));
        }
        // Filter by category
        if (options.category) {
            results = results.filter(entry => entry.metadata.category === options.category);
        }
        // Filter by tags
        if (options.tags && options.tags.length > 0) {
            results = results.filter(entry => entry.tags && options.tags.some(tag => entry.tags.includes(tag)));
        }
        // Sort results
        const sortBy = options.sortBy || 'name';
        const sortOrder = options.sortOrder || 'asc';
        results.sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'name':
                    comparison = a.metadata.name.localeCompare(b.metadata.name);
                    break;
                case 'category':
                    comparison = a.metadata.category.localeCompare(b.metadata.category);
                    break;
                case 'version':
                    comparison = a.metadata.version.localeCompare(b.metadata.version);
                    break;
            }
            return sortOrder === 'desc' ? -comparison : comparison;
        });
        return results.map(entry => entry.metadata);
    }
    getSimulationsByCategory(category) {
        return this.searchSimulations({ category });
    }
    getCategories() {
        const categories = new Set();
        Array.from(this.simulations.values()).forEach(entry => categories.add(entry.metadata.category));
        return Array.from(categories).sort();
    }
    getTags() {
        const tags = new Set();
        Array.from(this.simulations.values()).forEach(entry => {
            if (entry.tags) {
                entry.tags.forEach(tag => tags.add(tag));
            }
        });
        return Array.from(tags).sort();
    }
    getSimulationEntry(id) {
        return this.simulations.get(id) || null;
    }
    isRegistered(id) {
        return this.simulations.has(id);
    }
    getSimulationCount() {
        return this.simulations.size;
    }
    unregister(id) {
        return this.simulations.delete(id);
    }
    clear() {
        this.simulations.clear();
    }
}
exports.SimulationRegistry = SimulationRegistry;
//# sourceMappingURL=SimulationRegistry.js.map