import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const Dashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab] = useState('pending');

  useEffect(() => {
    const fetchUserRole = async () => {
      setAuthLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('users').select('role').eq('email', user.email).single();
        setUserRole(data?.role);
      }
      setAuthLoading(false);
    };
    fetchUserRole();
  }, []);

  useEffect(() => {
    if (!userRole) return;
    const fetchRequests = async () => {
      setLoading(true);
      let query = supabase.from('material_requests').select('*').order('created_at', { ascending: false });
      if (tab !== 'all') query = query.eq('status', tab);
      const { data } = await query;
      setRequests(data || []);
      setLoading(false);
    };
    fetchRequests();
  }, [userRole, tab]);

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    if (action === 'approve') {
      const { data: req } = await supabase.from('material_requests').select('*').eq('id', id).single();
      if (req) {
        await supabase.from('materials').insert([{
          class_code: req.class_code,
          subject_code: req.subject_code,
          type: req.type,
          title: req.title,
          file_url: req.file_url,
          uploader: req.uploader,
          creator: req.creator,
          created_at: req.created_at,
        }]);
        await supabase.from('material_requests').update({ status: 'approved', reviewed_by: userRole }).eq('id', id);
      }
    } else if (action === 'decline') {
      await supabase.from('material_requests').update({ status: 'declined', reviewed_by: userRole }).eq('id', id);
    }
    setRequests((prev) => prev.filter((r) => r.id !== id));
    setActionLoading(null);
  };

  if (authLoading) return <div className="max-w-5xl mx-auto py-12 px-4 text-lg text-[#342F76]">Checking authorization...</div>;
  if (userRole !== 'admin' && userRole !== 'superadmin') {
    return <div className="max-w-5xl mx-auto py-12 px-4 text-lg text-[#9102C0]">Not authorized to view this page.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-baumans text-[#9102C0] mb-8">Admin Review Queue</h1>
      <div className="flex gap-4 mb-6">
        <button onClick={() => setTab('pending')} className={`px-4 py-2 rounded-full font-bold border ${tab==='pending' ? 'bg-[#9102C0] text-white border-[#9102C0]' : 'bg-white text-[#9102C0] border-[#9102C0]'}`}>Pending</button>
        <button onClick={() => setTab('approved')} className={`px-4 py-2 rounded-full font-bold border ${tab==='approved' ? 'bg-[#9102C0] text-white border-[#9102C0]' : 'bg-white text-[#9102C0] border-[#9102C0]'}`}>Approved</button>
        <button onClick={() => setTab('declined')} className={`px-4 py-2 rounded-full font-bold border ${tab==='declined' ? 'bg-[#9102C0] text-white border-[#9102C0]' : 'bg-white text-[#9102C0] border-[#9102C0]'}`}>Declined</button>
      </div>
      {loading ? (
        <div className="text-lg text-[#342F76]">Loading...</div>
      ) : requests.length === 0 ? (
        <div className="text-[#342F76]">No {tab} material requests.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl shadow border border-[#ede9fe] bg-white">
          <table className="min-w-full text-left text-sm font-poppins">
            <thead className="bg-[#9102C0] text-white">
              <tr>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Uploader</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">File</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Reviewed By</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((req) => (
                <tr key={req.id} className="border-b hover:bg-[#f3e8ff]/40 transition">
                  <td className="py-2 px-4 font-semibold text-[#342F76]">{req.title}</td>
                  <td className="py-2 px-4 text-[#9102C0]">{req.type}</td>
                  <td className="py-2 px-4">{req.uploader}</td>
                  <td className="py-2 px-4">{req.class_code}</td>
                  <td className="py-2 px-4">{req.subject_code}</td>
                  <td className="py-2 px-4">
                    <a href={req.file_url} target="_blank" rel="noopener noreferrer" className="text-[#9102C0] underline font-semibold">View</a>
                  </td>
                  <td className="py-2 px-4 capitalize">{req.status}</td>
                  <td className="py-2 px-4">{req.reviewed_by || '-'}</td>
                  <td className="py-2 px-4 flex gap-2">
                    {tab === 'pending' && <>
                      <button
                        className="px-4 py-1 rounded-full bg-[#9102C0] text-white font-bold hover:bg-[#342F76] transition disabled:opacity-60"
                        disabled={actionLoading === req.id + 'approve'}
                        onClick={() => handleAction(req.id, 'approve')}
                      >
                        {actionLoading === req.id + 'approve' ? 'Approving...' : 'Approve'}
                      </button>
                      <button
                        className="px-4 py-1 rounded-full bg-[#f3e8ff] text-[#9102C0] font-bold border border-[#9102C0] hover:bg-[#9102C0] hover:text-white transition disabled:opacity-60"
                        disabled={actionLoading === req.id + 'decline'}
                        onClick={() => handleAction(req.id, 'decline')}
                      >
                        {actionLoading === req.id + 'decline' ? 'Declining...' : 'Decline'}
                      </button>
                    </>}
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

export default Dashboard; 