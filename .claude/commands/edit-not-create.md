# Work With Existing - Code Pattern Consistency

Work with existing code patterns and consider existing files first, while maintaining good modularity.

## Usage
Use `npm run context:edit-not-create` to understand existing patterns, then:

## Smart File Decision Process
1. 🔍 **Understand existing patterns** and architecture first
2. 📋 **Check if functionality fits** in existing file without bloating
3. 🎯 **Consider modularity** - would new file improve organization?
4. 📊 **Follow established patterns** for similar functionality
5. ✅ **Create new file if it improves modularity and follows patterns**

## Good Reasons for New Files
- **Separation of concerns** - distinct responsibility
- **Modularity** - keeps existing files focused
- **Following patterns** - matches existing architecture
- **Testing** - isolatable functionality
- **Reusability** - component used in multiple places

## Anti-Patterns to Avoid
- ❌ Creating files that duplicate existing functionality
- ❌ Single-use files that could be part of existing modules
- ❌ Breaking established architectural patterns
- ❌ Creating files without considering existing structure

## Project Structure Context
- `src/framework/` - Core simulation engine modules
- `src/cli/` - Command-line interface components  
- `src/web/` - Web interface modules
- `src/test/` - Test files (often 1:1 with source)
- `docs/` - Documentation files
- `examples/` - Example simulation files

Work with existing patterns, create new files when modularity benefits.