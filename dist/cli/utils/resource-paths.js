"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getResourcePaths = getResourcePaths;
exports.getPackageRoot = getPackageRoot;
exports.resolveResourceFile = resolveResourceFile;
exports.listResourceFiles = listResourceFiles;
const path = __importStar(require("path"));
const fs_1 = require("fs");
/**
 * Get resource paths for templates, examples, and other bundled resources.
 * Works in both development and NPX installation contexts.
 */
function getResourcePaths() {
    // In CommonJS compiled output, __dirname will be available
    // This will be compiled to use the CommonJS __dirname
    const currentDir = __dirname;
    // When installed via npm/npx, we're in node_modules/monte-carlo-simulator/dist/cli/utils/
    // When in development, we're in src/cli/utils/
    // Try to find package root by looking for package.json
    let packageRoot = currentDir;
    let attempts = 0;
    const maxAttempts = 10;
    while (attempts < maxAttempts) {
        const packageJsonPath = path.join(packageRoot, 'package.json');
        if ((0, fs_1.existsSync)(packageJsonPath)) {
            break;
        }
        packageRoot = path.join(packageRoot, '..');
        attempts++;
    }
    if (attempts >= maxAttempts) {
        throw new Error('Could not find package root (package.json not found)');
    }
    const paths = {
        examples: path.join(packageRoot, 'examples'),
        docs: path.join(packageRoot, 'docs'),
        schemas: path.join(packageRoot, 'dist', 'schemas')
    };
    if (!(0, fs_1.existsSync)(paths.examples)) {
        throw new Error(`Examples directory not found at: ${paths.examples}`);
    }
    return paths;
}
/**
 * Get the package root directory
 */
function getPackageRoot() {
    const paths = getResourcePaths();
    return path.dirname(paths.examples); // examples is in package root
}
/**
 * Resolve a resource file path, checking multiple possible locations
 * @param filename - File to find (e.g., 'simple-roi-analysis.yaml')
 * @param category - Category of resource ('examples', 'docs')
 */
function resolveResourceFile(filename, category) {
    const paths = getResourcePaths();
    const categoryPath = paths[category];
    // Direct file in category directory
    const directPath = path.join(categoryPath, filename);
    if ((0, fs_1.existsSync)(directPath)) {
        return directPath;
    }
    // For examples, also check simulations subdirectory
    if (category === 'examples') {
        const simulationsPath = path.join(categoryPath, 'simulations', filename);
        if ((0, fs_1.existsSync)(simulationsPath)) {
            return simulationsPath;
        }
    }
    return null;
}
/**
 * List available resources in a category
 */
function listResourceFiles(category) {
    const paths = getResourcePaths();
    const fs = require('fs');
    const categoryPath = paths[category];
    if (!(0, fs_1.existsSync)(categoryPath)) {
        return [];
    }
    const files = [];
    // Get files directly in category directory
    const directFiles = fs.readdirSync(categoryPath)
        .filter((f) => f.endsWith('.yaml') || f.endsWith('.md'))
        .filter((f) => f !== 'README.md'); // Exclude README files from listings
    files.push(...directFiles);
    // For examples, also check simulations subdirectory
    if (category === 'examples') {
        const simulationsPath = path.join(categoryPath, 'simulations');
        if ((0, fs_1.existsSync)(simulationsPath)) {
            const simulationFiles = fs.readdirSync(simulationsPath)
                .filter((f) => f.endsWith('.yaml'))
                .map((f) => `simulations/${f}`);
            files.push(...simulationFiles);
        }
    }
    return files.sort();
}
//# sourceMappingURL=resource-paths.js.map