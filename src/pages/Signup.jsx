import React from 'react';

const Signup = () => (
  <div className="p-8 max-w-md mx-auto">
    <h1 className="text-2xl font-bold mb-4">Sign Up</h1>
    <form className="space-y-4">
      <input className="w-full border p-2 rounded" type="text" placeholder="Username" />
      <input className="w-full border p-2 rounded" type="email" placeholder="Email" />
      <input className="w-full border p-2 rounded" type="password" placeholder="Password" />
      <button className="w-full bg-green-600 text-white py-2 rounded" type="submit">Sign Up</button>
    </form>
  </div>
);

export default Signup; 