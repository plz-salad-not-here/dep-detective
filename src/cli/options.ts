import { R } from '@mobily/ts-belt';
import { match } from 'ts-pattern';
import type { AppResult, CliOptions, OutputFormat } from '@/domain/types';

const DEFAULT_OPTIONS: CliOptions = {
  format: 'text',
  rootDir: './src',
  packageJsonPath: './package.json',
  checkAll: false,
};

export function parseArgs(args: ReadonlyArray<string>): AppResult<CliOptions> {
  let format: OutputFormat = DEFAULT_OPTIONS.format;
  let checkAll = false;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    const shouldContinue = match(arg)
      .with('-t', '--text', () => {
        format = 'text';
        return true;
      })
      .with('-j', '--json', () => {
        format = 'json';
        return true;
      })
      .with('-a', '--all', () => {
        checkAll = true;
        return true;
      })
      .with('-h', '--help', () => {
        return false;
      })
      .otherwise(() => true);

    if (!shouldContinue) {
      return R.Error('help');
    }
  }

  return R.Ok({
    ...DEFAULT_OPTIONS,
    format,
    checkAll,
  });
}

export function showHelp(): string {
  return `
dep-guard - Dependency analyzer for TypeScript projects

Usage:
  dep-guard [options]

Options:
  -t, --text    Output as text (default)
  -j, --json    Output as JSON
  -a, --all     Check all dependencies including devDependencies
  -h, --help    Show this help message

Examples:
  dep-guard
  dep-guard -j
  dep-guard --all
  dep-guard -j --all
`;
}
