import React, { useState } from 'react';
import PdfViewerModal from './PdfViewerModal';

const SyllabusTable = ({ data, isSkills }) => {
  const [selectedSubject, setSelectedSubject] = useState(null);

  return (
    <div className="overflow-x-auto rounded-2xl shadow bg-white border border-[#ede9fe] p-2">
      <table className="min-w-full text-left text-sm font-poppins rounded-2xl overflow-hidden">
        <thead className="bg-[#9102C0] text-white sticky top-0 z-10 font-baumans">
          <tr>
            <th className="py-4 px-6 font-bold text-base rounded-tl-2xl">Sr.No</th>
            <th className="py-4 px-6 font-bold text-base">Subject Name</th>
            <th className="py-4 px-6 font-bold text-base">Subject Code</th>
            {!isSkills && <th className="py-4 px-6 font-bold text-base">Total Marks</th>}
            <th className="py-4 px-6 font-bold text-base rounded-tr-2xl text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className={`${i % 2 === 0 ? 'bg-white' : 'bg-[#f3e8ff]/40'} hover:bg-[#f3e8ff]/80 transition`}>
              <td className="py-3 px-6 font-semibold text-[#342F76]">{row.sr}</td>
              <td className="py-3 px-6 font-semibold text-[#342F76]">{row.name}</td>
              <td className="py-3 px-6 text-[#9102C0] font-bold">{row.code}</td>
              {!isSkills && <td className="py-3 px-6 text-[#342F76]">{row.marks || '—'}</td>}
              <td className="py-3 px-6 text-right">
                <div className="inline-flex items-center gap-2">
                  {row.pdf && row.pdf !== '#' ? (
                    <>
                      <button
                        onClick={() => setSelectedSubject(row)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#9102C0] text-white font-semibold hover:opacity-90 transition cursor-pointer text-xs"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        {isSkills ? 'View Guide' : 'View Syllabus'}
                      </button>
                      <a 
                        href={row.pdf} 
                        download
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center p-2 rounded-full border border-gray-200 text-[#342F76] hover:bg-gray-50 transition"
                        title={isSkills ? 'Download Guide PDF' : 'Download Syllabus PDF'}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                        </svg>
                      </a>
                    </>
                  ) : (
                    <span className="text-gray-400 text-xs font-medium">
                      {isSkills ? 'Guide Not Available' : 'Syllabus Not Available'}
                    </span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Embedded PDF Viewer Modal */}
      {selectedSubject && (
        <PdfViewerModal
          isOpen={!!selectedSubject}
          onClose={() => setSelectedSubject(null)}
          pdfUrl={selectedSubject.pdf}
          subjectName={selectedSubject.name}
          subjectCode={selectedSubject.code}
        />
      )}
    </div>
  );
};

export default SyllabusTable;