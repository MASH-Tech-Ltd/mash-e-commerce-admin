'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LifeBuoy, Plus, CircleDot, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/utils/api';
import { io } from 'socket.io-client';

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTicket, setNewTicket] = useState({ subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchTickets();
    
    // Add socket connection for real-time list updates
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000';
    const socket = io(socketUrl);
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        socket.emit('join_user_room', user._id);
      } catch(err) {}
    }

    socket.on('refresh_tickets', () => {
      fetchTickets();
    });

    return () => {
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          socket.emit('leave_user_room', user._id);
        } catch(err) {}
      }
      socket.off('refresh_tickets');
      socket.close();
    };
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await api.get('/support/my-tickets');
      setTickets(res.data.data);
    } catch (error) {
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.subject.trim() || !newTicket.message.trim()) {
      toast.error('Subject and message are required');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/support/ticket', newTicket);
      setTickets([res.data.data, ...tickets]);
      setIsModalOpen(false);
      setNewTicket({ subject: '', message: '' });
      toast.success('Support ticket created successfully!');
    } catch (error) {
      toast.error('Failed to create ticket');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'OPEN': return 'text-red-600 bg-red-50 border-red-200';
      case 'IN_PROGRESS': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'RESOLVED': return 'text-green-600 bg-green-50 border-green-200';
      case 'CLOSED': return 'text-slate-600 bg-slate-50 border-slate-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="p-6 w-full max-w-[1800px] mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <LifeBuoy className="w-6 h-6 text-[#5022C3]" />
            Support
          </h1>
          <p className="text-gray-500 mt-1">Contact the super admin for assistance with your store.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#5022C3] text-white px-4 py-2.5 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition-colors font-medium text-sm shadow-sm shadow-purple-200"
        >
          <Plus className="w-4 h-4" />
          Open New Ticket
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading tickets...</div>
          ) : tickets.length === 0 ? (
            <div className="p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <LifeBuoy className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">No support tickets yet</h3>
              <p className="text-gray-500">If you need help, don't hesitate to open a new ticket.</p>
            </div>
          ) : (
            tickets.map((ticket) => (
              <div 
                key={ticket._id} 
                onClick={() => router.push(`/dashboard/support/${ticket._id}`)}
                className="p-5 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between group"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-3 mb-1.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(ticket.status)}`}>
                      <CircleDot className="w-3 h-3" />
                      {ticket.status}
                    </span>
                    <span className="text-xs text-gray-400">
                      ID: {ticket.ticketId}
                    </span>
                  </div>
                  <h3 className="text-[15px] font-bold text-gray-900 group-hover:text-[#5022C3] transition-colors truncate">
                    {ticket.subject}
                  </h3>
                  <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                    <span>Created: {new Date(ticket.createdAt).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{ticket.messages?.length || 0} messages</span>
                  </div>
                </div>
                <div className="flex items-center text-gray-400 group-hover:text-[#5022C3] transition-colors">
                  <span className="text-sm font-medium mr-2 hidden sm:block">View Details</span>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Ticket Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">Open Support Ticket</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <form onSubmit={handleCreateTicket} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
                  <input
                    type="text"
                    required
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm"
                    placeholder="Brief description of the issue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={newTicket.message}
                    onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm resize-none"
                    placeholder="Describe your problem in detail..."
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-[#5022C3] hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
