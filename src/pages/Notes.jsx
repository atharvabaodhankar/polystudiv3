import React from 'react';
import { useParams } from 'react-router-dom';

const dummyNotes = [
  { title: 'MIC UT2 QNAs', uploader: 'Shubham Masali', url: '#', date: '2024-01-05' },
  { title: 'JPR Important Qs', uploader: 'Atharva', url: '#', date: '2024-01-07' },
  { title: 'OS Short Notes', uploader: 'Priya', url: '#', date: '2024-01-09' },
  { title: 'DSA Cheat Sheet', uploader: 'Rahul', url: '#', date: '2024-01-11' },
  { title: 'Microprocessor Lab Manual', uploader: 'Faculty', url: '#', date: '2024-01-13' },
  { title: 'Java Programs Collection', uploader: 'Student', url: '#', date: '2024-01-15' },
  { title: 'Data Structures Diagrams', uploader: 'Library', url: '#', date: '2024-01-17' },
  { title: 'OS Previous Year Qs', uploader: 'Priya', url: '#', date: '2024-01-19' },
  { title: 'JPR Viva Questions', uploader: 'Atharva', url: '#', date: '2024-01-21' },
];

const Notes = () => {
  const { classCode } = useParams();
  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-baumans text-[#9102C0] mb-8 text-center drop-shadow">Notes for <span className="text-[#342F76]">{classCode}</span></h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
        {dummyNotes.map((note, i) => (
          <div
            key={i}
            className="relative rounded-3xl shadow-2xl p-0 flex flex-col min-h-[320px] overflow-hidden group"
            style={{
              background: 'rgba(255,255,255,0.7)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1.5px solid #e0d7f7',
              transform: i % 2 === 0 ? 'rotate(-1.5deg)' : 'rotate(1.5deg)'
            }}
          >
            {/* Vertical Ribbon */}
            <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-[#9102C0] to-[#342F76] rounded-tr-2xl rounded-br-2xl shadow-md"></div>
            {/* Note Icon */}
            <div className="flex justify-center items-center pt-6 pb-2">
              <span className="text-5xl drop-shadow-sm">📝</span>
            </div>
            {/* Date Badge */}
            <div className="flex justify-center">
              <span className="inline-block px-3 py-1 text-xs rounded-full bg-[#342F76]/90 text-white font-bold w-fit mb-2 shadow">{note.date}</span>
            </div>
            {/* Title */}
            <h3 className="text-lg font-extrabold text-center text-[#342F76] group-hover:text-[#9102C0] transition mb-1 px-4 line-clamp-2 font-baumans">{note.title}</h3>
            {/* Uploader */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-xs text-[#9102C0] font-semibold">By {note.uploader}</span>
            </div>
            {/* Download Button */}
            <div className="mt-auto w-full flex justify-center pb-6">
              <a
                href={note.url}
                className="w-11/12 bg-gradient-to-r from-[#9102C0] to-[#342F76] hover:from-[#342F76] hover:to-[#9102C0] text-white py-3 rounded-full shadow-lg transition-all duration-200 font-bold text-center flex items-center justify-center gap-2 text-base"
                title="Download Note"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4m-8 8h8" />
                </svg>
                Download
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notes; 