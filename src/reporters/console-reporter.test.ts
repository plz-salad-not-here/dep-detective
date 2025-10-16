import { describe, expect, test } from 'bun:test';
import type { AnalysisResult } from '@/domain/types';
import { hasIssues, report } from '@/reporters/console-reporter';

describe('console-reporter', () => {
  describe('hasIssues', () => {
    test('should return true when there are unused dependencies', () => {
      const result: AnalysisResult = {
        unused: ['react'],
        misplaced: [],
      };
      expect(hasIssues(result)).toBe(true);
      expect(typeof hasIssues(result)).toBe('boolean');
    });

    test('should return true when there are misplaced dependencies', () => {
      const result: AnalysisResult = {
        unused: [],
        misplaced: ['lodash'],
      };
      expect(hasIssues(result)).toBe(true);
    });

    test('should return true when there are both unused and misplaced', () => {
      const result: AnalysisResult = {
        unused: ['react'],
        misplaced: ['lodash'],
      };
      expect(hasIssues(result)).toBe(true);
    });

    test('should return false when there are no issues', () => {
      const result: AnalysisResult = {
        unused: [],
        misplaced: [],
      };
      expect(hasIssues(result)).toBe(false);
    });

    test('should return true with multiple unused dependencies', () => {
      const result: AnalysisResult = {
        unused: ['react', 'lodash', 'express'],
        misplaced: [],
      };
      expect(hasIssues(result)).toBe(true);
    });

    test('should return true with multiple misplaced dependencies', () => {
      const result: AnalysisResult = {
        unused: [],
        misplaced: ['react', 'lodash', 'express'],
      };
      expect(hasIssues(result)).toBe(true);
    });
  });

  describe('report', () => {
    test('should generate text report with no issues', () => {
      const result: AnalysisResult = {
        unused: [],
        misplaced: [],
      };
      const output = report(result, 'text');
      expect(output).toContain('All dependencies are properly used and placed');
      expect(typeof output).toBe('string');
      expect(output.length).toBeGreaterThan(0);
    });

    test('should generate text report with unused dependencies', () => {
      const result: AnalysisResult = {
        unused: ['react', 'lodash'],
        misplaced: [],
      };
      const output = report(result, 'text');
      expect(output).toContain('Unused Dependencies');
      expect(output).toContain('react');
      expect(output).toContain('lodash');
      expect(typeof output).toBe('string');
    });

    test('should generate text report with misplaced dependencies', () => {
      const result: AnalysisResult = {
        unused: [],
        misplaced: ['express', 'axios'],
      };
      const output = report(result, 'text');
      expect(output).toContain('Misplaced Dependencies');
      expect(output).toContain('express');
      expect(output).toContain('axios');
    });

    test('should generate text report with both unused and misplaced', () => {
      const result: AnalysisResult = {
        unused: ['react'],
        misplaced: ['express'],
      };
      const output = report(result, 'text');
      expect(output).toContain('Unused Dependencies');
      expect(output).toContain('Misplaced Dependencies');
      expect(output).toContain('Total Issues: 2');
    });

    test('should generate JSON report', () => {
      const result: AnalysisResult = {
        unused: ['react', 'lodash'],
        misplaced: ['express'],
      };
      const output = report(result, 'json');
      const parsed = JSON.parse(output);

      expect(parsed.unused).toEqual(['react', 'lodash']);
      expect(parsed.misplaced).toEqual(['express']);
      expect(parsed.totalIssues).toBe(3);
      expect(Array.isArray(parsed.unused)).toBe(true);
      expect(Array.isArray(parsed.misplaced)).toBe(true);
    });

    test('should generate JSON report with no issues', () => {
      const result: AnalysisResult = {
        unused: [],
        misplaced: [],
      };
      const output = report(result, 'json');
      const parsed = JSON.parse(output);

      expect(parsed.unused).toEqual([]);
      expect(parsed.misplaced).toEqual([]);
      expect(parsed.totalIssues).toBe(0);
    });

    test('should generate valid JSON that can be parsed', () => {
      const result: AnalysisResult = {
        unused: ['react'],
        misplaced: ['express'],
      };
      const output = report(result, 'json');
      expect(() => JSON.parse(output)).not.toThrow();
    });

    test('should include all unused items in text report', () => {
      const result: AnalysisResult = {
        unused: ['pkg1', 'pkg2', 'pkg3'],
        misplaced: [],
      };
      const output = report(result, 'text');
      expect(output).toContain('pkg1');
      expect(output).toContain('pkg2');
      expect(output).toContain('pkg3');
      expect(output).toContain('Total Issues: 3');
    });

    test('should include all misplaced items in text report', () => {
      const result: AnalysisResult = {
        unused: [],
        misplaced: ['pkg1', 'pkg2', 'pkg3'],
      };
      const output = report(result, 'text');
      expect(output).toContain('pkg1');
      expect(output).toContain('pkg2');
      expect(output).toContain('pkg3');
    });

    test('should handle scoped packages in reports', () => {
      const result: AnalysisResult = {
        unused: ['@types/node', '@mobily/ts-belt'],
        misplaced: [],
      };
      const output = report(result, 'text');
      expect(output).toContain('@types/node');
      expect(output).toContain('@mobily/ts-belt');
    });

    test('should count total issues correctly in JSON', () => {
      const result: AnalysisResult = {
        unused: ['a', 'b', 'c'],
        misplaced: ['d', 'e'],
      };
      const output = report(result, 'json');
      const parsed = JSON.parse(output);
      expect(parsed.totalIssues).toBe(5);
    });

    test('should format text report properly', () => {
      const result: AnalysisResult = {
        unused: ['react'],
        misplaced: [],
      };
      const output = report(result, 'text');
      expect(output).toContain('\n'); // Should have line breaks
      expect(output.length).toBeGreaterThan(10); // Should have some content
    });
  });
});
