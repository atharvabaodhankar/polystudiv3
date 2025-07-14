import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full relative">
        <button className="absolute top-3 right-3 text-2xl text-[#9102C0] font-bold" onClick={onClose}>&times;</button>
        {children}
      </div>
    </div>
  );
};

const MaterialDeletion = () => {
  const [userRole, setUserRole] = useState(null);
  const [userBranch, setUserBranch] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [sections, setSections] = useState([]); // all available class_code
  const [selectedSection, setSelectedSection] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [modalMaterial, setModalMaterial] = useState(null);

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

  // Fetch all available sections for this department
  useEffect(() => {
    if (!userRole || !userBranch) return;
    if (userRole !== 'admin' && userRole !== 'superadmin') return;
    const fetchSections = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('materials')
        .select('class_code')
        .like('class_code', `${userBranch}%`);
      const uniqueSections = Array.from(new Set((data || []).map(m => m.class_code))).sort();
      setSections(uniqueSections);
      setLoading(false);
    };
    fetchSections();
  }, [userRole, userBranch]);

  // Fetch materials for the selected section
  useEffect(() => {
    if (!selectedSection) return;
    setLoading(true);
    supabase
      .from('materials')
      .select('*')
      .eq('class_code', selectedSection)
      .then(({ data }) => {
        setMaterials(data || []);
        setLoading(false);
      });
  }, [selectedSection]);

  const handleDeleteClick = (id) => {
    setModalMaterial(materials.find(m => m.id === id));
    setShowConfirmModal(true);
  };

  const handleDelete = async () => {
    const mat = modalMaterial;
    setDeletingId(mat.id);
    setShowConfirmModal(false);
    // Delete from Google Drive first
    if (mat && mat.file_url) {
      try {
        const API_URL = import.meta.env.VITE_API_URL;
        const res = await fetch(`${API_URL}/api/delete-drive-file`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ file_url: mat.file_url }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to delete file from Google Drive.');
        }
      } catch (err) {
        alert('Error deleting file from Google Drive: ' + err.message);
      }
    }
    // Delete from materials
    await supabase.from('materials').delete().eq('id', mat.id);
    // Optionally: delete from material_requests as well
    await supabase.from('material_requests').delete().eq('file_url', mat?.file_url);
    setMaterials((prev) => prev.filter((m) => m.id !== mat.id));
    setDeletingId(null);
    setShowSuccessModal(true);
    setModalMaterial(null);
  };

  if (authLoading) return <div className="max-w-5xl mx-auto py-12 px-4 text-lg text-[#342F76]">Checking authorization...</div>;
  if (userRole !== 'admin' && userRole !== 'superadmin') {
    return <div className="max-w-5xl mx-auto py-12 px-4 text-lg text-[#9102C0]">Not authorized to view this page.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-baumans text-[#9102C0] mb-8">Delete Materials ({userBranch} Dept)</h1>
      {loading ? (
        <div className="text-lg text-[#342F76]">Loading...</div>
      ) : sections.length === 0 ? (
        <div className="text-[#342F76]">No sections found for your department.</div>
      ) : (
        <>
          <div className="mb-8 flex flex-wrap gap-4">
            {sections.map(section => (
              <button
                key={section}
                className={`px-6 py-2 rounded-full font-bold border ${selectedSection === section ? 'bg-[#9102C0] text-white border-[#9102C0]' : 'bg-white text-[#9102C0] border-[#9102C0]'} transition`}
                onClick={() => setSelectedSection(section)}
              >
                {section}
              </button>
            ))}
          </div>
          {selectedSection && (
            <div className="mb-12">
              <h2 className="text-2xl font-baumans text-[#342F76] mb-4">Section: {selectedSection}</h2>
              {loading ? (
                <div className="text-lg text-[#342F76]">Loading materials...</div>
              ) : materials.length === 0 ? (
                <div className="text-[#342F76]">No materials found for this section.</div>
              ) : (
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
                      {materials.map((mat) => (
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
                              onClick={() => handleDeleteClick(mat.id)}
                            >
                              {deletingId === mat.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
      {/* Confirmation Modal */}
      <Modal open={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
        <h2 className="text-2xl font-bold text-[#9102C0] mb-4">Confirm Deletion</h2>
        <p className="mb-6 text-[#342F76]">Are you sure you want to delete <span className="font-bold">{modalMaterial?.title}</span>? This action cannot be undone.</p>
        <div className="flex gap-4 justify-end">
          <button className="px-6 py-2 rounded-full bg-gray-200 text-[#342F76] font-bold" onClick={() => setShowConfirmModal(false)}>Cancel</button>
          <button className="px-6 py-2 rounded-full bg-red-600 text-white font-bold" onClick={handleDelete}>Delete</button>
        </div>
      </Modal>
      {/* Success Modal */}
      <Modal open={showSuccessModal} onClose={() => setShowSuccessModal(false)}>
        <h2 className="text-2xl font-bold text-green-600 mb-4">Material Deleted</h2>
        <p className="mb-6 text-[#342F76]">The material has been successfully deleted.</p>
        <div className="flex justify-end">
          <button className="px-6 py-2 rounded-full bg-[#9102C0] text-white font-bold" onClick={() => setShowSuccessModal(false)}>OK</button>
        </div>
      </Modal>
    </div>
  );
};

export default MaterialDeletion; 