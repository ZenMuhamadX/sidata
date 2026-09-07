import React from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import type { SheetInfo } from '../types/import.types';

interface SheetClassConfigProps {
  sheets: SheetInfo[];
  onClassChange: (sheetName: string, assignedClass: number) => void;
  onProceed: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export const SheetClassConfig: React.FC<SheetClassConfigProps> = ({
  sheets,
  onClassChange,
  onProceed,
  onCancel,
  isLoading,
}) => {
  return (
    <div className="section-card">
      <div className="section-header">
        <h3 className="section-title">Konfigurasi Lembar Kerja (Worksheet) & Kelas</h3>
        <p className="text-xs text-muted mt-1">
          Periksa dan tentukan tingkatan kelas untuk setiap sheet yang ditemukan dalam file Excel.
        </p>
      </div>

      <div className="table-responsive">
        <table className="sheet-config-table">
          <thead>
            <tr>
              <th>Nama Worksheet</th>
              <th>Status Deteksi</th>
              <th>Tingkatan Kelas</th>
              <th>Estimasi Baris</th>
            </tr>
          </thead>
          <tbody>
            {sheets.map((sheet) => (
              <tr key={sheet.name}>
                <td className="font-semibold text-main">{sheet.name}</td>
                <td>
                  {!sheet.isAmbiguous && sheet.detectedClass ? (
                    <span className="text-xs text-success inline-flex items-center gap-1" style={{ color: '#047857' }}>
                      <CheckCircle2 size={13} />
                      <span>Terdeteksi Kelas {sheet.detectedClass}</span>
                    </span>
                  ) : (
                    <span className="text-xs text-warning inline-flex items-center gap-1" style={{ color: '#b45309' }}>
                      <AlertTriangle size={13} />
                      <span>Nama sheet tidak spesifik — Harap pilih</span>
                    </span>
                  )}
                </td>
                <td>
                  <select
                    className="filter-select"
                    value={sheet.assignedClass}
                    onChange={(e) => onClassChange(sheet.name, Number(e.target.value))}
                    disabled={isLoading}
                  >
                    <option value={1}>Kelas 1</option>
                    <option value={2}>Kelas 2</option>
                    <option value={3}>Kelas 3</option>
                    <option value={4}>Kelas 4</option>
                    <option value={5}>Kelas 5</option>
                    <option value={6}>Kelas 6</option>
                  </select>
                </td>
                <td className="text-sm text-secondary font-mono">
                  {sheet.rowCount} baris
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="modal-footer" style={{ padding: '1rem 1.25rem' }}>
        <button
          type="button"
          className="btn-secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          Ganti File
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={onProceed}
          disabled={isLoading}
        >
          Lanjut ke Validasi & Preview
        </button>
      </div>
    </div>
  );
};
