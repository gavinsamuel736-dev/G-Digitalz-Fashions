import React, { useEffect, useState } from 'react';
import { ShieldCheck, UserPlus, Lock, Check, X, AlertTriangle } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { AdminUser } from '../../types';

export const AdminUsers: React.FC = () => {
  const { authFetch, showAdminNotification, adminUser } = useAdmin();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'OWNER' | 'STAFF'>('STAFF');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authFetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          full_name: fullName.trim(),
          role,
          permissions: role === 'OWNER' ? ['*'] : ['products', 'orders', 'reviews'],
        }),
      });

      if (res.ok) {
        showAdminNotification(`Administrator account created for ${email}`);
        setIsModalOpen(false);
        setEmail('');
        setFullName('');
        setPassword('');
        await loadUsers();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to create user');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleActive = async (user: AdminUser) => {
    if (user.id === adminUser?.id) {
      alert('You cannot deactivate your own active session');
      return;
    }

    try {
      const res = await authFetch(`/api/admin/users/${user.id}/toggle-active`, {
        method: 'PATCH',
      });
      if (res.ok) {
        showAdminNotification(`Status updated for ${user.email}`);
        await loadUsers();
      } else {
        const err = await res.json();
        alert(err.error || 'Failed');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (adminUser?.role !== 'OWNER') {
    return (
      <div className="p-8 bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] rounded-xs text-xs space-y-2">
        <h3 className="font-semibold text-sm">Privileged Section Restricted</h3>
        <p>Administrator account management is restricted strictly to accounts with the OWNER role.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="py-20 text-center text-xs text-[#7A7165]">Loading administrator directory...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E8E2D9]">
        <div>
          <h2 className="font-editorial text-2xl font-semibold text-[#1A1816]">Administrator & Staff Directory</h2>
          <p className="text-xs text-[#7A7165]">
            Manage privileged accounts, role-based access control (OWNER vs STAFF), and account status
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-[#1A1816] text-[#FAF8F5] text-xs uppercase tracking-wider font-semibold rounded-xs hover:bg-[#322D27] flex items-center gap-2 self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Provision New Admin</span>
        </button>
      </div>

      <div className="bg-white border border-[#E8E2D9] rounded-xs shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF8F5] border-b border-[#E8E2D9] text-[#7A7165] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-medium">Administrator Name</th>
                <th className="py-3 px-4 font-medium">Email Address</th>
                <th className="py-3 px-4 font-medium">Role</th>
                <th className="py-3 px-4 font-medium">Permissions</th>
                <th className="py-3 px-4 font-medium">Account Status</th>
                <th className="py-3 px-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFECE6]">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-[#FAF8F5] transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#1A1816]">{u.fullName || u.full_name}</td>
                  <td className="py-3 px-4 text-[#4A433A] font-mono">{u.email}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold ${
                        u.role === 'OWNER' ? 'bg-[#8E6C3B]/20 text-[#8E6C3B]' : 'bg-[#EFECE6] text-[#4A433A]'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#7A7165]">
                    {u.role === 'OWNER' ? 'Full Store Access (*)' : 'Catalog, Orders, Reviews'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold ${
                        u.is_active ? 'bg-[#EBF6EE] text-[#2F6B45]' : 'bg-[#FEE2E2] text-[#B91C1C]'
                      }`}
                    >
                      {u.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {u.id !== adminUser?.id && (
                      <button
                        onClick={() => handleToggleActive(u)}
                        className={`text-xs px-3 py-1 rounded transition-colors ${
                          u.is_active
                            ? 'text-[#B91C1C] hover:bg-[#FEE2E2]'
                            : 'text-[#2F6B45] hover:bg-[#EBF6EE]'
                        }`}
                      >
                        {u.is_active ? 'Deactivate' : 'Reactivate'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Provision Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
          <div className="bg-[#FAF8F5] border border-[#D5CDC1] rounded-lg max-w-md w-full p-6 shadow-2xl space-y-4 text-[#1A1816]">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E2D9]">
              <h3 className="font-editorial text-xl font-semibold">Provision Administrator Account</h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-5 h-5 text-[#7A7165]" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#595045] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. David Ssenkungu"
                  className="w-full bg-white border border-[#D5CDC1] px-3 py-2 rounded text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#595045] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="david@gdigitalz.ug"
                  className="w-full bg-white border border-[#D5CDC1] px-3 py-2 rounded text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#595045] mb-1">
                  Initial Password (Min 8 Characters) *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-white border border-[#D5CDC1] px-3 py-2 rounded text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase tracking-wider text-[#595045] mb-1">
                  Role Assignment
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full bg-white border border-[#D5CDC1] px-3 py-2 rounded text-xs font-semibold"
                >
                  <option value="STAFF">STAFF (Manage products, orders & reviews only)</option>
                  <option value="OWNER">OWNER (Full control over store, branding & admins)</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-[#E8E2D9]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#D5CDC1] text-[#595045] rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1A1816] text-[#FAF8F5] font-semibold uppercase tracking-wider rounded"
                >
                  Provision Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
