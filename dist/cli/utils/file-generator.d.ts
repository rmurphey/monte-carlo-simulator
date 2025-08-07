export interface FileToGenerate {
    path: string;
    content: string;
    overwrite?: boolean;
}
export declare class FileGenerator {
    private baseDir;
    constructor(baseDir?: string);
    ensureDirectory(dirPath: string): Promise<void>;
    fileExists(filePath: string): Promise<boolean>;
    writeFile(filePath: string, content: string, overwrite?: boolean): Promise<void>;
    readFile(filePath: string): Promise<string>;
    generateFiles(files: FileToGenerate[]): Promise<void>;
    appendToFile(filePath: string, content: string, marker?: string): Promise<void>;
    updateFileSection(filePath: string, sectionStart: string, sectionEnd: string, newContent: string): Promise<void>;
}
