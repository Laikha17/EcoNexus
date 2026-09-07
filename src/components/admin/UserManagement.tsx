import React, { useState } from 'react';
import { useEcoNexus } from '../../context/EcoNexusContext';
import { UserRole } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { Users, ShieldCheck, Check, Search, Filter } from 'lucide-react';
import { clsx } from 'clsx';

export const UserManagement: React.FC = () => {
  const { users, toggleUserVerification } = useEcoNexus();
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesSearch = u.company.toLowerCase().includes(search.toLowerCase()) ||
                          u.name.toLowerCase().includes(search.toLowerCase()) ||
                          u.location.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">User & Business Directory</h1>
        <p className="text-xs text-slate-500">
          Verify registered sellers, buyers, and logistics transport entities on EcoNexus.
        </p>
      </div>

      {/* Filter Bar */}
      <Card padded className="space-y-3 bg-white border-slate-200">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Filter by company name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />

          <div className="flex items-center gap-1 overflow-x-auto">
            {['all', 'seller', 'buyer', 'logistics', 'admin'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider shrink-0 transition-all',
                  roleFilter === role
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                )}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-700 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Business Name & Contact</th>
                <th className="p-3.5">Assigned Role</th>
                <th className="p-3.5">Industry Sector</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Verification Status</th>
                <th className="p-3.5 text-right">Moderation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0" />
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{u.company}</p>
                        <span className="text-[10px] text-slate-500">{u.name} • {u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <Badge variant="category">{u.role.toUpperCase()}</Badge>
                  </td>
                  <td className="p-3.5 text-slate-800">{u.industry}</td>
                  <td className="p-3.5 text-slate-600">{u.location}</td>
                  <td className="p-3.5">
                    <Badge variant={u.verificationStatus === 'verified' ? 'verified' : 'warning'}>
                      {u.verificationStatus.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="p-3.5 text-right">
                    <Button
                      size="sm"
                      variant={u.verificationStatus === 'verified' ? 'outline' : 'primary'}
                      onClick={() => toggleUserVerification(u.id)}
                    >
                      {u.verificationStatus === 'verified' ? 'Revoke Verification' : 'Verify Entity'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
