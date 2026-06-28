import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative border border-gray-100 animate-scaleUp">
        <button 
          className="absolute top-4 right-4 text-gray-400 hover:text-[#9102C0] text-xl transition cursor-pointer" 
          onClick={onClose}
        >
          ✕
        </button>
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

  // Search and Pagination States
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchUserRole = async () => {
      setAuthLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('users').select('role, branch').eq('email', user.email).maybeSingle();
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
      const { data } = await supabase
        .from('materials')
        .select('class_code')
        .like('class_code', `${userBranch}%`);
      const uniqueSections = Array.from(new Set((data || []).map(m => m.class_code))).sort();
      setSections(uniqueSections);
      if (uniqueSections.length > 0 && !selectedSection) {
        setSelectedSection(uniqueSections[0]);
      }
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

  // Reset page index on search or section switch
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSection]);

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
    
    // Delete from database
    await supabase.from('materials').delete().eq('id', mat.id);
    await supabase.from('material_requests').delete().eq('file_url', mat?.file_url);

    // Invalidate leaderboard cache on the backend
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      await fetch(`${API_URL}/api/invalidate-leaderboard`, { method: 'POST' });
    } catch (err) {
      console.error('[Leaderboard Cache] Failed to invalidate cache:', err);
    }

    setMaterials((prev) => prev.filter((m) => m.id !== mat.id));
    setDeletingId(null);
    setShowSuccessModal(true);
    setModalMaterial(null);
  };

  if (authLoading) {
    return (
      <div className="py-12 flex justify-center items-center">
        <div className="w-8 h-8 border-3 border-[#9102C0] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (userRole !== 'admin' && userRole !== 'superadmin') {
    return <div className="py-12 text-center text-red-600 font-poppins font-semibold">Not authorized to view this page.</div>;
  }

  // Filter materials based on search query
  const filteredMaterials = materials.filter(m => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      m.title?.toLowerCase().includes(query) ||
      m.uploader?.toLowerCase().includes(query) ||
      m.subject_code?.toLowerCase().includes(query)
    );
  });

  // Pagination Calculations
  const totalPages = Math.ceil(filteredMaterials.length / itemsPerPage);
  const indexOfLastMaterial = currentPage * itemsPerPage;
  const indexOfFirstMaterial = indexOfLastMaterial - itemsPerPage;
  const currentMaterials = filteredMaterials.slice(indexOfFirstMaterial, indexOfLastMaterial);

  return (
    <div className="font-poppins text-[#342F76]">
      {sections.length === 0 ? (
        <div className="text-gray-400 py-6 text-center font-poppins">No published materials found for your department.</div>
      ) : (
        <>
          {/* Section Selector Pills */}
          <div className="mb-8 flex flex-wrap gap-3">
            {sections.map(section => (
              <button
                key={section}
                className={`px-5 py-2 rounded-full font-bold text-sm border transition duration-150 cursor-pointer ${
                  selectedSection === section 
                    ? 'bg-[#9102C0] text-white border-[#9102C0] shadow-sm' 
                    : 'bg-white text-gray-500 border-gray-200 hover:text-[#9102C0] hover:border-[#9102C0]/50'
                }`}
                onClick={() => setSelectedSection(section)}
              >
                {section}
              </button>
            ))}
          </div>

          {selectedSection && (
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="text-xl font-baumans text-[#342F76]">Section: {selectedSection}</h3>
                
                {/* Search Bar */}
                <div className="relative max-w-xs w-full">
                  <input
                    type="text"
                    placeholder="Search materials..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full font-poppins text-sm text-[#342F76] focus:outline-none focus:border-[#9102C0] focus:ring-1 focus:ring-[#9102C0]/20 transition bg-white"
                  />
                  <svg className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {loading ? (
                <div className="py-12 flex justify-center items-center">
                  <div className="w-6 h-6 border-2 border-[#9102C0] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : filteredMaterials.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 border border-dashed rounded-2xl text-gray-400 font-medium font-poppins">
                  No matching materials found.
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
                    <table className="min-w-full text-left text-sm font-poppins">
                      <thead className="bg-gray-50 border-b border-gray-100 text-[#342F76] font-semibold">
                        <tr>
                          <th className="py-3.5 px-4">Title</th>
                          <th className="py-3.5 px-4">Type</th>
                          <th className="py-3.5 px-4">Uploader</th>
                          <th className="py-3.5 px-4">Subject</th>
                          <th className="py-3.5 px-4">File</th>
                          <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {currentMaterials.map((mat) => (
                          <tr key={mat.id} className="hover:bg-[#f3e8ff]/20 transition">
                            <td className="py-3.5 px-4 font-semibold text-[#342F76]">{mat.title}</td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                                mat.type === 'note' ? 'bg-purple-100 text-purple-700' :
                                mat.type === 'paper' ? 'bg-blue-100 text-blue-700' :
                                'bg-amber-100 text-amber-700'
                              }`}>
                                {mat.type}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-gray-700 font-semibold">{mat.uploader}</td>
                            <td className="py-3.5 px-4 text-gray-500 font-mono">{mat.subject_code}</td>
                            <td className="py-3.5 px-4">
                              <a 
                                href={mat.file_url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="inline-flex items-center gap-1 bg-purple-50 text-[#9102C0] border border-purple-100 px-3 py-1 rounded-full text-xs font-bold hover:bg-[#9102C0] hover:text-white transition"
                              >
                                View File
                              </a>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                className="px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-600 hover:text-white transition disabled:opacity-40 cursor-pointer"
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

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-xs font-bold rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-[#342F76] disabled:opacity-40 transition cursor-pointer"
                      >
                        Previous
                      </button>
                      <span className="text-xs font-semibold text-gray-500 font-poppins">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-xs font-bold rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-[#342F76] disabled:opacity-40 transition cursor-pointer"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}

      {/* Confirmation Modal */}
      <Modal open={showConfirmModal} onClose={() => setShowConfirmModal(false)}>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#342F76] font-poppins">Confirm Deletion</h2>
          <p className="text-gray-500 text-sm font-poppins leading-relaxed">
            Are you sure you want to delete <span className="font-semibold text-rose-600">{modalMaterial?.title}</span>? This action cannot be undone and will delete the file from Google Drive.
          </p>
          <div className="flex gap-3 mt-4 w-full">
            <button 
              className="flex-1 px-5 py-2.5 rounded-full border border-gray-200 text-gray-500 font-bold text-sm hover:bg-gray-50 transition cursor-pointer" 
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </button>
            <button 
              className="flex-1 px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-sm transition cursor-pointer" 
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <Modal open={showSuccessModal} onClose={() => setShowSuccessModal(false)}>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-[#342F76] font-poppins">Material Deleted</h2>
          <p className="text-gray-500 text-sm font-poppins">The study material has been successfully deleted.</p>
          <button 
            className="w-full mt-4 px-5 py-2.5 rounded-full bg-[#9102C0] hover:bg-[#7c02a3] text-white font-bold text-sm shadow-sm transition cursor-pointer" 
            onClick={() => setShowSuccessModal(false)}
          >
            Done
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default MaterialDeletion;