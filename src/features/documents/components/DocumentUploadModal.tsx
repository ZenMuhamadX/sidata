import React, { useState } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import type { DocumentTypeDefinition } from '../types/document.types';
import { documentService } from '../services/document.service';

interface DocumentUploadModalProps {
  isOpen: boolean;
  docDef: DocumentTypeDefinition | null;
  studentName: string;
  isReplacing: boolean;
  onClose: () => void;
  onSuccess: () => void;
  studentId: string;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  docDef,
  studentName,
  isReplacing,
  onClose,
  onSuccess,
  studentId,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !docDef) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validation = documentService.validateFile(file);
      if (!validation.isValid) {
        setErrorMessage(validation.error || 'File tidak valid.');
        setSelectedFile(null);
      } else {
        setSelectedFile(file);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMessage('Pilih file dokumen terlebih dahulu.');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);

    try {
      await documentService.uploadDocument(studentId, docDef, selectedFile);
      setSelectedFile(null);
      onSuccess();
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : `Gagal mengunggah ${docDef.label}. Silakan coba lagi.`
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (isUploading) return;
    setSelectedFile(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Upload size={18} className="text-primary" />
            <h3 className="modal-title">
              {isReplacing ? `Ganti Dokumen ${docDef.label}` : `Upload Dokumen ${docDef.label}`}
            </h3>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={handleClose}
            disabled={isUploading}
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleUpload}>
          <div className="modal-body">
            <p className="modal-description">
              Siswa: <strong>{studentName}</strong>
            </p>

            {isReplacing && (
              <div className="callout-warning mb-3">
                <p className="text-sm">
                  Mengunggah file baru akan menggantikan file {docDef.label} yang sudah ada sebelumnya.
                </p>
              </div>
            )}

            {errorMessage && (
              <div className="feedback-banner error-banner mb-3">
                <AlertCircle size={16} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="form-group mb-3">
              <label htmlFor="file-input" className="form-label">
                Pilih Berkas ({docDef.label})
              </label>
              <input
                id="file-input"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                onChange={handleFileChange}
                disabled={isUploading}
                className="form-control file-input-custom"
              />
              <span className="form-hint">
                Format yang diperbolehkan: PDF, JPG, PNG (Maks. 5 MB).
              </span>
            </div>

            {selectedFile && (
              <div className="selected-file-info">
                <span className="text-xs text-muted">File terpilih:</span>
                <span className="text-sm font-medium block truncate">
                  {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClose}
              disabled={isUploading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isUploading || !selectedFile}
            >
              {isUploading ? (
                <>
                  <span className="spinner-sm"></span>
                  <span>Mengunggah {docDef.label}...</span>
                </>
              ) : (
                <span>{isReplacing ? 'Simpan & Ganti' : 'Unggah Dokumen'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
