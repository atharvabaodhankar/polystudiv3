import React from 'react';

const MaterialCard = ({ title = 'Sample Material', uploader = 'Uploader Name', onDownload }) => (
  <div className="bg-white shadow rounded p-4 flex flex-col items-start space-y-2">
    <div className="font-semibold text-lg">{title}</div>
    <div className="text-sm text-gray-600">By: {uploader}</div>
    <button onClick={onDownload} className="bg-blue-600 text-white px-3 py-1 rounded mt-2">Download</button>
  </div>
);

export default MaterialCard; 