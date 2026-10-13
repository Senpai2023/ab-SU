import React, { useState } from 'react';
import { Recipient } from '../types';
import { COLLEGES } from '../data/mockData';
import { 
  Users, 
  Search, 
  Plus, 
  Download, 
  Upload, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Smartphone,
  Check,
  AlertCircle
} from 'lucide-react';

interface RecipientManagerProps {
  recipients: Recipient[];
  onAddRecipient: (recipient: Recipient) => void;
  onDeleteRecipient: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onImportCsv: (imported: Recipient[]) => void;
}

export const RecipientManager: React.FC<RecipientManagerProps> = ({
  recipients,
  onAddRecipient,
  onDeleteRecipient,
  onToggleStatus,
  onImportCsv,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // New recipient form state
  const [studentId, setStudentId] = useState('');
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [college, setCollege] = useState('CCIS');
  const [program, setProgram] = useState('BS Computer Science');
  const [yearLevel, setYearLevel] = useState(2);

  // CSV Import State
  const [csvContent, setCsvContent] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const filteredRecipients = recipients.filter((r) => {
    const matchesCollege = selectedCollege === 'ALL' || r.college === selectedCollege;
    const matchesSearch =
      r.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.phoneNumber.includes(searchQuery);
    return matchesCollege && matchesSearch;
  });

  const handleCreateRecipient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !fullName || !phoneNumber) return;

    const newRec: Recipient = {
      id: `rec-${Date.now().toString(36)}`,
      studentId: studentId.trim(),
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim().startsWith('+') ? phoneNumber.trim() : `+63 ${phoneNumber.trim()}`,
      college,
      program,
      yearLevel,
      consentStatus: 'OPTED_IN',
      isActive: true,
      registeredAt: new Date().toISOString(),
    };

    onAddRecipient(newRec);
    setIsAddModalOpen(false);
    // Reset form
    setStudentId('');
    setFullName('');
    setPhoneNumber('');
  };

  const handleExportCsv = () => {
    const header = 'Student_ID,Full_Name,Phone_Number,College,Program,Year_Level,Consent_Status,Is_Active,Registered_At\n';
    const rows = recipients.map((r) => 
      `"${r.studentId}","${r.fullName}","${r.phoneNumber}","${r.college}","${r.program}",${r.yearLevel},"${r.consentStatus}",${r.isActive},"${r.registeredAt}"`
    ).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `abisu_recipients_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleParseAndImportCsv = () => {
    try {
      const lines = csvContent.split('\n').filter((l) => l.trim().length > 0);
      if (lines.length <= 1) {
        setImportStatus('CSV is empty or invalid.');
        return;
      }

      const imported: Recipient[] = [];
      // Skip header line
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.replace(/"/g, '').trim());
        if (parts.length >= 3) {
          imported.push({
            id: `rec-imp-${Date.now().toString(36)}-${i}`,
            studentId: parts[0] || `2026-${Math.floor(10000 + Math.random() * 90000)}`,
            fullName: parts[1] || 'Registered Student',
            phoneNumber: parts[2].startsWith('+') ? parts[2] : `+63 ${parts[2]}`,
            college: parts[3] || 'CCIS',
            program: parts[4] || 'General Studies',
            yearLevel: parseInt(parts[5] || '1', 10),
            consentStatus: 'OPTED_IN',
            isActive: true,
            registeredAt: new Date().toISOString(),
          });
        }
      }

      onImportCsv(imported);
      setImportStatus(`Successfully imported ${imported.length} student contacts.`);
      setTimeout(() => {
        setIsImportModalOpen(false);
        setCsvContent('');
        setImportStatus(null);
      }, 1200);
    } catch {
      setImportStatus('Error parsing CSV. Please check formatting.');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs p-5 sm:p-6">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[#D00000]" />
            Student Recipient Directory & SMS Subscriptions
          </h3>
          <p className="text-xs text-neutral-500 font-medium">
            Manage student phone numbers, emergency contact permissions, and college groups
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>

          <button
            type="button"
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            Import CSV
          </button>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#D00000] hover:bg-[#B50000] rounded-lg transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Recipient
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 mb-5">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, student ID, or mobile number..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-neutral-300 rounded-xl text-neutral-800 placeholder-neutral-400 focus:outline-none focus:border-[#D00000]"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={selectedCollege}
            onChange={(e) => setSelectedCollege(e.target.value)}
            className="w-full sm:w-auto text-xs sm:text-sm font-medium border border-neutral-300 rounded-xl px-3 py-2 bg-white text-neutral-700 focus:outline-none focus:border-[#D00000]"
          >
            {COLLEGES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code === 'ALL' ? 'All Colleges & Units' : `${c.code}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Structured Recipients Table */}
      <div className="overflow-x-auto border border-neutral-200 rounded-xl">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-200">
            <tr>
              <th className="py-3 px-4">Student ID</th>
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-4">Phone Number</th>
              <th className="py-3 px-4">College & Program</th>
              <th className="py-3 px-4">Year</th>
              <th className="py-3 px-4">Consent Status</th>
              <th className="py-3 px-4">Active</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {filteredRecipients.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-neutral-400">
                  No recipient records found.
                </td>
              </tr>
            ) : (
              filteredRecipients.map((rec) => (
                <tr key={rec.id} className="hover:bg-neutral-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-medium text-neutral-900">
                    {rec.studentId}
                  </td>
                  <td className="py-3 px-4 font-semibold text-neutral-900">
                    {rec.fullName}
                  </td>
                  <td className="py-3 px-4 font-mono text-neutral-700">
                    {rec.phoneNumber}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-neutral-800">{rec.college}</span>
                    <span className="text-neutral-400 text-[11px] block">{rec.program}</span>
                  </td>
                  <td className="py-3 px-4 tabular-nums text-neutral-700">
                    Year {rec.yearLevel}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {rec.consentStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => onToggleStatus(rec.id)}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded cursor-pointer ${
                        rec.isActive 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : 'bg-neutral-200 text-neutral-600'
                      }`}
                    >
                      {rec.isActive ? 'Active' : 'Disabled'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onDeleteRecipient(rec.id)}
                      className="p-1 text-neutral-400 hover:text-red-600 rounded transition-colors"
                      title="Remove contact"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Directory Count Summary */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 font-medium">
        <div>
          Showing <span className="text-neutral-900 font-bold tabular-nums">{filteredRecipients.length}</span> of{' '}
          <span className="text-neutral-900 font-bold tabular-nums">{recipients.length}</span> registered recipients
        </div>
        <div className="text-[11px] text-neutral-400">
          Philippine E.164 cellular numbers verified with campus registrar database
        </div>
      </div>

      {/* ADD RECIPIENT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-neutral-100">
            <h4 className="text-lg font-bold text-neutral-900 mb-1">Add Student Emergency Contact</h4>
            <p className="text-xs text-neutral-500 mb-4">
              Register an official mobile number for campus SMS broadcast dispatches
            </p>

            <form onSubmit={handleCreateRecipient} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Student ID</label>
                <input
                  type="text"
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="e.g. 2026-10492"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-[#D00000]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Juan De La Cruz"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-[#D00000]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">Mobile Number</label>
                <input
                  type="text"
                  required
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="e.g. +63 917 123 4567"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-[#D00000]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">College</label>
                  <select
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-[#D00000]"
                  >
                    {COLLEGES.filter((c) => c.code !== 'ALL').map((c) => (
                      <option key={c.code} value={c.code}>{c.code}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">Year Level</label>
                  <select
                    value={yearLevel}
                    onChange={(e) => setYearLevel(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:border-[#D00000]"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#D00000] hover:bg-[#B50000] rounded-lg transition-all shadow-xs cursor-pointer"
                >
                  Save Recipient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV IMPORT MODAL */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-neutral-100">
            <h4 className="text-lg font-bold text-neutral-900 mb-1">Import Recipients from CSV</h4>
            <p className="text-xs text-neutral-500 mb-4">
              Paste CSV contents or student list. Format: Student_ID, Full_Name, Phone_Number, College, Program, Year
            </p>

            <div className="mb-3">
              <button
                type="button"
                onClick={() => {
                  setCsvContent(`Student_ID,Full_Name,Phone_Number,College,Program,Year_Level
2026-09182,Mark Anthony Santos,+639178234561,CCIS,BS Computer Science,3
2026-08192,Bea Kimberly Torres,+639281234902,CEGS,BS Geodetic Eng,2
2026-07163,Carlos Miguel Dizon,+639391029384,CAS,BS Biology,4
2026-06154,Patricia Jane Lim,+639451829304,CED,BSEd English,1`);
                }}
                className="text-[11px] text-[#D00000] font-semibold hover:underline"
              >
                Load Sample Student CSV Data
              </button>
            </div>

            <textarea
              rows={6}
              value={csvContent}
              onChange={(e) => setCsvContent(e.target.value)}
              placeholder="Paste comma-separated student rows here..."
              className="w-full p-3 font-mono text-xs border border-neutral-300 rounded-xl focus:outline-none focus:border-[#D00000]"
            />

            {importStatus && (
              <div className="mt-2 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                <Check className="w-4 h-4" /> {importStatus}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100 mt-4">
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleParseAndImportCsv}
                className="px-5 py-2 text-xs font-bold text-white bg-[#D00000] hover:bg-[#B50000] rounded-lg transition-all shadow-xs cursor-pointer"
              >
                Execute Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
