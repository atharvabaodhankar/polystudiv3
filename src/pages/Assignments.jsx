import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Assignments = () => {
  const { classCode } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  const dummyAssignments = [
    { id: 1, title: 'OOP Assignment 1', uploader: 'Prof. Sharma', file_url: '#' },
    { id: 2, title: 'DBMS Assignment 2', uploader: 'Prof. Patel', file_url: '#' },
    { id: 3, title: 'DSA Assignment 3', uploader: 'Prof. Singh', file_url: '#' },
  ];

  useEffect(() => {
    const fetchAssignments = async () => {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('class_code', classCode)
        .eq('type', 'assignment');
      if (!error && data) setAssignments(data);
      setLoading(false);
    };
    fetchAssignments();
  }, [classCode]);

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-baumans text-[#9102C0] mb-8 text-center drop-shadow">Assignments for <span className="text-[#342F76]">{classCode}</span></h1>
      <button
        className="mb-8 px-4 py-2 rounded-full bg-[#9102C0] text-white font-bold hover:bg-[#342F76] transition block mx-auto"
        onClick={() => window.location.href = `/class/${classCode}/request-material`}
      >
        Request to Share Material
      </button>
      {loading ? (
        <div className="text-center text-lg text-[#342F76]">Loading...</div>
      ) : assignments.length === 0 ? (
        <div className="text-center text-[#9102C0] font-semibold mb-4">No assignments found for this class yet.</div>
      ) : (
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full table-fixed border border-[#9102C0] rounded-xl shadow-lg bg-white text-center">
            <thead className="bg-[#f3e8ff]">
              <tr>
                <th className="border-b border-[#9102C0] px-6 py-3 text-[#342F76] text-lg font-bold">Assignment Title</th>
                <th className="border-b border-[#9102C0] px-6 py-3 text-[#342F76] text-lg font-bold">Uploaded By</th>
                <th className="border-b border-[#9102C0] px-6 py-3 text-[#342F76] text-lg font-bold">Download</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id} className="hover:bg-[#f3e8ff]/60 transition">
                  <td className="px-6 py-4 text-[#342F76] font-medium">{a.title}</td>
                  <td className="px-6 py-4 text-[#9102C0]">{a.uploader}</td>
                  <td className="px-6 py-4 text-center">
                    <a href={a.file_url} target="_blank" rel="noopener noreferrer" className="bg-[#9102C0] hover:bg-[#342F76] text-white px-4 py-2 rounded-lg shadow transition font-semibold w-full block" style={{ maxWidth: 140, margin: '0 auto' }}>Download</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Assignments; 