import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import MaterialDeletion from './MaterialDeletion';

const Dashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [adminCandidates, setAdminCandidates] = useState([]);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [reviewers, setReviewers] = useState({});
  const [reviews, setReviews] = useState([]);
  const [userBranch, setUserBranch] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      setAuthLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        const { data } = await supabase.from('users').select('role, branch').eq('email', user.email).single();
        setUserRole(data?.role);
        setUserBranch(data?.branch);
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
      if (userRole === 'admin' && userBranch) {
        query = query.like('class_code', `${userBranch}%`);
      }
      const { data } = await query;
      setRequests(data || []);
      // Fetch reviewer names for all reviewed_by ids
      const reviewerIds = (data || []).map(r => r.reviewed_by).filter(Boolean);
      if (reviewerIds.length > 0) {
        const { data: reviewerUsers } = await supabase.from('users').select('id, full_name').in('id', reviewerIds);
        const reviewerMap = {};
        (reviewerUsers || []).forEach(u => { reviewerMap[u.id] = u.full_name; });
        setReviewers(reviewerMap);
      } else {
        setReviewers({});
      }
      // Fetch reviews for admin panel
      const fetchReviews = async () => {
        const { data } = await supabase.from('reviews').select('*').order('submitted_at', { ascending: false });
        setReviews(data || []);
      };
      fetchReviews();
      setLoading(false);
    };
    fetchRequests();
  }, [userRole, tab, userBranch]);

  useEffect(() => {
    if (userRole === 'superadmin') {
      setCandidateLoading(true);
      supabase.from('users').select('*').eq('role', 'admin_candidate').eq('approved', false).then(({ data }) => {
        setAdminCandidates(data || []);
        setCandidateLoading(false);
      });
    }
  }, [userRole]);

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
        const { error } = await supabase.from('material_requests').update({ status: 'approved', reviewed_by: userId }).eq('id', id);
        if (!error) {
          setRequests((prev) => prev.filter((r) => r.id !== id));
        }
      }
    } else if (action === 'decline') {
      // Get file_url before updating status
      const { data: req } = await supabase.from('material_requests').select('file_url').eq('id', id).single();
      if (req && req.file_url) {
        try {
          const API_URL = import.meta.env.VITE_API_URL;
          const res = await fetch(`${API_URL}/api/delete-drive-file`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ file_url: req.file_url }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || 'Failed to delete file from Google Drive.');
          }
        } catch (err) {
          setActionLoading(null);
          alert('Error deleting file from Google Drive: ' + err.message);
          return;
        }
      }
      const { error } = await supabase.from('material_requests').update({ status: 'declined', reviewed_by: userId }).eq('id', id);
      if (!error) {
        setRequests((prev) => prev.filter((r) => r.id !== id));
      }
    }
    setActionLoading(null);
  };

  const handleApproveAdmin = async (id) => {
    setCandidateLoading(true);
    await supabase.from('users').update({ role: 'admin', approved: true }).eq('id', id);
    setAdminCandidates((prev) => prev.filter((c) => c.id !== id));
    setCandidateLoading(false);
  };

  const handleRejectAdmin = async (id) => {
    setCandidateLoading(true);
    await supabase.from('users').delete().eq('id', id);
    setAdminCandidates((prev) => prev.filter((c) => c.id !== id));
    setCandidateLoading(false);
  };

  if (authLoading) return <div className="max-w-5xl mx-auto py-12 px-4 text-lg text-[#342F76]">Checking authorization...</div>;
  if (userRole !== 'admin' && userRole !== 'superadmin') {
    return <div className="max-w-5xl mx-auto py-12 px-4 text-lg text-[#9102C0]">Not authorized to view this page.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-baumans text-[#9102C0] mb-8">Admin Review Queue</h1>
      {userRole === 'superadmin' && (
        <div className="mb-10">
          <h2 className="text-2xl font-baumans text-[#342F76] mb-4">Admin Candidates</h2>
          {candidateLoading ? (
            <div className="text-lg text-[#342F76]">Loading...</div>
          ) : adminCandidates.length === 0 ? (
            <div className="text-[#342F76]">No admin candidates pending approval.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl shadow border border-[#ede9fe] bg-white mb-6">
              <table className="min-w-full text-left text-sm font-poppins">
                <thead className="bg-[#342F76] text-white">
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Branch</th>
                    <th className="py-3 px-4">Year</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminCandidates.map((c) => (
                    <tr key={c.id} className="border-b hover:bg-[#f3e8ff]/40 transition">
                      <td className="py-2 px-4 font-semibold text-[#342F76]">{c.full_name}</td>
                      <td className="py-2 px-4">{c.email}</td>
                      <td className="py-2 px-4">{c.branch}</td>
                      <td className="py-2 px-4">{c.year}</td>
                      <td className="py-2 px-4 flex gap-2">
                        <button className="px-4 py-1 rounded-full bg-[#9102C0] text-white font-bold hover:bg-[#342F76] transition disabled:opacity-60" onClick={() => handleApproveAdmin(c.id)} disabled={candidateLoading}>Approve</button>
                        <button className="px-4 py-1 rounded-full bg-[#f3e8ff] text-[#9102C0] font-bold border border-[#9102C0] hover:bg-[#9102C0] hover:text-white transition disabled:opacity-60" onClick={() => handleRejectAdmin(c.id)} disabled={candidateLoading}>Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
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
                  <td className="py-2 px-4">{req.reviewed_by ? (reviewers[req.reviewed_by] || req.reviewed_by) : '-'}</td>
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
      {(userRole === 'admin' || userRole === 'superadmin') && (
        <div className="mb-10 mt-12">
          <h2 className="text-3xl font-baumans text-[#9102C0] mb-8">Contact Form Submissions</h2>
          {reviews.length === 0 ? (
            <div className="text-[#342F76]">No reviews submitted yet.</div>
          ) : (
            <div className="overflow-x-auto rounded-xl shadow border border-[#ede9fe] bg-white mb-6">
              <table className="min-w-full text-left text-sm font-poppins">
                <thead className="bg-[#9102C0] text-white">
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Roll No</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Message</th>
                    <th className="py-3 px-4">Submitted At</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((r) => (
                    <tr key={r.id} className="border-b hover:bg-[#f3e8ff]/40 transition">
                      <td className="py-2 px-4 font-semibold text-[#342F76]">{r.name}</td>
                      <td className="py-2 px-4">{r.rollno}</td>
                      <td className="py-2 px-4">{r.email}</td>
                      <td className="py-2 px-4">{r.message}</td>
                      <td className="py-2 px-4">{r.submitted_at ? new Date(r.submitted_at).toLocaleString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      {/* Deletion Section for Admins */}
      <div className="mt-16">
        <h2 className="text-2xl font-baumans text-[#9102C0] mb-6">Delete Materials</h2>
        <MaterialDeletion />
      </div>
    </div>
  );
};

export default Dashboard; 