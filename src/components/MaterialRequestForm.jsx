import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const MaterialRequestForm = ({ onClose }) => {
  const [type, setType] = useState('note');
  const [title, setTitle] = useState('');
  const [classCode, setClassCode] = useState('');
  const [subjectCode, setSubjectCode] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    if (!title || !classCode || !subjectCode || !name || !email) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }
    const { error: reqError } = await supabase.from('material_requests').insert({
      type,
      title,
      class_code: classCode,
      subject_code: subjectCode,
      file_url: fileUrl,
      uploader: name,
      creator: email,
      status: 'pending',
      // description is not in schema, but you can add it if you want
    });
    if (reqError) {
      setError('Failed to submit request. Please try again.');
    } else {
      setSuccess('Your request has been submitted for review!');
      setTitle(''); setClassCode(''); setSubjectCode(''); setFileUrl(''); setDescription(''); setName(''); setEmail('');
      setTimeout(() => { onClose(); }, 1500);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-2xl font-baumans text-[#9102C0] mb-2 text-center">Request to Share Material</h2>
      <label className="font-semibold">Material Type*</label>
      <select value={type} onChange={e => setType(e.target.value)} className="border rounded px-3 py-2">
        <option value="note">Notes</option>
        <option value="solved">Solved Paper</option>
        <option value="assignment">Assignment</option>
        <option value="extra">Extra Material</option>
        <option value="question_paper">Question Paper</option>
      </select>
      <label className="font-semibold">Title*</label>
      <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="border rounded px-3 py-2" required />
      <label className="font-semibold">Class*</label>
      <select value={classCode}  className="border rounded px-3 py-2 bg-gray-100 text-gray-500">
        {/* Add your class options here */}
      </select>
      <label className="font-semibold">Subject*</label>
      <input type="text" value={subjectCode} onChange={e => setSubjectCode(e.target.value)} className="border rounded px-3 py-2" required />
      <label className="font-semibold">File URL (optional)</label>
      <input type="text" value={fileUrl} onChange={e => setFileUrl(e.target.value)} className="border rounded px-3 py-2" />
      {/* <label className="font-semibold">Description (optional)</label>
      <textarea value={description} onChange={e => setDescription(e.target.value)} className="border rounded px-3 py-2" /> */}
      <label className="font-semibold">Your Name*</label>
      <input type="text" value={name} onChange={e => setName(e.target.value)} className="border rounded px-3 py-2" required />
      <label className="font-semibold">Your Email*</label>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="border rounded px-3 py-2" required />
      <button type="submit" className="w-full py-2 rounded-full bg-[#9102C0] text-white font-bold text-lg mt-2" disabled={loading}>{loading ? 'Submitting...' : 'Submit Request'}</button>
      {error && <div className="text-red-600 text-center font-semibold">{error}</div>}
      {success && <div className="text-green-600 text-center font-semibold">{success}</div>}
    </form>
  );
};

export default MaterialRequestForm; 