"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listSimulations = listSimulations;
const loader_1 = require("../config/loader");
const fs_1 = require("fs");
async function listSimulations(options = {}) {
    const loader = new loader_1.ConfigurationLoader();
    const directory = './simulations';
    try {
        // Check if directory exists
        try {
            await fs_1.promises.access(directory);
        }
        catch {
            console.log(`📁 Directory ${directory} does not exist`);
            console.log('No simulation configurations found');
            return;
        }
        const configs = await loader.loadMultipleConfigs(directory);
        if (configs.length === 0) {
            console.log('No valid simulation configurations found');
            return;
        }
        console.log(`Found ${configs.length} simulation configuration(s):\n`);
        configs.forEach((config, index) => {
            console.log(`${index + 1}. ${config.name}`);
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
    }
    catch (error) {
        console.error('❌ Failed to list simulations:', error instanceof Error ? error.message : String(error));
        process.exit(1);
    }
}
//# sourceMappingURL=list-simulations.js.map