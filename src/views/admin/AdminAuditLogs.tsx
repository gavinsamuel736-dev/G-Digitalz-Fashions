import React, { useEffect, useState } from 'react';
import { Shield, Clock, FileText, User } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { AuditLog } from '../../types';

export const AdminAuditLogs: React.FC = () => {
  const { authFetch, adminUser } = useAdmin();

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await authFetch('/api/admin/audit-logs');
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  if (adminUser?.role !== 'OWNER') {
    return (
      <div className="p-8 bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] rounded-xs text-xs space-y-2">
        <h3 className="font-semibold text-sm">Privileged Section Restricted</h3>
        <p>Audit logging history is restricted strictly to accounts with the OWNER role.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="py-20 text-center text-xs text-[#7A7165]">Loading audit logs...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-[#E8E2D9]">
        <h2 className="font-editorial text-2xl font-semibold text-[#1A1816]">Security & Administrative Audit Trail</h2>
        <p className="text-xs text-[#7A7165]">
          Immutable chronological ledger of privileged operations, price modifications, publishing events, and role updates
        </p>
      </div>

      <div className="bg-white border border-[#E8E2D9] rounded-xs shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-[#FAF8F5] border-b border-[#E8E2D9] text-[#7A7165] uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4 font-medium">Timestamp</th>
                <th className="py-3 px-4 font-medium">Administrator</th>
                <th className="py-3 px-4 font-medium">Action Performed</th>
                <th className="py-3 px-4 font-medium">Target Entity</th>
                <th className="py-3 px-4 font-medium">Audited Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFECE6]">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-3 px-4 text-[#7A7165] whitespace-nowrap font-mono text-[11px]">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#1A1816]">
                    {log.actor_name}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-[10px] font-bold text-[#8E6C3B] bg-[#8E6C3B]/10 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-[#4A433A]">
                    <span className="font-semibold">{log.target_type}</span>: {log.target_id}
                  </td>
                  <td className="py-3 px-4 text-[#7A7165] font-mono text-[11px] max-w-xs truncate">
                    {JSON.stringify(log.details)}
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
