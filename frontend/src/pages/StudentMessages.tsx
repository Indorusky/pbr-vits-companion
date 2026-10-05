import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL, getAuthHeaders, cachedFetch, invalidateApiCache } from '../config';
import { MessageSquare, Send, User, Building, Search, Filter, RefreshCw, AlertCircle, Clock, CheckCheck, Users, GraduationCap } from 'lucide-react';

interface StudentInfoSummary {
  id: number;
  name: string;
  username: string;
  roll_number?: string;
  department?: string;
  year?: string;
  semester?: string;
  section?: string;
}

interface FacultyInfoSummary {
  id: number;
  name: string;
  username: string;
  department?: string;
  designation?: string;
  email?: string;
}

interface ConversationOut {
  id: number;
  student_id: number;
  faculty_id: number;
  department?: string;
  created_at: string;
  updated_at: string;
  last_message_at?: string;
  last_message_preview?: string;
  unread_by_student: number;
  unread_by_faculty: number;
  student?: StudentInfoSummary;
  faculty?: FacultyInfoSummary;
}

interface MessageOut {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_name: string;
  sender_role: string;
  message: string;
  created_at: string;
  is_read: boolean;
}

const StudentMessages: React.FC = () => {
  const { user } = useAuth();

  const [conversations, setConversations] = useState<ConversationOut[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All Departments');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [activeConversation, setActiveConversation] = useState<ConversationOut | null>(null);
  const [messages, setMessages] = useState<MessageOut[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');

  const [loadingConvs, setLoadingConvs] = useState<boolean>(true);
  const [loadingMsgs, setLoadingMsgs] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    fetchDepartments();
    fetchConversations();
  }, []);

  // Re-fetch conversations when department filter or search query changes
  useEffect(() => {
    fetchConversations();
  }, [selectedDepartment, searchQuery]);

  const fetchDepartments = async () => {
    try {
      const res = await cachedFetch(`${API_BASE_URL}/faculty-chat/departments`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setDepartments(['All Departments', ...data]);
      }
    } catch (e) {
      console.error('Error fetching departments:', e);
    }
  };

  const fetchConversations = async () => {
    try {
      setLoadingConvs(true);
      let url = `${API_BASE_URL}/faculty-chat/conversations`;
      const params = new URLSearchParams();
      if (selectedDepartment && selectedDepartment !== 'All Departments') {
        params.append('department', selectedDepartment);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const res = await fetch(url, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
        if (activeConversation) {
          const updated = data.find((c: ConversationOut) => c.id === activeConversation.id);
          if (updated) setActiveConversation(updated);
        }
      }
    } catch (e) {
      console.error('Error fetching conversations:', e);
    } finally {
      setLoadingConvs(false);
    }
  };

  const loadConversationMessages = async (conv: ConversationOut) => {
    setActiveConversation(conv);
    setErrorMsg('');
    try {
      setLoadingMsgs(true);
      const res = await fetch(`${API_BASE_URL}/faculty-chat/conversations/${conv.id}/messages`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
        
        // Mark as read if unread by faculty
        if (conv.unread_by_faculty > 0) {
          markAsRead(conv.id);
        }
      } else {
        setErrorMsg('Failed to load conversation messages.');
      }
    } catch (e) {
      console.error('Error loading messages:', e);
      setErrorMsg('Network error loading messages.');
    } finally {
      setLoadingMsgs(false);
    }
  };

  const markAsRead = async (convId: number) => {
    try {
      await fetch(`${API_BASE_URL}/faculty-chat/conversations/${convId}/read`, {
        method: 'PATCH',
        headers: getAuthHeaders()
      });
      invalidateApiCache('/faculty-chat/conversations');
      setConversations(prev => prev.map(c => c.id === convId ? { ...c, unread_by_faculty: 0 } : c));
    } catch (e) {
      console.error('Error marking read:', e);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeConversation || !newMessage.trim() || sending) return;

    const textToSend = newMessage.trim();
    setNewMessage('');
    setSending(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${API_BASE_URL}/faculty-chat/conversations/${activeConversation.id}/messages`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ message: textToSend })
      });

      if (res.ok) {
        const sentMsg: MessageOut = await res.json();
        setMessages(prev => [...prev, sentMsg]);
        invalidateApiCache('/faculty-chat/conversations');
        
        setConversations(prev => prev.map(c => {
          if (c.id === activeConversation.id) {
            return {
              ...c,
              last_message_preview: textToSend,
              last_message_at: sentMsg.created_at,
              updated_at: sentMsg.created_at
            };
          }
          return c;
        }));
      } else {
        const err = await res.json();
        setErrorMsg(err.detail || 'Failed to send message.');
        setNewMessage(textToSend);
      }
    } catch (e) {
      console.error('Error sending reply:', e);
      setErrorMsg('Network error sending message.');
      setNewMessage(textToSend);
    } finally {
      setSending(false);
    }
  };

  const parseIsoDate = (isoStr?: string) => {
    if (!isoStr) return null;
    try {
      let str = isoStr;
      if (!str.endsWith('Z') && !str.includes('+') && !str.includes('-')) {
        str = str + 'Z';
      }
      const d = new Date(str);
      return isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  };

  const formatTimeAgo = (isoStr?: string) => {
    const d = parseIsoDate(isoStr);
    if (!d) return isoStr || '';
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    if (diffMs < 0) return 'Just now';
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  const formatMsgTime = (isoStr?: string) => {
    const d = parseIsoDate(isoStr);
    if (!d) return '';
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Summary Metrics
  const totalConversations = conversations.length;
  const unreadConversations = conversations.filter(c => c.unread_by_faculty > 0).length;
  const uniqueStudentsCount = new Set(conversations.map(c => c.student_id)).size;
  const uniqueDeptsCount = new Set(conversations.map(c => c.student?.department || c.department)).size;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 select-none">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Student Messages</h1>
            <p className="text-xs text-slate-500 font-medium">Direct 1-on-1 communications and queries from enrolled students</p>
          </div>
        </div>

        <button
          onClick={() => {
            invalidateApiCache('/faculty-chat');
            fetchConversations();
          }}
          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors self-end sm:self-center"
          title="Refresh Conversations"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Chats</span>
            <span className="text-lg font-extrabold text-slate-900">{totalConversations}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Unread Chats</span>
            <span className="text-lg font-extrabold text-amber-600">{unreadConversations}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Students</span>
            <span className="text-lg font-extrabold text-slate-900">{uniqueStudentsCount}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Departments</span>
            <span className="text-lg font-extrabold text-slate-900">{uniqueDeptsCount}</span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Main Content Grid: Left Panel (Filters & Student Conversation List) & Right Panel (Student Info & Conversation) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Filters & Conversation Cards (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-indigo-600" />
                <span>Filter Conversations</span>
              </h2>
            </div>

            {/* Department Filter Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 block">Department Filter</label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-xs font-semibold rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              >
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student name or roll number..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Student Conversations List */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Student Conversations
            </h2>

            {loadingConvs ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-slate-100 animate-pulse rounded-xl"></div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-10 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">No students have contacted you yet</p>
                <p className="text-[11px] text-slate-500 mt-0.5">When students select your name to send a query, their messages will appear here.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[440px] overflow-y-auto pr-1">
                {conversations.map((conv) => {
                  const isSelected = activeConversation?.id === conv.id;
                  const studName = conv.student?.name || 'Student';
                  const studDept = conv.student?.department || conv.department || 'Department';
                  const studYearSec = `${conv.student?.year || '3rd Year'} • ${conv.student?.section || 'Section A'}`;
                  const isUnread = conv.unread_by_faculty > 0;

                  return (
                    <div
                      key={conv.id}
                      onClick={() => loadConversationMessages(conv)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-indigo-50/90 border-indigo-300 shadow-xs'
                          : isUnread
                          ? 'bg-amber-50/50 border-amber-200 hover:bg-amber-50'
                          : 'bg-white border-slate-150 hover:bg-slate-50/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-extrabold text-xs flex items-center justify-center shrink-0 border border-indigo-200">
                          {studName.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h3 className="text-xs font-bold text-slate-900 truncate">{studName}</h3>
                            <span className="text-[10px] text-slate-400 font-medium shrink-0">
                              {formatTimeAgo(conv.last_message_at || conv.updated_at)}
                            </span>
                          </div>
                          <p className="text-[10px] font-bold text-indigo-600 truncate">{studDept} ({studYearSec})</p>
                          <p className="text-[11px] text-slate-600 truncate mt-0.5 font-normal">
                            {conv.last_message_preview || 'No messages yet'}
                          </p>
                        </div>
                      </div>

                      {isUnread && (
                        <div className="w-5 h-5 rounded-full bg-amber-500 text-white font-extrabold text-[10px] flex items-center justify-center shrink-0 shadow-xs">
                          {conv.unread_by_faculty}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Active Chat & Student Details (7 cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-[650px] overflow-hidden">
            {activeConversation ? (
              <>
                {/* Top Student Profile Banner */}
                <div className="p-4 border-b border-slate-150 bg-slate-50/70 shrink-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-full bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-sm">
                        {activeConversation.student?.name?.charAt(0) || 'S'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-extrabold text-slate-900 truncate">
                            {activeConversation.student?.name || 'Student Name'}
                          </h2>
                          <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-md shrink-0">
                            {activeConversation.student?.roll_number || '2373A01001'}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-600 truncate mt-0.5">
                          {activeConversation.student?.department || activeConversation.department} • {activeConversation.student?.year || '3rd Year'} • {activeConversation.student?.section || 'Section A'}
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right shrink-0 bg-white sm:bg-transparent p-2 sm:p-0 rounded-xl border sm:border-none border-slate-200">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Semester</span>
                      <span className="text-xs font-extrabold text-slate-800">
                        {activeConversation.student?.semester || '3-1'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
                  {loadingMsgs ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-2">
                      <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin" />
                      <p className="text-xs font-semibold text-slate-500">Loading student query messages...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 space-y-2">
                      <MessageSquare className="w-10 h-10 mx-auto text-slate-300" />
                      <p className="text-xs font-bold text-slate-600">No messages in this thread</p>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const isMe = m.sender_id === user?.id || m.sender_role === 'faculty';
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                        >
                          <div className="text-[10px] font-bold text-slate-400 mb-1 px-1">
                            {isMe ? 'You (Faculty)' : m.sender_name}
                          </div>
                          <div
                            className={`max-w-[82%] px-4 py-2.5 rounded-2xl text-xs font-medium leading-relaxed whitespace-pre-wrap shadow-xs ${
                              isMe
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-none'
                                : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                            }`}
                          >
                            {m.message}
                          </div>
                          <div className="text-[9px] text-slate-400 font-medium mt-1 px-1 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-300" />
                            <span>{formatMsgTime(m.created_at)}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Reply Form */}
                <form
                  onSubmit={handleSendMessage}
                  className="p-3 border-t border-slate-200 bg-white flex items-center gap-2 shrink-0"
                >
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your response to the student..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
                    disabled={sending}
                  />
                  <button
                    type="submit"
                    disabled={sending || !newMessage.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs p-2.5 rounded-xl shadow-xs transition-all disabled:opacity-40 flex items-center justify-center shrink-0 active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-50/20">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 shadow-sm border border-indigo-150">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <h3 className="text-sm font-extrabold text-slate-800">No Student Conversation Selected</h3>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Click on a student's conversation card from the list on the left to review their query and reply.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentMessages;
