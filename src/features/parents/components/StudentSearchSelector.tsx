import React, { useState, useEffect, useRef } from 'react';
import { Search, Check, ChevronDown, X } from 'lucide-react';
import { parentService } from '../services/parent.service';

interface SelectedStudentInfo {
  id: string;
  nama: string;
  kelas: number;
}

interface StudentSearchSelectorProps {
  selectedStudentId: string;
  preloadedStudent?: SelectedStudentInfo | null;
  disabled?: boolean;
  onSelect: (student: SelectedStudentInfo | null) => void;
}

export const StudentSearchSelector: React.FC<StudentSearchSelectorProps> = ({
  selectedStudentId,
  preloadedStudent,
  disabled = false,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [students, setStudents] = useState<SelectedStudentInfo[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<SelectedStudentInfo | null>(
    preloadedStudent || null
  );
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update selected if preloadedStudent changes
  useEffect(() => {
    if (preloadedStudent) {
      setSelectedStudent(preloadedStudent);
    }
  }, [preloadedStudent]);

  // Search query with debounce
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      setIsLoading(true);
      const results = await parentService.searchStudentsForSelector(searchTerm);
      setStudents(
        results.map((s) => ({
          id: s.id,
          nama: s.nama,
          kelas: s.kelas,
        }))
      );
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, isOpen]);

  const handleChoose = (student: SelectedStudentInfo) => {
    setSelectedStudent(student);
    onSelect(student);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedStudent(null);
    onSelect(null);
  };

  return (
    <div className="student-selector-wrapper" ref={wrapperRef}>
      <div
        className={`selector-trigger ${disabled ? 'selector-disabled' : ''} ${isOpen ? 'selector-active' : ''}`}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        role="button"
        tabIndex={disabled ? -1 : 0}
      >
        <span className={selectedStudent ? 'selector-value' : 'selector-placeholder'}>
          {selectedStudent
            ? `${selectedStudent.nama} — Kelas ${selectedStudent.kelas}`
            : 'Pilih siswa yang terkait...'}
        </span>

        <div className="selector-trigger-icons">
          {selectedStudent && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="selector-clear-btn"
              title="Hapus pilihan siswa"
            >
              <X size={14} />
            </button>
          )}
          <ChevronDown size={16} className="selector-chevron" />
        </div>
      </div>

      {isOpen && (
        <div className="selector-dropdown">
          <div className="selector-search-box">
            <Search size={14} className="selector-search-icon" />
            <input
              type="text"
              autoFocus
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari nama, NIK, atau NISN siswa..."
              className="selector-search-input"
            />
          </div>

          <div className="selector-options-list">
            {isLoading ? (
              <div className="selector-message">Mencari siswa...</div>
            ) : students.length === 0 ? (
              <div className="selector-message">Siswa tidak ditemukan.</div>
            ) : (
              students.map((student) => {
                const isChosen = student.id === selectedStudentId;
                return (
                  <div
                    key={student.id}
                    className={`selector-option ${isChosen ? 'option-selected' : ''}`}
                    onClick={() => handleChoose(student)}
                  >
                    <div>
                      <div className="option-name">{student.nama}</div>
                      <div className="option-sub">Kelas {student.kelas}</div>
                    </div>
                    {isChosen && <Check size={16} className="text-primary" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
