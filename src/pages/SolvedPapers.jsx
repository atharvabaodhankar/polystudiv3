import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const SolvedPapers = () => {
  const { classCode } = useParams();
  const [solvedPapers, setSolvedPapers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSolvedPapers = async () => {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('class_code', classCode)
        .eq('type', 'solved');
      if (!error && data) {
        // Group by subject_code
        const grouped = {};
        data.forEach((item) => {
          if (!grouped[item.subject_code]) grouped[item.subject_code] = [];
          grouped[item.subject_code].push(item);
        });
        setSolvedPapers(grouped);
      }
      setLoading(false);
    };
    fetchSolvedPapers();
  }, [classCode]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Solved Papers for {classCode}</h1>
      {loading ? (
        <div>Loading...</div>
      ) : (
        Object.keys(solvedPapers).length === 0 ? (
          <div>No solved papers found.</div>
        ) : (
          Object.entries(solvedPapers).map(([subject, papers]) => (
            <div key={subject} className="mb-6">
              <h2 className="text-lg font-semibold mb-2">{subject}</h2>
              <ul className="space-y-2">
                {papers.map((paper) => (
                  <li key={paper.id} className="flex items-center justify-between bg-white p-3 rounded shadow">
                    <span>{paper.title}</span>
                    <a
                      href={paper.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )
      )}
    </div>
  );
};

export default SolvedPapers; 