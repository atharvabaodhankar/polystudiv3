import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const MaterialDeletion = () => {
  const [userRole, setUserRole] = useState(null);
  const [userBranch, setUserBranch] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      setAuthLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('users').select('role, branch').eq('email', user.email).single();
        setUserRole(data?.role);
        setUserBranch(data?.branch);
      }
      setAuthLoading(false);
    };
    fetchUserRole();
  }, []);

  useEffect(() => {
    if (!userRole || !userBranch) return;
    if (userRole !== 'admin' && userRole !== 'superadmin') return;
    const fetchMaterials = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('materials')
        .select('*')
        .like('class_code', `${userBranch}%`);
      setMaterials(data || []);
      setLoading(false);
    };
    fetchMaterials();
  }, [userRole, userBranch]);

  // Group materials by section (class_code)
  const grouped = materials.reduce((acc, mat) => {
    if (!acc[mat.class_code]) acc[mat.class_code] = [];
    acc[mat.class_code].push(mat);
    return acc;
  }, {});

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this material? This action cannot be undone.')) return;
    setDeletingId(id);
    // Delete from materials
    await supabase.from('materials').delete().eq('id', id);
    // Optionally: delete from material_requests as well
    await supabase.from('material_requests').delete().eq('file_url', materials.find(m => m.id === id)?.file_url);
    setMaterials((prev) => prev.filter((m) => m.id !== id));
    setDeletingId(null);
  };

  if (authLoading) return <div className="max-w-5xl mx-auto py-12 px-4 text-lg text-[#342F76]">Checking authorization...</div>;
  if (userRole !== 'admin' && userRole !== 'superadmin') {
    return <div className="max-w-5xl mx-auto py-12 px-4 text-lg text-[#9102C0]">Not authorized to view this page.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-baumans text-[#9102C0] mb-8">Delete Materials ({userBranch} Dept)</h1>
      {loading ? (
        <div className="text-lg text-[#342F76]">Loading materials...</div>
      ) : Object.keys(grouped).length === 0 ? (
        <div className="text-[#342F76]">No materials found for your department.</div>
      ) : (
        Object.entries(grouped).sort().map(([section, mats]) => (
          <div key={section} className="mb-12">
            <h2 className="text-2xl font-baumans text-[#342F76] mb-4">Section: {section}</h2>
            <div className="overflow-x-auto rounded-xl shadow border border-[#ede9fe] bg-white mb-6">
              <table className="min-w-full text-left text-sm font-poppins">
                <thead className="bg-[#9102C0] text-white">
                  <tr>
                    <th className="py-3 px-4">Title</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Uploader</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">File</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mats.map((mat) => (
                    <tr key={mat.id} className="border-b hover:bg-[#f3e8ff]/40 transition">
                      <td className="py-2 px-4 font-semibold text-[#342F76]">{mat.title}</td>
                      <td className="py-2 px-4 text-[#9102C0]">{mat.type}</td>
                      <td className="py-2 px-4">{mat.uploader}</td>
                      <td className="py-2 px-4">{mat.subject_code}</td>
                      <td className="py-2 px-4">
                        <a href={mat.file_url} target="_blank" rel="noopener noreferrer" className="text-[#9102C0] underline font-semibold">View</a>
                      </td>
                      <td className="py-2 px-4">
                        <button
                          className="px-4 py-1 rounded-full bg-red-600 text-white font-bold hover:bg-red-800 transition disabled:opacity-60"
                          disabled={deletingId === mat.id}
                          onClick={() => handleDelete(mat.id)}
                        >
                          {deletingId === mat.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MaterialDeletion; 