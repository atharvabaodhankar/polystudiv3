import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const MaterialRequest = () => {
  const { classCode } = useParams();
  const navigate = useNavigate();
  const [type, setType] = useState('note');
  const [title, setTitle] = useState('');
  const [selectedClass, setSelectedClass] = useState(classCode || '');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      setOptionsLoading(true);
      const { data: classData } = await supabase.from('classes').select('code, name');
      const { data: subjectData } = await supabase.from('subjects').select('subject_code, subject_name, class_code');
      setClasses(classData || []);
      setSubjects(subjectData || []);
      setOptionsLoading(false);
    };
    fetchOptions();
  }, []);

  // Filter subjects for selected class
  const filteredSubjects = subjects.filter(s => s.class_code === selectedClass);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    if (!title || !selectedClass || !selectedSubject || !name || !email) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }
    const { error: reqError } = await supabase.from('material_requests').insert({
      type,
      title,
      class_code: selectedClass,
      subject_code: selectedSubject,
      file_url: fileUrl,
      uploader: name,
      creator: email,
      status: 'pending',
    });
    if (reqError) {
      setError('Failed to submit request. Please try again.');
    } else {
      setShowSuccessModal(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#f8f6ff] via-[#f3e8ff] to-white px-4 py-12">
      <div className="w-full max-w-lg bg-white/90 border border-[#9102C0] rounded-2xl shadow-2xl p-10 flex flex-col gap-6">
        <button onClick={() => navigate(-1)} className="mb-2 px-4 py-2 rounded-full bg-[#342F76] text-white font-bold w-fit hover:bg-[#9102C0] transition">&larr; Go Back</button>
        <h2 className="text-3xl font-extrabold text-[#9102C0] mb-1 text-center">Request to Share Material</h2>
        <p className="text-center text-[#342F76] mb-2">Help your classmates by contributing useful study materials! Fill out the form below to submit your request.</p>
        {optionsLoading ? (
          <div className="text-center text-[#9102C0]">Loading options...</div>
        ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <label className="font-semibold">Material Type*</label>
          <select value={type} onChange={e => setType(e.target.value)} className="border rounded-xl px-4 py-3 bg-[#f8f6ff] focus:ring-2 focus:ring-[#9102C0] outline-none transition">
            <option value="note">Notes</option>
            <option value="solved">Solved Paper</option>
            <option value="assignment">Assignment</option>
            <option value="extra">Extra Material</option>
            <option value="question_paper">Question Paper</option>
          </select>
          {type === 'extra' && (
            <div className="bg-[#f3e8ff] border border-[#9102C0] text-[#342F76] rounded-lg px-4 py-3 mb-2 text-sm">
              <strong>Allowed under Extra Material:</strong> manuals, unit test answers, solved codes, theory questions, solved sums, formula sheets, cheat sheets, and similar resources.
            </div>
          )}
          <label className="font-semibold">Title*</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="border rounded-xl px-4 py-3 bg-[#f8f6ff] focus:ring-2 focus:ring-[#9102C0] outline-none transition" required />
          <label className="font-semibold">Class*</label>
          <select value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedSubject(''); }} className="border rounded-xl px-4 py-3 bg-[#f8f6ff] focus:ring-2 focus:ring-[#9102C0] outline-none transition" required>
            <option value="">Select Class</option>
            {classes.map(c => (
              <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
            ))}
          </select>
          <label className="font-semibold">Subject*</label>
          <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="border rounded-xl px-4 py-3 bg-[#f8f6ff] focus:ring-2 focus:ring-[#9102C0] outline-none transition" required disabled={!selectedClass}>
            <option value="">{selectedClass ? 'Select Subject' : 'Select Class First'}</option>
            {filteredSubjects.map(s => (
              <option key={s.subject_code} value={s.subject_code}>{s.subject_name} ({s.subject_code})</option>
            ))}
          </select>
          <label className="font-semibold">File URL*</label>
          <input type="text" value={fileUrl} onChange={e => setFileUrl(e.target.value)}  className="border rounded-xl px-4 py-3 bg-[#f8f6ff] focus:ring-2 focus:ring-[#9102C0] outline-none transition" required/>
          <label className="font-semibold">Your Name*</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="border rounded-xl px-4 py-3 bg-[#f8f6ff] focus:ring-2 focus:ring-[#9102C0] outline-none transition" required />
          <label className="font-semibold">Your Email*</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="border rounded-xl px-4 py-3 bg-[#f8f6ff] focus:ring-2 focus:ring-[#9102C0] outline-none transition" required />
          <button type="submit" className="cursor-pointer w-full py-3 rounded-xl bg-gradient-to-r from-[#9102C0] via-[#E040FB] to-[#9102C0] text-white font-bold text-lg mt-2 shadow-lg hover:scale-105 transition" disabled={loading}>{loading ? 'Submitting...' : 'Submit Request'}</button>
          {error && <div className="text-red-600 text-center font-semibold">{error}</div>}
          {success && <div className="text-green-600 text-center font-semibold">{success}</div>}
        </form>
        )}
      </div>
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full flex flex-col items-center gap-6 relative">
            <h2 className="text-2xl font-baumans text-[#9102C0] mb-2 text-center">Request Submitted!</h2>
            <p className="text-[#342F76] text-lg text-center">Your material request has been submitted. Would you like to request another, or go back to the class page?</p>
            <div className="flex gap-4 mt-4">
              <button
                className="px-6 py-2 rounded-lg bg-[#9102C0] text-white font-semibold hover:bg-[#342F76] transition"
                onClick={() => {
                  setShowSuccessModal(false);
                  setType('note');
                  setTitle('');
                  setSelectedClass(classCode || '');
                  setSelectedSubject('');
                  setFileUrl('');
                  setName('');
                  setEmail('');
                  setError('');
                  setSuccess('');
                }}
              >
                Request Another
              </button>
              <button
                className="px-6 py-2 rounded-lg bg-gray-200 text-[#9102C0] font-semibold hover:bg-[#f3e8ff] transition"
                onClick={() => navigate(`/class/${classCode}`)}
              >
                Go to Class Page
              </button>
            </div>
            <button className="absolute top-3 right-3 text-2xl text-[#9102C0] font-bold" onClick={() => setShowSuccessModal(false)}>&times;</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialRequest; 