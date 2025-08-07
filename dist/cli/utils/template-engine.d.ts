export interface TemplateContext {
    [key: string]: string | number | boolean | string[] | TemplateContext;
}
export declare class TemplateEngine {
    static render(template: string, context: TemplateContext): string;
    static renderFile(_templatePath: string, _context: TemplateContext): string;
    static escape(str: string): string;
}
