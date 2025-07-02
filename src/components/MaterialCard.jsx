import React, { useState } from 'react';
import MaterialRequestForm from './MaterialRequestForm';

const MaterialCard = ({ title = 'Sample Material', uploader = 'Uploader Name', onDownload }) => {
  const [showRequestModal, setShowRequestModal] = useState(false);

  return (
    <div className="bg-white shadow rounded p-4 flex flex-col items-start space-y-2">
      <div className="font-semibold text-lg">{title}</div>
      <div className="text-sm text-gray-600">By: {uploader}</div>
      <button onClick={onDownload} className="bg-blue-600 text-white px-3 py-1 rounded mt-2">Download</button>
      <button
        className="mt-4 px-4 py-2 rounded-full bg-[#9102C0] text-white font-bold hover:bg-[#342F76] transition"
        onClick={() => setShowRequestModal(true)}
      >
        Request to Share Material
      </button>
      {showRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full relative">
            <button className="absolute top-3 right-3 text-2xl text-[#9102C0] font-bold" onClick={() => setShowRequestModal(false)}>&times;</button>
            <MaterialRequestForm onClose={() => setShowRequestModal(false)} />
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialCard; 