import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import MaterialDeletion from './MaterialDeletion';

const Dashboard = () => {
  const [allRequests, setAllRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [tab, setTab] = useState('pending');
  const [adminCandidates, setAdminCandidates] = useState([]);
  const [candidateLoading, setCandidateLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userFullName, setUserFullName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userBranch, setUserBranch] = useState(null);
  const [reviewers, setReviewers] = useState({});
  const [reviews, setReviews] = useState([]);

  // Active SaaS View & Mobile Sidebar toggles
  const [activeView, setActiveView] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [candidateSearchQuery, setCandidateSearchQuery] = useState('');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewCurrentPage, setReviewCurrentPage] = useState(1);
  const [candidateCurrentPage, setCandidateCurrentPage] = useState(1);

  const itemsPerPage = 10;
  const reviewItemsPerPage = 5;
  const candidateItemsPerPage = 5;

  useEffect(() => {
    const fetchUserRole = async () => {
      setAuthLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        setUserEmail(user.email);
        const { data: userRow } = await supabase
          .from('users')
          .select('full_name, role, branch')
          .eq('email', user.email)
          .maybeSingle();

        // Check if registration details exist in localStorage (meaning they just signed up via Google)
        const storedBranch = localStorage.getItem('admin_signup_branch');
        const storedYear = localStorage.getItem('admin_signup_year');
        const storedName = localStorage.getItem('admin_signup_name') || user.user_metadata?.full_name || 'Admin';

        if (storedBranch) {
          try {
            const API_URL = import.meta.env.VITE_API_URL;
            const res = await fetch(`${API_URL}/api/register-admin-candidate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                id: user.id,
                email: user.email,
                fullName: storedName,
                branch: storedBranch,
                year: storedYear || 'N/A'
              })
            });
            if (!res.ok) {
              const resData = await res.json().catch(() => ({}));
              throw new Error(resData.error || 'Failed to complete Google registration.');
            }
            setUserFullName(storedName);
            setUserRole('admin_candidate');
            setUserBranch(storedBranch);
          } catch (regErr) {
            console.error('Error during Google admin candidate registration:', regErr);
            setUserRole(null);
            setUserBranch(null);
          } finally {
            localStorage.removeItem('admin_signup_name');
            localStorage.removeItem('admin_signup_branch');
            localStorage.removeItem('admin_signup_year');
          }
        } else {
          // If no stored registration details, proceed with checking the fetched userRow
          if (!userRow) {
            setUserFullName(user.user_metadata?.full_name || 'Admin');
            setUserRole(null);
            setUserBranch(null);
          } else {
            setUserFullName(userRow.full_name || 'Admin');
            setUserRole(userRow.role);
            setUserBranch(userRow.branch);
          }
        }
      }
      setAuthLoading(false);
    };
    fetchUserRole();
  }, []);

  useEffect(() => {
    if (!userRole) return;
    const fetchRequestsAndReviews = async () => {
      setLoading(true);
      try {
        // Fetch all material requests for branch matching
        let query = supabase.from('material_requests').select('*').order('created_at', { ascending: false });
        if (userRole === 'admin' && userBranch) {
          query = query.like('class_code', `${userBranch}%`);
        }
        const { data } = await query;
        setAllRequests(data || []);

        // Fetch reviewer mapping
        const reviewerIds = (data || []).map(r => r.reviewed_by).filter(Boolean);
        if (reviewerIds.length > 0) {
          const { data: reviewerUsers } = await supabase.from('users').select('id, full_name').in('id', reviewerIds);
          const reviewerMap = {};
          (reviewerUsers || []).forEach(u => { reviewerMap[u.id] = u.full_name; });
          setReviewers(reviewerMap);
        } else {
          setReviewers({});
        }

        // Fetch reviews
        const { data: revData } = await supabase.from('reviews').select('*').order('submitted_at', { ascending: false });
        setReviews(revData || []);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequestsAndReviews();
  }, [userRole, userBranch]);

  useEffect(() => {
    if (userRole === 'superadmin') {
      setCandidateLoading(true);
      supabase.from('users').select('*').eq('role', 'admin_candidate').eq('approved', false).then(({ data }) => {
        setAdminCandidates(data || []);
        setCandidateLoading(false);
      });
    }
  }, [userRole]);

  // Reset page number when search query or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, tab]);

  useEffect(() => {
    setReviewCurrentPage(1);
  }, [reviewSearchQuery]);

  useEffect(() => {
    setCandidateCurrentPage(1);
  }, [candidateSearchQuery]);

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API_URL}/api/review-material-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, userId })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to review material request.');
      }
      
      setAllRequests(prev => 
        prev.map(r => r.id === id ? { ...r, status: action === 'approve' ? 'approved' : 'declined', reviewed_by: userId } : r)
      );
    } catch (err) {
      alert('Error reviewing request: ' + err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveAdmin = async (id) => {
    setCandidateLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API_URL}/api/approve-admin-candidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!res.ok) {
        const resData = await res.json().catch(() => ({}));
        throw new Error(resData.error || 'Failed to approve candidate.');
      }
      setAdminCandidates((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert('Error approving candidate: ' + err.message);
    } finally {
      setCandidateLoading(false);
    }
  };

  const handleRejectAdmin = async (id) => {
    setCandidateLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      const res = await fetch(`${API_URL}/api/reject-admin-candidate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!res.ok) {
        const resData = await res.json().catch(() => ({}));
        throw new Error(resData.error || 'Failed to reject candidate.');
      }
      setAdminCandidates((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert('Error rejecting candidate: ' + err.message);
    } finally {
      setCandidateLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-[#9102C0] border-t-transparent rounded-full animate-spin"></div>
        <div className="text-[#342F76] font-semibold text-lg font-poppins">Verifying credentials...</div>
      </div>
    );
  }

  if (userRole === 'admin_candidate') {
    return (
      <div className="max-w-xl mx-auto py-24 px-6 text-center">
        <div className="bg-white border border-[#9102C0]/20 rounded-2xl shadow-xl p-10 flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-[#f3e8ff] flex items-center justify-center text-[#9102C0] text-3xl">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-baumans text-[#9102C0]">Registration Pending</h1>
          <p className="text-[#342F76] text-lg font-poppins leading-relaxed">
            Hi <strong>{userFullName}</strong>, your request for admin access has been successfully submitted.
          </p>
          <div className="w-full h-px bg-[#ede9fe]"></div>
          <p className="text-sm text-gray-500 font-poppins">
            A superadmin is reviewing your account. Once approved, you will have access to the dashboard. Feel free to refresh this page.
          </p>
        </div>
      </div>
    );
  }

  if (userRole !== 'admin' && userRole !== 'superadmin') {
    return (
      <div className="max-w-md mx-auto py-24 px-6 text-center">
        <div className="bg-white border border-red-200 rounded-2xl shadow-lg p-10 flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 text-3xl">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-red-600 font-poppins">Access Denied</h1>
          <p className="text-gray-600 font-poppins">You do not have administrative privileges to view this page.</p>
        </div>
      </div>
    );
  }

  // Filter requests based on tab & search query
  const tabRequests = allRequests.filter(r => tab === 'all' ? true : r.status === tab);
  const filteredRequests = tabRequests.filter(r => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      r.title?.toLowerCase().includes(query) ||
      r.uploader?.toLowerCase().includes(query) ||
      r.email?.toLowerCase().includes(query) ||
      r.subject_code?.toLowerCase().includes(query) ||
      r.class_code?.toLowerCase().includes(query)
    );
  });

  // Filter reviews based on search query
  const filteredReviews = reviews.filter(r => {
    const query = reviewSearchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      r.name?.toLowerCase().includes(query) ||
      r.email?.toLowerCase().includes(query) ||
      r.rollno?.toLowerCase().includes(query) ||
      r.message?.toLowerCase().includes(query)
    );
  });

  // Filter admin candidates based on search query
  const filteredCandidates = adminCandidates.filter(c => {
    const query = candidateSearchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      c.full_name?.toLowerCase().includes(query) ||
      c.email?.toLowerCase().includes(query) ||
      c.branch?.toLowerCase().includes(query)
    );
  });

  // Statistics counts
  const pendingCount = allRequests.filter(r => r.status === 'pending').length;
  const approvedCount = allRequests.filter(r => r.status === 'approved').length;
  const reviewsCount = reviews.length;
  const candidatesCount = adminCandidates.length;

  // Pagination Calculations
  const totalRequestPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const indexOfLastRequest = currentPage * itemsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - itemsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);

  const totalReviewPages = Math.ceil(filteredReviews.length / reviewItemsPerPage);
  const indexOfLastReview = reviewCurrentPage * reviewItemsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewItemsPerPage;
  const currentReviews = filteredReviews.slice(indexOfFirstReview, indexOfLastReview);

  const totalCandidatePages = Math.ceil(filteredCandidates.length / candidateItemsPerPage);
  const indexOfLastCandidate = candidateCurrentPage * candidateItemsPerPage;
  const indexOfFirstCandidate = indexOfLastCandidate - candidateItemsPerPage;
  const currentCandidates = filteredCandidates.slice(indexOfFirstCandidate, indexOfLastCandidate);

  // Pagination Render Helper
  const renderPagination = (currentPage, totalPages, setCurrentPage) => {
    if (totalPages <= 1) return null;
    return (
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
    );
  };

  // Initials generator for user avatar
  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Modular SaaS View Renderers
  const renderOverview = () => {
    return (
      <div className="space-y-8 animate-fadeIn">
        {/* 1. Welcome Greeting Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#9102C0] via-[#7c02a3] to-[#342F76] text-white p-8 md:p-10 shadow-xl">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute left-1/3 bottom-0 translate-y-1/2 w-48 h-48 bg-[#9102C0]/20 rounded-full blur-xl"></div>
          
          <div className="relative z-10">
            <h1 className="text-3xl md:text-4xl font-baumans mb-3 flex items-center gap-3">
              Welcome back, {userFullName}!
            </h1>
            <p className="text-purple-100 mb-6 font-medium font-poppins">
              Manage study materials, approve new admins, and check student feedback in one place.
            </p>
            
            <div className="flex flex-wrap gap-3">
              <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-semibold border border-white/20 capitalize shadow-inner">
                Role: {userRole}
              </span>
              <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-semibold border border-white/20 shadow-inner">
                Branch: {userRole === 'superadmin' ? 'All Departments' : userBranch}
              </span>
              <span className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-semibold border border-white/20 shadow-inner">
                Email: {userEmail}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Overview Stats Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-[#ede9fe] rounded-2xl shadow-sm hover:shadow-md transition p-6 flex items-center gap-4 cursor-pointer" onClick={() => setActiveView('materials')}>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Pending Tasks</div>
              <div className="text-2xl font-bold text-[#342F76] font-baumans">{pendingCount}</div>
            </div>
          </div>

          <div className="bg-white border border-[#ede9fe] rounded-2xl shadow-sm hover:shadow-md transition p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Approved Materials</div>
              <div className="text-2xl font-bold text-[#342F76] font-baumans">{approvedCount}</div>
            </div>
          </div>

          <div className="bg-white border border-[#ede9fe] rounded-2xl shadow-sm hover:shadow-md transition p-6 flex items-center gap-4 cursor-pointer" onClick={() => setActiveView('feedback')}>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <div className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Student Reviews</div>
              <div className="text-2xl font-bold text-[#342F76] font-baumans">{reviewsCount}</div>
            </div>
          </div>

          {userRole === 'superadmin' && (
            <div className="bg-white border border-[#ede9fe] rounded-2xl shadow-sm hover:shadow-md transition p-6 flex items-center gap-4 cursor-pointer" onClick={() => setActiveView('candidates')}>
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <div className="text-gray-400 text-sm font-semibold uppercase tracking-wider">Pending Admins</div>
                <div className="text-2xl font-bold text-[#342F76] font-baumans">{candidatesCount}</div>
              </div>
            </div>
          )}
        </div>

        {/* 3. SaaS Quick Info Board */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white border border-[#ede9fe] rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[#342F76] font-poppins mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#9102C0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Administrative Actions Checklist
            </h3>
            <ul className="space-y-3.5 text-sm font-poppins text-gray-500">
              <li className="flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full ${pendingCount > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                <span>{pendingCount > 0 ? `You have ${pendingCount} pending study material submissions awaiting your review.` : 'All material submissions are fully reviewed!'}</span>
              </li>
              {userRole === 'superadmin' && (
                <li className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${candidatesCount > 0 ? 'bg-purple-500 animate-pulse' : 'bg-emerald-500'}`}></span>
                  <span>{candidatesCount > 0 ? `There are ${candidatesCount} new admin requests waiting for authorization.` : 'No pending admin candidates in the queue.'}</span>
                </li>
              )}
              <li className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>Study materials are automatically synced to Google Drive in real-time.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white border border-[#ede9fe] rounded-3xl p-6 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#342F76] font-poppins mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#9102C0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                System Status Overview
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed font-poppins mb-6">
                Connected to Supabase Project: <code className="text-xs bg-gray-50 px-1.5 py-0.5 rounded font-mono">fgzwodftkglvngkmkwnv</code>. All integrations, including Google Drive upload and PlugMail notifications, are operational.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setActiveView('materials')} className="flex-1 py-2.5 px-4 rounded-xl text-center bg-[#9102C0] text-white font-bold text-sm hover:opacity-90 transition duration-150 cursor-pointer">
                View Queue
              </button>
              <button onClick={() => setActiveView('deletion')} className="flex-1 py-2.5 px-4 rounded-xl text-center border border-gray-200 bg-white hover:bg-gray-50 text-[#342F76] font-bold text-sm transition duration-150 cursor-pointer">
                Manage Files
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCandidates = () => {
    if (userRole !== 'superadmin') return <div className="text-center py-12 text-gray-400 font-poppins">Access Denied.</div>;
    return (
      <div className="bg-white border border-[#ede9fe] rounded-3xl shadow-sm p-6 md:p-8 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-baumans text-[#9102C0] mb-2">New Admin Candidates</h2>
            <p className="text-gray-500 text-sm font-poppins">Authorize or decline administrative access requests from new candidates.</p>
          </div>
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Search candidates..."
              value={candidateSearchQuery}
              onChange={(e) => setCandidateSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full font-poppins text-sm text-[#342F76] focus:outline-none focus:border-[#9102C0] focus:ring-1 focus:ring-[#9102C0]/20 transition bg-white"
            />
            <svg className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {filteredCandidates.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 border border-dashed rounded-2xl text-gray-400 font-medium font-poppins">
            No matching admin candidates found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white">
              <table className="min-w-full text-left text-sm font-poppins">
                <thead className="bg-gray-50 border-b border-gray-100 text-[#342F76] font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Name</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">Branch</th>
                    <th className="py-3.5 px-4">Year</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentCandidates.map((c) => (
                    <tr key={c.id} className="hover:bg-[#f3e8ff]/20 transition">
                      <td className="py-3 px-4 font-semibold text-[#342F76]">{c.full_name}</td>
                      <td className="py-3 px-4 text-gray-500">{c.email}</td>
                      <td className="py-3 px-4">
                        <span className="bg-purple-100 text-purple-700 px-2.5 py-0.5 rounded-full text-xs font-bold">
                          {c.branch || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-500">{c.year || 'N/A'}</td>
                      <td className="py-3 px-4 text-right flex justify-end gap-2">
                        <button 
                          className="px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-600 hover:text-white transition disabled:opacity-60 cursor-pointer" 
                          onClick={() => handleApproveAdmin(c.id)} 
                          disabled={candidateLoading}
                        >
                          Approve
                        </button>
                        <button 
                          className="px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-600 hover:text-white transition disabled:opacity-60 cursor-pointer" 
                          onClick={() => handleRejectAdmin(c.id)} 
                          disabled={candidateLoading}
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renderPagination(candidateCurrentPage, totalCandidatePages, setCandidateCurrentPage)}
          </>
        )}
      </div>
    );
  };

  const renderMaterials = () => {
    return (
      <div className="bg-white border border-[#ede9fe] rounded-3xl shadow-sm p-6 md:p-8 animate-fadeIn">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-baumans text-[#9102C0] mb-2">Material Submission Queue</h2>
            <p className="text-gray-500 text-sm font-poppins font-medium">Verify pending student uploads before publishing them live.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative max-w-xs w-full">
              <input
                type="text"
                placeholder="Search queue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full font-poppins text-sm text-[#342F76] focus:outline-none focus:border-[#9102C0] focus:ring-1 focus:ring-[#9102C0]/20 transition bg-white"
              />
              <svg className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <div className="flex bg-gray-50 border border-gray-100 rounded-full p-1 self-start md:self-auto">
              {['pending', 'approved', 'declined'].map((t) => (
                <button 
                  key={t}
                  onClick={() => setTab(t)} 
                  className={`px-5 py-2 rounded-full font-semibold text-sm capitalize transition cursor-pointer ${tab === t ? 'bg-[#9102C0] text-white shadow-sm' : 'text-gray-500 hover:text-[#9102C0]'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center items-center">
            <div className="w-8 h-8 border-3 border-[#9102C0] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 border border-dashed rounded-2xl text-gray-400 font-medium font-poppins">
            No matching {tab} material requests found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="min-w-full text-left text-sm font-poppins">
                <thead className="bg-gray-50 border-b border-gray-100 text-[#342F76] font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Title</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Contributor</th>
                    <th className="py-3.5 px-4">Class</th>
                    <th className="py-3.5 px-4">Subject</th>
                    <th className="py-3.5 px-4">File</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Reviewed By</th>
                    {tab === 'pending' && <th className="py-3.5 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-[#f3e8ff]/20 transition">
                      <td className="py-3.5 px-4 font-semibold text-[#342F76]">{req.title}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                          req.type === 'note' ? 'bg-purple-100 text-purple-700' :
                          req.type === 'paper' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {req.type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-700">{req.uploader}</div>
                        <div className="text-xs text-gray-400">{req.email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 font-semibold">{req.class_code}</td>
                      <td className="py-3.5 px-4 text-gray-500">{req.subject_code}</td>
                      <td className="py-3.5 px-4">
                        <a 
                          href={req.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-1 bg-purple-50 text-[#9102C0] border border-purple-100 px-3 py-1 rounded-full text-xs font-bold hover:bg-[#9102C0] hover:text-white transition cursor-pointer"
                        >
                          View File
                        </a>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                          req.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                          req.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            req.status === 'pending' ? 'bg-amber-500' :
                            req.status === 'approved' ? 'bg-emerald-500' :
                            'bg-rose-500'
                          }`}></span>
                          {req.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-400 text-xs">
                        {req.reviewed_by ? (reviewers[req.reviewed_by] || 'Another Admin') : '-'}
                      </td>
                      {tab === 'pending' && (
                        <td className="py-3.5 px-4 text-right flex justify-end gap-2">
                          <button
                            className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold hover:bg-emerald-600 hover:text-white transition disabled:opacity-60 cursor-pointer"
                            disabled={actionLoading === req.id + 'approve'}
                            onClick={() => handleAction(req.id, 'approve')}
                          >
                            {actionLoading === req.id + 'approve' ? 'Approving...' : 'Approve'}
                          </button>
                          <button
                            className="px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold hover:bg-rose-600 hover:text-white transition disabled:opacity-60 cursor-pointer"
                            disabled={actionLoading === req.id + 'decline'}
                            onClick={() => handleAction(req.id, 'decline')}
                          >
                            {actionLoading === req.id + 'decline' ? 'Declining...' : 'Decline'}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renderPagination(currentPage, totalRequestPages, setCurrentPage)}
          </>
        )}
      </div>
    );
  };

  const renderFeedback = () => {
    return (
      <div className="bg-white border border-[#ede9fe] rounded-3xl shadow-sm p-6 md:p-8 animate-fadeIn">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-baumans text-[#9102C0] mb-2">Student Feedback & Reviews</h2>
            <p className="text-gray-500 text-sm font-poppins">Read student-submitted feedback and bug reports.</p>
          </div>

          <div className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Search feedback..."
              value={reviewSearchQuery}
              onChange={(e) => setReviewSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full font-poppins text-sm text-[#342F76] focus:outline-none focus:border-[#9102C0] focus:ring-1 focus:ring-[#9102C0]/20 transition bg-white"
            />
            <svg className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {filteredReviews.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 border border-dashed rounded-2xl text-gray-400 font-medium font-poppins">
            No matching feedback submissions found.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-2xl border border-gray-100">
              <table className="min-w-full text-left text-sm font-poppins">
                <thead className="bg-gray-50 border-b border-gray-100 text-[#342F76] font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Student</th>
                    <th className="py-3.5 px-4">Roll No</th>
                    <th className="py-3.5 px-4">Message</th>
                    <th className="py-3.5 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {currentReviews.map((r) => (
                    <tr key={r.id} className="hover:bg-[#f3e8ff]/20 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-gray-700">{r.name}</div>
                        <div className="text-xs text-gray-400">{r.email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 font-mono">{r.rollno}</td>
                      <td className="py-3.5 px-4 text-gray-600 max-w-xs truncate hover:text-clip hover:whitespace-normal transition duration-200">
                        {r.message}
                      </td>
                      <td className="py-3.5 px-4 text-gray-400 text-xs">
                        {r.submitted_at ? new Date(r.submitted_at).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renderPagination(reviewCurrentPage, totalReviewPages, setReviewCurrentPage)}
          </>
        )}
      </div>
    );
  };

  const renderDeletion = () => {
    return (
      <div className="bg-white border border-[#ede9fe] rounded-3xl shadow-sm p-6 md:p-8 animate-fadeIn">
        <h2 className="text-2xl font-baumans text-[#9102C0] mb-2">Material Management (Deletion)</h2>
        <p className="text-gray-500 text-sm mb-6 font-poppins">
          Instantly delete approved study materials from the live site database. This will also clean up matching Google Drive files.
        </p>
        <div className="border-t border-gray-100 pt-6">
          <MaterialDeletion />
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-[#f8f6ff] text-[#342F76] font-poppins">
      
      {/* LEFT SIDEBAR (Mobile backdrop drawer) */}
      <div className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
      </div>

      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#1e1a47] text-white flex flex-col transform lg:translate-x-0 transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:static lg:h-screen lg:flex-shrink-0 border-r border-[#342F76]/20 shadow-xl`}>
        {/* Branding header */}
        <div className="p-6 border-b border-[#342F76]/40 flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#9102C0] to-[#ac01e6] flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="text-xl font-baumans tracking-wide text-white bg-clip-text">PolyStudi Workspace</span>
        </div>

        {/* User profile quick info card */}
        <div className="p-6 border-b border-[#342F76]/40 bg-[#171339]">
          <div className="flex items-center gap-3.5 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#9102C0] flex items-center justify-center font-bold text-sm text-white shadow-inner font-baumans">
              {getInitials(userFullName)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold truncate text-white">{userFullName}</div>
              <div className="text-xs text-purple-200/60 truncate">{userEmail}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-[#c88eff] text-[10px] font-bold uppercase tracking-wider border border-[#9102C0]/30">{userRole}</span>
            {userRole !== 'superadmin' && (
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-[#8ec8ff] text-[10px] font-bold uppercase tracking-wider border border-blue-500/30">{userBranch}</span>
            )}
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {[
            { id: 'overview', name: 'Overview', icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            )},
            { id: 'materials', name: 'Material Queue', icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            )},
            { id: 'feedback', name: 'Student Feedback', icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            )},
            { id: 'deletion', name: 'Material Deletion', icon: (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-5v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )},
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                activeView === item.id 
                  ? 'bg-[#9102C0] text-white shadow-md' 
                  : 'text-purple-200/70 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              {item.name}
            </button>
          ))}

          {/* Superadmin only admin candidate link */}
          {userRole === 'superadmin' && (
            <button
              onClick={() => {
                setActiveView('candidates');
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                activeView === 'candidates' 
                  ? 'bg-[#9102C0] text-white shadow-md' 
                  : 'text-purple-200/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Admin Candidates
            </button>
          )}
        </nav>

        {/* Sidebar Footer logout */}
        <div className="p-4 border-t border-[#342F76]/40">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2.5 py-3 px-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 font-bold text-sm hover:bg-red-600 hover:text-white transition duration-150 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out Workspace
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen">
        {/* Sticky Top Header bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200/50 px-6 py-4.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3.5">
            {/* Mobile Hamburger menu toggle */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 cursor-pointer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-[#342F76] font-baumans capitalize">
              {activeView === 'overview' ? 'Dashboard Overview' : 
               activeView === 'materials' ? 'Material submission queue' :
               activeView === 'feedback' ? 'Student Reviews & Feedback' :
               activeView === 'deletion' ? 'Delete live materials' :
               'Admin candidates approvals'}
            </h2>
          </div>

          <div className="text-xs font-semibold text-gray-400 font-poppins hidden sm:block">
            {new Date().toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
          </div>
        </header>

        {/* Scrollable Container Content */}
        <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto">
          {activeView === 'overview' && renderOverview()}
          {activeView === 'materials' && renderMaterials()}
          {activeView === 'feedback' && renderFeedback()}
          {activeView === 'deletion' && renderDeletion()}
          {activeView === 'candidates' && renderCandidates()}
        </main>
      </div>

    </div>
  );
};

export default Dashboard;