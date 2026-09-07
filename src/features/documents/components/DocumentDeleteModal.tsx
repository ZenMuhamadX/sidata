import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import type { StudentDocument, DocumentTypeDefinition } from '../types/document.types';

interface DocumentDeleteModalProps {
  isOpen: boolean;
  document: StudentDocument | null;
  docDef: DocumentTypeDefinition | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export const DocumentDeleteModal: React.FC<DocumentDeleteModalProps> = ({
  isOpen,
  document,
  docDef,
  isDeleting,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !document || !docDef) return null;

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <div className="modal-header">
          <div className="modal-title-wrap">
            <AlertTriangle className="modal-danger-icon" size={20} />
            <h3 className="modal-title">Hapus Dokumen</h3>
          </div>
          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            disabled={isDeleting}
            aria-label="Tutup"
          >
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p className="modal-description">
            Apakah Anda yakin ingin menghapus dokumen <strong>{docDef.label}</strong>?
          </p>

          <div className="callout-danger mt-2">
            <p className="text-sm">
              Berkas <span className="font-mono font-medium">{document.original_filename}</span> akan dihapus secara permanen dari Supabase Storage dan metadata database.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={isDeleting}
          >
            Batal
          </button>
          <button
            type="button"
            className="btn-destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="spinner-sm"></span>
                <span>Menghapus...</span>
              </>
            ) : (
              <>
                <Trash2 size={15} />
                <span>Hapus Dokumen</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
