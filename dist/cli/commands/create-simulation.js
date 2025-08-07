"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSimulation = createSimulation;
const loader_1 = require("../config/loader");
const config_builder_1 = require("../interactive/config-builder");
async function createSimulation(name, options = {}) {
    const loader = new loader_1.ConfigurationLoader();
    try {
        if (options.interactive) {
            // Use interactive configuration builder
            const builder = new config_builder_1.InteractiveConfigBuilder();
            const config = await builder.buildConfiguration();
            // Override name if provided via command line
            if (name) {
                config.name = name;
            }
            // Test the configuration
            const isValid = await builder.testConfiguration(config);
            if (!isValid) {
                console.log('❌ Configuration failed validation. Please fix the errors and try again.');
                process.exit(1);
            }
            // Save the configuration 
            const filePath = await builder.saveConfiguration(config);
            console.log(`✅ Interactive simulation created at ${filePath}`);
        }
        else {
            // Generate a template configuration
            const template = loader.generateConfigTemplate();
            if (name) {
                template.name = name;
            }
            if (options.category) {
                template.category = options.category;
            }
            if (options.description) {
                template.description = options.description;
            }
            const outputPath = `${template.name.toLowerCase().replace(/\s+/g, '-')}.yaml`;
            await loader.saveConfig(outputPath, template);
            console.log(`✅ Template simulation created at ${outputPath}`);
            console.log(`📝 Edit the file to customize your simulation logic`);
        }
    }
    catch (error) {
        console.error('❌ Failed to create simulation:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}
//# sourceMappingURL=create-simulation.js.map