"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toClassName = toClassName;
exports.toId = toId;
exports.toCamelCase = toCamelCase;
function toClassName(name) {
    return name
        .split(/[\s\-_]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join('')
        .replace(/[^a-zA-Z0-9]/g, '');
}
function toId(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}
function toCamelCase(name) {
    const className = toClassName(name);
    return className.charAt(0).toLowerCase() + className.slice(1);
}
//# sourceMappingURL=name-converter.js.map