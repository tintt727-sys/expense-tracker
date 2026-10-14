import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, User, ArrowRight, ArrowLeft, KeyRound } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../components/Toast';

export const AdminLoginPage: React.FC = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);

  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      error('Please provide administrator credentials.');
      return;
    }

    try {
      setLoading(true);
      const res = await adminService.login({ username, password });
      localStorage.setItem('adminToken', res.token);
      localStorage.setItem('adminUser', JSON.stringify(res.admin));
      success('Admin authorization verified.');
      navigate('/admin/dashboard');
    } catch (err: any) {
      error(err.message || 'Admin authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-slate-950 p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-amber-500" />

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to App
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white tracking-tight">Admin Console</h2>
            <p className="text-xs text-slate-400">Restricted system management access</p>
          </div>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Admin Username
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Admin Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-2xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-bold text-sm shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
          >
            {loading ? <span>Verifying...</span> : <span>Authorize Access</span>}
          </button>
        </form>

        <div className="mt-6 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 text-center">
          Default seed: <code className="text-purple-400">admin</code> / <code className="text-purple-400">admin123</code>
        </div>
      </div>
    </div>
  );
};
