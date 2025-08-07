"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateSimulation = validateSimulation;
const loader_1 = require("../config/loader");
const ConfigurableSimulation_1 = require("../../framework/ConfigurableSimulation");
async function validateSimulation(file, options = {}) {
    const loader = new loader_1.ConfigurationLoader();
    try {
        console.log(`🔍 Validating ${file}...`);
        // First validate the file structure
        const validation = await loader.validateConfigFile(file);
        if (!validation.valid) {
            console.error('❌ Configuration file validation failed:');
            validation.errors.forEach(error => console.error(`   ${error}`));
            process.exit(1);
        }
        // Load and validate simulation logic
        const config = await loader.loadConfig(file);
        const simulation = new ConfigurableSimulation_1.ConfigurableSimulation(config);
        const logicValidation = simulation.validateConfiguration();
        if (!logicValidation.valid) {
            console.error('❌ Simulation logic validation failed:');
            logicValidation.errors.forEach(error => console.error(`   ${error}`));
            process.exit(1);
        }
        console.log('✅ Configuration is valid!');
        if (options.verbose) {
            const metadata = simulation.getMetadata();
            console.log('\n📋 Configuration Details:');
            console.log(`   Name: ${metadata.name}`);
            console.log(`   Category: ${metadata.category}`);
            console.log(`   Version: ${metadata.version}`);
            console.log(`   Parameters: ${config.parameters.length}`);
            console.log(`   Outputs: ${config.outputs?.length || 0}`);
            if (config.tags?.length) {
                console.log(`   Tags: ${config.tags.join(', ')}`);
            }
        }
    }
    catch (error) {
        console.error('❌ Validation failed:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}
//# sourceMappingURL=validate-simulation.js.map