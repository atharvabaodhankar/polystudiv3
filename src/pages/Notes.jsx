import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaBookOpen } from 'react-icons/fa';
import { supabase } from '../supabaseClient';

const Notes = () => {
  const { classCode } = useParams();
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contributorStats, setContributorStats] = useState({});

  useEffect(() => {
    document.title = `PolyStudi || ${classCode} Notes`;
    const fetchNotes = async () => {
      const [
        { data: notesData },
        { data: allMaterialsData }
      ] = await Promise.all([
        supabase
          .from('materials')
          .select('*')
          .eq('class_code', classCode)
          .eq('type', 'note')
          .order('created_at', { ascending: false }),
        supabase.from('materials').select('uploader').not('uploader', 'is', null)
      ]);
      if (notesData) setNotes(notesData);

      const counts = {};
      if (allMaterialsData) {
        allMaterialsData.forEach(m => {
          if (m.uploader) {
            counts[m.uploader] = (counts[m.uploader] || 0) + 1;
          }
        });
      }
      setContributorStats(counts);
      setLoading(false);
    };
    fetchNotes();
  }, [classCode]);

  const renderContributorBadge = (uploader) => {
    if (!uploader) return null;
    const count = contributorStats[uploader];
    if (!count) return null;
    const label = count >= 10 ? 'Master Scholar' : count >= 5 ? 'Gold Contributor' : count >= 3 ? 'Silver Contributor' : 'Bronze Contributor';
    const badgeClass = count >= 10 ? 'bg-purple-100 text-purple-700 border-purple-200' : count >= 5 ? 'bg-amber-100 text-amber-700 border-amber-200' : count >= 3 ? 'bg-gray-100 text-gray-700 border-gray-200' : 'bg-orange-100 text-orange-700 border-orange-200';
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border capitalize tracking-wide ${badgeClass}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-baumans text-[#9102C0] mb-2 text-center drop-shadow">
        Notes — <span className="text-[#342F76]">{classCode}</span>
      </h1>
      <p className="text-center text-gray-500 mb-8 text-sm">All approved notes for this class</p>

      <div className="flex justify-center mb-8">
        <button
          onClick={() => navigate(`/class/${classCode}/request-material`)}
          className="px-6 py-2 rounded-full bg-[#9102C0] text-white font-bold hover:bg-[#342F76] transition"
        >
          + Contribute a Note
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-24">
          <div className="w-10 h-10 border-4 border-[#9102C0] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notes.length === 0 ? (
        <div className="text-center py-24 text-[#342F76] text-lg font-poppins">
          No notes found for {classCode} yet.{' '}
          <button
            onClick={() => navigate(`/class/${classCode}/request-material`)}
            className="text-[#9102C0] font-bold underline hover:text-[#342F76]"
          >
            Be the first to contribute!
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {notes.map((note) => (
            <div
              key={note.id}
              className="relative bg-white/80 rounded-2xl shadow-md p-6 flex flex-col min-h-[240px] border border-[#ede9fe] hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#f3e8ff] text-[#9102C0] shadow-sm mr-2">
                  <FaBookOpen className="text-lg" />
                </span>
                <span className="text-xs text-[#342F76] font-semibold">
                  {note.created_at ? new Date(note.created_at).toLocaleDateString() : ''}
                </span>
              </div>
              <h3 className="text-lg font-bold text-[#342F76] mb-2 line-clamp-2 font-baumans">{note.title}</h3>
              {note.subject_code && (
                <span className="text-xs text-gray-400 mb-1">Subject: {note.subject_code}</span>
              )}
              <div className="flex flex-col items-start gap-1 mb-4">
                <div className="text-sm text-[#9102C0] font-medium">By {note.uploader || 'Unknown'}</div>
                {renderContributorBadge(note.uploader)}
              </div>
              <div className="mt-auto">
                <a
                  href={note.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#9102C0] text-[#9102C0] hover:bg-[#9102C0] hover:text-white font-semibold transition-all duration-200 shadow-sm"
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
      )}
    </div>
  );
};

export default Notes;
