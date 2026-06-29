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
  const [customSubjectName, setCustomSubjectName] = useState('');
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [serverStarting, setServerStarting] = useState(false);

  useEffect(() => {
    // Ping backend to trigger spin-up
    const API_URL = import.meta.env.VITE_API_URL;
    fetch(`${API_URL}/health`).catch(() => {});
    // Fetch options as before
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
    const isCustom = selectedSubject === 'OTHER';
    if (!title || !selectedClass || !selectedSubject || (isCustom && !customSubjectName) || !name || !email || !file) {
      setError('Please fill in all required fields and select a file.');
      setLoading(false);
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be under 50MB.');
      setLoading(false);
      return;
    }
    setUploading(true);
    setServerStarting(false);
    let serverTimeout;
    try {
      // Show server starting message if upload takes >3s
      serverTimeout = setTimeout(() => setServerStarting(true), 3000);
      // Upload file and details to backend
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('class_code', selectedClass);
      formData.append('type', type);
      formData.append('subject_code', isCustom ? `CUST:${customSubjectName}` : selectedSubject);
      formData.append('uploader', name);
      formData.append('creator', email);

      // Use XMLHttpRequest for progress
      const API_URL = import.meta.env.VITE_API_URL;
      const xhr = new window.XMLHttpRequest();
      xhr.open('POST', `${API_URL}/api/submit-material-request`);
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };
      const uploadPromise = new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(xhr.responseText);
          } else {
            reject(xhr.responseText);
          }
        };
        xhr.onerror = () => reject(xhr.responseText);
      });
      xhr.send(formData);
      const responseText = await uploadPromise;
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        throw new Error('Invalid response from server.');
      }
      if (!xhr.status || xhr.status < 200 || xhr.status >= 300) {
        throw new Error(data.error || 'Failed to submit request to server.');
      }
      if (data.success) {
        setShowSuccessModal(true);
      } else {
        throw new Error(data.error || 'Failed to submit request.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      clearTimeout(serverTimeout);
      setUploading(false);
      setLoading(false);
      setUploadProgress(0);
      setServerStarting(false);
    }
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
          <select value={selectedSubject} onChange={e => { setSelectedSubject(e.target.value); setCustomSubjectName(''); }} className="border rounded-xl px-4 py-3 bg-[#f8f6ff] focus:ring-2 focus:ring-[#9102C0] outline-none transition" required disabled={!selectedClass}>
            <option value="">{selectedClass ? 'Select Subject' : 'Select Class First'}</option>
            {filteredSubjects.map(s => (
              <option key={s.subject_code} value={s.subject_code}>{s.subject_name} ({s.subject_code})</option>
            ))}
            {selectedClass && (
              <option value="OTHER">Other (Custom / Uncategorized Subject)</option>
            )}
          </select>
          {selectedSubject === 'OTHER' && (
            <div className="flex flex-col gap-2 mt-1 animate-fadeIn">
              <label className="font-semibold text-sm text-[#342F76]">Custom Subject Name*</label>
              <input
                type="text"
                value={customSubjectName}
                onChange={e => setCustomSubjectName(e.target.value)}
                placeholder="e.g., Git & GitHub, Linux Command Line"
                className="border rounded-xl px-4 py-3 bg-[#f8f6ff] focus:ring-2 focus:ring-[#9102C0] outline-none transition"
                required
              />
            </div>
          )}
          <label className="font-semibold">File*</label>
          <div className="relative flex items-center gap-3">
            <input
              id="material-file-input"
              name="file"
              type="file"
              accept="*"
              onChange={e => setFile(e.target.files[0])}
              className="hidden"
            />
            <label
              htmlFor="material-file-input"
              className="cursor-pointer px-6 py-2 rounded-full bg-gradient-to-r from-[#9102C0] via-[#E040FB] to-[#9102C0] text-white font-bold shadow-lg hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#9102C0]"
              tabIndex={0}
            >
              {file ? 'Change File' : 'Choose File'}
            </label>
            {file && (
              <span className="text-[#342F76] font-medium truncate max-w-[180px]" title={file.name}>{file.name}</span>
            )}
          </div>
          <label className="font-semibold">Your Name*</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="border rounded-xl px-4 py-3 bg-[#f8f6ff] focus:ring-2 focus:ring-[#9102C0] outline-none transition" required />
          <label className="font-semibold">Your Email*</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="border rounded-xl px-4 py-3 bg-[#f8f6ff] focus:ring-2 focus:ring-[#9102C0] outline-none transition" required />
          <button type="submit" className="cursor-pointer w-full py-3 rounded-xl bg-gradient-to-r from-[#9102C0] via-[#E040FB] to-[#9102C0] text-white font-bold text-lg mt-2 shadow-lg hover:scale-105 transition" disabled={loading || uploading}>{uploading ? 'Uploading...' : loading ? 'Submitting...' : 'Submit Request'}</button>
          {uploading && (
            <div className="flex flex-col items-center justify-center mt-4 gap-2">
              <span className="inline-block w-10 h-10 border-4 border-[#9102C0] border-t-transparent border-b-[#E040FB] rounded-full animate-spin"></span>
              {serverStarting && (
                <span className="text-[#9102C0] text-sm font-semibold mt-2 text-center">The server may be starting up. Please wait a few seconds...</span>
              )}
            </div>
          )}
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
                  setFile(null);
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