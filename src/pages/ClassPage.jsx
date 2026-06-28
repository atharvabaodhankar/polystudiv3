import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaBookOpen } from 'react-icons/fa';
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

const ContributorBadge = ({ tier, size = 'md' }) => {
  const badgeImages = {
    contributor: '/contributor_badge.png',
    bronze: '/bronze_badge.png',
    silver: '/silver_badge.png',
    gold: '/gold_badge.png',
    master: '/master_badge.png'
  };

  const imageSrc = badgeImages[tier] || badgeImages.contributor;

  return (
    <div className="relative flex items-center justify-center rounded-full overflow-hidden transition-all duration-300"
      style={{ 
        width: size === 'sm' ? '26px' : '54px',
        height: size === 'sm' ? '26px' : '54px'
      }}
    >
      <img 
        src={imageSrc} 
        alt={`${tier} Badge`} 
        className="w-full h-full object-cover rounded-full"
      />
    </div>
  );
};

const ClassPage = () => {
  const { classCode } = useParams();
  const [syllabus, setSyllabus] = useState([]);
  const [contributorStats, setContributorStats] = useState({});
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
        { data: solvedPapersData },
        { data: allMaterialsData }
      ] = await Promise.all([
        supabase.from('subjects').select('*').eq('class_code', classCode),
        supabase.from('materials').select('*').eq('class_code', classCode).eq('type', 'extra'),
        supabase.from('materials').select('*').eq('class_code', classCode).eq('type', 'note'),
        supabase.from('subjects').select('*').eq('class_code', classCode),
        supabase.from('materials').select('*').eq('class_code', classCode).eq('type', 'question_paper'),
        supabase.from('materials').select('*').eq('class_code', classCode).eq('type', 'solved'),
        supabase.from('materials').select('uploader').not('uploader', 'is', null),
      ]);
      setSyllabus(syllabusData || []);
      setExtraMaterials(extraData || []);
      setNotes(notesData || []);
      setSubjects(subjectsData || []);

      // Aggregate contributor statistics
      const counts = {};
      if (allMaterialsData) {
        allMaterialsData.forEach(m => {
          if (m.uploader) {
            counts[m.uploader] = (counts[m.uploader] || 0) + 1;
          }
        });
      }
      setContributorStats(counts);
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

    const renderContributorBadge = (uploader) => {
      if (!uploader) return null;
      const count = contributorStats[uploader];
      if (!count) return null;
      const tier = count >= 15 ? 'master' : count >= 10 ? 'gold' : count >= 5 ? 'silver' : count >= 3 ? 'bronze' : 'contributor';
      const label = tier === 'master' ? 'Master Scholar' : tier === 'gold' ? 'Gold Scholar' : tier === 'silver' ? 'Silver Scholar' : tier === 'bronze' ? 'Bronze Scholar' : 'Contributor';
      const badgeClass = tier === 'master' ? 'bg-purple-100 text-purple-700 border-purple-200' : tier === 'gold' ? 'bg-amber-50 text-amber-700 border-amber-200' : tier === 'silver' ? 'bg-slate-100 text-slate-700 border-slate-200' : tier === 'bronze' ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-indigo-50 text-indigo-700 border-indigo-200';
      return (
        <div className="flex items-center gap-1.5 mt-0.5">
          <ContributorBadge tier={tier} size="sm" />
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border uppercase tracking-wide ${badgeClass}`}>
            {label}
          </span>
        </div>
      );
    };

  return (
    <div className="max-w-7xl mx-auto py-12 px-4">
      {/* Class Welcome Section */}
      <section className="mb-16 flex flex-col items-start bg-gradient-to-r from-[#f3e8ff] via-white to-white rounded-2xl p-8 shadow-lg border-l-8 border-[#9102C0]">
        <h1 className="text-5xl md:text-7xl font-bold text-[#9102C0] mb-2 tracking-tight uppercase drop-shadow-sm">{classCode}</h1>
        <div className="h-1 w-20 bg-[#9102C0] rounded"></div>
        <div className="mt-6 w-full flex">
          <div className="relative bg-white/60 backdrop-blur-md rounded-2xl shadow-xl px-8 py-8 flex flex-col md:flex-row items-start justify-between gap-6 w-full max-w-4xl border border-white/30">
            {/* Gradient Accent Bar */}
            <div className="absolute left-0 top-6 bottom-6 w-1 bg-gradient-to-b from-[#9102C0] via-[#E040FB] to-[#342F76] rounded-full opacity-80 hidden md:block"></div>
            {/* Icon */}
            <div className="flex-shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-[#9102C0] to-[#E040FB] shadow-md">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
            </div>
            {/* Text */}
            <div className="flex-1 text-left">
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#9102C0] to-[#E040FB] bg-clip-text text-transparent mb-2">Contribute to your class!</h2>
              <p className="text-[#342F76] text-base md:text-lg font-medium">Share your notes, papers, or materials and help everyone succeed.</p>
            </div>
            {/* Button */}
            <button
              className="px-8 py-3 rounded-full bg-gradient-to-r from-[#9102C0] via-[#E040FB] to-[#9102C0] text-white font-bold shadow-lg hover:scale-105 transition-all duration-200 text-left"
              onClick={() => navigate(`/class/${classCode}/request-material`)}
            >
              Contribute Now
            </button>
          </div>
        </div>
      </section>
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
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-sm text-gray-500">By {mat.uploader || 'Unknown'}</span>
                    {renderContributorBadge(mat.uploader)}
                  </div>
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
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#f3e8ff] text-[#9102C0] shadow-sm mr-2">
                    <FaBookOpen className="text-lg" />
                  </span>
                  <span className="inline-block w-2 h-2 rounded-full bg-[#9102C0] mr-1"></span>
                  <span className="text-xs text-[#342F76] font-semibold">{note.created_at ? new Date(note.created_at).toLocaleDateString() : ''}</span>
                </div>
                <h3 className="text-lg font-bold text-[#342F76] mb-2 line-clamp-2 font-baumans">{note.title}</h3>
                <div className="flex flex-col items-start gap-1 mb-4">
                  <div className="text-sm text-[#9102C0] font-medium">By {note.uploader || 'Unknown'}</div>
                  {renderContributorBadge(note.uploader)}
                </div>
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