import { describe, it, expect } from 'bun:test';
import {
  detectClassFromSheetName,
  normalizeExcelDate,
  sanitizeNik,
  normalizeJK,
  normalizeAgama,
} from '../utils/excelParser.utils';

describe('Excel Parser Utilities', () => {
  it('detects classes accurately from worksheet names', () => {
    expect(detectClassFromSheetName('Kelas 1').detected).toBe(1);
    expect(detectClassFromSheetName('Kelas 1').isAmbiguous).toBe(false);

    expect(detectClassFromSheetName('kelas 6').detected).toBe(6);
    expect(detectClassFromSheetName('kls 3').detected).toBe(3);
    expect(detectClassFromSheetName('2A').detected).toBe(2);

    expect(detectClassFromSheetName('Sheet1').detected).toBe(null);
    expect(detectClassFromSheetName('Sheet1').isAmbiguous).toBe(true);

    expect(detectClassFromSheetName('Data Baru').detected).toBe(null);
  });

  it('normalizes various date formats properly', () => {
    // DD-MMM-YY
    expect(normalizeExcelDate('20-Nov-19')).toBe('2019-11-20');
    expect(normalizeExcelDate('05-Jan-2023')).toBe('2023-01-05');

    // DD/MM/YYYY and DD-MM-YYYY
    expect(normalizeExcelDate('15/08/2012')).toBe('2012-08-15');
    expect(normalizeExcelDate('15-08-2012')).toBe('2012-08-15');

    // YYYY-MM-DD
    expect(normalizeExcelDate('2015-04-10')).toBe('2015-04-10');

    // Native Date
    expect(normalizeExcelDate(new Date('2016-07-25T00:00:00Z'))).toBe('2016-07-25');
  });

  it('sanitizes NIK strictly preserving leading zeros and removing non-digits', () => {
    expect(sanitizeNik('0123456789012345')).toBe('0123456789012345');
    expect(sanitizeNik('3201-1234-5678-9012')).toBe('3201123456789012');
    expect(sanitizeNik('-')).toBe('');
  });

  it('normalizes gender L and P', () => {
    expect(normalizeJK('L')).toBe('L');
    expect(normalizeJK('Laki-laki')).toBe('L');
    expect(normalizeJK('P')).toBe('P');
    expect(normalizeJK('Perempuan')).toBe('P');
    expect(normalizeJK('X')).toBe(null);
  });

  it('normalizes agama enum', () => {
    expect(normalizeAgama('Islam')).toBe('Islam');
    expect(normalizeAgama('islam')).toBe('Islam');
    expect(normalizeAgama('Kristen Protestan')).toBe('Kristen');
    expect(normalizeAgama('Katolik')).toBe('Katolik');
    expect(normalizeAgama('Atheis')).toBe(null);
  });
});
