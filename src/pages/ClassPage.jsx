import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import SyllabusTable from '../components/SyllabusTable';
import MaterialCard from '../components/MaterialCard';
import SubjectSection from '../components/SubjectSection';

const ClassPage = () => {
  const { classCode } = useParams();
  const [syllabus, setSyllabus] = useState([]);
  const [extraMaterials, setExtraMaterials] = useState([]);
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Class: {classCode}</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Syllabus</h2>
            {/* Replace with dynamic SyllabusTable later */}
            <SyllabusTable />
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Extra Materials</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {extraMaterials.map((mat) => (
                <MaterialCard key={mat.id} title={mat.title} uploader={mat.uploader} />
              ))}
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Solved Papers Preview</h2>
            {subjects.map((subj) => (
              <SubjectSection key={subj.subject_code} subject={`${subj.subject_name} (${subj.subject_code})`}>
                <Link
                  to={`/class/${classCode}/solved`}
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  View Solved Papers
                </Link>
              </SubjectSection>
            ))}
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">Notes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {notes.map((note) => (
                <MaterialCard key={note.id} title={note.title} uploader={note.uploader} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default ClassPage; 