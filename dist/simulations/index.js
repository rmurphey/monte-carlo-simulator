"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIInvestmentROI = void 0;
exports.registerAllSimulations = registerAllSimulations;
const SimulationRegistry_1 = require("../framework/SimulationRegistry");
const AIInvestmentROI_1 = require("./AIInvestmentROI");
Object.defineProperty(exports, "AIInvestmentROI", { enumerable: true, get: function () { return AIInvestmentROI_1.AIInvestmentROI; } });
function registerAllSimulations() {
    const registry = SimulationRegistry_1.SimulationRegistry.getInstance();
    // Register AI Investment ROI simulation
    registry.register(() => {
        const simulation = new AIInvestmentROI_1.AIInvestmentROI();
        simulation.setupParameterGroups();
        return simulation;
    }, ['ai', 'finance', 'roi', 'investment', 'productivity']);
}
//# sourceMappingURL=index.js.map