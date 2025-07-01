import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Assignments = () => {
  const { classCode } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Assignments for {classCode}</h1>
      {loading ? (
        <div>Loading...</div>
      ) : assignments.length === 0 ? (
        <div>No assignments found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">Assignment Title</th>
                <th className="border px-4 py-2">Uploaded By</th>
                <th className="border px-4 py-2">Download</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.id}>
                  <td className="border px-4 py-2">{a.title}</td>
                  <td className="border px-4 py-2">{a.uploader}</td>
                  <td className="border px-4 py-2">
                    <a href={a.file_url} target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-white px-3 py-1 rounded">Download</a>
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