'use client';

import { useState, useEffect } from 'react';
import { api } from '@/utils/api';
import toast from 'react-hot-toast';

export default function SecurityPage() {
  const [activeTab, setActiveTab] = useState<'logs' | 'blocked'>('logs');
  const [logs, setLogs] = useState<any[]>([]);
  const [blockedIps, setBlockedIps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newIpToBlock, setNewIpToBlock] = useState('');
  const [blockReason, setBlockReason] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'logs') {
        const res = await api.get('/security/logs');
        setLogs(res.data?.data || []);
      } else {
        const res = await api.get('/security/blocked-ips');
        setBlockedIps(res.data?.data || []);
      }
    } catch (err) {
      toast.error('Failed to load security data');
    }
    setLoading(false);
  };

  const handleBlockIp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIpToBlock) return;
    
    try {
      await api.post('/security/block', {
        ipAddress: newIpToBlock,
        reason: blockReason || 'Manually blocked'
      });
      toast.success('IP blocked successfully');
      setNewIpToBlock('');
      setBlockReason('');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to block IP');
    }
  };

  const handleUnblockIp = async (ipAddress: string) => {
    try {
      await api.post('/security/unblock', { ipAddress });
      toast.success('IP unblocked successfully');
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to unblock IP');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Security & Access Control</h1>
        <p className="text-gray-500 mt-1">Monitor suspicious activities and manage blocked IPs.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('logs')}
          className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'logs'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Security Logs
        </button>
        <button
          onClick={() => setActiveTab('blocked')}
          className={`py-3 px-6 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'blocked'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Blocked IPs
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto"></div>
        </div>
      ) : activeTab === 'logs' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Endpoint</th>
                <th className="px-6 py-4">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 font-mono text-gray-900">{log.ipAddress}</td>
                  <td className="px-6 py-4 text-gray-900 font-medium">{log.action}</td>
                  <td className="px-6 py-4 text-gray-500">{log.endpoint}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                      log.severity === 'critical' ? 'bg-red-100 text-red-700' :
                      log.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                      log.severity === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {log.severity}
                    </span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No security logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Manually Block an IP</h3>
            <form onSubmit={handleBlockIp} className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 192.168.1.1"
                  value={newIpToBlock}
                  onChange={(e) => setNewIpToBlock(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none"
                />
              </div>
              <div className="flex-[2]">
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason (Optional)</label>
                <input
                  type="text"
                  placeholder="Why are you blocking this IP?"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Block IP
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">IP Address</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4">Blocked At</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {blockedIps.map((ip) => (
                  <tr key={ip._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono font-bold text-red-600">{ip.ipAddress}</td>
                    <td className="px-6 py-4 text-gray-600">{ip.reason}</td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(ip.blockedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleUnblockIp(ip.ipAddress)}
                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-md transition-colors"
                      >
                        Unblock
                      </button>
                    </td>
                  </tr>
                ))}
                {blockedIps.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No blocked IPs right now.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
