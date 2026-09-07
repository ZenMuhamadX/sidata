import React, { useState } from 'react';
import { UploadCloud, FileSpreadsheet, AlertCircle } from 'lucide-react';

interface ImportDropzoneProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
}

export const ImportDropzone: React.FC<ImportDropzoneProps> = ({ onFileSelect, isLoading }) => {
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFile = (file: File) => {
    setErrorMsg(null);
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setErrorMsg('Format file harus berupa spreadsheet Excel (.xlsx).');
      return;
    }
    onFileSelect(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="section-card">
      <div className="section-header">
        <h3 className="section-title">Upload File Excel Siswa</h3>
      </div>
      <div style={{ padding: '1.5rem' }}>
        {errorMsg && (
          <div className="feedback-banner error-banner mb-3">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <label
          htmlFor="excel-upload-input"
          className={`import-upload-dropzone ${dragOver ? 'drag-over' : ''}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
        >
          <input
            id="excel-upload-input"
            type="file"
            accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            className="import-file-input"
            onChange={handleChange}
            disabled={isLoading}
          />
          <div className="import-icon-wrap">
            {isLoading ? <FileSpreadsheet size={24} /> : <UploadCloud size={24} />}
          </div>
          <div>
            <p className="font-semibold text-main">
              {isLoading ? 'Membaca file Excel...' : 'Klik atau seret file Excel ke sini'}
            </p>
            <p className="text-xs text-muted mt-1">
              Mendukung format .xlsx (satu kelas per worksheet)
            </p>
          </div>
        </label>
      </div>
    </div>
  );
};
