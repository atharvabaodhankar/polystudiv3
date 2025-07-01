import React from 'react';

const SyllabusTable = () => (
  <div className="overflow-x-auto">
    <table className="min-w-full border text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="border px-4 py-2">Sr.No</th>
          <th className="border px-4 py-2">Subject Name</th>
          <th className="border px-4 py-2">Subject Code</th>
          <th className="border px-4 py-2">Total Marks</th>
          <th className="border px-4 py-2">Download PDF</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="border px-4 py-2">1</td>
          <td className="border px-4 py-2">Sample Subject</td>
          <td className="border px-4 py-2">SUB123</td>
          <td className="border px-4 py-2">100</td>
          <td className="border px-4 py-2"><button className="bg-blue-500 text-white px-2 py-1 rounded">Download</button></td>
        </tr>
      </tbody>
    </table>
  </div>
);

export default SyllabusTable; 