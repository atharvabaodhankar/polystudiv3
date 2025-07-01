import React from 'react';

const SubjectSection = ({ subject = 'Sample Subject', children }) => (
  <section className="mb-6">
    <h2 className="text-xl font-bold mb-2">{subject}</h2>
    {children}
  </section>
);

export default SubjectSection; 