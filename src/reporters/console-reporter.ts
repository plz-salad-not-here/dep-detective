import { match } from 'ts-pattern';
import type { AnalysisResult, OutputFormat } from '@/domain/types';

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
} as const;

type ColorName = keyof typeof COLORS;

function colorize(text: string, color: ColorName): string {
  return `${COLORS[color]}${text}${COLORS.reset}`;
}

function reportAsText(result: AnalysisResult): string {
  const lines: string[] = [];

  lines.push('');
  lines.push(colorize('━'.repeat(60), 'cyan'));
  lines.push(colorize('  Dependency Analysis Report', 'bold'));
  lines.push(colorize('━'.repeat(60), 'cyan'));
  lines.push('');

  if (result.unused.length === 0 && result.misplaced.length === 0) {
    lines.push(colorize('✓ All dependencies are properly used and placed!', 'green'));
    lines.push('');
    lines.push(colorize('━'.repeat(60), 'cyan'));
    lines.push('');
    return lines.join('\n');
  }

  if (result.unused.length > 0) {
    lines.push(colorize('⚠ Unused Dependencies:', 'yellow'));
    lines.push(colorize('  (declared but not imported in source code)', 'yellow'));
    lines.push('');

    for (const dep of result.unused) {
      lines.push(`  ${colorize('•', 'yellow')} ${dep}`);
    }
    lines.push('');
  }

  if (result.misplaced.length > 0) {
    lines.push(colorize('⚠ Misplaced Dependencies:', 'red'));
    lines.push(colorize('  (in devDependencies but used in source code)', 'red'));
    lines.push('');

    for (const dep of result.misplaced) {
      lines.push(`  ${colorize('•', 'red')} ${dep}`);
    }
    lines.push('');
  }

  const totalIssues = result.unused.length + result.misplaced.length;
  lines.push(colorize('━'.repeat(60), 'cyan'));
  lines.push(colorize(`  Total Issues: ${totalIssues}`, 'bold'));
  lines.push(colorize('━'.repeat(60), 'cyan'));
  lines.push('');

  return lines.join('\n');
}

function reportAsJson(result: AnalysisResult): string {
  const totalIssues = result.unused.length + result.misplaced.length;
  return JSON.stringify(
    {
      unused: result.unused,
      misplaced: result.misplaced,
      totalIssues,
    },
    null,
    2,
  );
}

export function report(result: AnalysisResult, format: OutputFormat): string {
  return match(format)
    .with('text', () => reportAsText(result))
    .with('json', () => reportAsJson(result))
    .exhaustive();
}

export function hasIssues(result: AnalysisResult): boolean {
  return result.unused.length > 0 || result.misplaced.length > 0;
}
