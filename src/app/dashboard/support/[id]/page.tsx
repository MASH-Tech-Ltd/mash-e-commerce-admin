'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Clock, CircleDot, CheckCircle, Clock3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '@/utils/api';
import { io, Socket } from 'socket.io-client';

export default function SupportDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [replyMessage, setReplyMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState('');
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTicketDetails();

    const newSocket = io('http://localhost:8000');
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [id]);

  useEffect(() => {
    if (socket && ticket) {
      socket.emit('join_ticket', ticket.ticketId);

      socket.on('new_message', (message) => {
        setTicket((prev: any) => {
          if (!prev) return prev;
          if (prev.messages.some((m: any) => m._id === message._id)) return prev;
          return {
            ...prev,
            messages: [...prev.messages, message]
          };
        });
      });

      socket.on('status_changed', (status) => {
        setTicket((prev: any) => ({
          ...prev,
          status
        }));
      });

      socket.on('ticket_deleted', () => {
        toast.error('This ticket was deleted');
        router.push('/dashboard/support');
      });

      socket.on('typing_start', (data) => {
        if (data.ticketId === ticket.ticketId) {
          setIsTyping(true);
          setTypingUser(data.senderName);
        }
      });

      socket.on('typing_end', (data) => {
        if (data.ticketId === ticket.ticketId) {
          setIsTyping(false);
          setTypingUser('');
        }
      });

      return () => {
        socket.emit('leave_ticket', ticket.ticketId);
        socket.off('new_message');
        socket.off('status_changed');
        socket.off('ticket_deleted');
        socket.off('typing_start');
        socket.off('typing_end');
      };
    }
  }, [socket, ticket?.ticketId]);

  useEffect(() => {
    scrollToBottom();
  }, [ticket?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTicketDetails = async () => {
    try {
      const res = await api.get(`/support/ticket/${id}`);
      setTicket(res.data.data);
    } catch (error) {
      toast.error('Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setSending(true);
    try {
      const res = await api.post(`/support/ticket/${id}/reply`, {
        message: replyMessage
      });
      setTicket(res.data.data);
      setReplyMessage('');
      toast.success('Reply sent');
    } catch (error) {
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const updateStatus = async (status: string) => {
    try {
      await api.patch(`/support/ticket/${id}/status`, { status });
      // The socket will receive the update and change the UI automatically
      toast.success(`Ticket marked as ${status}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;
    try {
      await api.delete(`/support/ticket/${id}`);
      toast.success('Ticket deleted');
      router.push('/dashboard/support');
    } catch (error) {
      toast.error('Failed to delete ticket');
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

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading ticket details...</div>;
  }

  if (!ticket) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Ticket Not Found</h2>
        <button onClick={() => router.push('/dashboard/support')} className="text-[#5022C3] hover:underline">
          Return to Support
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 w-full max-w-[1800px] mx-auto min-h-[calc(100vh-64px)] flex flex-col">
      <div className="flex items-center gap-4 mb-6 shrink-0 justify-between">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button 
            onClick={() => router.push('/dashboard/support')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-bold text-gray-900 truncate">{ticket.subject}</h1>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${getStatusColor(ticket.status)}`}>
                <CircleDot className="w-3 h-3" />
                {ticket.status}
              </span>
            </div>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <span>Ticket ID: {ticket.ticketId}</span>
              <span>•</span>
              <span>Created on {new Date(ticket.createdAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        {/* Admin actions removed per request */}
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden min-h-0">
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 space-y-6">
          {ticket.messages.map((msg: any, idx: number) => {
            const isMerchant = msg.senderType === 'MERCHANT';
            return (
              <div key={idx} className={`flex ${isMerchant ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm ${
                  isMerchant 
                    ? 'bg-[#5022C3] text-white rounded-br-sm' 
                    : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                  <div className="text-[11px] font-medium opacity-70 mb-1.5 flex items-center gap-1.5">
                    <span className="font-bold">{msg.senderId?.name || (isMerchant ? 'You' : 'Super Admin')}</span>
                    <span className="opacity-50">•</span>
                    <Clock className="w-3 h-3" />
                    {new Date(msg.createdAt || msg._id.getTimestamp?.() || Date.now()).toLocaleString()}
                  </div>
                  <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{msg.message}</p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {isTyping && (
          <div className="px-6 py-2 bg-gray-50/50 text-xs text-gray-500 italic border-t border-gray-100 flex items-center gap-2">
            <span className="flex gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </span>
            {typingUser} is typing...
          </div>
        )}

        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleReply} className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                value={replyMessage}
                onChange={(e) => {
                  setReplyMessage(e.target.value);
                  if (socket) {
                    // Try to get user name from local storage or fallback to "Merchant"
                    const userStr = sessionStorage.getItem('user');
                    let name = 'Merchant';
                    if (userStr) {
                      try {
                        const user = JSON.parse(userStr);
                        if (user.name) name = user.name;
                      } catch(err) {}
                    }
                    socket.emit('typing_start', { ticketId: ticket.ticketId, senderName: name });
                    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = setTimeout(() => {
                      socket.emit('typing_end', { ticketId: ticket.ticketId });
                    }, 2000);
                  }
                }}
                placeholder="Type your message here..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none max-h-32 min-h-[60px]"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (socket) socket.emit('typing_end', { ticketId: ticket.ticketId });
                    handleReply(e);
                  }
                }}
              />
            </div>
            <button 
              type="submit"
              disabled={sending || !replyMessage.trim()}
              className="bg-[#5022C3] hover:bg-purple-700 text-white p-3.5 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center shrink-0 shadow-sm shadow-purple-200 h-[60px] w-[60px]"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
