import React, { useState } from 'react';
import { createPortal } from 'react-dom';

const PdfViewerModal = ({ isOpen, onClose, pdfUrl, subjectName, subjectCode }) => {
  if (!isOpen || !pdfUrl) return null;

  const [loading, setLoading] = useState(true);

  // Helper to convert typical Drive link to embedded preview link
  const getEmbedUrl = (url) => {
    if (!url) return '';
    if (url.includes('drive.google.com')) {
      if (url.includes('/preview')) return url;
      // Handles /view?usp=sharing, /view, etc.
      return url.replace(/\/view(?:\?.*)?$/, '/preview');
    }
    return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  };

  const embedUrl = getEmbedUrl(pdfUrl);

  // Lock body scroll when modal is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex flex-col bg-white font-poppins animate-fadeIn">
      {/* Header Control Bar */}
      <div className="bg-[#342F76] text-white px-4 py-3 md:px-6 md:py-4 flex items-center justify-between shadow-md">
        <div className="flex-1 min-w-0 mr-3 flex items-center gap-2 md:gap-3">
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider bg-white/10 px-2 py-0.5 md:py-1 rounded-md text-purple-200 shrink-0">
            {subjectCode || 'Syllabus'}
          </span>
          <h3 className="font-baumans font-bold text-sm md:text-lg text-white truncate" title={subjectName}>
            {subjectName || 'Subject Syllabus'}
          </h3>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <a 
            href={pdfUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 md:px-3 md:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition cursor-pointer"
            title="Open in New Tab"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span className="hidden md:inline">Open in New Tab</span>
          </a>
          
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-white transition cursor-pointer flex items-center justify-center"
            title="Close Viewer"
          >
            <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content Panel / Iframe Wrapper */}
      <div className="flex-1 bg-gray-100 relative">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-50/90 z-10 gap-3">
            <div className="w-10 h-10 border-4 border-[#9102C0] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-semibold text-gray-500">Loading syllabus document...</span>
          </div>
        )}
        
        <iframe 
          src={embedUrl}
          title={subjectName || 'PDF Viewer'}
          className="w-full h-full border-none"
          onLoad={() => setLoading(false)}
          allow="autoplay"
        />
      </div>
    </div>,
    document.body
  );
};

export default PdfViewerModal;
