import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import SyllabusTable from '../components/SyllabusTable';
import MaterialCard from '../components/MaterialCard';
import SubjectSection from '../components/SubjectSection';
import MaterialRequestForm from '../components/MaterialRequestForm';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

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
  const [questionPapers, setQuestionPapers] = useState([]);
  const [solvedPapers, setSolvedPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [showAllExtra, setShowAllExtra] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showAllSolved, setShowAllSolved] = useState(false);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const navigate = useNavigate();
  const syllabusRef = useRef(null);
  const extraRef = useRef(null);
  const notesRef = useRef(null);
  const solvedRef = useRef(null);
  const questionRef = useRef(null);

  useEffect(() => {
    document.title = `Polystudi || ${classCode}`;
    const fetchData = async () => {
      const [
        { data: syllabusData },
        { data: extraData },
        { data: notesData },
        { data: subjectsData },
        { data: questionPapersData },
        { data: solvedPapersData }
      ] = await Promise.all([
        supabase.from('subjects').select('*').eq('class_code', classCode),
        supabase.from('materials').select('*').eq('class_code', classCode).eq('type', 'extra'),
        supabase.from('materials').select('*').eq('class_code', classCode).eq('type', 'note'),
        supabase.from('subjects').select('*').eq('class_code', classCode),
        supabase.from('materials').select('*').eq('class_code', classCode).eq('type', 'question_paper'),
        supabase.from('materials').select('*').eq('class_code', classCode).eq('type', 'solved'),
      ]);
      setSyllabus(syllabusData || []);
      setExtraMaterials(extraData || []);
      setNotes(notesData || []);
      setSubjects(subjectsData || []);
      // Group question papers by subject
      if (questionPapersData) {
        const groupedQ = {};
        questionPapersData.forEach((item) => {
          if (!groupedQ[item.subject_code]) groupedQ[item.subject_code] = [];
          groupedQ[item.subject_code].push(item);
        });
        const questionArray = Object.entries(groupedQ).map(([subject_code, papers]) => {
          const subject = subjectsData.find(s => s.subject_code === subject_code);
          return {
            subject: subject ? subject.subject_name : subject_code,
            code: subject_code,
            papers,
          };
        });
        setQuestionPapers(questionArray);
      } else {
        setQuestionPapers([]);
      }
      // Group solved papers by subject
      if (solvedPapersData) {
        const grouped = {};
        solvedPapersData.forEach((item) => {
          if (!grouped[item.subject_code]) grouped[item.subject_code] = [];
          grouped[item.subject_code].push(item);
        });
        // Map to array for rendering
        const solvedArray = Object.entries(grouped).map(([subject_code, papers]) => {
          const subject = subjectsData.find(s => s.subject_code === subject_code);
          return {
            subject: subject ? subject.subject_name : subject_code,
            code: subject_code,
            papers,
          };
        });
        setSolvedPapers(solvedArray);
      } else {
        setSolvedPapers([]);
      }
      setLoading(false);
    };
    fetchData();
  }, [classCode]);

  useEffect(() => {
    // GSAP Animations
    const sections = [syllabusRef, extraRef, notesRef, solvedRef, questionRef];
    sections.forEach((ref, i) => {
      if (ref.current) {
        gsap.fromTo(
          ref.current,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: ref.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
            delay: i * 0.1,
          }
        );
      }
    });
    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [loading]);

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      {/* Syllabus Table */}
      <section id="syllabus" className="mb-16" ref={syllabusRef}>
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
      <section id="extra-materials" className="mb-16" ref={extraRef}>
        <h2 className="p-h1 text-4xl text-[#9102C0] font-bold font-baumans mb-8">Extra Materials</h2>
        <button
          className="mb-6 px-4 py-2 rounded-full bg-[#9102C0] text-white font-bold hover:bg-[#342F76] transition"
          onClick={() => navigate(`/class/${classCode}/request-material`)}
        >
          Request to Share Material
        </button>
        {extraMaterials.length === 0 ? (
          <div className="text-[#342F76] text-lg font-poppins">No extra materials found for this class yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {extraMaterials.map((mat, i) => (
              <div key={i} className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-2 border-t-4 border-[#342F76] hover:shadow-2xl transition group">
                <div className="flex items-center gap-2">
                  <span className="inline-block px-3 py-1 text-xs rounded-full bg-[#9102C0] text-white font-bold">Extra</span>
                  <span className="text-xs text-gray-400 ml-auto">{mat.created_at ? new Date(mat.created_at).toLocaleDateString() : ''}</span>
                </div>
                <h3 className="text-lg font-bold text-[#342F76] group-hover:text-[#9102C0] transition">{mat.title}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-500">By {mat.uploader || 'Unknown'}</span>
                  <a href={mat.file_url} className="text-[#9102C0] hover:underline font-bold" target="_blank" rel="noopener noreferrer">Download</a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      {/* Notes Grid */}
      <section id="notes" className="mb-16" ref={notesRef}>
        <h2 className="p-h1 text-4xl font-bold text-[#9102C0] font-baumans mb-8">Notes</h2>
        <button
          className="mb-6 px-4 py-2 rounded-full bg-[#9102C0] text-white font-bold hover:bg-[#342F76] transition"
          onClick={() => navigate(`/class/${classCode}/request-material`)}
        >
          Request to Share Material
        </button>
        {notes.length === 0 ? (
          <div className="text-[#342F76] text-lg font-poppins">No notes found for this class yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {(showAllNotes ? notes : notes.slice(0, 3)).map((note, i) => (
              <div
                key={note.id}
                className="relative bg-white/80 rounded-2xl shadow-md p-6 flex flex-col min-h-[240px] border border-[#ede9fe] hover:shadow-lg transition-all duration-200 group"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#f3e8ff] text-2xl text-[#9102C0] shadow-sm mr-2">
                    📝
                  </span>
                  <span className="inline-block w-2 h-2 rounded-full bg-[#9102C0] mr-1"></span>
                  <span className="text-xs text-[#342F76] font-semibold">{note.created_at ? new Date(note.created_at).toLocaleDateString() : ''}</span>
                </div>
                <h3 className="text-lg font-bold text-[#342F76] mb-2 line-clamp-2 font-baumans">{note.title}</h3>
                <div className="text-sm text-[#9102C0] font-medium mb-4">By {note.uploader || 'Unknown'}</div>
                <div className="mt-auto">
                  <a
                    href={note.file_url}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#9102C0] text-[#9102C0] hover:bg-[#9102C0] hover:text-white font-semibold transition-all duration-200 shadow-sm"
                    title="Download Note"
                    target="_blank"
                    rel="noopener noreferrer"
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
        {notes.length > 3 && (
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
      <section id="solved-papers" className="mb-16" ref={solvedRef}>
        <h2 className="p-h1 text-4xl text-[#9102C0] font-bold font-baumans mb-8">Solved Papers</h2>
        <button
          className="mb-6 px-4 py-2 rounded-full bg-[#9102C0] text-white font-bold hover:bg-[#342F76] transition"
          onClick={() => navigate(`/class/${classCode}/request-material`)}
        >
          Request to Share Material
        </button>
        {solvedPapers.length === 0 ? (
          <div className="text-[#342F76] text-lg font-poppins">No solved papers found for this class yet.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {(showAllSolved ? solvedPapers : solvedPapers.slice(0, 2)).map((subj, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#9102C0]">
                  <h3 className="font-bold text-xl mb-2 font-poppins text-[#342F76]">{subj.subject} ({subj.code})</h3>
                  <ul className="space-y-2">
                    {subj.papers.map((paper, j) => (
                      <li key={paper.id}>
                        <a
                          href={paper.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#9102C0] hover:underline font-bold bg-[#f3e8ff] px-4 py-2 rounded transition inline-block"
                        >
                          {paper.title} — Download
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {solvedPapers.length > 2 && (
              <div className="flex justify-center mt-4">
                <button
                  className="px-6 py-2 rounded-lg bg-[#9102C0] text-white font-semibold hover:bg-[#342F76] transition"
                  onClick={() => setShowAllSolved((v) => !v)}
                >
                  {showAllSolved ? 'Show Less' : 'Show All'}
                </button>
              </div>
            )}
          </>
        )}
      </section>
      {/* Question Papers Section */}
      <section id="question-papers" className="mb-16" ref={questionRef}>
        <h2 className="p-h1 text-4xl text-[#9102C0] font-bold font-baumans mb-8">Question Papers</h2>
        <button
          className="mb-6 px-4 py-2 rounded-full bg-[#9102C0] text-white font-bold hover:bg-[#342F76] transition"
          onClick={() => navigate(`/class/${classCode}/request-material`)}
        >
          Request to Share Material
        </button>
        {questionPapers.length === 0 ? (
          <div className="text-[#342F76] text-lg font-poppins">No question papers found for this class yet.</div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {(showAllQuestions ? questionPapers : questionPapers.slice(0, 2)).map((subj, i) => (
                <div key={i} className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#9102C0]">
                  <h3 className="font-bold text-xl mb-2 font-poppins text-[#342F76]">{subj.subject} ({subj.code})</h3>
                  <ul className="space-y-2">
                    {subj.papers.map((paper, j) => (
                      <li key={paper.id}>
                        <a
                          href={paper.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#9102C0] hover:underline font-bold bg-[#f3e8ff] px-4 py-2 rounded transition inline-block"
                        >
                          {paper.title} — Download
                        </a>
                        {/* <span className="text-xs text-gray-400 ml-2">{paper.created_at ? new Date(paper.created_at).toLocaleDateString() : ''}</span> */}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {questionPapers.length > 2 && (
              <div className="flex justify-center mt-4">
                <button
                  className="px-6 py-2 rounded-lg bg-[#9102C0] text-white font-semibold hover:bg-[#342F76] transition"
                  onClick={() => setShowAllQuestions((v) => !v)}
                >
                  {showAllQuestions ? 'Show Less' : 'Show All'}
                </button>
              </div>
            )}
          </>
        )}
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