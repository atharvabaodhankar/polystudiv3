import React from 'react';

const FileUploadForm = () => (
  <form className="space-y-4 bg-gray-50 p-4 rounded shadow max-w-md mx-auto">
    <input className="w-full border p-2 rounded" type="text" placeholder="Title" />
    <input className="w-full border p-2 rounded" type="file" />
    <button className="w-full bg-green-600 text-white py-2 rounded" type="submit">Upload</button>
  </form>
);

export default FileUploadForm; 