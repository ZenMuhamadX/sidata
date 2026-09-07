import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Eye, Upload, RefreshCw, Trash2, CheckCircle2, MinusCircle, AlertCircle } from 'lucide-react';
import { DOCUMENT_TYPES, formatFileSize, type DocumentTypeDefinition, type StudentDocument } from '../types/document.types';
import { documentService } from '../services/document.service';
import { DocumentUploadModal } from './DocumentUploadModal';
import { DocumentDeleteModal } from './DocumentDeleteModal';

interface StudentDocumentsSectionProps {
  studentId: string;
  studentName: string;
}

export const StudentDocumentsSection: React.FC<StudentDocumentsSectionProps> = ({
  studentId,
  studentName,
}) => {
  const [documents, setDocuments] = useState<Record<string, StudentDocument>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Upload / Replace Modal state
  const [activeUploadDocDef, setActiveUploadDocDef] = useState<DocumentTypeDefinition | null>(null);
  const [isReplacing, setIsReplacing] = useState<boolean>(false);

  // Delete Modal state
  const [activeDeleteDoc, setActiveDeleteDoc] = useState<StudentDocument | null>(null);
  const [activeDeleteDocDef, setActiveDeleteDocDef] = useState<DocumentTypeDefinition | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Viewing/downloading state
  const [openingDocKey, setOpeningDocKey] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await documentService.getDocumentsByStudentId(studentId);
      const map: Record<string, StudentDocument> = {};
      list.forEach((doc) => {
        map[doc.document_type] = doc;
      });
      setDocuments(map);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat dokumen siswa.');
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleOpenDocument = async (doc: StudentDocument, key: string) => {
    setOpeningDocKey(key);
    try {
      const signedUrl = await documentService.getSignedUrl(doc.storage_path);
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Gagal membuka dokumen.',
      });
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setOpeningDocKey(null);
    }
  };

  const handleUploadClick = (docDef: DocumentTypeDefinition, replacing: boolean) => {
    setActiveUploadDocDef(docDef);
    setIsReplacing(replacing);
  };

  const handleUploadSuccess = () => {
    const docDef = activeUploadDocDef;
    setActiveUploadDocDef(null);
    fetchDocuments();
    if (docDef) {
      setFeedback({
        type: 'success',
        message: `${docDef.label} berhasil ${isReplacing ? 'diganti' : 'diunggah'}.`,
      });
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const handleDeleteClick = (doc: StudentDocument, docDef: DocumentTypeDefinition) => {
    setActiveDeleteDoc(doc);
    setActiveDeleteDocDef(docDef);
  };

  const handleConfirmDelete = async () => {
    if (!activeDeleteDoc || !activeDeleteDocDef) return;
    setIsDeleting(true);
    try {
      await documentService.deleteDocument(activeDeleteDoc);
      const label = activeDeleteDocDef.label;
      setActiveDeleteDoc(null);
      setActiveDeleteDocDef(null);
      fetchDocuments();
      setFeedback({
        type: 'success',
        message: `Dokumen ${label} berhasil dihapus.`,
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Gagal menghapus dokumen. Silakan coba lagi.',
      });
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setIsDeleting(false);
    }
  };

  const availableCount = Object.keys(documents).length;

  return (
    <div className="section-card student-documents-card">
      <div className="section-header flex-between">
        <div className="title-with-icon">
          <FileText size={18} className="text-primary" />
          <h3 className="section-title">Dokumen Siswa</h3>
        </div>
        <div className="text-xs text-muted">
          Kelengkapan: <span className="font-medium text-dark">{availableCount} / {DOCUMENT_TYPES.length} Dokumen</span>
        </div>
      </div>

      {feedback && (
        <div
          className={`feedback-banner ${
            feedback.type === 'success' ? 'success-banner' : 'error-banner'
          } mb-3`}
        >
          {feedback.message}
        </div>
      )}

      {error && (
        <div className="feedback-banner error-banner mb-3">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="table-loading-container py-4">
          <div className="spinner-sm"></div>
          <p className="text-sm text-muted">Memeriksa dokumen siswa...</p>
        </div>
      ) : (
        <div className="student-documents-grid">
          {DOCUMENT_TYPES.map((docDef) => {
            const doc = documents[docDef.dbValue];
            const isAvailable = Boolean(doc);
            const isOpening = openingDocKey === docDef.key;

            return (
              <div
                key={docDef.key}
                className={`document-item-box ${isAvailable ? 'doc-available' : 'doc-missing'}`}
              >
                <div className="document-item-header">
                  <div className="document-item-title-group">
                    <span className="document-item-name">{docDef.label}</span>
                    <span
                      className={`document-status-pill ${
                        isAvailable ? 'status-pill-available' : 'status-pill-missing'
                      }`}
                    >
                      {isAvailable ? (
                        <>
                          <CheckCircle2 size={13} />
                          <span>Tersedia</span>
                        </>
                      ) : (
                        <>
                          <MinusCircle size={13} />
                          <span>Belum tersedia</span>
                        </>
                      )}
                    </span>
                  </div>

                  {isAvailable && doc && (
                    <div className="document-item-meta">
                      <span className="document-filename truncate" title={doc.original_filename}>
                        {doc.original_filename}
                      </span>
                      <span className="document-size">{formatFileSize(doc.file_size)}</span>
                    </div>
                  )}
                </div>

                <div className="document-item-actions">
                  {isAvailable && doc ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleOpenDocument(doc, docDef.key)}
                        disabled={isOpening}
                        className="btn-secondary btn-sm"
                        title="Buka dokumen"
                      >
                        {isOpening ? (
                          <span className="spinner-sm"></span>
                        ) : (
                          <Eye size={13} />
                        )}
                        <span>Lihat</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleUploadClick(docDef, true)}
                        className="btn-secondary btn-sm"
                        title="Ganti dokumen dengan file baru"
                      >
                        <RefreshCw size={13} />
                        <span>Ganti</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteClick(doc, docDef)}
                        className="btn-icon btn-icon-danger btn-sm"
                        title="Hapus dokumen"
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUploadClick(docDef, false)}
                      className="btn-primary btn-sm"
                    >
                      <Upload size={13} />
                      <span>Upload</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload/Replace Modal */}
      <DocumentUploadModal
        isOpen={Boolean(activeUploadDocDef)}
        docDef={activeUploadDocDef}
        studentName={studentName}
        isReplacing={isReplacing}
        studentId={studentId}
        onClose={() => setActiveUploadDocDef(null)}
        onSuccess={handleUploadSuccess}
      />

      {/* Delete Confirmation Modal */}
      <DocumentDeleteModal
        isOpen={Boolean(activeDeleteDoc && activeDeleteDocDef)}
        document={activeDeleteDoc}
        docDef={activeDeleteDocDef}
        isDeleting={isDeleting}
        onClose={() => {
          setActiveDeleteDoc(null);
          setActiveDeleteDocDef(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
