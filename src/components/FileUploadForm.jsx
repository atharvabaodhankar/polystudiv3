import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const FileUploadForm = () => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!title || !file) {
      setError('Please provide a title and select a file.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be under 50MB.');
      return;
    }
    setUploading(true);
    try {
      // Upload file to backend
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('http://localhost:3001/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to upload file to server.');
      }
      const data = await res.json();
      const fileUrl = data.webViewLink || data.webContentLink;
      if (!fileUrl) throw new Error('No public link returned from backend.');
      // Store in Supabase
      const { error: supaError } = await supabase.from('materials').insert({
        title,
        file_url: fileUrl,
        // Add other fields as needed
      });
      if (supaError) throw new Error('Failed to save file link to Supabase.');
      setSuccess('File uploaded and saved successfully!');
      setTitle('');
      setFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <form className="space-y-4 bg-gray-50 p-4 rounded shadow max-w-md mx-auto" onSubmit={handleSubmit}>
      <input
        className="w-full border p-2 rounded"
        type="text"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />
      <input
        className="w-full border p-2 rounded"
        type="file"
        accept="*"
        onChange={e => setFile(e.target.files[0])}
        required
      />
      <button
        className="w-full bg-green-600 text-white py-2 rounded"
        type="submit"
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>
      {error && <div className="text-red-600 text-center font-semibold">{error}</div>}
      {success && <div className="text-green-600 text-center font-semibold">{success}</div>}
    </form>
  );
};

export default FileUploadForm; 