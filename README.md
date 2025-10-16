# deps-finder 🕵️

> [한국어](./README.ko.md) | English

A TypeScript dependency analyzer that detects unused and misplaced dependencies in your project.

## Features

- 🔍 **Unused Dependencies**: Detects packages declared in package.json but not imported in source code
- ⚠️ **Misplaced Dependencies**: Identifies packages in devDependencies but used in production code
- 🚀 **Fast**: Powered by Bun for high performance
- 🎨 **Clean Output**: Colorized console output or JSON format
- 📦 **Zero Config**: Works out of the box
- 🔒 **Type Safe**: Built with TypeScript using ADT patterns

## Installation

```bash
npm install -D deps-finder
```

Or use with npx:

```bash
npx deps-finder
```

## Usage

Run in your project root:

```bash
npx deps-finder
```

### Options

- `-t, --text`: Output as text (default)
- `-j, --json`: Output as JSON
- `-a, --all`: Check all dependencies including devDependencies
- `-h, --help`: Show help message

### Examples

```bash
# Text output (default)
npx deps-finder

# JSON output
npx deps-finder -j
npx deps-finder --json

# Check all dependencies including devDependencies
npx deps-finder --all
npx deps-finder -a

# Combine options
npx deps-finder -j --all

# Show help
npx deps-finder -h
```

### Example Output

**Text Format:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Dependency Analysis Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠ Unused Dependencies:
  (declared but not imported in source code)

  • lodash
  • moment

⚠ Misplaced Dependencies:
  (in devDependencies but used in source code)

  • axios
  • zod

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Total Issues: 4
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**JSON Format:**
```json
{
  "unused": ["lodash", "moment"],
  "misplaced": ["axios", "zod"],
  "totalIssues": 4
}
```

## Architecture

Built with clean architecture principles and Separation of Concerns (SoC):

```
src/
├── domain/          # Type definitions (ADT patterns)
├── parsers/         # Package.json and import parsers
├── analyzers/       # Dependency analysis logic
├── reporters/       # Output formatters
└── cli/            # CLI options and help
```

### Key Principles

- **ADT (Algebraic Data Types)**: Type-safe domain modeling
- **SoC (Separation of Concerns)**: Each module has a single responsibility
- **No Type Assertions**: Proper type inference without `as`
- **Union Types**: Using const arrays for type safety
- **Functional Patterns**: Using ts-pattern and ts-belt

## Technologies

- **Bun**: Fast JavaScript runtime and toolkit
- **TypeScript**: Type-safe development
- **ts-pattern**: Pattern matching for clean control flow
- **ts-belt**: Functional programming utilities
- **Biome**: Fast linter

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Type check
bun run typecheck

# Lint
bun run lint

# Full validation (type check + lint + test)
bun run validate
```

## CI Integration

Add to your CI pipeline:

```yaml
- name: Check dependencies
  run: npx deps-finder
```

The command exits with code 1 if issues are found, perfect for CI/CD.

## License

MIT
