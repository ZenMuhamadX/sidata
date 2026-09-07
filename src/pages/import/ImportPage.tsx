import React, { useState } from 'react';
import type * as XLSX from 'xlsx';
import { AlertCircle } from 'lucide-react';
import { importService } from '../../features/import/services/import.service';
import { ImportDropzone } from '../../features/import/components/ImportDropzone';
import { SheetClassConfig } from '../../features/import/components/SheetClassConfig';
import { ImportPreviewTable } from '../../features/import/components/ImportPreviewTable';
import { ImportResultView } from '../../features/import/components/ImportResultView';
import type {
  ImportResultSummary,
  ParsedRowData,
  SheetInfo,
  ValidationSummary,
} from '../../features/import/types/import.types';
import '../../features/import/styles/import.css';

type Step = 'upload' | 'sheets' | 'preview' | 'importing' | 'result';

export const ImportPage: React.FC = () => {
  const [step, setStep] = useState<Step>('upload');
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [sheets, setSheets] = useState<SheetInfo[]>([]);
  const [parsedRows, setParsedRows] = useState<ParsedRowData[]>([]);
  const [validationSummary, setValidationSummary] = useState<ValidationSummary | null>(null);
  const [importResult, setImportResult] = useState<ImportResultSummary | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });

  // 1. File Selection & Inspection
  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const inspected = await importService.inspectWorkbook(file);
      setWorkbook(inspected.workbook);
      setSheets(inspected.sheets);
      setStep('sheets');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal membaca file Excel.');
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Change class for sheet
  const handleClassChange = (sheetName: string, assignedClass: number) => {
    setSheets((prev) =>
      prev.map((s) => (s.name === sheetName ? { ...s, assignedClass } : s))
    );
  };

  // 3. Proceed from sheets config to validation & preview
  const handleProceedToPreview = async () => {
    if (!workbook) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const rawRows = importService.parseWorkbookData(workbook, sheets);
      const validated = await importService.validateRows(rawRows);
      setParsedRows(validated.validatedRows);
      setValidationSummary(validated.summary);
      setStep('preview');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal memproses validasi data.');
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Confirm and Execute Import
  const handleConfirmImport = async () => {
    const validRows = parsedRows.filter((r) => r.isValid);
    if (validRows.length === 0) return;

    setStep('importing');
    setProgress({ current: 0, total: validRows.length });

    try {
      const result = await importService.executeImport(validRows, (curr, tot) => {
        setProgress({ current: curr, total: tot });
      });
      setImportResult(result);
      setStep('result');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Gagal melakukan import data.');
      setStep('preview');
    }
  };

  const handleReset = () => {
    setWorkbook(null);
    setSheets([]);
    setParsedRows([]);
    setValidationSummary(null);
    setImportResult(null);
    setErrorMsg(null);
    setStep('upload');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Import Data Siswa (Excel)</h1>
          <p className="page-subtitle">
            Unggah data siswa sekolah dari berkas spreadsheet (.xlsx) per kelas/worksheet
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="feedback-banner error-banner mb-4">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {step === 'upload' && (
        <ImportDropzone onFileSelect={handleFileSelect} isLoading={isLoading} />
      )}

      {step === 'sheets' && (
        <SheetClassConfig
          sheets={sheets}
          onClassChange={handleClassChange}
          onProceed={handleProceedToPreview}
          onCancel={handleReset}
          isLoading={isLoading}
        />
      )}

      {step === 'preview' && validationSummary && (
        <ImportPreviewTable
          rows={parsedRows}
          summary={validationSummary}
          onConfirmImport={handleConfirmImport}
          onBack={() => setStep('sheets')}
          isLoading={isLoading}
        />
      )}

      {step === 'importing' && (
        <div className="section-card import-progress-card">
          <div className="spinner"></div>
          <div>
            <h3 className="font-semibold text-main">Sedang Mengimpor Data Siswa...</h3>
            <p className="text-sm text-muted mt-1">
              Memproses baris {progress.current} dari {progress.total}
            </p>
          </div>
          <div className="import-progress-bar-wrap">
            <div
              className="import-progress-bar-fill"
              style={{
                width: `${progress.total > 0 ? (progress.current / progress.total) * 100 : 0}%`,
              }}
            ></div>
          </div>
        </div>
      )}

      {step === 'result' && importResult && (
        <ImportResultView result={importResult} onReset={handleReset} />
      )}
    </div>
  );
};
