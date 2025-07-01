import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import MaterialCard from '../components/MaterialCard';

const ExtraMaterials = () => {
  const { classCode } = useParams();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMaterials = async () => {
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .eq('class_code', classCode)
        .eq('type', 'extra');
      if (!error && data) setMaterials(data);
      setLoading(false);
    };
    fetchMaterials();
  }, [classCode]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Extra Materials for {classCode}</h1>
      {loading ? (
        <div>Loading...</div>
      ) : materials.length === 0 ? (
        <div>No extra materials found.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {materials.map((mat) => (
            <MaterialCard key={mat.id} title={mat.title} uploader={mat.uploader} onDownload={() => window.open(mat.file_url, '_blank')} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ExtraMaterials; 