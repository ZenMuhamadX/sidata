import { describe, it, expect } from 'bun:test';
import { documentService } from '../services/document.service';
import { formatFileSize, DOCUMENT_TYPES } from '../types/document.types';

describe('Document Service & Utilities Unit Tests', () => {
  it('validates 4 required document types', () => {
    expect(DOCUMENT_TYPES.length).toBe(4);
    const codes = DOCUMENT_TYPES.map((d) => d.code);
    expect(codes).toContain('kk');
    expect(codes).toContain('akta_lahir');
    expect(codes).toContain('ktp_ayah');
    expect(codes).toContain('ktp_ibu');

    const dbValues = DOCUMENT_TYPES.map((d) => d.dbValue);
    expect(dbValues).toContain('KK');
    expect(dbValues).toContain('Akta Lahir');
    expect(dbValues).toContain('KTP Ayah');
    expect(dbValues).toContain('KTP Ibu');
  });

  it('rejects invalid or dangerous file extensions', () => {
    const exeFile = new File(['binary'], 'virus.exe', { type: 'application/x-msdownload' });
    const resExe = documentService.validateFile(exeFile);
    expect(resExe.isValid).toBe(false);

    const shFile = new File(['echo hello'], 'script.sh', { type: 'text/x-sh' });
    const resSh = documentService.validateFile(shFile);
    expect(resSh.isValid).toBe(false);
  });

  it('rejects files larger than 5MB', () => {
    const largeBlob = new Blob([new Uint8Array(6 * 1024 * 1024)]);
    const largeFile = new File([largeBlob], 'big.pdf', { type: 'application/pdf' });
    const res = documentService.validateFile(largeFile);
    expect(res.isValid).toBe(false);
    expect(res.error).toContain('5 MB');
  });

  it('accepts valid PDF and image formats under 5MB', () => {
    const validPdf = new File(['dummy content'], 'kartu_keluarga.pdf', { type: 'application/pdf' });
    const resPdf = documentService.validateFile(validPdf);
    expect(resPdf.isValid).toBe(true);

    const validJpg = new File(['dummy img'], 'akta.jpg', { type: 'image/jpeg' });
    const resJpg = documentService.validateFile(validJpg);
    expect(resJpg.isValid).toBe(true);

    const validPng = new File(['dummy img'], 'ktp.png', { type: 'image/png' });
    const resPng = documentService.validateFile(validPng);
    expect(resPng.isValid).toBe(true);
  });

  it('formats file sizes properly', () => {
    expect(formatFileSize(0)).toBe('-');
    expect(formatFileSize(null)).toBe('-');
    expect(formatFileSize(500)).toBe('500 B');
    expect(formatFileSize(2048)).toBe('2.0 KB');
    expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB');
  });
});
