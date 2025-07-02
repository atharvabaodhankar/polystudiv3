import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import SyllabusTable from '../components/SyllabusTable';
import MaterialCard from '../components/MaterialCard';
import SubjectSection from '../components/SubjectSection';

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
        <h2 className="p-h1 text-4xl text-[#9102C0] font-baumans mb-8">Syllabus</h2>
        <SyllabusTable data={sampleSyllabus} />
      </section>
      {/* Extra Material Section */}
      <section id="extra-materials" className="mb-16">
        <h2 className="p-h1 text-4xl text-[#9102C0] font-baumans mb-8">Extra Materials</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {dummyExtraMaterials.map((mat, i) => (
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
      </section>
      {/* Notes Grid */}
      <section id="notes" className="mb-16">
        <h2 className="p-h1 text-4xl text-[#9102C0] font-baumans mb-8">Notes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {dummyNotes.map((note, i) => (
            <div key={i} className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-2 border-t-4 border-[#9102C0] hover:shadow-2xl transition group">
              <h3 className="text-lg font-bold text-[#342F76] group-hover:text-[#9102C0] transition">{note.title}</h3>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500">By {note.uploader}</span>
                <span className="text-xs text-gray-400">{note.date}</span>
                <a href={note.url} className="text-[#9102C0] hover:underline font-bold">Download</a>
              </div>
            </div>
          ))}
        </div>
      </section>
      {/* Solved Papers Preview */}
      <section id="solved-papers" className="mb-16">
        <h2 className="p-h1 text-4xl text-[#9102C0] font-baumans mb-8">Solved Papers</h2>
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
      
    </div>
  );
};

export default ClassPage; 