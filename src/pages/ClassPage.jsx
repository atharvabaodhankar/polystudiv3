import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import SyllabusTable from '../components/SyllabusTable';
import MaterialCard from '../components/MaterialCard';
import SubjectSection from '../components/SubjectSection';
import MaterialRequestForm from '../components/MaterialRequestForm';

const sampleSyllabus = [
  { sr: 1, name: 'Java Programming', code: '22412', marks: 100, pdf: '#' },
  { sr: 2, name: 'Microprocessor', code: '22413', marks: 100, pdf: '#' },
  { sr: 3, name: 'Operating Systems', code: '22414', marks: 100, pdf: '#' },
  { sr: 4, name: 'Data Structures', code: '22415', marks: 100, pdf: '#' },
];

const dummyExtraMaterials = [
  { title: 'Unit Test 1 Answers', url: '#', uploader: 'Admin', date: '2024-01-01', type: 'Guide' },
  { title: 'Manual - Microprocessor', url: '#', uploader: 'Admin', date: '2024-01-02', type: 'Manual' },
  { title: 'Mini Project Report', url: '#', uploader: 'Student', date: '2024-01-10', type: 'Project' },
  { title: 'Unit Test 2 Answers', url: '#', uploader: 'Admin', date: '2024-01-15', type: 'Guide' },
  { title: 'Lab Record Template', url: '#', uploader: 'Priya', date: '2024-01-18', type: 'Template' },
  { title: 'Syllabus Addendum', url: '#', uploader: 'Faculty', date: '2024-01-20', type: 'Notice' },
  { title: 'Practical Viva Questions', url: '#', uploader: 'Rahul', date: '2024-01-22', type: 'Guide' },
  { title: 'Reference Book List', url: '#', uploader: 'Library', date: '2024-01-25', type: 'Resource' },
];

const solvedPapers = [
  { subject: 'Java Programming', code: '22412', papers: [
    { title: '22412-2022-Winter', url: '/class/CM1K/solved' },
    { title: '22412-2019-Summer', url: '/class/CM1K/solved' },
  ]},
  { subject: 'Microprocessor', code: '22413', papers: [
    { title: '22413-2021-Winter', url: '/class/CM1K/solved' },
  ]},
];

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

const ClassPage = () => {
  const { classCode } = useParams();
  const [syllabus, setSyllabus] = useState([]);
  const [extraMaterials, setExtraMaterials] = useState([]);
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [showAllExtra, setShowAllExtra] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = `Polystudi || ${classCode}`;
    const fetchData = async () => {
      const [{ data: syllabusData }, { data: extraData }, { data: notesData }, { data: subjectsData }] = await Promise.all([
        supabase.from('subjects').select('*').eq('class_code', classCode),
        supabase.from('materials').select('*').eq('class_code', classCode).eq('type', 'extra'),
        supabase.from('materials').select('*').eq('class_code', classCode).eq('type', 'note'),
        supabase.from('subjects').select('*').eq('class_code', classCode),
      ]);
      setSyllabus(syllabusData || []);
      setExtraMaterials(extraData || []);
      setNotes(notesData || []);
      setSubjects(subjectsData || []);
      setLoading(false);
    };
    fetchData();
  }, [classCode]);

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      {/* Syllabus Table */}
      <section id="syllabus" className="mb-16">
        <h2 className="p-h1 text-4xl text-[#9102C0] font-bold font-baumans mb-8">Syllabus</h2>
        {syllabus.length === 0 ? (
          <div className="text-[#342F76] text-lg font-poppins">Syllabus is not available for this class yet.</div>
        ) : (
          <SyllabusTable
            data={syllabus.map((subj, i) => ({
              sr: i + 1,
              name: subj.subject_name,
              code: subj.subject_code,
              marks: subj.total_marks || '',
              pdf: subj.syllabus_pdf || '#',
            }))}
          />
        )}
      </section>
      {/* Extra Material Section */}
      <section id="extra-materials" className="mb-16">
        <h2 className="p-h1 text-4xl text-[#9102C0] font-bold font-baumans mb-8">Extra Materials</h2>
        <button
          className="mb-6 px-4 py-2 rounded-full bg-[#9102C0] text-white font-bold hover:bg-[#342F76] transition"
          onClick={() => navigate(`/class/${classCode}/request-material`)}
        >
          Request to Share Material
        </button>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {(showAllExtra ? dummyExtraMaterials : dummyExtraMaterials.slice(0, 3)).map((mat, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-2 border-t-4 border-[#342F76] hover:shadow-2xl transition group">
              <div className="flex items-center gap-2">
                <span className="inline-block px-3 py-1 text-xs rounded-full bg-[#9102C0] text-white font-bold">{mat.type}</span>
                <span className="text-xs text-gray-400 ml-auto">{mat.date}</span>
              </div>
              <h3 className="text-lg font-bold text-[#342F76] group-hover:text-[#9102C0] transition">{mat.title}</h3>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500">By {mat.uploader}</span>
                <a href={mat.url} className="text-[#9102C0] hover:underline font-bold">Download</a>
              </div>
            </div>
          ))}
        </div>
        {dummyExtraMaterials.length > 3 && (
          <div className="flex justify-center mt-4">
            <button
              className="px-6 py-2 rounded-lg bg-[#9102C0] text-white font-semibold hover:bg-[#342F76] transition"
              onClick={() => setShowAllExtra((v) => !v)}
            >
              {showAllExtra ? 'Show Less' : 'Show All'}
            </button>
          </div>
        )}
      </section>
      {/* Notes Grid */}
      <section id="notes" className="mb-16">
        <h2 className="p-h1 text-4xl font-bold text-[#9102C0] font-baumans mb-8">Notes</h2>
        <button
          className="mb-6 px-4 py-2 rounded-full bg-[#9102C0] text-white font-bold hover:bg-[#342F76] transition"
          onClick={() => navigate(`/class/${classCode}/request-material`)}
        >
          Request to Share Material
        </button>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {(showAllNotes ? dummyNotes : dummyNotes.slice(0, 3)).map((note, i) => (
            <div
              key={i}
              className="relative bg-white/80 rounded-2xl shadow-md p-6 flex flex-col min-h-[240px] border border-[#ede9fe] hover:shadow-lg transition-all duration-200 group"
            >
              {/* Small note icon in circle */}
              <div className="flex items-center gap-2 mb-3">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#f3e8ff] text-2xl text-[#9102C0] shadow-sm mr-2">
                  📝
                </span>
                <span className="inline-block w-2 h-2 rounded-full bg-[#9102C0] mr-1"></span>
                <span className="text-xs text-[#342F76] font-semibold">{note.date}</span>
              </div>
              <h3 className="text-lg font-bold text-[#342F76] mb-2 line-clamp-2 font-baumans">{note.title}</h3>
              <div className="text-sm text-[#9102C0] font-medium mb-4">By {note.uploader}</div>
              <div className="mt-auto">
                <a
                  href={note.url}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#9102C0] text-[#9102C0] hover:bg-[#9102C0] hover:text-white font-semibold transition-all duration-200 shadow-sm"
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
        {dummyNotes.length > 3 && (
          <div className="flex justify-center mt-4">
            <button
              className="px-6 py-2 rounded-lg bg-[#9102C0] text-white font-semibold hover:bg-[#342F76] transition"
              onClick={() => setShowAllNotes((v) => !v)}
            >
              {showAllNotes ? 'Show Less' : 'Show All'}
            </button>
          </div>
        )}
      </section>
      {/* Solved Papers Preview */}
      <section id="solved-papers" className="mb-16">
        <h2 className="p-h1 text-4xl text-[#9102C0] font-bold font-baumans mb-8">Solved Papers</h2>
        <button
          className="mb-6 px-4 py-2 rounded-full bg-[#9102C0] text-white font-bold hover:bg-[#342F76] transition"
          onClick={() => navigate(`/class/${classCode}/request-material`)}
        >
          Request to Share Material
        </button>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {solvedPapers.map((subj, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#9102C0]">
              <h3 className="font-bold text-xl mb-2 font-poppins text-[#342F76]">{subj.subject} ({subj.code})</h3>
              <ul className="space-y-2">
                {subj.papers.map((paper, j) => (
                  <li key={j}>
                    <button
                      onClick={() => navigate(paper.url)}
                      className="text-[#9102C0] hover:underline font-bold bg-[#f3e8ff] px-4 py-2 rounded transition"
                    >
                      {paper.title} — Download
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full relative">
            <button className="absolute top-3 right-3 text-2xl text-[#9102C0] font-bold" onClick={() => setShowRequestModal(false)}>&times;</button>
            <MaterialRequestForm onClose={() => setShowRequestModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassPage; 