import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
      } else {
        setMessage('Password updated successfully! Redirecting to login page...');
        setLoading(false);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f6ff] px-4 font-poppins">
      <form onSubmit={handleResetPassword} className="bg-white border border-[#9102C0] rounded-2xl shadow-xl p-10 flex flex-col gap-6 w-full max-w-md">
        <h1 className="text-3xl font-baumans text-[#9102C0] mb-2 text-center">Reset Password</h1>
        <p className="text-sm text-gray-500 text-center -mt-2">
          Enter your new password below.
        </p>
        <input
          type="password"
          required
          minLength="6"
          className="border border-[#ede9fe] rounded-lg px-4 py-3 text-[#342F76] focus:outline-none focus:border-[#9102C0] focus:ring-1 focus:ring-[#9102C0]/20 transition"
          placeholder="New Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />
        <input
          type="password"
          required
          minLength="6"
          className="border border-[#ede9fe] rounded-lg px-4 py-3 text-[#342F76] focus:outline-none focus:border-[#9102C0] focus:ring-1 focus:ring-[#9102C0]/20 transition"
          placeholder="Confirm New Password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full py-3 rounded-full bg-[#9102C0] text-white font-bold text-lg shadow-sm hover:scale-105 hover:shadow-md transition-all duration-150"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>

        {error && <div className="text-red-600 text-center font-semibold">{error}</div>}
        {message && <div className="text-green-600 text-center font-semibold">{message}</div>}
      </form>
    </div>
  );
};

export default ResetPassword;
