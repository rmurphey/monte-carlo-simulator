"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSimulations = listSimulations;
const loader_1 = require("../config/loader");
const fs_1 = require("fs");
const path_1 = require("path");
const package_paths_1 = require("../utils/package-paths");
// Generate simulation ID from filename (how run command expects it)
function generateSimulationId(filename) {
    return (0, path_1.basename)(filename, (0, path_1.extname)(filename));
}
async function listSimulations(options = {}) {
    const loader = new loader_1.ConfigurationLoader();
    // Multi-path discovery using package-aware path resolution
    const searchPaths = package_paths_1.packagePaths.getSimulationSearchPaths();
    let allConfigs = [];
    let foundDirectories = [];
    try {
        // Search all paths for simulations
        for (const directory of searchPaths) {
            try {
                await fs_1.promises.access(directory);
                // Get files manually to track filenames
                const files = await fs_1.promises.readdir(directory);
                const configFiles = files.filter((file) => file.endsWith('.yaml') || file.endsWith('.yml'));
                for (const file of configFiles) {
                    try {
                        const config = await loader.loadConfig((0, path_1.join)(directory, file));
                        // Add metadata for display
                        config._sourceDirectory = directory;
                        config._filename = file;
                        config._simulationId = generateSimulationId(file);
                        allConfigs.push(config);
                    }
                    catch {
                        // Skip invalid configs
                    }
                }
                if (configFiles.length > 0) {
                    foundDirectories.push(directory);
                }
            }
            catch {
                // Directory doesn't exist - continue searching
            }
        }
        if (allConfigs.length === 0) {
            console.log('📁 No simulation configurations found');
            console.log('\n💡 Searched in:');
            searchPaths.forEach(path => console.log(`   - ${path}`));
            console.log('\n🚀 Try creating your first simulation:');
            console.log('   npm run cli create --interactive');
            return;
        }
        // Remove duplicates (same simulation found in multiple directories)
        const uniqueConfigs = allConfigs.filter((config, index, array) => array.findIndex(c => c.name === config.name) === index);
        console.log(`🔍 Found ${uniqueConfigs.length} simulation configuration(s):\n`);
        if (foundDirectories.length > 1) {
            console.log(`📂 Discovered from: ${foundDirectories.join(', ')}\n`);
        }
        uniqueConfigs.forEach((config, index) => {
            console.log(`${index + 1}. ${config.name}`);
            console.log(`   ID: ${config._simulationId}`);
            console.log(`   Category: ${config.category}`);
            console.log(`   Version: ${config.version}`);
            if (options.format === 'json') {
                console.log(JSON.stringify(config, null, 2));
            }
            else {
                console.log(`   Description: ${config.description}`);
                console.log(`   Parameters: ${config.parameters.length}`);
                console.log(`   Outputs: ${config.outputs?.length || 0}`);
                if (config.tags?.length) {
                    console.log(`   Tags: ${config.tags.join(', ')}`);
                }
            }
            console.log('');
        });
        // Add usage hints
        if (uniqueConfigs.length > 0) {
            const firstConfig = uniqueConfigs[0];
            console.log('💡 Usage hints:');
            console.log(`   Run example: npm run cli run ${firstConfig._simulationId}`);
            console.log(`   View parameters: npm run cli run ${firstConfig._simulationId} --list-params`);
            console.log(`   Create custom: npm run cli create --interactive`);
            console.log(`   Get help: npm run cli --help`);
        }
    }
    catch (error) {
        console.error('❌ Failed to list simulations:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}
//# sourceMappingURL=list-simulations.js.map