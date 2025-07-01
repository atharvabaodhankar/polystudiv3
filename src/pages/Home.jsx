import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Home = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      const { data, error } = await supabase.from('classes').select('*');
      if (!error) setClasses(data);
      setLoading(false);
    };
    fetchClasses();
  }, []);

  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold mb-4">PolyStudi Home</h1>
      <p className="mb-8">Welcome to PolyStudi — Academic Resource Hub</p>
      <h2 className="text-xl font-semibold mb-2">Browse Classes</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
          {classes.map((cls) => (
            <Link
              key={cls.code}
              to={`/class/${cls.code}`}
              className="block bg-white shadow rounded p-4 hover:bg-blue-50 border border-gray-200"
            >
              <div className="font-bold text-lg">{cls.name}</div>
              <div className="text-gray-600">{cls.code}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home; 