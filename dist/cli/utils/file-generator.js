"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileGenerator = void 0;
const fs_1 = require("fs");
const path_1 = require("path");
class FileGenerator {
    baseDir;
    constructor(baseDir = process.cwd()) {
        this.baseDir = baseDir;
    }
    async ensureDirectory(dirPath) {
        const fullPath = (0, path_1.join)(this.baseDir, dirPath);
        try {
            await fs_1.promises.access(fullPath);
        }
        catch {
            await fs_1.promises.mkdir(fullPath, { recursive: true });
        }
    }
    async fileExists(filePath) {
        const fullPath = (0, path_1.join)(this.baseDir, filePath);
        try {
            await fs_1.promises.access(fullPath);
            return true;
        }
        catch {
            return false;
        }
    }
    async writeFile(filePath, content, overwrite = false) {
        const fullPath = (0, path_1.join)(this.baseDir, filePath);
        // Check if file exists and overwrite is not allowed
        if (!overwrite && await this.fileExists(filePath)) {
            throw new Error(`File already exists: ${filePath}. Use overwrite: true to replace it.`);
        }
        // Ensure directory exists
        await this.ensureDirectory((0, path_1.dirname)(filePath));
        // Write the file
        await fs_1.promises.writeFile(fullPath, content, 'utf8');
    }
    async readFile(filePath) {
        const fullPath = (0, path_1.join)(this.baseDir, filePath);
        return await fs_1.promises.readFile(fullPath, 'utf8');
    }
    async generateFiles(files) {
        const results = [];
        for (const file of files) {
            try {
                const exists = await this.fileExists(file.path);
                if (exists && !file.overwrite) {
                    results.push({ path: file.path, status: 'skipped' });
                    console.log(`⚠️  Skipped ${file.path} (already exists)`);
                    continue;
                }
                await this.writeFile(file.path, file.content, file.overwrite);
                results.push({
                    path: file.path,
                    status: exists ? 'updated' : 'created'
                });
                const icon = exists ? '📝' : '✨';
                console.log(`${icon} ${exists ? 'Updated' : 'Created'} ${file.path}`);
            }
            catch (error) {
                console.error(`❌ Failed to generate ${file.path}:`, error instanceof Error ? error.message : error);
                throw error;
            }
        }
    }
    async appendToFile(filePath, content, marker) {
        if (!await this.fileExists(filePath)) {
            throw new Error(`File does not exist: ${filePath}`);
        }
        let existingContent = await this.readFile(filePath);
        // If marker is provided, check if content is already present
        if (marker && existingContent.includes(marker)) {
            console.log(`📋 Content already present in ${filePath}`);
            return;
        }
        // Append content
        const updatedContent = existingContent + '\n' + content;
        await this.writeFile(filePath, updatedContent, true);
        console.log(`📝 Updated ${filePath}`);
    }
    async updateFileSection(filePath, sectionStart, sectionEnd, newContent) {
        if (!await this.fileExists(filePath)) {
            throw new Error(`File does not exist: ${filePath}`);
        }
        const content = await this.readFile(filePath);
        const startIndex = content.indexOf(sectionStart);
        const endIndex = content.indexOf(sectionEnd, startIndex);
        if (startIndex === -1 || endIndex === -1) {
            throw new Error(`Could not find section markers in ${filePath}`);
        }
        const beforeSection = content.substring(0, startIndex + sectionStart.length);
        const afterSection = content.substring(endIndex);
        const updatedContent = beforeSection + '\n' + newContent + '\n' + afterSection;
        await this.writeFile(filePath, updatedContent, true);
        console.log(`📝 Updated section in ${filePath}`);
    }
}
exports.FileGenerator = FileGenerator;
//# sourceMappingURL=file-generator.js.map