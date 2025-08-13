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
exports.TempConfigManager = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const os = __importStar(require("os"));
const yaml = __importStar(require("js-yaml"));
class TempConfigManager {
    tempPaths = new Set();
    sessionId;
    constructor() {
        this.sessionId = `monte-carlo-session-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    }
    async createTempConfig(config) {
        const tempDir = os.tmpdir();
        const tempPath = path.join(tempDir, `${this.sessionId}.yaml`);
        try {
            // Convert config to YAML
            const yamlContent = yaml.dump(config, {
                indent: 2,
                lineWidth: 100,
                noRefs: true,
                sortKeys: false
            });
            await fs.writeFile(tempPath, yamlContent, 'utf8');
            this.tempPaths.add(tempPath);
            return tempPath;
        }
        catch (error) {
            throw new Error(`Failed to create temp config: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async saveTempConfig(config, tempPath) {
        try {
            const yamlContent = yaml.dump(config, {
                indent: 2,
                lineWidth: 100,
                noRefs: true,
                sortKeys: false
            });
            await fs.writeFile(tempPath, yamlContent, 'utf8');
        }
        catch (error) {
            throw new Error(`Failed to save temp config: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async saveToOriginal(originalPath, config) {
        try {
            // Create backup first
            const backupPath = await this.createBackup(originalPath);
            console.log(`📋 Backup created: ${backupPath}`);
            // Convert config to YAML
            const yamlContent = yaml.dump(config, {
                indent: 2,
                lineWidth: 100,
                noRefs: true,
                sortKeys: false
            });
            await fs.writeFile(originalPath, yamlContent, 'utf8');
        }
        catch (error) {
            throw new Error(`Failed to save to original file: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async discardChanges(tempPath) {
        try {
            if (this.tempPaths.has(tempPath)) {
                await fs.unlink(tempPath).catch(() => {
                    // Ignore errors if file already deleted
                });
                this.tempPaths.delete(tempPath);
            }
        }
        catch (error) {
            // Ignore errors when discarding changes
            console.warn(`Warning: Could not delete temp file ${tempPath}`);
        }
    }
    async createBackup(originalPath) {
        try {
            const parsedPath = path.parse(originalPath);
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupPath = path.join(parsedPath.dir, `${parsedPath.name}.backup.${timestamp}${parsedPath.ext}`);
            await fs.copyFile(originalPath, backupPath);
            return backupPath;
        }
        catch (error) {
            throw new Error(`Failed to create backup: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async cleanup() {
        const cleanupPromises = Array.from(this.tempPaths).map(async (tempPath) => {
            try {
                await fs.unlink(tempPath);
            }
            catch (error) {
                // Ignore cleanup errors
                console.warn(`Warning: Could not cleanup temp file ${tempPath}`);
            }
        });
        await Promise.allSettled(cleanupPromises);
        this.tempPaths.clear();
    }
    getTempPaths() {
        return Array.from(this.tempPaths);
    }
}
exports.TempConfigManager = TempConfigManager;
//# sourceMappingURL=temp-config-manager.js.map