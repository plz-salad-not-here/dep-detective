import { describe, expect, test } from 'bun:test';
import { R } from '@mobily/ts-belt';
import { parseArgs, showHelp } from '@/cli/options';

describe('parseArgs', () => {
  test('should parse text format option', () => {
    const result = parseArgs(['-t']);
    expect(R.isOk(result)).toBe(true);

    if (R.isOk(result)) {
      const options = R.getExn(result);
      expect(options.format).toBe('text');
      expect(options.checkAll).toBe(false);
      expect(options.rootDir).toBe('./src');
      expect(options.packageJsonPath).toBe('./package.json');
    }
  });

  test('should parse json format option', () => {
    const result = parseArgs(['-j']);
    expect(R.isOk(result)).toBe(true);

    if (R.isOk(result)) {
      const options = R.getExn(result);
      expect(options.format).toBe('json');
      expect(options.checkAll).toBe(false);
    }
  });

  test('should parse long format options', () => {
    const textResult = parseArgs(['--text']);
    expect(R.isOk(textResult)).toBe(true);

    if (R.isOk(textResult)) {
      const options = R.getExn(textResult);
      expect(options.format).toBe('text');
    }

    const jsonResult = parseArgs(['--json']);
    expect(R.isOk(jsonResult)).toBe(true);

    if (R.isOk(jsonResult)) {
      const options = R.getExn(jsonResult);
      expect(options.format).toBe('json');
    }
  });

  test('should parse checkAll option', () => {
    const result = parseArgs(['-a']);
    expect(R.isOk(result)).toBe(true);

    if (R.isOk(result)) {
      const options = R.getExn(result);
      expect(options.checkAll).toBe(true);
    }

    const longResult = parseArgs(['--all']);
    expect(R.isOk(longResult)).toBe(true);

    if (R.isOk(longResult)) {
      const options = R.getExn(longResult);
      expect(options.checkAll).toBe(true);
    }
  });

  test('should return failure for help option', () => {
    const result = parseArgs(['-h']);
    expect(R.isError(result)).toBe(true);
  });

  test('should use default options when no args provided', () => {
    const result = parseArgs([]);
    expect(R.isOk(result)).toBe(true);

    if (R.isOk(result)) {
      const options = R.getExn(result);
      expect(options.format).toBe('text');
      expect(options.rootDir).toBe('./src');
      expect(options.packageJsonPath).toBe('./package.json');
      expect(options.checkAll).toBe(false);
    }
  });

  test('should parse multiple options together', () => {
    const result = parseArgs(['-j', '-a']);
    expect(R.isOk(result)).toBe(true);

    if (R.isOk(result)) {
      const options = R.getExn(result);
      expect(options.format).toBe('json');
      expect(options.checkAll).toBe(true);
    }
  });

  test('should handle long help option', () => {
    const result = parseArgs(['--help']);
    expect(R.isError(result)).toBe(true);
  });

  test('should handle invalid options', () => {
    const result = parseArgs(['--invalid']);
    expect(R.isOk(result)).toBe(true); // Unknown options are ignored
  });

  test('should parse mixed short and long options', () => {
    const result = parseArgs(['-t', '--all']);
    expect(R.isOk(result)).toBe(true);

    if (R.isOk(result)) {
      const options = R.getExn(result);
      expect(options.format).toBe('text');
      expect(options.checkAll).toBe(true);
    }
  });

  test('should prioritize last format option', () => {
    const result = parseArgs(['-t', '-j']);
    expect(R.isOk(result)).toBe(true);

    if (R.isOk(result)) {
      const options = R.getExn(result);
      expect(options.format).toBe('json');
    }
  });

  test('should have correct default values', () => {
    const result = parseArgs([]);
    expect(R.isOk(result)).toBe(true);

    if (R.isOk(result)) {
      const options = R.getExn(result);
      expect(typeof options.format).toBe('string');
      expect(typeof options.rootDir).toBe('string');
      expect(typeof options.packageJsonPath).toBe('string');
      expect(typeof options.checkAll).toBe('boolean');
    }
  });

  test('should handle multiple checkAll flags', () => {
    const result = parseArgs(['-a', '--all']);
    expect(R.isOk(result)).toBe(true);

    if (R.isOk(result)) {
      const options = R.getExn(result);
      expect(options.checkAll).toBe(true);
    }
  });
});

describe('showHelp', () => {
  test('should return help message', () => {
    const help = showHelp();
    expect(help).toContain('deps-finder');
    expect(help).toContain('Usage:');
    expect(help).toContain('-t, --text');
    expect(help).toContain('-j, --json');
    expect(help).toContain('-a, --all');
    expect(help).toContain('-h, --help');
  });
});
