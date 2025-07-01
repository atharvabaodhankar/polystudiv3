import React from 'react';
import { useParams } from 'react-router-dom';

const Notes = () => {
  const { classCode } = useParams();
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Notes for {classCode}</h1>
      <p className="mt-2">Notes will be listed here.</p>
    </div>
  );
};

export default Notes; 